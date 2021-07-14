const jwt = require('jsonwebtoken');
const helpers = require('../helpers/helpers');
const bcrypt = require('bcrypt')

const DEFAULT_SESSION_EXPIRATION = process.env.DEFAULT_EXPIRATION_TIME ? parseInt(process.env.DEFAULT_EXPIRATION_TIME) : 1234;
const EXTENDED_SESSION_EXPIRATION = process.env.EXTENDED_EXPIRATION_TIME ? parseInt(process.env.EXTENDED_EXPIRATION_TIME) : 12345;

const userRoutes = (app, fs) => {
    const dataPath = './data/users.json';

    const readFile = (callback, returnJson = false, filePath = dataPath, encoding = 'utf8') => {
        fs.readFile(filePath, encoding, (err, data) => {
            if (err) {
                throw err;
            }

            callback(returnJson ? JSON.parse(data) : data);
        });
    };

    const writeFile = (fileData, callback, filePath = dataPath, encoding = 'utf8') => {
        fs.writeFile(filePath, fileData, encoding, (err) => {
            if (err) {
                throw err;
            }

            callback();
        });
    };


    app.post('/login', (req, res) => {
        readFile(data => {
            const _email = req.body.email;
            const _pass = req.body.password;
            const _remember = req.body.remember;

            const user = data.find(x => x.email === _email);

            if (!user) {
                res.status(401).json({ error: 'User with given email does not exist!' })
            } else {
                bcrypt.compare(_pass, user.password, (err, result) => {
                    if (result) {
                        const ttl = _remember
                            ? EXTENDED_SESSION_EXPIRATION
                            : DEFAULT_SESSION_EXPIRATION;

                        const secret =  process.env.TOKEN_SECRET;
                        const token = jwt.sign(data, secret, { expiresIn: ttl });
                        
                        res.status(200).json({ token: token });

                    } else {
                        console.log(err);
                        res.status(401).json({ error: 'Incorrect password!' });
                    }
                });
            }
        }, true);
    });

    // Verify token, return user information
    app.post('/me', (req, res) => {
        readFile(data => {
            const _authHeader = req.headers.authorization;
            if (_authHeader) {
                const token = _authHeader.split(' ')[1];   //Bearer jwtToken
                jwt.verify(token, process.env.TOKEN_SECRET, (err, data) => {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(data);
                        res.status(200).json({ data: data });
                    }
                });
            } else {
                res.status(401).json({ error: 'Unautenticated request!' });
            }
        }, true);
    });


    app.get('/users', (req, res) => {
        fs.readFile(dataPath, 'utf8', (err, data) => {
            if (err) {
                throw err;
            }

            res.send(JSON.parse(data));
        });
    });


    app.post('/password', (req, res) => {
        readFile(data => {
            const _email = req.body.email;
            const user = data.find(x => x.email === _email);

            if (!user) {
                res.status(404).json({ error: `User with given email is not found: ${_email}` });
            } else {

                const newPassword = helpers.makeRandomPassword(5);
                const index = data.findIndex((item => item.email === _email));

                bcrypt.hash(newPassword, 10, (err, hash) => {
                    if (err) {
                        console.log('Error while hashing new password...');
                        res.status(500).json({ error: 'Server error!' });
                    } else {
                        data[index].password = hash;
                        writeFile(JSON.stringify(data), () => {
                            res.status(200).json({ password: newPassword });
                        });
                    }
                });
            }
        }, true);
    });

    app.post('/register', (req, res) => {
        readFile(data => {
            const newUserId = Date.now().toString();

            // add the new user
            data[newUserId.toString()] = req.body;

            writeFile(JSON.stringify(data, null, 2), () => {
                res.status(200).send('new user added');
            });
        }, true);
    });


    // UPDATE
    app.put('/users/:id', (req, res) => {

        readFile(data => {

            // add the new user
            const userId = req.params["id"];
            data[userId] = req.body;

            writeFile(JSON.stringify(data, null, 2), () => {
                res.status(200).send(`users id:${userId} updated`);
            });
        }, true);
    });


    // DELETE
    app.delete('/users/:id', (req, res) => {

        readFile(data => {
            const userId = req.params["id"];
            delete data[userId];

            writeFile(JSON.stringify(data, null, 2), () => {
                res.status(200).send(`users id:${userId} removed`);
            });
        }, true);
    });
};

module.exports = userRoutes;
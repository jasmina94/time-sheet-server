const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt')
const helpers = require('../helpers/helpers');

const DEFAULT_SESSION_EXPIRATION = process.env.DEFAULT_EXPIRATION_TIME ? process.env.DEFAULT_EXPIRATION_TIME : '1234';
const EXTENDED_SESSION_EXPIRATION = process.env.EXTENDED_EXPIRATION_TIME ? process.env.EXTENDED_EXPIRATION_TIME : '12345';

const authenticationRoutes = (app, fs) => {

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

                        const secret = process.env.TOKEN_SECRET;
                        const userInfo = {
                            email: user.email,
                            firstname: user.firstname,
                            lastname: user.lastname
                        };
                        const token = jwt.sign({ userInfo: userInfo }, secret, { expiresIn: ttl });
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
    app.get('/me', (req, res) => {
        const _authHeader = req.headers.authorization;
        if (_authHeader) {
            const token = _authHeader.split(' ')[1];
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
}

module.exports = authenticationRoutes;
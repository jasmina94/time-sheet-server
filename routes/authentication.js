const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt')
const helpers = require('../helpers/helpers');

const DEFAULT_SESSION_EXPIRATION = process.env.DEFAULT_EXPIRATION_TIME ? process.env.DEFAULT_EXPIRATION_TIME : '1234';
const EXTENDED_SESSION_EXPIRATION = process.env.EXTENDED_EXPIRATION_TIME ? process.env.EXTENDED_EXPIRATION_TIME : '12345';

const authenticationRoutes = (app, fs) => {

    const dataPath = './data/users.json';

    app.post('/login', (req, res) => {
        helpers.readFile(fs, data => {
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
                        res.status(401).json({ error: 'Incorrect password!' });
                    }
                });
            }
        }, true, dataPath);
    });

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


    app.post('/forgotPassword', (req, res) => {
        helpers.readFile(fs, data => {
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

                        helpers.writeFile(fs, JSON.stringify(data), () => {
                            res.status(200).json({ password: newPassword });
                        }, dataPath);
                    }
                });
            }
        }, true, dataPath);
    });

    app.post('/changePassword', (req, res) => {
        const _authHeader = req.headers.authorization;
        if (_authHeader) {
            const token = _authHeader.split(' ')[1];
            jwt.verify(token, process.env.TOKEN_SECRET, (err) => {
                if (err) {
                    res.status(401).json({ error: 'Unautenticated request!' });
                } else {
                    helpers.readFile(fs, users => {
                        const decoded = jwt.decode(token);
                        const _email = decoded.userInfo.email;
                        const _pass = req.body.current;
                        const _new = req.body.new;
                        const _repeat = req.body.repeat;

                        const user = users.find(x => x.email === _email);
                        const index = users.findIndex((x => x.email === _email));

                        bcrypt.compare(_pass, user.password, (err, result) => {
                            if (result) {
                                if (_new === _repeat) {
                                    bcrypt.hash(_new, 10, (err, hash) => {
                                        if (err) {
                                            console.log('Error while hashing new password...');

                                            res.status(500).json({ error: 'Server error!' });
                                        } else {
                                            users[index].password = hash;
                                            
                                            helpers.writeFile(fs, JSON.stringify(users), () => {
                                                res.status(200).json({ message: 'Successfully changed password. Please login again!'});
                                            }, dataPath);
                                        }
                                    })
                                } else {
                                    res.status(500).json({ error: 'Not matching values!' });
                                }

                            } else {
                                console.log(err);
                                res.status(401).json({ error: 'Error while changing password. Please check credentials!' });
                            }
                        });
                    }, true, dataPath);

                }
            });
        } else {
            res.status(401).json({ error: 'Unautenticated request!' });
        }
    });

    app.post('/register', (req, res) => {
        helpers.readFile(data => {
            const newUserId = Date.now().toString();

            data[newUserId.toString()] = req.body;

            writeFile(fs, JSON.stringify(data, null, 2), () => {
                res.status(200).send('new user added');
            }, dataPath);

        }, true, dataPath);
    });
}

module.exports = authenticationRoutes;
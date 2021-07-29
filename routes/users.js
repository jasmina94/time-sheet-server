const jwt = require('jsonwebtoken');
const helpers = require('../helpers/helpers');

const userRoutes = (app, fs) => {
    const dataPath = './data/users.json';

    app.get('/users', (req, res) => {
        const _authHeader = req.headers.authorization;
        if (_authHeader) {
            const token = _authHeader.split(' ')[1];
            jwt.verify(token, process.env.TOKEN_SECRET, (err, data) => {
                if (err) {
                    console.log(err);
                    res.status(401).json({ error: 'Unautenticated request!' });
                } else {
                    helpers.readFile(fs, data => {
                        res.status(200).json({ data: data });
                    }, true, dataPath);
                }
            });
        } else {
            res.status(401).json({ error: 'Unautenticated request!' });
        }
    });

    app.put('/users/:id', (req, res) => {
        const _authHeader = req.headers.authorization;
        if (_authHeader) {
            const token = _authHeader.split(' ')[1];

            jwt.verify(token, process.env.TOKEN_SECRET, (err) => {
                if (err) {
                    console.log(err);
                    res.status(401).json({ error: 'Unautenticated request!' });
                } else {
                    helpers.readFile(users => {
                        const userId = req.params["id"];
                        users[userId] = req.body;

                        helpers.writeFile(fs, JSON.stringify(users, null, 2), () => {
                            res.status(200).send(`User with id:${userId} updated.`);
                        }, dataPath);

                        res.status(200).json({ data: users });

                    }, true, dataPath);
                }
            });
            
        } else {
            res.status(401).json({ error: 'Unautenticated request!' });
        }
    });

    app.delete('/users/:id', (req, res) => {
        const _authHeader = req.headers.authorization;
        if (_authHeader) {
            const token = _authHeader.split(' ')[1];
            jwt.verify(token, process.env.TOKEN_SECRET, (err) => {
                if (err) {
                    console.log(err);
                    res.status(401).json({ error: 'Unautenticated request!' });
                } else {
                    helpers.readFile(users => {
                        const id = req.params.id;
                        const filtered = users.filter(x => x.id !== id);

                        helpers.writeFile(fs, JSON.stringify(filtered, null, 2), () => {
                            res.status(200).send(`User with id:${userId} removed.`);
                        }, dataPath);

                    }, true, dataPath);
                }
            });
        } else {
            res.status(401).json({ error: 'Unautenticated request!' });
        }
    });
};

module.exports = userRoutes;
const jwt = require('jsonwebtoken');

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

    // READ
    app.get('/users', (req, res) => {
        const _authHeader = req.headers.authorization;
        if (_authHeader) {
            const token = _authHeader.split(' ')[1];
            jwt.verify(token, process.env.TOKEN_SECRET, (err, data) => {
                if (err) {
                    console.log(err);
                } else {
                    readFile(data => {
                        res.status(200).json({ data: data });
                    }, true);
                }
            });
        } else {
            res.status(401).json({ error: 'Unautenticated request!' });
        }
    });


    // UPDATE
    app.put('/users/:id', (req, res) => {
        const _authHeader = req.headers.authorization;
        if (_authHeader) {
            const token = _authHeader.split(' ')[1];
            jwt.verify(token, process.env.TOKEN_SECRET, (err) => {
                if (err) {
                    console.log(err);
                } else {
                    readFile(users => {
                        const userId = req.params["id"];
                        users[userId] = req.body;

                        writeFile(JSON.stringify(users, null, 2), () => {
                            res.status(200).send(`users id:${userId} updated`);
                        });

                        res.status(200).json({ data: users });
                    }, true);
                }
            });
        } else {
            res.status(401).json({ error: 'Unautenticated request!' });
        }
    });


    // DELETE
    app.delete('/users/:id', (req, res) => {
        const _authHeader = req.headers.authorization;
        if (_authHeader) {
            const token = _authHeader.split(' ')[1];
            jwt.verify(token, process.env.TOKEN_SECRET, (err) => {
                if (err) {
                    console.log(err);
                } else {
                    readFile(users => {
                        const userId = req.params["id"];
                        // DELETE DATA
                        // delete users[userId];

                        writeFile(JSON.stringify(data, null, 2), () => {
                            res.status(200).send(`users id:${userId} removed`);
                        });
                    }, true);
                }
            });
        } else {
            res.status(401).json({ error: 'Unautenticated request!' });
        }
    });
};

module.exports = userRoutes;
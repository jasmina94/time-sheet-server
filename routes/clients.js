const jwt = require('jsonwebtoken');

const clientRoutes = (app, fs) => {
    const dataPath = './data/clients.json';

    const sendSuccessResponse = (resp, data) => {
        resp.status(200).send(data);
    }

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

    app.get('/clients', (req, res) => {
        readFile(clients => {
            const _authHeader = req.headers.authorization;
            if (_authHeader) {
                const token = _authHeader.split(' ')[1];
                jwt.verify(token, process.env.TOKEN_SECRET, (err, data) => {
                    if (err) {
                        console.log(err);
                        res.status(401).json({ error: 'Unautenticated request!' });
                    } else {
                        console.log(clients);
                        res.status(200).send({ data: clients });
                    }
                });
            } else {
                res.status(401).json({ error: 'Unautenticated request!' });
            }
        }, true)
    });

    app.post('/clients', (req, res) => {
        const _authHeader = req.headers.authorization;
        if (_authHeader) {
            const token = _authHeader.split(' ')[1];
            jwt.verify(token, process.env.TOKEN_SECRET, (err, data) => {
                if (err) {
                    console.log(err);
                    res.status(401).json({ error: 'Unautenticated request!' });
                } else {
                    readFile(clients => {
                        const nexId = Math.max.apply(Math, clients.map(x => x.id)) + 1;
                        const newClient = {
                            id: nexId,
                            name: req.body.name,
                            address: req.body.address,
                            city: req.body.city,
                            zip: req.body.zip,
                            country: req.body.country
                        };
                        console.log('Before creation: ' + JSON.stringify(clients));

                        clients.push(newClient);

                        console.log('After: ' + JSON.stringify(clients));

                        writeFile(JSON.stringify(clients), () => res.status(200).send({ data: newClient }));

                    }, true)
                }
            })
        } else {
            res.status(401).json({ error: 'Unautenticated request!' });
        }
    });

    app.put('/clients/:id', (req, res) => {
        readFile(clients => {
            const _authHeader = req.headers.authorization;
            if (_authHeader) {
                const token = _authHeader.split(' ')[1];
                jwt.verify(token, process.env.TOKEN_SECRET, (err, data) => {
                    if (err) {
                        console.log(err);
                        res.status(401).json({ error: 'Unautenticated request!' });
                    } else {
                        const id = req.params.id;
                        const name = req.body.name;
                        const address = req.body.address;
                        const city = req.body.city;
                        const zip = req.body.zip;
                        const country = req.body.country;

                        const index = clients.findIndex((obj => obj.id === parseInt(id)));

                        console.log("Before update: ", clients[index])

                        clients[index].name = name;
                        clients[index].address = address;
                        clients[index].city = city;
                        clients[index].zip = zip;
                        clients[index].country = country;

                        console.log("After update: ", clients[index]);

                        writeFile(JSON.stringify(clients), () => res.status(200).send({ data: clients[index] }));
                    }
                })
            } else {
                res.status(401).json({ error: 'Unautenticated request!' });
            }
        }, true);
    });

    app.delete('/clients/:id', (req, res) => {
        readFile(clients => {
            const _authHeader = req.headers.authorization;
            if (_authHeader) {
                const token = _authHeader.split(' ')[1];
                jwt.verify(token, process.env.TOKEN_SECRET, (err, data) => {
                    if (err) {
                        console.log(err);
                        res.status(401).json({ error: 'Unautenticated request!' });
                    } else {
                        const id = req.params.id;
                        const updated = clients.filter(item => item.id !== parseInt(id));
                        writeFile(JSON.stringify(updated), () => res.status(200).send({ data: updated }));
                    }
                });
            } else {
                res.status(401).json({ error: 'Unautenticated request!' });
            }
        }, true);
    });
}

module.exports = clientRoutes;
const jwt = require('jsonwebtoken');
const helpers = require('../helpers/helpers');

const dataPath = './data/clients.json';

const clientRoutes = (app, fs) => {

    app.get('/clients/all', (req, res) => {
        const _authHeader = req.headers.authorization;
        if (_authHeader) {
            const token = _authHeader.split(' ')[1];
            jwt.verify(token, process.env.TOKEN_SECRET, (err) => {
                if (err) {
                    console.log(err);
                    res.status(401).json({ error: 'Unautenticated request!' });
                } else {
                    helpers.readFile(fs, clients => {
                        console.log(clients);
                        res.status(200).send({ data: clients });
                    }, true, dataPath);
                }
            });
        } else {
            res.status(401).json({ error: 'Unautenticated request!' });
        }
    });

    app.get('/clients', (req, res) => {
        const _authHeader = req.headers.authorization;
        if (_authHeader) {
            const token = _authHeader.split(' ')[1];
            jwt.verify(token, process.env.TOKEN_SECRET, (err) => {
                if (err) {
                    console.log(err);
                    res.status(401).json({ error: 'Unautenticated request!' });
                } else {
                    helpers.readFile(fs, clients => {
                        let result = helpers.queryData(clients, 
                            req.query.term, 
                            helpers.matchClient, 
                            req.query.limit, 
                            req.query.page);

                        res.status(200).send({ clients: result.data, numOfPages: result.numOfPages,  total: result.total});

                    }, true, dataPath);
                }
            })
        } else {
            res.status(401).json({ error: 'Unautenticated request!' });
        }
    });

    app.post('/clients', (req, res) => {
        const _authHeader = req.headers.authorization;
        if (_authHeader) {
            const token = _authHeader.split(' ')[1];
            jwt.verify(token, process.env.TOKEN_SECRET, (err) => {
                if (err) {
                    console.log(err);
                    res.status(401).json({ error: 'Unautenticated request!' });
                } else {
                    helpers.readFile(fs, clients => {
                        const nextId = Math.max.apply(Math, clients.map(x => x.id)) + 1;
                        const newClient = {
                            id: nextId,
                            name: req.body.name,
                            address: req.body.address,
                            city: req.body.city,
                            zip: req.body.zip,
                            country: req.body.country
                        };

                        clients.push(newClient);

                        helpers.writeFile(fs, JSON.stringify(clients), () => res.status(200).send({ data: newClient }), dataPath);

                    }, true, dataPath)
                }
            })
        } else {
            res.status(401).json({ error: 'Unautenticated request!' });
        }
    });

    app.put('/clients/:id', (req, res) => {
        const _authHeader = req.headers.authorization;
        if (_authHeader) {
            const token = _authHeader.split(' ')[1];
            jwt.verify(token, process.env.TOKEN_SECRET, (err) => {
                if (err) {
                    console.log(err);
                    res.status(401).json({ error: 'Unautenticated request!' });
                } else {
                    helpers.readFile(fs, clients => {
                        const id = req.params.id;
                        const index = clients.findIndex((obj => obj.id === parseInt(id)));

                        clients[index].name = req.body.name;
                        clients[index].address = req.body.address;
                        clients[index].city = req.body.city;
                        clients[index].zip = req.body.zip;
                        clients[index].country = req.body.country;

                        helpers.writeFile(fs, JSON.stringify(clients), () => res.status(200).send({ data: clients[index] }), dataPath);

                    }, true, dataPath);
                }
            });
        } else {
            res.status(401).json({ error: 'Unautenticated request!' });
        }
    });

    app.delete('/clients/:id', (req, res) => {
        const _authHeader = req.headers.authorization;
        if (_authHeader) {
            const token = _authHeader.split(' ')[1];
            jwt.verify(token, process.env.TOKEN_SECRET, (err) => {
                if (err) {
                    console.log(err);
                    res.status(401).json({ error: 'Unautenticated request!' });
                } else {
                    helpers.readFile(fs, clients => {
                        const id = req.params.id;
                        const updated = clients.filter(item => item.id !== parseInt(id));

                        helpers.writeFile(fs, JSON.stringify(updated), () => res.status(200).send({ data: updated }), dataPath);

                    }, true, dataPath);
                }
            });
        } else {
            res.status(401).json({ error: 'Unautenticated request!' });
        }
    });
}

module.exports = clientRoutes;
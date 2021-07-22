const jwt = require('jsonwebtoken');

const projectRoutes = (app, fs) => {

    const dataPath = './data/projects.json';

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


    app.get('/projects', (req, res) => {
        const _authHeader = req.headers.authorization;
        if (_authHeader) {
            const token = _authHeader.split(' ')[1];
            jwt.verify(token, process.env.TOKEN_SECRET, (err, data) => {
                if (err) {
                    console.log(err);
                    res.status(401).json({ error: 'Unautenticated request!' });
                } else {
                    readFile(projects => {
                        console.log(projects);
                        res.status(200).send({ data: projects });
                    }, true);
                }
            })
        } else {
            res.status(401).json({ error: 'Unautenticated request!' });
        }
    });

    app.post('/projects', (req, res) => {
        const _authHeader = req.headers.authorization;
        if (_authHeader) {
            const token = _authHeader.split(' ')[1];
            jwt.verify(token, process.env.TOKEN_SECRET, (err) => {
                if (err) {
                    console.log(err);
                    res.status(401).json({ error: 'Unautenticated request!' });
                } else {
                    const clients = JSON.parse(fs.readFileSync('./data/clients.json', { encoding: 'utf8', flag: 'r' }));
                    const users = JSON.parse(fs.readFileSync('./data/users.json', { encoding: 'utf8', flag: 'r' }));
                    const customer = clients.filter(x => x.id === parseInt(req.body.customer))[0];
                    const lead = users.filter(x => x.id === parseInt(req.body.lead))[0];
                    
                    readFile(projects => {
                        const nextId = Math.max.apply(Math, projects.map(x => x.id)) + 1;
                        const newProject = {
                            id: nextId,
                            name: req.body.name,
                            status: req.body.status,
                            description: req.body.description,
                            customer: customer,
                            lead: lead
                        };

                        projects.push(newProject);

                        writeFile(JSON.stringify(projects), () => res.status(200).send({ data: newProject }));
                    }, true);
                }
            });
        } else {
            res.status(401).json({ error: 'Unautenticated request!' });
        }
    });

    app.put('/projects/:id', (req, res) => {
        const _authHeader = req.headers.authorization;
        if (_authHeader) {
            const token = _authHeader.split(' ')[1];
            jwt.verify(token, process.env.TOKEN_SECRET, (err) => {
                if (err) {
                    console.log(err);
                    res.status(401).json({ error: 'Unautenticated request!' });
                } else {
                    readFile(projects => {
                        const id = req.params.id;
                        const name = req.body.name;
                        const lead = req.body.lead;
                        const status = req.body.status;
                        const customer = req.body.customer;
                        const description = req.body.description;

                        // Find lead with given id -> newLead
                        const users = JSON.parse(fs.readFileSync('./data/users.json', { encoding: 'utf8', flag: 'r' }));
                        const newLead = users.filter(x => x.id === parseInt(lead))[0];

                        // Find customer with given id -> newCustomer
                        const clients = JSON.parse(fs.readFileSync('./data/clients.json', { encoding: 'utf8', flag: 'r' }));
                        const newClient = clients.filter(x => x.id === parseInt(customer))[0];

                        const index = projects.findIndex((obj => obj.id === parseInt(id)));

                        projects[index].name = name;
                        projects[index].lead = newLead;
                        projects[index].status = status;
                        projects[index].customer = newClient;
                        projects[index].description = description;

                        console.log("After update: ", projects[index]);

                        writeFile(JSON.stringify(projects), () => res.status(200).send({ data: projects[index] }));
                    }, true);
                }
            });
        } else {
            res.status(401).json({ error: 'Unautenticated request!' });
        }
    });

    app.delete('/projects/:id', (req, res) => {
        const _authHeader = req.headers.authorization;
        if (_authHeader) {
            const token = _authHeader.split(' ')[1];
            jwt.verify(token, process.env.TOKEN_SECRET, (err) => {
                if (err) {
                    console.log(err);
                    res.status(401).json({ error: 'Unautenticated request!' });
                } else {
                    readFile(projects => {
                        const id = req.params.id;
                        const updated = projects.filter(item => item.id !== parseInt(id));
                        writeFile(JSON.stringify(updated), () => res.status(204).send());
                    }, true);
                }
            });
        } else {
            res.status(401).json({ error: 'Unautenticated request!' });
        }
    });

    // app.post('/projects', (req, res) => {
    //     const _authHeader = req.headers.authorization;
    //     if (_authHeader) {
    //         const token = _authHeader.split(' ')[1];
    //         jwt.verify(token, process.env.TOKEN_SECRET, (err, data) => {
    //             if (err) {
    //             } else {
    //                 readFile(projects => {
    //                     const nexId = Math.max.apply(Math, projects.map(x => x.id)) + 1;
    //                     const newProject = {
    //                         id: nexId,
    //                         name: req.body.name,
    //                         description: req.body.description,
    //                         city: req.body.city,
    //                         zip: req.body.zip,
    //                         country: req.body.country
    //                     };
    //                 })
    //             }
    // });
}

module.exports = projectRoutes;
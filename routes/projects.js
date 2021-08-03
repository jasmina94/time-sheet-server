const jwt = require('jsonwebtoken');
const helpers = require('../helpers/helpers');

const projectRoutes = (app, fs) => {

    const dataPath = './data/projects.json';

    app.get('/projects/all', (req, res) => {
        const _authHeader = req.headers.authorization;
        if (_authHeader) {
            const token = _authHeader.split(' ')[1];
            jwt.verify(token, process.env.TOKEN_SECRET, (err, data) => {
                if (err) {
                    console.log(err);
                    res.status(401).json({ error: 'Unautenticated request!' });
                } else {
                    helpers.readFile(fs, projects => {
                        res.status(200).send({ data: projects });
                    }, true, dataPath);
                }
            })
        } else {
            res.status(401).json({ error: 'Unautenticated request!' });
        }
    });

    app.get('/projects', (req, res) => {
        const _authHeader = req.headers.authorization;
        if (_authHeader) {
            const token = _authHeader.split(' ')[1];
            jwt.verify(token, process.env.TOKEN_SECRET, (err, data) => {
                if (err) {
                    console.log(err);
                    res.status(401).json({ error: 'Unautenticated request!' });
                } else {
                    helpers.readFile(fs, projects => {
                        let result = helpers.queryData(projects, 
                            req.query.term, 
                            helpers.matchProject, 
                            req.query.limit, 
                            req.query.page);

                        res.status(200).send({ projects: result.data, numOfPages: result.numOfPages, total: result.total });

                    }, true, dataPath);
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

                    helpers.readFile(fs, projects => {
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

                        helpers.writeFile(fs, JSON.stringify(projects), () => res.status(200).send({ data: newProject }), dataPath);

                    }, true, dataPath);
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
                    helpers.readFile(projects => {
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

                        helpers.writeFile(fs, JSON.stringify(projects), () => res.status(200).send({ data: projects[index] }), dataPath);

                    }, true, dataPath);
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
                    helpers.readFile(projects => {
                        const id = req.params.id;
                        const updated = projects.filter(item => item.id !== parseInt(id));

                        writeFile(fs, JSON.stringify(updated), () => res.status(204).send(), dataPath);

                    }, true, dataPath);
                }
            });
        } else {
            res.status(401).json({ error: 'Unautenticated request!' });
        }
    });
}

module.exports = projectRoutes;
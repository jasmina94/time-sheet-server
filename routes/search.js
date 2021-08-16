const jwt = require('jsonwebtoken');
const helpers = require('../helpers/helpers');

const searchRoute = (app, fs) => {

    // Search general
    app.get('/search/:type', (req, res) => {
        const _authHeader = req.headers.authorization;
        if (_authHeader) {
            const token = _authHeader.split(' ')[1];
            jwt.verify(token, process.env.TOKEN_SECRET, (err) => {
                if (err) {
                    console.log(err);
                    res.status(401).json({ error: 'Unautenticated request!' });
                } else {
                    const type = req.params.type;
                    let term = req.query.term;

                    if (term) {
                        term = term.toLocaleLowerCase();

                        let criteria;
                        let dataPath;

                        if (type === 'clients') {
                            dataPath = './data/clients.json';
                            criteria = helpers.matchClient;
                        } else if (type === 'projects') {
                            dataPath = './data/projects.json';
                            criteria = helpers.matchProject;
                        } else {
                            res.status(404).send({ error: 'Requested entity not found!' });
                        }

                        helpers.readFile(fs, data => {
                            let filtered = data.filter(x => criteria(x, term));
                            let result = helpers.queryData(filtered)

                            res.status(200).send({ data: result.data, numOfPages: result.numOfPages,  total: result.total });
                        }, true, dataPath);

                    } else {
                        res.status(404).json({ error: 'Not valid term for search!' });
                    }
                }
            });
        } else {
            res.status(401).json({ error: 'Unautenticated request!' });
        }
    });

    // Search by letter
    app.get('/search/name/:type', (req, res) => {
        const _authHeader = req.headers.authorization;
        if (_authHeader) {
            const token = _authHeader.split(' ')[1];
            jwt.verify(token, process.env.TOKEN_SECRET, (err) => {
                if (err) {
                    console.log(err);
                    res.status(401).json({ error: 'Unautenticated request!' });
                } else {
                    const type = req.params.type;
                    let letter = req.query.beginsWith;
                    let limit = req.query.limit;
                    let page = req.query.page;


                    console.log('Search by letter...' + letter);

                    if (letter) {
                        let criteria;
                        let dataPath;

                        if (type === 'clients') {
                            dataPath = './data/clients.json';
                            criteria = helpers.matchClientByName;
                        } else if (type === 'projects') {
                            dataPath = './data/projects.json';
                            criteria = helpers.matchProjectByName;
                        } else {
                            res.status(404).send({ error: 'Requested entity not found!' });
                        }

                        helpers.readFile(fs, data => {
                            let result = helpers.queryData(data, letter, criteria, limit, page);

                            res.status(200).send({ data: result.data, numOfPages: result.numOfPages, total: result.total});

                        }, true, dataPath);

                    } else {
                        res.status(404).json({ error: 'Not valid term for search!' });
                    }
                }
            });
        } else {
            res.status(401).json({ error: 'Unautenticated request!' });
        }
    });
}

module.exports = searchRoute;
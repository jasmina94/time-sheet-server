const jwt = require('jsonwebtoken');
const helpers = require('../helpers/helpers');

const matchClient = (client, term) => {
    let match = false;
    if (client.name.toLowerCase().indexOf(term) !== -1
        || client.zip.toLowerCase().indexOf(term) !== -1
        || client.address.toLowerCase().indexOf(term) !== -1
        || client.city.toLowerCase().indexOf(term) !== -1
        || client.country.toLowerCase().indexOf(term) !== -1) {
        match = true;
    }

    return match;
}

const matchProject = (project, term) => {
    let match = false;
    if (project.name.toLowerCase().indexOf(term) !== -1
        || project.description.toLocaleLowerCase().indexOf(term) !== -1) {
        match = true;
    }

    return match;
}

const searchRoute = (app, fs) => {

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
                            criteria = matchClient;
                        } else if (type === 'projects') {
                            dataPath = './data/projects.json';
                            criteria = matchProject;
                        } else {
                            res.status(404).send({ error: 'Requested entity not found!' });
                        }

                        helpers.readFile(fs, data => {
                            let filtered = data.filter(x => criteria(x, term));
                            let result = helpers.queryData(filtered)
                            res.status(200).send({ entities: result.data, numOfPages: result.numOfPages });
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
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
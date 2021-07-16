const jwt = require('jsonwebtoken');

const clientRoutes = (app, fs) => {
    const dataPath = './data/clients.json';

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
        readFile(data => {
            const _authHeader = req.headers.authorization;
            if (_authHeader) {
                const token = _authHeader.split(' ')[1]; 
                jwt.verify(token, process.env.TOKEN_SECRET, (err, data) => {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(data);
                        res.status(200).send({data: data});
                    }
                });
            } else {
                res.status(401).json({ error: 'Unautenticated request!' });
            }
        }, true)
    });
}

module.exports = clientRoutes;
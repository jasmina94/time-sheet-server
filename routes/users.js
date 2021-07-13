const helpers = require('../helpers/helpers');

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


    app.post('/login', (req, res) => {
        readFile(data => {
            const _email = req.body.email;
            const _pass = req.body.password;

            const user = data.find(x => x.email === _email && x.password === _pass);

            if (!user) {
                res.status(401).json({ error: 'Credentials not valid!' })
            } else {
                const token = helpers.generateAccessToken(user.email);
                res.status(200).json({ token: token, user: user });
            }
        }, true);
    });


    app.get('/users', (req, res) => {
        fs.readFile(dataPath, 'utf8', (err, data) => {
            if (err) {
                throw err;
            }

            res.send(JSON.parse(data));
        });
    });


    app.post('/password', (req, res) => {
        readFile(data => {
            const _email = req.body.email;
            const user = data.find(x => x.email === _email);

            if (!user) {
                res.status(404).json({ error: `User with given email is not found: ${_email}` });
            } else {

                const newPassword = helpers.makeRandomPassword(5);
                const index = data.findIndex((item => item.email === _email));

                data[index].password = newPassword;

                writeFile(JSON.stringify(data), () => {
                    res.status(200).json({ password: newPassword });
                });
            }
        }, true);
    });

    app.post('/users', (req, res) => {
        readFile(data => {
            // Note: this isn't ideal for production use. 
            // ideally, use something like a UUID or other GUID for a unique ID value
            const newUserId = Date.now().toString();

            // add the new user
            data[newUserId.toString()] = req.body;

            writeFile(JSON.stringify(data, null, 2), () => {
                res.status(200).send('new user added');
            });
        }, true);
    });


    // UPDATE
    app.put('/users/:id', (req, res) => {

        readFile(data => {

            // add the new user
            const userId = req.params["id"];
            data[userId] = req.body;

            writeFile(JSON.stringify(data, null, 2), () => {
                res.status(200).send(`users id:${userId} updated`);
            });
        }, true);
    });


    // DELETE
    app.delete('/users/:id', (req, res) => {

        readFile(data => {
            const userId = req.params["id"];
            delete data[userId];

            writeFile(JSON.stringify(data, null, 2), () => {
                res.status(200).send(`users id:${userId} removed`);
            });
        }, true);
    });
};

module.exports = userRoutes;
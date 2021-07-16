const userRoutes = require('./users');
const clientRoutes = require('./clients');

const appRouter = (app, fs) => {
    app.get('/', (req, res) => {
        res.send('Hello from server!');
    });

    userRoutes(app, fs);
    clientRoutes(app, fs);
};

module.exports = appRouter;
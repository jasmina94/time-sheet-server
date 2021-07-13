const userRoutes = require('./users');

const appRouter = (app, fs) => {
    app.get('/', (req, res) => {
        res.send('Hello from server!');
    });

    userRoutes(app, fs);
};

module.exports = appRouter;
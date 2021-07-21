const userRoutes = require('./users');
const clientRoutes = require('./clients');
const projectRoutes = require('./projects');
const authenticationRoutes = require('./authentication');

const appRouter = (app, fs) => {
    app.get('/', (req, res) => {
        res.send('Hello from server!');
    });

    authenticationRoutes(app, fs);
    userRoutes(app, fs);
    clientRoutes(app, fs);
    projectRoutes(app, fs);
};

module.exports = appRouter;
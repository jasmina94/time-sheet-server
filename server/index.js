const express = require('express');
const cors = require('cors')
const jsonServer = require('json-server');

const port = 8000;

const app = express();
app.use(cors());
app.use('/api', jsonServer.router('data/db.json'));

app.get('/api/ping', (req, res) => {
    res.json({message: 'Hello from server'});
});

app.listen(port, () => {
  console.log(`Server listening on ${port}`);
});
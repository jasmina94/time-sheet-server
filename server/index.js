const fs = require('fs');
const cors = require('cors');
const express = require('express');
const dotenv = require('dotenv');

const app = express();
app.use(cors());
app.use(express.json());
dotenv.config();

const routes = require('../routes/routes.js')(app, fs);

const port = process.env.PORT;

app.listen(port, () => {
  console.log(`Server listening on ${port}`);
});
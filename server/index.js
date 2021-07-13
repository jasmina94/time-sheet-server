const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

const generateAccessToken = (email) => {
  return jwt.sign(email, process.env.TOKEN_SECRET);
}

const ALL_USERS = [
  {
    "id": 1,
    "email": "j.eminovski@emakina.rs",
    "password": "Pass",
    "firstname": "Jasmina",
    "lastname": "Eminovski"
  },
  {
    "id": 2,
    "email": "test@test.com",
    "password": "test",
    "firstname": "Test",
    "lastname": "Test"
  }
];

const app = express();
app.use(cors());
app.use(express.json());
dotenv.config();

app.get('/api/ping', (req, res) => {
  res.json({ message: 'Hello from server' });
});

app.get('/api/users', (req, res) => {
  res.json(ALL_USERS);
});

app.post('/auth', (req, res) => {
  const _email = req.body.email;
  const _pass = req.body.password;
  const user = ALL_USERS.find(x => x.email === _email && x.password === _pass);
  if (!user) {
    res.status(401).json({ error: 'Credentials not valid!' })
  } else {
    const token = generateAccessToken(user.email);
    res.status(200).json({ token: token, user: user });
  }
});

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Server listening on ${port}`);
});
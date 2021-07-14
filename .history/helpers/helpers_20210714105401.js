const fs = require('fs');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const helpers = {
   makeRandomPassword,
   generateAccessToken
};

function makeRandomPassword(length) {
    let result = '';
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charsLength = chars.length;

    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * charsLength));
    }

    return result;
};

function generateAccessToken(data) {
    return jwt.sign(data, process.env.TOKEN_SECRET);
};

module.exports = helpers;
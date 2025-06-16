const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_EXPIRATION = '1h';

const register = async (req, res) => {
    const { email, password } = req.body
};

module.exports = { register }
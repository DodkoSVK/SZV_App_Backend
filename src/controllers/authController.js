const authModel = require('../models/authModel');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_EXPIRATION = '1h';


const register = async (req, res) => {
    const { personId, firstName, lastName} = req.body;   
    const login = generateLogin(firstName, lastName);

    console.log(`Login: ${login}`);
    
    try {
        const existingUser = await authModel.getUserByLogin(login);
        if (existingUser.rowCount > 0)
            return res.status(400).send({ message: "Používateľ už existuje" });

        const password = generatePassword();
        const hashedPassword = await bcrypt.hash(password, 10);
        const userLoginId = await authModel.insertNewLogin(personId, login, hashedPassword);

        if (userLoginId.rowCount < 1)
            return res.status(400).send({ message: "Nebolo možné registrovať používateľa"});
        
        const loginData = {
            "login": login,
            "password" : password
        }
        return res.status(200).json(loginData)

    } catch (e) {
        console.log(`🟠 We got a problem: ${e}`);
        return res.status(500).send({message: "Neocakavana chyba na strane databazy."});
    }
};



// Support method
const removeDiacritics = (str) =>
    str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const generateLogin = (firstName, lastName) => {
    const cleanedFirst = removeDiacritics(firstName).replace(/\s/g, '').substring(0, 4).toLowerCase();

    const match = lastName.match(/^([^\d]+)(\d*)$/);
    if (!match) return '';

    const namePart = removeDiacritics(match[1]);
    const numberPart = match[2];

    let second = '';

    if (numberPart.length === 0) {
        second = namePart.substring(0, 4).toLowerCase();
    } else if (numberPart.length === 1) {
        second = (namePart.substring(0, 3) + numberPart).toLowerCase();
    } else {
        second = (namePart.substring(0, 2) + numberPart.substring(0, 2)).toLowerCase();
    }

    return `${cleanedFirst}.${second}`;
    };


const generatePassword = (length = 12) => {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$&*';
    const charsetLength = charset.length;
    const buffer = crypto.randomBytes(length);

    return Array.from(buffer)
        .map(byte => charset.charAt(byte % charsetLength))
        .join('');
};


module.exports = { register }
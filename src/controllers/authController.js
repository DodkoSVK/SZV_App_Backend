const authModel = require('../models/authModel');
const mail = require('../../config/mail')

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_TOKEN_PASS;
const TOKEN_EXPIRATION = '1h';


const register = async (req, res) => {
    const { id, fname, sname, email} = req.body;   
    const login = generateLogin(fname, sname);

    console.log(`Login: ${login}`);
    
    try {
        const existingUser = await authModel.getUserByLogin(login);
        if (existingUser.rowCount > 0)
            return res.status(400).send({ message: "Používateľ už existuje" });

        const password = generatePassword();
        const hashedPassword = await bcrypt.hash(password, 10);
        const userLoginId = await authModel.insertNewLogin(id, login, hashedPassword);

        if (userLoginId.rowCount < 1)
            return res.status(400).send({ message: "Nebolo možné registrovať používateľa"});
        
        const loginData = {
            "login": login,
            "password" : password
        }
        mailMessage = mail.resigerEmailTemplate(login, password)
        mail.sendEmail('"SZV APP " <info@app.vzpieranie.sk>', email, "SZV APP - Prihlasovacie údate", mailMessage)


        return res.status(200).json(loginData)

    } catch (e) {
        console.log(`🟠 We got a problem: ${e}`);
        return res.status(500).send({message: "Neocakavana chyba na strane databazy."});
    }
};

const login = async (req, res) => {
    const { login, password } = req.body;
    try {
        const user = await authModel.getUserByLogin(login);
        const userData = user.rows[0];
        console.log(`User login: ${userData.login}`)
        if (!user) 
            return res.status(401).json({ message: "Zlé prihlasovacie údaje."});
        
        const isMatch = await bcrypt.compare(password, userData.password);
        if (!isMatch)
            return res.status(401).json({ message: "Zlé prihlasovacie údaje."});

        if(!userData.last_login)
            return res.status(200).json({
                forceChange: true,
                userId: userData.person_id,
                message: 'Prvé prihlásenie — prosím nastavte nové heslo'
            });

        const token = jwt.sign({ id: userData.person_id, login: userData.login}, JWT_SECRET, { expiresIn: TOKEN_EXPIRATION});
        res.json({ token })
    } catch (e) {
        console.log(`🟠 We got a problem: ${e}`);
        return res.status(500).send({message: "Neocakavana chyba na strane databazy."});
    }
}

const getProfile = async (req, res) => {
    const authHeader = req.headers.authorization;
    if(!authHeader)
        return res.status(400).json({ message: "Login token missing."})

    const token = authHeader.split(' ')[1];
    try {
        const payload = jwt.verify(token, JWT_SECRET)
        res.json({ message: 'Údaje používateľa', user: payload});
    } catch (e) {
        res.status(403).json({ message: "Wrong or expired token"});
    }
}

const changePassword = async (req, res) => {
    const { userId, newPassword } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const result = authModel.updatePassword(userId, hashedPassword);
        if (!result)
            res.status(500).json({ message: 'Nepodarilo sa zmeniť heslo' });
        res.status(200).json({ message: "Heslo bolo zmenené, môžete sa prihlásiť"})
    } catch (e) {
        console.error('changePassword error:', err);
        res.status(500).json({ message: 'Nepodarilo sa zmeniť heslo' });
    }
}
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




module.exports = { register, login, getProfile }
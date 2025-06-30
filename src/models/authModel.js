const { pool } = require('../../config/database')

const getUserByLogin = async (login) => {
    try {
        const result = await pool.query(`SELECT a.login, a.password, a.person_id, a.last_login FROM auth a WHERE login = $1;`, [login]);
        return result;
    } catch (e) {
        throw e;
    }  
};

const insertNewLogin = async(person_id, login, hashedPassword) => {
    try {
        const result = await pool.query(
            `INSERT INTO auth (person_id, login, "password", created_at) VALUES ($1, $2, $3, NOW()) RETURNING id;`,
            [person_id, login, hashedPassword]);
        return result.rows[0];
    } catch (e) {
        throw e;
    }
};

const updateLastLogin = async(personId) => {
    try {
        const result = await pool.query(`UPDATE auth SET last_login = NOW() WHERE person_id = $1 RETURNING id;`, [personId]);
        return result
    } catch (e) {
        throw e
    }
}

const updatePassword = async(personId, newHashedPassword) => {
    try {
        const result = await pool.query(`UPDATE auth SET lastlogin = NOW(), password = $1 WHERE person_id = $2 RETURNING id;`, [newHashedPassword, personId]);
        return result;
    } catch (e) {
        throw e;
    }
}
module.exports = { getUserByLogin, insertNewLogin, updateLastLogin, updatePassword }
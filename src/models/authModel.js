const { pool } = require('../../config/database')

const getUserByLogin = async (login) => {
    try {
        const result = await pool.query(`SELECT a.login, a.password FROM auth a WHERE login = $1;`, [login]);
        return result;
    } catch (e) {
        throw e;
    }  
}

const insertNewLogin = async(person_id, login, hashedPassword) => {
    try {
        const result = await pool.query(
            `INSERT INTO auth (person_id, login, "password", created_at) VALUES ($1, $2, $3, NOW()) RETURNING id;`,
            [person_id, login, hashedPassword]);
        return result.rows[0];
    } catch (e) {
        throw e;
    }
}

module.exports = { getUserByLogin, insertNewLogin }
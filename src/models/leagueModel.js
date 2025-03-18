const { pool } = require('../../config/database');

const selectLeague = async () => {
    try {
        const results = await pool.query('SELECT * FROM public.league;');
        return results;
    } catch (e) {
        throw e;
    }
};
const insertLeague = async (leagueName) => {
    try {
        const results = await pool.query(
            'INSERT INTO public.league (name) VALUES ($1) returning id AS league_id;', [leagueName]
        );
        return results;
        
    } catch (e) {
        throw e;
    }
};
const updateLeague = async (leagueId, leagueNewName) => {
    try {
        const results = await pool.query(
            'UPDATE public.league SET name = $1 WHERE id = $2 returning id AS league_id;', [leagueNewName, leagueId]
        );
        return results;
    } catch (e) {
        throw e;
    }
};
const deleteLeague = async (leagueId) => {
    try {
        const results = await pool.query(
            'DELETE FROM public.league WHERE id = $1 returning id AS league_id;', [leagueId]
        );
        return results;
    } catch (e) {
        throw e;
    }
};

module.exports = { selectLeague, insertLeague, updateLeague, deleteLeague };

const leagueModel = require("../models/leagueModel");


const getLeague = async (req, res) => {
    try {
        const result = await leagueModel.selectLeague();
        if (result.rows.length < 1)
            return res.status(200).send({ message: "V databáze sa nenachádzajú žiadne ligy" });

        return res.status(200).json(result.rows);
    } catch (e) {
        console.log(`🟠 We got a problem: ${e}`);
        return res.status(500).send({message: "Neocakavana chyba na strane databazy."});
    }
};
const createLeague = async (req, res) => {

};
const editLeague = async (req, res) => {

};
const removeLeague = async (req, res) => {

};
module.exports = { getLeague, createLeague, editLeague, removeLeague };
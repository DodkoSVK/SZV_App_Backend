const clubModel = require('../models/clubsModel');
const clubSchema = require('../schemas/clubSchema');

const getClub = async (req, res) => {

};
const getClubById = async (req, res) => {

};
const createClub = async (req, res) => {
    const { error } = clubSchema.createClubSchema.validate(req.body);
    if(error)
        return res.status(400).send({ message: error.details[0].message});

    const { name, type, city, street, postal, ico, mail, tel, chairman } = req.body;

    try {
        const result = await clubModel.createClubInDb(name, type, city, street, postal, ico, mail, tel, chairman);
        if (result.rows.length < 1)
            return res.status(500).send({message: "Nebolo mozne zapisat klub do databazy"});

        console.log(`Results: ${JSON.stringify(results.rows)}`);
        return res.status(201).send({message: `Klub vytvoreny s ID: ${results.rows[0].id}`});
    } catch (e) {
        console.log(`🟠 We got a problem: ${e}`);
        return res.status(500).send({message: "Neocakavana chyba na strane databazy."});
    }
    
};
const editClub = async (req, res) => {

};
const deleteClub = async (req, res) => {

};
module.exports = {getClub, getClubById, createClub, editClub, deleteClub};
const personModels = require('../models/personModel');
const personSchema = require('../schemas/personSchema');

const getPerson = async (req, res) => {
    const { sortBy } = req.query;
    if(sortBy) {
        const { error } = personSchema.sortPersonSchema.validate({sortBy});
        if (error)
            return res.status(400).send({ message: error.details[0].message });
    }
    try {
        const result = await personModels.selectPerson(sortBy);
        if (result.rows.length < 1)
            return res.status(200).send({ message: "V databáze sa nenachádzajú žiany ľudia."});

        return res.status(200).json(result.rows);
    } catch (e) {
        console.log(`🟠 We got a problem: ${e}`);
        return res.status(500).send({message: "Neocakavana chyba na strane databazy."});
    }
};

const getPersonByID = async (req, res) => {
    const { id } = req.params;
    const { error } = personSchema.sortPersonIdSchema.validate({id});
    if(error)
        return res.status(400).send({ message: error.details[0].message});
    try {
        const result = await personModels.selectPersonById(id);
        if(result.rows.length < 1) 
            return res.status(200).send({ message: "V databáze sa konkrétny klub" })
        return res.status(200).json(result.rows);
    } catch (e) {
        console.log(`🟠 We got a problem: ${e}`);
        return res.status(500).send({message: "Neocakavana chyba na strane databazy."});  
    }
};
const createPerson = async (req, res) => {
    const { error } = personSchema.createPersonSchema.validate( req.body );
    if(error)
        return res.status(400).send({ message: error.details[0].message});

    const { name, surname, birth, club } = req.body;
    try {
        const result = await personModels.insertPerson(name, surname, birth, club)    
        if(result.rows.length < 1) 
            return res.status(200).send({ message: "Nebolo možné zapísať osobu do databázy"});

        return res.status(201).send({ message: "Uživateľ bol úspešne vytvorený v databáze."});
    } catch (e) {
        console.log(`🟠 We got a problem: ${e}`);
        return res.status(500).send({message: "Neocakavana chyba na strane databazy."});
    }    
};
const editPerson = async (req, res) => {

};
const deletePerson = async (req, res) => {

};



module.exports = { getPerson, getPersonByID, createPerson, editPerson, deletePerson };
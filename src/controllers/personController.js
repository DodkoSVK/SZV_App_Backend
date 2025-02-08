const personModels = require('../models/personModel');
const personSchema = require('../schemas/personSchema');

/**
 * Backend controller for getting people from the DB with an optional parameter for sorting
 * @param {*} req 
 * @param {*} res 
 * @returns -> Code 200: All data retrieved or the empty DB, Code 500: Database error
 * 0
 */
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
/**
 * Backend controller for getting people from the DB by their ID
 * @param {*} req 
 * @param {*} res 
 * @returns -> Code 200: All data retrieved or the empty DB, Code 400: Wrong request, Code 500: Database error
 */
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
/**
 * Backend controller for creating a new person
 * @param {*} req 
 * @param {*} res 
 * @returns -> Code 200: Person created, Code 400: Wrong request, Code 500: Database error
 */
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
/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
const editPerson = async (req, res) => {
    const { error } = personSchema.updatePersonSchema.validate(req.body);
    if(error) {
        console.log(`Validation error: ${error.details[0].message}`);
        return res.status(400).send({ message: error.details[0].message});
    }

    const { id } = req.params;
    const { name, surname, birth, club } = req.body;
    console.log(`Editing person with ID: ${id} and data: ${JSON.stringify({ name, surname, birth, club })}`);

    let fieldsToUpdate = {};
    if (name) fieldsToUpdate.name = name;
    if (surname) fieldsToUpdate.surname = surname;
    if (birth) fieldsToUpdate.birth = birth;
    if (club) fieldsToUpdate.club = club;

    try {
        const result = await personModels.updatePerson(id, fieldsToUpdate);
        if (result.rowCount === 0)
            return res.status(404).send({ message: "Osoba nebola nájdená." });

        return res.status(200).send({ message: "Osoba bola úspešne aktualizovaná." });
    } catch (e) {
        console.log(`🟠 We got a problem: ${e}`);
        return res.status(500).send({ message: "Neočakávaná chyba na strane databázy." });
    }
};

const deletePerson = async (req, res) => {

};



module.exports = { getPerson, getPersonByID, createPerson, editPerson, deletePerson };
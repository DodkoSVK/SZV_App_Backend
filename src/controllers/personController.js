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
const getPersonWithoutClub = async (req, res) => {
    try {
        const result = await personModels.selectPersonWithoutClub();
        if (result.rows.length < 1)
            return res.status(200).send({ message: "V databáze sa nenachádzajú žiany ľudia bez klubu"});
        return res.status(200).json(result.rows);
    } catch (e) {
        console.log(`🟠 We got a problem: ${e}`);
        return res.status(500).send({message: "Neocakavana chyba na strane databazy."});
    }
}

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

    const { fname, sname, birth, club } = req.body;
    try {
        const result = await personModels.insertPerson(fname, sname, birth, club)    
        if(result.rowCount < 1) 
            return res.status(200).send({ message: "Nebolo možné zapísať osobu do databázy"});

        return res.status(201).send({ message: "Uživateľ bol úspešne vytvorený v databáze."});
    } catch (e) {
        console.log(`🟠 We got a problem: ${e}`);
        return res.status(500).send({message: "Neocakavana chyba na strane databazy."});
    }    
};
/**
 * Backend controller for editing a person
 * @param {*} req 
 * @param {*} res 
 * @returns Code 200: Person updated, Code 400: Wrong request, Code 500: Database error
 */
const editPerson = async (req, res) => {
    const { error } = personSchema.updatePersonSchema.validate(req.body);
    if(error) 
        return res.status(400).send({ message: error.details[0].message});    
    const { id } = req.params;
    const { fname, sname, birth, club } = req.body;

    let fieldsToUpdate = {};
    if (fname) fieldsToUpdate.fname = fname;
    if (sname) fieldsToUpdate.sname = sname;
    if (birth) fieldsToUpdate.birth = birth;
    if (club) fieldsToUpdate.club = club;

    try {
        const result = await personModels.updatePerson(id, fieldsToUpdate);
        if (result.rowCount === 0)
            return res.status(404).send({ message: "Osoba nebola nájdená." });

        return res.status(201).send({ message: "Osoba bola úspešne aktualizovaná." });
    } catch (e) {
        console.log(`🟠 We got a problem: ${e}`);
        return res.status(500).send({ message: "Neočakávaná chyba na strane databázy." });
    }
};
/**
 * Backend controller for deleting a person
 * @param {*} req 
 * @param {*} res 
 * @returns -> Code 200: Person deleted, Code 400: Wrong request, Code 500: Database error
 */
const deletePerson = async (req, res) => {
    const { error } = personSchema.sortPersonIdSchema.validate(req.params);
    if(error)
        return res.status(400).send({ message: error.details[0].message});
    const { id } = req.params;
    try {
        const result = await personModels.deletePerson(id);
        if(result.rowCount === 0)
            return res.status(404).send({ message: "Osoba nebola nájdená." });
        return res.status(200).send({ message: "Osoba bola úspešne vymazaná." });
    } catch (e) {
        console.log(`🟠 We got a problem: ${e}`);
        return res.status(500).send({ message: "Neočakávaná chyba na strane databázy." });
    }
};

module.exports = { getPerson, getPersonWithoutClub, getPersonByID, createPerson, editPerson, deletePerson };
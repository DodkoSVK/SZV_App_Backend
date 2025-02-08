const clubModel = require('../models/clubsModel');
const clubSchema = require('../schemas/clubSchema');

/**
 * Backend controller for getting clubs from the DB with an optional parameter for sorting
 * @param {*} req 
 * @param {*} res 
 * @return {*} -> Code 200: All data retrieved or the empty DB, Code 400: Wrong request, Code 500: Database error
 * 
 */
const getClub = async (req, res) => {
    const { sortBy } = req.query;
    if (sortBy) {
        const { error } = clubSchema.sortClubSchema.validate({ sortBy });
        if(error)
            return res.status(400).send({ message: error.details[0].message });
    }
    try {
        const result = await clubModel.selectAllClubs(sortBy);
        if(result.rows.length < 1)
            return res.status(200).send({message: "V databáze sa nenachádzajú žiadne kluby"});

        return res.status(200).json(result.rows);
    } catch (e) {
        console.log(`🟠 We got a problem: ${e}`);
        return res.status(500).send({message: "Neocakavana chyba na strane databazy."});
    }
};
/**
 * Backend controller for getting clubs from WB by their ID
 * @param {*} req 
 * @param {*} res
 * @return {*} -> Code 200: All data retrieved or the empty DB, Code 400: Wrong request, Code 500: Database error
 */
const getClubById = async (req, res) => {
    const { id } = req.params;
    const { error } = clubSchema.sortIdSchema.validate({ id });
    if(error)
        return res.status(400).send({ message: error.details[0].message });     
    try {
        const result = await clubModel.selectClubById(id);
        if (result.rows.length < 1)
            return res.status(200).send({message: "V databáze sa nenachádza žiadny klub s konkrétnym ID"});

        return res.status(200).json(result.rows);
    } catch (e) {
        console.log(`🟠 We got a problem: ${e}`);
        return res.status(500).send({message: "Neocakavana chyba na strane databazy."});
    }
};
/**
 * Backend controller for creating a new club
 * @param {*} req 
 * @param {*} res
 * @return {*} -> Code 201: Club created Code 400: Wrong request, Code 500: Database error
 */
const createClub = async (req, res) => {
    const { error } = clubSchema.createClubSchema.validate(req.body);
    if(error)
        return res.status(400).send({ message: error.details[0].message});

    const { name, type, city, street, postal, ico, mail, tel, chairman } = req.body;
    try {
        const result = await clubModel.insertClub(name, type, city, street, postal, ico, mail, tel, chairman);
        if (result.rows.length < 1)
            return res.status(500).send({message: "Nebolo mozne zapisat klub do databazy"});

        return res.status(201).send({message: `Klub vytvoreny s ID: ${result.rows[0].id}`});
    } catch (e) {
        console.log(`🟠 We got a problem: ${e}`);
        return res.status(500).send({message: "Neocakavana chyba na strane databazy."});
    }    
};
/**
 * Backend controller for editing an existing club by id
 * @param {*} req
 * @param {*} res
 * @return {*} -> Code 201: Club updated, Code 400: Wrong request, Code 500: Database error
 */
const editClub = async (req, res) => {
    const { error } = clubSchema.editClubSchema.validate(req.body);
    if (error)
        return res.status(400).send({ message: error.details[0].message});

    const { id } = req.params;
    const { name, type, city, street, postal, ico, mail, tel, chairman } = req.body;
    let fieldsToUpdate = [];
    let valuesToUpdate = [];
    if(name) {
        fieldsToUpdate.push(`name = $${fieldsToUpdate.length+1}`);
        valuesToUpdate.push(name);
    }
    if(type) {
        fieldsToUpdate.push(`type = $${fieldsToUpdate.length+1}`);
        valuesToUpdate.push(type);
    }
    if(city) {
        fieldsToUpdate.push(`city = $${fieldsToUpdate.length+1}`);
        valuesToUpdate.push(city);
    }
    if(street) {
        fieldsToUpdate.push(`street = $${fieldsToUpdate.length+1}`);
        valuesToUpdate.push(street);
    }
    if(postal) {
        fieldsToUpdate.push(`postal = $${fieldsToUpdate.length+1}`);
        valuesToUpdate.push(postal);
    }
    if(ico) {
        fieldsToUpdate.push(`ico = $${fieldsToUpdate.length+1}`);
        valuesToUpdate.push(ico);
    }
    if(mail) {
        fieldsToUpdate.push(`mail = $${fieldsToUpdate.length+1}`);
        valuesToUpdate.push(mail);
    }
    if(tel) {
        fieldsToUpdate.push(`tel = $${fieldsToUpdate.length+1}`);
        valuesToUpdate.push(tel);
    }
    if(chairman) {
        fieldsToUpdate.push(`chairman = $${fieldsToUpdate.length+1}`);
        valuesToUpdate.push(chairman);
    }
    try {
        valuesToUpdate.push(id);
        const result = await clubModel.updateClub(fieldsToUpdate, valuesToUpdate);
        if(result.rows.length < 1)
            return res.status(500).send({message: "Nebolo mozne upravit klub v databáze"});

        return res.status(201).send({message: `Klub s ID: ${results.rows[0].id} bol upravený`});
    } catch (e) {
        console.log(`🟠 We got a problem: ${e}`);
        return res.status(500).send({message: "Neocakavana chyba na strane databazy."});
    }   
};
/**
 * Backend controller to delete an existing club by id
 * @param {*} req 
 * @param {*} res 
 * @returns -> Code 200: Club deleted, Code 500: Database error
 */
const deleteClub = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await clubModel.deleteClubDB(id);
        if (result.rows.length < 1)
            return res.status(500).send({message: "Nebolo mozne vymazat klub z databazy"});

        return res.status(200).send({message: `Klub s ID: ${results.rows[0].id} bol vymazaný`});
    } catch (e) {
        console.log(`🟠 We got a problem: ${e}`);
        return res.status(500).send({message: "Neocakavana chyba na strane databazy."});
    }
};

module.exports = {getClub, getClubById, createClub, editClub, deleteClub};
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
        console.log(`Results: ${JSON.stringify(result)}`);
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
    let clubs = req.body;
    if (!Array.isArray(clubs))
        clubs = [clubs];

    try {
        let insertedClubs = [];
        for (const club of clubs) {
            const { error } = clubSchema.createClubSchema.validate(club);
            if (error)
                return res.status(400).send({ message: `Chyba v zázname klubu: ${error.details[0].message}` });

            const { name, city, street, postal, ico, mail, tel, chairman_id } = club;
            const result = await clubModel.insertClub(name, city, street, postal, ico, mail, tel, chairman_id);
            if (result.rowCount > 0) {
                insertedClubs.push(result.rows[0].id);
            }            
        }
        return res.status(201).send({
            message: `Vytvorených ${insertedClubs.length} klubov`,
            ids: insertedClubs
        });
    } catch (e) {
        console.log(`🟠 We got a problem: ${e}`);
        return res.status(500).send({message: "Neocakavana chyba na strane databazy."});
    }
    /* const { error } = clubSchema.createClubSchema.validate(req.body);
    if(error)
        return res.status(400).send({ message: error.details[0].message});

    const { name, city, street, postal, ico, mail, tel, chairman } = req.body;
    try {
        const result = await clubModel.insertClub(name, city, street, postal, ico, mail, tel, chairman);
        if (result.rows.length < 1)
            return res.status(500).send({message: "Nebolo mozne zapisat klub do databazy"});

        return res.status(201).send({message: `Klub vytvorený`});
    } catch (e) {
        console.log(`🟠 We got a problem: ${e}`);
        return res.status(500).send({message: "Neocakavana chyba na strane databazy."});
    }     */
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
    const { name, type, city, street, postal, ico, mail, tel, chairman_id } = req.body;
    let fieldsToUpdate = [];
    if (name) fieldsToUpdate.name = name;
    if (type) fieldsToUpdate.type = type;
    if (city) fieldsToUpdate.city = city;
    if (street) fieldsToUpdate.street = street;
    if (postal) fieldsToUpdate.postal = postal;
    if (ico) fieldsToUpdate.ico = ico;
    if (mail) fieldsToUpdate.mail = mail;
    if (tel) fieldsToUpdate.tel = tel;
    if (chairman_id) fieldsToUpdate.chairman = chairman_id;
    try {        
        const result = await clubModel.updateClub(id, fieldsToUpdate);
        if(result.rowCount === 0)
            return res.status(500).send({message: "Nebolo mozne upravit klub v databáze"});

        return res.status(201).send({message: `Klub s ID: ${id} bol upravený`});
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
        if (result.rowCount === 0)
            return res.status(500).send({message: "Nebolo mozne vymazat klub z databazy"});

        return res.status(200).send({message: `Klub s ID: ${result.rows[0].id} bol vymazaný`});
    } catch (e) {
        console.log(`🟠 We got a problem: ${e}`);
        return res.status(500).send({message: "Neocakavana chyba na strane databazy."});
    }
};

module.exports = {getClub, getClubById, createClub, editClub, deleteClub};
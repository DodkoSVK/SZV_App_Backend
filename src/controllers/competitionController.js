const { date } = require('joi');
const competitionModel = require('../models/competitionModel');
const competitionSchema = require('../schemas/competitionSchema');

const getCompetition = async (req, res) => {
    const { sortBy } = req.query;
    if (sortBy) {
        const { error } = competitionSchema.sortCompetitionSchema.validate({ sortBy });
        if(error)
            return res.status(400).send({ message: error.details[0].message });
    }    
    try {
        const result = await competitionModel.selectCompetition(sortBy);
        console.log(result.rows);
        if(result.rows.length < 1)
            return res.status(200).send({message: "V databáze sa nenachádzajú žiadne súťaže"});

        const rawCompetitions = result.rows;
        const rawData = {};
        rawCompetitions.forEach((competition) => {
            if(!rawData[competition.comp_id]) {
                rawData[competition.comp_id] = {
                    id: competition.comp_id,
                    league_id: competition.league,
                    league_name: competition.league_name,
                    round: competition.round,
                    date: competition.date,
                    locations: []
                }
            }
            rawData[competition.comp_id].locations.push({
                id: competition.location_id,
                group: competition.group_name,
                city: competition.city,
                club_id: competition.club_id,
                club_name: competition.club_name
            });
            console.log(`Competitions: ${JSON.stringify(rawData)}`)
        })
        const competitions = Object.values(rawData);
        console.log(`Competitions ${JSON.stringify(competitions)}`)
        return res.status(200).json(competitions);
        
    } catch (e) {
        console.log(`🟠 We got a problem: ${e}`);
        return res.status(500).send({message: "Neocakavana chyba na strane databazy."});
    }
};

const searchCompetition = async (req, res) => {
    const { searchBy } = req.body;
    if (!searchBy)
        return res.status(400).send({ message: "Neboli zadané žiadne parametre pre vyhľadávanie"});

    const { error } = competitionSchema.searchCompetitionSchema.validate({ searchBy });
    if(error)
        return res.status(400).send({ message: error.details[0].message });
    try {
        const result = await competitionModel.searchCompetition(searchBy);
        if(result.rows.length < 1)
            return res.status(200).send({message: "V databáze sa nenachádzajú žiadne súťaže"});

        return res.status(200).json(result.rows);
    } catch (e) {
        console.log(`🟠 We got a problem: ${e}`);
        return res.status(500).send({message: "Neocakavana chyba na strane databazy."});
    }
}

const createCompetition = async (req, res) => {
    const { error } = competitionSchema.createCompetitionSchema.validate(req.body);
    if(error)
        return res.status(400).send({ message: error.details[0].message });

    const { league_id, round, date, locations} = req.body;
    try {
        // 1. Create "competition" and get "competition::id"
        const year = new Date(date).getFullYear();
        console.log(`year ${year}`)
        const competition_id = await competitionModel.insertCompetition(year, league_id, round, date);
        if(competition_id.rows.length < 1)
            return res.status(500).send({message: "Nepodarilo sa vytvoriť súťaž"});

        // 2. Create "comptitions locations"
        await Promise.all(locations.map(async (loc) => {
            const { group, city, club_id } = loc;
            const result = await competitionModel.insertCompetitionLocation(competition_id.rows[0].competition_id, group, club_id, city);
            if(result.rows.length < 1)
                return res.status(500).send({message: "Nepodarilo sa vytvoriť skupinu súťaže"});
        }));
    
        return res.status(201).send({ message: "Súťaž a skupiny boli úspešne vytvorené." });
    } catch (e) {
        console.log(`🟠 We got a problem: ${e}`);
        return res.status(500).send({message: "Neocakavana chyba na strane databazy."});        
    }   
}

const editCompetition = async (req, res) => {
    const { error } = competitionSchema.updateCompettionSchema.validate(req.body);
    if (error)
        return res.status(400).send({ message: error.details[0].message });

    const { id } = req.params;
    const { league_id, round, date, locations } = req.body;

    let fieldsToupdate = {};
    if (league_id) fieldsToupdate.league_id = league_id;
    if (round) fieldsToupdate.round = round;
    if (date) {
        fieldsToupdate.comp_date = date;
        fieldsToupdate.year = new Date(date).getFullYear();
    }

    try {
        // 1. Edit Competition
        const result = await competitionModel.updateCompetition(id, fieldsToupdate);
        if (result.rowCount === 0)
            return res.status(404).send({ message: "Súťaž nebola nájdená." });

        // 2. Edit locations
        if (locations && locations.length > 0) {
            await Promise.all(locations.map(async (loc) => {
                const { id, group, city, club_id } = loc;
                let fieldsToUpdate = {};
                if (group) fieldsToUpdate.group_name = group;
                if (city) fieldsToUpdate.city = city;
                if (club_id) fieldsToUpdate.club_id = club_id;

                await competitionModel.updateCompetitionLocation(id, fieldsToUpdate);
            }));
        }

        return res.status(201).send({ message: "Súťaž a lokality boli úspešne aktualizované." });

    } catch (e) {
        console.log(`🟠 We got a problem: ${e}`);
        return res.status(500).send({ message: "Neočakávaná chyba na strane databázy." });
    }
};

module.exports = { getCompetition, searchCompetition, createCompetition, editCompetition };
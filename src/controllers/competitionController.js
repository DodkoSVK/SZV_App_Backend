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
                    league_name: competition.name,
                    round: competition.round,
                    date: competition.date,
                    locations: []
                }
            }
            rawData[competition.comp_id].locations.push({
                id: competition.clid,
                group: competition.group_name,
                city: competition.city,
                club: competition.club_id,
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

    const { league, round, date, locations} = req.body;
    try {
        // 1. Create "competition" and get "competition::id"
        const year = new Date(date).getFullYear();
        console.log(`year ${year}`)
        const competition_id = await competitionModel.insertCompetition(year, league, round, date);
        if(competition_id.rows.length < 1)
            return res.status(500).send({message: "Nepodarilo sa vytvoriť súťaž"});

        // 2. Create "comptitions locations"
        await Promise.all(locations.map(async (loc) => {
            const { group, city, club } = loc;
            const result = await competitionModel.insertCompetitionLocation(competition_id.rows[0].competition_id, group, club, city);
            if(result.rows.length < 1)
                return res.status(500).send({message: "Nepodarilo sa vytvoriť skupinu súťaže"});
        }));
              
        return res.status(201).send({ message: "Súťaž a skupiny boli úspešne vytvorené." });
    } catch (e) {
        console.log(`🟠 We got a problem: ${e}`);
        return res.status(500).send({message: "Neocakavana chyba na strane databazy."});        
    }   
}
module.exports = { getCompetition, searchCompetition, createCompetition };
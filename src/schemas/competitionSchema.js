const Joi = require("joi");

const sortCompetitionSchema = Joi.object({
    sortBy: Joi.string().valid('name', 'group_name', 'city', 'date', 'round', 'league')    
});
const searchCompetitionSchema = Joi.object({
    searchBy: Joi.object({
        name: Joi.string().optional(),
        group_name: Joi.string().optional(),
        city: Joi.string().optional(),
        date: Joi.date().iso().required(),
        round: Joi.number().optional(),
        league: Joi.string().optional()
    }).required()
});
const createCompetitionSchema = Joi.object({
    id: Joi.number().optional(),
    league: Joi.number().required(),
    round: Joi.number().required(),
    date: Joi.date().required(),  
    locations: Joi.array().items(
        Joi.object({
            id: Joi.number().optional(),
            group: Joi.string().required(),
            city: Joi.string().allow("").required(),
            club: Joi.number().required()            
        })
    ).min(1).required() 
});
module.exports = { sortCompetitionSchema, searchCompetitionSchema, createCompetitionSchema };
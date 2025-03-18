const Joi = require("joi");

const sortCompetitionSchema = Joi.object({
    sortBy: Joi.string().valid('name', 'group_name', 'city', 'date', 'round', 'league')    
});
const searchCompetitionSchema = Joi.object({
    searchBy: Joi.object({
        name: Joi.string().optional(),
        group_name: Joi.string().optional(),
        city: Joi.string().optional(),
        date: Joi.date().optional(),
        round: Joi.number().optional(),
        league: Joi.string().optional()
    }).required()
});
const createCompetitionSchema = Joi.object({
    year: Joi.number().required(),
    date: Joi.date().required(),
    round: Joi.number().required(),
    league: Joi.number().required(),
    groups: Joi.array().items(
        Joi.object({
            group_name: Joi.string().required(),
            club: Joi.number().required(),
            city: Joi.string().required()
        })
    ).min(1).required() 
});
module.exports = { sortCompetitionSchema, searchCompetitionSchema, createCompetitionSchema };
const Joi = require("joi");

const createPersonSchema = Joi.object({
    fName: Joi.string().required(),
    surname: Joi.string().required(),
    birth: Joi.date().required(),
    club: Joi.number().min(1)
});

const sortPersonSchema = Joi.object({
    sortBy: Joi.string().valid('fname', 'sname', 'birth', 'club')
});

const sortPersonIdSchema = Joi.object({
    id: Joi.number().min(1).required()
});
const updatePersonSchema = Joi.object({
    fName: Joi.string(),
    surname: Joi.string(),
    birth: Joi.date(),
    club: Joi.number().min(1)
});

module.exports = { sortPersonSchema, createPersonSchema, sortPersonIdSchema, updatePersonSchema };
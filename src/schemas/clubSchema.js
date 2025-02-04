const Joi = require("joi");

const createClubSchema = Joi.object({
    name: Joi.string().required(),
    type: Joi.number().min(1).required(),
    city: Joi.string().required(),
    street: Joi.string().required(),
    postal: Joi.string().required(),
    ico: Joi.string().required(),
    mail: Joi.string().allow(''),
    tel: Joi.string().allow(''),
    chairman: Joi.number().min(1).required()
});

module.exports = {createClubSchema}
const Joi = require("joi");

const clubTypeSchema = Joi.object({
    club_type: Joi.string().required()
});

module.exports = { clubTypeSchema };
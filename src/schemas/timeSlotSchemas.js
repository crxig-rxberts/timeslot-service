const Joi = require('joi');

const timeSlotSchemas = {
  updateTimeSlot: Joi.object({
    status: Joi.string().valid('available', 'booked', 'blocked').required(),
    serviceId: Joi.string().allow(null)
  })
};

module.exports = timeSlotSchemas;

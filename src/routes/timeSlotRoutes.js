const express = require('express');
const timeSlotController = require('../controllers/timeSlotController');
const validateRequest = require('../utils/validateRequest');
const timeSlotSchemas = require('../schemas/timeSlotSchemas');
const authFilter = require('../middleware/authFilter');

const router = express.Router();

router.get('/:providerUserSub', authFilter, timeSlotController.getTimeSlots);
router.put('/:providerUserSub/:slotId', authFilter, validateRequest(timeSlotSchemas.updateTimeSlot), timeSlotController.updateTimeSlot);

module.exports = router;

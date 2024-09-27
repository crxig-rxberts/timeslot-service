const timeSlotService = require('../services/timeSlotService');
const { formatResponse } = require('../utils/responseFormatter');

class TimeSlotController {
  async getTimeSlots(req, res, next) {
    try {
      const { providerUserSub } = req.params;
      const result = await timeSlotService.getTimeSlots(providerUserSub);
      res.json(formatResponse('Time slots retrieved successfully', result));
    } catch (error) {
      next(error);
    }
  }

  async updateTimeSlot(req, res, next) {
    try {
      const { providerUserSub, slotId } = req.params;
      const { status, serviceId } = req.body;
      const result = await timeSlotService.updateTimeSlot(providerUserSub, slotId, status, serviceId);
      res.json(formatResponse('Time slot updated successfully', result));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TimeSlotController();

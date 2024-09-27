const moment = require('moment');
const logger = require('../utils/logger');
const { NotFoundError } = require('../middleware/customErrors');
const timeSlotModel = require('../models/timeSlotModel');
const {
  fetchProviderData,
  getExistingTimeSlots,
  generateTimeSlots,
  saveUpdatedTimeSlots,
  filterTimeSlots
} = require('./timeSlotHelper');

class TimeSlotService {
  async getTimeSlots(providerUserSub) {
    try {
      const providerData = await fetchProviderData(providerUserSub);

      const startDate = moment().startOf('day');
      const endDate = moment().add(30, 'days').endOf('day');

      const result = await getExistingTimeSlots(providerUserSub);

      if (!result.timeSlots.length || moment(result.timeSlots[result.timeSlots.length - 1].date).isBefore(endDate)) {
        const newSlots = generateTimeSlots(providerData, result.timeSlots, startDate, endDate);
        result.timeSlots = [...result.timeSlots, ...newSlots];
        await saveUpdatedTimeSlots(providerUserSub, result.timeSlots);
      }

      result.timeSlots = filterTimeSlots(result.timeSlots, startDate, endDate);

      logger.info('Time slots retrieved and updated successfully', { providerUserSub });
      return result;
    } catch (error) {
      logger.error('Error in getTimeSlots', { error: error.message, stack: error.stack, providerUserSub });
      throw error;
    }
  }

  async updateTimeSlot(providerUserSub, slotId, status, serviceId) {
    try {
      const result = await timeSlotModel.updateSlot(providerUserSub, slotId, status, serviceId);
      logger.info('Time slot updated successfully', { providerUserSub, slotId });
      return result;
    } catch (error) {
      if (error.code === 'ConditionalCheckFailedException') {
        throw new NotFoundError('Time slot not found');
      }
      logger.error('Error updating time slot', { error, providerUserSub, slotId });
      throw error;
    }
  }
}

module.exports = new TimeSlotService();

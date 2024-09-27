const moment = require('moment');
const axios = require('axios');
const logger = require('../utils/logger');
const { NotFoundError } = require('../middleware/customErrors');
const TimeSlotModel = require('../models/timeSlotModel');

const PROVIDER_API_BASE_URL = 'http://localhost:3004/api/providers';

async function fetchProviderData(providerUserSub) {
  try {
    const response = await axios.get(`${PROVIDER_API_BASE_URL}/${providerUserSub}`);
    return response.data.data;
  } catch (error) {
    logger.error('Error fetching provider data', { error, providerUserSub });
    throw new NotFoundError('Provider not found');
  }
}

async function getExistingTimeSlots(providerUserSub) {
  try {
    const result = await TimeSlotModel.get(providerUserSub);
    return result && result.timeSlots ? result : { providerUserSub, timeSlots: [] };
  } catch (error) {
    logger.error('Error retrieving existing time slots', { error: error.message, providerUserSub });
    throw new Error(`Failed to retrieve existing time slots: ${error.message}`);
  }
}

function generateTimeSlots(providerData, existingSlots, startDate, endDate) {
  const newSlots = [];
  const currentDate = moment(startDate);
  const lastExistingSlotDate = existingSlots.length
    ? moment(existingSlots[existingSlots.length - 1].date).endOf('day')
    : currentDate.clone().subtract(1, 'day');

  while (currentDate.isSameOrBefore(endDate)) {
    if (currentDate.isAfter(lastExistingSlotDate)) {
      const dayOfWeek = currentDate.format('dddd');
      const dayAvailability = providerData.availability[dayOfWeek];

      if (dayAvailability) {
        generateDaySlots(currentDate, dayAvailability, providerData.timeSlotLength, newSlots);
      }
    }
    currentDate.add(1, 'day');
  }

  return newSlots;
}

function generateDaySlots(currentDate, dayAvailability, slotLength, newSlots) {
  const startTime = moment(currentDate).set(parseTime(dayAvailability.start));
  const endTime = moment(currentDate).set(parseTime(dayAvailability.end));

  while (startTime.isBefore(endTime)) {
    const slotEndTime = moment(startTime).add(slotLength, 'minutes');

    if (!isLunchBreak(startTime, slotEndTime, dayAvailability.lunchBreak, currentDate)) {
      newSlots.push(createTimeSlot(currentDate, startTime, slotEndTime));
    }

    startTime.add(slotLength, 'minutes');
  }
}

function parseTime(timeString) {
  const [hours, minutes] = timeString.split(':').map(Number);
  return { hour: hours, minute: minutes, second: 0 };
}

function isLunchBreak(startTime, endTime, lunchBreak, currentDate) {
  if (!lunchBreak || !lunchBreak.enabled) return false;

  const lunchStart = moment(currentDate).set(parseTime(lunchBreak.start));
  const lunchEnd = moment(currentDate).set(parseTime(lunchBreak.end));

  return startTime.isBefore(lunchEnd) && endTime.isAfter(lunchStart);
}

function createTimeSlot(date, startTime, endTime) {
  return {
    id: `${date.format('YYYY-MM-DD')}-${startTime.format('HH:mm')}`,
    date: date.format('YYYY-MM-DD'),
    startTime: startTime.format('HH:mm'),
    endTime: endTime.format('HH:mm'),
    status: 'available'
  };
}

async function saveUpdatedTimeSlots(providerUserSub, timeSlots) {
  try {
    await TimeSlotModel.createOrUpdate(providerUserSub, timeSlots);
  } catch (error) {
    logger.error('Error saving updated time slots', { error: error.message, providerUserSub });
    throw new Error(`Failed to save updated time slots: ${error.message}`);
  }
}

function filterTimeSlots(timeSlots, startDate, endDate) {
  return timeSlots.filter(slot =>
    moment(slot.date).isBetween(startDate, endDate, null, '[]')
  );
}

module.exports = {
  fetchProviderData,
  getExistingTimeSlots,
  generateTimeSlots,
  saveUpdatedTimeSlots,
  filterTimeSlots
};

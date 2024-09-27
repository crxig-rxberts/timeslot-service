const moment = require('moment');
const axios = require('axios');
const {
  fetchProviderData,
  getExistingTimeSlots,
  generateTimeSlots,
  saveUpdatedTimeSlots,
  filterTimeSlots
} = require('../../../src/services/timeSlotHelper');
const timeSlotModel = require('../../../src/models/timeSlotModel');
const { NotFoundError } = require('../../../src/middleware/customErrors');

jest.mock('axios');
jest.mock('../../../src/models/timeSlotModel');
jest.mock('../../../src/utils/logger', () => ({
  error: jest.fn()
}));

describe('timeSlotHelper', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchProviderData', () => {
    it('should fetch provider data successfully', async () => {
      const mockProviderData = { id: '123', name: 'Test Provider' };
      axios.get.mockResolvedValue({ data: { data: mockProviderData } });

      const result = await fetchProviderData('provider123');
      expect(result).toEqual(mockProviderData);
      expect(axios.get).toHaveBeenCalledWith('http://localhost:3004/api/providers/provider123');
    });

    it('should throw NotFoundError when provider is not found', async () => {
      axios.get.mockRejectedValue(new Error('Not found'));

      await expect(fetchProviderData('nonexistent')).rejects.toThrow(NotFoundError);
    });
  });

  describe('getExistingTimeSlots', () => {
    it('should return existing time slots', async () => {
      const mockTimeSlots = { providerUserSub: 'provider123', timeSlots: [{ id: '1', date: '2023-01-01' }] };
      timeSlotModel.get.mockResolvedValue(mockTimeSlots);

      const result = await getExistingTimeSlots('provider123');
      expect(result).toEqual(mockTimeSlots);
    });

    it('should return empty time slots array if none exist', async () => {
      timeSlotModel.get.mockResolvedValue(null);

      const result = await getExistingTimeSlots('provider123');
      expect(result).toEqual({ providerUserSub: 'provider123', timeSlots: [] });
    });

    it('should throw an error if retrieval fails', async () => {
      timeSlotModel.get.mockRejectedValue(new Error('Database error'));

      await expect(getExistingTimeSlots('provider123')).rejects.toThrow('Failed to retrieve existing time slots');
    });
  });

  describe('generateTimeSlots', () => {
    const mockProviderData = {
      availability: {
        Monday: { start: '09:00', end: '17:00' },
        Tuesday: { start: '09:00', end: '17:00', lunchBreak: { enabled: true, start: '12:00', end: '13:00' } }
      },
      timeSlotLength: 60
    };

    it('should generate time slots correctly', () => {
      const startDate = moment('2023-01-02'); // A Monday
      const endDate = moment('2023-01-03'); // A Tuesday
      const existingSlots = [];

      const result = generateTimeSlots(mockProviderData, existingSlots, startDate, endDate);

      expect(result.length).toBe(15);

      const mondaySlots = result.filter(slot => slot.date === '2023-01-02');
      expect(mondaySlots.length).toBe(8);

      const tuesdaySlots = result.filter(slot => slot.date === '2023-01-03');
      expect(tuesdaySlots.length).toBe(7);

      // Check the first and last slots of each day
      expect(mondaySlots[0]).toEqual({
        id: '2023-01-02-09:00',
        date: '2023-01-02',
        startTime: '09:00',
        endTime: '10:00',
        status: 'available'
      });
      expect(mondaySlots[7]).toEqual({
        id: '2023-01-02-16:00',
        date: '2023-01-02',
        startTime: '16:00',
        endTime: '17:00',
        status: 'available'
      });
      expect(tuesdaySlots[0]).toEqual({
        id: '2023-01-03-09:00',
        date: '2023-01-03',
        startTime: '09:00',
        endTime: '10:00',
        status: 'available'
      });
      expect(tuesdaySlots[6]).toEqual({
        id: '2023-01-03-16:00',
        date: '2023-01-03',
        startTime: '16:00',
        endTime: '17:00',
        status: 'available'
      });

      // Verify that there's no slot during lunch break on Tuesday
      expect(tuesdaySlots.find(slot => slot.startTime === '12:00')).toBeUndefined();
    });
  });

  describe('saveUpdatedTimeSlots', () => {
    it('should save time slots successfully', async () => {
      const mockTimeSlots = [{ id: '1', date: '2023-01-01' }];
      timeSlotModel.createOrUpdate.mockResolvedValue(undefined);

      await expect(saveUpdatedTimeSlots('provider123', mockTimeSlots)).resolves.not.toThrow();
      expect(timeSlotModel.createOrUpdate).toHaveBeenCalledWith('provider123', mockTimeSlots);
    });

    it('should throw an error if saving fails', async () => {
      timeSlotModel.createOrUpdate.mockRejectedValue(new Error('Database error'));

      await expect(saveUpdatedTimeSlots('provider123', [])).rejects.toThrow('Failed to save updated time slots');
    });
  });

  describe('filterTimeSlots', () => {
    const mockTimeSlots = [
      { date: '2023-01-01' },
      { date: '2023-01-02' },
      { date: '2023-01-03' },
      { date: '2023-01-04' },
      { date: '2023-01-05' }
    ];

    it('should filter time slots correctly', () => {
      const startDate = moment('2023-01-02');
      const endDate = moment('2023-01-04');

      const result = filterTimeSlots(mockTimeSlots, startDate, endDate);

      expect(result.length).toBe(3);
      expect(result[0].date).toBe('2023-01-02');
      expect(result[2].date).toBe('2023-01-04');
    });

    it('should include start and end dates in the filter', () => {
      const startDate = moment('2023-01-01');
      const endDate = moment('2023-01-05');

      const result = filterTimeSlots(mockTimeSlots, startDate, endDate);

      expect(result.length).toBe(5);
    });

    it('should return empty array if no slots match the date range', () => {
      const startDate = moment('2023-01-06');
      const endDate = moment('2023-01-07');

      const result = filterTimeSlots(mockTimeSlots, startDate, endDate);

      expect(result.length).toBe(0);
    });
  });
});

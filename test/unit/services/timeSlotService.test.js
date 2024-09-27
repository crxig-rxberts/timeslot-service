const timeSlotService = require('../../../src/services/timeSlotService');
const timeSlotHelper = require('../../../src/services/timeSlotHelper');
const timeSlotModel = require('../../../src/models/timeSlotModel');
const { NotFoundError } = require('../../../src/middleware/customErrors');

jest.mock('../../../src/services/timeSlotHelper');
jest.mock('../../../src/models/timeSlotModel');
jest.mock('../../../src/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn()
}));

describe('TimeSlotService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getTimeSlots', () => {
    it('should retrieve and update time slots successfully', async () => {
      const mockProviderData = { id: 'provider123', name: 'Test Provider' };
      const mockExistingTimeSlots = {
        providerUserSub: 'provider123',
        timeSlots: [{ id: '1', date: '2023-01-01' }]
      };
      const mockNewTimeSlots = [{ id: '2', date: '2023-01-02' }];

      timeSlotHelper.fetchProviderData.mockResolvedValue(mockProviderData);
      timeSlotHelper.getExistingTimeSlots.mockResolvedValue(mockExistingTimeSlots);
      timeSlotHelper.generateTimeSlots.mockReturnValue(mockNewTimeSlots);
      timeSlotHelper.filterTimeSlots.mockReturnValue([...mockExistingTimeSlots.timeSlots, ...mockNewTimeSlots]);

      const result = await timeSlotService.getTimeSlots('provider123');

      expect(result).toEqual({
        providerUserSub: 'provider123',
        timeSlots: [{ id: '1', date: '2023-01-01' }, { id: '2', date: '2023-01-02' }]
      });
      expect(timeSlotHelper.saveUpdatedTimeSlots).toHaveBeenCalledWith('provider123', expect.any(Array));
    });

    it('should handle errors and log them', async () => {
      const mockError = new Error('Test error');
      timeSlotHelper.fetchProviderData.mockRejectedValue(mockError);

      await expect(timeSlotService.getTimeSlots('provider123')).rejects.toThrow('Test error');
    });
  });

  describe('updateTimeSlot', () => {
    it('should update a time slot successfully', async () => {
      const mockUpdatedSlot = { id: '1', status: 'booked' };
      timeSlotModel.updateSlot.mockResolvedValue(mockUpdatedSlot);

      const result = await timeSlotService.updateTimeSlot('provider123', '1', 'booked', 'service1');

      expect(result).toEqual(mockUpdatedSlot);
      expect(timeSlotModel.updateSlot).toHaveBeenCalledWith('provider123', '1', 'booked', 'service1');
    });

    it('should throw NotFoundError when time slot is not found', async () => {
      const mockError = new Error('ConditionalCheckFailedException');
      mockError.code = 'ConditionalCheckFailedException';
      timeSlotModel.updateSlot.mockRejectedValue(mockError);

      await expect(timeSlotService.updateTimeSlot('provider123', '1', 'booked', 'service1'))
        .rejects.toThrow(NotFoundError);
    });

    it('should handle and log other errors', async () => {
      const mockError = new Error('Database error');
      timeSlotModel.updateSlot.mockRejectedValue(mockError);

      await expect(timeSlotService.updateTimeSlot('provider123', '1', 'booked', 'service1'))
        .rejects.toThrow('Database error');
    });
  });
});

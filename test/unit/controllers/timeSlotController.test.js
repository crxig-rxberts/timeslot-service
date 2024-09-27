const timeSlotController = require('../../../src/controllers/timeSlotController');
const timeSlotService = require('../../../src/services/timeSlotService');
const { formatResponse } = require('../../../src/utils/responseFormatter');

jest.mock('../../../src/services/timeSlotService');
jest.mock('../../../src/utils/responseFormatter');

describe('TimeSlotController', () => {
  let mockRequest;
  let mockResponse;
  let mockNext;

  beforeEach(() => {
    mockRequest = {
      params: {},
      body: {}
    };
    mockResponse = {
      json: jest.fn()
    };
    mockNext = jest.fn();
    formatResponse.mockImplementation((message, data) => ({ message, data }));
  });

  describe('getTimeSlots', () => {
    it('should get time slots successfully', async () => {
      const mockResult = { timeSlots: [] };
      mockRequest.params.providerUserSub = 'testProvider';
      timeSlotService.getTimeSlots.mockResolvedValue(mockResult);

      await timeSlotController.getTimeSlots(mockRequest, mockResponse, mockNext);

      expect(timeSlotService.getTimeSlots).toHaveBeenCalledWith('testProvider');
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Time slots retrieved successfully',
        data: mockResult
      });
    });

    it('should handle errors', async () => {
      const mockError = new Error('Test error');
      mockRequest.params.providerUserSub = 'testProvider';
      timeSlotService.getTimeSlots.mockRejectedValue(mockError);

      await timeSlotController.getTimeSlots(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith(mockError);
    });
  });

  describe('updateTimeSlot', () => {
    it('should update time slot successfully', async () => {
      const mockResult = { id: '1', status: 'booked' };
      mockRequest.params = { providerUserSub: 'testProvider', slotId: '1' };
      mockRequest.body = { status: 'booked', serviceId: 'service1' };
      timeSlotService.updateTimeSlot.mockResolvedValue(mockResult);

      await timeSlotController.updateTimeSlot(mockRequest, mockResponse, mockNext);

      expect(timeSlotService.updateTimeSlot).toHaveBeenCalledWith('testProvider', '1', 'booked', 'service1');
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Time slot updated successfully',
        data: mockResult
      });
    });

    it('should handle errors', async () => {
      const mockError = new Error('Test error');
      mockRequest.params = { providerUserSub: 'testProvider', slotId: '1' };
      mockRequest.body = { status: 'booked', serviceId: 'service1' };
      timeSlotService.updateTimeSlot.mockRejectedValue(mockError);

      await timeSlotController.updateTimeSlot(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith(mockError);
    });
  });
});

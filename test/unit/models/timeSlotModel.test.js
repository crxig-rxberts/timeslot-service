const { docClient, TABLE_NAME } = require('../../../src/config/dynamodb');
const TimeSlotModel = require('../../../src/models/timeSlotModel');

// Mock the DynamoDB DocumentClient
jest.mock('../../../src/config/dynamodb', () => ({
  docClient: {
    put: jest.fn().mockReturnThis(),
    get: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    promise: jest.fn()
  },
  TABLE_NAME: 'mock-table-name'
}));

describe('TimeSlotModel', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createOrUpdate', () => {
    it('should create or update time slots successfully', async () => {
      const providerUserSub = 'testProvider';
      const timeSlots = [{ id: '1', date: '2023-01-01' }];

      docClient.promise.mockResolvedValue({});

      const result = await TimeSlotModel.createOrUpdate(providerUserSub, timeSlots);

      expect(docClient.put).toHaveBeenCalledWith({
        TableName: TABLE_NAME,
        Item: {
          providerUserSub,
          lastUpdated: expect.any(String),
          timeSlots
        }
      });
      expect(result).toEqual({
        providerUserSub,
        lastUpdated: expect.any(String),
        timeSlots
      });
    });

    it('should throw an error if DynamoDB put operation fails', async () => {
      const providerUserSub = 'testProvider';
      const timeSlots = [{ id: '1', date: '2023-01-01' }];

      const mockError = new Error('DynamoDB error');
      docClient.promise.mockRejectedValue(mockError);

      await expect(TimeSlotModel.createOrUpdate(providerUserSub, timeSlots)).rejects.toThrow('DynamoDB error');
    });
  });

  describe('get', () => {
    it('should get time slots successfully', async () => {
      const providerUserSub = 'testProvider';
      const mockItem = { providerUserSub, timeSlots: [{ id: '1', date: '2023-01-01' }] };

      docClient.promise.mockResolvedValue({ Item: mockItem });

      const result = await TimeSlotModel.get(providerUserSub);

      expect(docClient.get).toHaveBeenCalledWith({
        TableName: TABLE_NAME,
        Key: { providerUserSub }
      });
      expect(result).toEqual(mockItem);
    });

    it('should return null if item is not found', async () => {
      const providerUserSub = 'testProvider';

      docClient.promise.mockResolvedValue({});

      const result = await TimeSlotModel.get(providerUserSub);

      expect(result).toBeNull();
    });

    it('should throw an error if DynamoDB get operation fails', async () => {
      const providerUserSub = 'testProvider';

      const mockError = new Error('DynamoDB error');
      docClient.promise.mockRejectedValue(mockError);

      await expect(TimeSlotModel.get(providerUserSub)).rejects.toThrow('DynamoDB error');
    });
  });

  describe('updateSlot', () => {
    it('should update a specific time slot successfully', async () => {
      const providerUserSub = 'testProvider';
      const slotId = '1';
      const status = 'booked';
      const serviceId = 'service1';

      const mockCurrentItem = {
        Item: {
          providerUserSub,
          timeSlots: [{ id: '1', status: 'available' }]
        }
      };
      const mockUpdatedItem = {
        Attributes: {
          providerUserSub,
          timeSlots: [{ id: '1', status: 'booked', serviceId: 'service1' }]
        }
      };

      docClient.promise.mockResolvedValueOnce(mockCurrentItem).mockResolvedValueOnce(mockUpdatedItem);

      const result = await TimeSlotModel.updateSlot(providerUserSub, slotId, status, serviceId);

      expect(docClient.get).toHaveBeenCalledWith({
        TableName: TABLE_NAME,
        Key: { providerUserSub }
      });
      expect(docClient.update).toHaveBeenCalledWith(expect.objectContaining({
        TableName: TABLE_NAME,
        Key: { providerUserSub },
        UpdateExpression: expect.stringContaining('SET timeSlots[0].#statusAttr = :status'),
        ExpressionAttributeValues: expect.objectContaining({
          ':status': status,
          ':serviceId': serviceId
        })
      }));
      expect(result).toEqual(mockUpdatedItem.Attributes);
    });

    it('should throw an error if time slots are not found for the provider', async () => {
      const providerUserSub = 'testProvider';
      const slotId = '1';
      const status = 'booked';
      const serviceId = 'service1';

      docClient.promise.mockResolvedValueOnce({});

      await expect(TimeSlotModel.updateSlot(providerUserSub, slotId, status, serviceId))
        .rejects.toThrow('Time slots not found for the provider');
    });

    it('should throw an error if the specific slot is not found', async () => {
      const providerUserSub = 'testProvider';
      const slotId = 'nonexistent';
      const status = 'booked';
      const serviceId = 'service1';

      const mockCurrentItem = {
        Item: {
          providerUserSub,
          timeSlots: [{ id: '1', status: 'available' }]
        }
      };

      docClient.promise.mockResolvedValueOnce(mockCurrentItem);

      await expect(TimeSlotModel.updateSlot(providerUserSub, slotId, status, serviceId))
        .rejects.toThrow('Slot not found');
    });

    it('should throw an error if DynamoDB update operation fails', async () => {
      const providerUserSub = 'testProvider';
      const slotId = '1';
      const status = 'booked';
      const serviceId = 'service1';

      const mockCurrentItem = {
        Item: {
          providerUserSub,
          timeSlots: [{ id: '1', status: 'available' }]
        }
      };

      const mockError = new Error('DynamoDB error');
      docClient.promise.mockResolvedValueOnce(mockCurrentItem).mockRejectedValueOnce(mockError);

      await expect(TimeSlotModel.updateSlot(providerUserSub, slotId, status, serviceId))
        .rejects.toThrow('DynamoDB error');
    });
  });
});

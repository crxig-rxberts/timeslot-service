const errorHandler = require('../../../src/middleware/errorHandler');
const { ValidationError, NotFoundError, ConflictError, UnauthorizedError} = require('../../../src/middleware/customErrors');
const { formatResponse } = require('../../../src/utils/responseFormatter');
const logger = require('../../../src/utils/logger');

jest.mock('../../../src/utils/responseFormatter');
jest.mock('../../../src/utils/logger');

describe('errorHandler', () => {
  let mockRequest;
  let mockResponse;
  let mockNext;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
    formatResponse.mockImplementation((message) => ({ message }));
  });

  it('should handle ValidationError', () => {
    const error = new ValidationError('Invalid input');
    errorHandler(error, mockRequest, mockResponse, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Invalid input' });
  });

  it('should handle NotFoundError', () => {
    const error = new NotFoundError('Resource not found');
    errorHandler(error, mockRequest, mockResponse, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Resource not found' });
  });

  it('should handle ConflictError', () => {
    const error = new ConflictError('Conflict occurred');
    errorHandler(error, mockRequest, mockResponse, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(409);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Conflict occurred' });
  });

  it('should handle UnauthorizedError', () => {
    const error = new UnauthorizedError('UnauthorizedError occurred');
    errorHandler(error, mockRequest, mockResponse, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'UnauthorizedError occurred' });
  });

  it('should handle unknown errors', () => {
    const error = new Error('Unknown error');
    errorHandler(error, mockRequest, mockResponse, mockNext);

    expect(logger.error).toHaveBeenCalledWith('Unknown Error caught by middleware', { error });
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Internal server error' });
  });
});

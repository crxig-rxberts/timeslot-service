const authFilter = require('../../../src/middleware/authFilter');
const { UnauthorizedError } = require('../../../src/middleware/customErrors');
const { verifyToken } = require('../../../src/client/authClient');

jest.mock('../../../src/client/authClient', () => ({
  verifyToken: jest.fn()
}));

describe('authFilter', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = {
      headers: {}
    };
    mockRes = {};
    mockNext = jest.fn();
  });

  it('should call next() with UnauthorizedError if no authorization header is provided', async () => {
    await authFilter(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    expect(mockNext.mock.calls[0][0].message).toBe('No authorization header provided');
  });

  it('should call next() without error if token is valid', async () => {
    mockReq.headers.authorization = 'Bearer validtoken';
    verifyToken.mockResolvedValue({ success: true });

    await authFilter(mockReq, mockRes, mockNext);

    expect(verifyToken).toHaveBeenCalledWith('validtoken');
    expect(mockNext).toHaveBeenCalledWith();
    expect(mockReq.accessToken).toBe('validtoken');
    expect(mockNext).not.toHaveBeenCalledWith(expect.any(UnauthorizedError));
  });

  it('should call next() with UnauthorizedError if token is invalid', async () => {
    mockReq.headers.authorization = 'Bearer invalidtoken';
    verifyToken.mockResolvedValue({ success: false });

    await authFilter(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    expect(mockNext.mock.calls[0][0].message).toBe('Invalid access token');
  });

  it('should call next() with UnauthorizedError if verifyToken throws an error with response', async () => {
    mockReq.headers.authorization = 'Bearer errortoken';
    const error = new Error('Token verification failed');
    error.response = { data: { message: 'Custom error message' } };
    verifyToken.mockRejectedValue(error);

    await authFilter(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    expect(mockNext.mock.calls[0][0].message).toBe('Custom error message');
  });

  it('should call next() with UnauthorizedError if verifyToken throws an error with request but no response', async () => {
    mockReq.headers.authorization = 'Bearer errortoken';
    const error = new Error('No response');
    error.request = {};
    verifyToken.mockRejectedValue(error);

    await authFilter(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    expect(mockNext.mock.calls[0][0].message).toBe('No response received from authentication server');
  });

  it('should call next() with UnauthorizedError for any other error during authentication', async () => {
    mockReq.headers.authorization = 'Bearer errortoken';
    verifyToken.mockRejectedValue(new Error('Unknown error'));

    await authFilter(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    expect(mockNext.mock.calls[0][0].message).toBe('Error occurred during authentication');
  });
});

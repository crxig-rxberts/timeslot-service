const logger = require('../utils/logger');
const { formatResponse } = require('../utils/responseFormatter');
const { ValidationError, NotFoundError, ConflictError, UnauthorizedError} = require('./customErrors');

function errorHandler(err, req, res, next) {
  if (err instanceof ValidationError || err instanceof NotFoundError || err instanceof ConflictError || err instanceof UnauthorizedError) {
    return res.status(err.statusCode).json(formatResponse(err.message, null, false));
  }

  logger.error('Unknown Error caught by middleware', { error: err });
  res.status(500).json(formatResponse('Internal server error', null, false));
}

module.exports = errorHandler;

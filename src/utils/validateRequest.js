const { formatResponse } = require('./responseFormatter');

function validateRequest(schema) {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json(formatResponse(error.details[0].message, null, false));
    }
    next();
  };
}

module.exports = validateRequest;

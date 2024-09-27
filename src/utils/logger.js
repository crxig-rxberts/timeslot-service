const winston = require('winston');
const { format } = winston;
const { combine, timestamp, printf, colorize, align } = format;

// Custom log levels with colors
const customLevels = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    verbose: 4,
    debug: 5,
    silly: 6
  },
  colors: {
    error: 'red',
    warn: 'yellow',
    info: 'blue',
    http: 'magenta',
    verbose: 'cyan',
    debug: 'green',
    silly: 'gray'
  }
};

// Custom format
const customFormat = printf(({ level, message, timestamp, ...rest }) => {
  let logMessage = `${timestamp} [${level}]: ${message}`;

  // Add any additional properties
  if (Object.keys(rest).length > 0) {
    logMessage += '\n' + JSON.stringify(rest, null, 2);
  }

  return logMessage;
});

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  levels: customLevels.levels,
  format: combine(
    colorize({ all: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    align(),
    customFormat
  ),
  transports: [
    new winston.transports.Console({
      stderrLevels: ['error']
    })
  ]
});

// Add colors to Winston
winston.addColors(customLevels.colors);

module.exports = logger;

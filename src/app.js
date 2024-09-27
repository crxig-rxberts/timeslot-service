const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const timeSlotRoutes = require('./routes/timeSlotRoutes');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/timeslots', timeSlotRoutes);

app.use(errorHandler);

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Not found' });
});

app.use((err, req, res, next) => {
  logger.error('Unhandled error', { error: err });
  res.status(500).json({ success: false, message: 'Internal server error' });
});

module.exports = app;

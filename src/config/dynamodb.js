const AWS = require('aws-sdk');
const logger = require('../utils/logger');

AWS.config.update({
  region: process.env.AWS_REGION || 'dummy',
  endpoint: process.env.AWS_ENDPOINT || 'http://localhost:8000',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'dummy',
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'dummy'
});

const dynamoDB = new AWS.DynamoDB();
const docClient = new AWS.DynamoDB.DocumentClient();

const TABLE_NAME = 'time-slot-data';

async function initializeDynamoDB() {
  const params = {
    TableName: TABLE_NAME,
    KeySchema: [{ AttributeName: 'providerUserSub', KeyType: 'HASH' }],
    AttributeDefinitions: [{ AttributeName: 'providerUserSub', AttributeType: 'S' }],
    BillingMode: 'PAY_PER_REQUEST'
  };

  try {
    logger.info('Creating Table');

    await dynamoDB.createTable(params).promise();
    logger.info('DynamoDB table created successfully');
  } catch (error) {
    if (error.code === 'ResourceInUseException') {
      logger.info('DynamoDB table already exists');
    } else {
      throw error;
    }
  }
}

module.exports = {
  docClient,
  TABLE_NAME,
  initializeDynamoDB
};

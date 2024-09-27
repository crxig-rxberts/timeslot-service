const { docClient, TABLE_NAME } = require('../config/dynamodb');

class TimeSlotModel {
  async createOrUpdate(providerUserSub, timeSlots) {
    const params = {
      TableName: TABLE_NAME,
      Item: {
        providerUserSub,
        lastUpdated: new Date().toISOString(),
        timeSlots
      }
    };

    await docClient.put(params).promise();
    return params.Item;
  }

  async get(providerUserSub) {
    const params = {
      TableName: TABLE_NAME,
      Key: { providerUserSub }
    };

    const result = await docClient.get(params).promise();
    if (!result.Item) return null;

    return result.Item;
  }

  async updateSlot(providerUserSub, slotId, status, serviceId) {
    // First, get the current item
    const getParams = {
      TableName: TABLE_NAME,
      Key: { providerUserSub }
    };

    const currentItem = await docClient.get(getParams).promise();

    if (!currentItem.Item || !currentItem.Item.timeSlots) {
      throw new Error('Time slots not found for the provider');
    }

    // Find the index of the slot to update
    const slotIndex = currentItem.Item.timeSlots.findIndex(slot => slot.id === slotId);

    if (slotIndex === -1) {
      throw new Error('Slot not found');
    }

    // Update the specific slot
    const updateParams = {
      TableName: TABLE_NAME,
      Key: { providerUserSub },
      UpdateExpression: `SET timeSlots[${slotIndex}].#statusAttr = :status, 
                                   timeSlots[${slotIndex}].#serviceIdAttr = :serviceId, 
                                   #lastUpdatedAttr = :lastUpdated`,
      ExpressionAttributeNames: {
        '#statusAttr': 'status',
        '#serviceIdAttr': 'serviceId',
        '#lastUpdatedAttr': 'lastUpdated'
      },
      ExpressionAttributeValues: {
        ':status': status,
        ':serviceId': serviceId,
        ':lastUpdated': new Date().toISOString()
      },
      ReturnValues: 'ALL_NEW'
    };

    const result = await docClient.update(updateParams).promise();
    return result.Attributes;
  }
}

module.exports = new TimeSlotModel();

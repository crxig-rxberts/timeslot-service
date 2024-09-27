const { updateTimeSlot } = require('../../../src/schemas/timeSlotSchemas');

describe('timeSlotSchemas', () => {
  describe('updateTimeSlot', () => {
    it('should validate correct input', () => {
      const validInput = { status: 'booked', serviceId: 'service1' };
      const { error } = updateTimeSlot.validate(validInput);
      expect(error).toBeUndefined();
    });

    it('should allow null serviceId', () => {
      const validInput = { status: 'blocked', serviceId: null };
      const { error } = updateTimeSlot.validate(validInput);
      expect(error).toBeUndefined();
    });

    it('should reject invalid status', () => {
      const invalidInput = { status: 'invalid', serviceId: 'service1' };
      const { error } = updateTimeSlot.validate(invalidInput);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('"status" must be one of [available, booked, blocked]');
    });

    it('should reject missing status', () => {
      const invalidInput = { serviceId: 'service1' };
      const { error } = updateTimeSlot.validate(invalidInput);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('"status" is required');
    });

    it('should reject invalid serviceId type', () => {
      const invalidInput = { status: 'booked', serviceId: 123 };
      const { error } = updateTimeSlot.validate(invalidInput);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('"serviceId" must be a string');
    });
  });
});

import { BuyerSchema, CSVRowSchema } from '@/lib/validations/buyer';

describe('Buyer Validation Tests', () => {
  describe('CSV Row Validation', () => {
    it('should validate a valid CSV row', () => {
      const validRow = {
        fullName: 'John Doe',
        email: 'john@example.com',
        phone: '9876543210',
        city: 'Chandigarh',
        propertyType: 'Apartment',
        bhk: '2',
        purpose: 'Buy',
        budgetMin: '2000000',
        budgetMax: '5000000',
        timeline: '0-3m',
        source: 'Website',
        notes: 'Looking for 2BHK',
        tags: 'premium,urgent',
        status: 'New'
      };

      const result = CSVRowSchema.parse(validRow);
      expect(result.fullName).toBe('John Doe');
      expect(result.budgetMin).toBe(2000000);
      expect(result.tags).toEqual(['premium', 'urgent']);
    });

    it('should handle empty optional fields', () => {
      const rowWithEmptyFields = {
        fullName: 'Jane Smith',
        email: '',
        phone: '9876543211',
        city: 'Mohali',
        propertyType: 'Plot',
        bhk: '',
        purpose: 'Buy',
        budgetMin: '',
        budgetMax: '',
        timeline: '3-6m',
        source: 'Referral',
        notes: '',
        tags: '',
        status: ''
      };

      const result = CSVRowSchema.parse(rowWithEmptyFields);
      expect(result.email).toBeUndefined();
      expect(result.bhk).toBeUndefined();
      expect(result.budgetMin).toBeUndefined();
      expect(result.status).toBe('New');
    });
  });

  describe('Budget Validation', () => {
    it('should validate budget range correctly', () => {
      const validBudget = {
        fullName: 'Test User',
        phone: '9876543210',
        city: 'Chandigarh',
        propertyType: 'Apartment',
        bhk: '2',
        purpose: 'Buy',
        budgetMin: 1000000,
        budgetMax: 2000000,
        timeline: '0-3m',
        source: 'Website',
        status: 'New'
      };

      expect(() => BuyerSchema.parse(validBudget)).not.toThrow();
    });

    it('should reject when budgetMax is less than budgetMin', () => {
      const invalidBudget = {
        fullName: 'Test User',
        phone: '9876543210',
        city: 'Chandigarh',
        propertyType: 'Apartment',
        bhk: '2',
        purpose: 'Buy',
        budgetMin: 2000000,
        budgetMax: 1000000,
        timeline: '0-3m',
        source: 'Website',
        status: 'New'
      };

      expect(() => BuyerSchema.parse(invalidBudget)).toThrow();
    });
  });

  describe('Phone Number Validation', () => {
    it('should accept valid phone numbers', () => {
      const validPhones = ['9876543210', '919876543210', '123456789012345'];
      
      validPhones.forEach(phone => {
        const data = {
          fullName: 'Test User',
          phone,
          city: 'Chandigarh',
          propertyType: 'Plot',
          purpose: 'Buy',
          timeline: '0-3m',
          source: 'Website',
          status: 'New'
        };
        
        expect(() => BuyerSchema.parse(data)).not.toThrow();
      });
    });

    it('should reject invalid phone numbers', () => {
      const invalidPhones = ['123', '987654321', 'abcdefghij', '98765432101234567'];
      
      invalidPhones.forEach(phone => {
        const data = {
          fullName: 'Test User',
          phone,
          city: 'Chandigarh',
          propertyType: 'Plot',
          purpose: 'Buy',
          timeline: '0-3m',
          source: 'Website',
          status: 'New'
        };
        
        expect(() => BuyerSchema.parse(data)).toThrow();
      });
    });
  });

  describe('BHK Requirement Validation', () => {
    it('should require BHK for Apartment and Villa', () => {
      const apartmentWithoutBHK = {
        fullName: 'Test User',
        phone: '9876543210',
        city: 'Chandigarh',
        propertyType: 'Apartment',
        purpose: 'Buy',
        timeline: '0-3m',
        source: 'Website',
        status: 'New'
      };

      expect(() => BuyerSchema.parse(apartmentWithoutBHK)).toThrow('BHK is required');
    });

    it('should not require BHK for Plot, Office, Retail', () => {
      const plotWithoutBHK = {
        fullName: 'Test User',
        phone: '9876543210',
        city: 'Chandigarh',
        propertyType: 'Plot',
        purpose: 'Buy',
        timeline: '0-3m',
        source: 'Website',
        status: 'New'
      };

      expect(() => BuyerSchema.parse(plotWithoutBHK)).not.toThrow();
    });
  });
});

import { z } from 'zod';

const BaseBuyerSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(80, 'Name must be less than 80 characters'),
  email: z.string().email('Invalid email address').optional().or(z.literal('').transform(() => undefined)),
  phone: z.string().regex(/^\d{10,15}$/, 'Phone must be 10-15 digits'),
  city: z.enum(['Chandigarh', 'Mohali', 'Zirakpur', 'Panchkula', 'Other']),
  propertyType: z.enum(['Apartment', 'Villa', 'Plot', 'Office', 'Retail']),
  bhk: z.enum(['1', '2', '3', '4', 'Studio']).optional(),
  purpose: z.enum(['Buy', 'Rent']),
  budgetMin: z.number().int().positive('Budget must be positive').optional(),
  budgetMax: z.number().int().positive('Budget must be positive').optional(),
  timeline: z.enum(['0-3m', '3-6m', '>6m', 'Exploring']),
  source: z.enum(['Website', 'Referral', 'Walk-in', 'Call', 'Other']),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(['New', 'Qualified', 'Contacted', 'Visited', 'Negotiation', 'Converted', 'Dropped']).default('New')
});

export const BuyerSchema = BaseBuyerSchema.refine(data => {
  if (data.budgetMin && data.budgetMax) {
    return data.budgetMax >= data.budgetMin;
  }
  return true;
}, { 
  message: "Budget max must be greater than or equal to budget min",
  path: ['budgetMax']
}).refine(data => {
  if (['Apartment', 'Villa'].includes(data.propertyType)) {
    return !!data.bhk;
  }
  return true;
}, { 
  message: "BHK is required for Apartment and Villa property types",
  path: ['bhk']
});

export const BuyerUpdateSchema = BaseBuyerSchema.partial().extend({
  id: z.string().uuid(),
  updatedAt: z.string().datetime().optional(),
});

export const BuyerFilterSchema = z.object({
  city: z.enum(['Chandigarh', 'Mohali', 'Zirakpur', 'Panchkula', 'Other']).optional(),
  propertyType: z.enum(['Apartment', 'Villa', 'Plot', 'Office', 'Retail']).optional(),
  status: z.enum(['New', 'Qualified', 'Contacted', 'Visited', 'Negotiation', 'Converted', 'Dropped']).optional(),
  timeline: z.enum(['0-3m', '3-6m', '>6m', 'Exploring']).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
});

export const CSVRowSchema = z.object({
  fullName: z.string().min(2).max(80),
  email: z.string().email().optional().or(z.literal('')).transform(val => val === '' ? undefined : val),
  phone: z.string().regex(/^\d{10,15}$/),
  city: z.enum(['Chandigarh', 'Mohali', 'Zirakpur', 'Panchkula', 'Other']),
  propertyType: z.enum(['Apartment', 'Villa', 'Plot', 'Office', 'Retail']),
  bhk: z.enum(['1', '2', '3', '4', 'Studio', '']).transform(val => val === '' ? undefined : val),
  purpose: z.enum(['Buy', 'Rent']),
  budgetMin: z.string().transform(val => val ? parseInt(val) : undefined),
  budgetMax: z.string().transform(val => val ? parseInt(val) : undefined),
  timeline: z.enum(['0-3m', '3-6m', '>6m', 'Exploring']),
  source: z.enum(['Website', 'Referral', 'Walk-in', 'Call', 'Other']),
  notes: z.string().max(1000).optional().transform(val => val === '' ? undefined : val),
  tags: z.string().transform(val => val ? val.split(',').map(t => t.trim()).filter(Boolean) : undefined),
  status: z.enum(['New', 'Qualified', 'Contacted', 'Visited', 'Negotiation', 'Converted', 'Dropped', '']).transform(val => val === '' ? 'New' : val)
});

export type BuyerFormData = z.infer<typeof BuyerSchema>;
export type BuyerUpdateData = z.infer<typeof BuyerUpdateSchema>;
export type BuyerFilter = z.infer<typeof BuyerFilterSchema>;
export type CSVRow = z.input<typeof CSVRowSchema>;

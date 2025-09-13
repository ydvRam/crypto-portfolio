const { z } = require('zod');

// Add asset validation - simplified without regex
const addAssetValidation = z.object({
  portfolioId: z.string().min(1, 'Portfolio ID is required'),
  type: z.enum([
    'stock',
    'crypto',
    'bond',
    'etf',
    'mutual-fund',
    'real-estate',
    'commodity',
    'other'
  ]),
  symbol: z.string().min(1, 'Symbol is required').max(20, 'Symbol too long'),
  quantity: z.number().positive('Quantity must be positive'),
  purchasePrice: z.number().positive('Price must be positive'),
  purchaseDate: z.union([
    z.string().transform((val) => {
      if (val === '' || val === null || val === undefined) return undefined;
      return new Date(val);
    }),
    z.date()
  ]).optional(),
  notes: z.string().max(500, 'Notes too long').optional(),
  tags: z.union([
    z.string().transform((val) => {
      if (val === '' || val === null || val === undefined) return [];
      return val.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    }),
    z.array(z.string()).max(10)
  ]).optional()
});

// Update asset validation - simplified without regex
const updateAssetValidation = z.object({
  type: z.enum([
    'stock',
    'crypto',
    'bond',
    'etf',
    'mutual-fund',
    'real-estate',
    'commodity',
    'other'
  ]).optional(),
  symbol: z.string().min(1, 'Symbol is required').max(20, 'Symbol too long').optional(),
  quantity: z.number().positive('Quantity must be positive').optional(),
  purchasePrice: z.number().positive('Price must be positive').optional(),
  purchaseDate: z.union([
    z.string().transform((val) => {
      if (val === '' || val === null || val === undefined) return undefined;
      return new Date(val);
    }),
    z.date()
  ]).optional(),
  notes: z.string().max(500, 'Notes too long').optional(),
  tags: z.union([
    z.string().transform((val) => {
      if (val === '' || val === null || val === undefined) return [];
      return val.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    }),
    z.array(z.string()).max(10)
  ]).optional()
});

module.exports = {
  addAssetValidation,
  updateAssetValidation
};

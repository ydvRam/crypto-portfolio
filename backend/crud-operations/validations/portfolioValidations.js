const { z } = require('zod');

// Create portfolio validation - simplified without regex
const createPortfolioValidation = z.object({
  name: z.string()
    .min(1, 'Portfolio name is required')
    .max(100, 'Portfolio name too long'),
  description: z.string()
    .max(500, 'Description too long')
    .optional(),
  isPublic: z.boolean().optional(),
  riskTolerance: z.enum(['conservative', 'moderate', 'aggressive']).optional(),
  investmentGoal: z.enum(['growth', 'income', 'preservation', 'speculation', 'balanced']).optional(),
  targetReturn: z.union([
    z.string().transform((val) => {
      if (val === '' || val === null || val === undefined) return undefined;
      const num = parseFloat(val);
      if (isNaN(num)) throw new Error('Target return must be a valid number');
      return num;
    }),
    z.number()
  ])
    .refine((val) => val === undefined || (val >= 0 && val <= 100), {
      message: 'Target return must be between 0 and 100%'
    })
    .optional()
});

// Update portfolio validation - simplified without regex
const updatePortfolioValidation = z.object({
  name: z.string()
    .min(1, 'Portfolio name is required')
    .max(100, 'Portfolio name too long')
    .optional(),
  description: z.string()
    .max(500, 'Description too long')
    .optional(),
  isPublic: z.boolean().optional(),
  riskTolerance: z.enum(['conservative', 'moderate', 'aggressive']).optional(),
  investmentGoal: z.enum(['growth', 'income', 'preservation', 'speculation', 'balanced']).optional(),
  targetReturn: z.union([
    z.string().transform((val) => {
      if (val === '' || val === null || val === undefined) return undefined;
      const num = parseFloat(val);
      if (isNaN(num)) throw new Error('Target return must be a valid number');
      return num;
    }),
    z.number()
  ])
    .refine((val) => val === undefined || (val >= 0 && val <= 100), {
      message: 'Target return must be between 0 and 100%'
    })
    .optional()
});

module.exports = {
  createPortfolioValidation,
  updatePortfolioValidation
};

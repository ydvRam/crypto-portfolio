const { z } = require('zod');

// User registration validation - simplified without regex
const registerValidation = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be less than 30 characters'),
  email: z.string()
    .email('Please provide a valid email address')
    .min(5, 'Email must be at least 5 characters')
    .max(50, 'Email must be less than 50 characters'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password must be less than 100 characters')
});

// User login validation - simplified without regex
const loginValidation = z.object({
  email: z.string()
    .email('Please provide a valid email address'),
  password: z.string()
    .min(1, 'Password is required')
});

// User profile update validation - simplified without regex
const updateProfileValidation = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be less than 30 characters')
    .optional(),
  email: z.string()
    .email('Please provide a valid email address')
    .min(5, 'Email must be at least 5 characters')
    .max(50, 'Email must be less than 50 characters')
    .optional()
});

module.exports = {
  registerValidation,
  loginValidation,
  updateProfileValidation
};

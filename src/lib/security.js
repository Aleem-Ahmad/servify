import { z } from 'zod';

// Input sanitization utilities
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
};

// SQL injection prevention
export const sanitizeSqlInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/['"\\]/g, '') // Remove quotes and backslashes
    .replace(/--/g, '') // Remove SQL comments
    .replace(/;/g, '') // Remove statement terminators
    .trim();
};

// XSS prevention
export const escapeHtml = (unsafe) => {
  if (typeof unsafe !== 'string') return unsafe;
  
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

// Email validation
export const isValidEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
  return emailRegex.test(email);
};

// Phone validation (Pakistan format)
export const isValidPhone = (phone) => {
  const phoneRegex = /^[1-9]\d{9}$/;
  return phoneRegex.test(phone);
};

// CNIC validation (Pakistan format)
export const isValidCNIC = (cnic) => {
  const cnicRegex = /^\d{5}-\d{7}-\d{1}$/;
  return cnicRegex.test(cnic);
};

// Password strength validation
export const validatePasswordStrength = (password) => {
  const errors = [];
  
  if (password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }
  
  if (!/[a-zA-Z]/.test(password)) {
    errors.push('Password must contain letters');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain numbers');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Generic validation schema builder
export const createValidationSchema = (fields) => {
  const schema = {};
  
  Object.entries(fields).forEach(([key, config]) => {
    let fieldSchema = z.string();
    
    if (config.required) {
      fieldSchema = fieldSchema.min(1, `${key} is required`);
    }
    
    if (config.minLength) {
      fieldSchema = fieldSchema.min(config.minLength, `${key} must be at least ${config.minLength} characters`);
    }
    
    if (config.maxLength) {
      fieldSchema = fieldSchema.max(config.maxLength, `${key} must not exceed ${config.maxLength} characters`);
    }
    
    if (config.pattern) {
      fieldSchema = fieldSchema.regex(config.pattern, `${key} format is invalid`);
    }
    
    if (config.email) {
      fieldSchema = fieldSchema.email('Invalid email format');
    }
    
    if (!config.required) {
      fieldSchema = fieldSchema.optional();
    }
    
    schema[key] = fieldSchema;
  });
  
  return z.object(schema);
};

// Request body sanitizer
export const sanitizeRequestBody = (body, fieldsToSanitize = []) => {
  const sanitized = { ...body };
  
  fieldsToSanitize.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = sanitizeInput(sanitized[field]);
    }
  });
  
  return sanitized;
};

// File upload validation
export const validateFileUpload = (file, allowedTypes = ['image/jpeg', 'image/png', 'image/gif'], maxSize = 5 * 1024 * 1024) => {
  const errors = [];
  
  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type ${file.type} is not allowed`);
  }
  
  if (file.size > maxSize) {
    errors.push(`File size exceeds ${maxSize / 1024 / 1024}MB limit`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Rate limit key generator
export const generateRateLimitKey = (identifier, action) => {
  return `${identifier}_${action}`;
};

// CSRF token validation
export const validateCsrfToken = (token, sessionToken) => {
  // In production, compare against session-stored token
  // For now, basic validation
  return token && token.length > 20;
};

// IP address validation
export const isValidIP = (ip) => {
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  
  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
};

// URL validation
export const isValidUrl = (url) => {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

// Common validation schemas
export const commonSchemas = {
  email: z.string().email('Invalid email format'),
  phone: z.string().regex(/^[1-9]\d{9}$/, 'Invalid phone number format'),
  cnic: z.string().regex(/^\d{5}-\d{7}-\d{1}$/, 'Invalid CNIC format'),
  password: z.string().min(6, 'Password must be at least 6 characters').regex(/^(?=.*[a-zA-Z])(?=.*\d)/, 'Password must contain letters and numbers'),
  name: z.string().min(3, 'Name must be at least 3 characters').max(50, 'Name must not exceed 50 characters'),
  address: z.string().min(10, 'Address must be at least 10 characters').max(200, 'Address must not exceed 200 characters'),
};

// Sanitize all string inputs in an object
export const sanitizeObject = (obj) => {
  if (typeof obj !== 'object' || obj === null) return obj;
  
  const sanitized = Array.isArray(obj) ? [] : {};
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (typeof obj[key] === 'string') {
        sanitized[key] = sanitizeInput(obj[key]);
      } else if (typeof obj[key] === 'object') {
        sanitized[key] = sanitizeObject(obj[key]);
      } else {
        sanitized[key] = obj[key];
      }
    }
  }
  
  return sanitized;
};

// Deep clone with sanitization
export const safeClone = (obj) => {
  return JSON.parse(JSON.stringify(sanitizeObject(obj)));
};

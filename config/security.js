// Security configuration for the Azure Vision AI API backend
const securityConfig = {
  // Allowed origins - only your specific website (from environment variables)
  allowedOrigins: process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim()),

  // Rate limiting configuration
  rateLimits: {
    // Per-minute limit for image analysis
    perMinute: {
      windowMs: 1 * 60 * 1000, // 1 minute
      max: 5 // 5 requests per minute per IP
    },
    // Daily limit for image analysis
    daily: {
      windowMs: 24 * 60 * 60 * 1000, // 24 hours
      max: 100 // 100 requests per day per IP
    },
    // Global rate limit for all routes
    global: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // 100 requests per 15 minutes per IP
    }
  },

  // Request size limits
  requestLimits: {
    maxSize: 10 * 1024 * 1024, // 10MB
    maxJsonSize: '10mb'
  },

  // Security headers configuration
  securityHeaders: {
    frameOptions: 'DENY',
    contentTypeOptions: 'nosniff',
    xssProtection: '1; mode=block',
    hsts: 'max-age=31536000; includeSubDomains',
    contentSecurityPolicy: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
  },

  // Logging configuration
  logging: {
    enabled: true,
    logLevel: 'info', // 'debug', 'info', 'warn', 'error'
    logRequests: true,
    logResponses: true,
    logErrors: true
  },

  // Environment validation
  requiredEnvVars: [
    'VISION_ENDPOINT',
    'VISION_KEY'
  ],

  // API protection settings
  apiProtection: {
    validateUrl: true,
    validateContentType: true,
    validateRequestSize: true,
    logUnauthorizedAccess: true
  }
};

module.exports = securityConfig;

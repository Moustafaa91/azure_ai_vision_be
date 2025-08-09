const rateLimit = require('express-rate-limit');
const securityConfig = require('../config/security');

// Security middleware for the entire application
const securityMiddleware = {
  // Global rate limiter for all routes
  globalRateLimit: rateLimit({
    windowMs: securityConfig.rateLimits.global.windowMs,
    max: securityConfig.rateLimits.global.max,
    message: {
      error: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false
  }),

  // Security headers middleware
  securityHeaders: (req, res, next) => {
    // Prevent clickjacking
    res.setHeader('X-Frame-Options', securityConfig.securityHeaders.frameOptions);
    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', securityConfig.securityHeaders.contentTypeOptions);
    // Enable XSS protection
    res.setHeader('X-XSS-Protection', securityConfig.securityHeaders.xssProtection);
    // Strict transport security (if using HTTPS)
    res.setHeader('Strict-Transport-Security', securityConfig.securityHeaders.hsts);
    // Content security policy
    res.setHeader('Content-Security-Policy', securityConfig.securityHeaders.contentSecurityPolicy);
    
    next();
  },

  // Request validation middleware
  validateRequest: (req, res, next) => {
    // Check for required headers if validation is enabled
    if (securityConfig.apiProtection.validateContentType) {
      const contentType = req.get('Content-Type');
      if (req.method === 'POST' && (!contentType || !contentType.includes('application/json'))) {
        return res.status(400).json({
          error: 'Content-Type must be application/json'
        });
      }
    }

    // Validate request method
    const allowedMethods = ['GET', 'POST', 'OPTIONS'];
    if (!allowedMethods.includes(req.method)) {
      return res.status(405).json({
        error: 'Method not allowed'
      });
    }

    next();
  },

  // IP logging middleware
  logIP: (req, res, next) => {
    if (!securityConfig.logging.enabled) {
      return next();
    }

    const ip = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    const timestamp = new Date().toISOString();
    const method = req.method;
    const path = req.path;
    
    console.log(`[${timestamp}] ${method} ${path} - IP: ${ip}`);
    next();
  },

  // Error handling middleware
  errorHandler: (err, req, res, next) => {
    if (securityConfig.logging.logErrors) {
      console.error('Error:', err);
    }
    
    // Don't expose internal errors
    res.status(500).json({
      error: 'Internal server error'
    });
  }
};

module.exports = securityMiddleware;

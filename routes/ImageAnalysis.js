const express = require('express');
const router = express.Router();
const fs = require('fs');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { AzureKeyCredential } = require('@azure/core-auth');
const createClient = require('@azure-rest/ai-vision-image-analysis').default;
const securityConfig = require('../config/security');

// Load the .env file if it exists
require("dotenv").config();

const endpoint = process.env.VISION_ENDPOINT;
const key = process.env.VISION_KEY;

// Validate required environment variables
if (!endpoint || !key) {
  console.error('Missing required environment variables: VISION_ENDPOINT and VISION_KEY');
  process.exit(1);
}

const credential = new AzureKeyCredential(key);
const client = createClient(endpoint, credential);

// CORS configuration with strict origin validation
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(new Error('Not allowed by CORS'));
    }
    
    if (securityConfig.allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`Blocked request from unauthorized origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

router.use(cors(corsOptions));

// Enhanced rate limiting using config
const analyzeImageLimiter = rateLimit({
  windowMs: securityConfig.rateLimits.perMinute.windowMs,
  max: securityConfig.rateLimits.perMinute.max,
  message: { 
    error: 'Rate limit exceeded. Please wait before making another request.',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      error: 'Too many requests, please try again later.',
      retryAfter: 60
    });
  }
});

// Daily rate limiter using config
const dailyLimiter = rateLimit({
  windowMs: securityConfig.rateLimits.daily.windowMs,
  max: securityConfig.rateLimits.daily.max,
  message: { 
    error: 'Daily limit exceeded. Please try again tomorrow.',
    retryAfter: 86400
  },
  handler: (req, res) => {
    console.warn(`Daily limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      error: 'Daily request limit exceeded. Please try again tomorrow.',
      retryAfter: 86400
    });
  }
});

// Request size limit middleware using config
const requestSizeLimit = (req, res, next) => {
  const contentLength = parseInt(req.headers['content-length'] || '0');
  
  if (contentLength > securityConfig.requestLimits.maxSize) {
    return res.status(413).json({
      error: `Request too large. Maximum size is ${securityConfig.requestLimits.maxSize / (1024 * 1024)}MB.`
    });
  }
  next();
};

// Request logging middleware using config
const logRequest = (req, res, next) => {
  if (!securityConfig.logging.enabled) {
    return next();
  }

  const timestamp = new Date().toISOString();
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('User-Agent') || 'Unknown';
  const origin = req.get('Origin') || 'Unknown';
  
  if (securityConfig.logging.logRequests) {
    console.log(`[${timestamp}] API Request - IP: ${ip}, Origin: ${origin}, User-Agent: ${userAgent}`);
  }
  
  // Log response
  if (securityConfig.logging.logResponses) {
    const originalSend = res.send;
    res.send = function(data) {
      const statusCode = res.statusCode;
      console.log(`[${timestamp}] API Response - IP: ${ip}, Status: ${statusCode}`);
      originalSend.call(this, data);
    };
  }
  
  next();
};

const features = [
    'Caption',
    'DenseCaptions',
    'Objects',
    'People',
    'Read',
    'SmartCrops',
    'Tags'
];

// Apply all middleware and rate limiters to /analyzeImage
router.post('/analyzeImage', 
  requestSizeLimit,
  logRequest,
  dailyLimiter,
  analyzeImageLimiter, 
  async (req, res) => {
    try {
      // Validate request body
      const { url, genderNeutral } = req.body;
      
      if (!url) {
        return res.status(400).json({
          error: 'Image URL is required'
        });
      }

      // Validate URL format if enabled
      if (securityConfig.apiProtection.validateUrl) {
        try {
          new URL(url);
        } catch (error) {
          return res.status(400).json({
            error: 'Invalid image URL format'
          });
        }
      }

      // Validate genderNeutral parameter
      const genderNeutralValue = genderNeutral === true || genderNeutral === 'true' ? 'true' : 'false';
      
      console.log(`Processing image analysis for URL: ${url}`);
      
      const result = await client.path('/imageanalysis:analyze').post({
        body: {
            url: url
        },
        queryParameters: {
            features: features,
            'language': 'en',
            'gender-neutral-caption': genderNeutralValue,
            'smartCrops-aspect-ratios': [0.9, 1.33]
        },
        contentType: 'application/json'
      });

      // Send the result back to the caller
      res.json(result.body);
      
    } catch (error) {
      console.error('Error in image analysis:', error);
      
      // Don't expose internal errors to client
      res.status(500).json({
        error: 'An error occurred while processing the image. Please try again.'
      });
    }
});

module.exports = router;
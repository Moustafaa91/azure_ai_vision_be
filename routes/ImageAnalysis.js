const express = require('express');
const router = express.Router();
const fs = require('fs');
const cors = require('cors');
const { AzureKeyCredential } = require('@azure/core-auth');
const createClient = require('@azure-rest/ai-vision-image-analysis').default;

// Load the .env file if it exists
require("dotenv").config();

const endpoint = process.env.VISION_ENDPOINT;
const key = process.env.VISION_KEY;

const credential = new AzureKeyCredential(key);
const client = createClient(endpoint, credential);

// Enable CORS for all routes
const corsOptions = {
  origin: '*', // Specify the origin you want to allow requests from
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};

router.use(cors(corsOptions));

const features = [
    'Caption',
    'DenseCaptions',
    'Objects',
    'People',
    'Read',
    'SmartCrops',
    'Tags'
  ];

  router.post('/analyzeImage', async (req, res) => {
    // Assuming the image URL will be sent in the request body
    const imageUrl = req.body.url;
    const genderNeutral = req.body.genderNeutral;
    
  
    const result = await client.path('/imageanalysis:analyze').post({
      body: {
          url: imageUrl
      },
      queryParameters: {
          features: features,
          'language': 'en',
          'gender-neutral-captions': genderNeutral.toString(),
          'smartCrops-aspect-ratios': [0.9, 1.33]
      },
      contentType: 'application/json'
    });

    // Send the result back to the caller
  res.json(result.body);
});

module.exports = router;
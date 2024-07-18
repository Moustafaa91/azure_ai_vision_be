const express = require('express');
const router = express.Router();
const fs = require('fs');
const { AzureKeyCredential } = require('@azure/core-auth');
const createClient = require('@azure-rest/ai-vision-image-analysis').default;

// Load the .env file if it exists
require("dotenv").config();

const endpoint = process.env.VISION_ENDPOINT;
const key = process.env.VISION_KEY;

const credential = new AzureKeyCredential(key);
const client = createClient(endpoint, credential);

//const imageUrl = 'https://learn.microsoft.com/azure/ai-services/computer-vision/media/quickstarts/presentation.png';

//const imagePath = '../sample.jpg';
//const imageData = fs.readFileSync(imagePath);

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
  
    const result = await client.path('/imageanalysis:analyze').post({
      body: {
          url: imageUrl
      },
      queryParameters: {
          features: features,
          'language': 'en',
          'gender-neutral-captions': 'true',
          'smartCrops-aspect-ratios': [0.9, 1.33]
      },
      contentType: 'application/json'
    });

    // Send the result back to the caller
  res.json(result.body);
});

module.exports = router;
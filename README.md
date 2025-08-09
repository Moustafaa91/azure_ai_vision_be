# Azure AI Vision Backend

## Overview
The backend and APIs for Microsoft Azure VisionAI react app, developed using Node.js and Expressjs
For more details, you can check the frontend app in this repository [azure_ai_vision_frontend](https://github.com/Moustafaa91/azure_ai_vision_frontend)

## Installation

To get started with the project, clone the repository and install the dependencies:

```bash
git clone https://github.com/Moustafaa91/azure_ai_vision_be.git
cd azure_ai_vision_be
npm install
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```bash
# Azure Vision AI API Configuration
VISION_ENDPOINT=your_azure_vision_endpoint_here
VISION_KEY=your_azure_vision_key_here

# Security Configuration
ALLOWED_ORIGINS=comma_separated_frontend_urls
```

### Environment Variables Description

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `VISION_ENDPOINT` | Your Azure Vision AI API endpoint URL | ✅ Yes | `https://your-resource.cognitiveservices.azure.com/` |
| `VISION_KEY` | Your Azure Vision AI API subscription key | ✅ Yes | `your_azure_api_key_here` |
| `ALLOWED_ORIGINS` | Comma-separated list of allowed website domains | ✅ Yes | `https://azure-ai-vision.netlify.app,https://www.azure-ai-vision.netlify.app` |

### Getting Azure Vision AI Credentials

1. Go to the [Azure Portal](https://portal.azure.com/)
2. Create or navigate to your Azure Cognitive Services resource
3. Go to **Keys and Endpoint** section
4. Copy the **Endpoint** URL and **Key 1** or **Key 2**
5. Add them to your `.env` file

## Usage

To start the server:
```bash
npm start
```

The server will start on port 3000 by default.

## API Endpoints

### POST `/api/analyzeImage`

Analyzes an image using Azure Vision AI API.

**Request Body:**
```json
{
  "url": "https://example.com/image.jpg",
  "genderNeutral": "false"
}
```

**Response:**
```json
{
  "captionResult": { ... },
  "denseCaptionsResult": { ... },
  "objectsResult": { ... },
  "peopleResult": { ... },
  "readResult": { ... },
  "smartCropsResult": { ... },
  "tagsResult": { ... }
}
```

## Development

### Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Create `.env` file with your credentials
4. Start the server: `npm start`

## Deployment

### Environment Variables for Production

Make sure to set these environment variables in your production environment:

- `VISION_ENDPOINT`: Your Azure Vision API endpoint
- `VISION_KEY`: Your Azure Vision API key  
- `ALLOWED_ORIGINS`: Your production website domains

### Security Considerations

- Never commit `.env` files to version control
- Use HTTPS in production
- Monitor logs for suspicious activity
- Regularly rotate API keys

## Contribution
Contributions are welcome! Please create an issue or submit a pull request.

## Acknowledgments
This project is developed as part of a learning initiative and leverages the power of AI-driven vision analysis provided by Microsoft Azure.
Thanks to GitHub Copilot and ChatGPT for assisting with coding and development :)

## Contact
For any inquiries, please contact [Moustafa Attia](https://www.linkedin.com/in/mustafa1090).



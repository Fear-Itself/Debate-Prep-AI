require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Common headers for CORS
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

exports.handler = async function(event, context) {
  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, error: 'Method not allowed' })
    };
  }

  try {
    // Verify API key
    if (!process.env.GOOGLE_API_KEY) {
      console.error('GOOGLE_API_KEY is not set');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: 'API key configuration error' 
        })
      };
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const { topic, question, side } = JSON.parse(event.body);
    
    if (!topic || !question) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: 'Topic and question are required' 
        })
      };
    }

    const prompt = `Help me prepare for a debate on the topic: "${topic}".
Question: ${question}
${side ? `I am arguing for the ${side} side.` : ''}

Please provide:
1. A strong argument
2. Supporting reasoning
3. Potential evidence or examples`;

    console.log('Sending prompt to Gemini:', prompt);
    
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('Received response from Gemini');

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true,
        response: text 
      })
    };
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false, 
        error: error.message || 'Internal server error'
      })
    };
  }
};

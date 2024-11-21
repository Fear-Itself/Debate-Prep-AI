require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ success: false, error: 'Method not allowed' })
    };
  }

  try {
    const { topic, question, side } = JSON.parse(event.body);
    
    if (!topic || !question) {
      return {
        statusCode: 400,
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

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({ 
        success: true,
        response: text 
      })
    };
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        success: false, 
        error: error.message 
      })
    };
  }
};

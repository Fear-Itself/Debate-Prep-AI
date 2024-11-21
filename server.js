require('dotenv').config();
const express = require('express');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Gemini AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

app.use(cors());
app.use(express.static('public'));
app.use(express.json());

const DEBATE_PROMPT = `This is parliamentary debate, there is a proposition and an opposition. 
The prop must prove that the motion/topic of the debate is true and the opp must prove the opposite. 
Format arguments using AREI:
- Argument: Clear, concise 2-10 word argument summarizing the content
- Reasoning: Clear, short explanation (1-3 sentences)
- Evidence: Studies, newspapers, historical examples that support the argument. Prioritize statistics, percentages, numbers but also powerful pieces of info that are relevant to the topic. Make it be very powerful and relevant to the topic.
- Impact: Why this argument matters (the "so what" aspect)

Topic: {topic}
Question: {question}
Side: {side}

Please provide a structured response following the AREI format. However, if they do not provide a clear question about the arguementation of the topic, 
you can then answer their question without using the AREI format and then answer with a short yet explanitory answer. If they ask about weighing,
first, anylize the topics + sides (on your own without puting it in the response) and see the possible arguments and then based on that give a weighing mechinisms. Make sure the weighing mechism stays within the 
frame of the debate and is appealing to a judge. Try to always use consquentlism or utilistism. The general goal is to give a reason why your arguements matter more than the opponents. What you give them a baisis and info on how to use a mechism for the case specific info 
of the topic. You should give them a clear roadmap for the third of how to sum up the debate and secure a win for them using weighing. Make sure to always give them a mechism and a way to use it. If you dont know which to propose go consquentlist as it is more universal. If they ask about the topic then you can explain what ever they need.
If they ask about refutations or a critiquing of their arguement you should respond with 2 - 5 sentence response explaining A: The refuation and B : if they want you to refute thie ararguemnt 

`;

app.post('/analyze', async (req, res) => {
    try {
        const { topic, question, side } = req.body;
        const prompt = DEBATE_PROMPT
            .replace('{topic}', topic)
            .replace('{question}', question)
            .replace('{side}', side);

        const result = await model.generateContent(prompt);
        const response = result.response.text();
        res.json({ success: true, response });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

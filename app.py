from flask import Flask, render_template, request, jsonify
import anthropic
import google.generativeai as genai
import openai
import os
from dotenv import load_dotenv

app = Flask(__name__)

# Load environment variables
load_dotenv()

# Initialize AI clients
claude = anthropic.Anthropic(api_key=os.getenv('CLAUDE_API_KEY'))
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
openai.api_key = os.getenv('OPENAI_API_KEY')

DEBATE_PROMPT = """This is parliamentary debate, there is a proposition and an opposition. 
The prop must prove that the motion/topic of the debate is true and the opp must prove the opposite. 
Format arguments using AREI:
- Argument: Clear, concise 2-10 word argument summarizing the content
- Reasoning: Clear, short explanation (1-3 sentences)
- Evidence: Studies, newspapers, historical examples that support the argument
- Impact: Why this argument matters (the "so what" aspect)

Topic: {topic}
Question: {question}
Side: {side}

Please provide a structured response following the AREI format."""

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.json
    topic = data.get('topic')
    question = data.get('question')
    side = data.get('side')
    model = data.get('model')
    
    formatted_prompt = DEBATE_PROMPT.format(
        topic=topic,
        question=question,
        side=side
    )
    
    try:
        if model == 'claude':
            response = claude.messages.create(
                model="claude-2",
                max_tokens=1000,
                messages=[{"role": "user", "content": formatted_prompt}]
            )
            result = response.content
            
        elif model == 'gemini':
            model = genai.GenerativeModel('gemini-pro')
            response = model.generate_content(formatted_prompt)
            result = response.text
            
        elif model == 'gpt':
            response = openai.ChatCompletion.create(
                model="gpt-4",
                messages=[{"role": "user", "content": formatted_prompt}]
            )
            result = response.choices[0].message.content
            
        return jsonify({"success": True, "response": result})
    
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

if __name__ == '__main__':
    app.run(debug=True)

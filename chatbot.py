import openai
from flask import Flask, request, jsonify
from flask_cors import CORS
from config import OPENAI_API_KEY

# Configure OpenAI with your API key
openai.api_key = OPENAI_API_KEY

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

def chat_with_bot(user_input):
    try:
        # Create a chat completion using GPT-3.5-turbo
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": user_input}
            ]
        )
        
        # Extract and return the assistant's response
        return response.choices[0].message.content
    except Exception as e:
        return f"An error occurred: {str(e)}"

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    user_message = data.get('message')
    if not user_message:
        return jsonify({'error': 'No message provided'}), 400
    
    response = chat_with_bot(user_message)
    return jsonify({'response': response})

if __name__ == "__main__":
    app.run(debug=True, port=1234) 


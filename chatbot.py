import openai
from flask import Flask, request, jsonify
from flask_cors import CORS
from config import OPENAI_API_KEY
from datetime import datetime
import uuid
import json
import os

# Simplify OpenAI client initialization
client = openai.OpenAI(api_key=OPENAI_API_KEY)

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# File to store conversations
CONVERSATIONS_FILE = 'conversations.json'

# Load conversations from file
def load_conversations():
    if os.path.exists(CONVERSATIONS_FILE):
        try:
            with open(CONVERSATIONS_FILE, 'r') as f:
                return json.load(f)
        except json.JSONDecodeError:
            return {}
    return {}

# Save conversations to file
def save_conversations():
    with open(CONVERSATIONS_FILE, 'w') as f:
        json.dump(conversations, f, indent=2)

# Initialize conversations from file
conversations = load_conversations()

def create_conversation():
    conversation_id = str(uuid.uuid4())
    conversations[conversation_id] = {
        'messages': [],
        'created_at': datetime.now().isoformat(),
        'updated_at': datetime.now().isoformat()
    }
    save_conversations()  # Save after creating new conversation
    return conversation_id

def chat_with_bot(messages):
    try:
        # Include system message and all previous messages
        full_messages = [{"role": "system", "content": "You are a helpful assistant."}] + messages
        
        # Update the API call to use the new format
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=full_messages
        )
        
        return response.choices[0].message.content
    except Exception as e:
        return f"An error occurred: {str(e)}"

@app.route('/api/conversations', methods=['GET'])
def get_conversations():
    # Return list of conversations with metadata
    conversation_list = [
        {
            'id': conv_id,
            'created_at': data['created_at'],
            'updated_at': data['updated_at'],
            'preview': data['messages'][-1]['content'] if data['messages'] else 'Empty conversation'
        }
        for conv_id, data in conversations.items()
    ]
    return jsonify(conversation_list)

@app.route('/api/conversations', methods=['POST'])
def create_new_conversation():
    conversation_id = create_conversation()
    return jsonify({'conversation_id': conversation_id})

@app.route('/api/conversations/<conversation_id>', methods=['GET'])
def get_conversation(conversation_id):
    if conversation_id not in conversations:
        return jsonify({'error': 'Conversation not found'}), 404
    return jsonify(conversations[conversation_id])

@app.route('/api/chat/<conversation_id>', methods=['POST'])
def chat(conversation_id):
    if conversation_id not in conversations:
        return jsonify({'error': 'Conversation not found'}), 404
    
    data = request.json
    user_message = data.get('message')
    if not user_message:
        return jsonify({'error': 'No message provided'}), 400
    
    # Add user message to conversation
    conversations[conversation_id]['messages'].append({
        'role': 'user',
        'content': user_message
    })
    
    # Get bot response using conversation history
    response = chat_with_bot(conversations[conversation_id]['messages'])
    
    # Add bot response to conversation
    conversations[conversation_id]['messages'].append({
        'role': 'assistant',
        'content': response
    })
    
    # Update conversation timestamp
    conversations[conversation_id]['updated_at'] = datetime.now().isoformat()
    
    # Save conversations after update
    save_conversations()
    
    return jsonify({
        'response': response,
        'conversation_id': conversation_id
    })

@app.route('/api/conversations/<conversation_id>', methods=['DELETE'])
def delete_conversation(conversation_id):
    if conversation_id not in conversations:
        return jsonify({'error': 'Conversation not found'}), 404
    
    del conversations[conversation_id]
    save_conversations()
    return jsonify({'message': 'Conversation deleted successfully'})

@app.route('/api/conversations/<conversation_id>', methods=['PATCH'])
def update_conversation(conversation_id):
    if conversation_id not in conversations:
        return jsonify({'error': 'Conversation not found'}), 404
    
    data = request.json
    if 'preview' in data:
        # Update both the preview and the last message content
        preview = data['preview'].strip()
        if conversations[conversation_id]['messages']:
            conversations[conversation_id]['messages'][-1]['content'] = preview
        conversations[conversation_id]['preview'] = preview
        save_conversations()
        return jsonify({'message': 'Conversation updated successfully'})
    
    return jsonify({'error': 'No updates provided'}), 400

if __name__ == "__main__":
    app.run(debug=True, port=4321) 


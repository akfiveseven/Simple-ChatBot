# Simple-ChatBot

AI chatbot with Python3 using OpenAI API

## How To Use

1. Clone the repository
2. Install OpenAI v0.28 module: `pip install openai==0.28`
3. Create `config.py` file and add your API key: `OPENAI_API_KEY = "<your-api-key>"`
4. Run program: `python3 chatbot.py`

## Features

- Chat with AI using OpenAI's GPT-3.5 model
- Conversation history persistence
- Multiple conversation support
- Real-time chat interface

Note: Conversations are automatically saved to `conversations.json` and will be loaded when the server restarts.

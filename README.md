# Simple-ChatBot

AI chatbot with Python3 using OpenAI API

## How To Use

1.  Clone the repository
2.  Install OpenAI v0.28 module: `pip install openai` or `pip install openai --upgrade`
3.  Install flask: `pip install flask flask-cors`
4.  Create `config.py` file and add your API key: `OPENAI_API_KEY = "<your-api-key>"`
5.  Run program: `python3 chatbot.py`
6.  Open the `chatbot-frontend` directory
7.  Install correct node version: `nvm install 20.14.0` (Make sure you have `nodejs` and `nvm` installed)
8.  Switch to correct node version: `nvm use 20.14.0`
9.  Install required node packages: `npm install`
10. Start frontend server: `npm run dev`
11. Open in browser with the port specified by React/Vite from previous step: `http://localhost:<port>`
12. Start chatting!

## Features

- Chat with AI using OpenAI's GPT-3.5 model
- Conversation history persistence
- Multiple conversation support
- Real-time chat interface

Note: Conversations are automatically saved to `conversations.json` and will be loaded when the server restarts.

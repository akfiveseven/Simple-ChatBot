import openai
from config import OPENAI_API_KEY

# Configure OpenAI with your API key
openai.api_key = OPENAI_API_KEY

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

def main():
    print("Welcome to the ChatBot! (Type 'quit' to exit)")
    print("-" * 50)
    
    while True:
        user_input = input("\nYou: \n")
        
        if user_input.lower() in ['quit', 'exit']:
            print("\nGoodbye!")
            break
            
        response = chat_with_bot(user_input)
        print("\nChatBot:\n", response)

if __name__ == "__main__":
    main() 


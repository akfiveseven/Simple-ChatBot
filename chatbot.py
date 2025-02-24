import os
import openai
from config import OPENAI_API_KEY

# configure with openai api key
openai.api_key = OPENAI_API_KEY

def chat_with_bot(user_input):
    try:
        # create a chat completion using gpt-3.5-turbo
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": user_input}
            ]
        )
        
        
        # extract and return the assistant's response
        return response.choices[0].message.content
    except Exception as e:
        return f"An error occurred: {str(e)}"

def main():
    os.system('cls' if os.name == 'nt' else 'clear')
    print("Welcome to the ChatBot! (Type 'quit' to exit)")
    print("-" * 50)
    
    while True:
        user_input = input("\nYou: ")
        
        if user_input.lower() in ['quit', 'exit']:
            print("\nGoodbye!")
            break
            
        response = chat_with_bot(user_input)
        # Word wrap the response
        # words = response.split(" ")
        current_line = ""
        print("\nChatBot:\n")
        print(response)
        

if __name__ == "__main__":
    main() 


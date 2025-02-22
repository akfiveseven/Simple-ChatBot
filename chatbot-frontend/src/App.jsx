import { useState, useRef, useEffect } from "react";
import axios from "axios";

function App() {
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Load conversations on mount
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:1234/api/conversations");
      setConversations(response.data);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  };

  const createNewConversation = async () => {
    try {
      const response = await axios.post("http://127.0.0.1:1234/api/conversations");
      const newConversationId = response.data.conversation_id;
      setCurrentConversationId(newConversationId);
      setMessages([]);
      await fetchConversations();
    } catch (error) {
      console.error("Error creating conversation:", error);
    }
  };

  const loadConversation = async (conversationId) => {
    try {
      const response = await axios.get(`http://127.0.0.1:1234/api/conversations/${conversationId}`);
      setCurrentConversationId(conversationId);
      setMessages(response.data.messages.map(msg => ({
        text: msg.content,
        sender: msg.role === 'user' ? 'user' : 'bot'
      })));
    } catch (error) {
      console.error("Error loading conversation:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    if (!currentConversationId) {
      await createNewConversation();
    }

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { text: userMessage, sender: "user" }]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await axios.post(`http://127.0.0.1:1234/api/chat/${currentConversationId}`, {
        message: userMessage,
      });

      setMessages((prev) => [
        ...prev,
        { text: response.data.response, sender: "bot" },
      ]);
      await fetchConversations(); // Refresh conversation list
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          text: "Sorry, there was an error processing your request.",
          sender: "bot",
        },
      ]);
    }

    setIsLoading(false);
  };

  return (
    <div className="app-container">
      <div className="sidebar">
        <button onClick={createNewConversation} className="new-chat-btn">
          Save Current Chat
        </button>
        <div className="conversations-list">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={`conversation-item ${conv.id === currentConversationId ? 'active' : ''}`}
              onClick={() => loadConversation(conv.id)}
            >
              <div className="conversation-preview">{conv.preview}</div>
              <div className="conversation-date">
                {new Date(conv.updated_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="chatbot-container">
        <div className="chat-header">
          <h2>ChatBot</h2>
        </div>

        <div className="messages-container">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`message ${
                message.sender === "user" ? "user-message" : "bot-message"
              }`}
            >
              {message.text}
            </div>
          ))}
          {isLoading && (
            <div className="message bot-message">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="input-form">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;

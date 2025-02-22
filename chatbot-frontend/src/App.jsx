import { useState, useRef, useEffect } from "react";
import axios from "axios";

const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

function App() {
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");

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

    const userMessage = input.trim();
    setInput("");
    setIsLoading(true);

    try {
      let activeConversationId = currentConversationId;
      
      // If no conversation exists, create one first
      if (!activeConversationId) {
        const response = await axios.post("http://127.0.0.1:1234/api/conversations");
        activeConversationId = response.data.conversation_id;
        setCurrentConversationId(activeConversationId);
      }

      // Now send the message
      setMessages((prev) => [...prev, { text: userMessage, sender: "user" }]);
      
      const chatResponse = await axios.post(`http://127.0.0.1:1234/api/chat/${activeConversationId}`, {
        message: userMessage,
      });

      setMessages((prev) => [
        ...prev,
        { text: chatResponse.data.response, sender: "bot" },
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

  const deleteConversation = async (conversationId, e) => {
    e.stopPropagation(); // Prevent triggering the conversation selection
    try {
      await axios.delete(`http://127.0.0.1:1234/api/conversations/${conversationId}`);
      if (conversationId === currentConversationId) {
        setCurrentConversationId(null);
        setMessages([]);
      }
      await fetchConversations();
    } catch (error) {
      console.error("Error deleting conversation:", error);
    }
  };

  const startEditing = (conv, e) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditingText(conv.preview);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!editingId || !editingText.trim()) return;

    try {
      await axios.patch(`http://127.0.0.1:1234/api/conversations/${editingId}`, {
        preview: editingText.trim()
      });
      
      // Update the local state immediately
      setConversations(prevConversations => 
        prevConversations.map(conv => 
          conv.id === editingId 
            ? { ...conv, preview: editingText.trim() }
            : conv
        )
      );
      
      setEditingId(null);
      setEditingText("");
    } catch (error) {
      console.error("Error updating conversation:", error);
    }
  };

  const handleNewChat = async () => {
    setMessages([]);
    setCurrentConversationId(null);
    setInput("");
  };

  return (
    <div className="app-container">
      <div className="sidebar">
        <button 
          className="new-chat-btn"
          onClick={handleNewChat}
        >
          + New Chat
        </button>
        <div className="conversations-list">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={`conversation-item ${conv.id === currentConversationId ? 'active' : ''}`}
            >
              <div 
                className="conversation-content"
                onClick={() => loadConversation(conv.id)}
              >
                {editingId === conv.id ? (
                  <form 
                    className="edit-form" 
                    onSubmit={handleEdit}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="text"
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      onBlur={handleEdit}
                      autoFocus
                    />
                  </form>
                ) : (
                  <>
                    <div className="conversation-preview">
                      {truncateText(conv.preview, 20)}
                    </div>
                    <div className="conversation-date">
                      {new Date(conv.updated_at).toLocaleDateString()}
                    </div>
                  </>
                )}
              </div>
              <div className="conversation-actions">
                <button 
                  className="edit-conversation-btn"
                  onClick={(e) => startEditing(conv, e)}
                  title="Edit conversation name"
                >
                  ✎
                </button>
                <button 
                  className="delete-conversation-btn"
                  onClick={(e) => deleteConversation(conv.id, e)}
                  title="Delete conversation"
                >
                  ×
                </button>
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
          {messages.length === 0 && !isLoading && (
            <div className="welcome-message">
              <h3>Welcome to ChatBot! 👋</h3>
              <p>Type a message below to start a new conversation.</p>
            </div>
          )}
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

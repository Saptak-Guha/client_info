import React, { useState, useEffect, useRef } from 'react';

const ChatWindow = ({ clientId, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Whenever clientId changes, clear messages and reconnect
    setMessages([]);

    if (!clientId) return;

    // Close any existing socket
    if (socketRef.current) {
      socketRef.current.close();
    }

    // Connect to new room
    socketRef.current = new WebSocket(`ws://127.0.0.1:8000/ws/chat/${clientId}/`);

    socketRef.current.onopen = () => {
      console.log("WebSocket connected to client", clientId);
    };

    socketRef.current.onmessage = (e) => {
      const data = JSON.parse(e.data);
      setMessages(prev => [
        ...prev,
        {
          sender: data.sender,
          text: data.message,
          timestamp: data.timestamp || new Date().toISOString()
        },
      ]);
    };

    socketRef.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    socketRef.current.onclose = () => {
      console.log("WebSocket disconnected from client", clientId);
    };

    // Cleanup on unmount or clientId change
    return () => {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.close();
      }
    };
  }, [clientId]);

  const sendMessage = () => {
    if (!input.trim() || !socketRef.current) return;

    if (socketRef.current.readyState === WebSocket.OPEN) {
      // Send the message to server
      const messageData = {
        sender: "me",
        message: input.trim()
      };
      socketRef.current.send(JSON.stringify(messageData));
      setInput("");  // clear input; message will appear on onmessage
    } else {
      console.error("WebSocket is not open. Ready state:", socketRef.current.readyState);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  return (
    <div style={{
      border: "1px solid #888",
      padding: "1rem",
      width: 400,
      backgroundColor: "white",
      borderRadius: "8px",
      boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
      position: "fixed",
      right: "1rem",
      bottom: "1rem",
      zIndex: 1000
    }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "1rem"
      }}>
        <h3 style={{ margin: 0, color: "#1976D2" }}>
          Chat with Client ({clientId})
        </h3>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            fontSize: "1.5rem",
            cursor: "pointer",
            color: "#1976d2"        // ← white cross
          }}
        >
          ✖
        </button>
      </div>

      <div
        style={{
          height: 300,
          overflowY: "auto",
          border: "1px solid #ccc",
          padding: "0.5rem",
          marginBottom: "0.5rem",
          backgroundColor: "#f0f8ff"
        }}
      >
        {messages.map((m, i) => {
          const isServer = m.sender === "me";
          return (
            <div
              key={i}
              style={{
                textAlign: isServer ? "right" : "left",
                margin: "0.5rem 0"
              }}
            >
              <div style={{
                display: "inline-block",
                padding: "0.5rem",
                borderRadius: "8px",
                backgroundColor: isServer ? "#d1ecff" : "#e0e0e0",
                maxWidth: "80%"
              }}>
                <strong style={{ color: isServer ? "#1976D2" : "#333" }}>
                  {isServer ? "You (Server)" : "Client"}:
                </strong>{" "}
                {m.text}
                <div style={{
                  fontSize: "0.7rem",
                  color: "#666",
                  marginTop: "0.25rem"
                }}>
                  {new Date(m.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ display: "flex" }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          style={{
            flexGrow: 1,
            marginRight: "0.5rem",
            padding: "0.5rem",
            border: "1px solid #1976D2",
            borderRadius: "4px"
          }}
        />
        <button
          onClick={sendMessage}
          style={{
            backgroundColor: "#1976D2",
            color: "white",
            border: "none",
            padding: "0.5rem 1rem",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;

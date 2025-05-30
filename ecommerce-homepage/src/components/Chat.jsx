// Chat.jsx
import React, { useState, useEffect, useRef } from "react";

function Chat({ clientId }) {
  const [chatLog, setChatLog] = useState([]);
  const [message, setMessage] = useState("");
  const socketRef = useRef(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (!clientId) return;
    
    // Close any existing connection
    if (socketRef.current) {
      socketRef.current.close();
    }

    // Create new WebSocket connection
    socketRef.current = new WebSocket(
      `ws://127.0.0.1:8000/ws/chat/${clientId}/`
    );

    socketRef.current.onopen = () => {
      console.log("WebSocket connected");
    };

    socketRef.current.onmessage = (e) => {
      const data = JSON.parse(e.data);
      setChatLog(prev => [
        ...prev,
        {
          from: data.sender,
          text: data.message,
          timestamp: data.timestamp
        },
      ]);
    };

    socketRef.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    socketRef.current.onclose = () => {
      console.log("WebSocket disconnected");
    };

    return () => {
      // Cleanup: close WebSocket when component unmounts
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.close();
      }
    };
  }, [clientId]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatLog]);

  const sendMessage = () => {
    if (!message.trim() || !socketRef.current) return;

    // Check if connection is open
    if (socketRef.current.readyState === WebSocket.OPEN) {
      // Format matches backend expectations
      const messageData = {
        sender: clientId,  // This should be the client ID string
        message: message.trim()
      };
      
      socketRef.current.send(JSON.stringify(messageData));
      setMessage("");
    } else {
      console.error("WebSocket is not open. Ready state:", socketRef.current.readyState);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  // Determine message display based on sender
  const getDisplayInfo = (msg) => {
    if (msg.from === "me") {
      return {
        displayName: "Server",
        bgColor: "#ffffff",
        borderColor: "#4CAF50",
        textColor: "#4CAF50"
      };
    } else if (msg.from === clientId) {
      return {
        displayName: "You",
        bgColor: "#e3f2fd",
        borderColor: "#1976D2",
        textColor: "#1976D2"
      };
    } else {
      return {
        displayName: msg.from,
        bgColor: "#f5f5f5",
        borderColor: "#666",
        textColor: "#333"
      };
    }
  };

  return (
    <div style={{ 
      padding: "1rem", 
      maxWidth: "400px",
      backgroundColor: "white",
      border: "1px solid #1976D2",
      borderRadius: "8px"
    }}>
      <h2 style={{ color: "#1976D2" }}>Client Chat (ID: {clientId || "not set"})</h2>

      <div
        ref={chatContainerRef}
        style={{
          height: 300,
          overflowY: "auto",
          border: "1px solid #1976D2",
          padding: "0.5rem",
          marginBottom: "0.5rem",
          backgroundColor: "#f0f8ff"
        }}
      >
        {chatLog.map((msg, idx) => {
          const { displayName, bgColor, borderColor, textColor } = getDisplayInfo(msg);
          
          return (
            <div 
              key={idx} 
              style={{ 
                margin: "0.5rem 0",
                padding: "0.5rem",
                backgroundColor: bgColor,
                borderRadius: "4px",
                borderLeft: `3px solid ${borderColor}`
              }}
            >
              <strong style={{ color: textColor }}>
                {displayName}:
              </strong> {msg.text}
              <div style={{ 
                fontSize: "0.7rem", 
                color: "#666", 
                marginTop: "0.25rem" 
              }}>
                {msg.timestamp && new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex" }}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          style={{ 
            flex: 1, 
            padding: "0.5rem", 
            marginRight: "0.5rem", 
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
}

export default Chat;
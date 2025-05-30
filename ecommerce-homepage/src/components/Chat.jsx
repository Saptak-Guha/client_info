import React, { useState, useEffect, useRef } from "react";

function Chat({ clientId }) {
  const [chatLog, setChatLog] = useState([]);
  const [message, setMessage] = useState("");
  const socketRef = useRef(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (!clientId) return;

    if (socketRef.current) {
      socketRef.current.close();
    }

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
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.close();
      }
    };
  }, [clientId]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatLog]);

  const sendMessage = () => {
    if (!message.trim() || !socketRef.current) return;

    if (socketRef.current.readyState === WebSocket.OPEN) {
      const messageData = {
        sender: clientId,
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
const getDisplayInfo = (msg) => {
  if (msg.from === "me") {
    return {
      displayName: "Server",
      bgColor: "#ffffff",
      borderColor: "#4CAF50",
      textColor: "#000000",
      labelColor: "#4CAF50"  // green
    };
  } else if (msg.from === clientId) {
    return {
      displayName: "You",
      bgColor: "#ffffff",
      borderColor: "#1565C0",
      textColor: "#000000",
      labelColor: "#1565C0"  // dark blue
    };
  } else {
    return {
      displayName: msg.from,
      bgColor: "#ffffff",
      borderColor: "#555",
      textColor: "#000000",
      labelColor: "#333"  // default dark
    };
  }
};


  return (
    <div style={{ 
      padding: "1rem", 
      maxWidth: "800px",
      backgroundColor: "#1976D2",
      border: "1px solid #1565C0",
      borderRadius: "8px"
    }}>
      <h2 style={{ color: "#ffffff" }}>
        Client Chat (ID: {clientId || "not set"})
      </h2>

      <div
        ref={chatContainerRef}
        style={{
          height: 300,
          overflowY: "auto",
          border: "1px solid #ffffff",
          padding: "0.5rem",
          marginBottom: "0.5rem",
          backgroundColor: "#ffffff",
          borderRadius: "4px"
        }}
      >
     {chatLog.map((msg, idx) => {
  const { displayName, bgColor, borderColor, textColor, labelColor } = getDisplayInfo(msg);
  
  return (
    <div 
      key={idx} 
      style={{ 
        margin: "0.5rem 0",
        padding: "0.5rem",
        backgroundColor: bgColor,
        borderRadius: "4px",
        borderLeft: `3px solid ${borderColor}`,
        color: textColor
      }}
    >
      <strong style={{ color: labelColor }}>
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
            border: "1px solid #ffffff",
            borderRadius: "4px",
            backgroundColor: "#ffffff",
            color: "#000000"
          }}
        />
        <button 
          onClick={sendMessage}
          style={{
            backgroundColor: "#ffffff",
            color: "#1976D2",
            border: "1px solid #ffffff",
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

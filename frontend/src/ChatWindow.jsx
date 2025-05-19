import React, { useState, useEffect, useRef } from 'react';

const ChatWindow = ({ clientId, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = new WebSocket(`ws://127.0.0.1:8000/ws/chat/${clientId}/`);

    socketRef.current.onopen = () => {
      console.log("WebSocket (server) connected");
    };

    socketRef.current.onmessage = (e) => {
      const data = JSON.parse(e.data);
      // data.sender === clientId means a client sent it; if 'me', it's server
      setMessages((prev) => [
        ...prev,
        {
          sender: data.sender === "me" ? "Server" : "Client",
          text: data.message,
        },
      ]);
    };

    socketRef.current.onclose = () => {
      console.log("WebSocket (server) disconnected");
    };

    return () => {
      socketRef.current.close();
    };
  }, [clientId]);

  const sendMessage = () => {
    if (!input.trim()) return;
    // sending JSON with sender = "me" coz i'm him!
    socketRef.current.send(
      JSON.stringify({ sender: "me", message: input.trim() })
    );
    setInput("");
  };

  return (
    <div className="chat-window" style={{ border: "1px solid #888", padding: "1rem", width: 400 }}>
      <div className="chat-header" style={{ display: "flex", justifyContent: "space-between" }}>
        <h3>Chat with {clientId}</h3>
        <button onClick={onClose}>✖</button>
      </div>
      {/* {need to fit this orelse overflow horha h} */}
      <div 
        className="chat-messages"
        style={{ height: 300, overflowY: "auto", border: "1px solid #ccc", padding: "0.5rem", margin: "0.5rem 0" }}
      >
        {messages.map((m, i) => (
          <div
            key={i}
            className={`message ${m.sender === "Server" ? "sent" : "received"}`}
            style={{
              textAlign: m.sender === "Server" ? "right" : "left",
              margin: "0.25rem 0",
            }}
          >
            <strong>{m.sender}:</strong> {m.text}
          </div>
        ))}
      </div>
      <div className="chat-input" style={{ display: "flex" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{ flexGrow: 1, marginRight: "0.5rem" }}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ChatWindow;

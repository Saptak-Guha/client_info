// Chat.jsx

import React, { useState, useEffect, useRef } from "react";

function Chat({ clientId }) {
  const [chatLog, setChatLog] = useState([]);
  const [message, setMessage] = useState("");
  const socketRef = useRef(null);

  useEffect(() => {
    // open the WebSocket if clientId is a non-empty 
    if (!clientId) return;

            // WebSocket to ws://127.0.0.1:8000/ws/chat/<clientId>/
    socketRef.current = new WebSocket(
      `ws://127.0.0.1:8000/ws/chat/${clientId}/`
    );

    socketRef.current.onopen = () => {
      console.log("WebSocket (client) connected");
    };

    socketRef.current.onmessage = (e) => {
      const data = JSON.parse(e.data);
      // agar data.sender === "me", that means the server sent it warna its from this client
      setChatLog((prev) => [
        ...prev,
        {
          from: data.sender === "me" ? "server" : "you",
          text: data.message,
        },
      ]);
    };

    socketRef.current.onclose = () => {
      console.log("WebSocket (client) disconnected");
    };

    return () => {
      if (socketRef.current) socketRef.current.close();
    };
  }, [clientId]);

  const sendMessage = () => {
    if (!message.trim() || !socketRef.current) return;

    // JSON = { sender: clientId, message }
    socketRef.current.send(
      JSON.stringify({ sender: clientId, message: message.trim() })
    );

    setMessage("");
  };

  return (
    <div style={{ padding: "1rem", maxWidth: 600, margin: "0 auto" }}>
      <h2>Client Chat (ID: {clientId || "not set"})</h2>

      <div
        style={{
          height: 300,
          overflowY: "scroll",
          border: "1px solid #ccc",
          padding: "0.5rem",
          marginBottom: "0.5rem",
        }}
      >
        {chatLog.map((msg, idx) => (
          <p key={idx}>
            <strong>{msg.from}:</strong> {msg.text}
          </p>
        ))}
      </div>

      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
        style={{ width: "80%", marginRight: "0.5rem" }}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

export default Chat;

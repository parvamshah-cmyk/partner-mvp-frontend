import React, { useEffect, useRef } from "react";
import "./ChatArea.css";

function ChatArea({ messages, typing, countdown }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing, countdown]);

  return (
    <div className="chat-area">
      {/* Countdown banner before chat starts */}
      {countdown > 0 && (
        <div className="countdown-banner">
          Chat starting in {countdown} {countdown === 1 ? "second" : "seconds"}
        </div>
      )}

      {messages.map((msg, i) => (
        <div key={i} className={`chat-bubble ${msg.type}`}>
          {msg.type === "bot" && <div className="bubble-label">Atri</div>}
          {msg.type === "user" && <div className="bubble-label">You</div>}
          <div className="bubble-text">{msg.text}</div>
          {msg.commentary && (
            <div className="commentary">{msg.commentary}</div>
          )}
        </div>
      ))}
      {typing && (
        <div className="chat-bubble bot typing-bubble">
          <div className="bubble-label">Atri</div>
          <div className="typing-dots">
            <span />
            <span />
            <span />
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}

export default ChatArea;

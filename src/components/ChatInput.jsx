import React, { useState, useRef } from "react";
import "./ChatInput.css";

function ChatInput({ onSend, disabled }) {
  const [text, setText] = useState("");
  const inputRef = useRef(null);

  // Don't auto-focus — let the user tap to open keyboard

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText("");
  };

  return (
    <form className="chat-input" onSubmit={handleSubmit}>
      <input
        ref={inputRef}
        type="text"
        value={text}
        onChange={(e) => !disabled && setText(e.target.value)}
        placeholder={disabled ? "Reading the stars..." : "Type your answer..."}
        disabled={disabled}
        readOnly={disabled}
        tabIndex={disabled ? -1 : 0}
      />
      <button type="submit" disabled={disabled || !text.trim()}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 2L11 13" />
          <path d="M22 2L15 22L11 13L2 9L22 2Z" />
        </svg>
      </button>
    </form>
  );
}

export default ChatInput;

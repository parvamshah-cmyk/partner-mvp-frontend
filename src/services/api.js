const API_BASE = "https://partner-mvp-backend.onrender.com";

export async function startSession() {
  const res = await fetch(`${API_BASE}/start-session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Failed to start session");
  return res.json();
}

export async function sendMessage(sessionId, userMessage) {
  const res = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, userMessage }),
  });
  if (!res.ok) throw new Error("Failed to send message");
  return res.json();
}

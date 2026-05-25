import { useState, useRef, useEffect } from "react";

const QUICK_PROMPTS = [
  "Which business should I prioritize first as a solo Dallas entrepreneur?",
  "Give me my exact next 3 actions to make money this week.",
  "What are the biggest mistakes when launching in 7 days?",
  "Write my LinkedIn launch announcement post.",
  "Give me a realistic first-month revenue projection for all 3 businesses.",
  "How do I close my first paying client for the AI Content Studio?",
  "What niche should I pick for my AI Micro-SaaS?",
];

export default function CoachPage() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hey — I'm your AI Executive Coach.\n\nYou're a Dallas entrepreneur building three businesses simultaneously. I have full context on your go-live plan, Executive Coach brand, AI Micro-SaaS, and Content Studio.\n\nWhat do you want to tackle first?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(text) {
    const userText = text || input.trim();
    if (!userText || loading) return;

    setInput("");
    setError(null);

    const newMessages = [...messages, { role: "user", content: userText }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Request failed");
      }

      setMessages([...newMessages, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setError(err.message);
      // Remove the user message if the request failed so they can retry
      setMessages(messages);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.shell}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={styles.avatar}>EC</div>
            <div>
              <div style={styles.headerTitle}>AI Executive Coach</div>
              <div style={styles.headerSub}>Dallas Launch HQ · 3 businesses · 7 days</div>
            </div>
          </div>
          <div style={styles.statusPill}>
            <div style={styles.statusDot} />
            Live
          </div>
        </div>

        {/* Messages */}
        <div style={styles.messages}>
          {messages.map((msg, i) => (
            <div key={i} style={{ ...styles.msgRow, ...(msg.role === "user" ? styles.msgRowUser : {}) }}>
              {msg.role === "assistant" && <div style={styles.aiAvatar}>EC</div>}
              <div style={{ ...styles.bubble, ...(msg.role === "user" ? styles.bubbleUser : styles.bubbleAI) }}>
                {msg.content.split("\n").map((line, j) => (
                  <span key={j}>
                    {line}
                    {j < msg.content.split("\n").length - 1 && <br />}
                  </span>
                ))}
              </div>
              {msg.role === "user" && <div style={styles.userAvatar}>You</div>}
            </div>
          ))}

          {loading && (
            <div style={styles.msgRow}>
              <div style={styles.aiAvatar}>EC</div>
              <div style={{ ...styles.bubble, ...styles.bubbleAI, ...styles.loadingBubble }}>
                <span style={styles.dot1} />
                <span style={styles.dot2} />
                <span style={styles.dot3} />
              </div>
            </div>
          )}

          {error && (
            <div style={styles.errorBanner}>
              ⚠ {error}
              <button style={styles.retryBtn} onClick={() => sendMessage(messages[messages.length - 1]?.content)}>
                Retry
              </button>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Quick prompts */}
        <div style={styles.chips}>
          {QUICK_PROMPTS.slice(0, 4).map((q, i) => (
            <button key={i} style={styles.chip} onClick={() => sendMessage(q)} disabled={loading}>
              {q.length > 45 ? q.slice(0, 45) + "…" : q}
            </button>
          ))}
        </div>

        {/* Input */}
        <div style={styles.inputRow}>
          <textarea
            ref={inputRef}
            style={styles.textarea}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask your coach anything…"
            rows={1}
            disabled={loading}
          />
          <button style={{ ...styles.sendBtn, opacity: loading || !input.trim() ? 0.5 : 1 }} onClick={() => sendMessage()} disabled={loading || !input.trim()}>
            ↑
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#f5f5f3", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", fontFamily: "system-ui, sans-serif" },
  shell: { width: "100%", maxWidth: "720px", height: "85vh", display: "flex", flexDirection: "column", background: "#fff", borderRadius: "16px", border: "0.5px solid #e0dfd6", overflow: "hidden" },
  header: { padding: "14px 20px", borderBottom: "0.5px solid #e0dfd6", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 },
  headerLeft: { display: "flex", alignItems: "center", gap: "10px" },
  avatar: { width: "36px", height: "36px", borderRadius: "50%", background: "#E1F5EE", color: "#0F6E56", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "600" },
  headerTitle: { fontSize: "15px", fontWeight: "600", color: "#1a1a18" },
  headerSub: { fontSize: "11px", color: "#888780", marginTop: "1px" },
  statusPill: { display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", color: "#5f5e5a", padding: "4px 10px", borderRadius: "20px", border: "0.5px solid #e0dfd6", background: "#f9f8f5" },
  statusDot: { width: "6px", height: "6px", borderRadius: "50%", background: "#1D9E75" },
  messages: { flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: "14px" },
  msgRow: { display: "flex", gap: "8px", alignItems: "flex-start" },
  msgRowUser: { flexDirection: "row-reverse" },
  aiAvatar: { width: "26px", height: "26px", borderRadius: "50%", background: "#E1F5EE", color: "#0F6E56", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", fontWeight: "600", flexShrink: 0, marginTop: "2px" },
  userAvatar: { width: "26px", height: "26px", borderRadius: "50%", background: "#EEEDFE", color: "#534AB7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", fontWeight: "600", flexShrink: 0, marginTop: "2px" },
  bubble: { maxWidth: "76%", padding: "10px 14px", borderRadius: "14px", fontSize: "13px", lineHeight: "1.65", border: "0.5px solid #e0dfd6" },
  bubbleAI: { background: "#fff", color: "#1a1a18", borderBottomLeftRadius: "4px" },
  bubbleUser: { background: "#f5f5f3", color: "#1a1a18", borderBottomRightRadius: "4px" },
  loadingBubble: { display: "flex", gap: "4px", alignItems: "center", padding: "14px" },
  dot1: { width: "5px", height: "5px", borderRadius: "50%", background: "#aaa", display: "inline-block", animation: "pulse 1s infinite" },
  dot2: { width: "5px", height: "5px", borderRadius: "50%", background: "#aaa", display: "inline-block", animation: "pulse 1s infinite 0.2s" },
  dot3: { width: "5px", height: "5px", borderRadius: "50%", background: "#aaa", display: "inline-block", animation: "pulse 1s infinite 0.4s" },
  errorBanner: { padding: "10px 14px", background: "#FCEBEB", border: "0.5px solid #F09595", borderRadius: "8px", fontSize: "12px", color: "#791F1F", display: "flex", alignItems: "center", gap: "10px" },
  retryBtn: { marginLeft: "auto", padding: "4px 10px", borderRadius: "6px", border: "0.5px solid #F09595", background: "#fff", color: "#791F1F", fontSize: "11px", cursor: "pointer" },
  chips: { display: "flex", flexWrap: "wrap", gap: "6px", padding: "10px 20px", borderTop: "0.5px solid #e0dfd6" },
  chip: { fontSize: "11px", padding: "5px 11px", borderRadius: "16px", border: "0.5px solid #e0dfd6", background: "#f9f8f5", cursor: "pointer", color: "#5f5e5a", transition: "all .15s" },
  inputRow: { padding: "12px 16px", borderTop: "0.5px solid #e0dfd6", display: "flex", gap: "8px", alignItems: "flex-end" },
  textarea: { flex: 1, resize: "none", border: "0.5px solid #e0dfd6", borderRadius: "10px", padding: "9px 12px", fontSize: "13px", fontFamily: "system-ui, sans-serif", background: "#f9f8f5", color: "#1a1a18", outline: "none", lineHeight: "1.5" },
  sendBtn: { width: "36px", height: "36px", borderRadius: "10px", background: "#1D9E75", border: "none", cursor: "pointer", color: "#fff", fontSize: "18px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "opacity .15s" },
};

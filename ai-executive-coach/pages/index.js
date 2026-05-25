import { useState, useRef, useEffect } from "react";

const QUICK_PROMPTS = [
  "Which business should I prioritize first as a solo Dallas entrepreneur?",
  "Give me my exact next 3 actions to make money this week.",
  "Write my LinkedIn launch announcement post.",
  "How do I close my first AI Content Studio client?",
  "What niche should I pick for my AI Micro-SaaS?",
  "Give me a first-month revenue projection for all 3 businesses.",
];

const INITIAL_MESSAGE = {
  role: "assistant",
  content:
    "Hey — I'm your AI Executive Coach.\n\nYou're a Dallas entrepreneur building three businesses: an Executive Coach platform, an AI Micro-SaaS tool, and an AI Content Studio.\n\nYou have 7 days to first revenue. What do you want to tackle first?",
};

export default function Home() {
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(overrideText) {
    const text = (overrideText ?? input).trim();
    if (!text || loading) return;

    setInput("");
    setError(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    const next = [...messages, { role: "user", content: text }];
    setMessages(next);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? `Server error (${res.status})`);
      }

      setMessages([...next, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setError(err.message);
      setMessages(messages);
    } finally {
      setLoading(false);
      textareaRef.current?.focus();
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function autoResize(e) {
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }

  const canSend = input.trim().length > 0 && !loading;

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          background: #f0efec;
          color: #1a1a18;
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #d0cec8; border-radius: 2px; }
        @keyframes blink {
          0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
          40%            { opacity: 1;   transform: scale(1);   }
        }
        .dot {
          display: inline-block;
          width: 5px; height: 5px;
          border-radius: 50%;
          background: #999;
          animation: blink 1.2s infinite;
        }
        .dot:nth-child(2) { animation-delay: 0.2s; }
        .dot:nth-child(3) { animation-delay: 0.4s; }
        .chip {
          font-size: 11px;
          padding: 4px 11px;
          border-radius: 14px;
          border: 0.5px solid #dddbd4;
          background: #faf9f6;
          cursor: pointer;
          color: #6a6864;
          white-space: nowrap;
          transition: background 0.15s, color 0.15s;
        }
        .chip:hover:not(:disabled) { background: #eceae4; color: #1a1a18; }
        .chip:disabled { opacity: 0.5; cursor: not-allowed; }
        textarea { font-family: inherit; }
        textarea:focus { outline: none; border-color: #b0aea8 !important; }
        .send-btn {
          width: 38px; height: 38px;
          border-radius: 10px;
          border: none;
          background: #1D9E75;
          color: #fff;
          font-size: 18px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          cursor: pointer;
          transition: background 0.15s;
        }
        .send-btn:disabled { background: #a8d5c4; cursor: not-allowed; }
        .send-btn:not(:disabled):hover { background: #178a63; }
      `}</style>

      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
        <div style={{ width: "100%", maxWidth: "700px", height: "88vh", display: "flex", flexDirection: "column", background: "#fff", borderRadius: "18px", border: "0.5px solid #dddbd4", overflow: "hidden", boxShadow: "0 4px 28px rgba(0,0,0,0.07)" }}>

          {/* Header */}
          <header style={{ padding: "14px 20px", borderBottom: "0.5px solid #eceae4", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#E1F5EE", color: "#0F6E56", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                EC
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600 }}>AI Executive Coach</div>
                <div style={{ fontSize: 11, color: "#8a8880", marginTop: 1 }}>Dallas Launch HQ · 3 businesses · 7 days to revenue</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#6a6864", padding: "4px 10px", borderRadius: 20, border: "0.5px solid #e4e2da", background: "#faf9f6" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#1D9E75" }} />
              Live
            </div>
          </header>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 8px", display: "flex", flexDirection: "column", gap: 16 }}>
            {messages.map((msg, i) => {
              const isUser = msg.role === "user";
              return (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", flexDirection: isUser ? "row-reverse" : "row" }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, marginTop: 2, background: isUser ? "#EEEDFE" : "#E1F5EE", color: isUser ? "#534AB7" : "#0F6E56" }}>
                    {isUser ? "You" : "EC"}
                  </div>
                  <div style={{ maxWidth: "75%", padding: "10px 14px", borderRadius: isUser ? "14px 14px 4px 14px" : "14px 14px 14px 4px", fontSize: 13, lineHeight: 1.7, background: isUser ? "#f4f3f0" : "#fff", border: "0.5px solid #e4e2da", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                    {msg.content}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, background: "#E1F5EE", color: "#0F6E56" }}>EC</div>
                <div style={{ padding: "12px 16px", borderRadius: "14px 14px 14px 4px", border: "0.5px solid #e4e2da", background: "#fff", display: "flex", gap: 4, alignItems: "center" }}>
                  <span className="dot" /><span className="dot" /><span className="dot" />
                </div>
              </div>
            )}

            {error && (
              <div style={{ padding: "10px 14px", background: "#FEF2F2", border: "0.5px solid #FECACA", borderRadius: 8, fontSize: 12, color: "#991B1B", display: "flex", alignItems: "center", gap: 10 }}>
                <span>⚠ {error}</span>
                <button
                  onClick={() => { setError(null); sendMessage(messages[messages.length - 1]?.content); }}
                  style={{ marginLeft: "auto", padding: "3px 10px", borderRadius: 6, border: "0.5px solid #FECACA", background: "#fff", color: "#991B1B", fontSize: 11, cursor: "pointer" }}>
                  Retry
                </button>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Quick prompts */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, padding: "10px 18px", borderTop: "0.5px solid #eceae4" }}>
            {QUICK_PROMPTS.map((q, i) => (
              <button key={i} className="chip" disabled={loading} onClick={() => sendMessage(q)}>
                {q.length > 44 ? q.slice(0, 44) + "…" : q}
              </button>
            ))}
          </div>

          {/* Input */}
          <div style={{ padding: "12px 16px", borderTop: "0.5px solid #eceae4", display: "flex", gap: 8, alignItems: "flex-end" }}>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => { setInput(e.target.value); autoResize(e); }}
              onKeyDown={handleKeyDown}
              placeholder="Ask your coach anything…"
              rows={1}
              disabled={loading}
              style={{ flex: 1, resize: "none", border: "0.5px solid #dddbd4", borderRadius: 10, padding: "9px 12px", fontSize: 13, background: "#faf9f6", color: "#1a1a18", lineHeight: 1.5, minHeight: 38, maxHeight: 120 }}
            />
            <button className="send-btn" onClick={() => sendMessage()} disabled={!canSend} aria-label="Send">
              ↑
            </button>
          </div>

        </div>
      </div>
    </>
  );
}

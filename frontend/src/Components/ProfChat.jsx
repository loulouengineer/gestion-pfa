import { useState, useEffect, useRef, useCallback } from "react";
import { chatApi } from "../api/api";
import { PageHeader, EmptyState, LoadingSkeleton } from "./ui";
import { MessageCircle, Send } from "lucide-react";

const ADMIN_ID   = 1;
const ADMIN_NAME = "Chef de département";
const POLL_MS    = 5000;

function MessageBubble({ msg, isOwn }) {
  const time = new Date(msg.date).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  return (
    <div style={{ display: "flex", flexDirection: isOwn ? "row-reverse" : "row", gap: 8, marginBottom: 12, alignItems: "flex-end" }}>
      {!isOwn && (
        <div style={{
          width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
          background: "var(--blue-100)", border: "1px solid var(--blue-200)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 11, fontWeight: 700, color: "var(--blue-700)",
        }}>
          C
        </div>
      )}
      <div style={{ maxWidth: "72%" }}>
        {!isOwn && (
          <div style={{ fontSize: 10, color: "var(--text-4)", fontWeight: 600, marginBottom: 3, marginLeft: 4 }}>
            {ADMIN_NAME}
          </div>
        )}
        <div style={{
          padding: "9px 13px",
          borderRadius: isOwn ? "14px 4px 14px 14px" : "4px 14px 14px 14px",
          background: isOwn ? "var(--blue-600)" : "var(--surface)",
          color: isOwn ? "#fff" : "var(--text)",
          fontSize: 13, lineHeight: 1.5,
          border: isOwn ? "none" : "1px solid var(--border2)",
          boxShadow: "var(--shadow-xs)",
        }}>
          {msg.contenu}
        </div>
        <div style={{ fontSize: 10, color: "var(--text-4)", marginTop: 3, textAlign: isOwn ? "right" : "left", padding: "0 4px" }}>
          {time} {isOwn && (msg.lu ? "✓✓" : "✓")}
        </div>
      </div>
    </div>
  );
}

export default function ProfChat({ prof }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(true);
  const [sending, setSending]   = useState(false);
  const endRef                  = useRef(null);
  const pollRef                 = useRef(null);

  const loadMessages = useCallback(async () => {
    try {
      const msgs = await chatApi.getConversation(prof.id, ADMIN_ID);
      setMessages(msgs);
      setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [prof.id]);

  useEffect(() => {
    loadMessages();
    pollRef.current = setInterval(loadMessages, POLL_MS);
    return () => clearInterval(pollRef.current);
  }, [loadMessages]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    setSending(true);
    try {
      const msg = await chatApi.sendMessage({
        expediteurId:   prof.id,
        destinataireId: ADMIN_ID,
        contenu:        input.trim(),
      });
      setMessages(p => [...p, msg]);
      setInput("");
      setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    } catch (e) { console.error(e); }
    finally { setSending(false); }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div style={{ animation: "fadeUp 0.4s cubic-bezier(0.16,1,0.3,1)" }}>
      <PageHeader phase="💬" title="Messagerie"
        subtitle={`Conversation avec ${ADMIN_NAME}`} />

      <div style={{
        background: "var(--surface)", borderRadius: "var(--r-xl)",
        border: "1px solid var(--border2)", boxShadow: "var(--shadow-lg)",
        height: 560, display: "flex", flexDirection: "column", overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          padding: "14px 20px", borderBottom: "1px solid var(--border)",
          display: "flex", alignItems: "center", gap: 10,
          background: "var(--surface2)",
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: "var(--blue-100)", border: "1.5px solid var(--blue-200)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, fontWeight: 700, color: "var(--blue-700)",
          }}>
            C
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{ADMIN_NAME}</div>
            <div style={{ fontSize: 11, color: "var(--text-4)" }}>Département Informatique</div>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
          {loading && <LoadingSkeleton rows={3} height={48} />}
          {!loading && messages.length === 0 && (
            <EmptyState icon={MessageCircle}
              title="Démarrez la conversation"
              description="Envoyez un message au chef de département." />
          )}
          {messages.map(msg => (
            <MessageBubble key={msg.id} msg={msg} isOwn={msg.expediteur?.id === prof.id} />
          ))}
          <div ref={endRef} />
        </div>

        {/* Input */}
        <div style={{
          padding: "12px 16px", borderTop: "1px solid var(--border)",
          display: "flex", gap: 8, alignItems: "flex-end",
          background: "var(--surface)",
        }}>
          <textarea
            rows={1}
            placeholder="Votre message..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            style={{
              flex: 1, padding: "10px 14px", borderRadius: "var(--r-lg)",
              border: "1px solid var(--border2)", background: "var(--surface2)",
              color: "var(--text)", fontSize: 13, outline: "none",
              resize: "none", maxHeight: 120, overflowY: "auto", lineHeight: 1.5,
              transition: "border-color 0.15s",
            }}
            onFocus={e => { e.target.style.borderColor = "var(--blue-500)"; }}
            onBlur={e => { e.target.style.borderColor = "var(--border2)"; }}
          />
          <button onClick={handleSend} disabled={!input.trim() || sending}
            style={{
              width: 40, height: 40, borderRadius: "var(--r-md)",
              background: !input.trim() || sending ? "var(--surface3)" : "var(--blue-600)",
              border: "none", cursor: !input.trim() || sending ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "background 0.15s",
              boxShadow: !input.trim() ? "none" : "var(--shadow-blue)",
            }}>
            <Send size={15} color={!input.trim() || sending ? "var(--text-4)" : "#fff"} />
          </button>
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect, useRef, useCallback } from "react";
import { chatApi, professeurApi } from "../api/api";
import { PageHeader, Card, EmptyState, LoadingSkeleton, Button, Badge } from "./ui";
import { MessageCircle, Send, User, Users } from "lucide-react";

const ADMIN_ID = parseInt(localStorage.getItem("userId") || "1");
const POLL_INTERVAL = 5000; // 5 secondes

function ConversationList({ conversations, profs, selectedId, onSelect, loading }) {
  if (loading) return <LoadingSkeleton rows={4} height={56} />;

  // Construire liste de tous les profs avec leur dernière conversation
  const profsAvecConv = profs.map(prof => {
    const conv = conversations.find(c => String(c.userId) === String(prof.id));
    return {
      id:       prof.id,
      nom:      prof.nom,
      dept:     prof.departement,
      lastMsg:  conv?.lastMsg || null,
      date:     conv?.date || null,
      unread:   conv?.unread || 0,
    };
  }).sort((a, b) => {
    if (a.date && b.date) return new Date(b.date) - new Date(a.date);
    if (a.date) return -1;
    if (b.date) return 1;
    return a.nom.localeCompare(b.nom);
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {profsAvecConv.map(prof => (
        <div key={prof.id}
          onClick={() => onSelect(prof.id, prof.nom)}
          style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "10px 14px", borderRadius: "var(--r-md)", cursor: "pointer",
            background: selectedId === prof.id ? "var(--blue-50)" : "transparent",
            border: `1px solid ${selectedId === prof.id ? "var(--blue-200)" : "transparent"}`,
            transition: "all 0.15s",
          }}
          onMouseEnter={e => { if (selectedId !== prof.id) e.currentTarget.style.background = "var(--surface2)"; }}
          onMouseLeave={e => { if (selectedId !== prof.id) e.currentTarget.style.background = "transparent"; }}
        >
          <div style={{
            width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
            background: selectedId === prof.id ? "var(--blue-100)" : "var(--surface3)",
            border: `1.5px solid ${selectedId === prof.id ? "var(--blue-300)" : "var(--border2)"}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, fontWeight: 700,
            color: selectedId === prof.id ? "var(--blue-700)" : "var(--text-3)",
          }}>
            {prof.nom.charAt(0)}
          </div>
          <div style={{ flex: 1, overflow: "hidden" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: selectedId === prof.id ? "var(--blue-700)" : "var(--text)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{prof.nom}</span>
              {prof.unread > 0 && <Badge label={String(prof.unread)} variant="blue" />}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-4)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 1 }}>
              {prof.lastMsg || prof.dept || "Aucun message"}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function MessageBubble({ msg, isOwn }) {
  const time = new Date(msg.date).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  return (
    <div style={{
      display: "flex", flexDirection: isOwn ? "row-reverse" : "row",
      gap: 8, marginBottom: 12, alignItems: "flex-end",
    }}>
      {!isOwn && (
        <div style={{
          width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
          background: "var(--surface3)", border: "1px solid var(--border2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 11, fontWeight: 700, color: "var(--text-3)",
        }}>
          {msg.expediteur?.nom?.charAt(0)}
        </div>
      )}
      <div style={{ maxWidth: "70%" }}>
        {!isOwn && (
          <div style={{ fontSize: 10, color: "var(--text-4)", fontWeight: 600, marginBottom: 3, marginLeft: 4 }}>
            {msg.expediteur?.nom}
          </div>
        )}
        <div style={{
          padding: "9px 13px", borderRadius: isOwn ? "14px 4px 14px 14px" : "4px 14px 14px 14px",
          background: isOwn ? "var(--blue-600)" : "var(--surface)",
          color: isOwn ? "#fff" : "var(--text)",
          fontSize: 13, lineHeight: 1.5,
          border: isOwn ? "none" : "1px solid var(--border2)",
          boxShadow: "var(--shadow-xs)",
        }}>
          {msg.contenu}
        </div>
        <div style={{ fontSize: 10, color: "var(--text-4)", marginTop: 3, textAlign: isOwn ? "right" : "left", paddingRight: isOwn ? 4 : 0, paddingLeft: isOwn ? 0 : 4 }}>
          {time} {isOwn && (msg.lu ? "✓✓" : "✓")}
        </div>
      </div>
    </div>
  );
}

export default function Chat() {
  const [profs, setProfs]               = useState([]);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages]         = useState([]);
  const [selectedId, setSelectedId]     = useState(null);
  const [selectedNom, setSelectedNom]   = useState("");
  const [input, setInput]               = useState("");
  const [loadingProfs, setLoadingProfs] = useState(true);
  const [loadingMsgs, setLoadingMsgs]   = useState(false);
  const [sending, setSending]           = useState(false);
  const messagesEndRef                  = useRef(null);
  const pollRef                         = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Charger profs et conversations
  const loadConversations = useCallback(async () => {
    try {
      const [ps, convs] = await Promise.all([
        professeurApi.getAll(),
        chatApi.getConversations(ADMIN_ID),
      ]);
      setProfs(ps);
      setConversations(convs);
    } catch (e) { console.error(e); }
    finally { setLoadingProfs(false); }
  }, []);

  useEffect(() => {
    loadConversations();
    pollRef.current = setInterval(loadConversations, POLL_INTERVAL);
    return () => clearInterval(pollRef.current);
  }, [loadConversations]);

  // Charger messages de la conversation sélectionnée
  const loadMessages = useCallback(async (profId) => {
    if (!profId) return;
    setLoadingMsgs(true);
    try {
      const msgs = await chatApi.getConversation(ADMIN_ID, profId);
      setMessages(msgs);
      setTimeout(scrollToBottom, 50);
    } catch (e) { console.error(e); }
    finally { setLoadingMsgs(false); }
  }, []);

  // Polling messages de la conversation active
  useEffect(() => {
    if (!selectedId) return;
    const poll = setInterval(() => loadMessages(selectedId), POLL_INTERVAL);
    return () => clearInterval(poll);
  }, [selectedId, loadMessages]);

  const handleSelect = (id, nom) => {
    setSelectedId(id);
    setSelectedNom(nom);
    setMessages([]);
    loadMessages(id);
  };

  const handleSend = async () => {
    if (!input.trim() || !selectedId || sending) return;
    setSending(true);
    try {
      const msg = await chatApi.sendMessage({
        expediteurId:   ADMIN_ID,
        destinataireId: selectedId,
        contenu:        input.trim(),
      });
      setMessages(p => [...p, msg]);
      setInput("");
      setTimeout(scrollToBottom, 50);
    } catch (e) { console.error(e); }
    finally { setSending(false); }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div style={{ animation: "fadeUp 0.4s cubic-bezier(0.16,1,0.3,1)" }}>
      <PageHeader
        title="Messagerie"
        subtitle="Communication entre le chef de département et les professeurs"
        phase="💬"
      />

      <div style={{
        display: "grid", gridTemplateColumns: "280px 1fr", gap: 0,
        background: "var(--surface)", borderRadius: "var(--r-xl)",
        border: "1px solid var(--border2)", boxShadow: "var(--shadow-lg)",
        height: 600, overflow: "hidden",
      }}>
        {/* Sidebar conversations */}
        <div style={{ borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "16px", borderBottom: "1px solid var(--border)" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", display: "flex", alignItems: "center", gap: 6 }}>
              <Users size={14} /> Professeurs
            </div>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
            <ConversationList
              conversations={conversations}
              profs={profs}
              selectedId={selectedId}
              onSelect={handleSelect}
              loading={loadingProfs}
            />
          </div>
        </div>

        {/* Zone messages */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {/* Header conversation */}
          <div style={{
            padding: "14px 20px", borderBottom: "1px solid var(--border)",
            background: selectedId ? "var(--surface)" : "var(--surface2)",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            {selectedId ? (
              <>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: "var(--blue-100)", border: "1.5px solid var(--blue-200)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, fontWeight: 700, color: "var(--blue-700)",
                }}>
                  {selectedNom.charAt(0)}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{selectedNom}</div>
                  <div style={{ fontSize: 11, color: "var(--text-4)" }}>
                    {profs.find(p => p.id === selectedId)?.departement}
                  </div>
                </div>
              </>
            ) : (
              <div style={{ fontSize: 13, color: "var(--text-4)" }}>
                Sélectionnez un professeur pour démarrer une conversation
              </div>
            )}
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
            {!selectedId && (
              <EmptyState icon={MessageCircle}
                title="Aucune conversation sélectionnée"
                description="Choisissez un professeur dans la liste de gauche." />
            )}
            {selectedId && loadingMsgs && <LoadingSkeleton rows={3} height={48} />}
            {selectedId && !loadingMsgs && messages.length === 0 && (
              <EmptyState icon={MessageCircle}
                title="Aucun message"
                description={`Démarrez une conversation avec ${selectedNom}.`} />
            )}
            {messages.map(msg => (
              <MessageBubble
                key={msg.id}
                msg={msg}
                isOwn={msg.expediteur?.id === ADMIN_ID}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          {selectedId && (
            <div style={{
              padding: "12px 16px", borderTop: "1px solid var(--border)",
              display: "flex", gap: 8, alignItems: "flex-end",
              background: "var(--surface)",
            }}>
              <textarea
                rows={1}
                placeholder={`Message à ${selectedNom}...`}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                style={{
                  flex: 1, padding: "10px 14px", borderRadius: "var(--r-lg)",
                  border: "1px solid var(--border2)", background: "var(--surface2)",
                  color: "var(--text)", fontSize: 13, outline: "none", resize: "none",
                  maxHeight: 120, overflowY: "auto", lineHeight: 1.5,
                  transition: "border-color 0.15s",
                }}
                onFocus={e => { e.target.style.borderColor = "var(--blue-500)"; }}
                onBlur={e => { e.target.style.borderColor = "var(--border2)"; }}
              />
              <Button variant="primary" icon={Send} onClick={handleSend}
                disabled={!input.trim() || sending}>
                {sending ? "..." : ""}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
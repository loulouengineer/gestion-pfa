import { useState, useEffect } from "react";
import { Calendar, MessageCircle, BookOpen, ClipboardList, LogOut, ChevronRight } from "lucide-react";
import { chatApi } from "../api/api";
import ProfSoutenances    from "./ProfSoutenances";
import ProfDisponibilites from "./ProfDisponibilites";
import DashebordProf      from "./DashebordProf";
import ProfChat           from "./ProfChat";

const POLL_MS = 8000;

const NAV = [
  { id: "soutenances",    label: "Mes soutenances",    sub: "Jury & notes",         icon: ClipboardList },
  { id: "disponibilites", label: "Mes disponibilités", sub: "Gérer mes plages",     icon: Calendar      },
  { id: "sujets",         label: "Mes sujets",         sub: "Proposer & gérer",     icon: BookOpen      },
  { id: "chat",           label: "Messagerie",         sub: "Chef de département",  icon: MessageCircle },
];

function NavItem({ item, active, onSelect, badge }) {
  const isActive = active === item.id;
  const Icon = item.icon;
  return (
    <button onClick={() => onSelect(item.id)}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        width: "100%", padding: "9px 10px", borderRadius: 10,
        border: "none", textAlign: "left", cursor: "pointer",
        background: isActive ? "rgba(59,130,246,0.16)" : "transparent",
        marginBottom: 2, transition: "all 0.15s", position: "relative",
      }}
      onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
      onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
    >
      {isActive && (
        <div style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: 3, height: 18, background: "#3b82f6", borderRadius: "0 3px 3px 0" }} />
      )}
      <div style={{
        width: 30, height: 30, borderRadius: 8, flexShrink: 0,
        background: isActive ? "rgba(59,130,246,0.25)" : "rgba(255,255,255,0.04)",
        border: `1px solid ${isActive ? "rgba(59,130,246,0.4)" : "rgba(255,255,255,0.06)"}`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon size={13} color={isActive ? "#60a5fa" : "#475569"} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: isActive ? 600 : 400, color: isActive ? "#e2e8f0" : "#64748b" }}>
          {item.label}
        </div>
        <div style={{ fontSize: 10, color: "#334155" }}>{item.sub}</div>
      </div>
      {badge > 0 && (
        <span style={{ minWidth: 16, height: 16, borderRadius: 20, padding: "0 4px", background: "#ef4444", color: "#fff", fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {badge > 9 ? "9+" : badge}
        </span>
      )}
      {isActive && !badge && <ChevronRight size={11} color="#3b82f6" />}
    </button>
  );
}

export default function ProfApp({ prof, onLogout }) {
  const [active, setActive]         = useState("soutenances");
  const [chatUnread, setChatUnread] = useState(0);

  useEffect(() => {
    const fetch = async () => {
      try { const c = await chatApi.getUnread(prof.id); setChatUnread(c.count || 0); } catch {}
    };
    fetch();
    const iv = setInterval(fetch, POLL_MS);
    return () => clearInterval(iv);
  }, [prof.id]);

  const handleSelect = (id) => {
    setActive(id);
    if (id === "chat") setChatUnread(0);
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      <aside style={{
        width: 240, flexShrink: 0, background: "#0f172a",
        display: "flex", flexDirection: "column",
        height: "100vh", position: "sticky", top: 0, overflow: "hidden",
      }}>
        {/* dot-grid texture */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.025,
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.8) 1px, transparent 0)`,
          backgroundSize: "24px 24px", pointerEvents: "none",
        }} />

        {/* Prof header */}
        <div style={{ padding: "20px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", position: "relative", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
            background: "linear-gradient(135deg, #2563eb, #7c3aed)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, fontWeight: 700, color: "#fff",
            boxShadow: "0 4px 12px rgba(37,99,235,0.35)",
          }}>
            {prof?.nom?.charAt(0) || "P"}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {prof?.nom || "Professeur"}
            </div>
            <div style={{ fontSize: 10, color: "#475569" }}>
              {prof?.departement || "Enseignant"}
            </div>
          </div>
        </div>

        <nav style={{ padding: "14px 10px", flex: 1, overflow: "auto" }}>
          {NAV.map(item => (
            <NavItem key={item.id} item={item} active={active}
              onSelect={handleSelect}
              badge={item.id === "chat" ? chatUnread : 0} />
          ))}
        </nav>

        <div style={{ padding: "12px 10px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <button onClick={onLogout}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              width: "100%", padding: "8px 10px", borderRadius: 8,
              border: "1px solid rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.06)",
              cursor: "pointer", color: "#f87171", fontSize: 12, fontWeight: 600,
              transition: "all 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.12)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(239,68,68,0.06)"; }}
          >
            <LogOut size={13} /> Se déconnecter
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, overflow: "auto", padding: "40px 48px" }}>
        <div style={{
          position: "fixed", top: 0, right: 0, width: 700, height: 500,
          pointerEvents: "none", zIndex: 0,
          background: "radial-gradient(ellipse at 80% 0%, rgba(59,130,246,0.04) 0%, transparent 65%)",
        }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 1000, margin: "0 auto" }}>
          {active === "soutenances"    && <ProfSoutenances    prof={prof} />}
          {active === "disponibilites" && <ProfDisponibilites prof={prof} />}
          {active === "sujets"         && <DashebordProf />}
          {active === "chat"           && <ProfChat           prof={prof} />}
        </div>
      </main>
    </div>
  );
}

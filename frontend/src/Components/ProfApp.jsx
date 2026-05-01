import { useState, useEffect } from "react";
import { LogOut, ChevronRight } from "lucide-react";
import { PROF_NAV } from "../nav/prof.js";
import { notificationApi, chatApi } from "../api/api";

import ProfDashboard      from "./ProfDashboard";
import ProfSujets         from "./ProfSujets";
import ProfSoutenances    from "./ProfSoutenances";
import ProfDisponibilites from "./ProfDisponibilites";
import ProfChat           from "./ProfChat";
import ProfNotifications  from "./ProfNotifications";

const POLL_MS = 10000;

function NavItem({ item, active, onClick, badge }) {
  const Icon = item.icon;
  return (
    <button
      onClick={() => onClick(item.id)}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        width: "100%", padding: "9px 10px", borderRadius: 10,
        border: "none", textAlign: "left", cursor: "pointer",
        background: active ? "rgba(59,130,246,0.16)" : "transparent",
        marginBottom: 2, transition: "background 0.15s", position: "relative",
      }}
    >
      {active && (
        <div style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: 3, height: 18, background: "#3b82f6", borderRadius: "0 3px 3px 0" }} />
      )}
      <div style={{
        width: 30, height: 30, borderRadius: 8, flexShrink: 0,
        background: active ? "rgba(59,130,246,0.25)" : "rgba(255,255,255,0.04)",
        border: `1px solid ${active ? "rgba(59,130,246,0.4)" : "rgba(255,255,255,0.06)"}`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon size={13} color={active ? "#60a5fa" : "#475569"} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: active ? 600 : 400, color: active ? "#e2e8f0" : "#64748b" }}>
          {item.label}
        </div>
        <div style={{ fontSize: 10, color: "#334155" }}>{item.sub}</div>
      </div>
      {badge > 0 && (
        <span style={{ minWidth: 16, height: 16, borderRadius: 20, padding: "0 4px", background: "#ef4444", color: "#fff", fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {badge > 9 ? "9+" : badge}
        </span>
      )}
      {active && !badge && <ChevronRight size={11} color="#3b82f6" />}
    </button>
  );
}

export default function ProfApp({ prof, onLogout }) {
  const [active, setActive]         = useState("dashboard");
  const [notifCount, setNotifCount] = useState(0);
  const [chatUnread, setChatUnread] = useState(0);

  useEffect(() => {
    if (!prof?.id) return;
    const poll = async () => {
      try {
        const [n, c] = await Promise.all([
          notificationApi.getUnreadCount(prof.id),
          chatApi.getUnread(prof.id),
        ]);
        setNotifCount(n?.count || 0);
        setChatUnread(c?.count || 0);
      } catch {}
    };
    poll();
    const iv = setInterval(poll, POLL_MS);
    return () => clearInterval(iv);
  }, [prof?.id]);

  const getBadge = (id) => {
    if (id === "notifications") return notifCount;
    if (id === "messagerie")    return chatUnread;
    return 0;
  };

  const renderPage = () => {
    switch (active) {
      case "dashboard":     return <ProfDashboard prof={prof} onNavigate={setActive} />;
      case "sujets":        return <ProfSujets prof={prof} />;
      case "soutenances":   return <ProfSoutenances prof={prof} />;
      case "disponibilites":return <ProfDisponibilites prof={prof} />;
      case "messagerie":    return <ProfChat prof={prof} />;
      case "notifications": return <ProfNotifications prof={prof} onRead={() => setNotifCount(0)} />;
      default:              return null;
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg, #0f172a)" }}>
      {/* Sidebar */}
      <aside style={{
        width: 220, flexShrink: 0,
        background: "var(--surface, #1e293b)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        display: "flex", flexDirection: "column",
        padding: "20px 12px",
        position: "sticky", top: 0, height: "100vh", overflowY: "auto",
      }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#e2e8f0" }}>Gestion PFA</div>
          <div style={{ fontSize: 10, color: "#475569", marginTop: 2 }}>Espace Enseignant</div>
          <div style={{ fontSize: 11, color: "#3b82f6", marginTop: 6, fontWeight: 600 }}>{prof?.nom}</div>
        </div>

        <nav style={{ flex: 1 }}>
          {PROF_NAV.map(item => (
            <NavItem key={item.id} item={item} active={active === item.id} onClick={setActive} badge={getBadge(item.id)} />
          ))}
        </nav>

        <button
          onClick={onLogout}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            width: "100%", padding: "9px 10px", borderRadius: 10,
            border: "none", cursor: "pointer", marginTop: 12,
            background: "rgba(239,68,68,0.1)", color: "#f87171",
            fontSize: 12, fontWeight: 500,
          }}
        >
          <LogOut size={14} /> Déconnexion
        </button>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, padding: "28px 32px", overflowY: "auto" }}>
        {renderPage()}
      </main>
    </div>
  );
}

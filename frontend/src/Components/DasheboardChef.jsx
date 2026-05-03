import { useState, useEffect } from "react";
import { LogOut, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CHEF_NAV } from "../nav/chef";
import { chatApi } from "../api/api";

import SujetsValidation   from "./SujetsValidation";
import SujetsAcceptes     from "./SujetsAcceptes";
import DemandesSujets     from "./DemandesSujets";
import CalendrierCreneaux from "./CalendrierCreneaux";
import Planification      from "./Planification";
import Chat               from "./Chat";

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
        background: active ? "rgba(255,255,255,0.18)" : "transparent",
        marginBottom: 2, transition: "background 0.15s", position: "relative",
      }}
    >
      {active && (
        <div style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: 3, height: 18, background: "#fff", borderRadius: "0 3px 3px 0" }} />
      )}
      <div style={{
        width: 30, height: 30, borderRadius: 8, flexShrink: 0,
        background: active ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.08)",
        border: `1px solid ${active ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.12)"}`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon size={13} color={active ? "#fff" : "rgba(255,255,255,0.6)"} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: active ? 600 : 400, color: active ? "#fff" : "rgba(255,255,255,0.65)" }}>
          {item.label}
        </div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{item.sub}</div>
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



/* ── Main chef app ───────────────────────────────────────────────────────── */
export default function DashboardChef() {
  const [active, setActive]         = useState("sujets");
  const [userName, setUserName]     = useState("Chef");
  const [chatUnread, setChatUnread] = useState(0);
  const chefId = parseInt(localStorage.getItem("userId") || "1");
  const navigate = useNavigate();

  useEffect(() => {
    const storedName = localStorage.getItem("userName");
    if (storedName) setUserName(storedName);
  }, []);

  useEffect(() => {
    const poll = async () => {
      try {
        const c = await chatApi.getUnread(chefId);
        setChatUnread(c?.count || 0);
      } catch {}
    };
    poll();
    const iv = setInterval(poll, POLL_MS);
    return () => clearInterval(iv);
  }, [chefId]);

  const getBadge = (id) => {
    if (id === "messagerie") return chatUnread;
    return 0;
  };

  const renderPage = () => {
    switch (active) {
      case "sujets":         return <SujetsValidation />;
      case "sujets-valides": return <SujetsAcceptes />;
      case "affectations":   return <DemandesSujets />;
      case "creneaux":       return <CalendrierCreneaux />;
      case "soutenances":    return <Planification />;
      case "messagerie":     return <Chat />;
      default:               return null;
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
      {/* Sidebar */}
      <aside style={{
        width: 220, flexShrink: 0,
        background: "#0f172a",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        display: "flex", flexDirection: "column",
        padding: "20px 12px",
        position: "sticky", top: 0, height: "100vh", overflowY: "auto",
      }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>Gestion PFA</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.55)", marginTop: 2 }}>Espace Chef de Département</div>
          <div style={{ fontSize: 11, color: "#bfdbfe", marginTop: 6, fontWeight: 600 }}>{userName}</div>
        </div>

        <nav style={{ flex: 1 }}>
          {CHEF_NAV.map(item => (
            <NavItem key={item.id} item={item} active={active === item.id} onClick={setActive} badge={getBadge(item.id)} />
          ))}
        </nav>

        <button
          onClick={() => { localStorage.clear(); navigate("/login"); }}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            width: "100%", padding: "9px 10px", borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.15)", cursor: "pointer", marginTop: 12,
            background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.75)",
            fontSize: 12, fontWeight: 500,
          }}
        >
          <LogOut size={14} /> Déconnexion
        </button>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, padding: "28px 32px", overflowY: "auto", background: "#f8fafc" }}>
        {renderPage()}
      </main>
    </div>
  );
}

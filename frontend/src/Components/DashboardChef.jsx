import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CHEF_NAV, CHEF_META } from "../nav/chef";
import { chatApi } from "../api/api";

import SujetsValidation   from "./SujetsValidation";
import SujetsAcceptes     from "./SujetsAcceptes";
import DemandesSujets     from "./DemandesSujets";
import CalendrierCreneaux from "./CalendrierCreneaux";
import Planification      from "./Planification";
import Chat               from "./Chat";
import ValidationInscriptions from "./ValidationInscriptions";

const POLL_MS = 10000;

/* ── Main chef app ───────────────────────────────────────────────────────── */
export default function DashboardChef() {
  const [active, setActive]         = useState("validations");
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

  const { title, sub } = CHEF_META[active] || {};

  const renderPage = () => {
    switch (active) {
      case "validations":    return <ValidationInscriptions />;
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
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h2>Gestion PFA</h2>
          <p>Espace Chef de Département</p>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-nav-label">Navigation</div>
          {CHEF_NAV.map(item => {
            const badge = item.id === "messagerie" ? chatUnread : 0;
            return (
              <div 
                key={item.id} 
                className={`nav-item ${active === item.id ? "active" : ""}`} 
                onClick={() => setActive(item.id)}
              >
                <div className="nav-item-number">{item.num}</div>
                <div className="nav-item-text">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <strong>{item.label}</strong>
                    {badge > 0 && (
                      <span className="tab-badge" style={{ marginLeft: 6 }}>{badge}</span>
                    )}
                  </div>
                  <span>{item.sub}</span>
                </div>
              </div>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="footer-name">{userName}</div>
          <div className="footer-binome" style={{ color: "#93C5FD" }}>Administration</div>
          <button
            onClick={() => { localStorage.clear(); navigate("/login"); }}
            style={{ 
              marginTop: 12, width: "100%", padding: "8px", 
              background: "rgba(239,68,68,0.1)", color: "#f87171", 
              border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, 
              cursor: "pointer", fontSize: 12, fontWeight: 600
            }}
          >
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="page-header">
          <h1 className="page-title">{title}</h1>
          <p className="page-subtitle">{sub}</p>
        </header>

        {renderPage()}
      </main>
    </div>
  );
}


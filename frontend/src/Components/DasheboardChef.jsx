import { useState, useEffect } from "react";
import { LogOut, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CHEF_NAV } from "../nav/chef";
import { chatApi } from "../api/api";
import api from "../api/axios";

import SujetsAcceptes     from "./SujetsAcceptes";
import DemandesSujets     from "./DemandesSujets";
import CalendrierCreneaux from "./CalendrierCreneaux";
import Planification      from "./Planification";
import Chat               from "./Chat";

import "./DasheboardChef.css";

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

/* ── Sujets validation tab (Wiem's feature) ─────────────────────────────── */
function SujetsValidation() {
  const [activeTab, setActiveTab] = useState("EN_ATTENTE");
  const [sujets, setSujets] = useState([]);

  useEffect(() => { fetchSujets(); }, []);

  const fetchSujets = async () => {
    try {
      const response = await api.get("/sujets");
      setSujets(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChangerStatut = async (id, statut) => {
    try {
      await api.patch(`/sujets/${id}/statut`, null, { params: { statut } });
      fetchSujets();
    } catch (err) {
      console.error(err);
    }
  };

  const total      = sujets.length;
  const en_attente = sujets.filter(s => s.statut === "EN_ATTENTE").length;
  const approuve   = sujets.filter(s => s.statut === "APPROUVE").length;
  const refuse     = sujets.filter(s => s.statut === "REFUSE").length;
  const filtered   = sujets.filter(s => s.statut === activeTab);

  return (
    <div className="chef-container">
      <div className="chef-stats">
        <div className="chef-stat"><p>Total</p><h2>{total}</h2></div>
        <div className="chef-stat"><p>En attente</p><h2 style={{color:"orange"}}>{en_attente}</h2></div>
        <div className="chef-stat"><p>Approuvés</p><h2 style={{color:"green"}}>{approuve}</h2></div>
        <div className="chef-stat"><p>Refusés</p><h2 style={{color:"red"}}>{refuse}</h2></div>
      </div>

      <div className="chef-tabs">
        <Tab label={`⏱ En attente (${en_attente})`} active={activeTab==="EN_ATTENTE"} onClick={()=>setActiveTab("EN_ATTENTE")} />
        <Tab label={`✓ Approuvés (${approuve})`}    active={activeTab==="APPROUVE"}   onClick={()=>setActiveTab("APPROUVE")}   />
        <Tab label={`⊗ Refusés (${refuse})`}        active={activeTab==="REFUSE"}     onClick={()=>setActiveTab("REFUSE")}     />
      </div>

      <div>
        {filtered.length > 0 ? (
          filtered.map(p => (
            <ProjetCard key={p.id} projet={p} onChangerStatut={handleChangerStatut} />
          ))
        ) : (
          <p className="chef-empty">Aucun sujet</p>
        )}
      </div>
    </div>
  );
}

function ProjetCard({ projet, onChangerStatut }) {
  return (
    <div className="chef-card">
      <h2>{projet.titre}</h2>
      <p>{projet.description}</p>
      <p className="chef-proposer">
        <b>Proposé par :</b> {projet.professeur || projet.enseignant?.nom || "Inconnu"}
      </p>
      <p className="chef-card-label">Mots-clés :</p>
      <div className="chef-tags">
        {projet.motsCles?.map((m,i) => <span key={i} className="chef-tag">{m}</span>)}
      </div>
      <p className="chef-card-label">Compétences requises :</p>
      <div className="chef-tags">
        {projet.competences?.map((c,i) => <span key={i} className="chef-tag">{c}</span>)}
      </div>
      <p className="chef-date">Date de proposition : {projet.dateProposition}</p>
      {projet.statut === "EN_ATTENTE" && (
        <div className="chef-actions">
          <button className="chef-btn chef-btn-green" onClick={()=>onChangerStatut(projet.id,"APPROUVE")}>
            ✔ Approuver
          </button>
          <button className="chef-btn chef-btn-red" onClick={()=>onChangerStatut(projet.id,"REFUSE")}>
            ✖ Refuser
          </button>
        </div>
      )}
    </div>
  );
}

function Tab({ label, active, onClick }) {
  return (
    <button className={active ? "chef-tab active" : "chef-tab"} onClick={onClick}>
      {label}
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
          <div style={{ fontSize: 10, color: "#475569", marginTop: 2 }}>Espace Chef de Département</div>
          <div style={{ fontSize: 11, color: "#3b82f6", marginTop: 6, fontWeight: 600 }}>{userName}</div>
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
            border: "none", cursor: "pointer", marginTop: 12,
            background: "rgba(239,68,68,0.1)", color: "#f87171",
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

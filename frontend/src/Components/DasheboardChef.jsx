import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "./DasheboardChef.css";

export default function DashboardChef() {
  const [activeTab, setActiveTab] = useState("EN_ATTENTE");
  const [userName, setUserName] = useState("Chef");
  const [sujets, setSujets] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const storedName = localStorage.getItem("userName");
    if (storedName) setUserName(storedName);
    fetchSujets();
  }, []);

  const fetchSujets = async () => {
    try {
      const response = await api.get("/api/sujets");
      setSujets(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleChangerStatut = async (id, statut) => {
    try {
      await api.patch(`/api/sujets/${id}/statut?statut=${statut}`);
      fetchSujets();
    } catch (err) {
      console.error(err);
    }
  };

  const total = sujets.length;
  const en_attente = sujets.filter(s => s.statut === "EN_ATTENTE").length;
  const approuve = sujets.filter(s => s.statut === "APPROUVE").length;
  const refuse = sujets.filter(s => s.statut === "REFUSE").length;
  const filtered = sujets.filter(s => s.statut === activeTab);

  return (
    <div className="chef-container">
{/* HEADER */}
<div className="chef-header">
  <div className="chef-header-left">
    <div className="chef-header-icon">🛡️</div>
    <div>
      <h1>Espace Chef de Département</h1>
      <p>{userName}</p>
    </div>
  </div>
  <button className="chef-logout-btn" onClick={handleLogout}>
    ↪ Déconnexion
  </button>
</div>

      {/* STATS */}
      <div className="chef-stats">
        <div className="chef-stat">
          <p>Total</p>
          <h2>{total}</h2>
        </div>
        <div className="chef-stat">
          <p>En attente</p>
          <h2 style={{color: "orange"}}>{en_attente}</h2>
        </div>
        <div className="chef-stat">
          <p>Approuvés</p>
          <h2 style={{color: "green"}}>{approuve}</h2>
        </div>
        <div className="chef-stat">
          <p>Refusés</p>
          <h2 style={{color: "red"}}>{refuse}</h2>
        </div>
      </div>

      {/* TABS */}
      <div className="chef-tabs">
        <Tab label={`⏱ En attente (${en_attente})`} active={activeTab==="EN_ATTENTE"} onClick={()=>setActiveTab("EN_ATTENTE")} />
        <Tab label={`✓ Approuvés (${approuve})`} active={activeTab==="APPROUVE"} onClick={()=>setActiveTab("APPROUVE")} />
        <Tab label={`⊗ Refusés (${refuse})`} active={activeTab==="REFUSE"} onClick={()=>setActiveTab("REFUSE")} />
      </div>

      {/* LISTE */}
      <div>
        {filtered.length > 0 ? (
          filtered.map(p => (
            <ProjetCard key={p.id} projet={p} onChangerStatut={handleChangerStatut}/>
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
        <b>Proposé par :</b> {projet.enseignant?.nom || "Inconnu"}
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
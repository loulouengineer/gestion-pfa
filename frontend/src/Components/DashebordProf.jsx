import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "./DasheboardProf.css";

export default function DashboardProf() {
  const [userName, setUserName] = useState("Enseignant");
  const [sujets, setSujets] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newSujet, setNewSujet] = useState({
    titre: "", description: "", mots: "", skills: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    const storedName = localStorage.getItem("userName");
    if (storedName) setUserName(storedName);
    fetchSujets();
  }, []);

  const fetchSujets = async () => {
    try {
      const res = await api.get("/sujets/mes-sujets");
      setSujets(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleAddSujet = async () => {
    if (!newSujet.titre || !newSujet.description) return;
    setLoading(true);
    setError("");
    try {
      await api.post("/sujets", {
        titre: newSujet.titre,
        description: newSujet.description,
        motsCles: newSujet.mots.split(",").map(m => m.trim()).filter(m => m),
        competences: newSujet.skills.split(",").map(s => s.trim()).filter(s => s),
      });
      setNewSujet({ titre: "", description: "", mots: "", skills: "" });
      setShowModal(false);
      fetchSujets();
    } catch {
      setError("Erreur lors de l'ajout");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSujet = async (id) => {
    try {
      await api.delete(`/api/sujets/${id}`);
      fetchSujets();
    } catch (err) {
      console.error(err);
    }
  };

  const total = sujets.length;
  const en_attente = sujets.filter(s => s.statut === "EN_ATTENTE").length;
  const approuve = sujets.filter(s => s.statut === "APPROUVE").length;
  const refuse = sujets.filter(s => s.statut === "REFUSE").length;

  return (
    <div className="prof-container">

      {/* HEADER */}
      <div className="prof-header">
        <div className="prof-header-left">
          <div className="prof-header-icon">📘</div>
          <div>
            <h1>Espace Enseignant</h1>
            <p>{userName}</p>
          </div>
        </div>
        <button className="prof-logout-btn" onClick={handleLogout}>
          ↪ Déconnexion
        </button>
      </div>

      {/* STATS */}
      <div className="prof-stats">
        <div className="prof-stat">
          <p>Total</p>
          <h2>{total}</h2>
        </div>
        <div className="prof-stat">
          <p>En attente</p>
          <h2 style={{color: "#f97316"}}>{en_attente}</h2>
        </div>
        <div className="prof-stat">
          <p>Approuvés</p>
          <h2 style={{color: "#16a34a"}}>{approuve}</h2>
        </div>
        <div className="prof-stat">
          <p>Refusés</p>
          <h2 style={{color: "#dc2626"}}>{refuse}</h2>
        </div>
      </div>

      {/* SECTION */}
      <div className="prof-section">
        <h2>Mes Sujets PFA</h2>
        <button className="prof-add-btn" onClick={() => setShowModal(true)}>
          + Proposer un sujet
        </button>
      </div>

      {/* LISTE */}
      <div>
        {sujets.length > 0 ? (
          sujets.map(s => (
            <SujetCard key={s.id} sujet={s} onDelete={handleDeleteSujet}/>
          ))
        ) : (
          <div className="prof-empty-state">
            <div className="empty-icon">📖</div>
            <p>Vous n'avez pas encore proposé de sujet</p>
            <span>Cliquez sur "Proposer un sujet" pour commencer</span>
          </div>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="prof-modal">
          <div className="prof-modal-content">
            <h2>Proposer un nouveau sujet</h2>
            {error && <p className="prof-error">{error}</p>}

            <label>Titre</label>
            <input
              placeholder="Titre du sujet"
              value={newSujet.titre}
              onChange={e => setNewSujet({...newSujet, titre: e.target.value})}
            />

            <label>Description</label>
            <textarea
              placeholder="Description du sujet"
              rows="4"
              value={newSujet.description}
              onChange={e => setNewSujet({...newSujet, description: e.target.value})}
            />

            <label>Mots-clés (séparés par virgules)</label>
            <input
              placeholder="ex: Java, Spring, Web"
              value={newSujet.mots}
              onChange={e => setNewSujet({...newSujet, mots: e.target.value})}
            />

            <label>Compétences (séparées par virgules)</label>
            <input
              placeholder="ex: Python, SQL, React"
              value={newSujet.skills}
              onChange={e => setNewSujet({...newSujet, skills: e.target.value})}
            />

            <div className="prof-actions">
              <button onClick={() => setShowModal(false)}>Annuler</button>
              <button onClick={handleAddSujet}>
                {loading ? "Envoi..." : "Proposer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SujetCard({ sujet, onDelete }) {
  const statusClass = sujet.statut === "EN_ATTENTE" ? "en-attente"
    : sujet.statut === "APPROUVE" ? "approuve" : "refuse";

  const statusLabel = sujet.statut === "EN_ATTENTE" ? "⏱ En attente"
    : sujet.statut === "APPROUVE" ? "✓ Approuvé" : "⊗ Refusé";

  return (
    <div className="prof-card">
      <h2>{sujet.titre}</h2>
      <p className="prof-card-desc">{sujet.description}</p>

      <p className="prof-card-label">Mots-clés :</p>
      <div className="prof-tags">
        {sujet.motsCles?.map((m,i) => (
          <span key={i} className="prof-tag">{m}</span>
        ))}
      </div>

      <p className="prof-card-label">Compétences requises :</p>
      <div className="prof-tags">
        {sujet.competences?.map((c,i) => (
          <span key={i} className="prof-tag">{c}</span>
        ))}
      </div>

      <div className="prof-footer">
        <span className="date">Date : {sujet.dateProposition}</span>
        <div style={{display: "flex", alignItems: "center", gap: "0.75rem"}}>
          <span className={`prof-status ${statusClass}`}>{statusLabel}</span>
          {sujet.statut === "EN_ATTENTE" && (
            <button className="prof-delete-btn" onClick={() => onDelete(sujet.id)}>
              Supprimer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "./DashboardEtudiant.css";

export default function DashboardEtudiant() {
  const [recommandations, setRecommandations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("Étudiant");
  const navigate = useNavigate();

  useEffect(() => {
    const storedName = localStorage.getItem("userName");
    if (storedName) setUserName(storedName);
    fetchRecommandations();
  }, []);

  const fetchRecommandations = async () => {
    setLoading(true);
    try {
      const response = await api.get("/etudiants/recommandations");
      setRecommandations(response.data);
    } catch (err) {
      console.error("Erreur recommandations", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="etudiant-container">

      {/* HEADER */}
      <div className="etudiant-header">
        <div className="etudiant-header-left">
          <div className="etudiant-header-icon">🎓</div>
          <div>
            <h1>Espace Étudiant</h1>
            <p>{userName}</p>
          </div>
        </div>
        <button className="etudiant-logout-btn" onClick={handleLogout}>
          ↪ Déconnexion
        </button>
      </div>

      {/* TITRE */}
      <div className="etudiant-section">
        <h2>🤖 Recommandations IA</h2>
        <p className="etudiant-subtitle">
          Les sujets PFA les plus adaptés à votre profil
        </p>
      </div>

      {/* LOADING */}
      {loading ? (
        <div className="etudiant-loading">
          <div className="spinner"></div>
          <p>L'IA analyse votre profil...</p>
        </div>
      ) : recommandations.length === 0 ? (
        <div className="etudiant-empty">
          <div className="empty-icon">📭</div>
          <p>Aucune recommandation disponible pour le moment</p>
          <span>Les sujets doivent être approuvés par le chef de département</span>
        </div>
      ) : (
        <div className="etudiant-liste">
          {recommandations.map((rec, index) => (
            <RecommandationCard key={rec.sujetId} rec={rec} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}

function RecommandationCard({ rec, index }) {
  const [showIA, setShowIA] = useState(false);

  const scoreColor = rec.score >= 70 ? "#16a34a"
    : rec.score >= 50 ? "#f97316"
    : "#dc2626";

  const scoreBg = rec.score >= 70 ? "#f0fdf4"
    : rec.score >= 50 ? "#fff7ed"
    : "#fef2f2";

  return (
    <div className="rec-card">

      {/* RANG ET SCORE */}
      <div className="rec-header">
        <div className="rec-rang">
          <span className="rang-badge">#{index + 1}</span>
          <span className="sujet-rang">Rang sujet : {rec.rangSujet || "N/A"}</span>
        </div>
        <div className="rec-score" style={{background: scoreBg, color: scoreColor}}>
          Score : {rec.score}%
        </div>
      </div>

      {/* TITRE ET DESCRIPTION */}
      <h2 className="rec-titre">{rec.titre}</h2>
      <p className="rec-description">{rec.description}</p>

      {/* EXPLICATION */}
      <div className="rec-explication">
        <span>📊</span> {rec.explication}
      </div>

      {/* ANALYSE IA */}
      <div className="rec-ia-section">
        <button
          className="rec-ia-btn"
          onClick={() => setShowIA(!showIA)}
        >
          🤖 {showIA ? "Masquer l'analyse IA" : "Voir l'analyse IA"}
        </button>

        {showIA && (
          <div className="rec-ia-content">
            <p>{rec.analyseIA}</p>
          </div>
        )}
      </div>
    </div>
  );
}
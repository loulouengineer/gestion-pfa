import React, { useState } from "react";
import { Lock, GraduationCap } from "lucide-react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import api from "../api/axios";
import "./Login.css";

export default function ResetPassword() {
  const [motDePasse, setMotDePasse] = useState("");
  const [confirmer, setConfirmer] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const handleSubmit = async () => {
    if (!motDePasse || !confirmer) { setError("Veuillez remplir tous les champs"); return; }
    if (motDePasse !== confirmer) { setError("Les mots de passe ne correspondent pas"); return; }
    if (motDePasse.length < 8) { setError("Le mot de passe doit contenir au moins 8 caractères"); return; }

    setLoading(true);
    setError("");
    try {
      await api.post("/auth/reinitialiser-mdp", { token, motDePasse });
      setMessage("Mot de passe réinitialisé ! Redirection...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Token invalide ou expiré");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <GraduationCap className="icon-blue" />
          <h1>PFA Manager</h1>
        </div>

        <h2>Nouveau mot de passe</h2>
        <p className="login-subtitle">Choisissez un nouveau mot de passe sécurisé</p>

        {error && <div className="login-error">{error}</div>}
        {message && (
          <div style={{ background: "#f0fdf4", color: "#16a34a", padding: "10px 14px", borderRadius: "8px", fontSize: "13px", marginBottom: "16px", border: "1px solid #bbf7d0" }}>
            ✓ {message}
          </div>
        )}

        <label>Nouveau mot de passe</label>
        <div className="input-group">
          <Lock className="input-icon" />
          <input
            type="password" placeholder="********"
            value={motDePasse} onChange={(e) => setMotDePasse(e.target.value)}
          />
        </div>

        <label>Confirmer le mot de passe</label>
        <div className="input-group">
          <Lock className="input-icon" />
          <input
            type="password" placeholder="********"
            value={confirmer} onChange={(e) => setConfirmer(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
        </div>

        <button className="login-btn" onClick={handleSubmit} disabled={loading}>
          {loading ? "Réinitialisation..." : "Réinitialiser"}
        </button>

        <p className="signup-text">
          <Link to="/login">← Retour à la connexion</Link>
        </p>
      </div>
    </div>
  );
}
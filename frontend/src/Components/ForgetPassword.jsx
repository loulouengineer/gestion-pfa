import React, { useState } from "react";
import { Mail, GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import "./Login.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email) { setError("Veuillez entrer votre email"); return; }
    setLoading(true);
    setError("");
    setMessage("");
    try {
      await api.post("/auth/mot-de-passe-oublie", { email });
      setMessage("Un email de réinitialisation a été envoyé. Vérifiez votre boîte mail.");
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'envoi");
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

        <h2>Mot de passe oublié</h2>
        <p className="login-subtitle">
          Entrez votre email pour recevoir un lien de réinitialisation
        </p>

        {error && <div className="login-error">{error}</div>}
        {message && (
          <div style={{ background: "#f0fdf4", color: "#16a34a", padding: "10px 14px", borderRadius: "8px", fontSize: "13px", marginBottom: "16px", border: "1px solid #bbf7d0" }}>
            ✓ {message}
          </div>
        )}

        <label>Email</label>
        <div className="input-group">
          <Mail className="input-icon" />
          <input
            type="email"
            placeholder="votre.email@enicar.ucar.tn"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
        </div>

        <button className="login-btn" onClick={handleSubmit} disabled={loading}>
          {loading ? "Envoi..." : "Envoyer le lien"}
        </button>

        <p className="signup-text">
          <Link to="/login">← Retour à la connexion</Link>
        </p>
      </div>
    </div>
  );
}
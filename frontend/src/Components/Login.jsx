import React, { useState } from "react";
import { Mail, Lock, GraduationCap } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import "./Login.css"; // Import du fichier CSS

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    setLoading(true);
    setError("");

    try {
      let response;

      // Essaie d'abord login normal (enseignant/chef)
      try {
        response = await api.post("/api/auth/login", { email, password });
      } catch (err) {
        // Si échec, essaie login étudiant
        response = await api.post("/api/auth/login-etudiant", { email, password });
      }

      const { token, role, nom } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem("userName", nom);

      if (role === "ENSEIGNANT") navigate("/dashboard-prof");
      else if (role === "CHEF_DEPT") navigate("/dashboard-chef");
      else if (role === "ETUDIANT") navigate("/dashboard-etudiant");
      else navigate("/");

    } catch (err) {
      setError("Email ou mot de passe incorrect");
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

        <h2>Connexion</h2>
        <p className="login-subtitle">
          Entrez vos identifiants pour accéder à votre compte
        </p>

        {error && <div className="login-error">{error}</div>}

        <label>Email</label>
        <div className="input-group">
          <Mail className="input-icon" />
          <input
            type="email"
            placeholder="votre.email@école.fr"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <label>Mot de passe</label>
        <div className="input-group">
          <Lock className="input-icon" />
          <input
            type="password"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />
        </div>

        <div className="forgot-password">
          <a href="#">Mot de passe oublié ?</a>
        </div>

        <button className="login-btn"
        onClick={handleLogin}
         disabled={loading}>
          {loading ? "Connexion..." : "Se connecter"}
        </button>

        <p className="signup-text">
          Pas encore de compte ?{" "}
          <Link to="/register">S'inscrire</Link>
        </p>
      </div>
    </div>
  );
}
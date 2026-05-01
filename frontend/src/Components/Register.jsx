import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import "./Register.css";

const Register = () => {
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("ENSEIGNANT");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [moyenne, setMoyenne] = useState("");
  const [competences, setCompetences] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!nom || !prenom || !email || !password || !confirmPassword) {
      setError("Veuillez remplir tous les champs");
      return;
    }
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }
    if (role === "ETUDIANT" && !moyenne) {
      setError("Veuillez entrer votre moyenne");
      return;
    }

    setLoading(true);
    setError("");

    try {
      let response;

      if (role === "ETUDIANT") {
        response = await api.post("/etudiants/inscrire", {
          nom,
          prenom,
          email,
          password,
          moyenne: parseFloat(moyenne),
          competences: competences
            .split(",")
            .map(c => c.trim())
            .filter(c => c),
        });

        const loginResponse = await api.post("/auth/login-etudiant", {
          email,
          password,
        });

        localStorage.setItem("token", loginResponse.data.token);
        localStorage.setItem("role", loginResponse.data.role);
        localStorage.setItem("userName", loginResponse.data.nom);
        navigate("/dashboard-etudiant");

      } else {
        // ✅ prenom ajouté ici
        response = await api.post("/auth/register", {
          nom,
          prenom,
          email,
          password,
          role,
        });

        localStorage.setItem("token", response.data.token);
        localStorage.setItem("role", response.data.role);
        localStorage.setItem("userName", response.data.nom);

        if (response.data.role === "ENSEIGNANT") {
          navigate("/dashboard-prof");
        } else if (response.data.role === "CHEF_DEPT") {
          navigate("/dashboard-chef");
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-logo">
        🎓 <span>PFA MANAGER</span>
      </div>

      <div className="register-card">
        <h2>Créer un compte</h2>
        <p className="register-subtitle">
          Remplissez le formulaire pour créer votre compte
        </p>

        {error && <div className="register-error">{error}</div>}

        <div className="register-form">
          <div className="form-group">
            <label>Nom</label>
            <input
              type="text"
              placeholder="Votre nom"
              value={nom}
              onChange={e => setNom(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Prénom</label>
            <input
              type="text"
              placeholder="Votre prénom"
              value={prenom}
              onChange={e => setPrenom(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="votre.email@ecole.fr"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Rôle</label>
            <select value={role} onChange={e => setRole(e.target.value)}>
              <option value="ENSEIGNANT">Enseignant</option>
              <option value="CHEF_DEPT">Chef de département</option>
              <option value="ETUDIANT">Étudiant</option>
            </select>
          </div>

          {role === "ETUDIANT" && (
            <>
              <div className="form-group">
                <label>Moyenne générale (sur 20)</label>
                <input
                  type="number"
                  placeholder="ex: 14.5"
                  min="0"
                  max="20"
                  step="0.1"
                  value={moyenne}
                  onChange={e => setMoyenne(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Compétences (séparées par virgules)</label>
                <input
                  type="text"
                  placeholder="ex: Java, React, Python"
                  value={competences}
                  onChange={e => setCompetences(e.target.value)}
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label>Mot de passe</label>
            <input
              type="password"
              placeholder="********"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Confirmer le mot de passe</label>
            <input
              type="password"
              placeholder="********"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
            />
          </div>

          <button
            onClick={handleRegister}
            disabled={loading}
            className="register-btn"
          >
            {loading ? "Inscription..." : "S'inscrire"}
          </button>
        </div>

        <p className="register-footer">
          Vous avez déjà un compte ?{" "}
          <Link to="/login" className="register-link">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
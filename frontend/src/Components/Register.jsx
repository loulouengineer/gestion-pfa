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

    // Validation email
    if (!email.endsWith("@enicar.ucar.tn")) {
      setError("L'email doit être une adresse @enicar.ucar.tn");
      return;
    }

    // Validation mot de passe
    const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    if (!passwordRegex.test(password)) {
      setError("Le mot de passe doit contenir au moins 8 caractères, 1 majuscule, 1 chiffre et 1 caractère spécial");
      return;
    }

    // Validation nom et prénom
    const nomRegex = /^[a-zA-ZÀ-ÿ\s\-']{2,50}$/;
    if (!nomRegex.test(nom)) {
      setError("Le nom ne doit contenir que des lettres (2-50 caractères)");
      return;
    }
    if (!nomRegex.test(prenom)) {
      setError("Le prénom ne doit contenir que des lettres (2-50 caractères)");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Tous les rôles passent par le même endpoint
      await api.post("/auth/register", {
        nom,
        prenom,
        email,
        password,
        role,
      });

      // Pas de login automatique — compte EN_ATTENTE
      alert("Votre demande a été envoyée. Attendez la validation du chef de département.");
      navigate("/login");
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
              <option value="ETUDIANT">Étudiant</option>
            </select>
          </div>

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
import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      {/* Navbar */}
      <header className="navbar">
        <div className="logo">
          🎓 <span>PFA MANAGER</span>
        </div>
        <div className="nav-buttons">
          <button className="btn-outline" onClick={() => navigate("/login")}>
            Connexion
          </button>
          <button className="btn-primary" onClick={() => navigate("/register")}>
            S'inscrire
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="hero">
        <h1 className="hero-title">
          Plateforme d'Affectation <br />
          <span className="highlight">des Sujets PFA</span>
        </h1>
        <p className="hero-description">
          Simplifiez le processus d'affectation des projets de fin d'année avec
          une plateforme intelligente qui utilise l'IA pour recommander les
          meilleurs sujets.
        </p>
        <div className="hero-buttons">
          <button className="btn-primary" onClick={() => navigate("/register")}>
            Commencer maintenant
          </button>
          <button className="btn-outline" onClick={() => navigate("/login")}>
            Se connecter
          </button>
        </div>
      </section>

      {/* Cards */}
<section className="cards">
  <div className="card">
    <div className="card-icon blue">📘</div>
    <h3>Pour les Enseignants</h3>
    <p>
      Proposez vos sujets de PFA facilement et suivez leur validation en
      temps réel.
    </p>
  </div>
  <div className="card">
    <div className="card-icon purple">🏫</div>
    <h3>Pour les Chefs de Département</h3>
    <p>
      Validez ou refusez les sujets proposés avec un processus de review simplifié.
    </p>
  </div>
  <div className="card">
    <div className="card-icon green">🎓</div>
    <h3>Pour les Étudiants</h3>
    <p>
      Recevez des recommandations IA personnalisées et choisissez vos 5
      sujets préférés.
    </p>
  </div>
</section>

      {/* Stats */}
      <section className="stats">
        <div>
          <h2 className="blue">20+</h2>
          <p>Sujets disponibles</p>
        </div>
        <div>
          <h2 className="purple">5</h2>
          <p>Choix par binôme</p>
        </div>
        <div>
          <h2 className="green">100%</h2>
          <p>Automatisé avec IA</p>
        </div>
      </section>
    </div>
  );
};

export default Home;
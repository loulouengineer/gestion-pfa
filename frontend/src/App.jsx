import { Routes, Route, useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";

import SujetsDisponibles from "./components/SujetsDisponibles";
import ChoixSujets from "./components/ChoixSujets";
import Recommandations from "./components/Recommandations";
import StatsBar from "./components/StatsBar";
import Binome from "./components/Binome";

import { getSujetsDisponibles, getBinomeActuel } from "./api/api";

import Home from "./Components/Home.jsx";
import Login from "./Components/Login.jsx";
import Register from "./Components/Register.jsx";
import DashboardChef from "./Components/DasheboardChef.jsx";
import DashboardProf from "./Components/DashebordProf.jsx";
import Profiletudiant from "./Components/Profiletudiant.jsx";
import ForgetPassword from "./Components/ForgetPassword.jsx";
import ResetPassword from "./Components/ResetPassword.jsx";

import "./App.css";

const NAV_ITEMS = [
  { num: 1, label: "Mon binôme", sub: "Associer un partenaire", id: "binome" },
  { num: 2, label: "Sujets", sub: "Parcourir & sélectionner", id: "sujets" },
  { num: 3, label: "Recommandations", sub: "Suggestions IA", id: "recommandations" },
  { num: 4, label: "Mes vœux", sub: "Ordre & soumission", id: "mes-choix" },
  { num: 5, label: "Mon profil", sub: "Mes informations", id: "profil" },  // ← AJOUT
];

const PAGE_META = {
  binome: { title: "Mon binôme", sub: "Associez-vous à un partenaire" },
  sujets: { title: "Sujets disponibles", sub: "Parcourir et sélectionner" },
  recommandations: { title: "Recommandations IA", sub: "Suggestions personnalisées" },
  "mes-choix": { title: "Mes vœux", sub: "Classement final" },
  profil: { title: "Mon profil", sub: "Mes informations académiques" },
};

function DashboardEtudiant() {
  const navigate = useNavigate();
  const [onglet, setOnglet] = useState("binome");
  const [choixActuels, setChoixActuels] = useState([]);
  const [nouveauSujet, setNouveauSujet] = useState(null);
  const [totalSujets, setTotalSujets] = useState(0);
  const [binome, setBinome] = useState(null);

  // ← Récupère les vraies données depuis localStorage
  const userId = localStorage.getItem("userId");
  const userName = localStorage.getItem("userName") || "Étudiant";

  const etudiant = {
    id: userId,
    nom: userName,
    matricule: localStorage.getItem("matricule") || "",
    moyenne: parseFloat(localStorage.getItem("moyenne")) || 0,
  };

  useEffect(() => {
    getSujetsDisponibles()
      .then((res) => setTotalSujets(res.data.length))
      .catch(console.error);

    getBinomeActuel(userId)
      .then((res) => setBinome(res.data))
      .catch((err) => {
        if (err.response?.status !== 404) console.error(err);
        // 404 = pas de binôme, setBinome reste null
      });
  }, [userId]);

  const handleSelectionner = (sujet) => {
    setNouveauSujet(sujet);
    setOnglet("mes-choix");
  };

  const { title, sub } = PAGE_META[onglet];

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h2>Gestion PFA</h2>
          <p>Plateforme de gestion</p>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-nav-label">Navigation</div>
          {NAV_ITEMS.map((item) => (
            <div
              key={item.id}
              className={`nav-item ${onglet === item.id ? "active" : ""}`}
              onClick={() => setOnglet(item.id)}
            >
              <div className="nav-item-number">{item.num}</div>
              <div className="nav-item-text">
                <strong>{item.label}</strong>
                <span>{item.sub}</span>
              </div>
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="footer-name">{etudiant.nom}</div>
          <div className="footer-binome">✓ Binôme: {binome ? "Associé" : "Non associé"}</div>

          <div className="footer-backend">v1.0 • API Active</div>
        </div>
      </aside>

      <main className="main-content">
        <h1>{title}</h1>
        <p>{sub}</p>

        <StatsBar
          totalSujets={totalSujets}
          totalChoix={choixActuels.length}
          moyenne={etudiant.moyenne}
          binome={binome}
        />

        {onglet === "binome" && (
          <Binome
            etudiant={etudiant}
            binome={binome}
            onBinomeFormed={setBinome}
            onBinomeDissous={() => setBinome(null)} // ← ajoute
          />
        )}

        {onglet === "sujets" && (
          <SujetsDisponibles
            onSelectionner={handleSelectionner}
            choixActuels={choixActuels}
          />
        )}

        {onglet === "recommandations" && (
          <Recommandations
            etudiant={etudiant}
            onSelectionner={handleSelectionner}
            choixActuels={choixActuels}
          />
        )}

        {onglet === "mes-choix" && (
          <ChoixSujets
            etudiantId={userId} // ← vrai ID
            nouveauSujet={nouveauSujet}
            onChoixChange={setChoixActuels}
          />
        )}

        {onglet === "profil" && (
          <Profiletudiant />
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/mot-de-passe-oublie" element={<ForgetPassword />} />
      <Route path="/reinitialiser-mdp" element={<ResetPassword />} />
      <Route path="/dashboard-chef" element={<DashboardChef />} />
      <Route path="/dashboard-prof" element={<DashboardProf />} />
      <Route path="/dashboard-etudiant" element={<DashboardEtudiant />} />

    </Routes>
  );
}
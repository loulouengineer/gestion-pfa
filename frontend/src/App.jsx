import { Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";

import RoleGuard     from "./guards/RoleGuard.jsx";
import { ETUDIANT_NAV, ETUDIANT_META } from "./nav/etudiant.js";

import SujetsDisponibles from "./Components/SujetsDisponibles";
import ChoixSujets       from "./Components/ChoixSujets";
import Recommandations   from "./Components/Recommandations";
import StatsBar          from "./Components/StatsBar";
import Binome            from "./Components/Binome";
import Profiletudiant    from "./Components/Profiletudiant.jsx";
import DashboardPage     from "./Components/DashboardPage";

import { getSujetsDisponibles, getBinomeActuel, soutenanceApi, professeurApi, etudiantApi, choixSujetApi } from "./api/api";

import Home           from "./Components/Home.jsx";
import Login          from "./Components/Login.jsx";
import Register       from "./Components/Register.jsx";
import ForgetPassword from "./Components/ForgetPassword.jsx";
import ResetPassword  from "./Components/ResetPassword.jsx";
import DashboardChef  from "./Components/DashboardChef.jsx";
import ProfApp        from "./Components/ProfApp.jsx";

import "./App.css";

/* ── Student results (own soutenance) ──────────────────────────────────── */
function EtudiantResultats({ userId }) {
  const [soutenance, setSoutenance] = useState(null);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    if (!userId) return;
    soutenanceApi.getByEtudiant(userId)
      .then(data => setSoutenance(data))
      .catch(() => setSoutenance(null))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <div style={{ color: "#64748b", padding: 20 }}>Chargement…</div>;

  if (!soutenance) return (
    <div style={{ textAlign: "center", padding: "60px 20px", color: "#475569" }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
      <div style={{ fontSize: 15, fontWeight: 600 }}>Aucun résultat disponible</div>
      <div style={{ fontSize: 13, color: "#64748b", marginTop: 6 }}>
        Votre soutenance n'a pas encore eu lieu ou n'a pas encore été notée.
      </div>
    </div>
  );

  const note  = soutenance.note;
  const noteColor = note == null ? "#64748b"
    : note >= 16 ? "#10b981" : note >= 12 ? "#3b82f6" : note >= 10 ? "#f59e0b" : "#ef4444";

  const statutColor = { PLANIFIEE: "#3b82f6", EN_COURS: "#8b5cf6", TERMINEE: "#10b981", ANNULEE: "#ef4444" };

  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", marginBottom: 20 }}>Ma soutenance</h2>

      {/* Status + Note */}
      <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 140, background: `${statutColor[soutenance.statut] || "#64748b"}15`, border: `1px solid ${statutColor[soutenance.statut] || "#64748b"}40`, borderRadius: 14, padding: "20px 24px" }}>
          <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em" }}>Statut</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: statutColor[soutenance.statut] || "#64748b", marginTop: 6 }}>{soutenance.statut}</div>
        </div>

        {note != null && (
          <div style={{ flex: 1, minWidth: 140, background: `${noteColor}15`, border: `1px solid ${noteColor}40`, borderRadius: 14, padding: "20px 24px" }}>
            <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em" }}>Note</div>
            <div style={{ fontSize: 36, fontWeight: 800, color: noteColor, marginTop: 4, lineHeight: 1 }}>
              {note.toFixed(1)} <span style={{ fontSize: 14, fontWeight: 400 }}>/20</span>
            </div>
            {soutenance.mention && <div style={{ fontSize: 12, color: noteColor, marginTop: 4, fontWeight: 600 }}>{soutenance.mention}</div>}
          </div>
        )}
      </div>

      {/* Details */}
      {soutenance.creneau && (
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: "20px 24px", marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", marginBottom: 12 }}>📅 Informations de soutenance</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
            {[
              { label: "Date",      val: soutenance.creneau.date },
              { label: "Heure",     val: `${soutenance.creneau.heureDebut?.slice(0,5)} – ${soutenance.creneau.heureFin?.slice(0,5)}` },
              { label: "Salle",     val: soutenance.creneau.salle },
              { label: "Sujet",     val: soutenance.sujet?.titre },
            ].filter(r => r.val).map(r => (
              <div key={r.label}>
                <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em" }}>{r.label}</div>
                <div style={{ fontSize: 13, color: "#1e293b", marginTop: 3, fontWeight: 500 }}>{r.val}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {soutenance.observations && (
        <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 14, padding: "16px 20px" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 6 }}>Observations du jury</div>
          <div style={{ fontSize: 13, color: "#334155", lineHeight: 1.7 }}>{soutenance.observations}</div>
        </div>
      )}
    </div>
  );
}

/* ── Étudiant dashboard ─────────────────────────────────────────────────── */
function DashboardEtudiant() {
  const [onglet, setOnglet]             = useState("accueil");
  const [choixActuels, setChoixActuels] = useState([]);
  const [nouveauSujet, setNouveauSujet] = useState(null);
  const [totalSujets, setTotalSujets]   = useState(0);
  const [binome, setBinome]             = useState(null);

  const userId   = localStorage.getItem("userId");
  const userName = localStorage.getItem("userName") || "Étudiant";
  const [etudiant, setEtudiant] = useState({
    id: userId, nom: userName,
    matricule: localStorage.getItem("matricule") || "",
    moyenne:   parseFloat(localStorage.getItem("moyenne")) || 0,
  });

  useEffect(() => {
    // Fetch profile (for moyenne)
    etudiantApi.getProfil()
      .then(r => {
        setEtudiant(prev => ({ ...prev, moyenne: r.moyenne }));
        localStorage.setItem("moyenne", r.moyenne);
      })
      .catch(err => console.error("Erreur profil:", err));

    // Fetch total subjects
    getSujetsDisponibles().then(r => setTotalSujets(r.data.length)).catch(() => {});

    // Fetch binome and choices
    getBinomeActuel(userId)
      .then(r => {
        setBinome(r.data);
        if (r.data && r.data.id) {
          choixSujetApi.getParBinome(r.data.id)
            .then(res => setChoixActuels(res.data))
            .catch(err => console.error("Erreur choix:", err));
        }
      })
      .catch(err => { if (err.response?.status !== 404) console.error(err); });
  }, [userId]);

  const { title, sub } = ETUDIANT_META[onglet] || {};

  const renderPage = () => {
    switch (onglet) {
      case "accueil":         return <DashboardPage onNavigate={setOnglet} />;
      case "binome":          return <Binome etudiant={etudiant} binome={binome} onBinomeFormed={setBinome} onBinomeDissous={() => setBinome(null)} />;
      case "sujets":          return <SujetsDisponibles onSelectionner={s => { setNouveauSujet(s); setOnglet("mes-choix"); }} choixActuels={choixActuels} />;
      case "recommandations": return <Recommandations etudiant={etudiant} onSelectionner={s => { setNouveauSujet(s); setOnglet("mes-choix"); }} choixActuels={choixActuels} />;
      case "mes-choix":       return <ChoixSujets etudiantId={userId} nouveauSujet={nouveauSujet} onChoixChange={setChoixActuels} />;
      case "profil":          return <Profiletudiant />;
      case "resultats":       return <EtudiantResultats userId={userId} />;
      default:                return null;
    }
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h2>Gestion PFA</h2>
          <p>Espace Étudiant</p>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-nav-label">Navigation</div>
          {ETUDIANT_NAV.map(item => (
            <div key={item.id} className={`nav-item ${onglet === item.id ? "active" : ""}`} onClick={() => setOnglet(item.id)}>
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
          <div className="footer-binome">Binôme : {binome ? "✓ Associé" : "Non associé"}</div>
          <button
            onClick={() => { localStorage.clear(); window.location.href = "/login"; }}
            style={{ marginTop: 8, width: "100%", padding: "6px", background: "rgba(239,68,68,0.1)", color: "#f87171", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 11 }}
          >
            Déconnexion
          </button>
        </div>
      </aside>

      <main className="main-content">
        {title && <><h1>{title}</h1><p>{sub}</p></>}
        <StatsBar totalSujets={totalSujets} totalChoix={choixActuels.length} moyenne={etudiant.moyenne} binome={binome} />
        {renderPage()}
      </main>
    </div>
  );
}

/* ── Prof route: resolves real Professeur ID via API ────────────────────── */
function ProfRoute() {
  const [prof, setProf] = useState(null);

  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    const name  = localStorage.getItem("userName") || "Professeur";
    if (!email) { setProf({ id: null, nom: name }); return; }
    professeurApi.getByEmail(email)
      .then(p => setProf({ id: p.id, nom: p.nom || name, departement: p.departement }))
      .catch(() => setProf({ id: Number(localStorage.getItem("userId")) || null, nom: name }));
  }, []);

  if (!prof) return null;
  return (
    <ProfApp
      prof={prof}
      onLogout={() => { localStorage.clear(); window.location.href = "/login"; }}
    />
  );
}

/* ── Routes ─────────────────────────────────────────────────────────────── */
export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/"                    element={<Home />} />
      <Route path="/login"               element={<Login />} />
      <Route path="/register"            element={<Register />} />
      <Route path="/mot-de-passe-oublie" element={<ForgetPassword />} />
      <Route path="/reinitialiser-mdp"   element={<ResetPassword />} />

      {/* Chef département only */}
      <Route path="/dashboard-chef" element={
        <RoleGuard allowedRole="CHEF_DEPT">
          <DashboardChef />
        </RoleGuard>
      } />

      {/* Professeur only */}
      <Route path="/prof" element={
        <RoleGuard allowedRole="ENSEIGNANT">
          <ProfRoute />
        </RoleGuard>
      } />

      {/* Étudiant only */}
      <Route path="/dashboard-etudiant" element={
        <RoleGuard allowedRole="ETUDIANT">
          <DashboardEtudiant />
        </RoleGuard>
      } />

      {/* Catch-all: redirect to login */}
      <Route path="*" element={<Login />} />
    </Routes>
  );
}

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const s = {
  layout: { display: "flex", minHeight: "100vh", background: "#f1f5f9", fontFamily: "'Segoe UI', sans-serif" },
  sidebar: { width: "240px", background: "#1e293b", color: "#fff", display: "flex", flexDirection: "column", flexShrink: 0, minHeight: "100vh" },
  sidebarLogo: { padding: "24px 20px 20px", borderBottom: "1px solid #334155" },
  logoIcon: { width: "36px", height: "36px", background: "#3b82f6", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", marginBottom: "10px" },
  logoTitle: { fontSize: "15px", fontWeight: 600, margin: 0 },
  logoSub: { fontSize: "11px", color: "#94a3b8", marginTop: "2px" },
  navSection: { padding: "16px 20px 8px", fontSize: "10px", color: "#64748b", letterSpacing: ".08em", textTransform: "uppercase" },
  navItem: (active) => ({ display: "flex", alignItems: "center", gap: "12px", padding: "11px 20px", cursor: "pointer", background: active ? "#3b82f6" : "transparent", color: active ? "#fff" : "#cbd5e1", transition: "background .15s", borderLeft: active ? "3px solid #60a5fa" : "3px solid transparent" }),
  navDot: (active) => ({ width: "8px", height: "8px", borderRadius: "50%", flexShrink: 0, background: active ? "#fff" : "#475569" }),
  navLabel: { fontSize: "13px", fontWeight: 500 },
  navSub: (active) => ({ fontSize: "11px", color: active ? "rgba(255,255,255,.75)" : "#64748b" }),
  footer: { marginTop: "auto", padding: "16px 20px", borderTop: "1px solid #334155" },
  footerName: { fontSize: "13px", fontWeight: 500 },
  footerRole: { fontSize: "11px", color: "#60a5fa", marginTop: "2px" },
  logoutBtn: { marginTop: "12px", width: "100%", padding: "8px", background: "transparent", border: "1px solid #334155", color: "#94a3b8", borderRadius: "6px", cursor: "pointer", fontSize: "12px", transition: "all .15s" },
  main: { flex: 1, padding: "28px 32px", overflowY: "auto" },
  pageTitle: { fontSize: "24px", fontWeight: 700, color: "#1e293b", margin: 0 },
  pageSub: { fontSize: "14px", color: "#64748b", marginTop: "4px", marginBottom: "24px" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" },
  statCard: (color) => ({ background: "#fff", borderRadius: "12px", padding: "20px", border: "0.5px solid #e2e8f0", borderTop: `3px solid ${color}` }),
  statLabel: { fontSize: "12px", color: "#64748b", fontWeight: 500, textTransform: "uppercase", letterSpacing: ".05em" },
  statValue: (color) => ({ fontSize: "28px", fontWeight: 700, color, marginTop: "8px" }),
  sectionRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" },
  sectionTitle: { fontSize: "16px", fontWeight: 600, color: "#1e293b" },
  addBtn: { padding: "9px 18px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: 500, transition: "background .15s" },
  card: { background: "#fff", borderRadius: "12px", padding: "20px 24px", border: "0.5px solid #e2e8f0", marginBottom: "12px" },
  cardTitle: { fontSize: "16px", fontWeight: 600, color: "#1e293b", marginBottom: "6px" },
  cardDesc: { fontSize: "13px", color: "#64748b", lineHeight: 1.6, marginBottom: "12px" },
  tagsRow: { display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "10px" },
  tag: { background: "#eff6ff", color: "#1d4ed8", padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 500 },
  tagGreen: { background: "#f0fdf4", color: "#15803d", padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 500 },
  cardFooter: { display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "12px", borderTop: "0.5px solid #f1f5f9", marginTop: "4px" },
  date: { fontSize: "12px", color: "#94a3b8" },
  badge: (statut) => ({ display: "inline-block", padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 500, background: statut === "APPROUVE" ? "#f0fdf4" : statut === "REFUSE" ? "#fef2f2" : "#fefce8", color: statut === "APPROUVE" ? "#16a34a" : statut === "REFUSE" ? "#dc2626" : "#ca8a04" }),
  deleteBtn: { padding: "5px 12px", background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: 500 },
  empty: { textAlign: "center", padding: "60px", color: "#94a3b8", background: "#fff", borderRadius: "12px", border: "0.5px solid #e2e8f0", fontSize: "14px" },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  modal: { background: "#fff", borderRadius: "16px", padding: "28px", width: "100%", maxWidth: "500px", boxShadow: "0 20px 60px rgba(0,0,0,.15)" },
  modalTitle: { fontSize: "18px", fontWeight: 600, color: "#1e293b", marginBottom: "20px" },
  fieldLabel: { fontSize: "13px", fontWeight: 500, color: "#374151", display: "block", marginBottom: "6px" },
  input: { width: "100%", padding: "9px 12px", border: "0.5px solid #cbd5e1", borderRadius: "8px", fontSize: "14px", marginBottom: "14px", boxSizing: "border-box", outline: "none" },
  textarea: { width: "100%", padding: "9px 12px", border: "0.5px solid #cbd5e1", borderRadius: "8px", fontSize: "14px", marginBottom: "14px", boxSizing: "border-box", resize: "vertical", outline: "none" },
  modalActions: { display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "4px" },
  btnCancel: { padding: "9px 18px", background: "#f1f5f9", color: "#64748b", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: 500 },
  btnSubmit: { padding: "9px 18px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: 500 },
  errorMsg: { background: "#fef2f2", color: "#dc2626", padding: "10px 14px", borderRadius: "8px", fontSize: "13px", marginBottom: "14px", border: "1px solid #fecaca" },
};

export default function DashboardProf() {
  const [userName, setUserName] = useState("Enseignant");
  const [sujets, setSujets] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newSujet, setNewSujet] = useState({ titre: "", description: "", mots: "", skills: "" });
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
    } catch (err) { console.error(err); }
  };

  const handleLogout = () => { localStorage.clear(); navigate("/login"); };

  const handleAddSujet = async () => {
    if (!newSujet.titre || !newSujet.description) { setError("Titre et description obligatoires"); return; }
    setLoading(true); setError("");
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
    } catch { setError("Erreur lors de l'ajout"); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    try { await api.delete(`/sujets/${id}`); fetchSujets(); }
    catch (err) { console.error(err); }
  };

  const total = sujets.length;
  const en_attente = sujets.filter(s => s.statut === "EN_ATTENTE").length;
  const approuve = sujets.filter(s => s.statut === "APPROUVE").length;
  const refuse = sujets.filter(s => s.statut === "REFUSE").length;

  return (
    <div style={s.layout}>

      {/* SIDEBAR */}
      <aside style={s.sidebar}>
        <div style={s.sidebarLogo}>
          <div style={s.logoIcon}>📘</div>
          <h2 style={s.logoTitle}>Gestion PFA</h2>
          <p style={s.logoSub}>Espace Enseignant</p>
        </div>

        <div style={s.navSection}>Navigation</div>

        <div style={s.navItem(true)}>
          <div style={s.navDot(true)} />
          <div>
            <div style={s.navLabel}>Mes sujets</div>
            <div style={s.navSub(true)}>Proposer & suivre</div>
          </div>
        </div>

        <div style={s.footer}>
          <div style={s.footerName}>{userName}</div>
          <div style={s.footerRole}>✓ Enseignant</div>
          <button
            style={s.logoutBtn}
            onMouseEnter={e => { e.target.style.background = "#334155"; e.target.style.color = "#fff"; }}
            onMouseLeave={e => { e.target.style.background = "transparent"; e.target.style.color = "#94a3b8"; }}
            onClick={handleLogout}
          >
            ↪ Déconnexion
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main style={s.main}>
        <h1 style={s.pageTitle}>Mes sujets PFA</h1>
        <p style={s.pageSub}>Proposez et suivez l'état de vos sujets</p>

        {/* STATS */}
        <div style={s.statsGrid}>
          {[
            { label: "Total", value: total, color: "#3b82f6" },
            { label: "En attente", value: en_attente, color: "#f59e0b" },
            { label: "Approuvés", value: approuve, color: "#16a34a" },
            { label: "Refusés", value: refuse, color: "#dc2626" },
          ].map(st => (
            <div key={st.label} style={s.statCard(st.color)}>
              <div style={s.statLabel}>{st.label}</div>
              <div style={s.statValue(st.color)}>{st.value}</div>
            </div>
          ))}
        </div>

        {/* SECTION HEADER */}
        <div style={s.sectionRow}>
          <span style={s.sectionTitle}>Liste des sujets</span>
          <button
            style={s.addBtn}
            onMouseEnter={e => e.target.style.background = "#2563eb"}
            onMouseLeave={e => e.target.style.background = "#3b82f6"}
            onClick={() => setShowModal(true)}
          >
            + Proposer un sujet
          </button>
        </div>

        {/* LISTE */}
        {sujets.length === 0 ? (
          <div style={s.empty}>
            <div style={{ fontSize: "32px", marginBottom: "8px" }}>📖</div>
            Vous n'avez pas encore proposé de sujet
          </div>
        ) : (
          sujets.map(sujet => (
            <div key={sujet.id} style={s.card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <h2 style={s.cardTitle}>{sujet.titre}</h2>
                <span style={s.badge(sujet.statut)}>
                  {sujet.statut === "APPROUVE" ? "✓ Approuvé" : sujet.statut === "REFUSE" ? "⊗ Refusé" : "⏱ En attente"}
                </span>
              </div>

              <p style={s.cardDesc}>{sujet.description}</p>

              {sujet.motsCles?.length > 0 && (
                <div style={s.tagsRow}>
                  {sujet.motsCles.map((m, i) => <span key={i} style={s.tag}>{m}</span>)}
                </div>
              )}

              {sujet.competences?.length > 0 && (
                <div style={s.tagsRow}>
                  {sujet.competences.map((c, i) => <span key={i} style={s.tagGreen}>{c}</span>)}
                </div>
              )}

              <div style={s.cardFooter}>
                <span style={s.date}>{sujet.dateProposition ? `Date : ${sujet.dateProposition}` : ""}</span>
                {sujet.statut === "EN_ATTENTE" && (
                  <button
                    style={s.deleteBtn}
                    onMouseEnter={e => e.target.style.background = "#fee2e2"}
                    onMouseLeave={e => e.target.style.background = "#fef2f2"}
                    onClick={() => handleDelete(sujet.id)}
                  >
                    ✖ Supprimer
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </main>

      {/* MODAL */}
      {showModal && (
        <div style={s.overlay} onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div style={s.modal}>
            <h2 style={s.modalTitle}>Proposer un nouveau sujet</h2>

            {error && <div style={s.errorMsg}>✗ {error}</div>}

            <label style={s.fieldLabel}>Titre *</label>
            <input
              style={s.input} placeholder="Titre du sujet"
              value={newSujet.titre}
              onChange={e => setNewSujet({ ...newSujet, titre: e.target.value })}
            />

            <label style={s.fieldLabel}>Description *</label>
            <textarea
              style={s.textarea} placeholder="Description détaillée du sujet" rows="4"
              value={newSujet.description}
              onChange={e => setNewSujet({ ...newSujet, description: e.target.value })}
            />

            <label style={s.fieldLabel}>Mots-clés <span style={{ color: "#94a3b8", fontWeight: 400 }}>(séparés par virgules)</span></label>
            <input
              style={s.input} placeholder="ex: Java, Spring, Web"
              value={newSujet.mots}
              onChange={e => setNewSujet({ ...newSujet, mots: e.target.value })}
            />

            <label style={s.fieldLabel}>Compétences <span style={{ color: "#94a3b8", fontWeight: 400 }}>(séparées par virgules)</span></label>
            <input
              style={s.input} placeholder="ex: Python, SQL, React"
              value={newSujet.skills}
              onChange={e => setNewSujet({ ...newSujet, skills: e.target.value })}
            />

            <div style={s.modalActions}>
              <button style={s.btnCancel} onClick={() => { setShowModal(false); setError(""); }}>
                Annuler
              </button>
              <button
                style={{ ...s.btnSubmit, opacity: loading ? 0.7 : 1 }}
                onClick={handleAddSujet}
                disabled={loading}
              >
                {loading ? "Envoi..." : "Proposer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const SIDEBAR_WIDTH = "240px";

const styles = {
  layout: {
    display: "flex", minHeight: "100vh", background: "#f1f5f9", fontFamily: "'Segoe UI', sans-serif"
  },
  sidebar: {
    width: SIDEBAR_WIDTH, background: "#1e293b", color: "#fff",
    display: "flex", flexDirection: "column", flexShrink: 0, minHeight: "100vh"
  },
  sidebarLogo: {
    padding: "24px 20px 20px", borderBottom: "1px solid #334155"
  },
  sidebarLogoIcon: {
    width: "36px", height: "36px", background: "#3b82f6", borderRadius: "8px",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "18px", marginBottom: "10px"
  },
  sidebarTitle: { fontSize: "15px", fontWeight: 600, margin: 0 },
  sidebarSub: { fontSize: "11px", color: "#94a3b8", marginTop: "2px" },
  navSection: {
    padding: "16px 20px 8px", fontSize: "10px", color: "#64748b",
    letterSpacing: ".08em", textTransform: "uppercase"
  },
  navItem: (active) => ({
    display: "flex", alignItems: "center", gap: "12px",
    padding: "11px 20px", cursor: "pointer",
    background: active ? "#3b82f6" : "transparent",
    color: active ? "#fff" : "#cbd5e1",
    transition: "background .15s", borderLeft: active ? "3px solid #60a5fa" : "3px solid transparent"
  }),
  navDot: (active) => ({
    width: "8px", height: "8px", borderRadius: "50%", flexShrink: 0,
    background: active ? "#fff" : "#475569"
  }),
  navLabel: { fontSize: "13px", fontWeight: 500 },
  navSub: (active) => ({ fontSize: "11px", color: active ? "rgba(255,255,255,.75)" : "#64748b" }),
  sidebarFooter: {
    marginTop: "auto", padding: "16px 20px", borderTop: "1px solid #334155"
  },
  footerName: { fontSize: "13px", fontWeight: 500 },
  footerRole: { fontSize: "11px", color: "#4ade80", marginTop: "2px" },
  logoutBtn: {
    marginTop: "12px", width: "100%", padding: "8px", background: "transparent",
    border: "1px solid #334155", color: "#94a3b8", borderRadius: "6px",
    cursor: "pointer", fontSize: "12px", transition: "all .15s"
  },
  main: { flex: 1, padding: "28px 32px", overflowY: "auto" },
  pageHeader: { marginBottom: "24px" },
  pageTitle: { fontSize: "24px", fontWeight: 700, color: "#1e293b", margin: 0 },
  pageSub: { fontSize: "14px", color: "#64748b", marginTop: "4px" },
  statsGrid: {
    display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px"
  },
  statCard: (color) => ({
    background: "#fff", borderRadius: "12px", padding: "20px",
    border: "0.5px solid #e2e8f0", borderTop: `3px solid ${color}`
  }),
  statLabel: { fontSize: "12px", color: "#64748b", fontWeight: 500, textTransform: "uppercase", letterSpacing: ".05em" },
  statValue: (color) => ({ fontSize: "28px", fontWeight: 700, color, marginTop: "8px" }),
  tabBar: {
    display: "flex", gap: "4px", background: "#fff", padding: "6px",
    borderRadius: "10px", border: "0.5px solid #e2e8f0", marginBottom: "20px",
    width: "fit-content"
  },
  tab: (active) => ({
    padding: "8px 18px", borderRadius: "7px", border: "none", cursor: "pointer",
    fontSize: "13px", fontWeight: 500, transition: "all .15s",
    background: active ? "#3b82f6" : "transparent",
    color: active ? "#fff" : "#64748b"
  }),
  cardList: { display: "flex", flexDirection: "column", gap: "12px" },
  card: {
    background: "#fff", borderRadius: "12px", padding: "20px 24px",
    border: "0.5px solid #e2e8f0", transition: "box-shadow .2s"
  },
  cardTitle: { fontSize: "16px", fontWeight: 600, color: "#1e293b", marginBottom: "6px" },
  cardDesc: { fontSize: "13px", color: "#64748b", lineHeight: 1.6, marginBottom: "12px" },
  cardMeta: { fontSize: "12px", color: "#94a3b8", marginBottom: "10px" },
  tagsRow: { display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "10px" },
  tag: {
    background: "#eff6ff", color: "#1d4ed8", padding: "3px 10px",
    borderRadius: "20px", fontSize: "11px", fontWeight: 500
  },
  tagGreen: {
    background: "#f0fdf4", color: "#15803d", padding: "3px 10px",
    borderRadius: "20px", fontSize: "11px", fontWeight: 500
  },
  actions: { display: "flex", gap: "8px", marginTop: "14px", paddingTop: "14px", borderTop: "0.5px solid #f1f5f9" },
  btnApprove: {
    padding: "8px 18px", background: "#f0fdf4", color: "#16a34a",
    border: "1px solid #bbf7d0", borderRadius: "8px", cursor: "pointer",
    fontSize: "13px", fontWeight: 500, transition: "all .15s"
  },
  btnRefuse: {
    padding: "8px 18px", background: "#fef2f2", color: "#dc2626",
    border: "1px solid #fecaca", borderRadius: "8px", cursor: "pointer",
    fontSize: "13px", fontWeight: 500, transition: "all .15s"
  },
  empty: {
    textAlign: "center", padding: "60px", color: "#94a3b8",
    background: "#fff", borderRadius: "12px", border: "0.5px solid #e2e8f0",
    fontSize: "14px"
  },
  statusBadge: (statut) => ({
    display: "inline-block", padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 500,
    background: statut === "APPROUVE" ? "#f0fdf4" : statut === "REFUSE" ? "#fef2f2" : "#fefce8",
    color: statut === "APPROUVE" ? "#16a34a" : statut === "REFUSE" ? "#dc2626" : "#ca8a04"
  })
};

const NAV_ITEMS = [
  { id: "sujets", label: "Gestion des sujets", sub: "Approuver & refuser" },
];

export default function DashboardChef() {
  const [activeTab, setActiveTab] = useState("EN_ATTENTE");
  const [userName, setUserName] = useState("Chef");
  const [sujets, setSujets] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const storedName = localStorage.getItem("userName");
    if (storedName) setUserName(storedName);
    fetchSujets();
  }, []);

  const fetchSujets = async () => {
    try {
      const response = await api.get("/sujets");
      setSujets(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleChangerStatut = async (id, statut) => {
    try {
      await api.patch(`/sujets/${id}/statut?statut=${statut}`);
      fetchSujets();
    } catch (err) {
      console.error(err);
    }
  };

  const total = sujets.length;
  const en_attente = sujets.filter(s => s.statut === "EN_ATTENTE").length;
  const approuve = sujets.filter(s => s.statut === "APPROUVE").length;
  const refuse = sujets.filter(s => s.statut === "REFUSE").length;
  const filtered = sujets.filter(s => s.statut === activeTab);

  return (
    <div style={styles.layout}>

      {/* SIDEBAR */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarLogo}>
          <div style={styles.sidebarLogoIcon}>🛡️</div>
          <h2 style={styles.sidebarTitle}>Gestion PFA</h2>
          <p style={styles.sidebarSub}>Espace Chef de Département</p>
        </div>

        <div style={styles.navSection}>Navigation</div>

        {NAV_ITEMS.map(item => (
          <div key={item.id} style={styles.navItem(true)}>
            <div style={styles.navDot(true)} />
            <div>
              <div style={styles.navLabel}>{item.label}</div>
              <div style={styles.navSub(true)}>{item.sub}</div>
            </div>
          </div>
        ))}

        <div style={styles.sidebarFooter}>
          <div style={styles.footerName}>{userName}</div>
          <div style={styles.footerRole}>✓ Chef de département</div>
          <button
            style={styles.logoutBtn}
            onMouseEnter={e => { e.target.style.background = "#334155"; e.target.style.color = "#fff"; }}
            onMouseLeave={e => { e.target.style.background = "transparent"; e.target.style.color = "#94a3b8"; }}
            onClick={handleLogout}
          >
            ↪ Déconnexion
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main style={styles.main}>
        <div style={styles.pageHeader}>
          <h1 style={styles.pageTitle}>Gestion des sujets</h1>
          <p style={styles.pageSub}>Approuvez ou refusez les propositions des enseignants</p>
        </div>

        {/* STATS */}
        <div style={styles.statsGrid}>
          {[
            { label: "Total", value: total, color: "#3b82f6" },
            { label: "En attente", value: en_attente, color: "#f59e0b" },
            { label: "Approuvés", value: approuve, color: "#16a34a" },
            { label: "Refusés", value: refuse, color: "#dc2626" },
          ].map(s => (
            <div key={s.label} style={styles.statCard(s.color)}>
              <div style={styles.statLabel}>{s.label}</div>
              <div style={styles.statValue(s.color)}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* TABS */}
        <div style={styles.tabBar}>
          {[
            { id: "EN_ATTENTE", label: `⏱ En attente (${en_attente})` },
            { id: "APPROUVE", label: `✓ Approuvés (${approuve})` },
            { id: "REFUSE", label: `⊗ Refusés (${refuse})` },
          ].map(t => (
            <button key={t.id} style={styles.tab(activeTab === t.id)} onClick={() => setActiveTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        {/* LISTE */}
        <div style={styles.cardList}>
          {filtered.length === 0 ? (
            <div style={styles.empty}>
              <div style={{ fontSize: "32px", marginBottom: "8px" }}>📭</div>
              Aucun sujet dans cette catégorie
            </div>
          ) : (
            filtered.map(p => (
              <ProjetCard key={p.id} projet={p} onChangerStatut={handleChangerStatut} />
            ))
          )}
        </div>
      </main>
    </div>
  );
}

function ProjetCard({ projet, onChangerStatut }) {
  return (
    <div style={styles.card}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <h2 style={styles.cardTitle}>{projet.titre}</h2>
        <span style={styles.statusBadge(projet.statut)}>
          {projet.statut === "APPROUVE" ? "✓ Approuvé" : projet.statut === "REFUSE" ? "⊗ Refusé" : "⏱ En attente"}
        </span>
      </div>

      <p style={styles.cardDesc}>{projet.description}</p>

      <p style={styles.cardMeta}>
        Proposé par : <strong style={{ color: "#374151" }}>{projet.enseignant?.nom || "Inconnu"}</strong>
        {projet.dateProposition && (
          <span> · {projet.dateProposition}</span>
        )}
      </p>

      {projet.motsCles?.length > 0 && (
        <div style={styles.tagsRow}>
          {projet.motsCles.map((m, i) => <span key={i} style={styles.tag}>{m}</span>)}
        </div>
      )}

      {projet.competences?.length > 0 && (
        <div style={styles.tagsRow}>
          {projet.competences.map((c, i) => <span key={i} style={styles.tagGreen}>{c}</span>)}
        </div>
      )}

      {projet.statut === "EN_ATTENTE" && (
        <div style={styles.actions}>
          <button
            style={styles.btnApprove}
            onMouseEnter={e => e.target.style.background = "#dcfce7"}
            onMouseLeave={e => e.target.style.background = "#f0fdf4"}
            onClick={() => onChangerStatut(projet.id, "APPROUVE")}
          >
            ✔ Approuver
          </button>
          <button
            style={styles.btnRefuse}
            onMouseEnter={e => e.target.style.background = "#fee2e2"}
            onMouseLeave={e => e.target.style.background = "#fef2f2"}
            onClick={() => onChangerStatut(projet.id, "REFUSE")}
          >
            ✖ Refuser
          </button>
        </div>
      )}
    </div>
  );
}
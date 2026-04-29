import { useLocation, useNavigate } from "react-router-dom";

const phases = [
  { num: "⌂", label: "Accueil", sub: "Tableau de bord", path: "/dashboard" },
  { num: 1, label: "Mon binôme", sub: "Associer un partenaire", path: "/mon-binome" },
  { num: 2, label: "Sujets", sub: "Parcourir & sélectionner", path: "/sujets" },
  { num: 3, label: "Recommandations", sub: "Suggestions IA", path: "/recommandations" },
  { num: 4, label: "Mes vœux", sub: "Ordre & soumission", path: "/mes-voeux" },
  { num: 5, label: "Résultats", sub: "Résultats & présence", path: "/resultats" },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div style={styles.sidebar}>
      {/* LOGO */}
      <div style={styles.logo}>
        <div style={styles.logoTitle}>Gestion PFA</div>
        <div style={styles.logoSub}>Soutenances 2025–2026</div>
      </div>

      {/* PHASES */}
      <div style={styles.section}>
        <div style={styles.sectionLabel}>PHASES</div>
        {phases.map((phase) => {
          const isActive = location.pathname === phase.path ||
            (phase.path === "/dashboard" && location.pathname === "/");
          return (
            <div
              key={phase.num}
              style={{ ...styles.item, ...(isActive ? styles.itemActive : {}) }}
              onClick={() => navigate(phase.path)}
            >
              <div style={{
                ...styles.num,
                ...(isActive ? styles.numActive : {})
              }}>
                {phase.num}
              </div>
              <div>
                <div style={{
                  ...styles.itemLabel,
                  ...(isActive ? styles.itemLabelActive : {})
                }}>
                  {phase.label}
                </div>
                <div style={{
                  ...styles.itemSub,
                  ...(isActive ? styles.itemSubActive : {})
                }}>
                  {phase.sub}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* FOOTER */}
      <div style={styles.footer}>
        <div style={styles.footerUser}>kloulou</div>
        <div style={styles.footerStatus}>
          <span style={{ color: "#10b981" }}>✔</span> Binôme: Non associé
        </div>
        <div style={styles.footerVersion}>
          v1.0 • API Active
        </div>
      </div>
    </div>
  );
}

const styles = {
  sidebar: {
    width: "220px",
    minHeight: "100vh",
    backgroundColor: "#0f0e17",
    position: "fixed",
    left: 0,
    top: 0,
    display: "flex",
    flexDirection: "column",
    padding: "0",
    zIndex: 100,
  },
  logo: {
    padding: "24px 20px 20px",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },
  logoTitle: {
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: "700",
    letterSpacing: "0.5px",
  },
  logoSub: {
    color: "#6b7280",
    fontSize: "12px",
    marginTop: "3px",
  },
  section: {
    padding: "20px 12px",
    flex: 1,
  },
  sectionLabel: {
    color: "#4b5563",
    fontSize: "11px",
    fontWeight: "600",
    letterSpacing: "1px",
    marginBottom: "10px",
    paddingLeft: "8px",
  },
  item: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "10px 10px",
    borderRadius: "8px",
    cursor: "pointer",
    marginBottom: "4px",
    transition: "all 0.2s",
  },
  itemActive: {
    backgroundColor: "#2563eb",
    borderRadius: "8px",
    borderLeft: "none",
  },
  num: {
    width: "26px",
    height: "26px",
    borderRadius: "6px",
    backgroundColor: "#1f2028",
    color: "#6b7280",
    fontSize: "12px",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  numActive: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    color: "#ffffff",
  },
  itemLabel: {
    color: "#9ca3af",
    fontSize: "14px",
    fontWeight: "500",
  },
  itemLabelActive: {
    color: "#ffffff",
  },
  itemSub: {
    color: "#4b5563",
    fontSize: "11px",
    marginTop: "2px",
  },
  itemSubActive: {
    color: "rgba(255, 255, 255, 0.7)",
  },
  footer: {
    padding: "20px",
    borderTop: "1px solid rgba(255,255,255,0.08)",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  footerUser: {
    color: "#ffffff",
    fontSize: "13px",
    fontWeight: "600",
  },
  footerStatus: {
    color: "#10b981",
    fontSize: "12px",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  footerVersion: {
    color: "#4b5563",
    fontSize: "11px",
    marginTop: "2px",
  },
};
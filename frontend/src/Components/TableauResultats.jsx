import { exportPDF, exportExcel } from "../api/api";

const mentionStyles = {
  Excellent: { bg: "#d1fae5", color: "#065f46" },
  "Très bien": { bg: "#dbeafe", color: "#1e40af" },
  Bien: { bg: "#fef3c7", color: "#92400e" },
  Moyen: { bg: "#fee2e2", color: "#991b1b" },
};

export default function TableauResultats({ resultats, onDelete }) {
  return (
    <div style={styles.wrapper}>
      <div style={styles.actions}>
        <button style={styles.btnPDF} onClick={exportPDF}>
          Export PDF
        </button>
        <button style={styles.btnExcel} onClick={exportExcel}>
          Export Excel
        </button>
      </div>
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.thead}>
              <th style={styles.th}>#</th>
              <th style={styles.th}>Etudiant</th>
              <th style={styles.th}>Projet</th>
              <th style={styles.th}>Note</th>
              <th style={styles.th}>Mention</th>
              <th style={styles.th}>Jury</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {resultats.length === 0 ? (
              <tr>
                <td colSpan={7} style={styles.empty}>
                  Aucun resultat trouve
                </td>
              </tr>
            ) : (
              resultats.map((r, i) => {
                const m = mentionStyles[r.mention] || {
                  bg: "#f3f4f6",
                  color: "#374151",
                };
                const etudiant = r.etudiant1 ? (r.etudiant1 + (r.etudiant2 ? " & " + r.etudiant2 : "")) : "—";
                const projet = r.projetTitre || "—";
                const professeur = r.professeurNom || "—";
                return (
                  <tr
                    key={r.id}
                    style={i % 2 === 0 ? styles.trEven : styles.trOdd}
                  >
                    <td style={styles.td}>{i + 1}</td>
                    <td style={styles.td}>
                      <span style={styles.etudiantName}>{etudiant}</span>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.projetTitle}>{projet}</span>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.note}>{r.noteGlobale}/20</span>
                    </td>
                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.badge,
                          backgroundColor: m.bg,
                          color: m.color,
                        }}
                      >
                        {r.mention}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.jury}>{professeur}</span>
                    </td>
                    <td style={styles.td}>
                      <button
                        style={styles.btnDel}
                        onClick={() => onDelete(r.id)}
                      >
                        🗑
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  },
  actions: {
    display: "flex",
    gap: "10px",
    padding: "16px 20px",
    borderBottom: "1px solid #f0f0f0",
  },
  btnPDF: {
    padding: "8px 16px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#ef4444",
    color: "#fff",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
  },
  btnExcel: {
    padding: "8px 16px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#10b981",
    color: "#fff",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
  },
  tableWrapper: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse" },
  thead: { backgroundColor: "#f8f9fb" },
  th: {
    padding: "12px 16px",
    textAlign: "left",
    fontSize: "12px",
    fontWeight: "600",
    color: "#6b7280",
    borderBottom: "1px solid #e5e4e7",
  },
  td: {
    padding: "13px 16px",
    fontSize: "14px",
    color: "#374151",
    borderBottom: "1px solid #f3f4f6",
    verticalAlign: "middle",
  },
  trEven: { backgroundColor: "#fff" },
  trOdd: { backgroundColor: "#fafafa" },
  etudiantName: { fontWeight: "600", color: "#08060d" },
  projetTitle: { color: "#4b5563", fontSize: "13px" },
  note: { fontWeight: "700", color: "#4361ee", fontSize: "15px" },
  badge: {
    padding: "3px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
  },
  jury: { fontSize: "12px", color: "#6b7280" },
  btnDel: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "16px",
    padding: "4px 8px",
    borderRadius: "6px",
  },
  empty: {
    textAlign: "center",
    padding: "40px",
    color: "#9ca3af",
    fontSize: "14px",
  },
};
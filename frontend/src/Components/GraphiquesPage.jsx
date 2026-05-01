export default function GraphiquesPage({ resultats }) {
    const mentionCounts = resultats.reduce((acc, r) => {
      acc[r.mention] = (acc[r.mention] || 0) + 1;
      return acc;
    }, {});
  
    const mentions = Object.entries(mentionCounts);
    const total = resultats.length || 1;
  
    const colors = {
      Excellent: "#10b981",
      "Très bien": "#4361ee",
      Bien: "#f59e0b",
      Moyen: "#ef4444",
    };
  
    return (
      <div style={styles.wrapper}>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Répartition par Mention</h3>
          <div style={styles.bars}>
            {mentions.map(([mention, count]) => (
              <div key={mention} style={styles.barRow}>
                <span style={styles.barLabel}>{mention}</span>
                <div style={styles.barTrack}>
                  <div style={{
                    ...styles.barFill,
                    width: `${(count / total) * 100}%`,
                    backgroundColor: colors[mention] || "#6b7280",
                  }} />
                </div>
                <span style={styles.barCount}>{count}</span>
              </div>
            ))}
          </div>
        </div>
  
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Résumé Statistique</h3>
          <div style={styles.statsGrid}>
            {[
              { label: "Total", value: resultats.length },
              { label: "Excellents", value: mentionCounts["Excellent"] || 0 },
              { label: "Très bien", value: mentionCounts["Très bien"] || 0 },
              { label: "Bien", value: mentionCounts["Bien"] || 0 },
            ].map(s => (
              <div key={s.label} style={styles.statBox}>
                <div style={styles.statValue}>{s.value}</div>
                <div style={styles.statLabel}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  const styles = {
    wrapper: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" },
    card: { backgroundColor: "#fff", borderRadius: "12px", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" },
    cardTitle: { fontSize: "16px", fontWeight: "600", color: "#08060d", marginBottom: "20px" },
    bars: { display: "flex", flexDirection: "column", gap: "14px" },
    barRow: { display: "flex", alignItems: "center", gap: "12px" },
    barLabel: { width: "80px", fontSize: "13px", color: "#6b7280", flexShrink: 0 },
    barTrack: { flex: 1, height: "10px", backgroundColor: "#f0f0f0", borderRadius: "999px", overflow: "hidden" },
    barFill: { height: "100%", borderRadius: "999px", transition: "width 0.5s ease" },
    barCount: { width: "24px", fontSize: "13px", fontWeight: "700", color: "#374151", textAlign: "right" },
    statsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" },
    statBox: { backgroundColor: "#f8f9fb", borderRadius: "10px", padding: "16px", textAlign: "center" },
    statValue: { fontSize: "28px", fontWeight: "700", color: "#4361ee" },
    statLabel: { fontSize: "12px", color: "#6b7280", marginTop: "4px" },
  };
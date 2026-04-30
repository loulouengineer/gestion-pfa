export default function StatistiquesCards({ statistiques, total }) {
    const cards = [
      {
        label: "Total Soutenances",
        value: total,
      
        color: "#4361ee",
        bg: "rgba(67,97,238,0.08)",
      },
      {
        label: "Moyenne Générale",
        value: statistiques.moyenne ? `${statistiques.moyenne}/20` : "—",
      
        color: "#10b981",
        bg: "rgba(16,185,129,0.08)",
      },
      {
        label: "Note Maximale",
        value: statistiques.noteMax ? `${statistiques.noteMax}/20` : "—",
      
        color: "#f59e0b",
        bg: "rgba(245,158,11,0.08)",
      },
    ];
  
    return (
      <div style={styles.grid}>
        {cards.map((card) => (
          <div key={card.label} style={{ ...styles.card, borderTop: `3px solid ${card.color}` }}>
            <div style={{ ...styles.iconBox, backgroundColor: card.bg, color: card.color }}>
              {card.icon}
            </div>
            <div>
              <div style={styles.cardLabel}>{card.label}</div>
              <div style={{ ...styles.cardValue, color: card.color }}>{card.value}</div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  const styles = {
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: "16px",
      marginBottom: "28px",
    },
    card: {
      backgroundColor: "#fff",
      borderRadius: "12px",
      padding: "20px 24px",
      display: "flex",
      alignItems: "center",
      gap: "16px",
      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    },
    iconBox: {
      width: "48px",
      height: "48px",
      borderRadius: "10px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "22px",
      flexShrink: 0,
    },
    cardLabel: {
      fontSize: "12px",
      color: "#6b7280",
      fontWeight: "500",
      marginBottom: "4px",
    },
    cardValue: {
      fontSize: "22px",
      fontWeight: "700",
    },
  };
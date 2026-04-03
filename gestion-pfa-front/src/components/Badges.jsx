// Shared badge configs — import this in each component
export const STATUS_AFFECTATION = {
  EN_ATTENTE: {
    label: "En attente",
    bg: "#fef3c7", color: "#92400e",
    border: "#f59e0b", dot: "#f59e0b",
  },
  VALIDEE: {
    label: "Validée",
    bg: "#d1fae5", color: "#065f46",
    border: "#10b981", dot: "#10b981",
  },
  REFUSEE: {
    label: "Refusée",
    bg: "#fee2e2", color: "#991b1b",
    border: "#ef4444", dot: "#ef4444",
  },
};

export const STATUS_SOUTENANCE = {
  PLANIFIEE: {
    label: "Planifiée",
    bg: "#dbeafe", color: "#1e40af",
    border: "#3b82f6", dot: "#3b82f6",
  },
  TERMINEE: {
    label: "Terminée",
    bg: "#d1fae5", color: "#065f46",
    border: "#10b981", dot: "#10b981",
  },
  ANNULEE: {
    label: "Annulée",
    bg: "#fee2e2", color: "#991b1b",
    border: "#ef4444", dot: "#ef4444",
  },
  EN_COURS: {
    label: "En cours",
    bg: "#fef3c7", color: "#92400e",
    border: "#f59e0b", dot: "#f59e0b",
  },
};

export const STATUS_CRENEAU = {
  DISPONIBLE: {
    label: "Disponible",
    bg: "#d1fae5", color: "#065f46",
    border: "#10b981",
  },
  OCCUPE: {
    label: "Occupé",
    bg: "#fef3c7", color: "#92400e",
    border: "#f59e0b",
  },
};

export function Badge({ config }) {
  if (!config) return null;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      background: config.bg,
      color: config.color,
      border: `1px solid ${config.border}`,
      padding: "4px 12px", borderRadius: 20,
      fontSize: 12, fontWeight: 600,
    }}>
      {config.dot && (
        <span style={{
          width: 6, height: 6, borderRadius: "50%",
          background: config.dot, flexShrink: 0,
        }} />
      )}
      {config.label}
    </span>
  );
}
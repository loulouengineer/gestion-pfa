// badges.jsx — Shared badge configs & components

// ─── Status Config Maps ────────────────────────────────────────────────────────

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

// ─── Difficulté Config Map ─────────────────────────────────────────────────────

const difficulteConfig = {
  1: { label: "Facile",    bg: "#DCFCE7", color: "#15803D" },
  2: { label: "Facile",    bg: "#DCFCE7", color: "#15803D" },
  3: { label: "Moyen",     bg: "#FEF9C3", color: "#A16207" },
  4: { label: "Difficile", bg: "#FEF2F2", color: "#DC2626" },
  5: { label: "Difficile", bg: "#FEF2F2", color: "#DC2626" },
};

// ─── Style Helpers ─────────────────────────────────────────────────────────────

/** Pill style with dot indicator — used by status badges */
const pillStyle = (bg, color, border) => ({
  display: "inline-flex", alignItems: "center", gap: 6,
  background: bg, color,
  border: `1px solid ${border}`,
  padding: "4px 12px", borderRadius: 20,
  fontSize: 12, fontWeight: 600,
});

/** Compact rectangular style — used by attribute badges */
const chipStyle = (bg, color) => ({
  display: "inline-block",
  background: bg, color,
  fontSize: 11, fontWeight: 600,
  padding: "3px 10px", borderRadius: 6,
  letterSpacing: "0.2px",
});

// ─── Status Badge (with dot) ───────────────────────────────────────────────────

/**
 * Generic status badge. Pass a config object from one of the STATUS_* maps.
 * @example <Badge config={STATUS_AFFECTATION.VALIDEE} />
 */
export function Badge({ config }) {
  if (!config) return null;
  return (
    <span style={pillStyle(config.bg, config.color, config.border)}>
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

// ─── Attribute Badges ──────────────────────────────────────────────────────────

export function BadgeDifficulte({ niveau }) {
  const cfg = difficulteConfig[niveau] ?? difficulteConfig[3];
  return <span style={chipStyle(cfg.bg, cfg.color)}>{cfg.label} {niveau}/5</span>;
}

export function BadgeDisponible({ disponible }) {
  return (
    <span style={chipStyle(
      disponible ? "#DCFCE7" : "#F1F5F9",
      disponible ? "#15803D" : "#64748B",
    )}>
      {disponible ? "Disponible" : "Non disponible"}
    </span>
  );
}

export function BadgeOrdre({ ordre }) {
  return <span style={chipStyle("#EEF2FF", "#4338CA")}>Vœu #{ordre}</span>;
}

export function BadgeTech({ tech }) {
  return <span style={chipStyle("#F0F9FF", "#0369A1")}>{tech}</span>;
}
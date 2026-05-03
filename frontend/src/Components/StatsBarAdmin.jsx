export default function StatsBar({ stats }) {
  return (
    <div style={{
      display: "flex", gap: 12,
      marginBottom: 28,
    }}>
      {stats.map((s) => {
        const pct = s.total ? Math.round((s.value / s.total) * 100) : null;
        const bg = s.color ? hexToAlpha(s.color, 0.1) : "var(--surface)";
        const border = s.color ? hexToAlpha(s.color, 0.25) : "var(--border2)";
        return (
          <div key={s.label} style={{
            flex: 1, padding: "18px 20px",
            background: bg,
            border: `1px solid ${border}`,
            borderRadius: "var(--radius-lg)",
            position: "relative", overflow: "hidden",
          }}>
            <div style={{
              position: "absolute", bottom: 0, left: 0, right: 0,
              height: 4,
              background: s.color || "var(--accent)",
              opacity: pct !== null ? pct / 100 : 0.6,
            }} />

            <div style={{
              fontSize: 10, fontWeight: 600,
              color: s.color || "var(--muted)",
              textTransform: "uppercase", letterSpacing: "0.08em",
              marginBottom: 10, opacity: 0.9,
            }}>
              {s.label}
            </div>

            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{
                fontSize: 30, fontWeight: 700,
                color: s.color || "var(--text)",
                letterSpacing: "-1px", lineHeight: 1,
              }}>
                {s.value}
              </span>
              {s.total !== undefined && s.total !== s.value && (
                <span style={{ fontSize: 13, color: "var(--muted)", fontFamily: "'DM Mono', monospace" }}>
                  / {s.total}
                </span>
              )}
              {pct !== null && pct > 0 && (
                <span style={{
                  fontSize: 11, fontWeight: 600,
                  color: s.color, opacity: 0.8, marginLeft: 2,
                }}>
                  {pct}%
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function hexToAlpha(hex, alpha) {
  if (!hex || !hex.startsWith("#")) return `rgba(0,0,0,${alpha})`;
  const r = parseInt(hex.slice(1,3), 16);
  const g = parseInt(hex.slice(3,5), 16);
  const b = parseInt(hex.slice(5,7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
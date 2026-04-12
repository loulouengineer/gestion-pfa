// src/components/ui.js
// Shared premium UI components used across all phases

// ── Button ────────────────────────────────────────────
export function Button({ children, variant = "primary", size = "md", disabled, onClick, style, icon: Icon }) {
  const base = {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
    fontFamily: "inherit", fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer",
    border: "none", transition: "all 0.15s cubic-bezier(0.16,1,0.3,1)",
    whiteSpace: "nowrap", opacity: disabled ? 0.5 : 1,
  };

  const sizes = {
    sm: { padding: "6px 12px",  fontSize: 12, borderRadius: "var(--r-sm)" },
    md: { padding: "9px 18px",  fontSize: 13, borderRadius: "var(--r-md)" },
    lg: { padding: "12px 24px", fontSize: 14, borderRadius: "var(--r-lg)" },
  };

  const variants = {
    primary: {
      background: "var(--blue-600)", color: "#fff",
      boxShadow: "var(--shadow-blue)",
    },
    secondary: {
      background: "var(--surface)", color: "var(--text-2)",
      border: "1px solid var(--border2)",
      boxShadow: "var(--shadow-sm)",
    },
    ghost: {
      background: "transparent", color: "var(--text-3)",
      border: "1px solid transparent",
    },
    danger: {
      background: "var(--red-bg)", color: "var(--red-text)",
      border: "1px solid var(--red)",
    },
    success: {
      background: "var(--green-bg)", color: "var(--green-text)",
      border: "1px solid var(--green)",
    },
    violet: {
      background: "var(--violet-bg)", color: "var(--violet-text)",
      border: "1px solid var(--violet)",
    },
  };

  return (
    <button
      disabled={disabled}
      onClick={onClick}
      style={{ ...base, ...sizes[size], ...variants[variant], ...style }}
      onMouseEnter={e => {
        if (disabled) return;
        if (variant === "primary") { e.currentTarget.style.background = "var(--blue-700)"; e.currentTarget.style.transform = "translateY(-1px)"; }
        if (variant === "secondary") { e.currentTarget.style.background = "var(--surface2)"; }
        if (variant === "ghost") { e.currentTarget.style.background = "var(--surface2)"; }
      }}
      onMouseLeave={e => {
        if (disabled) return;
        if (variant === "primary") { e.currentTarget.style.background = "var(--blue-600)"; e.currentTarget.style.transform = "translateY(0)"; }
        if (variant === "secondary") { e.currentTarget.style.background = "var(--surface)"; }
        if (variant === "ghost") { e.currentTarget.style.background = "transparent"; }
      }}
    >
      {Icon && <Icon size={size === "sm" ? 13 : size === "lg" ? 16 : 14} />}
      {children}
    </button>
  );
}

// ── Badge ─────────────────────────────────────────────
export function Badge({ label, variant = "default", dot = false }) {
  const variants = {
    default:  { bg: "var(--surface2)",    color: "var(--text-3)",    border: "var(--border2)"  },
    blue:     { bg: "var(--blue-50)",     color: "var(--blue-700)",  border: "var(--blue-200)" },
    green:    { bg: "var(--green-bg)",    color: "var(--green-text)",border: "var(--green)"    },
    red:      { bg: "var(--red-bg)",      color: "var(--red-text)",  border: "var(--red)"      },
    amber:    { bg: "var(--amber-bg)",    color: "var(--amber-text)",border: "var(--amber)"    },
    violet:   { bg: "var(--violet-bg)",   color: "var(--violet-text)",border:"var(--violet)"   },
  };
  const v = variants[variant] || variants.default;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 9px", borderRadius: 20,
      fontSize: 11, fontWeight: 600,
      background: v.bg, color: v.color,
      border: `1px solid ${v.border}`,
    }}>
      {dot && (
        <span style={{ width: 5, height: 5, borderRadius: "50%", background: v.color, flexShrink: 0 }} />
      )}
      {label}
    </span>
  );
}

// ── Card ──────────────────────────────────────────────
export function Card({ children, style, hover = false, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: "var(--surface)", borderRadius: "var(--r-lg)",
        border: "1px solid var(--border2)", boxShadow: "var(--shadow-sm)",
        transition: hover ? "all 0.2s cubic-bezier(0.16,1,0.3,1)" : "none",
        cursor: onClick ? "pointer" : "default",
        ...style,
      }}
      onMouseEnter={e => {
        if (!hover && !onClick) return;
        e.currentTarget.style.boxShadow = "var(--shadow-md)";
        e.currentTarget.style.borderColor = "var(--border3)";
        e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={e => {
        if (!hover && !onClick) return;
        e.currentTarget.style.boxShadow = "var(--shadow-sm)";
        e.currentTarget.style.borderColor = "var(--border2)";
        e.currentTarget.style.transform = "none";
      }}
    >
      {children}
    </div>
  );
}

// ── Input ─────────────────────────────────────────────
export function Input({ label, error, icon: Icon, ...props }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      {label && (
        <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {label}
        </label>
      )}
      <div style={{ position: "relative" }}>
        {Icon && (
          <div style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-4)", pointerEvents: "none" }}>
            <Icon size={14} />
          </div>
        )}
        <input
          {...props}
          style={{
            width: "100%", padding: Icon ? "9px 12px 9px 32px" : "9px 12px",
            borderRadius: "var(--r-md)",
            border: `1px solid ${error ? "var(--red)" : "var(--border2)"}`,
            background: "var(--surface)",
            color: "var(--text)", outline: "none", fontSize: 13,
            boxShadow: "var(--shadow-xs)",
            transition: "border-color 0.15s, box-shadow 0.15s",
            ...props.style,
          }}
          onFocus={e => {
            e.target.style.borderColor = "var(--blue-500)";
            e.target.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.12)";
          }}
          onBlur={e => {
            e.target.style.borderColor = error ? "var(--red)" : "var(--border2)";
            e.target.style.boxShadow = "var(--shadow-xs)";
          }}
        />
      </div>
      {error && <span style={{ fontSize: 11, color: "var(--red)" }}>{error}</span>}
    </div>
  );
}

// ── Select ────────────────────────────────────────────
export function Select({ label, children, ...props }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      {label && (
        <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {label}
        </label>
      )}
      <select
        {...props}
        style={{
          width: "100%", padding: "9px 12px",
          borderRadius: "var(--r-md)",
          border: "1px solid var(--border2)",
          background: "var(--surface)",
          color: "var(--text)", outline: "none", fontSize: 13,
          boxShadow: "var(--shadow-xs)",
          cursor: "pointer",
          transition: "border-color 0.15s",
          ...props.style,
        }}
        onFocus={e => { e.target.style.borderColor = "var(--blue-500)"; }}
        onBlur={e => { e.target.style.borderColor = "var(--border2)"; }}
      >
        {children}
      </select>
    </div>
  );
}

// ── StatBar ───────────────────────────────────────────
export function StatBar({ stats }) {
  return (
    <div style={{
      display: "flex", gap: 0,
      background: "var(--surface)", borderRadius: "var(--r-xl)",
      border: "1px solid var(--border2)", boxShadow: "var(--shadow-sm)",
      overflow: "hidden", marginBottom: 28,
    }}>
      {stats.map((s, i) => {
        const pct = s.total ? Math.round((s.value / s.total) * 100) : null;
        return (
          <div key={s.label} style={{
            flex: 1, padding: "20px 24px", position: "relative", overflow: "hidden",
            borderRight: i < stats.length - 1 ? "1px solid var(--border)" : "none",
          }}>
            {pct !== null && (
              <div style={{
                position: "absolute", bottom: 0, left: 0,
                height: 3, width: `${pct}%`,
                background: s.color || "var(--blue-500)",
                borderRadius: "0 2px 0 0",
                transition: "width 0.8s cubic-bezier(0.16,1,0.3,1)",
              }} />
            )}
            <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-4)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
              {s.label}
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ fontSize: 28, fontWeight: 700, color: s.color || "var(--text)", letterSpacing: "-1px", lineHeight: 1 }}>
                {s.value}
              </span>
              {s.total !== undefined && s.total !== s.value && (
                <span style={{ fontSize: 12, color: "var(--text-4)", fontFamily: "'JetBrains Mono', monospace" }}>
                  / {s.total}
                </span>
              )}
              {pct !== null && pct > 0 && (
                <span style={{ fontSize: 11, color: s.color, opacity: 0.7, fontWeight: 600 }}>
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

// ── PageHeader ────────────────────────────────────────
export function PageHeader({  title, subtitle, action }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
      <div>

        <h1 style={{ fontSize: 26, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.6px", lineHeight: 1.2 }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ fontSize: 13, color: "var(--text-3)", marginTop: 4 }}>{subtitle}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

// ── Alert ─────────────────────────────────────────────
export function Alert({ type = "error", message, onClose }) {
  const config = {
    error:   { bg: "var(--red-bg)",   border: "var(--red)",   color: "var(--red-text)",   icon: "✕" },
    success: { bg: "var(--green-bg)", border: "var(--green)", color: "var(--green-text)", icon: "✓" },
    info:    { bg: "var(--blue-50)",  border: "var(--blue-200)", color: "var(--blue-700)", icon: "i" },
  };
  const c = config[type];
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      background: c.bg, border: `1px solid ${c.border}`, color: c.color,
      borderRadius: "var(--r-md)", padding: "10px 14px",
      fontSize: 13, fontWeight: 500, marginBottom: 16,
      animation: "fadeIn 0.2s ease",
    }}>
      <span>{message}</span>
      {onClose && (
        <button onClick={onClose} style={{ background: "none", border: "none", color: c.color, cursor: "pointer", padding: "0 0 0 8px", fontSize: 14, fontWeight: 700 }}>
          ×
        </button>
      )}
    </div>
  );
}

// ── Tabs ──────────────────────────────────────────────
export function Tabs({ tabs, active, onChange }) {
  return (
    <div style={{ display: "flex", gap: 1, borderBottom: "1px solid var(--border2)", marginBottom: 24 }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)}
          style={{
            padding: "10px 18px", border: "none", background: "none", cursor: "pointer",
            fontSize: 13, fontWeight: active === t.id ? 600 : 400,
            color: active === t.id ? "var(--blue-600)" : "var(--text-3)",
            borderBottom: active === t.id ? "2px solid var(--blue-600)" : "2px solid transparent",
            marginBottom: -1, transition: "all 0.15s",
            display: "flex", alignItems: "center", gap: 6,
          }}>
          {t.icon && <t.icon size={13} />}
          {t.label}
          {t.count !== undefined && (
            <span style={{
              fontSize: 10, fontWeight: 700, minWidth: 18, height: 18,
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              borderRadius: 20, padding: "0 5px",
              background: active === t.id ? "var(--blue-600)" : "var(--surface2)",
              color: active === t.id ? "#fff" : "var(--text-3)",
            }}>
              {t.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// ── LoadingSkeleton ───────────────────────────────────
export function LoadingSkeleton({ rows = 3, height = 80 }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton" style={{ height, borderRadius: "var(--r-lg)", opacity: 1 - i * 0.15 }} />
      ))}
    </div>
  );
}

// ── Empty state ───────────────────────────────────────
export function EmptyState({ icon: Icon, title, description }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", padding: "64px 32px", gap: 12,
      border: "1px dashed var(--border3)", borderRadius: "var(--r-xl)",
      animation: "fadeIn 0.3s ease",
    }}>
      {Icon && (
        <div style={{
          width: 48, height: 48, borderRadius: "var(--r-lg)",
          background: "var(--surface2)", border: "1px solid var(--border2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "var(--text-4)",
        }}>
          <Icon size={22} />
        </div>
      )}
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-2)", marginBottom: 4 }}>{title}</div>
        {description && <div style={{ fontSize: 13, color: "var(--text-3)" }}>{description}</div>}
      </div>
    </div>
  );
}
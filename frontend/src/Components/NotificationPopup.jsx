import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { notificationApi, chatApi } from "../api/api";
import { Bell, X, Check, Info, Zap, CheckCheck, AlertTriangle, FileText } from "lucide-react";

const ADMIN_ID = 1;
const POLL_INTERVAL = 8000;

const TYPE_CONFIG = {
  INFO:             { icon: Info,          color: "#3b82f6", bg: "#dbeafe" },
  DEBUT_SOUTENANCE: { icon: Zap,           color: "#10b981", bg: "#d1fae5" },
  FIN_SOUTENANCE:   { icon: CheckCheck,    color: "#7c3aed", bg: "#ede9fe" },
  RAPPORT:          { icon: FileText,      color: "#f59e0b", bg: "#fef3c7" },
  AVERTISSEMENT:    { icon: AlertTriangle, color: "#f59e0b", bg: "#fef3c7" },
};

// ── Toast ─────────────────────────────────────────────
function Toast({ item, onClose }) {
  const [width, setWidth] = useState(100);

  useEffect(() => {
    const start = Date.now();
    const duration = 5000;
    const tick = setInterval(() => {
      const pct = Math.max(0, 100 - ((Date.now() - start) / duration) * 100);
      setWidth(pct);
      if (pct === 0) { clearInterval(tick); onClose(); }
    }, 60);
    return () => clearInterval(tick);
  }, [onClose]);

  const isMsg = item._kind === "message";
  const cfg   = TYPE_CONFIG[item.type] || TYPE_CONFIG.INFO;
  const Icon  = isMsg ? Bell : cfg.icon;

  return (
    <div style={{
      width: 300, background: "var(--surface)",
      borderRadius: "var(--r-lg)", border: "1px solid var(--border2)",
      boxShadow: "var(--shadow-xl)", overflow: "hidden",
      animation: "slideInRight 0.3s cubic-bezier(0.16,1,0.3,1)",
    }}>
      <div style={{ display: "flex", gap: 10, padding: "12px 14px", alignItems: "flex-start" }}>
        <div style={{
          width: 28, height: 28, borderRadius: "var(--r-sm)", flexShrink: 0,
          background: isMsg ? "var(--blue-50)" : cfg.bg,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon size={13} color={isMsg ? "var(--blue-600)" : cfg.color} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text)", marginBottom: 2 }}>
            {isMsg ? `Message de ${item.from}` : item.titre}
          </div>
          <div style={{
            fontSize: 11, color: "var(--text-3)", lineHeight: 1.4,
            overflow: "hidden", display: "-webkit-box",
            WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
          }}>
            {isMsg ? item.contenu : item.message}
          </div>
        </div>
        <button onClick={onClose}
          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-4)", padding: 0, flexShrink: 0, marginTop: 1 }}>
          <X size={12} />
        </button>
      </div>
      <div style={{ height: 2, background: "var(--surface3)" }}>
        <div style={{ height: "100%", width: `${width}%`, background: isMsg ? "var(--blue-500)" : cfg.color, transition: "none" }} />
      </div>
    </div>
  );
}

// ── Notification Panel ────────────────────────────────
function NotifPanel({ notifs, onLireTout, onClose, onNavigate }) {
  const unreadCount = notifs.filter(n => !n.lue).length;

  return (
    <div style={{
      position: "fixed",
      top: 16,
      left: 252,   /* right edge of 240px sidebar + 12px gap */
      width: 340,
      maxHeight: "calc(100vh - 32px)",
      background: "var(--surface)",
      borderRadius: "var(--r-xl)",
      border: "1px solid var(--border2)",
      boxShadow: "var(--shadow-xl)",
      zIndex: 9999,
      display: "flex",
      flexDirection: "column",
      animation: "scaleIn 0.2s cubic-bezier(0.16,1,0.3,1)",
    }}>
      {/* Header */}
      <div style={{
        padding: "14px 16px",
        borderBottom: "1px solid var(--border)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>
            Notifications
          </span>
          {unreadCount > 0 && (
            <span style={{
              background: "var(--blue-600)", color: "#fff",
              borderRadius: 20, padding: "1px 7px", fontSize: 10, fontWeight: 700,
            }}>
              {unreadCount}
            </span>
          )}
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {unreadCount > 0 && (
            <button onClick={onLireTout}
              style={{
                fontSize: 11, color: "var(--blue-600)", background: "none", border: "none",
                cursor: "pointer", fontWeight: 600,
                display: "flex", alignItems: "center", gap: 4,
                padding: "4px 8px", borderRadius: "var(--r-sm)",
              }}>
              <Check size={11} /> Tout lire
            </button>
          )}
          <button onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-4)", padding: 4 }}>
            <X size={14} />
          </button>
        </div>
      </div>

      {/* List */}
      <div style={{ overflowY: "auto", flex: 1 }}>
        {notifs.length === 0 ? (
          <div style={{ padding: "40px 16px", textAlign: "center", color: "var(--text-4)", fontSize: 13 }}>
            Aucune notification
          </div>
        ) : (
          notifs.slice(0, 20).map((n, i) => {
            const cfg  = TYPE_CONFIG[n.type] || TYPE_CONFIG.INFO;
            const Icon = cfg.icon;
            const date = (() => {
              try {
                return new Date(n.dateCreation || n.date).toLocaleString("fr-FR", {
                  day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
                });
              } catch { return ""; }
            })();

            return (
              <div key={n.id || i}
                onClick={() => { onNavigate("notifs"); onClose(); }}
                style={{
                  display: "flex", gap: 10, padding: "11px 16px", cursor: "pointer",
                  background: n.lue ? "transparent" : "var(--blue-50)",
                  borderBottom: "1px solid var(--border)",
                  transition: "background 0.1s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = n.lue ? "var(--surface2)" : "#dbeafe"; }}
                onMouseLeave={e => { e.currentTarget.style.background = n.lue ? "transparent" : "var(--blue-50)"; }}
              >
                <div style={{
                  width: 28, height: 28, borderRadius: "var(--r-sm)", flexShrink: 0,
                  background: cfg.bg,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginTop: 1,
                }}>
                  <Icon size={12} color={cfg.color} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 6 }}>
                    <div style={{ fontSize: 12, fontWeight: n.lue ? 500 : 700, color: "var(--text)", lineHeight: 1.3 }}>
                      {n.titre}
                    </div>
                    {!n.lue && (
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--blue-500)", flexShrink: 0, marginTop: 4 }} />
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-3)", lineHeight: 1.4, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {n.message}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--text-4)", marginTop: 3 }}>{date}</div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: "10px 16px", borderTop: "1px solid var(--border)", flexShrink: 0 }}>
        <button
          onClick={() => { onNavigate("notifs"); onClose(); }}
          style={{
            width: "100%", padding: "8px", borderRadius: "var(--r-md)",
            border: "1px solid var(--border2)", background: "transparent",
            color: "var(--text-3)", fontSize: 12, fontWeight: 600, cursor: "pointer",
            transition: "background 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "var(--surface2)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
        >
          Voir toutes les notifications
        </button>
      </div>
    </div>
  );
}

// ── Hook ──────────────────────────────────────────────
export function useNotifications() {
  const [notifs, setNotifs]       = useState([]);
  const [toasts, setToasts]       = useState([]);
  const [panelOpen, setPanelOpen] = useState(false);
  const seenIds                   = useRef(new Set());
  const initialized               = useRef(false);

  const removeToast = useCallback((tid) => {
    setToasts(p => p.filter(t => t._tid !== tid));
  }, []);

  const addToast = useCallback((item) => {
    const _tid = Date.now() + Math.random();
    setToasts(p => [...p.slice(-2), { ...item, _tid }]);
  }, []);

  const poll = useCallback(async () => {
    try {
      const ns = await notificationApi.getAll(ADMIN_ID);
      setNotifs(ns);
      if (initialized.current) {
        ns.filter(n => !n.lue && !seenIds.current.has(n.id)).forEach(n => {
          seenIds.current.add(n.id);
          addToast({ ...n, _kind: "notif" });
        });
      } else {
        ns.forEach(n => seenIds.current.add(n.id));
        initialized.current = true;
      }
    } catch {}

    try {
      const chatData = await chatApi.getUnread(ADMIN_ID);
      if (initialized.current && chatData.count > 0) {
        const convs = await chatApi.getConversations(ADMIN_ID);
        convs.filter(c => c.unread > 0).forEach(c => {
          const key = `msg-${c.userId}-${c.date}`;
          if (!seenIds.current.has(key)) {
            seenIds.current.add(key);
            addToast({ _kind: "message", from: c.userName, contenu: c.lastMsg });
          }
        });
      }
    } catch {}
  }, [addToast]);

  useEffect(() => {
    poll();
    const iv = setInterval(poll, POLL_INTERVAL);
    return () => clearInterval(iv);
  }, [poll]);

  const totalUnread  = notifs.filter(n => !n.lue).length;

  const handleLireTout = async () => {
    await notificationApi.marquerToutes(ADMIN_ID).catch(() => {});
    setNotifs(p => p.map(n => ({ ...n, lue: true })));
  };

  return { notifs, toasts, removeToast, panelOpen, setPanelOpen, totalUnread, handleLireTout };
}

// ── Main export ───────────────────────────────────────
export function NotificationCenter({ onNavigate }) {
  const { notifs, toasts, removeToast, panelOpen, setPanelOpen, totalUnread, handleLireTout } = useNotifications();
  const btnRef = useRef(null);

  // Close panel on outside click
  useEffect(() => {
    if (!panelOpen) return;
    const handler = (e) => {
      if (btnRef.current && !btnRef.current.contains(e.target)) {
        // Only close if click is not inside the panel (panel is fixed, outside btnRef)
        const panel = document.querySelector("[data-notif-panel]");
        if (!panel || !panel.contains(e.target)) setPanelOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [panelOpen, setPanelOpen]);

  return (
    <>
      <style>{`
        @keyframes slideInRight {
          from { opacity:0; transform:translateX(16px) }
          to   { opacity:1; transform:translateX(0) }
        }
        @keyframes scaleIn {
          from { opacity:0; transform:scale(0.96) translateY(-4px) }
          to   { opacity:1; transform:scale(1) translateY(0) }
        }
      `}</style>

      {/* Bell button */}
      <div ref={btnRef} style={{ position: "relative" }}>
        <button
          onClick={() => setPanelOpen(p => !p)}
          style={{
            width: 32, height: 32, borderRadius: 9,
            background: panelOpen ? "rgba(59,130,246,0.18)" : "rgba(255,255,255,0.06)",
            border: `1px solid ${panelOpen ? "rgba(59,130,246,0.45)" : "rgba(255,255,255,0.08)"}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", transition: "all 0.15s", position: "relative",
          }}>
          <Bell size={13} color={panelOpen ? "#60a5fa" : "#64748b"} />
          {totalUnread > 0 && (
            <span style={{
              position: "absolute", top: -5, right: -5,
              minWidth: 16, height: 16, borderRadius: 20, padding: "0 4px",
              background: "#ef4444", color: "#fff",
              fontSize: 9, fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center",
              border: "2px solid #0f172a",
            }}>
              {totalUnread > 9 ? "9+" : totalUnread}
            </span>
          )}
        </button>
      </div>

      {/* Panel — rendered in body via portal to avoid z-index/overflow issues */}
      {panelOpen && createPortal(
        <div data-notif-panel="true">
          <NotifPanel
            notifs={notifs}
            onLireTout={handleLireTout}
            onClose={() => setPanelOpen(false)}
            onNavigate={onNavigate}
          />
        </div>,
        document.body
      )}

      {/* Toasts — bottom right */}
      <div style={{
        position: "fixed", bottom: 20, right: 20, zIndex: 10000,
        display: "flex", flexDirection: "column-reverse", gap: 8,
        pointerEvents: "none", alignItems: "flex-end",
      }}>
        {toasts.map(t => (
          <div key={t._tid} style={{ pointerEvents: "auto" }}>
            <Toast item={t} onClose={() => removeToast(t._tid)} />
          </div>
        ))}
      </div>
    </>
  );
}
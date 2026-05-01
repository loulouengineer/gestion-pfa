import { useState, useEffect, useCallback } from "react";
import { notificationApi } from "../api/api";
import { PageHeader, Alert, Button, EmptyState, LoadingSkeleton } from "./ui";
import { Bell, Check, Info, Zap, CheckCheck, AlertTriangle, FileText, ExternalLink } from "lucide-react";

const TYPE_CONFIG = {
  INFO:             { icon: Info,          color: "#3b82f6", bg: "#dbeafe" },
  DEBUT_SOUTENANCE: { icon: Zap,           color: "#10b981", bg: "#d1fae5" },
  FIN_SOUTENANCE:   { icon: CheckCheck,    color: "#7c3aed", bg: "#ede9fe" },
  RAPPORT:          { icon: FileText,      color: "#f59e0b", bg: "#fef3c7" },
  AVERTISSEMENT:    { icon: AlertTriangle, color: "#f59e0b", bg: "#fef3c7" },
};

const POLL_MS = 10000;

function NotifCard({ notif, onLire }) {
  const cfg  = TYPE_CONFIG[notif.type] || TYPE_CONFIG.INFO;
  const Icon = cfg.icon;
  const date = (() => {
    try {
      return new Date(notif.dateCreation || notif.date).toLocaleString("fr-FR", {
        day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
      });
    } catch { return ""; }
  })();

  return (
    <div style={{
      display: "flex", gap: 12, padding: "14px 18px",
      background: notif.lue ? "transparent" : "var(--blue-50)",
      borderRadius: "var(--r-md)",
      border: `1px solid ${notif.lue ? "var(--border)" : "var(--blue-200)"}`,
      marginBottom: 8, transition: "all 0.15s",
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: "var(--r-md)", flexShrink: 0,
        background: cfg.bg, display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon size={16} color={cfg.color} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
          <div style={{ fontSize: 13, fontWeight: notif.lue ? 500 : 700, color: "var(--text)" }}>
            {notif.titre}
          </div>
          <div style={{ fontSize: 10, color: "var(--text-4)", whiteSpace: "nowrap" }}>{date}</div>
        </div>
        <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 3, lineHeight: 1.5 }}>
          {notif.message}
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          {notif.lien && (
            <a href={notif.lien} target="_blank" rel="noreferrer"
              style={{ fontSize: 11, color: "var(--blue-600)", fontWeight: 600, display: "flex", alignItems: "center", gap: 4, textDecoration: "none" }}>
              <ExternalLink size={11} /> Voir
            </a>
          )}
          {!notif.lue && (
            <button onClick={() => onLire(notif.id)}
              style={{ fontSize: 11, color: "var(--text-4)", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
              Marquer lue
            </button>
          )}
        </div>
      </div>
      {!notif.lue && (
        <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--blue-500)", flexShrink: 0, marginTop: 4 }} />
      )}
    </div>
  );
}

export default function ProfNotifications({ prof }) {
  const [notifs, setNotifs]   = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await notificationApi.getAll(prof.id);
      setNotifs(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [prof.id]);

  useEffect(() => {
    load();
    const poll = setInterval(load, POLL_MS);
    return () => clearInterval(poll);
  }, [load]);

  const handleLire = async (id) => {
    await notificationApi.marquerLue(id).catch(() => {});
    setNotifs(p => p.map(n => n.id === id ? { ...n, lue: true } : n));
  };

  const handleLireTout = async () => {
    await notificationApi.marquerToutes(prof.id).catch(() => {});
    setNotifs(p => p.map(n => ({ ...n, lue: true })));
  };

  const unread = notifs.filter(n => !n.lue).length;

  return (
    <div style={{ animation: "fadeUp 0.4s cubic-bezier(0.16,1,0.3,1)" }}>
      <PageHeader phase="🔔" title="Mes notifications"
        subtitle="Alertes et rappels concernant vos soutenances"
        action={unread > 0 && (
          <Button variant="secondary" icon={Check} onClick={handleLireTout}>
            Tout marquer lu ({unread})
          </Button>
        )}
      />

      {loading && <LoadingSkeleton rows={3} height={80} />}

      {!loading && notifs.length === 0 && (
        <EmptyState icon={Bell} title="Aucune notification" description="Vous n'avez pas encore reçu de notifications." />
      )}

      {!loading && notifs.map(n => (
        <NotifCard key={n.id} notif={n} onLire={handleLire} />
      ))}
    </div>
  );
}
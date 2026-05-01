import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, BookOpen, Link2, Calendar, GraduationCap,
  BarChart2, MessageCircle, Bell, LogOut, ChevronRight,
} from "lucide-react";
import api from "../api/axios";
import { notificationApi, affectationApi } from "../api/api";

import DashboardPage    from "./DashboardPage";
import ResultatsPage    from "./ResultatsPage";
import CalendrierCreneaux from "./CalendrierCreneaux";
import Planification    from "./Planification";
import Chat             from "./Chat";

import "./DasheboardChef.css";

/* ── Sections ─────────────────────────────────────────── */
const NAV = [
  { id: "dashboard",     label: "Tableau de bord",  sub: "Vue d'ensemble",         icon: LayoutDashboard },
  { id: "sujets",        label: "Sujets",            sub: "Valider les propositions",icon: BookOpen        },
  { id: "affectations",  label: "Affectations",      sub: "Algo & validation",      icon: Link2           },
  { id: "creneaux",      label: "Créneaux",          sub: "Planning jury & salles", icon: Calendar        },
  { id: "soutenances",   label: "Soutenances",       sub: "Planifier & résultats",  icon: GraduationCap   },
  { id: "resultats",     label: "Résultats",         sub: "Notes & export",         icon: BarChart2       },
  { id: "chat",          label: "Messagerie",        sub: "Profs & étudiants",      icon: MessageCircle   },
  { id: "notifications", label: "Notifications",     sub: "Alertes & infos",        icon: Bell            },
];

/* ── Nav item ─────────────────────────────────────────── */
function NavItem({ item, active, onClick, badge }) {
  const Icon = item.icon;
  return (
    <button
      onClick={() => onClick(item.id)}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        width: "100%", padding: "9px 10px", borderRadius: 10,
        border: "none", textAlign: "left", cursor: "pointer",
        background: active ? "rgba(99,102,241,0.18)" : "transparent",
        marginBottom: 2, transition: "background 0.15s", position: "relative",
      }}
    >
      {active && (
        <div style={{
          position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)",
          width: 3, height: 18, background: "#6366f1", borderRadius: "0 3px 3px 0",
        }} />
      )}
      <div style={{
        width: 30, height: 30, borderRadius: 8, flexShrink: 0,
        background: active ? "rgba(99,102,241,0.28)" : "rgba(255,255,255,0.04)",
        border: `1px solid ${active ? "rgba(99,102,241,0.4)" : "rgba(255,255,255,0.06)"}`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon size={13} color={active ? "#818cf8" : "#475569"} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: active ? 600 : 400, color: active ? "#e2e8f0" : "#64748b" }}>
          {item.label}
        </div>
        <div style={{ fontSize: 10, color: "#334155" }}>{item.sub}</div>
      </div>
      {badge > 0 && (
        <span style={{
          minWidth: 16, height: 16, borderRadius: 20, padding: "0 4px",
          background: "#ef4444", color: "#fff", fontSize: 9, fontWeight: 700,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>{badge > 9 ? "9+" : badge}</span>
      )}
      {active && !badge && <ChevronRight size={11} color="#6366f1" />}
    </button>
  );
}

/* ── Sujets panel ─────────────────────────────────────── */
function SujetsPanel() {
  const [tab, setTab]     = useState("EN_ATTENTE");
  const [sujets, setSujets] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    setLoading(true);
    try { const r = await api.get("/sujets"); setSujets(r.data); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetch(); }, []);

  const changerStatut = async (id, statut) => {
    try { await api.patch(`/sujets/${id}/statut?statut=${statut}`); fetch(); }
    catch (e) { console.error(e); }
  };

  const byStatut = (s) => sujets.filter(x => x.statut === s);
  const filtered = byStatut(tab);

  const tabStyle = (active) => ({
    padding: "8px 18px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500,
    background: active ? "#6366f1" : "rgba(255,255,255,0.05)",
    color: active ? "#fff" : "#94a3b8", transition: "all 0.15s",
  });

  return (
    <div style={{ padding: "0 4px" }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: "#e2e8f0", marginBottom: 16 }}>
        Validation des sujets PFA
      </h2>

      {/* Stats bar */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        {[
          { label: "Total",       val: sujets.length,           color: "#6366f1" },
          { label: "En attente",  val: byStatut("EN_ATTENTE").length, color: "#f59e0b" },
          { label: "Approuvés",   val: byStatut("APPROUVE").length,   color: "#10b981" },
          { label: "Refusés",     val: byStatut("REFUSE").length,     color: "#ef4444" },
        ].map(s => (
          <div key={s.label} style={{
            flex: 1, minWidth: 80, background: `${s.color}12`, border: `1px solid ${s.color}30`,
            borderRadius: 12, padding: "12px 16px",
          }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.val}</div>
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button style={tabStyle(tab === "EN_ATTENTE")} onClick={() => setTab("EN_ATTENTE")}>En attente</button>
        <button style={tabStyle(tab === "APPROUVE")} onClick={() => setTab("APPROUVE")}>Approuvés</button>
        <button style={tabStyle(tab === "REFUSE")} onClick={() => setTab("REFUSE")}>Refusés</button>
      </div>

      {loading ? (
        <div style={{ color: "#64748b", padding: 20 }}>Chargement…</div>
      ) : filtered.length === 0 ? (
        <div style={{ color: "#64748b", padding: 20 }}>Aucun sujet dans cette catégorie.</div>
      ) : filtered.map(s => (
        <div key={s.id} style={{
          background: "var(--surface, #1e293b)", border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 14, padding: "16px 20px", marginBottom: 12,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0", marginBottom: 4 }}>{s.titre}</div>
              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>{s.description}</div>
              <div style={{ fontSize: 11, color: "#475569" }}>
                Proposé par : <span style={{ color: "#94a3b8" }}>{s.encadrant?.nom || s.enseignant?.nom || "N/A"}</span>
                {s.dateProposition && <span style={{ marginLeft: 12 }}>· {s.dateProposition}</span>}
              </div>
              {s.motsCles?.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 8 }}>
                  {s.motsCles.map((m, i) => (
                    <span key={i} style={{
                      fontSize: 10, padding: "2px 8px", borderRadius: 20,
                      background: "rgba(99,102,241,0.15)", color: "#818cf8",
                    }}>{m}</span>
                  ))}
                </div>
              )}
            </div>
            {s.statut === "EN_ATTENTE" && (
              <div style={{ display: "flex", gap: 8, flexShrink: 0, marginLeft: 16 }}>
                <button
                  onClick={() => changerStatut(s.id, "APPROUVE")}
                  style={{ padding: "7px 14px", borderRadius: 8, border: "none", cursor: "pointer", background: "#10b981", color: "#fff", fontSize: 12, fontWeight: 600 }}
                >✔ Approuver</button>
                <button
                  onClick={() => changerStatut(s.id, "REFUSE")}
                  style={{ padding: "7px 14px", borderRadius: 8, border: "none", cursor: "pointer", background: "#ef4444", color: "#fff", fontSize: 12, fontWeight: 600 }}
                >✖ Refuser</button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Affectations panel ───────────────────────────────── */
function AffectationsPanel() {
  const [affectations, setAffectations] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [running, setRunning]   = useState(false);
  const [msg, setMsg]           = useState(null);

  const fetch = async () => {
    setLoading(true);
    try { setAffectations(await affectationApi.getAll()); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetch(); }, []);

  const lancer = async () => {
    setRunning(true); setMsg(null);
    try {
      const res = await affectationApi.lancerAlgorithme();
      setMsg({ type: "ok", text: `✔ ${res.length} affectations générées.` });
      fetch();
    } catch (e) { setMsg({ type: "err", text: "Erreur lors de l'algorithme." }); }
    finally { setRunning(false); }
  };

  const valider = async (id) => {
    try { await affectationApi.valider(id); fetch(); }
    catch (e) { console.error(e); }
  };
  const refuser = async (id) => {
    const c = prompt("Raison du refus (optionnel) :");
    try { await affectationApi.refuser(id, c || ""); fetch(); }
    catch (e) { console.error(e); }
  };

  const statutColor = { EN_ATTENTE: "#f59e0b", VALIDEE: "#10b981", REFUSEE: "#ef4444" };

  return (
    <div style={{ padding: "0 4px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#e2e8f0" }}>Affectations des sujets</h2>
        <button
          onClick={lancer}
          disabled={running}
          style={{
            padding: "9px 18px", borderRadius: 10, border: "none", cursor: "pointer",
            background: running ? "#334155" : "#6366f1", color: "#fff", fontWeight: 600, fontSize: 13,
          }}
        >{running ? "⏳ En cours…" : "⚡ Lancer l'algorithme"}</button>
      </div>

      {msg && (
        <div style={{
          padding: "10px 16px", borderRadius: 10, marginBottom: 16,
          background: msg.type === "ok" ? "#10b98120" : "#ef444420",
          border: `1px solid ${msg.type === "ok" ? "#10b981" : "#ef4444"}`,
          color: msg.type === "ok" ? "#10b981" : "#ef4444", fontSize: 13,
        }}>{msg.text}</div>
      )}

      {loading ? (
        <div style={{ color: "#64748b" }}>Chargement…</div>
      ) : affectations.length === 0 ? (
        <div style={{ color: "#64748b", padding: 20 }}>
          Aucune affectation. Lancez l'algorithme pour en générer.
        </div>
      ) : affectations.map(a => (
        <div key={a.id} style={{
          background: "var(--surface, #1e293b)", border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 14, padding: "14px 18px", marginBottom: 10,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0" }}>
              {a.binome?.etudiant1?.nom} & {a.binome?.etudiant2?.nom}
            </div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
              Sujet : <span style={{ color: "#94a3b8" }}>{a.sujet?.titre || "—"}</span>
              <span style={{ marginLeft: 10 }}>Score : <b style={{ color: "#6366f1" }}>{a.score?.toFixed(1)}</b></span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{
              fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 600,
              background: `${statutColor[a.statut] || "#64748b"}20`,
              color: statutColor[a.statut] || "#64748b",
            }}>{a.statut}</span>
            {a.statut === "EN_ATTENTE" && (
              <>
                <button onClick={() => valider(a.id)} style={{ padding: "5px 12px", borderRadius: 8, border: "none", cursor: "pointer", background: "#10b981", color: "#fff", fontSize: 11, fontWeight: 600 }}>Valider</button>
                <button onClick={() => refuser(a.id)} style={{ padding: "5px 12px", borderRadius: 8, border: "none", cursor: "pointer", background: "#ef4444", color: "#fff", fontSize: 11, fontWeight: 600 }}>Refuser</button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Notifications panel ──────────────────────────────── */
function NotificationsPanel({ adminId }) {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    setLoading(true);
    try { setNotifs(await notificationApi.getAll(adminId)); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetch(); }, [adminId]);

  const marquerLue = async (id) => {
    await notificationApi.marquerLue(id);
    fetch();
  };
  const marquerToutes = async () => {
    await notificationApi.marquerToutes(adminId);
    fetch();
  };

  const typeColor = { INFO: "#6366f1", DEBUT_SOUTENANCE: "#3b82f6", FIN_SOUTENANCE: "#10b981", RAPPORT: "#f59e0b", AVERTISSEMENT: "#ef4444" };

  return (
    <div style={{ padding: "0 4px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#e2e8f0" }}>Notifications</h2>
        {notifs.some(n => !n.lue) && (
          <button onClick={marquerToutes} style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", background: "transparent", color: "#94a3b8", fontSize: 12 }}>
            Tout marquer comme lu
          </button>
        )}
      </div>
      {loading ? (
        <div style={{ color: "#64748b" }}>Chargement…</div>
      ) : notifs.length === 0 ? (
        <div style={{ color: "#64748b", padding: 20 }}>Aucune notification.</div>
      ) : notifs.map(n => (
        <div key={n.id} onClick={() => !n.lue && marquerLue(n.id)} style={{
          background: n.lue ? "var(--surface, #1e293b)" : "rgba(99,102,241,0.08)",
          border: `1px solid ${n.lue ? "rgba(255,255,255,0.05)" : "rgba(99,102,241,0.25)"}`,
          borderLeft: `3px solid ${typeColor[n.type] || "#6366f1"}`,
          borderRadius: 12, padding: "14px 18px", marginBottom: 10,
          cursor: n.lue ? "default" : "pointer", transition: "background 0.15s",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0" }}>{n.titre}</span>
            <span style={{ fontSize: 10, color: "#475569" }}>{new Date(n.date).toLocaleString("fr-FR")}</span>
          </div>
          <div style={{ fontSize: 12, color: "#94a3b8" }}>{n.message}</div>
          {!n.lue && <div style={{ marginTop: 6, fontSize: 10, color: "#6366f1" }}>Cliquer pour marquer comme lu</div>}
        </div>
      ))}
    </div>
  );
}

/* ── Main component ───────────────────────────────────── */
export default function DashboardChef() {
  const [page, setPage]           = useState("dashboard");
  const [userName, setUserName]   = useState("Chef");
  const [adminId, setAdminId]     = useState(null);
  const [notifCount, setNotifCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const name = localStorage.getItem("userName");
    const id   = localStorage.getItem("userId");
    if (name) setUserName(name);
    if (id)   setAdminId(Number(id));
  }, []);

  useEffect(() => {
    if (!adminId) return;
    const poll = async () => {
      try {
        const r = await notificationApi.getUnreadCount(adminId);
        setNotifCount(r.count || 0);
      } catch {}
    };
    poll();
    const iv = setInterval(poll, 15000);
    return () => clearInterval(iv);
  }, [adminId]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const renderPage = () => {
    switch (page) {
      case "dashboard":    return <DashboardPage />;
      case "sujets":       return <SujetsPanel />;
      case "affectations": return <AffectationsPanel />;
      case "creneaux":     return <CalendrierCreneaux />;
      case "soutenances":  return <Planification />;
      case "resultats":    return <ResultatsPage />;
      case "chat":         return adminId ? <Chat adminId={adminId} /> : null;
      case "notifications":return adminId ? <NotificationsPanel adminId={adminId} /> : null;
      default:             return null;
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg, #0f172a)" }}>
      {/* ── Sidebar ── */}
      <aside style={{
        width: 220, flexShrink: 0,
        background: "var(--surface, #1e293b)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        display: "flex", flexDirection: "column",
        padding: "20px 12px",
        position: "sticky", top: 0, height: "100vh", overflowY: "auto",
      }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#e2e8f0", letterSpacing: "0.04em" }}>Gestion PFA</div>
          <div style={{ fontSize: 10, color: "#475569", marginTop: 2 }}>Chef de département</div>
          <div style={{ fontSize: 11, color: "#6366f1", marginTop: 6, fontWeight: 600 }}>{userName}</div>
        </div>

        <nav style={{ flex: 1 }}>
          {NAV.map(item => (
            <NavItem
              key={item.id}
              item={item}
              active={page === item.id}
              onClick={setPage}
              badge={item.id === "notifications" ? notifCount : 0}
            />
          ))}
        </nav>

        <button
          onClick={handleLogout}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            width: "100%", padding: "9px 10px", borderRadius: 10,
            border: "none", cursor: "pointer", marginTop: 12,
            background: "rgba(239,68,68,0.1)", color: "#f87171",
            fontSize: 12, fontWeight: 500,
          }}
        >
          <LogOut size={14} />
          Déconnexion
        </button>
      </aside>

      {/* ── Main content ── */}
      <main style={{ flex: 1, padding: "28px 32px", overflowY: "auto" }}>
        {renderPage()}
      </main>
    </div>
  );
}

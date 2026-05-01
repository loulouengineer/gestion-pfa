import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    let W = canvas.width = window.innerWidth;
    let H = canvas.height = window.innerHeight;

    const dots = Array.from({ length: 60 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 2 + 1,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      dots.forEach(d => {
        d.x += d.vx; d.y += d.vy;
        if (d.x < 0 || d.x > W) d.vx *= -1;
        if (d.y < 0 || d.y > H) d.vy *= -1;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(99,102,241,0.5)";
        ctx.fill();
      });
      dots.forEach((a, i) => dots.slice(i + 1).forEach(b => {
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(99,102,241,${0.15 * (1 - dist / 120)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }));
      animId = requestAnimationFrame(draw);
    };
    draw();

    const resize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);

  return (
    <div style={{ background: "#0a0f1e", minHeight: "100vh", color: "#fff", fontFamily: "'Segoe UI', sans-serif", overflow: "hidden" }}>

      {/* CANVAS BG */}
      <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }} />

      {/* NAVBAR */}
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "18px 48px", backdropFilter: "blur(12px)",
        background: "rgba(10,15,30,0.8)", borderBottom: "1px solid rgba(99,102,241,0.15)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "32px", height: "32px", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>🎓</div>
          <span style={{ fontSize: "16px", fontWeight: 700, letterSpacing: ".02em" }}>PFA <span style={{ color: "#6366f1" }}>MANAGER</span></span>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button onClick={() => navigate("/login")} style={{ padding: "9px 22px", background: "transparent", border: "1px solid rgba(99,102,241,0.5)", color: "#a5b4fc", borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: 500, transition: "all .2s" }}
            onMouseEnter={e => { e.target.style.borderColor = "#6366f1"; e.target.style.color = "#fff"; }}
            onMouseLeave={e => { e.target.style.borderColor = "rgba(99,102,241,0.5)"; e.target.style.color = "#a5b4fc"; }}>
            Connexion
          </button>
          <button onClick={() => navigate("/register")} style={{ padding: "9px 22px", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", border: "none", color: "#fff", borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: 500, boxShadow: "0 4px 15px rgba(99,102,241,0.4)", transition: "opacity .2s" }}
            onMouseEnter={e => e.target.style.opacity = "0.85"}
            onMouseLeave={e => e.target.style.opacity = "1"}>
            S'inscrire
          </button>
        </div>
      </header>

      {/* HERO */}
      <section style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", textAlign: "center", padding: "120px 24px 80px" }}>

        {/* BADGE */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.3)", padding: "6px 16px", borderRadius: "20px", fontSize: "12px", color: "#a5b4fc", marginBottom: "32px", letterSpacing: ".05em" }}>
          <span style={{ width: "6px", height: "6px", background: "#6366f1", borderRadius: "50%", display: "inline-block" }}></span>
          PLATEFORME INTELLIGENTE D'AFFECTATION PFA
        </div>

        <h1 style={{ fontSize: "clamp(36px, 6vw, 72px)", fontWeight: 800, lineHeight: 1.1, marginBottom: "24px", maxWidth: "800px" }}>
          Gérez vos projets de fin<br />
          <span style={{ background: "linear-gradient(135deg,#6366f1,#a78bfa,#ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            d'année avec l'IA
          </span>
        </h1>

        <p style={{ fontSize: "18px", color: "#94a3b8", maxWidth: "560px", lineHeight: 1.7, marginBottom: "40px" }}>
          Une plateforme intelligente qui connecte étudiants, enseignants et chefs de département pour une affectation optimale des sujets PFA.
        </p>

        <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", justifyContent: "center" }}>
          <button onClick={() => navigate("/register")} style={{ padding: "14px 32px", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", border: "none", color: "#fff", borderRadius: "10px", cursor: "pointer", fontSize: "15px", fontWeight: 600, boxShadow: "0 8px 30px rgba(99,102,241,0.4)", transition: "transform .2s, box-shadow .2s" }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(99,102,241,0.5)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 8px 30px rgba(99,102,241,0.4)"; }}>
            Commencer maintenant →
          </button>
          <button onClick={() => navigate("/login")} style={{ padding: "14px 32px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#e2e8f0", borderRadius: "10px", cursor: "pointer", fontSize: "15px", fontWeight: 500, transition: "background .2s" }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}>
            Se connecter
          </button>
        </div>

        {/* STATS ROW */}
        <div style={{ display: "flex", gap: "48px", marginTop: "72px", flexWrap: "wrap", justifyContent: "center" }}>
          {[
            { val: "20+", label: "Sujets disponibles", color: "#6366f1" },
            { val: "5", label: "Choix par binôme", color: "#8b5cf6" },
            { val: "100%", label: "Automatisé avec IA", color: "#a78bfa" },
          ].map(st => (
            <div key={st.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "36px", fontWeight: 800, color: st.color, lineHeight: 1 }}>{st.val}</div>
              <div style={{ fontSize: "13px", color: "#64748b", marginTop: "6px" }}>{st.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CARDS */}
      <section style={{ position: "relative", zIndex: 1, padding: "0 48px 100px", maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <h2 style={{ fontSize: "32px", fontWeight: 700, marginBottom: "12px" }}>
            Une plateforme pour <span style={{ color: "#6366f1" }}>tous</span>
          </h2>
          <p style={{ color: "#64748b", fontSize: "15px" }}>Chaque acteur a son espace dédié</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
          {[
            {
              icon: "📘", color: "#3b82f6", bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.2)",
              title: "Pour les Enseignants",
              desc: "Proposez vos sujets de PFA facilement et suivez leur validation en temps réel depuis votre tableau de bord.",
              tags: ["Proposer des sujets", "Suivi en temps réel"]
            },
            {
              icon: "🛡️", color: "#8b5cf6", bg: "rgba(139,92,246,0.08)", border: "rgba(139,92,246,0.2)",
              title: "Pour les Chefs de Département",
              desc: "Validez ou refusez les sujets proposés avec un processus de review simplifié et efficace.",
              tags: ["Validation rapide", "Vue d'ensemble"]
            },
            {
              icon: "🎓", color: "#10b981", bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.2)",
              title: "Pour les Étudiants",
              desc: "Recevez des recommandations IA personnalisées et choisissez vos 5 sujets préférés selon votre profil.",
              tags: ["Recommandations IA", "5 choix par binôme"]
            },
          ].map(card => (
            <div key={card.title} style={{
              background: card.bg, border: `1px solid ${card.border}`,
              borderRadius: "16px", padding: "28px", transition: "transform .2s, box-shadow .2s"
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = `0 20px 40px ${card.bg}`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
              <div style={{ fontSize: "32px", marginBottom: "16px" }}>{card.icon}</div>
              <h3 style={{ fontSize: "17px", fontWeight: 600, color: "#f1f5f9", marginBottom: "10px" }}>{card.title}</h3>
              <p style={{ fontSize: "14px", color: "#64748b", lineHeight: 1.7, marginBottom: "16px" }}>{card.desc}</p>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {card.tags.map(t => (
                  <span key={t} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", color: "#94a3b8", padding: "4px 10px", borderRadius: "20px", fontSize: "11px" }}>{t}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ position: "relative", zIndex: 1, textAlign: "center", padding: "24px", borderTop: "1px solid rgba(99,102,241,0.1)", color: "#334155", fontSize: "13px" }}>
        © 2026 PFA Manager — ENIC Carthage
      </footer>
    </div>
  );
};

export default Home;
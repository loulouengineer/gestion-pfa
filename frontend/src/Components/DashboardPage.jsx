import React, { useState, useEffect } from 'react';
import api from '../api/axios';

export default function DashboardPage({ onNavigate }) {
  const [data, setData] = useState({
    statutGlobal: "Chargement...",
    statutGlobalSub: "Veuillez patienter",
    binomeStatus: "...",
    binomeStatusSub: "...",
    sujetStatus: "...",
    sujetStatusSub: "...",
    joursRestants: null,
    joursRestantsSub: "...",
    progressPercentage: 0,
    currentStep: 1
  });

  useEffect(() => {
    api.get(`/dashboard/${localStorage.getItem('userId') || 1}`)
      .then(response => {
        setData(response.data);
      })
      .catch(error => {
        console.error("Erreur lors du chargement du dashboard:", error);
      });
  }, []);

  return (
    <div style={styles.container}>
      {/* HEADER */}
      <div style={styles.header}>
        <h1 style={styles.title}>Tableau de bord</h1>
        <p style={styles.subtitle}>Bienvenue, voici l'avancement de votre PFA.</p>
      </div>

      {/* KPI CARDS */}
      <div style={styles.grid}>
        <div style={styles.card}>
          <div style={styles.cardTitle}>STATUT GLOBAL</div>
          <div style={styles.cardValue}>{data.statutGlobal}</div>
          <div style={styles.cardSub}>{data.statutGlobalSub}</div>
        </div>
        <div style={styles.card}>
          <div style={styles.cardTitle}>MON BINÔME</div>
          <div style={{...styles.cardValue, color: data.currentStep >= 2 ? '#10b981' : '#f59e0b'}}>
            {data.binomeStatus}
          </div>
          <div style={styles.cardSub}>{data.binomeStatusSub}</div>
        </div>
        <div style={styles.card}>
          <div style={styles.cardTitle}>SUJET VALIDÉ</div>
          <div style={{...styles.cardValue, color: data.currentStep >= 3 ? '#10b981' : '#ef4444'}}>
            {data.sujetStatus}
          </div>
          <div style={styles.cardSub}>{data.sujetStatusSub}</div>
        </div>
        <div style={styles.card}>
          <div style={styles.cardTitle}>JOURS RESTANTS</div>
          <div style={{...styles.cardValue, color: '#4361ee'}}>
            {data.joursRestants !== null ? data.joursRestants : "-"}
          </div>
          <div style={styles.cardSub}>{data.joursRestantsSub}</div>
        </div>
      </div>

      {/* PROGRESS SECTION */}
      <div style={styles.mainSection}>
        <h2 style={styles.sectionTitle}>Avancement du Projet</h2>
        
        <div style={styles.progressContainer}>
          <div style={styles.progressTrack}>
            <div style={{...styles.progressBar, width: `${data.progressPercentage}%`}}></div>
          </div>
          <div style={styles.progressText}>{data.progressPercentage}% Complété</div>
        </div>

        <div style={styles.stepsContainer}>
          <div style={styles.step}>
            <div style={{...styles.stepDot, ...(data.currentStep > 1 ? styles.stepDotActive : styles.stepDotCurrent)}}>
              {data.currentStep > 1 ? "✔" : "1"}
            </div>
            <div style={styles.stepText}>Inscription</div>
          </div>
          <div style={{...styles.stepLine, backgroundColor: data.currentStep > 1 ? "#10b981" : "#e2e8f0"}}></div>
          <div style={styles.step}>
            <div style={{
              ...styles.stepDot,
              ...(data.currentStep > 2 ? styles.stepDotActive : (data.currentStep === 2 ? styles.stepDotCurrent : {}))
            }}>
              {data.currentStep > 2 ? "✔" : "2"}
            </div>
            <div style={styles.stepText}>Binôme & Sujet</div>
          </div>
          <div style={{...styles.stepLine, backgroundColor: data.currentStep > 2 ? "#10b981" : "#e2e8f0"}}></div>
          <div style={styles.step}>
            <div style={{
              ...styles.stepDot,
              ...(data.currentStep > 3 ? styles.stepDotActive : (data.currentStep === 3 ? styles.stepDotCurrent : {}))
            }}>
              {data.currentStep > 3 ? "✔" : "3"}
            </div>
            <div style={styles.stepText}>Dépôt Rapport</div>
          </div>
          <div style={{...styles.stepLine, backgroundColor: data.currentStep > 3 ? "#10b981" : "#e2e8f0"}}></div>
          <div style={styles.step}>
            <div style={{
              ...styles.stepDot,
              ...(data.currentStep > 4 ? styles.stepDotActive : (data.currentStep === 4 ? styles.stepDotCurrent : {}))
            }}>
              {data.currentStep > 4 ? "✔" : "4"}
            </div>
            <div style={styles.stepText}>Soutenance</div>
          </div>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div style={styles.actionSection}>
        <h2 style={styles.sectionTitle}>Prochaines actions</h2>
        <div style={styles.actionGrid}>
          {data.currentStep < 2 && (
            <button style={styles.primaryButton} onClick={() => onNavigate('binome')}>
              Associer un binôme
            </button>
          )}
          {data.currentStep === 2 && (
            <button style={styles.primaryButton} onClick={() => onNavigate('sujets')}>
              Choisir un sujet
            </button>
          )}
          <button style={styles.secondaryButton} onClick={() => onNavigate('recommandations')}>
            Voir les recommandations IA
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "40px",
    backgroundColor: "#f8fafc",
    minHeight: "100vh",
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  },
  header: {
    marginBottom: "32px",
  },
  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#0f172a",
    margin: "0 0 8px 0",
  },
  subtitle: {
    fontSize: "15px",
    color: "#64748b",
    margin: 0,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
    marginBottom: "32px",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
    display: "flex",
    flexDirection: "column",
    transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
    cursor: "default",
  },
  cardTitle: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#94a3b8",
    letterSpacing: "0.05em",
    marginBottom: "8px",
  },
  cardValue: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: "4px",
  },
  cardSub: {
    fontSize: "13px",
    color: "#64748b",
  },
  mainSection: {
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    padding: "32px",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)",
    marginBottom: "32px",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#1e293b",
    margin: "0 0 24px 0",
  },
  progressContainer: {
    marginBottom: "32px",
  },
  progressTrack: {
    height: "12px",
    backgroundColor: "#e2e8f0",
    borderRadius: "999px",
    overflow: "hidden",
    marginBottom: "8px",
  },
  progressBar: {
    height: "100%",
    width: "25%",
    backgroundColor: "#4361ee",
    borderRadius: "999px",
    transition: "width 1s ease-in-out",
  },
  progressText: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#4361ee",
    textAlign: "right",
  },
  stepsContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  step: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
    zIndex: 2,
    backgroundColor: "#ffffff",
    padding: "0 10px",
  },
  stepDot: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    backgroundColor: "#f1f5f9",
    color: "#94a3b8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
    fontWeight: "600",
    border: "2px solid #e2e8f0",
  },
  stepDotActive: {
    backgroundColor: "#10b981",
    color: "#ffffff",
    borderColor: "#10b981",
  },
  stepDotCurrent: {
    backgroundColor: "#eff6ff",
    color: "#4361ee",
    borderColor: "#4361ee",
  },
  stepText: {
    fontSize: "13px",
    fontWeight: "500",
    color: "#475569",
  },
  stepLine: {
    flex: 1,
    height: "2px",
    backgroundColor: "#e2e8f0",
    margin: "0 -20px",
    transform: "translateY(-15px)",
    zIndex: 1,
  },
  actionSection: {
    display: "flex",
    flexDirection: "column",
  },
  actionGrid: {
    display: "flex",
    gap: "16px",
  },
  primaryButton: {
    padding: "12px 24px",
    backgroundColor: "#4361ee",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  secondaryButton: {
    padding: "12px 24px",
    backgroundColor: "#f1f5f9",
    color: "#334155",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 0.2s",
  }
};
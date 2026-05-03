import { useState, useEffect } from "react";
import { adminApi } from "../api/api";

export default function ValidationInscriptions() {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getPendingUsers();
      setPendingUsers(data);
    } catch (err) {
      console.error("Erreur lors de la récupération des utilisateurs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleValidate = async (id, approuve) => {
    try {
      setProcessingId(id);
      await adminApi.validateUser(id, approuve);
      setPendingUsers(prev => prev.filter(u => u.id !== id));
    } catch (err) {
      alert("Erreur lors de la validation: " + (err.response?.data?.message || err.message));
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <div style={styles.loading}>Chargement des demandes...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Validation des Inscriptions</h2>
        <p style={styles.subtitle}>{pendingUsers.length} demande(s) en attente de validation</p>
      </div>

      {pendingUsers.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>✅</div>
          <h3>Aucune demande en attente</h3>
          <p>Tous les comptes ont été traités.</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {pendingUsers.map(user => (
            <div key={user.id} style={styles.card}>
              <div style={styles.cardTop}>
                <div style={{...styles.roleBadge, background: user.role === 'ETUDIANT' ? '#eff6ff' : '#fef2f2', color: user.role === 'ETUDIANT' ? '#3b82f6' : '#ef4444'}}>
                  {user.role}
                </div>
                <div style={styles.avatar}>
                  {user.prenom[0]}{user.nom[0]}
                </div>
              </div>
              
              <div style={styles.userInfo}>
                <h3 style={styles.userName}>{user.prenom} {user.nom}</h3>
                <p style={styles.userEmail}>{user.email}</p>
              </div>

              <div style={styles.cardActions}>
                <button 
                  style={{...styles.btn, ...styles.btnReject}}
                  onClick={() => handleValidate(user.id, false)}
                  disabled={processingId === user.id}
                >
                  {processingId === user.id ? "..." : "Refuser"}
                </button>
                <button 
                  style={{...styles.btn, ...styles.btnApprove}}
                  onClick={() => handleValidate(user.id, true)}
                  disabled={processingId === user.id}
                >
                  {processingId === user.id ? "..." : "Approuver"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '24px',
    animation: 'fadeIn 0.5s ease-out',
  },
  header: {
    marginBottom: '32px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1e293b',
    margin: '0 0 8px 0',
  },
  subtitle: {
    fontSize: '14px',
    color: '#64748b',
    margin: 0,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '24px',
  },
  card: {
    background: '#ffffff',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    border: '1px solid #f1f5f9',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    ':hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    }
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px',
  },
  roleBadge: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600',
    fontSize: '14px',
  },
  userInfo: {
    marginBottom: '24px',
  },
  userName: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#0f172a',
    margin: '0 0 4px 0',
  },
  userEmail: {
    fontSize: '14px',
    color: '#64748b',
    margin: 0,
    wordBreak: 'break-all',
  },
  cardActions: {
    display: 'flex',
    gap: '12px',
  },
  btn: {
    flex: 1,
    padding: '10px',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    border: 'none',
    transition: 'all 0.2s ease',
  },
  btnApprove: {
    background: '#10b981',
    color: 'white',
    boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.2)',
  },
  btnReject: {
    background: '#ef4444',
    color: 'white',
    boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.2)',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    background: '#f8fafc',
    borderRadius: '24px',
    border: '2px dashed #e2e8f0',
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '200px',
    color: '#64748b',
    fontSize: '16px',
  }
};

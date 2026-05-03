import React, { useState, useEffect } from 'react';
import './Recommandations.css';
import api from '../api/axios'; // ← utilise l'instance axios configurée

const Recommandation = () => {
  const [recommandations, setRecommandations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedSujet, setSelectedSujet] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('score');

  const fetchRecommandations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const userId = localStorage.getItem('userId'); // ← récupère l'id
      const res = await api.get(`/recommandation-ia/${userId}`); // ← bon port + token auto
      setRecommandations(res.data);
    } catch (err) {
      setError("Impossible de contacter le serveur.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommandations();
  }, []);

  const filteredRecommandations = recommandations
    .filter(rec => 
      rec.titre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
       console.log('sortBy:', sortBy, 'a.score:', a.score, 'b.score:', b.score, 'a.rangSujet:', a.rangSujet, 'b.rangSujet:', b.rangSujet);
      if (sortBy === 'score') return (b.score || 0) - (a.score || 0);
      return (a.rangSujet || 0) - (b.rangSujet || 0);
    });

  const getScoreColor = (score) => {
    if (score >= 90) return 'excellent';
    if (score >= 80) return 'bon';
    if (score >= 70) return 'moyen';
    return 'faible';
  };

  const getScoreIcon = (rang) => {
    if (rang === 1) return '🥇';
    if (rang === 2) return '🥈';
    if (rang === 3) return '🥉';
    return `#${rang}`;
  };

  return (
    <div className="recommandation-container">
      <header className="header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo-icon">🎯</div>
            <div>
              <h1>Recommandations IA</h1>
              <p className="subtitle">Suggestions générées par Ollama</p>
            </div>
          </div>
          <div className="header-stats">
            <div className="stat-item">
              <span className="stat-number">{recommandations.length}</span>
              <span className="stat-label">Sujets trouvés</span>
            </div>
          </div>
        </div>
      </header>

      <div className="controls-section">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Rechercher un sujet..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="sort-controls">
          <span>Trier par :</span>
          <button 
            className={sortBy === 'score' ? 'active' : ''}
            onClick={() => setSortBy('score')}
          >
            Score IA
          </button>
          <button 
            className={sortBy === 'rang' ? 'active' : ''}
            onClick={() => setSortBy('rang')}
          >
            Rang
          </button>
        </div>
      </div>

      {loading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>L'IA analyse vos sujets...</p>
          <span className="loading-sub">Connexion à Ollama via Spring Boot</span>
        </div>
      )}

      {error && (
        <div className="error-state">
          <span className="error-icon">⚠️</span>
          <p>{error}</p>
          <button onClick={fetchRecommandations}>Réessayer</button>
        </div>
      )}

      {!loading && !error && (
        <div className="cards-grid">
          {filteredRecommandations.map((rec) => (
            <div 
              key={rec.sujetId}
              className={`recommandation-card ${selectedSujet === rec.sujetId ? 'expanded' : ''}`}
              onClick={() => setSelectedSujet(selectedSujet === rec.sujetId ? null : rec.sujetId)}
            >
              <div className="card-header">
                <div className="rank-badge">{getScoreIcon(rec.rangSujet)}</div>
                <div className={`score-badge ${getScoreColor(rec.score)}`}>
                  <span className="score-value">{rec.score}%</span>
                  <span className="score-label">Match</span>
                </div>
                 <div style={{fontSize: 11, color: '#64748b'}}>
                    {sortBy === 'score' ? `Score: ${rec.score}%` : `Rang: #${rec.rangSujet}`}
                </div>
              </div>

              <div className="card-content">
                <h3>{rec.titre}</h3>
                <p className="description">{rec.description}</p>
                
                <div className="explication-section">
                  <span className="section-label">💡 Recommandation</span>
                  <p>{rec.explication}</p>
                </div>
              </div>

              {selectedSujet === rec.sujetId && (
                <div className="expanded-content">
                  <div className="ia-analysis">
                    <div className="analysis-header">
                      <span className="ai-icon">🤖</span>
                      <h4>Analyse IA (Ollama)</h4>
                    </div>
                    <div className="analysis-body">
                      <p>{rec.analyseIA || "Analyse non disponible"}</p>
                    </div>
                  </div>
                  
                  <div className="action-buttons">
                    <button className="btn-primary">Choisir ce sujet</button>
                  </div>
                </div>
              )}

              <div className="expand-hint">
                {selectedSujet === rec.sujetId ? '▲ Réduire' : '▼ Voir l\'analyse IA'}
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && !error && filteredRecommandations.length === 0 && (
        <div className="empty-state">
          <span className="empty-icon">📭</span>
          <p>Aucune recommandation disponible</p>
          <button onClick={fetchRecommandations} className="btn-primary" style={{marginTop: '1rem'}}>
            Rafraîchir
          </button>
        </div>
      )}
    </div>
  );
};

export default Recommandation;
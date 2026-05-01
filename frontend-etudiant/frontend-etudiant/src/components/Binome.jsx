import { useState, useEffect } from 'react';
import {
  rechercherEtudiants,
  envoyerDemandeBinome,
  accepterDemandeBinome,
  refuserDemandeBinome,
  dissoudreBinome,
  getDemandesRecues,
  getBinomeActuel,
} from '../api/api';

function initials(nom = '') {
  return nom.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

export default function Binome({ etudiant, binome, onBinomeFormed, onBinomeDissous }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [resultats, setResultats]     = useState([]);
  const [searching, setSearching]     = useState(false);
  const [demandesRecues, setDemandes] = useState([]);
  const [message, setMessage]         = useState(null);
  const [loading, setLoading]         = useState(true);
  const [confirming, setConfirming]   = useState(false);

  useEffect(() => {
    Promise.all([
      getBinomeActuel(etudiant.id),
      getDemandesRecues(etudiant.id),
    ])
      .then(([binomeRes, demandesRes]) => {
        if (binomeRes.data) onBinomeFormed(binomeRes.data);
        setDemandes(demandesRes.data ?? []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [etudiant.id]);

  const showMsg = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await rechercherEtudiants(searchQuery);
      setResultats((res.data ?? []).filter((e) => e.id !== etudiant.id));
    } catch {
      showMsg('Erreur lors de la recherche.', 'error');
    } finally {
      setSearching(false);
    }
  };

  const handleEnvoyer = async (partenaire) => {
    try {
      await envoyerDemandeBinome(etudiant.id, partenaire.id);
      showMsg(`Demande envoyée à ${partenaire.nom}.`, 'success');
      setResultats([]);
      setSearchQuery('');
    } catch (err) {
      const msg = err.response?.data?.message ?? "Erreur lors de l'envoi.";
      showMsg(msg, 'error');
    }
  };

  const handleAccepter = async (demande) => {
    try {
      const res = await accepterDemandeBinome(demande.id);
      onBinomeFormed(res.data);
      setDemandes([]);
      showMsg(`Binôme formé avec ${demande.expediteur.nom} !`, 'success');
    } catch {
      showMsg("Erreur lors de l'acceptation.", 'error');
    }
  };

  const handleRefuser = async (demandeId) => {
    try {
      await refuserDemandeBinome(demandeId);
      setDemandes((prev) => prev.filter((d) => d.id !== demandeId));
    } catch {
      showMsg('Erreur lors du refus.', 'error');
    }
  };

  const handleDissoudre = async () => {
    try {
      await dissoudreBinome(binome.id);
      onBinomeDissous();
      setConfirming(false);
      showMsg('Binôme dissous.', 'warning');
    } catch {
      showMsg('Erreur lors de la dissolution.', 'error');
    }
  };

  if (loading) return <div className="loading-state">Chargement…</div>;

  /* ── Binôme actif ── */
  if (binome) {
    return (
      <>
        {message && <div className={`message message-${message.type}`}>{message.text}</div>}
        <div className="binome-card binome-card--active">
          <div className="binome-header">
            <div className="binome-avatars">
              <div className="b-avatar b-avatar--me">{initials(etudiant.nom)}</div>
              <div className="b-link-icon">⟷</div>
              <div className="b-avatar b-avatar--partner">{initials(binome.partenaire.nom)}</div>
            </div>
            <span className="binome-status-badge">Binôme actif</span>
          </div>
          <div className="binome-members">
            <div className="binome-member">
              <span className="member-label">Vous</span>
              <span className="member-name">{etudiant.nom}</span>
              <span className="member-meta">{etudiant.matricule} · {etudiant.moyenne}/20</span>
            </div>
            <div className="binome-member">
              <span className="member-label">Partenaire</span>
              <span className="member-name">{binome.partenaire.nom}</span>
              <span className="member-meta">{binome.partenaire.matricule} · {binome.partenaire.moyenne}/20</span>
            </div>
          </div>
          <div className="binome-moyenne">
            <span className="moy-label">Moyenne commune</span>
            <span className="moy-value">{binome.moyenneCommune?.toFixed(2)}/20</span>
          </div>
          <hr className="binome-divider" />
          {!confirming ? (
            <button className="btn-dissoudre" onClick={() => setConfirming(true)}>
              Dissoudre le binôme
            </button>
          ) : (
            <div className="confirm-box">
              <p>Confirmer la dissolution ? Cette action est irréversible.</p>
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <button className="btn-retirer" onClick={handleDissoudre}>Oui, dissoudre</button>
                <button className="btn-details" onClick={() => setConfirming(false)}>Annuler</button>
              </div>
            </div>
          )}
        </div>
      </>
    );
  }

  /* ── Pas de binôme ── */
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>

      {/* Colonne gauche */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Étapes */}
        <div className="binome-info-box">
          <p className="section-label" style={{ marginBottom: 14 }}>Comment ça marche</p>
          {[
            { num: '1', title: 'Recherchez', desc: 'Cherchez un camarade par nom, matricule ou spécialité.' },
            { num: '2', title: 'Envoyez une demande', desc: 'Cliquez sur "Envoyer une demande" sur le profil souhaité.' },
            { num: '3', title: 'Confirmation', desc: 'Le binôme est formé dès que l\'autre étudiant accepte.' },
          ].map((s) => (
            <div key={s.num} style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
              <div style={{
                width: 26, height: 26, borderRadius: '50%',
                background: '#EEF2FF', color: '#4338CA',
                fontSize: 12, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, marginTop: 1,
              }}>{s.num}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', marginBottom: 2 }}>{s.title}</div>
                <div style={{ fontSize: 12, color: '#64748B', lineHeight: 1.5 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Règles */}
        <div className="binome-info-box">
          <p className="section-label" style={{ marginBottom: 10 }}>Règles</p>
          {[
            'Un étudiant ne peut appartenir qu\'à un seul binôme.',
            'Les deux membres soumettent leurs vœux ensemble.',
            'La moyenne commune détermine la priorité d\'attribution.',
            'La dissolution est possible avant la soumission des vœux.',
          ].map((r, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, fontSize: 12, color: '#475569' }}>
              <span style={{ color: '#16A34A', fontWeight: 700, flexShrink: 0 }}>✓</span>
              <span>{r}</span>
            </div>
          ))}
        </div>

      </div>

      {/* Colonne droite */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Demandes reçues */}
        {demandesRecues.length > 0 && (
          <div className="binome-info-box">
            <p className="section-label" style={{ marginBottom: 12 }}>
              Demandes reçues
              <span style={{
                background: '#DC2626', color: 'white',
                fontSize: 10, fontWeight: 700,
                padding: '1px 7px', borderRadius: 10, marginLeft: 8,
              }}>{demandesRecues.length}</span>
            </p>
            {demandesRecues.map((d) => (
              <div key={d.id} className="demande-card">
                <div className="demande-info">
                  <div className="b-avatar b-avatar--partner" style={{ width: 36, height: 36, fontSize: 12 }}>
                    {initials(d.expediteur.nom)}
                  </div>
                  <div>
                    <div className="member-name" style={{ fontSize: 13 }}>{d.expediteur.nom}</div>
                    <div className="member-meta">{d.expediteur.matricule} · {d.expediteur.moyenne}/20 · {d.expediteur.specialite}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 7 }}>
                  <button className="btn-choisir btn-sm" onClick={() => handleAccepter(d)}>Accepter</button>
                  <button className="btn-retirer" style={{ padding: '5px 10px', fontSize: 12 }} onClick={() => handleRefuser(d.id)}>Refuser</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Recherche */}
        <div className="binome-info-box">
          <p className="section-label" style={{ marginBottom: 12 }}>Rechercher un partenaire</p>
          {message && <div className={`message message-${message.type}`} style={{ marginBottom: 12 }}>{message.text}</div>}
          <div className="binome-search-row" style={{ marginBottom: resultats.length ? 14 : 0 }}>
            <input
              className="search-input"
              placeholder="Nom, matricule ou spécialité…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              className="btn-choisir"
              onClick={handleSearch}
              disabled={searching || !searchQuery.trim()}
            >
              {searching ? '…' : 'Rechercher'}
            </button>
          </div>

          {/* Résultats */}
          {resultats.map((e) => (
            <div key={e.id} className="sujet-card" style={{ marginBottom: 8 }}>
              <div className="sujet-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div className="b-avatar b-avatar--partner" style={{ width: 36, height: 36, fontSize: 12 }}>
                    {initials(e.nom)}
                  </div>
                  <div>
                    <div className="sujet-titre" style={{ fontSize: 13, marginBottom: 3 }}>{e.nom}</div>
                    <div className="sujet-badges">
                      <span style={{ fontSize: 11, color: '#64748B' }}>{e.matricule}</span>
                      <span style={{ fontSize: 11, color: '#CBD5E1' }}>·</span>
                      <span style={{ fontSize: 11, color: '#64748B' }}>{e.moyenne}/20</span>
                      <span style={{ fontSize: 11, color: '#CBD5E1' }}>·</span>
                      <span style={{ fontSize: 11, color: '#64748B' }}>{e.specialite}</span>
                    </div>
                    {e.dejaBinome && (
                      <span style={{ fontSize: 11, color: '#DC2626', display: 'block', marginTop: 2 }}>
                        Déjà dans un binôme
                      </span>
                    )}
                  </div>
                </div>
                <button
                  className="btn-choisir btn-sm"
                  disabled={e.dejaBinome}
                  onClick={() => handleEnvoyer(e)}
                >
                  Envoyer une demande
                </button>
              </div>
            </div>
          ))}

          {searchQuery && !searching && resultats.length === 0 && (
            <div style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', padding: '16px 0' }}>
              Aucun étudiant trouvé pour « {searchQuery} ».
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import SujetsDisponibles from './components/SujetsDisponibles';
import ChoixSujets from './components/ChoixSujets';
import Recommandations from './components/Recommandations';
import StatsBar from './components/StatsBar';
import Binome from './components/Binome';
import { getSujetsDisponibles, getBinomeActuel } from './api/api';
import './App.css';

const NAV_ITEMS = [
  { num: 1, label: 'Mon binôme',      sub: 'Associer un partenaire',   id: 'binome' },
  { num: 2, label: 'Sujets',          sub: 'Parcourir & sélectionner', id: 'sujets' },
  { num: 3, label: 'Recommandations', sub: 'Suggestions IA',           id: 'recommandations' },
  { num: 4, label: 'Mes vœux',        sub: 'Ordre & soumission',       id: 'mes-choix' },
];

const ETUDIANT = {
  id: 1,
  nom: 'Ahmed Ben Ali',
  matricule: '2024001',
  moyenne: 14.5,
  specialite: 'GL',
};

const PAGE_META = {
  binome:          { title: 'Mon binôme',        sub: 'Recherchez et associez-vous à un partenaire pour votre PFA' },
  sujets:          { title: 'Sujets disponibles', sub: 'Parcourez et sélectionnez vos sujets de PFA' },
  recommandations: { title: 'Recommandations IA', sub: 'Sujets suggérés selon votre profil académique' },
  'mes-choix':     { title: 'Mes vœux',           sub: 'Classez vos préférences et soumettez votre liste finale' },
};

export default function App() {
  const [onglet, setOnglet]             = useState('binome');
  const [choixActuels, setChoixActuels] = useState([]);
  const [nouveauSujet, setNouveauSujet] = useState(null);
  const [totalSujets, setTotalSujets]   = useState(0);
  const [binome, setBinome]             = useState(null);

  useEffect(() => {
    getSujetsDisponibles()
      .then((res) => setTotalSujets(res.data.length))
      .catch(console.error);

    getBinomeActuel(ETUDIANT.id)
      .then((res) => {
        const b = res.data;
        const partenaire = b.etudiant1.id === ETUDIANT.id ? b.etudiant2 : b.etudiant1;
        setBinome({
          id: b.id,
          moyenneCommune: b.moyenneBinome,
          partenaire: {
            id: partenaire.id,
            nom: partenaire.nom,
            email: partenaire.email,
            matricule: partenaire.matricule,
            moyenne: partenaire.moyenne,
          }
        });
      })
      .catch(console.error);
  }, []);

  const handleSelectionner = (sujet) => {
    setNouveauSujet(sujet);
    setOnglet('mes-choix');
  };

  const { title, sub } = PAGE_META[onglet];

  return (
    <div className="app-layout">

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h2>Gestion PFA</h2>
          <p>Sélection 2025–2026</p>
        </div>

        <nav className="sidebar-nav">
          <p className="sidebar-nav-label">Navigation</p>
          {NAV_ITEMS.map((item) => (
            <div
              key={item.id}
              className={`nav-item ${onglet === item.id ? 'active' : ''}`}
              onClick={() => setOnglet(item.id)}
            >
              <div className="nav-item-number">{item.num}</div>
              <div className="nav-item-text">
                <strong>{item.label}</strong>
                <span>{item.sub}</span>
                {item.id === 'binome' && binome && (
                  <span className="nav-check">✓</span>
                )}
              </div>
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="footer-name">{ETUDIANT.nom}</div>
          <div>{ETUDIANT.matricule} · {ETUDIANT.moyenne}/20</div>
          {binome && (
            <div className="footer-binome">
              Binôme · {binome.partenaire.nom.split(' ')[0]}
            </div>
          )}
          <div className="footer-backend">Backend · localhost:8081</div>
        </div>
      </aside>

      {/* Contenu principal */}
      <main className="main-content">
        <div className="page-header">
          <h1 className="page-title">{title}</h1>
          <p className="page-subtitle">{sub}</p>
        </div>

        <StatsBar
          totalSujets={totalSujets}
          totalChoix={choixActuels.length}
          moyenne={ETUDIANT.moyenne}
          binome={binome}
        />

        {!binome && onglet === 'mes-choix' && (
          <div className="message message-warning" style={{ marginBottom: 16 }}>
            ⚠ Vous n'avez pas encore de binôme. Associez-vous à un partenaire avant de soumettre vos vœux.
          </div>
        )}

        <div className="tabs">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`tab ${onglet === item.id ? 'active' : ''}`}
              onClick={() => setOnglet(item.id)}
            >
              {item.label}
              {item.id === 'mes-choix' && choixActuels.length > 0 && (
                <span className="tab-badge">{choixActuels.length}</span>
              )}
              {item.id === 'binome' && binome && (
                <span className="tab-badge tab-badge--green">✓</span>
              )}
            </button>
          ))}
        </div>

        <div className="tab-content">
          {onglet === 'binome' && (
            <Binome
              etudiant={ETUDIANT}
              binome={binome}
              onBinomeFormed={setBinome}
              onBinomeDissous={() => setBinome(null)}
            />
          )}
          {onglet === 'sujets' && (
            <SujetsDisponibles
              onSelectionner={handleSelectionner}
              choixActuels={choixActuels}
            />
          )}
          {onglet === 'recommandations' && (
            <Recommandations
              etudiant={ETUDIANT}
              onSelectionner={handleSelectionner}
              choixActuels={choixActuels}
            />
          )}
          {onglet === 'mes-choix' && (
            <ChoixSujets
              etudiantId={binome?.id}
              binome={binome}
              nouveauSujet={nouveauSujet}
              onChoixChange={setChoixActuels}
              onChoixSoumis={() => setNouveauSujet(null)}
            />
          )}
        </div>
      </main>
    </div>
  );
}
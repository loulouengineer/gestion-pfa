export default function StatsBar({ totalSujets, totalChoix, moyenne, binome }) {
  const pct = Math.round((totalChoix / 5) * 100);

  return (
    <div className="stats-container">

      <div className="stat-card">
        <span className="stat-label">Sujets disponibles</span>
        <div className="stat-value blue">{totalSujets}</div>
        <div className="stat-sub">à parcourir</div>
      </div>

      <div className="stat-card">
        <span className="stat-label">Mes vœux</span>
        <div className="stat-value green">
          {totalChoix}
          <span style={{ fontSize: 16, fontWeight: 400, color: '#94A3B8' }}>/5</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="progress-percent">{pct}%</div>
      </div>

      <div className="stat-card">
        <span className="stat-label">Ma moyenne</span>
        <div className="stat-value orange">
  {moyenne !== null && moyenne !== undefined ? moyenne : 'N/A'}
</div>
        <div className="stat-sub">sur 20</div>
      </div>

      <div className="stat-card">
        <span className="stat-label">Mon binôme</span>
        {binome ? (
          <>
            <div className="stat-value green" style={{ fontSize: 14, marginTop: 4 }}>
              {binome.partenaire?.nom
                ?? binome.etudiant1?.nom
                ?? binome.etudiant2?.nom
                ?? 'Binôme actif'} {binome.partenaire?.prenom ?? binome.etudiant?.prenom}
            </div>
            <div className="stat-sub">
              Moy. commune · {(binome.moyenneCommune ?? binome.moyenneBinome)?.toFixed(2)}/20
            </div>
          </>
        ) : (
          <>
            <div className="stat-value" style={{ fontSize: 14, color: '#94A3B8', marginTop: 4 }}>
              Non défini
            </div>
            <div className="stat-sub">à associer</div>
          </>
        )}
      </div>

    </div>
  );
}
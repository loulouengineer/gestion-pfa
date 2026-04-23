// components/PhaseMenu.js
export default function PhaseMenu() {
  const phases = [
    { name: 'Validation', status: 'en-attente', progress: 33 },
    { name: 'Disponibilités', status: 'inactif', progress: 0 },
    { name: 'Planification', status: 'inactif', progress: 0 },
    { name: 'Planning final', status: 'inactif', progress: 0 }
  ];

  return (
    <aside className="phase-menu">
      <h3>PHASES</h3>
      <ul>
        {phases.map((phase, idx) => (
          <li key={idx} className={`phase-item ${phase.status}`}>
            <div className="phase-header">
              <span className="phase-name">{phase.name}</span>
              {phase.status === 'en-attente' && <span className="badge-en-attente">En attente</span>}
              {phase.status === 'validee' && <span className="badge-validee">Validée</span>}
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${phase.progress}%` }}></div>
            </div>
            <span className="progress-percent">{phase.progress}%</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
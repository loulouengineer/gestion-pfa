const difficulteConfig = {
  1: { label: 'Facile', bg: '#DCFCE7', color: '#15803D' },
  2: { label: 'Facile', bg: '#DCFCE7', color: '#15803D' },
  3: { label: 'Moyen', bg: '#FEF9C3', color: '#A16207' },
  4: { label: 'Difficile', bg: '#FEF2F2', color: '#DC2626' },
  5: { label: 'Difficile', bg: '#FEF2F2', color: '#DC2626' },
};

const s = (bg, color) => ({
  display: 'inline-block',
  background: bg, color,
  fontSize: 11, fontWeight: 600,
  padding: '3px 10px', borderRadius: 6,
  letterSpacing: '0.2px',
});

export function BadgeDifficulte({ niveau }) {
  const cfg = difficulteConfig[niveau] ?? difficulteConfig[3];
  return <span style={s(cfg.bg, cfg.color)}>{cfg.label} {niveau}/5</span>;
}

export function BadgeDisponible({ disponible }) {
  return (
    <span style={s(
      disponible ? '#DCFCE7' : '#F1F5F9',
      disponible ? '#15803D' : '#64748B',
    )}>
      {disponible ? 'Disponible' : 'Non disponible'}
    </span>
  );
}

export function BadgeOrdre({ ordre }) {
  return <span style={s('#EEF2FF', '#4338CA')}>Vœu #{ordre}</span>;
}

export function BadgeTech({ tech }) {
  return <span style={s('#F0F9FF', '#0369A1')}>{tech}</span>;
}

// Dans n'importe quel composant
import { useEffect } from 'react';
import { getSujetsDisponibles } from '../services/api';

// eslint-disable-next-line react-hooks/rules-of-hooks
useEffect(() => {
  getSujetsDisponibles()
    .then(res => console.log('✅ Connexion OK :', res.data))
    .catch(err => console.error('❌ Erreur :', err));
}, []);
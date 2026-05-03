export const CHEF_NAV = [
  { id: "validations",     label: "Inscriptions",      sub: "Validation des comptes",      num: 1 },
  { id: "sujets",          label: "Sujets",           sub: "Validation des propositions", num: 2 },
  { id: "sujets-valides",  label: "Sujets validés",   sub: "Liste finale des sujets",     num: 3 },
  { id: "affectations",    label: "Affectations",      sub: "Algorithme & validation",     num: 4 },
  { id: "creneaux",        label: "Créneaux",          sub: "Planning jury & salles",      num: 5 },
  { id: "soutenances",     label: "Soutenances",       sub: "Planifier & résultats",       num: 6 },
  { id: "messagerie",      label: "Messagerie",        sub: "Profs & étudiants",           num: 7 },
];

export const CHEF_META = {
  validations:     { title: "Validation Inscriptions", sub: "Approuvez les nouveaux étudiants et professeurs" },
  sujets:          { title: "Sujets à valider",    sub: "Examinez les propositions des professeurs" },
  "sujets-valides": { title: "Sujets validés",     sub: "Liste officielle des sujets disponibles" },
  affectations:    { title: "Affectations",         sub: "Gestion des binômes et sujets" },
  creneaux:        { title: "Créneaux horaires",    sub: "Disponibilités des salles et jurys" },
  soutenances:     { title: "Soutenances",          sub: "Planification et notes finales" },
  messagerie:      { title: "Messagerie",           sub: "Échanges avec les utilisateurs" },
};

import {
  BookOpen, Link2, Calendar, GraduationCap, CheckSquare, MessageCircle, Bell,
} from "lucide-react";

export const CHEF_NAV = [
  { id: "sujets",          label: "Sujets",           sub: "Validation des propositions", icon: BookOpen      },
  { id: "sujets-valides",  label: "Sujets validés",   sub: "Liste finale des sujets",     icon: CheckSquare   },
  { id: "affectations",    label: "Affectations",      sub: "Algorithme & validation",     icon: Link2         },
  { id: "creneaux",        label: "Créneaux",          sub: "Planning jury & salles",      icon: Calendar      },
  { id: "soutenances",     label: "Soutenances",       sub: "Planifier & résultats",       icon: GraduationCap },
  { id: "messagerie",      label: "Messagerie",        sub: "Profs & étudiants",           icon: MessageCircle },
  { id: "notifications",   label: "Notifications",     sub: "Alertes & infos",             icon: Bell          },
];

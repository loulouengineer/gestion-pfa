import {
  BookOpen, GraduationCap, Calendar, MessageCircle, ClipboardList,
} from "lucide-react";

export const PROF_NAV = [
  { id: "soutenances",    label: "Mes soutenances",    sub: "Jury & notes",        icon: ClipboardList  },
  { id: "disponibilites", label: "Mes disponibilités", sub: "Gérer mes plages",    icon: Calendar       },
  { id: "sujets",         label: "Mes sujets",         sub: "Proposer & gérer",    icon: BookOpen       },
  { id: "chat",           label: "Messagerie",         sub: "Chef de département", icon: MessageCircle  },
];

import {
  LayoutDashboard, BookOpen, GraduationCap, Calendar, MessageCircle, Bell,
} from "lucide-react";

export const PROF_NAV = [
  { id: "dashboard",     label: "Dashboard",        sub: "Vue d'ensemble",       icon: LayoutDashboard },
  { id: "sujets",        label: "Mes sujets",       sub: "Gérer mes propositions",icon: BookOpen        },
  { id: "soutenances",   label: "Mes soutenances",  sub: "Jury & notes",         icon: GraduationCap   },
  { id: "disponibilites",label: "Mes disponibilités",sub: "Gérer mes plages",    icon: Calendar        },
  { id: "messagerie",    label: "Messagerie",       sub: "Chef de département",  icon: MessageCircle   },
  { id: "notifications", label: "Notifications",    sub: "Alertes & infos",      icon: Bell            },
];

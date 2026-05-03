package tn.enicarthage.projetspring;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import tn.enicarthage.projetspring.entity.*;
import tn.enicarthage.projetspring.repository.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;

@Configuration
@RequiredArgsConstructor
public class DataInitializer {

    // ── Chef département ─────────────────────────────────────────────────────
    @Bean
    public CommandLineRunner initChefDepartement(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        return args -> {
            if (!userRepository.existsByEmail("chef@enicar.ucar.tn")) {
                User chef = new User();
                chef.setNom("Bouslimi");
                chef.setPrenom("Lotfi");
                chef.setEmail("chef@enicar.ucar.tn");
                chef.setPassword(passwordEncoder.encode("chef1234"));
                chef.setRole(Role.CHEF_DEPT);
                chef.setStatut(StatutCompte.APPROUVE);
                userRepository.save(chef);
                System.out.println("✅ Chef département créé : chef@enicar.ucar.tn / chef1234");
            }
        };
    }

    // ── Données de test complètes ─────────────────────────────────────────────
    @Bean
    public CommandLineRunner initDonneesTest(
            UserRepository       userRepository,
            EtudiantRepository   etudiantRepository,
            ProfesseurRepository professeurRepository,
            SujetRepository      sujetRepository,
            BinomeRepository     binomeRepository,
            ChoixSujetRepository choixSujetRepository,
            AffectationRepository affectationRepository,
            CreneauRepository    creneauRepository,
            SoutenanceRepository soutenanceRepository,
            ResultatRepository   resultatRepository,
            PasswordEncoder      passwordEncoder) {

        return args -> {
            // ── FIX FOR CHAIMA (Binome ID 7) ──────────────────────────────────
            userRepository.findByEmail("c.fessi@enicar.ucar.tn").ifPresent(user -> {
                System.out.println("🔧 Fixing Chaima's binome (ID 7)...");
                etudiantRepository.findById(user.getId()).ifPresent(e -> {
                    binomeRepository.findAll().stream()
                        .filter(b -> b.getEtudiant1().getId().equals(e.getId()) || b.getEtudiant2().getId().equals(e.getId()))
                        .findFirst().ifPresent(b -> {
                            System.out.println("   Found binome ID: " + b.getId());
                            // 1. Ensure Affectation
                            Affectation aff = affectationRepository.findAll().stream()
                                .filter(a -> a.getBinome().getId().equals(b.getId()))
                                .findFirst().orElseGet(() -> {
                                    System.out.println("   Creating missing affectation...");
                                    Affectation a = new Affectation();
                                    a.setBinome(b);
                                    a.setStatut(StatutAffectation.VALIDEE);
                                    Sujet s = sujetRepository.findAll().stream().filter(Sujet::isDisponible).findFirst().orElse(null);
                                    if (s != null) {
                                        a.setSujet(s);
                                        s.setDisponible(false);
                                        sujetRepository.save(s);
                                        return affectationRepository.save(a);
                                    }
                                    return null;
                                });
                            if (aff != null) {
                                aff.setStatut(StatutAffectation.VALIDEE);
                                affectationRepository.save(aff);
                                // 2. Ensure Soutenance
                                if (soutenanceRepository.findAll().stream().noneMatch(s -> s.getBinome().getId().equals(b.getId()))) {
                                    System.out.println("   Scheduling missing soutenance...");
                                    creneauRepository.findAll().stream()
                                        .filter(c -> c.getStatut() == StatutCreneau.DISPONIBLE)
                                        .findFirst().ifPresent(c -> {
                                            Soutenance s = new Soutenance();
                                            s.setBinome(b); s.setAffectation(aff); s.setCreneau(c);
                                            s.setStatut(Soutenance.StatutSoutenance.PLANIFIEE);
                                            c.setStatut(StatutCreneau.OCCUPE);
                                            creneauRepository.save(c);
                                            soutenanceRepository.save(s);
                                            System.out.println("   ✅ Soutenance scheduled on " + c.getDate());
                                        });
                                }
                            }
                        });
                });
            });

            // Skip si les données de test spécifiques existent déjà
            if (etudiantRepository.existsByEmail("y.bensalah@etu.enicar.tn")) {
                System.out.println("ℹ️  Données de test déjà présentes — initialisation ignorée.");
                return;
            }

            System.out.println("🚀 Initialisation des données de test…");

            // ════════════════════════════════════════════════════════════════
            // 1. PROFESSEURS
            // ════════════════════════════════════════════════════════════════
            Professeur p1 = prof("Trabelsi",  "Mohamed Ali", "m.trabelsi@enicar.ucar.tn",  "Génie Logiciel",      passwordEncoder);
            Professeur p2 = prof("Gharbi",    "Fatma",       "f.gharbi@enicar.ucar.tn",    "Réseaux & Sécurité",  passwordEncoder);
            Professeur p3 = prof("Bouali",    "Sami",        "s.bouali@enicar.ucar.tn",    "Intelligence Artificielle", passwordEncoder);
            Professeur p4 = prof("Cherif",    "Nadia",       "n.cherif@enicar.ucar.tn",    "Bases de données",    passwordEncoder);
            Professeur p5 = prof("Kallel",    "Hichem",      "h.kallel@enicar.ucar.tn",    "Systèmes embarqués",  passwordEncoder);

            professeurRepository.saveAll(List.of(p1, p2, p3, p4, p5));
            System.out.println("  ✔ 5 professeurs créés");

            // ════════════════════════════════════════════════════════════════
            // 2. ÉTUDIANTS
            // ════════════════════════════════════════════════════════════════
            Etudiant e1  = etudiant("Ben Salah",  "Youssef",  "y.bensalah@etu.enicar.tn",  16.5, "ETU-2024-001", passwordEncoder,
                    List.of("Java","Spring Boot","React"),        List.of(Difficulte.PROGRAMMATION, Difficulte.ANALYSE_CONCEPTION));
            Etudiant e2  = etudiant("Belhaj",     "Mariem",   "m.belhaj@etu.enicar.tn",    17.2, "ETU-2024-002", passwordEncoder,
                    List.of("Python","Machine Learning","SQL"),   List.of(Difficulte.MATHEMATIQUES, Difficulte.PROGRAMMATION));
            Etudiant e3  = etudiant("Riahi",      "Amine",    "a.riahi@etu.enicar.tn",     15.8, "ETU-2024-003", passwordEncoder,
                    List.of("Angular","Node.js","MongoDB"),       List.of(Difficulte.PROGRAMMATION, Difficulte.RESEAUX));
            Etudiant e4  = etudiant("Sfar",       "Rania",    "r.sfar@etu.enicar.tn",      16.0, "ETU-2024-004", passwordEncoder,
                    List.of("React","TypeScript","Firebase"),     List.of(Difficulte.ANALYSE_CONCEPTION, Difficulte.GESTION_DE_PROJET));
            Etudiant e5  = etudiant("Trabelsi",   "Sana",     "s.trabelsi@etu.enicar.tn",  14.5, "ETU-2024-005", passwordEncoder,
                    List.of("PHP","MySQL","Symfony"),             List.of(Difficulte.BASE_DE_DONNEES, Difficulte.PROGRAMMATION));
            Etudiant e6  = etudiant("Chaabane",   "Ines",     "i.chaabane@etu.enicar.tn",  15.2, "ETU-2024-006", passwordEncoder,
                    List.of("Java","Hibernate","PostgreSQL"),     List.of(Difficulte.BASE_DE_DONNEES, Difficulte.ANALYSE_CONCEPTION));
            Etudiant e7  = etudiant("Hamdi",      "Khalil",   "k.hamdi@etu.enicar.tn",     13.8, "ETU-2024-007", passwordEncoder,
                    List.of("C++","Arduino","RTOS"),              List.of(Difficulte.RESEAUX, Difficulte.MATHEMATIQUES));
            Etudiant e8  = etudiant("Abidi",      "Dorra",    "d.abidi@etu.enicar.tn",     14.0, "ETU-2024-008", passwordEncoder,
                    List.of("Flutter","Dart","Firebase"),         List.of(Difficulte.PROGRAMMATION, Difficulte.GESTION_DE_PROJET));
            Etudiant e9  = etudiant("Oueslati",   "Mehdi",    "m.oueslati@etu.enicar.tn",  12.5, "ETU-2024-009", passwordEncoder,
                    List.of("Python","Django","Docker"),          List.of(Difficulte.RESEAUX, Difficulte.PROGRAMMATION));
            Etudiant e10 = etudiant("Mansouri",   "Aymen",    "a.mansouri@etu.enicar.tn",  11.8, "ETU-2024-010", passwordEncoder,
                    List.of("HTML","CSS","JavaScript"),           List.of(Difficulte.PROGRAMMATION, Difficulte.ANGLAIS_TECHNIQUE));

            etudiantRepository.saveAll(List.of(e1, e2, e3, e4, e5, e6, e7, e8, e9, e10));
            System.out.println("  ✔ 10 étudiants créés");

            // ════════════════════════════════════════════════════════════════
            // 3. SUJETS
            // ════════════════════════════════════════════════════════════════
            Sujet s1 = sujet("Système de recommandation IA pour l'e-commerce",
                    "Conception et développement d'un moteur de recommandation basé sur le filtrage collaboratif et le deep learning pour personnaliser l'expérience d'achat.",
                    4, p3, StatutSujet.APPROUVE,
                    List.of("recommandation","machine learning","e-commerce"),
                    List.of("Python","TensorFlow","API REST"),
                    List.of("TensorFlow","Keras","FastAPI","PostgreSQL"));

            Sujet s2 = sujet("Plateforme de gestion de projet Agile avec tableau Kanban",
                    "Développement d'un outil de gestion de projet intégrant les méthodologies Scrum et Kanban avec suivi en temps réel des tâches et génération de rapports.",
                    3, p1, StatutSujet.APPROUVE,
                    List.of("agile","scrum","gestion projet","kanban"),
                    List.of("Spring Boot","React","WebSocket"),
                    List.of("Spring Boot","React","MySQL","Docker"));

            Sujet s3 = sujet("Application mobile de télémédecine avec IA diagnostique",
                    "Développement d'une application mobile permettant des consultations médicales à distance avec un assistant IA pour le pré-diagnostic basé sur les symptômes.",
                    4, p4, StatutSujet.APPROUVE,
                    List.of("santé","mobile","IA","télémédecine"),
                    List.of("Flutter","Python","TensorFlow"),
                    List.of("Flutter","FastAPI","Firebase","TensorFlow Lite"));

            Sujet s4 = sujet("Sécurisation des API REST avec OAuth2 et JWT",
                    "Mise en place d'une architecture sécurisée pour des microservices REST en utilisant OAuth2, JWT et Spring Security avec audit complet des accès.",
                    3, p2, StatutSujet.APPROUVE,
                    List.of("sécurité","OAuth2","JWT","microservices"),
                    List.of("Spring Security","Java","Keycloak"),
                    List.of("Spring Boot","Keycloak","Docker","PostgreSQL"));

            Sujet s5 = sujet("Optimisation des requêtes sur bases de données NoSQL distribuées",
                    "Analyse et optimisation des performances de requêtes sur MongoDB et Cassandra dans un contexte de big data avec comparaison des stratégies d'indexation.",
                    2, p4, StatutSujet.APPROUVE,
                    List.of("NoSQL","big data","performance","MongoDB"),
                    List.of("MongoDB","Cassandra","Python"),
                    List.of("MongoDB","Cassandra","Python","Apache Spark"));

            Sujet s6 = sujet("Chatbot intelligent multilingue avec traitement du langage naturel",
                    "Conception d'un chatbot capable de comprendre et répondre en arabe, français et anglais en utilisant des modèles de langage avancés et le fine-tuning.",
                    5, p3, StatutSujet.APPROUVE,
                    List.of("NLP","chatbot","multilingue","LLM"),
                    List.of("Python","Transformers","LLM"),
                    List.of("HuggingFace","FastAPI","React","Redis"));

            Sujet s7 = sujet("Système de détection d'intrusions réseau par apprentissage automatique",
                    "Développement d'un IDS basé sur des algorithmes de machine learning pour détecter les attaques réseau en temps réel avec tableau de bord d'analyse.",
                    4, p2, StatutSujet.EN_ATTENTE,
                    List.of("cybersécurité","IDS","machine learning","réseau"),
                    List.of("Python","Scikit-learn","Wireshark"),
                    List.of("Python","Scikit-learn","Elasticsearch","Kibana"));

            sujetRepository.saveAll(List.of(s1, s2, s3, s4, s5, s6, s7));
            System.out.println("  ✔ 7 sujets créés (6 approuvés, 1 en attente)");

            // ════════════════════════════════════════════════════════════════
            // 4. BINÔMES
            // ════════════════════════════════════════════════════════════════
            Binome b1 = Binome.builder().etudiant1(e1).etudiant2(e2).build(); // moy: 16.85
            Binome b2 = Binome.builder().etudiant1(e3).etudiant2(e4).build(); // moy: 15.90
            Binome b3 = Binome.builder().etudiant1(e5).etudiant2(e6).build(); // moy: 14.85
            Binome b4 = Binome.builder().etudiant1(e7).etudiant2(e8).build(); // moy: 13.90
            Binome b5 = Binome.builder().etudiant1(e9).etudiant2(e10).build();// moy: 12.15

            binomeRepository.saveAll(List.of(b1, b2, b3, b4, b5));
            System.out.println("  ✔ 5 binômes créés");

            // ════════════════════════════════════════════════════════════════
            // 5. CHOIX / VŒUX (3 vœux par binôme)
            // ════════════════════════════════════════════════════════════════
            choixSujetRepository.saveAll(List.of(
                    choix(b1, s1, 1), choix(b1, s2, 2), choix(b1, s6, 3),
                    choix(b2, s2, 1), choix(b2, s4, 2), choix(b2, s3, 3),
                    choix(b3, s3, 1), choix(b3, s5, 2), choix(b3, s4, 3),
                    choix(b4, s5, 1), choix(b4, s4, 2), choix(b4, s2, 3),
                    choix(b5, s5, 1), choix(b5, s6, 2), choix(b5, s3, 3)
            ));
            System.out.println("  ✔ Vœux enregistrés");

            // ════════════════════════════════════════════════════════════════
            // 6. AFFECTATIONS (résultat de l'algorithme glouton)
            //    binômes triés par moyenne : b1 > b2 > b3 > b4 > b5
            //    chacun obtient son 1er vœu disponible
            // ════════════════════════════════════════════════════════════════
            Affectation a1 = affectation(b1, s1, 16.85f, StatutAffectation.VALIDEE, true);
            Affectation a2 = affectation(b2, s2, 15.90f, StatutAffectation.VALIDEE, true);
            Affectation a3 = affectation(b3, s3, 14.85f, StatutAffectation.VALIDEE, true);
            Affectation a4 = affectation(b4, s5, 13.90f, StatutAffectation.VALIDEE, true);
            Affectation a5 = affectation(b5, s6, 12.15f, StatutAffectation.EN_ATTENTE, false);

            affectationRepository.saveAll(List.of(a1, a2, a3, a4, a5));
            System.out.println("  ✔ 5 affectations créées (4 validées, 1 en attente)");

            // ════════════════════════════════════════════════════════════════
            // 7. CRÉNEAUX (avec jury assigné)
            //    Passés  : 28 et 29 avril 2026
            //    À venir : 20, 21, 22 mai 2026
            // ════════════════════════════════════════════════════════════════
            Creneau c1 = creneau(LocalDate.of(2026, 5, 10), "08:30", 45, "Salle A1",
                    StatutCreneau.OCCUPE,  List.of(p1, p3));
            Creneau c2 = creneau(LocalDate.of(2026, 5, 10), "10:00", 45, "Salle B1",
                    StatutCreneau.OCCUPE,  List.of(p2, p4));
            Creneau c3 = creneau(LocalDate.of(2026, 5, 11), "09:00", 45, "Amphithéâtre",
                    StatutCreneau.OCCUPE,  List.of(p3, p5));
            Creneau c4 = creneau(LocalDate.of(2026, 5, 20), "08:30", 45, "Salle A1",
                    StatutCreneau.OCCUPE,  List.of(p1, p2));
            Creneau c5 = creneau(LocalDate.of(2026, 5, 20), "10:00", 45, "Salle A2",
                    StatutCreneau.DISPONIBLE, List.of(p4, p5));
            Creneau c6 = creneau(LocalDate.of(2026, 5, 21), "14:00", 45, "Salle B1",
                    StatutCreneau.DISPONIBLE, List.of(p2, p3));

            creneauRepository.saveAll(List.of(c1, c2, c3, c4, c5, c6));
            System.out.println("  ✔ 6 créneaux créés (3 occupés, 3 disponibles)");

            // ════════════════════════════════════════════════════════════════
            // 8. SOUTENANCES
            // ════════════════════════════════════════════════════════════════

            // Soutenance terminée : Youssef & Mariem (b1) — s1
            Soutenance sout1 = new Soutenance();
            sout1.setBinome(b1); sout1.setAffectation(a1); sout1.setCreneau(c1);
            sout1.setJury(List.of(p1, p3));
            sout1.setStatut(Soutenance.StatutSoutenance.TERMINEE);
            sout1.setNote(17.5f); sout1.setMention("Très bien");
            sout1.setObservations("Excellent travail. Présentation fluide, rapport complet, bonne maîtrise technique.");
            sout1.setPresentEtudiant1(true); sout1.setPresentEtudiant2(true); sout1.setPresent(true);

            // Soutenance terminée : Amine & Rania (b2) — s2
            Soutenance sout2 = new Soutenance();
            sout2.setBinome(b2); sout2.setAffectation(a2); sout2.setCreneau(c2);
            sout2.setJury(List.of(p2, p4));
            sout2.setStatut(Soutenance.StatutSoutenance.TERMINEE);
            sout2.setNote(15.0f); sout2.setMention("Bien");
            sout2.setObservations("Bon projet, interface claire. Quelques lacunes dans la partie déploiement.");
            sout2.setPresentEtudiant1(true); sout2.setPresentEtudiant2(true); sout2.setPresent(true);

            // Soutenance terminée : Sana & Ines (b3) — s3 (un étudiant absent)
            Soutenance sout3 = new Soutenance();
            sout3.setBinome(b3); sout3.setAffectation(a3); sout3.setCreneau(c3);
            sout3.setJury(List.of(p3, p5));
            sout3.setStatut(Soutenance.StatutSoutenance.TERMINEE);
            sout3.setNote(13.5f); sout3.setMention("Passable");
            sout3.setObservations("Résultats corrects. Manque de profondeur dans l'analyse comparative. Étudiant 2 absent.");
            sout3.setPresentEtudiant1(true); sout3.setPresentEtudiant2(false); sout3.setPresent(true);

            // Soutenance planifiée : Khalil & Dorra (b4) — s5
            Soutenance sout4 = new Soutenance();
            sout4.setBinome(b4); sout4.setAffectation(a4); sout4.setCreneau(c4);
            sout4.setJury(List.of(p1, p2));
            sout4.setStatut(Soutenance.StatutSoutenance.PLANIFIEE);

            soutenanceRepository.saveAll(List.of(sout1, sout2, sout3, sout4));
            System.out.println("  ✔ 4 soutenances créées (3 terminées, 1 planifiée)");

            // ════════════════════════════════════════════════════════════════
            // 9. RÉSULTATS DÉTAILLÉS (pour les soutenances terminées)
            // ════════════════════════════════════════════════════════════════
            Resultat r1 = Resultat.builder()
                    .soutenance(sout1).noteGlobale(17.5).mention("Très bien")
                    .remarques("Excellent rapport, code bien structuré et documenté. Démonstration convaincante.")
                    .build();
            resultatRepository.save(r1);

            Resultat r2 = Resultat.builder()
                    .soutenance(sout2).noteGlobale(15.0).mention("Bien")
                    .remarques("Bon travail d'ensemble. Points à améliorer : tests unitaires et déploiement CI/CD.")
                    .build();
            resultatRepository.save(r2);

            Resultat r3 = Resultat.builder()
                    .soutenance(sout3).noteGlobale(13.5).mention("Passable")
                    .remarques("Travail acceptable mais partiel. L'absence d'un membre du binôme a impacté la soutenance.")
                    .build();
            resultatRepository.save(r3);

            System.out.println("  ✔ 3 résultats enregistrés");

            System.out.println("✅ Initialisation terminée avec succès !");
            System.out.println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            System.out.println("  COMPTES DE TEST");
            System.out.println("  Chef dept    : chef@enicar.ucar.tn           / chef1234");
            System.out.println("  Professeurs  : m.trabelsi@enicar.ucar.tn     / prof1234");
            System.out.println("                 f.gharbi@enicar.ucar.tn       / prof1234");
            System.out.println("                 s.bouali@enicar.ucar.tn       / prof1234");
            System.out.println("                 n.cherif@enicar.ucar.tn       / prof1234");
            System.out.println("                 h.kallel@enicar.ucar.tn       / prof1234");
            System.out.println("  Étudiants    : y.bensalah@etu.enicar.tn      / pass1234  (moy 16.5)");
            System.out.println("                 m.belhaj@etu.enicar.tn        / pass1234  (moy 17.2)");
            System.out.println("                 a.riahi@etu.enicar.tn         / pass1234  (moy 15.8)");
            System.out.println("                 r.sfar@etu.enicar.tn          / pass1234  (moy 16.0)");
            System.out.println("                 k.hamdi@etu.enicar.tn         / pass1234  (moy 13.8)");
            System.out.println("                 m.oueslati@etu.enicar.tn      / pass1234  (moy 12.5)");
            System.out.println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        };
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private Professeur prof(String nom, String prenom, String email, String dept,
                             PasswordEncoder enc) {
        Professeur p = new Professeur();
        p.setNom(nom); p.setPrenom(prenom); p.setEmail(email);
        p.setPassword(enc.encode("prof1234"));
        p.setRole(Role.ENSEIGNANT);
        p.setStatut(StatutCompte.APPROUVE);
        p.setDepartement(dept);
        return p;
    }

    private Etudiant etudiant(String nom, String prenom, String email,
                               double moyenne, String matricule,
                               PasswordEncoder enc,
                               List<String> competences,
                               List<Difficulte> difficultes) {
        Etudiant e = new Etudiant();
        e.setNom(nom); e.setPrenom(prenom); e.setEmail(email);
        e.setPassword(enc.encode("pass1234"));
        e.setRole(Role.ETUDIANT);
        e.setStatut(StatutCompte.APPROUVE);
        e.setMoyenne(moyenne);
        e.setMatricule(matricule);
        e.setCompetences(competences);
        e.setDifficultes(difficultes);
        return e;
    }

    private Sujet sujet(String titre, String description, int difficulte,
                         Professeur encadrant, StatutSujet statut,
                         List<String> motsCles, List<String> competences,
                         List<String> technologies) {
        Sujet s = new Sujet();
        s.setTitre(titre);
        s.setDescription(description);
        s.setDifficulte(difficulte);
        s.setEncadrant(encadrant);
        s.setStatut(statut);
        s.setDisponible(statut == StatutSujet.APPROUVE);
        s.setConfirme(statut == StatutSujet.APPROUVE);
        s.setMotsCles(motsCles);
        s.setCompetences(competences);
        s.setTechnologie(technologies);
        s.setDateProposition(LocalDate.of(2026, 3, 15));
        return s;
    }

    private ChoixSujet choix(Binome binome, Sujet sujet, int ordre) {
        return ChoixSujet.builder().binome(binome).sujet(sujet).ordre(ordre).build();
    }

    private Affectation affectation(Binome binome, Sujet sujet, float score,
                                     StatutAffectation statut, boolean verrouillee) {
        Affectation a = new Affectation();
        a.setBinome(binome);
        a.setSujet(sujet);
        a.setScore(score);
        a.setStatut(statut);
        a.setVerrouillee(verrouillee);
        if (verrouillee) {
            a.setDateDecision(java.time.LocalDateTime.of(2026, 4, 20, 10, 0));
        }
        return a;
    }

    private Creneau creneau(LocalDate date, String heureDebutStr, int dureeMinutes,
                              String salle, StatutCreneau statut, List<Professeur> jury) {
        LocalTime debut = LocalTime.parse(heureDebutStr);
        Creneau c = new Creneau();
        c.setDate(date);
        c.setHeureDebut(debut);
        c.setDureeMinutes(dureeMinutes);
        c.setHeureFin(debut.plusMinutes(dureeMinutes));
        c.setSalle(salle);
        c.setStatut(statut);
        c.setJury(jury);
        return c;
    }
}

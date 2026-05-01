-- ============================================================
--  GESTION PFA — Données de test complètes
--  À exécuter dans MySQL Workbench sur la base : pfa_db
--
--  IMPORTANT : Démarrer l'application UNE FOIS d'abord.
--  Le DataInitializer crée automatiquement les comptes :
--
--  Chef   : chef@enicar.ucar.tn          / chef1234
--  Profs  : m.trabelsi@enicar.ucar.tn    / prof1234
--           f.gharbi@enicar.ucar.tn      / prof1234
--           s.bouali@enicar.ucar.tn      / prof1234
--           n.cherif@enicar.ucar.tn      / prof1234
--           h.kallel@enicar.ucar.tn      / prof1234
--  Etud.  : y.bensalah@etu.enicar.tn     / pass1234
--           m.belhaj@etu.enicar.tn       / pass1234
--           a.riahi@etu.enicar.tn        / pass1234
--           r.sfar@etu.enicar.tn         / pass1234
--           s.trabelsi@etu.enicar.tn     / pass1234
--           i.chaabane@etu.enicar.tn     / pass1234
--           k.hamdi@etu.enicar.tn        / pass1234
--           d.abidi@etu.enicar.tn        / pass1234
--           m.oueslati@etu.enicar.tn     / pass1234
--           a.mansouri@etu.enicar.tn     / pass1234
--
--  Ce script ajoute uniquement des données supplémentaires.
--  Si le DataInitializer a déjà tout créé, ce script est
--  optionnel (il ajoutera des données en plus).
-- ============================================================

USE pfa_db;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
--  RESET (optionnel — décommentez pour repartir de zéro)
-- ============================================================
-- DELETE FROM resultats;
-- DELETE FROM notes_criteres;
-- DELETE FROM soutenance_jury;
-- DELETE FROM soutenance;
-- DELETE FROM creneau_jury;
-- DELETE FROM creneau;
-- DELETE FROM affectation;
-- DELETE FROM choix_sujet;
-- DELETE FROM binome;
-- DELETE FROM sujet_mots_cles;
-- DELETE FROM sujet_competences;
-- DELETE FROM sujet_technologies;
-- DELETE FROM sujets;
-- DELETE FROM etudiant_competences;
-- DELETE FROM etudiant_difficultes;
-- DELETE FROM etudiant;
-- DELETE FROM professeur;
-- DELETE FROM users WHERE email != 'chef@enicar.ucar.tn';

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
--  VÉRIFICATION : ces requêtes doivent retourner des résultats
--  avant de continuer. Si elles sont vides → relancez l'appli.
-- ============================================================
-- SELECT id, nom, email, role FROM users;
-- SELECT utilisateur_id, departement FROM professeur;
-- SELECT utilisateur_id, moyenne, matricule FROM etudiant;

-- ============================================================
--  1. SUJETS supplémentaires
--     (le DataInitializer en crée déjà 7, voici 3 de plus)
-- ============================================================
INSERT INTO sujets (titre, description, difficulte, disponible, confirme, statut, date_proposition, enseignant_id)
VALUES
(
  'Système de monitoring IoT pour smart campus',
  'Développement d''une plateforme de supervision en temps réel des capteurs IoT déployés sur le campus universitaire, avec alertes automatiques et tableau de bord de visualisation.',
  3, 1, 1, 'APPROUVE', '2026-03-10',
  (SELECT id FROM users WHERE email = 'h.kallel@enicar.ucar.tn')
),
(
  'Plateforme d''apprentissage adaptatif avec LLM',
  'Conception d''un système d''apprentissage personnalisé utilisant des modèles de langage de grande taille pour adapter le contenu pédagogique au niveau et au style d''apprentissage de chaque étudiant.',
  5, 1, 1, 'APPROUVE', '2026-03-12',
  (SELECT id FROM users WHERE email = 's.bouali@enicar.ucar.tn')
),
(
  'Application de gestion de bibliothèque universitaire',
  'Développement d''un système complet de gestion de bibliothèque avec recherche intelligente, réservation en ligne, gestion des emprunts et intégration RFID.',
  2, 1, 1, 'APPROUVE', '2026-03-18',
  (SELECT id FROM users WHERE email = 'm.trabelsi@enicar.ucar.tn')
);

-- Mots-clés pour les nouveaux sujets
INSERT INTO sujet_mots_cles (sujet_id, mot_cle)
SELECT id, 'IoT' FROM sujets WHERE titre = 'Système de monitoring IoT pour smart campus'
UNION ALL
SELECT id, 'smart campus' FROM sujets WHERE titre = 'Système de monitoring IoT pour smart campus'
UNION ALL
SELECT id, 'temps réel' FROM sujets WHERE titre = 'Système de monitoring IoT pour smart campus'
UNION ALL
SELECT id, 'LLM' FROM sujets WHERE titre = 'Plateforme d''apprentissage adaptatif avec LLM'
UNION ALL
SELECT id, 'NLP' FROM sujets WHERE titre = 'Plateforme d''apprentissage adaptatif avec LLM'
UNION ALL
SELECT id, 'e-learning' FROM sujets WHERE titre = 'Plateforme d''apprentissage adaptatif avec LLM'
UNION ALL
SELECT id, 'bibliothèque' FROM sujets WHERE titre = 'Application de gestion de bibliothèque universitaire'
UNION ALL
SELECT id, 'RFID' FROM sujets WHERE titre = 'Application de gestion de bibliothèque universitaire';

-- Technologies
INSERT INTO sujet_technologies (sujet_id, technologie)
SELECT id, 'MQTT' FROM sujets WHERE titre = 'Système de monitoring IoT pour smart campus'
UNION ALL
SELECT id, 'Grafana' FROM sujets WHERE titre = 'Système de monitoring IoT pour smart campus'
UNION ALL
SELECT id, 'InfluxDB' FROM sujets WHERE titre = 'Système de monitoring IoT pour smart campus'
UNION ALL
SELECT id, 'Python' FROM sujets WHERE titre = 'Plateforme d''apprentissage adaptatif avec LLM'
UNION ALL
SELECT id, 'LangChain' FROM sujets WHERE titre = 'Plateforme d''apprentissage adaptatif avec LLM'
UNION ALL
SELECT id, 'React' FROM sujets WHERE titre = 'Application de gestion de bibliothèque universitaire'
UNION ALL
SELECT id, 'Spring Boot' FROM sujets WHERE titre = 'Application de gestion de bibliothèque universitaire';

-- Compétences
INSERT INTO sujet_competences (sujet_id, competence)
SELECT id, 'Réseaux' FROM sujets WHERE titre = 'Système de monitoring IoT pour smart campus'
UNION ALL
SELECT id, 'Python' FROM sujets WHERE titre = 'Système de monitoring IoT pour smart campus'
UNION ALL
SELECT id, 'Machine Learning' FROM sujets WHERE titre = 'Plateforme d''apprentissage adaptatif avec LLM'
UNION ALL
SELECT id, 'API REST' FROM sujets WHERE titre = 'Application de gestion de bibliothèque universitaire';

-- ============================================================
--  2. CRÉNEAUX de soutenance
-- ============================================================
INSERT INTO creneau (date, heure_debut, heure_fin, duree_minutes, salle, statut)
VALUES
  ('2026-05-20', '08:30:00', '09:15:00', 45, 'Salle A1',      'OCCUPE'),
  ('2026-05-20', '10:00:00', '10:45:00', 45, 'Salle B1',      'OCCUPE'),
  ('2026-05-20', '11:30:00', '12:15:00', 45, 'Amphithéâtre',  'OCCUPE'),
  ('2026-05-21', '08:30:00', '09:15:00', 45, 'Salle A2',      'OCCUPE'),
  ('2026-05-22', '09:00:00', '09:45:00', 45, 'Salle A1',      'DISPONIBLE'),
  ('2026-05-22', '10:30:00', '11:15:00', 45, 'Salle B1',      'DISPONIBLE');

-- Jury des créneaux (creneau_jury)
INSERT INTO creneau_jury (creneau_id, professeur_id)
-- Créneau 1 (Salle A1, 20/05 08:30) : Trabelsi + Bouali
SELECT c.id, p.utilisateur_id
FROM creneau c, professeur p
JOIN users u ON u.id = p.utilisateur_id
WHERE c.salle = 'Salle A1' AND c.date = '2026-05-20' AND c.heure_debut = '08:30:00'
  AND u.email = 'm.trabelsi@enicar.ucar.tn'
UNION ALL
SELECT c.id, p.utilisateur_id
FROM creneau c, professeur p
JOIN users u ON u.id = p.utilisateur_id
WHERE c.salle = 'Salle A1' AND c.date = '2026-05-20' AND c.heure_debut = '08:30:00'
  AND u.email = 's.bouali@enicar.ucar.tn'
UNION ALL
-- Créneau 2 (Salle B1, 20/05 10:00) : Gharbi + Cherif
SELECT c.id, p.utilisateur_id
FROM creneau c, professeur p
JOIN users u ON u.id = p.utilisateur_id
WHERE c.salle = 'Salle B1' AND c.date = '2026-05-20' AND c.heure_debut = '10:00:00'
  AND u.email = 'f.gharbi@enicar.ucar.tn'
UNION ALL
SELECT c.id, p.utilisateur_id
FROM creneau c, professeur p
JOIN users u ON u.id = p.utilisateur_id
WHERE c.salle = 'Salle B1' AND c.date = '2026-05-20' AND c.heure_debut = '10:00:00'
  AND u.email = 'n.cherif@enicar.ucar.tn'
UNION ALL
-- Créneau 3 (Amphi, 20/05 11:30) : Bouali + Kallel
SELECT c.id, p.utilisateur_id
FROM creneau c, professeur p
JOIN users u ON u.id = p.utilisateur_id
WHERE c.salle = 'Amphithéâtre' AND c.date = '2026-05-20'
  AND u.email = 's.bouali@enicar.ucar.tn'
UNION ALL
SELECT c.id, p.utilisateur_id
FROM creneau c, professeur p
JOIN users u ON u.id = p.utilisateur_id
WHERE c.salle = 'Amphithéâtre' AND c.date = '2026-05-20'
  AND u.email = 'h.kallel@enicar.ucar.tn'
UNION ALL
-- Créneau 4 (Salle A2, 21/05) : Trabelsi + Gharbi
SELECT c.id, p.utilisateur_id
FROM creneau c, professeur p
JOIN users u ON u.id = p.utilisateur_id
WHERE c.date = '2026-05-21'
  AND u.email = 'm.trabelsi@enicar.ucar.tn'
UNION ALL
SELECT c.id, p.utilisateur_id
FROM creneau c, professeur p
JOIN users u ON u.id = p.utilisateur_id
WHERE c.date = '2026-05-21'
  AND u.email = 'f.gharbi@enicar.ucar.tn';

-- ============================================================
--  3. VÉRIFICATION FINALE
-- ============================================================
SELECT 'users'         AS table_name, COUNT(*) AS nb FROM users
UNION ALL SELECT 'professeur',        COUNT(*) FROM professeur
UNION ALL SELECT 'etudiant',          COUNT(*) FROM etudiant
UNION ALL SELECT 'sujets',            COUNT(*) FROM sujets
UNION ALL SELECT 'binome',            COUNT(*) FROM binome
UNION ALL SELECT 'choix_sujet',       COUNT(*) FROM choix_sujet
UNION ALL SELECT 'affectation',       COUNT(*) FROM affectation
UNION ALL SELECT 'creneau',           COUNT(*) FROM creneau
UNION ALL SELECT 'soutenance',        COUNT(*) FROM soutenance
UNION ALL SELECT 'resultats',         COUNT(*) FROM resultats;

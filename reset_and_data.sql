-- ============================================================
--  GESTION PFA — RESET COMPLET + DONNÉES DE TEST
--  À exécuter dans MySQL Workbench
--
--  ÉTAPES :
--  1. Exécuter la PARTIE 1 (reset de la base)
--  2. Démarrer l'application Spring Boot
--     → DataInitializer crée les tables + les comptes utilisateurs
--  3. Revenir ici et exécuter la PARTIE 2 (données de test)
--
--  COMPTES CRÉÉS PAR L'APPLICATION :
--  Chef    : chef@enicar.ucar.tn          / chef1234
--  Profs   : m.trabelsi@enicar.ucar.tn    / prof1234
--            f.gharbi@enicar.ucar.tn      / prof1234
--            s.bouali@enicar.ucar.tn      / prof1234
--            n.cherif@enicar.ucar.tn      / prof1234
--            h.kallel@enicar.ucar.tn      / prof1234
--  Étud.   : y.bensalah@etu.enicar.tn    / pass1234
--            m.belhaj@etu.enicar.tn       / pass1234
--            a.riahi@etu.enicar.tn        / pass1234
--            r.sfar@etu.enicar.tn         / pass1234
--            s.trabelsi@etu.enicar.tn     / pass1234
--            i.chaabane@etu.enicar.tn     / pass1234
--            k.hamdi@etu.enicar.tn        / pass1234
--            d.abidi@etu.enicar.tn        / pass1234
--            m.oueslati@etu.enicar.tn     / pass1234
--            a.mansouri@etu.enicar.tn     / pass1234
-- ============================================================


-- ============================================================
--  PARTIE 1 — RESET COMPLET
--  Exécuter ceci, puis redémarrer l'application.
-- ============================================================

DROP DATABASE IF EXISTS pfa_db;
CREATE DATABASE pfa_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE pfa_db;

-- ↑ Redémarrez maintenant l'application Spring Boot.
-- Elle va recréer toutes les tables et insérer les comptes.
-- Quand vous voyez "✅ Initialisation terminée" dans la console,
-- revenez ici et exécutez la PARTIE 2.


-- ============================================================
--  PARTIE 2 — DONNÉES SUPPLÉMENTAIRES
--  À exécuter APRÈS avoir démarré l'application.
-- ============================================================

USE pfa_db;

-- Vérification rapide avant de continuer
-- SELECT COUNT(*) as nb_users FROM users;        -- doit être >= 16
-- SELECT COUNT(*) as nb_sujets FROM sujets;      -- doit être 7

-- ────────────────────────────────────────────────────────────
--  3 sujets supplémentaires (en plus des 7 du DataInitializer)
-- ────────────────────────────────────────────────────────────
INSERT INTO sujets
  (titre, description, difficulte, disponible, confirme, statut, date_proposition, enseignant_id)
VALUES
(
  'Système de monitoring IoT pour smart campus',
  'Développement d''une plateforme de supervision temps réel de capteurs IoT déployés sur le campus universitaire, avec alertes automatiques et tableau de bord Grafana.',
  3, 1, 1, 'APPROUVE', '2026-03-10',
  (SELECT id FROM users WHERE email = 'h.kallel@enicar.ucar.tn')
),
(
  'Plateforme d''apprentissage adaptatif avec LLM',
  'Système d''apprentissage personnalisé utilisant des modèles de langage de grande taille pour adapter le contenu pédagogique au profil de chaque étudiant.',
  5, 1, 1, 'APPROUVE', '2026-03-12',
  (SELECT id FROM users WHERE email = 's.bouali@enicar.ucar.tn')
),
(
  'Application de gestion de bibliothèque universitaire',
  'Système complet de gestion de bibliothèque avec recherche intelligente, réservation en ligne, gestion des emprunts et intégration RFID.',
  2, 1, 1, 'EN_ATTENTE', '2026-03-20',
  (SELECT id FROM users WHERE email = 'm.trabelsi@enicar.ucar.tn')
);

-- Mots-clés
INSERT INTO sujet_mots_cles (sujet_id, mot_cle)
SELECT s.id, mk.mot FROM sujets s
JOIN (
  SELECT 'Système de monitoring IoT pour smart campus'            AS titre, 'IoT'         AS mot
  UNION SELECT 'Système de monitoring IoT pour smart campus',              'monitoring'
  UNION SELECT 'Système de monitoring IoT pour smart campus',              'temps réel'
  UNION SELECT 'Plateforme d''apprentissage adaptatif avec LLM', 'LLM'
  UNION SELECT 'Plateforme d''apprentissage adaptatif avec LLM', 'e-learning'
  UNION SELECT 'Application de gestion de bibliothèque universitaire',     'bibliothèque'
  UNION SELECT 'Application de gestion de bibliothèque universitaire',     'RFID'
) mk ON s.titre = mk.titre;

-- Technologies
INSERT INTO sujet_technologies (sujet_id, technologie)
SELECT s.id, t.tech FROM sujets s
JOIN (
  SELECT 'Système de monitoring IoT pour smart campus' AS titre, 'MQTT'        AS tech
  UNION SELECT 'Système de monitoring IoT pour smart campus',    'Grafana'
  UNION SELECT 'Système de monitoring IoT pour smart campus',    'InfluxDB'
  UNION SELECT 'Plateforme d''apprentissage adaptatif avec LLM', 'LangChain'
  UNION SELECT 'Plateforme d''apprentissage adaptatif avec LLM', 'FastAPI'
  UNION SELECT 'Application de gestion de bibliothèque universitaire', 'Spring Boot'
  UNION SELECT 'Application de gestion de bibliothèque universitaire', 'React'
) t ON s.titre = t.titre;

-- ────────────────────────────────────────────────────────────
--  Créneaux supplémentaires (avec jury)
-- ────────────────────────────────────────────────────────────
INSERT INTO creneau (date, heure_debut, heure_fin, duree_minutes, salle, statut)
VALUES
  ('2026-06-02', '08:30:00', '09:15:00', 45, 'Salle A1',      'DISPONIBLE'),
  ('2026-06-02', '10:00:00', '10:45:00', 45, 'Salle A2',      'DISPONIBLE'),
  ('2026-06-02', '11:30:00', '12:15:00', 45, 'Salle B1',      'DISPONIBLE'),
  ('2026-06-03', '08:30:00', '09:15:00', 45, 'Amphithéâtre',  'DISPONIBLE'),
  ('2026-06-03', '10:00:00', '10:45:00', 45, 'Salle A1',      'DISPONIBLE');

-- Jury : Trabelsi + Bouali sur tous les nouveaux créneaux
INSERT INTO creneau_jury (creneau_id, professeur_id)
SELECT c.id, p.utilisateur_id
FROM creneau c
CROSS JOIN (
  SELECT utilisateur_id FROM professeur p2
  JOIN users u ON u.id = p2.utilisateur_id
  WHERE u.email IN ('m.trabelsi@enicar.ucar.tn', 's.bouali@enicar.ucar.tn')
) p
WHERE c.date IN ('2026-06-02','2026-06-03');

-- ────────────────────────────────────────────────────────────
--  Vérification finale
-- ────────────────────────────────────────────────────────────
SELECT
  'users'       AS `table`, COUNT(*) AS total FROM users  UNION ALL
SELECT 'professeur',         COUNT(*) FROM professeur     UNION ALL
SELECT 'etudiant',           COUNT(*) FROM etudiant       UNION ALL
SELECT 'sujets',             COUNT(*) FROM sujets         UNION ALL
SELECT 'binome',             COUNT(*) FROM binome         UNION ALL
SELECT 'affectation',        COUNT(*) FROM affectation    UNION ALL
SELECT 'creneau',            COUNT(*) FROM creneau        UNION ALL
SELECT 'soutenance',         COUNT(*) FROM soutenance     UNION ALL
SELECT 'resultats',          COUNT(*) FROM resultats;

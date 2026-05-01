-- ============================================================
--  GESTION PFA — SEED.SQL
--  Données de démo pour toutes les interfaces
--
--  ÉTAPES :
--  1. Exécuter la PARTIE 1 (reset de la base)
--  2. Démarrer l'application Spring Boot et attendre
--     "✅ Initialisation terminée" dans la console
--  3. Exécuter la PARTIE 2 (données supplémentaires)
--
--  COMPTES (créés par DataInitializer au démarrage) :
--  Chef     : chef@enicar.ucar.tn             / chef1234
--  Profs    : m.trabelsi@enicar.ucar.tn       / prof1234
--             f.gharbi@enicar.ucar.tn         / prof1234
--             s.bouali@enicar.ucar.tn         / prof1234
--             n.cherif@enicar.ucar.tn         / prof1234
--             h.kallel@enicar.ucar.tn         / prof1234
--  Étudiants: y.bensalah@etu.enicar.tn        / pass1234
--             m.belhaj@etu.enicar.tn          / pass1234
--             a.riahi@etu.enicar.tn           / pass1234
--             r.sfar@etu.enicar.tn            / pass1234
--             s.trabelsi@etu.enicar.tn        / pass1234
--             i.chaabane@etu.enicar.tn        / pass1234
--             k.hamdi@etu.enicar.tn           / pass1234
--             d.abidi@etu.enicar.tn           / pass1234
--             m.oueslati@etu.enicar.tn        / pass1234
--             a.mansouri@etu.enicar.tn        / pass1234
-- ============================================================


-- ============================================================
--  PARTIE 1 — RESET COMPLET
--  Exécuter puis redémarrer l'application Spring Boot.
-- ============================================================

DROP DATABASE IF EXISTS pfa_db;
CREATE DATABASE pfa_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE pfa_db;

-- ↑ Redémarrez maintenant Spring Boot.
-- Attendez "✅ Initialisation terminée" dans la console, puis exécutez la PARTIE 2.


-- ============================================================
--  PARTIE 2 — DONNÉES SUPPLÉMENTAIRES
--  À exécuter APRÈS que Spring Boot ait démarré et initialisé.
-- ============================================================

USE pfa_db;

-- ── 1. Sujets supplémentaires ──────────────────────────────────────────────
INSERT INTO sujets (titre, description, difficulte, disponible, confirme, statut, date_proposition, enseignant_id)
VALUES
(
  'Système de monitoring IoT pour smart campus',
  'Développement d''une plateforme de supervision temps réel de capteurs IoT déployés sur le campus, avec alertes automatiques et tableau de bord Grafana.',
  3, 1, 1, 'APPROUVE', '2026-03-10',
  (SELECT id FROM users WHERE email = 'h.kallel@enicar.ucar.tn')
),
(
  'Plateforme d''apprentissage adaptatif avec LLM',
  'Système d''apprentissage personnalisé utilisant des grands modèles de langage pour adapter le contenu pédagogique au profil de chaque étudiant.',
  5, 1, 1, 'APPROUVE', '2026-03-12',
  (SELECT id FROM users WHERE email = 's.bouali@enicar.ucar.tn')
),
(
  'Application de gestion de bibliothèque universitaire',
  'Système complet de gestion de bibliothèque avec recherche intelligente, réservation en ligne et gestion des emprunts.',
  2, 1, 0, 'EN_ATTENTE', '2026-03-20',
  (SELECT id FROM users WHERE email = 'm.trabelsi@enicar.ucar.tn')
),
(
  'Analyse de sentiment multilingue pour réseaux sociaux',
  'Outil d''analyse de sentiment en arabe, français et anglais utilisant des modèles BERT fine-tunés sur des données locales.',
  4, 1, 0, 'EN_ATTENTE', '2026-03-22',
  (SELECT id FROM users WHERE email = 'f.gharbi@enicar.ucar.tn')
);

-- Mots-clés des sujets supplémentaires
INSERT INTO sujet_mots_cles (sujet_id, mot_cle)
SELECT s.id, mk.mot FROM sujets s
JOIN (
  SELECT 'Système de monitoring IoT pour smart campus'            AS titre, 'IoT'          AS mot UNION ALL
  SELECT 'Système de monitoring IoT pour smart campus',                     'temps réel'           UNION ALL
  SELECT 'Système de monitoring IoT pour smart campus',                     'Grafana'              UNION ALL
  SELECT 'Plateforme d''apprentissage adaptatif avec LLM',                  'LLM'                  UNION ALL
  SELECT 'Plateforme d''apprentissage adaptatif avec LLM',                  'e-learning'           UNION ALL
  SELECT 'Application de gestion de bibliothèque universitaire',            'bibliothèque'         UNION ALL
  SELECT 'Application de gestion de bibliothèque universitaire',            'RFID'                 UNION ALL
  SELECT 'Analyse de sentiment multilingue pour réseaux sociaux',           'NLP'                  UNION ALL
  SELECT 'Analyse de sentiment multilingue pour réseaux sociaux',           'BERT'
) mk ON s.titre = mk.titre;

-- Compétences des sujets supplémentaires
INSERT INTO sujet_competences (sujet_id, competence)
SELECT s.id, c.comp FROM sujets s
JOIN (
  SELECT 'Système de monitoring IoT pour smart campus'         AS titre, 'MQTT'        AS comp UNION ALL
  SELECT 'Système de monitoring IoT pour smart campus',                  'Python'               UNION ALL
  SELECT 'Plateforme d''apprentissage adaptatif avec LLM',              'Python'               UNION ALL
  SELECT 'Plateforme d''apprentissage adaptatif avec LLM',              'LangChain'            UNION ALL
  SELECT 'Application de gestion de bibliothèque universitaire',        'Spring Boot'          UNION ALL
  SELECT 'Application de gestion de bibliothèque universitaire',        'React'                UNION ALL
  SELECT 'Analyse de sentiment multilingue pour réseaux sociaux',       'Python'               UNION ALL
  SELECT 'Analyse de sentiment multilingue pour réseaux sociaux',       'PyTorch'
) c ON s.titre = c.titre;

-- ── 2. Créneaux supplémentaires avec jury ─────────────────────────────────
INSERT INTO creneau (date, heure_debut, heure_fin, duree_minutes, salle, statut)
VALUES
  ('2026-06-02', '08:30:00', '09:15:00', 45, 'Salle A1',     'DISPONIBLE'),
  ('2026-06-02', '10:00:00', '10:45:00', 45, 'Salle A2',     'DISPONIBLE'),
  ('2026-06-02', '14:00:00', '14:45:00', 45, 'Salle B1',     'DISPONIBLE'),
  ('2026-06-03', '08:30:00', '09:15:00', 45, 'Amphithéâtre', 'DISPONIBLE'),
  ('2026-06-03', '10:00:00', '10:45:00', 45, 'Salle A1',     'DISPONIBLE');

-- Jury pour les nouveaux créneaux (Trabelsi + Bouali)
INSERT INTO creneau_jury (creneau_id, professeur_id)
SELECT c.id, p.utilisateur_id
FROM creneau c
CROSS JOIN (
  SELECT utilisateur_id FROM professeur
  JOIN users ON users.id = professeur.utilisateur_id
  WHERE users.email IN ('m.trabelsi@enicar.ucar.tn', 's.bouali@enicar.ucar.tn')
) p
WHERE c.date IN ('2026-06-02', '2026-06-03');

-- ── 3. Disponibilités des professeurs ─────────────────────────────────────
INSERT INTO disponibilite_prof (professeur_id, date, heure_debut, heure_fin, disponible)
SELECT p.utilisateur_id, d.date, d.hd, d.hf, 1
FROM professeur p
JOIN users u ON u.id = p.utilisateur_id
CROSS JOIN (
  SELECT '2026-06-02' AS date, '08:00:00' AS hd, '12:00:00' AS hf UNION ALL
  SELECT '2026-06-02', '14:00:00', '18:00:00'                      UNION ALL
  SELECT '2026-06-03', '08:00:00', '12:00:00'
) d
WHERE u.email IN ('m.trabelsi@enicar.ucar.tn', 's.bouali@enicar.ucar.tn',
                  'n.cherif@enicar.ucar.tn',   'h.kallel@enicar.ucar.tn');

-- ── 4. Notifications pour les profs (début de soutenance) ─────────────────
INSERT INTO notification (destinataire_id, titre, message, type, lue, date_creation)
SELECT p.utilisateur_id,
       'Rappel soutenance',
       'Vous êtes membre du jury pour une soutenance le 20 mai 2026 à 08h30.',
       'INFO', 0, NOW()
FROM professeur p
JOIN users u ON u.id = p.utilisateur_id
WHERE u.email IN ('m.trabelsi@enicar.ucar.tn', 'f.gharbi@enicar.ucar.tn');

-- Notification pour les étudiants avec soutenance planifiée
INSERT INTO notification (destinataire_id, titre, message, type, lue, date_creation)
SELECT e.utilisateur_id,
       'Votre soutenance est planifiée',
       'Votre soutenance a été planifiée le 20 mai 2026. Bonne préparation !',
       'INFO', 0, NOW()
FROM etudiant e
JOIN users u ON u.id = e.utilisateur_id
WHERE u.email IN ('k.hamdi@etu.enicar.tn', 'd.abidi@etu.enicar.tn');

-- ── 5. Messages de démo (chat chef ↔ profs) ───────────────────────────────
INSERT INTO message (expediteur_id, destinataire_id, contenu, date, lu)
VALUES (
  (SELECT id FROM users WHERE email = 'chef@enicar.ucar.tn'),
  (SELECT id FROM users WHERE email = 'm.trabelsi@enicar.ucar.tn'),
  'Bonjour M. Trabelsi, pouvez-vous confirmer votre disponibilité pour les soutenances du 2 juin ?',
  DATE_SUB(NOW(), INTERVAL 2 HOUR), 0
),
(
  (SELECT id FROM users WHERE email = 'm.trabelsi@enicar.ucar.tn'),
  (SELECT id FROM users WHERE email = 'chef@enicar.ucar.tn'),
  'Bonjour, oui je suis disponible toute la matinée du 2 juin.',
  DATE_SUB(NOW(), INTERVAL 1 HOUR), 0
),
(
  (SELECT id FROM users WHERE email = 'chef@enicar.ucar.tn'),
  (SELECT id FROM users WHERE email = 's.bouali@enicar.ucar.tn'),
  'M. Bouali, les créneaux du 3 juin sont confirmés. Merci de préparer les grilles d''évaluation.',
  DATE_SUB(NOW(), INTERVAL 3 HOUR), 0
);

-- ── Vérification finale ────────────────────────────────────────────────────
SELECT 'users'             AS `table`, COUNT(*) AS total FROM users         UNION ALL
SELECT 'professeur',                   COUNT(*)           FROM professeur    UNION ALL
SELECT 'etudiant',                     COUNT(*)           FROM etudiant      UNION ALL
SELECT 'sujets',                       COUNT(*)           FROM sujets        UNION ALL
SELECT 'binome',                       COUNT(*)           FROM binome        UNION ALL
SELECT 'affectation',                  COUNT(*)           FROM affectation   UNION ALL
SELECT 'creneau',                      COUNT(*)           FROM creneau       UNION ALL
SELECT 'creneau_jury',                 COUNT(*)           FROM creneau_jury  UNION ALL
SELECT 'soutenance',                   COUNT(*)           FROM soutenance    UNION ALL
SELECT 'disponibilite_prof',           COUNT(*)           FROM disponibilite_prof UNION ALL
SELECT 'notification',                 COUNT(*)           FROM notification  UNION ALL
SELECT 'message',                      COUNT(*)           FROM message;

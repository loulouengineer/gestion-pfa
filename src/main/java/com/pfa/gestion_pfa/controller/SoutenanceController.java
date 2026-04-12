package com.pfa.gestion_pfa.controller;

import com.pfa.gestion_pfa.model.*;
import com.pfa.gestion_pfa.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/soutenances")
@RequiredArgsConstructor
public class SoutenanceController {

    private final SoutenanceRepository    soutenanceRepository;
    private final CreneauRepository       creneauRepository;
    private final AffectationRepository   affectationRepository;
    private final ProfesseurRepository    professeurRepository;
    private final NotificationRepository  notificationRepository;

    /** GET /api/soutenances */
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAll() {
        return ResponseEntity.ok(
                soutenanceRepository.findAllOrderByDateAndHeure()
                        .stream().map(this::toMap).collect(Collectors.toList())
        );
    }

    /** GET /api/soutenances/{id} */
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getById(@PathVariable Long id) {
        return soutenanceRepository.findById(id)
                .map(s -> ResponseEntity.ok(toMap(s)))
                .orElse(ResponseEntity.notFound().build());
    }

    /** GET /api/soutenances/prof/{profId} — soutenances où le prof est membre du jury */
    @GetMapping("/prof/{profId}")
    public ResponseEntity<List<Map<String, Object>>> getByProf(@PathVariable Long profId) {
        return ResponseEntity.ok(
                soutenanceRepository.findByJuryProfId(profId)
                        .stream().map(this::toMap).collect(java.util.stream.Collectors.toList())
        );
    }

    /**
     * POST /api/soutenances/planifier
     * Assigne UNIQUEMENT un binôme — jury vient du créneau.
     * Envoie automatiquement une notification à chaque membre du jury.
     *
     * Body: { affectationId, creneauId }
     */
    @PostMapping("/planifier")
    public ResponseEntity<?> planifier(@RequestBody Map<String, Object> body) {
        Long affectationId = Long.valueOf(body.get("affectationId").toString());
        Long creneauId     = Long.valueOf(body.get("creneauId").toString());

        Affectation affectation = affectationRepository.findById(affectationId)
                .orElseThrow(() -> new IllegalArgumentException("Affectation introuvable."));

        Creneau creneau = creneauRepository.findById(creneauId)
                .orElseThrow(() -> new IllegalArgumentException("Créneau introuvable."));

        // Vérifier que le créneau est valide (jury + salle)
        List<Professeur> jury = professeurRepository.findByCreneauId(creneauId);
        if (jury.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "erreur", "Ce créneau n'a pas de jury. Il ne peut pas être utilisé."
            ));
        }
        if (creneau.getSalle() == null || creneau.getSalle().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "erreur", "Ce créneau n'a pas de salle."
            ));
        }

        // Vérifier disponibilité du créneau
        if (creneau.getStatut() != com.pfa.gestion_pfa.model.enums.StatutCreneau.DISPONIBLE) {
            return ResponseEntity.badRequest().body(Map.of(
                    "erreur", "Ce créneau est déjà occupé."
            ));
        }

        // Vérifier que le binôme n'est pas déjà planifié
        if (soutenanceRepository.existsByBinome(affectation.getBinome())) {
            return ResponseEntity.badRequest().body(Map.of(
                    "erreur", "Ce binôme a déjà une soutenance planifiée."
            ));
        }

        // Créer la soutenance
        Soutenance soutenance = new Soutenance();
        soutenance.setBinome(affectation.getBinome());
        soutenance.setAffectation(affectation);
        soutenance.setCreneau(creneau);

        creneau.setStatut(com.pfa.gestion_pfa.model.enums.StatutCreneau.OCCUPE);
        creneauRepository.save(creneau);

        Soutenance saved = soutenanceRepository.save(soutenance);

        // ── AUTO-NOTIFICATION à chaque membre du jury ──────────────
        String etudiant1 = affectation.getBinome().getEtudiant1().getNom();
        String etudiant2 = affectation.getBinome().getEtudiant2().getNom();
        String salle     = creneau.getSalle();
        String date      = creneau.getDate().toString();
        String heure     = creneau.getHeureDebut().toString();

        for (Professeur prof : jury) {
            Notification notif = new Notification();
            notif.setDestinataire(prof);
            notif.setTitre("Nouvelle soutenance planifiée");
            notif.setMessage(String.format(
                    "Vous êtes membre du jury pour la soutenance de %s & %s. " +
                            "Date : %s à %s, Salle : %s.",
                    etudiant1, etudiant2, date, heure, salle
            ));
            notif.setType(Notification.TypeNotification.INFO);
            notif.setSoutenance(saved);
            notif.setLien("/soutenances/" + saved.getId());
            notificationRepository.save(notif);
        }

        return ResponseEntity.ok(toMap(saved));
    }

    /** POST /api/soutenances/planifier-auto */
    @PostMapping("/planifier-auto")
    public ResponseEntity<List<Map<String, Object>>> planifierAuto() {
        List<Affectation> validees = affectationRepository
                .findByStatut(com.pfa.gestion_pfa.model.enums.StatutAffectation.VALIDEE);

        // Seulement créneaux avec jury ET salle
        List<Creneau> creneauxDispo = creneauRepository
                .findByStatut(com.pfa.gestion_pfa.model.enums.StatutCreneau.DISPONIBLE)
                .stream()
                .filter(c -> {
                    List<Professeur> j = professeurRepository.findByCreneauId(c.getId());
                    return !j.isEmpty() && c.getSalle() != null && !c.getSalle().isBlank();
                })
                .collect(Collectors.toList());

        List<Map<String, Object>> planifiees = new ArrayList<>();
        Iterator<Creneau> iter = creneauxDispo.iterator();

        for (Affectation affectation : validees) {
            if (!iter.hasNext()) break;
            if (soutenanceRepository.existsByBinome(affectation.getBinome())) continue;

            Creneau creneau = iter.next();
            List<Professeur> jury = professeurRepository.findByCreneauId(creneau.getId());

            Soutenance s = new Soutenance();
            s.setBinome(affectation.getBinome());
            s.setAffectation(affectation);
            s.setCreneau(creneau);

            creneau.setStatut(com.pfa.gestion_pfa.model.enums.StatutCreneau.OCCUPE);
            creneauRepository.save(creneau);
            Soutenance saved = soutenanceRepository.save(s);

            // Auto-notif
            for (Professeur prof : jury) {
                Notification notif = new Notification();
                notif.setDestinataire(prof);
                notif.setTitre("Nouvelle soutenance planifiée");
                notif.setMessage(String.format(
                        "Soutenance de %s & %s — %s à %s, %s.",
                        affectation.getBinome().getEtudiant1().getNom(),
                        affectation.getBinome().getEtudiant2().getNom(),
                        creneau.getDate(), creneau.getHeureDebut(), creneau.getSalle()
                ));
                notif.setType(Notification.TypeNotification.INFO);
                notif.setSoutenance(saved);
                notificationRepository.save(notif);
            }

            planifiees.add(toMap(saved));
        }

        return ResponseEntity.ok(planifiees);
    }

    /** PUT /api/soutenances/{id}/resultat */
    @PutMapping("/{id}/resultat")
    public ResponseEntity<?> enregistrerResultat(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {

        Soutenance s = soutenanceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Soutenance introuvable."));

        double note = Double.parseDouble(body.get("note").toString());
        if (note < 0 || note > 20) return ResponseEntity.badRequest()
                .body(Map.of("erreur", "Note invalide (0–20)."));

        s.terminer((float) note,
                (String) body.getOrDefault("observations", ""),
                Boolean.parseBoolean(body.getOrDefault("present", "true").toString())
        );

        return ResponseEntity.ok(toMap(soutenanceRepository.save(s)));
    }

    /** DELETE /api/soutenances/{id} */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> annuler(@PathVariable Long id) {
        soutenanceRepository.findById(id).ifPresent(s -> {
            if (s.getCreneau() != null) {
                s.getCreneau().setStatut(com.pfa.gestion_pfa.model.enums.StatutCreneau.DISPONIBLE);
                creneauRepository.save(s.getCreneau());
            }
            soutenanceRepository.delete(s);
        });
        return ResponseEntity.ok().build();
    }

    private Map<String, Object> toMap(Soutenance s) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id",           s.getId());
        map.put("statut",       s.getStatut().name());
        map.put("note",         s.getNote());
        map.put("observations", s.getObservations());
        map.put("present",      s.getPresent());

        if (s.getBinome() != null) {
            map.put("binome", Map.of(
                    "id",   s.getBinome().getId(),
                    "etudiant1", Map.of("id", s.getBinome().getEtudiant1().getId(), "nom", s.getBinome().getEtudiant1().getNom()),
                    "etudiant2", Map.of("id", s.getBinome().getEtudiant2().getId(), "nom", s.getBinome().getEtudiant2().getNom()),
                    "moyenneBinome", (double) s.getBinome().getMoyenneBinome()
            ));
        }

        if (s.getCreneau() != null) {
            Creneau c = s.getCreneau();
            List<Professeur> jury = professeurRepository.findByCreneauId(c.getId());
            map.put("creneau", Map.of(
                    "id",           c.getId(),
                    "date",         c.getDate().toString(),
                    "heureDebut",   c.getHeureDebut().toString(),
                    "heureFin",     c.getHeureFin().toString(),
                    "dureeMinutes", c.getDureeMinutes(),
                    "salle",        c.getSalle() != null ? c.getSalle() : "",
                    "jury", jury.stream().map(p -> Map.of(
                            "id",          p.getId(),
                            "nom",         p.getNom(),
                            "departement", p.getDepartement() != null ? p.getDepartement() : ""
                    )).collect(Collectors.toList())
            ));
        }

        if (s.getAffectation() != null && s.getAffectation().getSujet() != null) {
            map.put("sujet", Map.of(
                    "titre",     s.getAffectation().getSujet().getTitre(),
                    "encadrant", s.getAffectation().getSujet().getEncadrant() != null
                            ? s.getAffectation().getSujet().getEncadrant().getNom() : ""
            ));
        }

        return map;
    }
}
package tn.enicarthage.projetspring.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.enicarthage.projetspring.entity.*;
import tn.enicarthage.projetspring.repository.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/soutenances")
@RequiredArgsConstructor
public class SoutenanceController {

    private final SoutenanceRepository soutenanceRepository;
    private final CreneauRepository creneauRepository;
    private final AffectationRepository affectationRepository;
    private final ProfesseurRepository professeurRepository;
    private final NotificationRepository notificationRepository;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAll() {
        return ResponseEntity.ok(
                soutenanceRepository.findAllOrderByDateAndHeure()
                        .stream().map(this::toMap).collect(Collectors.toList())
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getById(@PathVariable Long id) {
        return soutenanceRepository.findById(id)
                .map(s -> ResponseEntity.ok(toMap(s)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/etudiant/{etudiantId}")
    public ResponseEntity<Map<String, Object>> getByEtudiant(@PathVariable Long etudiantId) {
        return soutenanceRepository.findAll().stream()
                .filter(s -> s.getBinome() != null && (
                        s.getBinome().getEtudiant1().getId().equals(etudiantId) ||
                        s.getBinome().getEtudiant2().getId().equals(etudiantId)))
                .findFirst()
                .map(s -> ResponseEntity.ok(toMap(s)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/prof/{profId}")
    public ResponseEntity<List<Map<String, Object>>> getByProf(@PathVariable Long profId) {
        return ResponseEntity.ok(
                soutenanceRepository.findByJuryProfId(profId)
                        .stream().map(this::toMap).collect(Collectors.toList())
        );
    }

    @PostMapping("/planifier")
    public ResponseEntity<?> planifier(@RequestBody Map<String, Object> body) {
        Long affectationId = Long.valueOf(body.get("affectationId").toString());
        Long creneauId = Long.valueOf(body.get("creneauId").toString());

        Affectation affectation = affectationRepository.findById(affectationId)
                .orElseThrow(() -> new IllegalArgumentException("Affectation introuvable."));
        Creneau creneau = creneauRepository.findById(creneauId)
                .orElseThrow(() -> new IllegalArgumentException("Créneau introuvable."));

        List<Professeur> jury = professeurRepository.findByCreneauId(creneauId);
        if (jury.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("erreur", "Ce créneau n'a pas de jury."));
        }
        if (creneau.getSalle() == null || creneau.getSalle().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("erreur", "Ce créneau n'a pas de salle."));
        }
        if (!creneau.estDisponible()) {
            return ResponseEntity.badRequest().body(Map.of("erreur", "Ce créneau est déjà occupé."));
        }
        if (soutenanceRepository.existsByBinome(affectation.getBinome())) {
            return ResponseEntity.badRequest().body(Map.of("erreur", "Ce binôme a déjà une soutenance planifiée."));
        }

        Soutenance soutenance = new Soutenance();
        soutenance.setBinome(affectation.getBinome());
        soutenance.setAffectation(affectation);
        soutenance.setCreneau(creneau);

        creneau.setStatut(StatutCreneau.OCCUPE);
        creneauRepository.save(creneau);
        Soutenance saved = soutenanceRepository.save(soutenance);

        String et1 = affectation.getBinome().getEtudiant1().getNom();
        String et2 = affectation.getBinome().getEtudiant2().getNom();
        String salle = creneau.getSalle();
        String date = creneau.getDate().toString();
        String heure = creneau.getHeureDebut().toString();

        for (Professeur prof : jury) {
            Notification notif = new Notification();
            notif.setDestinataire(prof);
            notif.setTitre("Nouvelle soutenance planifiée");
            notif.setMessage(String.format(
                    "Vous êtes membre du jury pour la soutenance de %s & %s. Date : %s à %s, Salle : %s.",
                    et1, et2, date, heure, salle));
            notif.setType(Notification.TypeNotification.INFO);
            notif.setSoutenance(saved);
            notif.setLien("/soutenances/" + saved.getId());
            notificationRepository.save(notif);
        }

        return ResponseEntity.ok(toMap(saved));
    }

    @PostMapping("/planifier-auto")
    public ResponseEntity<List<Map<String, Object>>> planifierAuto() {
        List<Affectation> validees = affectationRepository.findByStatut(StatutAffectation.VALIDEE);

        List<Creneau> creneauxDispo = creneauRepository
                .findByStatut(StatutCreneau.DISPONIBLE).stream()
                .filter(c -> {
                    List<Professeur> j = professeurRepository.findByCreneauId(c.getId());
                    return !j.isEmpty() && c.getSalle() != null && !c.getSalle().isBlank();
                }).collect(Collectors.toList());

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

            creneau.setStatut(StatutCreneau.OCCUPE);
            creneauRepository.save(creneau);
            Soutenance saved = soutenanceRepository.save(s);

            for (Professeur prof : jury) {
                Notification notif = new Notification();
                notif.setDestinataire(prof);
                notif.setTitre("Nouvelle soutenance planifiée");
                notif.setMessage(String.format("Soutenance de %s & %s — %s à %s, %s.",
                        affectation.getBinome().getEtudiant1().getNom(),
                        affectation.getBinome().getEtudiant2().getNom(),
                        creneau.getDate(), creneau.getHeureDebut(), creneau.getSalle()));
                notif.setType(Notification.TypeNotification.INFO);
                notif.setSoutenance(saved);
                notificationRepository.save(notif);
            }
            planifiees.add(toMap(saved));
        }
        return ResponseEntity.ok(planifiees);
    }

    @PutMapping("/{id}/resultat")
    public ResponseEntity<?> enregistrerResultat(@PathVariable Long id,
                                                  @RequestBody Map<String, Object> body) {
        Soutenance s = soutenanceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Soutenance introuvable."));

        double note = Double.parseDouble(body.get("note").toString());
        if (note < 0 || note > 20)
            return ResponseEntity.badRequest().body(Map.of("erreur", "Note invalide (0–20)."));

        Boolean p1 = body.get("presentEtudiant1") != null
                ? Boolean.parseBoolean(body.get("presentEtudiant1").toString()) : true;
        Boolean p2 = body.get("presentEtudiant2") != null
                ? Boolean.parseBoolean(body.get("presentEtudiant2").toString()) : true;
        String mention = (String) body.getOrDefault("mention", null);

        s.terminer((float) note, (String) body.getOrDefault("observations", ""), p1, p2, mention);
        return ResponseEntity.ok(toMap(soutenanceRepository.save(s)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> annuler(@PathVariable Long id) {
        soutenanceRepository.findById(id).ifPresent(s -> {
            if (s.getCreneau() != null) {
                s.getCreneau().setStatut(StatutCreneau.DISPONIBLE);
                creneauRepository.save(s.getCreneau());
            }
            soutenanceRepository.delete(s);
        });
        return ResponseEntity.ok().build();
    }

    private Map<String, Object> toMap(Soutenance s) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", s.getId());
        map.put("statut", s.getStatut().name());
        map.put("note", s.getNote());
        map.put("observations", s.getObservations());
        map.put("present", s.getPresent());
        map.put("presentEtudiant1", s.getPresentEtudiant1());
        map.put("presentEtudiant2", s.getPresentEtudiant2());
        map.put("mention", s.getMention());

        if (s.getBinome() != null) {
            map.put("binome", Map.of(
                    "id", s.getBinome().getId(),
                    "etudiant1", Map.of("id", s.getBinome().getEtudiant1().getId(),
                            "nom", s.getBinome().getEtudiant1().getNom()),
                    "etudiant2", Map.of("id", s.getBinome().getEtudiant2().getId(),
                            "nom", s.getBinome().getEtudiant2().getNom()),
                    "moyenneBinome", s.getBinome().getMoyenneBinome()
            ));
        }
        if (s.getCreneau() != null) {
            Creneau c = s.getCreneau();
            List<Professeur> jury = professeurRepository.findByCreneauId(c.getId());
            map.put("creneau", Map.of(
                    "id", c.getId(),
                    "date", c.getDate().toString(),
                    "heureDebut", c.getHeureDebut().toString(),
                    "heureFin", c.getHeureFin().toString(),
                    "dureeMinutes", c.getDureeMinutes(),
                    "salle", c.getSalle() != null ? c.getSalle() : "",
                    "jury", jury.stream().map(p -> Map.of(
                            "id", p.getId(),
                            "nom", p.getNom(),
                            "departement", p.getDepartement() != null ? p.getDepartement() : ""
                    )).collect(Collectors.toList())
            ));
        }
        if (s.getAffectation() != null && s.getAffectation().getSujet() != null) {
            map.put("sujet", Map.of(
                    "titre", s.getAffectation().getSujet().getTitre(),
                    "encadrant", s.getAffectation().getSujet().getEncadrant() != null
                            ? s.getAffectation().getSujet().getEncadrant().getNom() : ""
            ));
        }
        return map;
    }
}

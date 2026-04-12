package com.pfa.gestion_pfa.controller;

import com.pfa.gestion_pfa.model.Creneau;
import com.pfa.gestion_pfa.model.DisponibiliteProf;
import com.pfa.gestion_pfa.model.Professeur;
import com.pfa.gestion_pfa.repository.CreneauRepository;
import com.pfa.gestion_pfa.repository.DisponibiliteProfRepository;
import com.pfa.gestion_pfa.repository.ProfesseurRepository;
import com.pfa.gestion_pfa.service.SoutenanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
public class CreneauController {

    private final SoutenanceService soutenanceService;
    private final CreneauRepository creneauRepository;
    private final ProfesseurRepository professeurRepository;
    private final DisponibiliteProfRepository disponibiliteProfRepository;

    private static final List<String> TOUTES_SALLES =
            List.of("Salle A1", "Salle A2", "Salle B1", "Amphithéâtre");

    /** GET /api/creneaux */
    @GetMapping("/api/creneaux")
    public ResponseEntity<List<Map<String, Object>>> getTous() {
        List<Creneau> creneaux = creneauRepository.findAll();
        return ResponseEntity.ok(creneaux.stream().map(this::toMap).collect(Collectors.toList()));
    }

    /** POST /api/creneaux */
    @PostMapping("/api/creneaux")
    public ResponseEntity<Map<String, Object>> creer(@RequestBody Map<String, Object> body) {
        String date       = (String) body.get("date");
        String heureDebut = (String) body.get("heureDebut");
        int    duree      = Integer.parseInt(body.get("dureeMinutes").toString());
        String salle      = (String) body.get("salle");

        @SuppressWarnings("unchecked")
        List<Integer> juryIds = body.containsKey("juryIds")
                ? (List<Integer>) body.get("juryIds") : new ArrayList<>();

        Creneau creneau = new Creneau();
        creneau.setDate(LocalDate.parse(date));
        creneau.setHeureDebut(LocalTime.parse(heureDebut));
        creneau.setDureeMinutes(duree);
        creneau.setSalle(salle);

        List<Professeur> jury = juryIds.stream()
                .map(id -> professeurRepository.findById(Long.valueOf(id)).orElse(null))
                .filter(Objects::nonNull).collect(Collectors.toList());
        creneau.setJury(jury);

        Creneau saved = soutenanceService.ajouterCreneau(creneau);

        // Marquer profs indispos
        LocalDate localDate = LocalDate.parse(date);
        LocalTime debut     = LocalTime.parse(heureDebut);
        LocalTime fin       = debut.plusMinutes(duree);
        for (Professeur prof : jury) {
            DisponibiliteProf indispo = new DisponibiliteProf();
            indispo.setProfesseur(prof);
            indispo.setDate(localDate);
            indispo.setHeureDebut(debut);
            indispo.setHeureFin(fin);
            indispo.setDisponible(false);
            disponibiliteProfRepository.save(indispo);
        }

        return ResponseEntity.ok(toMap(saved));
    }

    /**
     * PUT /api/creneaux/{id}
     * Modifier un créneau existant (date, heure, durée, salle, jury)
     * Uniquement si statut = DISPONIBLE
     */
    @PutMapping("/api/creneaux/{id}")
    public ResponseEntity<?> modifier(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {

        Creneau creneau = creneauRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Créneau introuvable."));

        if (creneau.getStatut() == com.pfa.gestion_pfa.model.enums.StatutCreneau.OCCUPE) {
            return ResponseEntity.badRequest().body(Map.of(
                    "erreur", "Ce créneau est occupé. Annulez la soutenance pour le modifier."
            ));
        }

        if (body.containsKey("date"))
            creneau.setDate(LocalDate.parse((String) body.get("date")));
        if (body.containsKey("heureDebut"))
            creneau.setHeureDebut(LocalTime.parse((String) body.get("heureDebut")));
        if (body.containsKey("dureeMinutes"))
            creneau.setDureeMinutes(Integer.parseInt(body.get("dureeMinutes").toString()));
        if (body.containsKey("salle"))
            creneau.setSalle((String) body.get("salle"));

        // Recalculate heureFin
        creneau.calculerHeureFin();

        // Update jury if provided
        if (body.containsKey("juryIds")) {
            @SuppressWarnings("unchecked")
            List<Integer> juryIds = (List<Integer>) body.get("juryIds");
            List<Professeur> jury = juryIds.stream()
                    .map(jid -> professeurRepository.findById(Long.valueOf(jid)).orElse(null))
                    .filter(Objects::nonNull).collect(Collectors.toList());
            creneau.setJury(jury);
        }

        return ResponseEntity.ok(toMap(creneauRepository.save(creneau)));
    }

    /** DELETE /api/creneaux/{id} */
    @DeleteMapping("/api/creneaux/{id}")
    public ResponseEntity<?> supprimer(@PathVariable Long id) {
        Creneau creneau = creneauRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Créneau introuvable."));

        if (creneau.getStatut() == com.pfa.gestion_pfa.model.enums.StatutCreneau.OCCUPE) {
            return ResponseEntity.badRequest().body(Map.of(
                    "erreur", "Ce créneau est occupé. Annulez la soutenance avant de supprimer."
            ));
        }

        creneauRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    /** GET /api/creneaux/salles-libres */
    @GetMapping("/api/creneaux/salles-libres")
    public ResponseEntity<List<String>> sallesLibres(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam String heureDebut,
            @RequestParam(defaultValue = "30") int dureeMinutes) {

        LocalTime debut = LocalTime.parse(heureDebut);
        LocalTime fin   = debut.plusMinutes(dureeMinutes);

        List<String> occupees = creneauRepository.findByDate(date).stream()
                .filter(c -> c.getHeureDebut().isBefore(fin) && c.getHeureFin().isAfter(debut))
                .map(Creneau::getSalle).distinct().collect(Collectors.toList());

        return ResponseEntity.ok(TOUTES_SALLES.stream()
                .filter(s -> !occupees.contains(s)).collect(Collectors.toList()));
    }

    /** GET /api/creneaux/profs-dispos */
    @GetMapping("/api/creneaux/profs-dispos")
    public ResponseEntity<List<Map<String, Object>>> profsDispos(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam String heureDebut,
            @RequestParam String heureFin) {

        LocalTime debut = LocalTime.parse(heureDebut);
        LocalTime fin   = LocalTime.parse(heureFin);

        return ResponseEntity.ok(professeurRepository.findAll().stream().map(prof -> {
            List<DisponibiliteProf> dispos =
                    disponibiliteProfRepository.findByProfesseurIdAndDate(prof.getId(), date);
            boolean hasCover = dispos.stream().filter(DisponibiliteProf::isDisponible)
                    .anyMatch(d -> !d.getHeureDebut().isAfter(debut) && !d.getHeureFin().isBefore(fin));
            boolean hasConflict = dispos.stream().filter(d -> !d.isDisponible())
                    .anyMatch(d -> d.getHeureDebut().isBefore(fin) && d.getHeureFin().isAfter(debut));
            return Map.<String, Object>of(
                    "id", prof.getId(), "nom", prof.getNom(),
                    "departement", prof.getDepartement() != null ? prof.getDepartement() : "",
                    "disponible", hasCover && !hasConflict
            );
        }).collect(Collectors.toList()));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleError(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(Map.of("erreur", ex.getMessage()));
    }

    private Map<String, Object> toMap(Creneau c) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id",           c.getId());
        map.put("date",         c.getDate().toString());
        map.put("heureDebut",   c.getHeureDebut().toString());
        map.put("heureFin",     c.getHeureFin().toString());
        map.put("dureeMinutes", c.getDureeMinutes());
        map.put("salle",        c.getSalle() != null ? c.getSalle() : "");
        map.put("statut",       c.getStatut().name());
        List<Professeur> jury = professeurRepository.findByCreneauId(c.getId());
        map.put("jury", jury.stream().map(p -> Map.of(
                "id", p.getId(), "nom", p.getNom()
        )).collect(Collectors.toList()));
        return map;
    }
}
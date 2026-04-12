package com.pfa.gestion_pfa.controller;

import com.pfa.gestion_pfa.model.DisponibiliteProf;
import com.pfa.gestion_pfa.model.Professeur;
import com.pfa.gestion_pfa.repository.DisponibiliteProfRepository;
import com.pfa.gestion_pfa.repository.ProfesseurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/disponibilites")
@RequiredArgsConstructor
public class DisponibiliteController {

    private final DisponibiliteProfRepository disponibiliteProfRepository;
    private final ProfesseurRepository        professeurRepository;

    /**
     * GET /api/disponibilites/{profId}
     * Toutes les disponibilités d'un prof
     */
    @GetMapping("/{profId}")
    public ResponseEntity<List<Map<String, Object>>> getByProf(@PathVariable Long profId) {
        List<DisponibiliteProf> dispos =
                disponibiliteProfRepository.findByProfesseurId(profId);
        return ResponseEntity.ok(dispos.stream().map(this::toMap).collect(Collectors.toList()));
    }

    /**
     * GET /api/disponibilites/{profId}/semaine?date=2026-04-28
     * Disponibilités d'un prof pour la semaine contenant cette date
     */
    @GetMapping("/{profId}/semaine")
    public ResponseEntity<Map<String, Object>> getSemaine(
            @PathVariable Long profId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        // Get Mon–Sun of the week
        LocalDate monday = date.minusDays(date.getDayOfWeek().getValue() - 1);
        LocalDate sunday = monday.plusDays(6);

        Map<String, List<Map<String, Object>>> parJour = new LinkedHashMap<>();

        for (int i = 0; i < 7; i++) {
            LocalDate jour = monday.plusDays(i);
            List<DisponibiliteProf> dispos =
                    disponibiliteProfRepository.findByProfesseurIdAndDate(profId, jour);
            parJour.put(jour.toString(),
                    dispos.stream().map(this::toMap).collect(Collectors.toList()));
        }

        return ResponseEntity.ok(Map.of(
                "lundi",  monday.toString(),
                "jours",  parJour
        ));
    }

    /**
     * POST /api/disponibilites
     * Ajouter une plage de disponibilité
     * Body: { professeurId, date, heureDebut, heureFin, disponible }
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> ajouter(@RequestBody Map<String, Object> body) {
        Long profId = Long.valueOf(body.get("professeurId").toString());

        Professeur prof = professeurRepository.findById(profId)
                .orElseThrow(() -> new IllegalArgumentException("Professeur introuvable."));

        DisponibiliteProf dispo = new DisponibiliteProf();
        dispo.setProfesseur(prof);
        dispo.setDate(LocalDate.parse((String) body.get("date")));
        dispo.setHeureDebut(LocalTime.parse((String) body.get("heureDebut")));
        dispo.setHeureFin(LocalTime.parse((String) body.get("heureFin")));
        dispo.setDisponible(body.getOrDefault("disponible", true).toString().equals("true"));

        return ResponseEntity.ok(toMap(disponibiliteProfRepository.save(dispo)));
    }

    /**
     * DELETE /api/disponibilites/{id}
     * Supprimer une plage
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimer(@PathVariable Long id) {
        disponibiliteProfRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    /**
     * PUT /api/disponibilites/{id}
     * Modifier une plage
     */
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> modifier(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {

        DisponibiliteProf dispo = disponibiliteProfRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Disponibilité introuvable."));

        if (body.containsKey("heureDebut"))
            dispo.setHeureDebut(LocalTime.parse((String) body.get("heureDebut")));
        if (body.containsKey("heureFin"))
            dispo.setHeureFin(LocalTime.parse((String) body.get("heureFin")));
        if (body.containsKey("disponible"))
            dispo.setDisponible(body.get("disponible").toString().equals("true"));

        return ResponseEntity.ok(toMap(disponibiliteProfRepository.save(dispo)));
    }

    private Map<String, Object> toMap(DisponibiliteProf d) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id",          d.getId());
        map.put("date",        d.getDate().toString());
        map.put("heureDebut",  d.getHeureDebut().toString());
        map.put("heureFin",    d.getHeureFin().toString());
        map.put("disponible",  d.isDisponible());
        map.put("profId",      d.getProfesseur().getId());
        return map;
    }
}
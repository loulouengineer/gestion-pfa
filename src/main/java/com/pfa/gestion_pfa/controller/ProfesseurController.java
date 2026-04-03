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
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/professeurs")
@RequiredArgsConstructor
public class ProfesseurController {

    private final ProfesseurRepository professeurRepository;
    private final DisponibiliteProfRepository disponibiliteProfRepository;

    @GetMapping
    public ResponseEntity<List<Professeur>> getAll() {
        return ResponseEntity.ok(professeurRepository.findAll());
    }

    @GetMapping("/search")
    public ResponseEntity<List<Professeur>> search(@RequestParam String nom) {
        return ResponseEntity.ok(professeurRepository.findByNomContaining(nom));
    }

    /**
     * GET /api/professeurs/{id}/disponibilite?date=2026-04-28
     *
     * Retourne :
     * {
     *   "disponible": true/false,
     *   "plages": [...],
     *   "prochaineDatesDisponibles": [
     *     { "date": "2026-04-29", "plages": [...] },
     *     { "date": "2026-04-30", "plages": [...] }
     *   ]
     * }
     */
    @GetMapping("/{id}/disponibilite")
    public ResponseEntity<Map<String, Object>> checkDisponibilite(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        // Plages pour la date demandée
        List<DisponibiliteProf> plagesDuJour =
                disponibiliteProfRepository.findByProfesseurIdAndDate(id, date);

        List<DisponibiliteProf> plagesDisponibles = plagesDuJour.stream()
                .filter(DisponibiliteProf::isDisponible)
                .collect(Collectors.toList());

        boolean disponible = !plagesDisponibles.isEmpty();

        // Cherche les 3 prochaines dates disponibles dans les 30 jours
        List<Map<String, Object>> prochaines = new ArrayList<>();
        for (int i = 1; i <= 30 && prochaines.size() < 3; i++) {
            LocalDate next = date.plusDays(i);
            List<DisponibiliteProf> nextPlages =
                    disponibiliteProfRepository.findByProfesseurIdAndDate(id, next);
            List<DisponibiliteProf> nextDispo = nextPlages.stream()
                    .filter(DisponibiliteProf::isDisponible)
                    .collect(Collectors.toList());
            if (!nextDispo.isEmpty()) {
                Map<String, Object> entry = new LinkedHashMap<>();
                entry.put("date", next.toString());
                entry.put("plages", nextDispo.stream().map(p -> {
                    Map<String, String> m = new LinkedHashMap<>();
                    m.put("heureDebut", p.getHeureDebut().toString());
                    m.put("heureFin",   p.getHeureFin().toString());
                    return m;
                }).collect(Collectors.toList()));
                prochaines.add(entry);
            }
        }

        // Formater les plages du jour
        List<Map<String, String>> plagesFormatees = plagesDisponibles.stream().map(p -> {
            Map<String, String> m = new LinkedHashMap<>();
            m.put("heureDebut", p.getHeureDebut().toString());
            m.put("heureFin",   p.getHeureFin().toString());
            return m;
        }).collect(Collectors.toList());

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("disponible", disponible);
        response.put("plages", plagesFormatees);
        response.put("prochaineDatesDisponibles", prochaines);

        return ResponseEntity.ok(response);
    }
}
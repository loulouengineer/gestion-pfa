package tn.enicarthage.projetspring.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.enicarthage.projetspring.entity.DisponibiliteProf;
import tn.enicarthage.projetspring.entity.Professeur;
import tn.enicarthage.projetspring.repository.DisponibiliteProfRepository;
import tn.enicarthage.projetspring.repository.ProfesseurRepository;

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

    @GetMapping("/by-email")
    public ResponseEntity<?> getByEmail(@RequestParam String email) {
        return professeurRepository.findByEmail(email)
                .map(p -> ResponseEntity.ok((Object) Map.of("id", p.getId(), "nom", p.getNom(), "departement", p.getDepartement())))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/search")
    public ResponseEntity<List<Professeur>> search(@RequestParam String nom) {
        return ResponseEntity.ok(professeurRepository.findByNomContaining(nom));
    }

    @GetMapping("/{id}/disponibilite")
    public ResponseEntity<Map<String, Object>> checkDisponibilite(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        List<DisponibiliteProf> plagesDuJour =
                disponibiliteProfRepository.findByProfesseurIdAndDate(id, date);

        List<DisponibiliteProf> plagesDisponibles = plagesDuJour.stream()
                .filter(DisponibiliteProf::isDisponible).collect(Collectors.toList());

        boolean disponible = !plagesDisponibles.isEmpty();

        List<Map<String, Object>> prochaines = new ArrayList<>();
        for (int i = 1; i <= 30 && prochaines.size() < 3; i++) {
            LocalDate next = date.plusDays(i);
            List<DisponibiliteProf> nextDispo = disponibiliteProfRepository
                    .findByProfesseurIdAndDate(id, next).stream()
                    .filter(DisponibiliteProf::isDisponible).collect(Collectors.toList());
            if (!nextDispo.isEmpty()) {
                Map<String, Object> entry = new LinkedHashMap<>();
                entry.put("date", next.toString());
                entry.put("plages", nextDispo.stream().map(p -> {
                    Map<String, String> m = new LinkedHashMap<>();
                    m.put("heureDebut", p.getHeureDebut().toString());
                    m.put("heureFin", p.getHeureFin().toString());
                    return m;
                }).collect(Collectors.toList()));
                prochaines.add(entry);
            }
        }

        List<Map<String, String>> plagesFormatees = plagesDisponibles.stream().map(p -> {
            Map<String, String> m = new LinkedHashMap<>();
            m.put("heureDebut", p.getHeureDebut().toString());
            m.put("heureFin", p.getHeureFin().toString());
            return m;
        }).collect(Collectors.toList());

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("disponible", disponible);
        response.put("plages", plagesFormatees);
        response.put("prochaineDatesDisponibles", prochaines);

        return ResponseEntity.ok(response);
    }
}

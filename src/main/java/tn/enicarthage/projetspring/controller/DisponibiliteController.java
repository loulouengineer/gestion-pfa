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
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/disponibilites")
@RequiredArgsConstructor
public class DisponibiliteController {

    private final DisponibiliteProfRepository disponibiliteProfRepository;
    private final ProfesseurRepository professeurRepository;

    @GetMapping("/{profId}")
    public ResponseEntity<List<Map<String, Object>>> getByProf(@PathVariable Long profId) {
        return ResponseEntity.ok(
                disponibiliteProfRepository.findByProfesseurId(profId)
                        .stream().map(this::toMap).collect(Collectors.toList()));
    }

    @GetMapping("/{profId}/semaine")
    public ResponseEntity<Map<String, Object>> getSemaine(
            @PathVariable Long profId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        LocalDate monday = date.minusDays(date.getDayOfWeek().getValue() - 1);

        Map<String, List<Map<String, Object>>> parJour = new LinkedHashMap<>();
        for (int i = 0; i < 7; i++) {
            LocalDate jour = monday.plusDays(i);
            List<DisponibiliteProf> dispos =
                    disponibiliteProfRepository.findByProfesseurIdAndDate(profId, jour);
            parJour.put(jour.toString(),
                    dispos.stream().map(this::toMap).collect(Collectors.toList()));
        }

        return ResponseEntity.ok(Map.of("lundi", monday.toString(), "jours", parJour));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> ajouter(@RequestBody Map<String, Object> body) {
        System.out.println("[DISPO] POST body: " + body);
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

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimer(@PathVariable Long id) {
        disponibiliteProfRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> modifier(@PathVariable Long id,
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
        map.put("id", d.getId());
        map.put("date", d.getDate() != null ? d.getDate().toString() : null);
        map.put("heureDebut", d.getHeureDebut().toString());
        map.put("heureFin", d.getHeureFin().toString());
        map.put("disponible", d.isDisponible());
        map.put("profId", d.getProfesseur().getId());
        return map;
    }
}

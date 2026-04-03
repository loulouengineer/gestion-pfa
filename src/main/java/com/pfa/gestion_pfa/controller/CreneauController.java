package com.pfa.gestion_pfa.controller;

import com.pfa.gestion_pfa.model.Creneau;
import com.pfa.gestion_pfa.model.DisponibiliteProf;
import com.pfa.gestion_pfa.repository.CreneauRepository;
import com.pfa.gestion_pfa.service.SoutenanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class CreneauController {

    private final SoutenanceService soutenanceService;
    private final CreneauRepository creneauRepository;

    // GET /api/creneaux — retourne TOUS les créneaux
    @GetMapping("/api/creneaux")
    public ResponseEntity<List<Creneau>> getTousLesCreneaux() {
        return ResponseEntity.ok(creneauRepository.findAll());
    }

    // POST /api/creneaux
    @PostMapping("/api/creneaux")
    public ResponseEntity<Creneau> creerCreneau(@RequestBody Creneau creneau) {
        return ResponseEntity.ok(soutenanceService.ajouterCreneau(creneau));
    }

    // GET /api/disponibilites/{profId}
    @GetMapping("/api/disponibilites/{profId}")
    public ResponseEntity<List<DisponibiliteProf>> getDisponibilites(@PathVariable Long profId) {
        return ResponseEntity.ok(soutenanceService.getDisponibilites(profId));
    }

    // POST /api/disponibilites
    @PostMapping("/api/disponibilites")
    public ResponseEntity<DisponibiliteProf> enregistrerDisponibilite(
            @RequestBody DisponibiliteProf disponibilite) {
        return ResponseEntity.ok(soutenanceService.enregistrerDisponibilite(disponibilite));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleError(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(Map.of("erreur", ex.getMessage()));
    }
}
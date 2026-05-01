package com.pfa.gestion_pfa.controller;

import com.pfa.gestion_pfa.model.Binome;
import com.pfa.gestion_pfa.service.BinomeService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Contrôleur REST — Formation et consultation des binômes.
 * Contribution de Chaima.
 * Base URL : /api/binomes
 */
@RestController
@RequestMapping("/api/binomes")
@RequiredArgsConstructor
public class BinomeController {

    private final BinomeService binomeService;

    /**
     * POST /api/binomes
     * Body: { etudiant1Id, etudiant2Id }
     * Former un binôme entre deux étudiants.
     */
    @PostMapping
    public ResponseEntity<?> formerBinome(@RequestBody BinomeRequest request) {
        try {
            return ResponseEntity.ok(binomeService.formerBinome(request.getEtudiant1Id(), request.getEtudiant2Id()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("erreur", e.getMessage()));
        }
    }

    /**
     * GET /api/binomes/etudiant/{etudiantId}
     * Trouver le binôme d'un étudiant.
     */
    @GetMapping("/etudiant/{etudiantId}")
    public ResponseEntity<?> getBinomeParEtudiant(@PathVariable Long etudiantId) {
        return binomeService.getBinomeParEtudiant(etudiantId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * GET /api/binomes/{id}
     * Trouver un binôme par son identifiant.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Binome> getBinomeById(@PathVariable Long id) {
        return ResponseEntity.ok(binomeService.getBinomeById(id));
    }

    /**
     * GET /api/binomes
     * Tous les binômes triés par moyenne décroissante.
     */
    @GetMapping
    public ResponseEntity<List<Binome>> getTousBinomes() {
        return ResponseEntity.ok(binomeService.getTousBinomesTriesParMoyenne());
    }

    @Data
    public static class BinomeRequest {
        private Long etudiant1Id;
        private Long etudiant2Id;
    }
}

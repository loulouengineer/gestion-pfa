package com.pfa.gestion_pfa.controller;

import com.pfa.gestion_pfa.model.ChoixSujet;
import com.pfa.gestion_pfa.service.ChoixSujetService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Contrôleur REST — Voeux de sujets des binômes.
 * Contribution de Chaima.
 * Base URL : /api/choix
 */
@RestController
@RequestMapping("/api/choix")
@RequiredArgsConstructor
public class ChoixSujetController {

    private final ChoixSujetService choixSujetService;

    /**
     * POST /api/choix
     * Body: { binomeId, sujetIds: [id1, id2, ...] }
     * Soumet la liste ordonnée des voeux d'un binôme (remplace les précédents).
     */
    @PostMapping
    public ResponseEntity<?> soumettreChoix(@RequestBody ChoixRequest request) {
        try {
            return ResponseEntity.ok(
                    choixSujetService.soumettreChoix(request.getBinomeId(), request.getSujetIds())
            );
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("erreur", e.getMessage()));
        }
    }

    /**
     * GET /api/choix/binome/{binomeId}
     * Consulter les voeux actuels d'un binôme, triés par ordre de préférence.
     */
    @GetMapping("/binome/{binomeId}")
    public ResponseEntity<List<ChoixSujet>> getChoixParBinome(@PathVariable Long binomeId) {
        return ResponseEntity.ok(choixSujetService.getChoixParBinome(binomeId));
    }

    /**
     * DELETE /api/choix/binome/{binomeId}
     * Réinitialiser tous les voeux d'un binôme.
     */
    @DeleteMapping("/binome/{binomeId}")
    public ResponseEntity<Void> reinitialiserChoix(@PathVariable Long binomeId) {
        choixSujetService.reinitialiserChoix(binomeId);
        return ResponseEntity.noContent().build();
    }

    @Data
    public static class ChoixRequest {
        private Long binomeId;
        private List<Long> sujetIds;
    }
}

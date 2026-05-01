package com.pfa.gestion_pfa.controller;

import com.pfa.gestion_pfa.dto.RecommandationDTO;
import com.pfa.gestion_pfa.service.RecommandationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * GET /api/etudiants/recommandations?etudiantId={id}
 * Retourne les 5 sujets les plus compatibles pour un étudiant donné,
 * enrichis d'une analyse IA Ollama.
 */
@RestController
@RequestMapping("/api/etudiants")
@RequiredArgsConstructor
public class RecommandationController {

    private final RecommandationService recommandationService;

    @GetMapping("/recommandations")
    public ResponseEntity<List<RecommandationDTO>> getRecommandations(@RequestParam Long etudiantId) {
        return ResponseEntity.ok(recommandationService.getRecommandations(etudiantId));
    }
}

package com.pfa.gestion_pfa.controller;

import com.pfa.gestion_pfa.model.Sujet;
import com.pfa.gestion_pfa.service.RecommandationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/recommandation")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class RecommandationController {

    private final RecommandationService recommandationService;

    // Retourne les 5 sujets recommandés pour un étudiant donné
    @GetMapping("/{etudiantId}")
    @PreAuthorize("hasRole('ETUDIANT')")
    public ResponseEntity<List<Sujet>> recommander(@PathVariable Long etudiantId) {
        return ResponseEntity.ok(recommandationService.recommander(etudiantId));
    }
}
package tn.enicarthage.projetspring.controller;

import tn.enicarthage.projetspring.dto.RecommandationDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import tn.enicarthage.projetspring.service.RecommandationService;

import java.util.List;

@RestController
@RequestMapping("/api/recommandation-ia")  // ← URL différente
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class RecommandationController {

    private final RecommandationService recommandationIAService;

    @GetMapping("/{etudiantId}")
    @PreAuthorize("hasRole('ETUDIANT')")
    public ResponseEntity<List<RecommandationDTO>> recommander(@PathVariable Long etudiantId) {
        return ResponseEntity.ok(recommandationIAService.recommander(etudiantId));
    }
}
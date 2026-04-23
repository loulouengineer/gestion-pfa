package tn.enicarthage.projetspring.controller;

import tn.enicarthage.projetspring.entity.ChoixSujet;
import tn.enicarthage.projetspring.service.ChoixSujetService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/choix")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class ChoixSujetController {

    private final ChoixSujetService choixSujetService;

    // Étudiant soumet ses choix ordonnés (remplace les précédents)
    @PostMapping
    @PreAuthorize("hasRole('ETUDIANT')")
    public ResponseEntity<List<ChoixSujet>> soumettreChoix(@RequestBody ChoixRequest request) {
        return ResponseEntity.ok(
                choixSujetService.soumettreChoix(request.getBinomeId(), request.getSujetIds())
        );
    }

    // Étudiant consulte ses choix actuels
    @GetMapping("/binome/{binomeId}")
    @Transactional
    public ResponseEntity<?> getChoixParBinome(@PathVariable Long binomeId) {
        return ResponseEntity.ok(choixSujetService.getChoixParBinome(binomeId));
    }



    // DTO interne
    @Data
    public static class ChoixRequest {
        private Long binomeId;
        private List<Long> sujetIds; // ordre index 0 = choix 1, index 1 = choix 2 …
    }
}
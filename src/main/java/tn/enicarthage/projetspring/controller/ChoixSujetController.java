package tn.enicarthage.projetspring.controller;

import tn.enicarthage.projetspring.entity.ChoixSujet;
import tn.enicarthage.projetspring.service.ChoixSujetService;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/choix")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class ChoixSujetController {

    private final ChoixSujetService choixSujetService;

    @PostMapping
    @Transactional // ✅ garde la session ouverte pendant la sérialisation
    public ResponseEntity<List<ChoixSujetDTO>> soumettreChoix(@RequestBody ChoixRequest request) {
        List<ChoixSujet> choix = choixSujetService.soumettreChoix(
                request.getBinomeId(),
                request.getSujetIds()
        );
        List<ChoixSujetDTO> result = choix.stream().map(c -> new ChoixSujetDTO(
                c.getId(),
                c.getOrdre(),
                c.getSujet().getId(),
                c.getSujet().getTitre(),
                c.getSujet().getDifficulte()
        )).toList();
        return ResponseEntity.ok(result);
    }

    @GetMapping("/binome/{binomeId}")
    @Transactional
    public ResponseEntity<?> getChoixParBinome(@PathVariable Long binomeId) {
        return ResponseEntity.ok(choixSujetService.getChoixParBinome(binomeId));
    }

    // DTO réponse
    @Data
    @AllArgsConstructor
    public static class ChoixSujetDTO {
        private Long id;
        private int ordre;
        private Long sujetId;
        private String titre;
        private String difficulte;

        public ChoixSujetDTO(Long id, int ordre, Long id1, String titre, int difficulte) {

        }
    }

    // DTO requête
    @Data
    public static class ChoixRequest {
        private Long binomeId;
        private List<Long> sujetIds;
    }
}
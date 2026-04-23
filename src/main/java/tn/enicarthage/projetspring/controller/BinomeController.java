package tn.enicarthage.projetspring.controller;

import tn.enicarthage.projetspring.entity.Binome;
import tn.enicarthage.projetspring.service.BinomeService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/binomes")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BinomeController {

    private final BinomeService binomeService;

    @PostMapping
    public ResponseEntity<Binome> formerBinome(@RequestBody BinomeRequest request) {
        return ResponseEntity.ok(
                binomeService.formerBinome(request.getEtudiant1Id(), request.getEtudiant2Id())
        );
    }

    @GetMapping("/etudiant/{etudiantId}")
    @Transactional
    public ResponseEntity<?> getBinomeParEtudiant(@PathVariable Long etudiantId) {
        return binomeService.getBinomeParEtudiant(etudiantId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Binome> getBinomeById(@PathVariable Long id) {
        return ResponseEntity.ok(binomeService.getBinomeById(id));
    }

    @Data
    public static class BinomeRequest {
        private Long etudiant1Id;
        private Long etudiant2Id;
    }
}
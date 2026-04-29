package tn.enicarthage.projetspring.controller;

import tn.enicarthage.projetspring.dto.BinomeDTO;
import tn.enicarthage.projetspring.service.BinomeService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/binomes")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BinomeController {

    private final BinomeService binomeService;

    @PostMapping
    public ResponseEntity<BinomeDTO> formerBinome(@RequestBody BinomeRequest request) {
        BinomeDTO dto = binomeService.formerBinomeDTO(
                request.getEtudiant1Id(),
                request.getEtudiant2Id()
        );
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/etudiant/{etudiantId}")
    @Transactional
    public ResponseEntity<BinomeDTO> getBinomeParEtudiant(@PathVariable Long etudiantId) {
        return binomeService.getBinomeParEtudiant(etudiantId)
                .map(binome -> BinomeDTO.from(binome, etudiantId))
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BinomeDTO> getBinomeById(
            @PathVariable Long id,
            @RequestParam Long etudiantId) {
        BinomeDTO dto = BinomeDTO.from(binomeService.getBinomeById(id), etudiantId);
        return ResponseEntity.ok(dto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> dissoudreBinome(@PathVariable Long id) {
        binomeService.supprimerBinome(id);
        return ResponseEntity.noContent().build();
    }

    // Dans BinomeController.java — ajoutez cette méthode
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntimeException(RuntimeException ex) {
        return ResponseEntity
                .badRequest()
                .body(Map.of("message", ex.getMessage()));
    }

    @Data
    public static class BinomeRequest {
        private Long etudiant1Id;
        private Long etudiant2Id;
    }
}
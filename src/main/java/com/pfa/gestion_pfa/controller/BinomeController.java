package com.pfa.gestion_pfa.controller;

import com.pfa.gestion_pfa.model.Binome;
import com.pfa.gestion_pfa.service.BinomeService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/binomes")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class BinomeController {

    private final BinomeService binomeService;

    // Former un binôme (etudiant2Id peut être null → solo)
    @PostMapping
    @PreAuthorize("hasRole('ETUDIANT')")
    public ResponseEntity<Binome> formerBinome(@RequestBody BinomeRequest request) {
        return ResponseEntity.ok(
                binomeService.formerBinome(request.getEtudiant1Id(), request.getEtudiant2Id())
        );
    }

    // Voir le binôme d'un étudiant
    @GetMapping("/etudiant/{etudiantId}")
    @Transactional
    @PreAuthorize("hasAnyRole('ETUDIANT','CHEF_DEPARTEMENT')")
    public ResponseEntity<?> getBinomeParEtudiant(@PathVariable Long etudiantId) {
        return binomeService.getBinomeParEtudiant(etudiantId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Voir un binôme par son id
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ETUDIANT','CHEF_DEPARTEMENT')")
    public ResponseEntity<Binome> getBinomeById(@PathVariable Long id) {
        return ResponseEntity.ok(binomeService.getBinomeById(id));
    }

    // DTO interne
    @Data
    public static class BinomeRequest {
        private Long etudiant1Id;
        private Long etudiant2Id; // null si travail solo
    }
}

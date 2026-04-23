package tn.enicarthage.projetspring.controller;


import tn.enicarthage.projetspring.service.MoteurAffectationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import tn.enicarthage.projetspring.entity.Affectation;


import java.util.List;

@RestController
@RequestMapping("/api/affectations")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class AffectationController {

    private final MoteurAffectationService moteurAffectationService;

    // Chef département — lancer l'algorithme d'affectation
    @PostMapping("/lancer")
    @PreAuthorize("hasRole('CHEF_DEPARTEMENT')")
    public ResponseEntity<List<Affectation>> lancerAffectation() {
        return ResponseEntity.ok(moteurAffectationService.affecterSujets());
    }

    // Tous les rôles — consulter les résultats
    @GetMapping
    @PreAuthorize("hasAnyRole('ETUDIANT','PROFESSEUR','CHEF_DEPARTEMENT')")
    public ResponseEntity<List<Affectation>> getToutesAffectations() {
        return ResponseEntity.ok(moteurAffectationService.getToutesAffectations());
    }

    // Résultat d'un binôme précis
    @GetMapping("/binome/{binomeId}")
    @PreAuthorize("hasAnyRole('ETUDIANT','PROFESSEUR','CHEF_DEPARTEMENT')")
    public ResponseEntity<?> getAffectationParBinome(@PathVariable Long binomeId) {
        return moteurAffectationService.getAffectationParBinome(binomeId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
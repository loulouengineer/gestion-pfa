package tn.enicarthage.projetspring.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.enicarthage.projetspring.entity.Affectation;
import tn.enicarthage.projetspring.entity.StatutAffectation;
import tn.enicarthage.projetspring.repository.AffectationRepository;
import tn.enicarthage.projetspring.repository.SujetRepository;
import tn.enicarthage.projetspring.service.MoteurAffectationService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/affectations")
@RequiredArgsConstructor
public class AffectationController {

    private final MoteurAffectationService moteurAffectationService;
    private final AffectationRepository affectationRepository;
    private final SujetRepository sujetRepository;

    @PostMapping("/lancer")
    public ResponseEntity<List<Affectation>> lancerAffectation() {
        return ResponseEntity.ok(moteurAffectationService.affecterSujets());
    }

    @GetMapping
    public ResponseEntity<List<Affectation>> getToutesAffectations() {
        return ResponseEntity.ok(moteurAffectationService.getToutesAffectations());
    }

    @GetMapping("/binome/{binomeId}")
    public ResponseEntity<?> getAffectationParBinome(@PathVariable Long binomeId) {
        return moteurAffectationService.getAffectationParBinome(binomeId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/valider")
    public ResponseEntity<?> valider(@PathVariable Long id) {
        Affectation a = affectationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Affectation introuvable."));
        a.valider();
        return ResponseEntity.ok(affectationRepository.save(a));
    }

    @PutMapping("/{id}/refuser")
    public ResponseEntity<?> refuser(@PathVariable Long id,
                                      @RequestBody(required = false) Map<String, String> body) {
        Affectation a = affectationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Affectation introuvable."));
        String commentaire = body != null ? body.getOrDefault("commentaire", "") : "";
        a.refuser(commentaire);
        return ResponseEntity.ok(affectationRepository.save(a));
    }

    @GetMapping("/statut/{statut}")
    public ResponseEntity<List<Affectation>> getByStatut(@PathVariable String statut) {
        return ResponseEntity.ok(affectationRepository.findByStatut(StatutAffectation.valueOf(statut)));
    }
}

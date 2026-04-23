package tn.enicarthage.projetspring.controller;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import tn.enicarthage.projetspring.dto.SujetRequest;
import tn.enicarthage.projetspring.entity.Sujet;
import tn.enicarthage.projetspring.service.SujetService;

import java.util.List;

@RestController
@RequestMapping("/api/sujets")
public class SujetController {

    @Autowired
    private SujetService sujetService;

    // pOST /api/sujets — Enseignant propose un sujet
    @PostMapping
    public ResponseEntity<Sujet> creerSujet(
            @RequestBody SujetRequest request,
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(sujetService.creerSujet(request, email));
    }

    // gET /api/sujets/mes_sujets — Enseignant voit ses sujets
    @GetMapping("/mes-sujets")
    public ResponseEntity<List<Sujet>> getMesSujets(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(sujetService.getMesSujets(email));
    }

    // Ajoute cette méthode dans SujetController.java
    @GetMapping("/disponibles")
    public ResponseEntity<List<Sujet>> getSujetsDisponibles() {
        return ResponseEntity.ok(sujetService.getSujetsDisponibles());
    }

    // DELETE /api/sujets/{id} — Enseignant supprime son sujet
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimerSujet(
            @PathVariable Long id,
            Authentication authentication) {
        String email = authentication.getName();
        sujetService.supprimerSujet(id, email);
        return ResponseEntity.noContent().build();
    }

    // GET /api/sujets — Chef voit tous les sujets
    @GetMapping
    public ResponseEntity<List<Sujet>> getTousSujets() {
        return ResponseEntity.ok(sujetService.getTousSujets());
    }

    // PATCH /api/sujets/{id}/statut — Chef approuve ou refuse
    @PatchMapping("/{id}/statut")
    public ResponseEntity<Sujet> changerStatut(
            @PathVariable Long id,
            @RequestParam String statut) {
        return ResponseEntity.ok(sujetService.changerStatut(id, statut));
    }
}
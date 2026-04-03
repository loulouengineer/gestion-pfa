package com.pfa.gestion_pfa.controller;

import com.pfa.gestion_pfa.model.Affectation;
import com.pfa.gestion_pfa.model.Sujet;
import com.pfa.gestion_pfa.service.AffectationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Contrôleur REST — Phase 1 : Validation finale des sujets.
 *
 * Endpoints réservés au rôle ADMIN.
 * Base URL : /api/affectations
 */
@RestController
@RequestMapping("/api/affectations")
@RequiredArgsConstructor
public class AffectationController {

    private final AffectationService affectationService;

    // ──────────────────────────────────────────────────────
    // GET — Lecture
    // ──────────────────────────────────────────────────────

    /**
     * GET /api/affectations
     * Retourne toutes les affectations.
     * Accessible : ADMIN
     */
    @GetMapping

    public ResponseEntity<List<Affectation>> getAll() {
        return ResponseEntity.ok(affectationService.findAll());
    }

    /**
     * GET /api/affectations/{id}
     * Retourne une affectation par son id.
     */
    @GetMapping("/{id}")

    public ResponseEntity<Affectation> getById(@PathVariable Long id) {
        return ResponseEntity.ok(affectationService.findById(id));
    }

    /**
     * GET /api/affectations/en-attente
     * Retourne les affectations en attente de validation.
     */
    @GetMapping("/en-attente")

    public ResponseEntity<List<Affectation>> getEnAttente() {
        return ResponseEntity.ok(affectationService.findEnAttente());
    }

    /**
     * GET /api/affectations/validees
     * Retourne les affectations validées (verrouillées).
     */
    @GetMapping("/validees")

    public ResponseEntity<List<Affectation>> getValidees() {
        return ResponseEntity.ok(affectationService.findValidees());
    }

    /**
     * GET /api/affectations/refusees
     * Retourne les affectations refusées.
     */
    @GetMapping("/refusees")

    public ResponseEntity<List<Affectation>> getRefusees() {
        return ResponseEntity.ok(affectationService.findRefusees());
    }

    // ──────────────────────────────────────────────────────
    // PUT / PATCH — Actions admin
    // ──────────────────────────────────────────────────────

    /**
     * PUT /api/affectations/{id}/valider
     * Valide et verrouille une affectation.
     *
     * Body : aucun
     * Retour : l'affectation mise à jour (statut VALIDEE, verrouillee=true)
     */
    @PutMapping("/{id}/valider")

    public ResponseEntity<Affectation> valider(@PathVariable Long id) {
        return ResponseEntity.ok(affectationService.valider(id));
    }

    /**
     * PUT /api/affectations/{id}/refuser
     * Refuse une affectation avec un commentaire obligatoire.
     *
     * Body : { "commentaire": "Raison du refus" }
     */
    @PutMapping("/{id}/refuser")

    public ResponseEntity<Affectation> refuser(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String commentaire = body.get("commentaire");
        return ResponseEntity.ok(affectationService.refuser(id, commentaire));
    }

    /**
     * PUT /api/affectations/{id}/modifier
     * Modifie le sujet d'une affectation avant validation.
     *
     * Body : { "sujetId": 5, "commentaire": "Changement d'encadrant" }
     */
    @PutMapping("/{id}/modifier")

    public ResponseEntity<Affectation> modifier(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        Long sujetId = Long.valueOf(body.get("sujetId").toString());
        String commentaire = (String) body.get("commentaire");

        Sujet nouveauSujet = new Sujet();
        nouveauSujet.setId(sujetId);

        return ResponseEntity.ok(affectationService.modifier(id, nouveauSujet, commentaire));
    }

    /**
     * PUT /api/affectations/valider-toutes
     * Valide en masse toutes les affectations EN_ATTENTE.
     *
     * Retour : { "validees": 12 }
     */
    @PutMapping("/valider-toutes")

    public ResponseEntity<Map<String, Integer>> validerToutes() {
        int count = affectationService.validerToutes();
        return ResponseEntity.ok(Map.of("validees", count));
    }

    // ──────────────────────────────────────────────────────
    // Gestion des erreurs métier
    // ──────────────────────────────────────────────────────

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, String>> handleIllegalState(IllegalStateException ex) {
        return ResponseEntity.badRequest().body(Map.of("erreur", ex.getMessage()));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArg(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(Map.of("erreur", ex.getMessage()));
    }
}
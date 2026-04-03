package com.pfa.gestion_pfa.controller;

import com.pfa.gestion_pfa.model.Professeur;
import com.pfa.gestion_pfa.model.Soutenance;
import com.pfa.gestion_pfa.service.SoutenanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Contrôleur REST — Phase 3 & 4 : Planification et planning final.
 *
 * Base URL : /api/soutenances
 */
@RestController
@RequestMapping("/api/soutenances")
@RequiredArgsConstructor
public class SoutenanceController {

    private final SoutenanceService soutenanceService;

    // ══════════════════════════════════════════════════════
    // PHASE 3 — Planification
    // ══════════════════════════════════════════════════════

    /**
     * POST /api/soutenances/planifier
     * Planifie une soutenance manuellement.
     *
     * Body :
     * {
     *   "affectationId": 1,
     *   "creneauId": 5,
     *   "juryIds": [2, 4, 7]
     * }
     *
     * Vérifie avant planification :
     *  - créneau disponible
     *  - pas de conflit de salle
     *  - pas de conflit de jury
     *  - disponibilités des profs respectées
     *  - encadrant dans le jury
     */
    @PostMapping("/planifier")
    public ResponseEntity<Soutenance> planifier(@RequestBody Map<String, Object> body) {
        Long affectationId = Long.valueOf(body.get("affectationId").toString());
        Long creneauId = Long.valueOf(body.get("creneauId").toString());

        @SuppressWarnings("unchecked")
        List<Integer> juryIds = (List<Integer>) body.get("juryIds");

        List<Professeur> jury = juryIds.stream().map(id -> {
            Professeur p = new Professeur();
            p.setId(Long.valueOf(id));
            return p;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(soutenanceService.planifier(affectationId, creneauId, jury));
    }

    /**
     * POST /api/soutenances/planifier-auto
     * Lance la planification automatique de toutes les soutenances.
     * Assigne chaque binôme validé au premier créneau sans conflit.
     *
     * Retour : liste des soutenances planifiées
     */
    @PostMapping("/planifier-auto")
    public ResponseEntity<List<Soutenance>> planifierAuto() {
        return ResponseEntity.ok(soutenanceService.planifierAutomatiquement());
    }

    // ══════════════════════════════════════════════════════
    // PHASE 4 — Planning final
    // ══════════════════════════════════════════════════════

    /**
     * GET /api/soutenances
     * Retourne le planning complet de toutes les soutenances.
     * Trié par date et heure de début.
     * Accessible : ADMIN, PROFESSEUR, ETUDIANT
     */
    @GetMapping
    public ResponseEntity<List<Soutenance>> getPlanningFinal() {
        return ResponseEntity.ok(soutenanceService.getPlanningFinal());
    }

    /**
     * GET /api/soutenances?date=2026-04-28
     * Retourne les soutenances d'une date précise.
     */
    @GetMapping(params = "date")
    public ResponseEntity<List<Soutenance>> getPlanningParDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(soutenanceService.getPlanningParDate(date));
    }

    /**
     * PUT /api/soutenances/{id}/resultat
     * Enregistre le résultat d'une soutenance après qu'elle a eu lieu.
     * Réservé au jury / admin.
     *
     * Body :
     * {
     *   "note": 14.5,
     *   "observations": "Bon travail, présentation claire.",
     *   "present": true
     * }
     */
    @PutMapping("/{id}/resultat")
    public ResponseEntity<Soutenance> enregistrerResultat(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        float note = Float.parseFloat(body.get("note").toString());
        String observations = (String) body.get("observations");
        boolean present = Boolean.parseBoolean(body.get("present").toString());
        return ResponseEntity.ok(soutenanceService.enregistrerResultat(id, note, observations, present));
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
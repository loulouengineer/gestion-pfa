package com.pfa.gestion_pfa.controller;

import com.pfa.gestion_pfa.model.Sujet;
import com.pfa.gestion_pfa.model.Professeur;
import com.pfa.gestion_pfa.repository.SujetRepository;
import com.pfa.gestion_pfa.repository.ProfesseurRepository;
import com.pfa.gestion_pfa.repository.ChoixSujetRepository;
import com.pfa.gestion_pfa.repository.AffectationRepository;
import com.pfa.gestion_pfa.model.ChoixSujet;
import com.pfa.gestion_pfa.model.Affectation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/sujets")
@RequiredArgsConstructor
public class SujetController {

    private final SujetRepository       sujetRepository;
    private final ProfesseurRepository  professeurRepository;
    private final ChoixSujetRepository  choixSujetRepository;
    private final AffectationRepository affectationRepository;

    /** GET /api/sujets */
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAll() {
        return ResponseEntity.ok(
                sujetRepository.findAll().stream().map(this::toMap).collect(Collectors.toList())
        );
    }

    /** GET /api/sujets/encadrant/{profId} */
    @GetMapping("/encadrant/{profId}")
    public ResponseEntity<List<Map<String, Object>>> getByEncadrant(@PathVariable Long profId) {
        return ResponseEntity.ok(
                sujetRepository.findByEncadrantId(profId).stream().map(this::toMap).collect(Collectors.toList())
        );
    }

    /**
     * GET /api/sujets/demandes
     * Tous les choix de sujets avec le statut d'affectation du binôme
     */
    @GetMapping("/demandes")
    public ResponseEntity<List<Map<String, Object>>> getDemandes() {
        List<ChoixSujet> choix = choixSujetRepository.findAll();
        List<Map<String, Object>> result = choix.stream().map(c -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id",    c.getId());
            map.put("ordre", c.getOrdre());

            if (c.getBinome() != null) {
                map.put("binome", Map.of(
                        "id",       c.getBinome().getId(),
                        "etudiant1", c.getBinome().getEtudiant1().getNom(),
                        "etudiant2", c.getBinome().getEtudiant2().getNom(),
                        "moyenne",   (double) c.getBinome().getMoyenneBinome()
                ));
            }

            if (c.getSujet() != null) {
                map.put("sujet", Map.of(
                        "id",         c.getSujet().getId(),
                        "titre",      c.getSujet().getTitre(),
                        "difficulte", c.getSujet().getDifficulte(),
                        "disponible", c.getSujet().isDisponible(),
                        "encadrant",  c.getSujet().getEncadrant() != null
                                ? c.getSujet().getEncadrant().getNom() : ""
                ));
            }

            // Statut affectation via AffectationRepository
            String statut = "EN_ATTENTE";
            Long affectationId = null;
            if (c.getBinome() != null) {
                java.util.Optional<Affectation> aff = affectationRepository
                        .findByBinomeId(c.getBinome().getId());
                if (aff.isPresent()) {
                    statut = aff.get().getStatut().name();
                    affectationId = aff.get().getId();
                }
            }
            map.put("statut", statut);
            map.put("affectationId", affectationId);
            return map;
        }).sorted((a, b) -> {
            String sa = (String) a.get("statut");
            String sb = (String) b.get("statut");
            if ("EN_ATTENTE".equals(sa) && !"EN_ATTENTE".equals(sb)) return -1;
            if (!"EN_ATTENTE".equals(sa) && "EN_ATTENTE".equals(sb)) return 1;
            return 0;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    private Map<String, Object> toMap(Sujet s) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id",          s.getId());
        map.put("titre",       s.getTitre());
        map.put("description", s.getDescription() != null ? s.getDescription() : "");
        map.put("difficulte",  s.getDifficulte());
        map.put("disponible",  s.isDisponible());
        if (s.getEncadrant() != null) {
            map.put("encadrant", Map.of(
                    "id",  s.getEncadrant().getId(),
                    "nom", s.getEncadrant().getNom()
            ));
        }
        return map;
    }
}
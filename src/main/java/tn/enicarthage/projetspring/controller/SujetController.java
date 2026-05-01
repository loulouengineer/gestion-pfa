package tn.enicarthage.projetspring.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import tn.enicarthage.projetspring.dto.SujetDTO;
import tn.enicarthage.projetspring.dto.SujetRequest;
import tn.enicarthage.projetspring.service.SujetService;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/sujets")
public class SujetController {

    @Autowired
    private SujetService sujetService;

    @PostMapping
    public ResponseEntity<SujetDTO> creerSujet(
            @RequestBody SujetRequest request,
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(SujetDTO.from(sujetService.creerSujet(request, email)));
    }

    @GetMapping("/mes-sujets")
    public ResponseEntity<List<SujetDTO>> getMesSujets(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(
                sujetService.getMesSujets(email).stream()
                        .map(SujetDTO::from)
                        .collect(Collectors.toList())
        );
    }

    @GetMapping("/disponibles")
    public ResponseEntity<List<SujetDTO>> getSujetsDisponibles() {
        return ResponseEntity.ok(
                sujetService.getSujetsDisponibles().stream()
                        .map(SujetDTO::from)
                        .collect(Collectors.toList())
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimerSujet(
            @PathVariable Long id,
            Authentication authentication) {
        String email = authentication.getName();
        sujetService.supprimerSujet(id, email);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<SujetDTO>> getTousSujets() {
        return ResponseEntity.ok(
                sujetService.getTousSujets().stream()
                        .map(SujetDTO::from)
                        .collect(Collectors.toList())
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<SujetDTO> modifierSujet(
            @PathVariable Long id,
            @RequestBody SujetRequest request,
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(SujetDTO.from(sujetService.modifierSujet(id, request, email)));
    }

    @GetMapping("/encadrant/{profId}")
    public ResponseEntity<List<SujetDTO>> getSujetsByEncadrant(@PathVariable Long profId) {
        return ResponseEntity.ok(
                sujetService.getSujetsByEncadrantId(profId).stream()
                        .map(SujetDTO::from)
                        .collect(Collectors.toList())
        );
    }

    @PatchMapping("/{id}/statut")
    public ResponseEntity<SujetDTO> changerStatut(
            @PathVariable Long id,
            @RequestParam String statut) {
        return ResponseEntity.ok(SujetDTO.from(sujetService.changerStatut(id, statut)));
    }
}
package com.pfa.gestion_pfa.controller;

import com.pfa.gestion_pfa.model.Sujet;
import com.pfa.gestion_pfa.service.SujetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/sujets")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class SujetController {

    private final SujetService sujetService;

    // Étudiant — liste des sujets disponibles et confirmés
    @GetMapping("/disponibles")
    @PreAuthorize("hasAnyRole('ETUDIANT','PROFESSEUR','CHEF_DEPARTEMENT')")
    public ResponseEntity<List<Sujet>> getSujetsDisponibles() {
        return ResponseEntity.ok(sujetService.getSujetsDisponibles());
    }

    // Professeur — créer un sujet
    @PostMapping
    @PreAuthorize("hasRole('PROFESSEUR')")
    public ResponseEntity<Sujet> creerSujet(@RequestBody Sujet sujet) {
        return ResponseEntity.ok(sujetService.creerSujet(sujet));
    }

    // Chef département — confirmer un sujet (le rend visible aux étudiants)
    @PutMapping("/{id}/confirmer")
    @PreAuthorize("hasRole('CHEF_DEPARTEMENT')")
    public ResponseEntity<Sujet> confirmerSujet(@PathVariable Long id) {
        return ResponseEntity.ok(sujetService.confirmerSujet(id));
    }

    // Chef département — tous les sujets confirmés
    @GetMapping("/confirmes")
    @PreAuthorize("hasRole('CHEF_DEPARTEMENT')")
    public ResponseEntity<List<Sujet>> getSujetsConfirmes() {
        return ResponseEntity.ok(sujetService.getTousSujetsConfirmes());
    }

    // Professeur — ses propres sujets
    @GetMapping("/professeur/{professeurId}")
    @PreAuthorize("hasAnyRole('PROFESSEUR','CHEF_DEPARTEMENT')")
    public ResponseEntity<List<Sujet>> getSujetsParProfesseur(@PathVariable Long professeurId) {
        return ResponseEntity.ok(sujetService.getSujetsParProfesseur(professeurId));
    }

    // Détail d'un sujet
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ETUDIANT','PROFESSEUR','CHEF_DEPARTEMENT')")
    public ResponseEntity<Sujet> getSujetById(@PathVariable Long id) {
        return ResponseEntity.ok(sujetService.getSujetById(id));
    }
}
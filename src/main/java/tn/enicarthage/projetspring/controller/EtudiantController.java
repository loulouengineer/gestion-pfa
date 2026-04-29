package tn.enicarthage.projetspring.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import tn.enicarthage.projetspring.dto.EtudiantRequest;
import tn.enicarthage.projetspring.dto.RecommandationDTO;
import tn.enicarthage.projetspring.entity.Etudiant;
import tn.enicarthage.projetspring.service.EtudiantService;

import java.util.List;

@RestController
@RequestMapping("/api/etudiants")
public class EtudiantController {

    @Autowired
    private EtudiantService etudiantService;

    @PostMapping("/inscrire")
    public ResponseEntity<Etudiant> inscrire(
            @RequestBody EtudiantRequest request) {
        return ResponseEntity.ok(etudiantService.inscrire(request));
    }

    @GetMapping("/recherche")
    public ResponseEntity<List<Etudiant>> rechercher(@RequestParam String q) {
        return ResponseEntity.ok(etudiantService.rechercher(q));
    }

    @GetMapping("/recommandations")
    public ResponseEntity<List<RecommandationDTO>> getRecommandations(
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(etudiantService.getRecommandations(email));
    }
}
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



    @GetMapping("/recommandations")
    public ResponseEntity<List<RecommandationDTO>> getRecommandations(
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(etudiantService.getRecommandations(email));
    }

    @GetMapping("/profil")
    public ResponseEntity<?> getProfil(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(etudiantService.getProfil(email));
    }

    @PutMapping("/profil")
    public ResponseEntity<?> updateProfil(
            Authentication authentication,
            @RequestBody EtudiantRequest request) {
        String email = authentication.getName();
        return ResponseEntity.ok(etudiantService.updateProfil(email, request));
    }
}
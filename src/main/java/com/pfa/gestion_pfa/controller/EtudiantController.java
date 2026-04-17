package com.pfa.gestion_pfa.controller;

import com.pfa.gestion_pfa.Repository.BinomeRepository;
import com.pfa.gestion_pfa.Repository.EtudiantRepository;
import com.pfa.gestion_pfa.model.Etudiant;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/etudiants")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class EtudiantController {

    private final EtudiantRepository etudiantRepository;
    private final BinomeRepository binomeRepository;

    @GetMapping("/recherche")
    @PreAuthorize("hasRole('ETUDIANT')")
    public ResponseEntity<List<Map<String, Object>>> rechercher(@RequestParam String q) {
        if (q == null || q.trim().length() < 2) {
            return ResponseEntity.ok(List.of());
        }

        List<Etudiant> etudiants = etudiantRepository.rechercherEtudiants(q.trim());

        List<Map<String, Object>> result = etudiants.stream().map(e -> {
            // ✅ vérifier si l'étudiant est déjà dans un binôme
            boolean dejaBinome = binomeRepository
                    .findByEtudiant1IdOrEtudiant2Id(e.getId(), e.getId())
                    .isPresent();

            Map<String, Object> map = new java.util.LinkedHashMap<>();
            map.put("id",          e.getId());
            map.put("nom",         e.getNom());
            map.put("matricule",   e.getMatricule());
            map.put("moyenne",     e.getMoyenne());
            map.put("dejaBinome",  dejaBinome);
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }
}
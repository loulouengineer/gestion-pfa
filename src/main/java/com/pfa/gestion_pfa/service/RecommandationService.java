package com.pfa.gestion_pfa.service;

import com.pfa.gestion_pfa.model.Etudiant;
import com.pfa.gestion_pfa.model.Sujet;
import com.pfa.gestion_pfa.Repository.BinomeRepository;
import com.pfa.gestion_pfa.Repository.ChoixSujetRepository;
import com.pfa.gestion_pfa.Repository.EtudiantRepository;
import com.pfa.gestion_pfa.Repository.SujetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecommandationService {

    private final EtudiantRepository etudiantRepository;
    private final SujetRepository sujetRepository;
    private final ChoixSujetRepository choixSujetRepository;
    private final BinomeRepository binomeRepository;

    /**
     * Recommande jusqu'à 5 sujets à un étudiant selon :
     *  1. Sa moyenne → difficulté adaptée (score de proximité)
     *  2. Filtrage collaboratif : sujets choisis par des étudiants à moyenne proche (±2 pts)
     */
    public List<Sujet> recommander(Long etudiantId) {
        Etudiant etudiant = etudiantRepository.findById(etudiantId)
                .orElseThrow(() -> new RuntimeException("Étudiant introuvable : " + etudiantId));

        List<Sujet> sujetsDisponibles = sujetRepository.findByDisponibleTrueAndConfirmeTrue();
        if (sujetsDisponibles.isEmpty()) return Collections.emptyList();

        float moyenne = etudiant.getMoyenne();
        int difficulteCible = calculerDifficulte(moyenne);

        // Sujets choisis par des étudiants similaires (filtrage collaboratif)
        Set<Long> sujetsSimilaires = getSujetsSimilaires(etudiantId, moyenne);

        // Score composite par sujet
        Map<Sujet, Double> scores = new LinkedHashMap<>();
        for (Sujet sujet : sujetsDisponibles) {
            double score = 0;

            // Critère 1 — proximité de difficulté (max 10 pts)
            int ecart = Math.abs(sujet.getDifficulte() - difficulteCible);
            score += (5 - ecart) * 2.0;

            // Critère 2 — bonus collaboratif (3 pts si choisi par des pairs)
            if (sujetsSimilaires.contains(sujet.getId())) score += 3.0;

            scores.put(sujet, score);
        }

        // Top 5 par score décroissant
        return scores.entrySet().stream()
                .sorted(Map.Entry.<Sujet, Double>comparingByValue().reversed())
                .limit(5)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
    }

    // Moyenne → difficulté cible (1–5)
    private int calculerDifficulte(float moyenne) {
        if (moyenne >= 16) return 5;
        if (moyenne >= 14) return 4;
        if (moyenne >= 12) return 3;
        if (moyenne >= 10) return 2;
        return 1;
    }

    // Retourne les IDs des sujets choisis par des étudiants à moyenne proche
    private Set<Long> getSujetsSimilaires(Long etudiantId, float moyenne) {
        final float ECART_MAX = 2.0f;

        List<Etudiant> similaires = etudiantRepository.findAll().stream()
                .filter(e -> !e.getId().equals(etudiantId))
                .filter(e -> Math.abs(e.getMoyenne() - moyenne) <= ECART_MAX)
                .collect(Collectors.toList());

        Set<Long> sujetIds = new HashSet<>();
        for (Etudiant e : similaires) {
            binomeRepository.findByEtudiant1IdOrEtudiant2Id(e.getId(), e.getId())
                    .ifPresent(binome ->
                            choixSujetRepository.findByBinomeIdOrderByOrdreAsc(binome.getId())
                                    .forEach(c -> sujetIds.add(c.getSujet().getId()))
                    );
        }
        return sujetIds;
    }
}
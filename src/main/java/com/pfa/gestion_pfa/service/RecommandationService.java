package com.pfa.gestion_pfa.service;

import com.pfa.gestion_pfa.dto.RecommandationDTO;
import com.pfa.gestion_pfa.model.Etudiant;
import com.pfa.gestion_pfa.model.Sujet;
import com.pfa.gestion_pfa.model.enums.StatutSujet;
import com.pfa.gestion_pfa.repository.EtudiantRepository;
import com.pfa.gestion_pfa.repository.SujetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Moteur de recommandation de sujets PFA.
 * Calcule un score de compatibilité entre un étudiant et chaque sujet approuvé,
 * puis enrichit chaque résultat d'une analyse IA via Ollama.
 *
 * Logique de score (contribution de Wiem) :
 *  - 50 pts  compatibilité rang étudiant / rang sujet
 *  - 30 pts  compétences communes (étudiant ∩ sujet)
 *  - 20 pts  bonus moyenne (moyenne / 20 * 20)
 */
@Service
@RequiredArgsConstructor
public class RecommandationService {

    private final EtudiantRepository etudiantRepository;
    private final SujetRepository    sujetRepository;
    private final OllamaService      ollamaService;

    public List<RecommandationDTO> getRecommandations(Long etudiantId) {
        Etudiant etudiant = etudiantRepository.findById(etudiantId)
                .orElseThrow(() -> new RuntimeException("Étudiant introuvable"));

        List<Etudiant> tousEtudiants = etudiantRepository.findAllByOrderByMoyenneDesc();
        int rangEtudiant = 1;
        for (int i = 0; i < tousEtudiants.size(); i++) {
            if (tousEtudiants.get(i).getId().equals(etudiantId)) {
                rangEtudiant = i + 1;
                break;
            }
        }
        int totalEtudiants = tousEtudiants.size();

        List<Sujet> sujetsApprouves = sujetRepository.findByStatutOrderByRangAsc(StatutSujet.APPROUVE);
        int totalSujets = sujetsApprouves.size();

        List<RecommandationDTO> recommandations = new ArrayList<>();
        for (Sujet sujet : sujetsApprouves) {
            double score = calculerScore(etudiant, sujet, rangEtudiant, totalEtudiants, totalSujets);
            String prompt = construirePrompt(etudiant, sujet, rangEtudiant, totalEtudiants);
            String analyseIA = ollamaService.genererRecommandation(prompt);
            String explication = genererExplication(etudiant, rangEtudiant, totalEtudiants, score);

            recommandations.add(new RecommandationDTO(
                    sujet.getId(), sujet.getTitre(), sujet.getDescription(),
                    score, sujet.getRang(), explication, analyseIA
            ));
        }

        return recommandations.stream()
                .sorted((a, b) -> Double.compare(b.getScore(), a.getScore()))
                .limit(5)
                .collect(Collectors.toList());
    }

    private double calculerScore(Etudiant etudiant, Sujet sujet,
                                  int rangEtudiant, int totalEtudiants, int totalSujets) {
        double score = 0;

        if (sujet.getRang() != null && totalSujets > 0) {
            double rangSujetNorm    = (double) sujet.getRang() / totalSujets;
            double rangEtudiantNorm = (double) rangEtudiant / totalEtudiants;
            score += (1 - Math.abs(rangSujetNorm - rangEtudiantNorm)) * 50;
        }

        List<String> compEtudiant = etudiant.getCompetences().stream()
                .map(String::toLowerCase).collect(Collectors.toList());
        List<String> compSujet = sujet.getCompetences().stream()
                .map(String::toLowerCase).collect(Collectors.toList());

        if (!compSujet.isEmpty()) {
            long communes = compEtudiant.stream().filter(compSujet::contains).count();
            score += (double) communes / compSujet.size() * 30;
        }

        score += (etudiant.getMoyenne() / 20.0) * 20;
        return Math.round(score * 10.0) / 10.0;
    }

    private String construirePrompt(Etudiant etudiant, Sujet sujet,
                                     int rangEtudiant, int totalEtudiants) {
        return String.format(
                "Tu es un conseiller académique. Analyse la compatibilité entre " +
                "cet étudiant et ce sujet PFA en 2-3 phrases courtes en français.\n\n" +
                "Étudiant: %s\nMoyenne: %.1f/20\nClassement: %d/%d\nCompétences: %s\n\n" +
                "Sujet: %s\nDescription: %s\nCompétences requises: %s\nRang du sujet: %d\n\n" +
                "Donne une analyse courte et précise.",
                etudiant.getNom(),
                etudiant.getMoyenne(),
                rangEtudiant, totalEtudiants,
                String.join(", ", etudiant.getCompetences()),
                sujet.getTitre(),
                sujet.getDescription() != null ? sujet.getDescription() : "",
                String.join(", ", sujet.getCompetences()),
                sujet.getRang() != null ? sujet.getRang() : 0
        );
    }

    private String genererExplication(Etudiant etudiant, int rangEtudiant,
                                       int totalEtudiants, double score) {
        String msgRang  = String.format("Classé %d/%d avec moyenne %.1f/20.",
                rangEtudiant, totalEtudiants, etudiant.getMoyenne());
        String msgScore = score >= 70 ? "Excellent choix !" : score >= 50 ? "Bon choix." : "Choix possible.";
        return msgRang + " " + msgScore;
    }
}

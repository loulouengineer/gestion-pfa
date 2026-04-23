package tn.enicarthage.projetspring.service;

import tn.enicarthage.projetspring.dto.RecommandationDTO;
import tn.enicarthage.projetspring.entity.Etudiant;
import tn.enicarthage.projetspring.entity.Sujet;
import tn.enicarthage.projetspring.repository.BinomeRepository;
import tn.enicarthage.projetspring.repository.ChoixSujetRepository;
import tn.enicarthage.projetspring.repository.EtudiantRepository;
import tn.enicarthage.projetspring.repository.SujetRepository;
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
    private final OllamaService ollamaService;

    public List<RecommandationDTO> recommander(Long etudiantId) {
        Etudiant etudiant = etudiantRepository.findById(etudiantId)
                .orElseThrow(() -> new RuntimeException("Étudiant introuvable : " + etudiantId));

        List<Sujet> sujetsDisponibles = sujetRepository.findByDisponibleTrueAndConfirmeTrue();
        if (sujetsDisponibles.isEmpty()) return Collections.emptyList();

        float moyenne = (float) etudiant.getMoyenne();
        int difficulteCible = calculerDifficulte(moyenne);
        Set<Long> sujetsSimilaires = getSujetsSimilaires(etudiantId, moyenne);

        Map<Sujet, Double> scores = new LinkedHashMap<>();
        for (Sujet sujet : sujetsDisponibles) {
            double score = 0;
            int ecart = Math.abs(sujet.getDifficulte() - difficulteCible);
            score += (5 - ecart) * 2.0;
            if (sujetsSimilaires.contains(sujet.getId())) score += 3.0;
            scores.put(sujet, score);
        }

        List<Map.Entry<Sujet, Double>> top5 = scores.entrySet().stream()
                .sorted(Map.Entry.<Sujet, Double>comparingByValue().reversed())
                .limit(5)
                .collect(Collectors.toList());

        List<RecommandationDTO> result = new ArrayList<>();
        for (int i = 0; i < top5.size(); i++) {
            Sujet sujet = top5.get(i).getKey();
            double score = top5.get(i).getValue();
            double scorePct = Math.min(Math.round((score / 13.0) * 100), 100);

            String prompt = String.format(
                    "Étudiant avec moyenne %.1f/20. Sujet : '%s'. Description : '%s'. " +
                            "En 2 phrases max, explique pourquoi ce sujet lui convient.",
                    moyenne, sujet.getTitre(), sujet.getDescription()
            );
            String analyseIA = ollamaService.genererRecommandation(prompt);

            result.add(new RecommandationDTO(
                    sujet.getId(),
                    sujet.getTitre(),
                    sujet.getDescription(),
                    scorePct,
                    i + 1,
                    "Recommandé selon votre niveau et les choix d'étudiants similaires.",
                    analyseIA
            ));
        }
        return result;
    }

    private int calculerDifficulte(float moyenne) {
        if (moyenne >= 16) return 5;
        if (moyenne >= 14) return 4;
        if (moyenne >= 12) return 3;
        if (moyenne >= 10) return 2;
        return 1;
    }

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
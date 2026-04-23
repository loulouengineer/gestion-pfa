package tn.enicarthage.projetspring.service;

import tn.enicarthage.projetspring.entity.Binome;
import tn.enicarthage.projetspring.entity.ChoixSujet;
import tn.enicarthage.projetspring.entity.Sujet;
import tn.enicarthage.projetspring.repository.ChoixSujetRepository;
import tn.enicarthage.projetspring.repository.SujetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.enicarthage.projetspring.repository.BinomeRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ChoixSujetService {

    private final ChoixSujetRepository choixSujetRepository;
    private final BinomeRepository binomeRepository;
    private final SujetRepository sujetRepository;

    private static final int MAX_CHOIX = 5;

    @Transactional
    public List<ChoixSujet> soumettreChoix(Long binomeId, List<Long> sujetIds) {
        // ✅ liste vide autorisée (pour tout retirer)
        if (sujetIds == null) sujetIds = new ArrayList<>();
        if (sujetIds.size() > MAX_CHOIX)
            throw new RuntimeException("Maximum " + MAX_CHOIX + " choix autorisés.");

        Binome binome = binomeRepository.findById(binomeId)
                .orElseThrow(() -> new RuntimeException("Binôme introuvable : " + binomeId));

        // Supprimer les anciens choix
        choixSujetRepository.deleteByBinomeId(binomeId);
        choixSujetRepository.flush(); // ✅ force le DELETE avant l'INSERT

        if (sujetIds.isEmpty()) return new ArrayList<>();

        List<ChoixSujet> nouveauxChoix = new ArrayList<>();
        for (int i = 0; i < sujetIds.size(); i++) {
            Long sujetId = sujetIds.get(i);
            Sujet sujet = sujetRepository.findById(sujetId)
                    .orElseThrow(() -> new RuntimeException("Sujet introuvable : " + sujetId));

            if (!sujet.isDisponible() || !sujet.isConfirme())
                throw new RuntimeException("Le sujet '" + sujet.getTitre() + "' n'est pas disponible.");

            nouveauxChoix.add(ChoixSujet.builder()
                    .binome(binome)
                    .sujet(sujet)
                    .ordre(i + 1)
                    .build());
        }

        return choixSujetRepository.saveAll(nouveauxChoix);
    }

    // Ajouter dans ChoixSujetService.java
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getChoixParBinome(Long binomeId) {
        return choixSujetRepository.findByBinomeIdOrderByOrdreAsc(binomeId)
                .stream()
                .map(c -> {
                    Map<String, Object> map = new java.util.LinkedHashMap<>();
                    map.put("id", c.getId());
                    map.put("ordre", c.getOrdre());
                    Map<String, Object> sujet = new java.util.LinkedHashMap<>();
                    sujet.put("id", c.getSujet().getId());
                    sujet.put("titre", c.getSujet().getTitre());
                    sujet.put("description", c.getSujet().getDescription());
                    sujet.put("difficulte", c.getSujet().getDifficulte());
                    sujet.put("disponible", c.getSujet().isDisponible());
                    map.put("sujet", sujet);
                    return map;
                })
                .collect(java.util.stream.Collectors.toList());
    }
}
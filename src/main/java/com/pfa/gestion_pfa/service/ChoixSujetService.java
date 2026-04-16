package com.pfa.gestion_pfa.service;

import com.pfa.gestion_pfa.model.Binome;
import com.pfa.gestion_pfa.model.ChoixSujet;
import com.pfa.gestion_pfa.model.Sujet;
import com.pfa.gestion_pfa.Repository.BinomeRepository;
import com.pfa.gestion_pfa.Repository.ChoixSujetRepository;
import com.pfa.gestion_pfa.Repository.SujetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChoixSujetService {

    private final ChoixSujetRepository choixSujetRepository;
    private final BinomeRepository binomeRepository;
    private final SujetRepository sujetRepository;

    private static final int MAX_CHOIX = 5;

    @Transactional
    public List<ChoixSujet> soumettreChoix(Long binomeId, List<Long> sujetIds) {
        if (sujetIds == null || sujetIds.isEmpty())
            throw new RuntimeException("Veuillez fournir au moins un choix.");
        if (sujetIds.size() > MAX_CHOIX)
            throw new RuntimeException("Maximum " + MAX_CHOIX + " choix autorisés.");

        Binome binome = binomeRepository.findById(binomeId)
                .orElseThrow(() -> new RuntimeException("Binôme introuvable : " + binomeId));

        // Supprimer les anciens choix avant de sauvegarder les nouveaux
        choixSujetRepository.deleteByBinomeId(binomeId);

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

    public List<ChoixSujet> getChoixParBinome(Long binomeId) {
        return choixSujetRepository.findByBinomeIdOrderByOrdreAsc(binomeId);
    }
}
package com.pfa.gestion_pfa.service;

import com.pfa.gestion_pfa.model.Binome;
import com.pfa.gestion_pfa.model.ChoixSujet;
import com.pfa.gestion_pfa.model.Sujet;
import com.pfa.gestion_pfa.repository.ChoixSujetRepository;
import com.pfa.gestion_pfa.repository.BinomeRepository;
import com.pfa.gestion_pfa.repository.SujetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service métier — Gestion des choix de sujets par les binômes.
 *
 * Règles :
 * - Maximum 5 choix par binôme
 * - Un binôme ne peut pas choisir le même sujet deux fois
 * - Un sujet non disponible ne peut pas être choisi
 */
@Service
@RequiredArgsConstructor
@Transactional
public class ChoixSujetService {

    private static final int MAX_CHOIX = 5;

    private final ChoixSujetRepository choixSujetRepository;
    private final BinomeRepository binomeRepository;
    private final SujetRepository sujetRepository;

    /** Retourne les choix d'un binôme triés par ordre de préférence */
    @Transactional(readOnly = true)
    public List<ChoixSujet> getChoixParBinome(Long binomeId) {
        return choixSujetRepository.findByBinomeIdOrderByOrdreAsc(binomeId);
    }

    /** Retourne tous les binômes ayant choisi un sujet */
    @Transactional(readOnly = true)
    public List<ChoixSujet> getChoixParSujet(Long sujetId) {
        return choixSujetRepository.findBySujetId(sujetId);
    }

    /**
     * Ajoute un choix de sujet pour un binôme.
     *
     * @param binomeId identifiant du binôme
     * @param sujetId  identifiant du sujet choisi
     * @param ordre    ordre de préférence (1 = premier choix)
     */
    public ChoixSujet ajouterChoix(Long binomeId, Long sujetId, int ordre) {
        // Vérification : max 5 choix
        long nbChoix = choixSujetRepository.countByBinomeId(binomeId);
        if (nbChoix >= MAX_CHOIX) {
            throw new IllegalStateException(
                    "Un binôme ne peut pas choisir plus de " + MAX_CHOIX + " sujets."
            );
        }

        // Vérification : doublon
        if (choixSujetRepository.existsByBinomeIdAndSujetId(binomeId, sujetId)) {
            throw new IllegalArgumentException("Ce sujet a déjà été choisi par ce binôme.");
        }

        Binome binome = binomeRepository.findById(binomeId)
                .orElseThrow(() -> new IllegalArgumentException("Binôme introuvable."));

        Sujet sujet = sujetRepository.findById(sujetId)
                .orElseThrow(() -> new IllegalArgumentException("Sujet introuvable."));

        // Vérification : sujet disponible
        if (!sujet.isDisponible()) {
            throw new IllegalStateException("Ce sujet n'est plus disponible.");
        }

        ChoixSujet choix = new ChoixSujet();
        choix.setBinome(binome);
        choix.setSujet(sujet);
        choix.setOrdre(ordre);

        return choixSujetRepository.save(choix);
    }

    /**
     * Supprime un choix de sujet.
     */
    public void supprimerChoix(Long choixId) {
        if (!choixSujetRepository.existsById(choixId)) {
            throw new IllegalArgumentException("Choix introuvable.");
        }
        choixSujetRepository.deleteById(choixId);
    }

    /**
     * Réinitialise tous les choix d'un binôme.
     */
    public void reinitialiserChoix(Long binomeId) {
        choixSujetRepository.deleteByBinomeId(binomeId);
    }
}
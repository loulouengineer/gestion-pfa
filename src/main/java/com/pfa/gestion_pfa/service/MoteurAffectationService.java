package com.pfa.gestion_pfa.service;

import com.pfa.gestion_pfa.model.Affectation;
import com.pfa.gestion_pfa.model.Binome;
import com.pfa.gestion_pfa.model.ChoixSujet;
import com.pfa.gestion_pfa.model.Sujet;
import com.pfa.gestion_pfa.model.enums.StatutSujet;
import com.pfa.gestion_pfa.repository.AffectationRepository;
import com.pfa.gestion_pfa.repository.BinomeRepository;
import com.pfa.gestion_pfa.repository.SujetRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Moteur d'affectation automatique des sujets PFA aux binômes.
 * Contribution de Chaima.
 *
 * Algorithme glouton :
 *  1. Trier les binômes par moyenneBinome décroissante (meilleurs en premier)
 *  2. Pour chaque binôme, parcourir ses voeux dans l'ordre (1 → 5)
 *  3. Affecter le premier sujet encore disponible
 *  4. Marquer ce sujet comme indisponible
 *
 * Score = moyenneBinome × bonus d'ordre (choix 1 → bonus 1.0, choix 5 → bonus 0.2)
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class MoteurAffectationService {

    private final BinomeRepository     binomeRepository;
    private final AffectationRepository affectationRepository;
    private final SujetRepository      sujetRepository;

    @Transactional
    public List<Affectation> affecterSujets() {
        // Remettre à zéro les affectations existantes
        affectationRepository.deleteAll();

        // Remettre tous les sujets approuvés comme disponibles avant relancement
        List<Sujet> sujetsApprouves = sujetRepository.findByStatut(StatutSujet.APPROUVE);
        sujetsApprouves.forEach(s -> s.setDisponible(true));
        sujetRepository.saveAll(sujetsApprouves);

        List<Binome> binomes = binomeRepository.findAllByOrderByMoyenneBinomeDesc();
        List<Affectation> resultats = new ArrayList<>();

        for (Binome binome : binomes) {
            List<ChoixSujet> choix = binome.getChoix();

            if (choix == null || choix.isEmpty()) {
                log.warn("Binôme {} sans voeux — ignoré.", binome.getId());
                continue;
            }

            boolean affecte = false;
            for (ChoixSujet choixSujet : choix) {
                Sujet sujet = choixSujet.getSujet();

                if (sujet.isDisponible()) {
                    Affectation affectation = new Affectation();
                    affectation.setBinome(binome);
                    affectation.setSujet(sujet);
                    affectation.setScore(calculerScore(binome, choixSujet));

                    affectationRepository.save(affectation);
                    resultats.add(affectation);

                    sujet.setDisponible(false);
                    sujetRepository.save(sujet);

                    log.info("✓ Binôme {} (moy. {}) → '{}' (voeu n°{})",
                            binome.getId(), binome.getMoyenneBinome(),
                            sujet.getTitre(), choixSujet.getOrdre());

                    affecte = true;
                    break;
                }
            }

            if (!affecte) {
                log.warn("✗ Binôme {} : aucun de ses {} voeux n'est disponible.",
                        binome.getId(), choix.size());
            }
        }

        log.info("Affectation terminée : {}/{} binômes affectés.",
                resultats.size(), binomes.size());
        return resultats;
    }

    public List<Affectation> getToutesAffectations() {
        return affectationRepository.findAll();
    }

    public Optional<Affectation> getAffectationParBinome(Long binomeId) {
        return affectationRepository.findByBinomeId(binomeId);
    }

    /** Score = moyenne binôme × bonus ordre (choix 1 → 1.0, choix 5 → 0.2) */
    private float calculerScore(Binome binome, ChoixSujet choix) {
        float bonusOrdre = (6f - choix.getOrdre()) / 5f;
        return binome.getMoyenneBinome() * bonusOrdre;
    }
}

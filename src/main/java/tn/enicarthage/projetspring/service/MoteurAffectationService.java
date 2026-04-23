package tn.enicarthage.projetspring.service;


import tn.enicarthage.projetspring.entity.Affectation;
import tn.enicarthage.projetspring.entity.Binome;
import tn.enicarthage.projetspring.entity.ChoixSujet;
import tn.enicarthage.projetspring.entity.Sujet;
import tn.enicarthage.projetspring.repository.AffectationRepository;
import tn.enicarthage.projetspring.repository.BinomeRepository;
import tn.enicarthage.projetspring.repository.SujetRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class MoteurAffectationService {

    private final BinomeRepository binomeRepository;
    private final AffectationRepository affectationRepository;
    private final SujetRepository sujetRepository;

    /**
     * Algorithme glouton d'affectation :
     * 1. Trier les binômes par moyenneBinome décroissante (meilleurs en premier)
     * 2. Pour chaque binôme, parcourir ses choix dans l'ordre (1 → 5)
     * 3. Affecter le premier sujet encore disponible
     * 4. Marquer ce sujet comme non disponible
     */
    @Transactional
    public List<Affectation> affecterSujets() {
        // Remettre à zéro les affectations existantes
        affectationRepository.deleteAll();

        // Remettre tous les sujets comme disponibles avant relancement
        List<Sujet> tousLesSujets = sujetRepository.findByConfirmeTrue();
        tousLesSujets.forEach(s -> s.setDisponible(true));
        sujetRepository.saveAll(tousLesSujets);

        List<Binome> binomes = binomeRepository.findAllByOrderByMoyenneBinomeDesc();
        List<Affectation> resultats = new ArrayList<>();

        for (Binome binome : binomes) {
            List<ChoixSujet> choix = binome.getChoix();

            if (choix == null || choix.isEmpty()) {
                log.warn("Binôme {} sans choix — ignoré.", binome.getId());
                continue;
            }

            boolean affecte = false;
            for (ChoixSujet choixSujet : choix) {
                Sujet sujet = choixSujet.getSujet();

                if (sujet.isDisponible()) {
                    float score = calculerScore(binome, choixSujet);

                    Affectation affectation = Affectation.builder()
                            .binome(binome)
                            .sujet(sujet)
                            .score(score)
                            .build();

                    affectationRepository.save(affectation);
                    resultats.add(affectation);

                    // Marquer le sujet comme pris
                    sujet.setDisponible(false);
                    sujetRepository.save(sujet);

                    log.info("✓ Binôme {} (moy. {}) → '{}' (choix n°{})",
                            binome.getId(), binome.getMoyenneBinome(),
                            sujet.getTitre(), choixSujet.getOrdre());

                    affecte = true;
                    break;
                }
            }

            if (!affecte) {
                log.warn("✗ Binôme {} : aucun de ses {} choix n'est disponible.",
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

    /**
     * Score = moyenne binôme × bonus ordre
     * Choix 1 → bonus 1.0 | Choix 5 → bonus 0.2
     */
    private float calculerScore(Binome binome, ChoixSujet choix) {
        float bonusOrdre = (6f - (float) choix.getOrdre()) / 5f;
        return (float) binome.getMoyenneBinome() * bonusOrdre;
    }
    }

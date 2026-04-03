package com.pfa.gestion_pfa.service;

import com.pfa.gestion_pfa.model.Affectation;
import com.pfa.gestion_pfa.model.Sujet;
import com.pfa.gestion_pfa.model.enums.StatutAffectation;
import com.pfa.gestion_pfa.repository.AffectationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service métier — Phase 1 : Validation finale des sujets (Admin).
 *
 * L'admin peut :
 *  - Voir la liste de toutes les affectations EN_ATTENTE
 *  - Valider une affectation (verrouille définitivement)
 *  - Refuser une affectation (avec commentaire)
 *  - Modifier une affectation avant validation (changer sujet/encadrant)
 */
@Service
@RequiredArgsConstructor
@Transactional
public class AffectationService {

    private final AffectationRepository affectationRepository;

    // ──────────────────────────────────────────────────────
    // Lecture
    // ──────────────────────────────────────────────────────

    /** Retourne toutes les affectations (toutes phases confondues). */
    @Transactional(readOnly = true)
    public List<Affectation> findAll() {
        return affectationRepository.findAll();
    }

    /** Retourne uniquement les affectations en attente de validation admin. */
    @Transactional(readOnly = true)
    public List<Affectation> findEnAttente() {
        return affectationRepository.findByStatut(StatutAffectation.EN_ATTENTE);
    }

    /** Retourne uniquement les affectations validées (prêtes pour les soutenances). */
    @Transactional(readOnly = true)
    public List<Affectation> findValidees() {
        return affectationRepository.findByStatut(StatutAffectation.VALIDEE);
    }

    /** Retourne les affectations refusées. */
    @Transactional(readOnly = true)
    public List<Affectation> findRefusees() {
        return affectationRepository.findByStatut(StatutAffectation.REFUSEE);
    }

    /** Retourne une affectation par son identifiant. */
    @Transactional(readOnly = true)
    public Affectation findById(Long id) {
        return affectationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Affectation introuvable : id=" + id));
    }

    // ──────────────────────────────────────────────────────
    // Actions admin — Phase 1
    // ──────────────────────────────────────────────────────

    /**
     * Valide une affectation et la verrouille définitivement.
     *
     * @param id identifiant de l'affectation
     * @return l'affectation mise à jour
     * @throws IllegalStateException si déjà verrouillée
     */
    public Affectation valider(Long id) {
        Affectation affectation = findById(id);
        affectation.valider(); // Lance une exception si déjà verrouillée
        return affectationRepository.save(affectation);
    }

    /**
     * Refuse une affectation avec un commentaire de l'admin.
     *
     * @param id          identifiant de l'affectation
     * @param commentaire raison du refus
     * @return l'affectation mise à jour
     * @throws IllegalStateException si déjà verrouillée
     */
    public Affectation refuser(Long id, String commentaire) {
        if (commentaire == null || commentaire.isBlank()) {
            throw new IllegalArgumentException("Un commentaire est obligatoire pour refuser une affectation.");
        }
        Affectation affectation = findById(id);
        affectation.refuser(commentaire);
        return affectationRepository.save(affectation);
    }

    /**
     * Modifie le sujet d'une affectation avant sa validation.
     * Permet à l'admin de changer l'encadrant ou le sujet si nécessaire.
     *
     * @param id          identifiant de l'affectation
     * @param nouveauSujet le nouveau sujet à affecter
     * @param commentaire  raison de la modification
     * @return l'affectation mise à jour
     * @throws IllegalStateException si déjà verrouillée
     */
    public Affectation modifier(Long id, Sujet nouveauSujet, String commentaire) {
        Affectation affectation = findById(id);
        affectation.modifier(nouveauSujet, commentaire);
        return affectationRepository.save(affectation);
    }

    /**
     * Valide en masse toutes les affectations EN_ATTENTE.
     * Pratique pour l'admin qui souhaite tout valider d'un coup.
     *
     * @return nombre d'affectations validées
     */
    public int validerToutes() {
        List<Affectation> enAttente = findEnAttente();
        enAttente.forEach(Affectation::valider);
        affectationRepository.saveAll(enAttente);
        return enAttente.size();
    }
}
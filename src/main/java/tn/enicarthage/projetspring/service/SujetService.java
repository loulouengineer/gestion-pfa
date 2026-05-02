package tn.enicarthage.projetspring.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tn.enicarthage.projetspring.dto.SujetRequest;
import tn.enicarthage.projetspring.entity.Professeur;
import tn.enicarthage.projetspring.entity.StatutSujet;
import tn.enicarthage.projetspring.entity.Sujet;
import tn.enicarthage.projetspring.entity.User;
import tn.enicarthage.projetspring.repository.SujetRepository;
import tn.enicarthage.projetspring.repository.UserRepository;

import java.time.LocalDate;
import java.util.List;

@Service
public class SujetService {

    @Autowired
    private SujetRepository sujetRepository;

    @Autowired
    private UserRepository userRepository;

    public Sujet creerSujet(SujetRequest request, String email) {
        User enseignant = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        // ✅ Vérifier que l'utilisateur est bien un Professeur
        if (!(enseignant instanceof Professeur)) {
            throw new RuntimeException("Seul un professeur peut créer un sujet");
        }

        Sujet sujet = new Sujet();
        sujet.setTitre(request.getTitre());
        sujet.setDescription(request.getDescription());
        sujet.setMotsCles(request.getMotsCles());
        sujet.setCompetences(request.getCompetences());
        sujet.setStatut(StatutSujet.EN_ATTENTE);
        sujet.setDateProposition(LocalDate.now());
        sujet.setEncadrant((Professeur) enseignant); // ✅ cast sur la variable, pas le type
        sujet.setRang(request.getRang());

        return sujetRepository.save(sujet);
    }

    public List<Sujet> getMesSujets(String email) {
        User enseignant = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        if (!(enseignant instanceof Professeur)) {
            throw new RuntimeException("Utilisateur non autorisé");
        }

        // ✅ findByEncadrant car on a remplacé enseignant par encadrant dans Sujet
        return sujetRepository.findByEncadrant((Professeur) enseignant);
    }

    public void supprimerSujet(Long id, String email) {
        Sujet sujet = sujetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sujet non trouvé"));

        // ✅ getEncadrant() au lieu de getEnseignant()
        if (!sujet.getEncadrant().getEmail().equals(email)) {
            throw new RuntimeException("Non autorisé");
        }

        sujetRepository.delete(sujet);
    }

    public List<Sujet> getTousSujets() {
        return sujetRepository.findAll();
    }

    public List<Sujet> getSujetsDisponibles() {
        // Retourne les sujets approuvés / disponibles pour les étudiants
        return sujetRepository.findByStatut(StatutSujet.APPROUVE); // adapte selon ton enum/statut

    }

    public Sujet modifierSujet(Long id, SujetRequest request, String email) {
        Sujet sujet = sujetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sujet non trouvé"));
        if (sujet.getEncadrant() == null || !sujet.getEncadrant().getEmail().equals(email)) {
            throw new RuntimeException("Non autorisé");
        }
        if (request.getTitre()       != null) sujet.setTitre(request.getTitre());
        if (request.getDescription() != null) sujet.setDescription(request.getDescription());
        if (request.getMotsCles()    != null) sujet.setMotsCles(request.getMotsCles());
        if (request.getCompetences() != null) sujet.setCompetences(request.getCompetences());
        if (request.getRang()        != null) sujet.setRang(request.getRang());
        if (request.getDifficulte()  != null) sujet.setDifficulte(request.getDifficulte());
        if (request.getDisponible()  != null) sujet.setDisponible(request.getDisponible());
        return sujetRepository.save(sujet);
    }

    public List<Sujet> getSujetsByEncadrantId(Long encadrantId) {
        return sujetRepository.findAll().stream()
                .filter(s -> s.getEncadrant() != null && s.getEncadrant().getId().equals(encadrantId))
                .collect(java.util.stream.Collectors.toList());
    }

    public Sujet changerStatut(Long id, String statut) {
        Sujet sujet = sujetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sujet non trouvé"));

        sujet.setStatut(StatutSujet.valueOf(statut));
        if (StatutSujet.APPROUVE.name().equals(statut)) {
            sujet.setConfirme(true);
            sujet.setDisponible(true);
        }
        return sujetRepository.save(sujet);
    }
}
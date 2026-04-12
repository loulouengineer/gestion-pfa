package tn.enicarthage.projetspring.service;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tn.enicarthage.projetspring.dto.SujetRequest;
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

    // Enseignant : proposer un sujet
    public Sujet creerSujet(SujetRequest request, String email) {
        User enseignant = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        Sujet sujet = new Sujet();
        sujet.setTitre(request.getTitre());
        sujet.setDescription(request.getDescription());
        sujet.setMotsCles(request.getMotsCles());
        sujet.setCompetences(request.getCompetences());
        sujet.setStatut(StatutSujet.EN_ATTENTE);
        sujet.setDateProposition(LocalDate.now());
        sujet.setEnseignant(enseignant);
        sujet.setRang(request.getRang());

        return sujetRepository.save(sujet);
    }

    // Enseignant : voir ses sujets
    public List<Sujet> getMesSujets(String email) {
        User enseignant = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        return sujetRepository.findByEnseignant(enseignant);
    }

    // Enseignant : supprimer un sujet
    public void supprimerSujet(Long id, String email) {
        Sujet sujet = sujetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sujet non trouvé"));

        if (!sujet.getEnseignant().getEmail().equals(email)) {
            throw new RuntimeException("Non autorisé");
        }

        sujetRepository.delete(sujet);
    }

    // Chef : voir tous les sujets
    public List<Sujet> getTousSujets() {
        return sujetRepository.findAll();
    }

    // Chef : changer le statut
    public Sujet changerStatut(Long id, String statut) {
        Sujet sujet = sujetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sujet non trouvé"));

        sujet.setStatut(StatutSujet.valueOf(statut));
        return sujetRepository.save(sujet);
    }
}
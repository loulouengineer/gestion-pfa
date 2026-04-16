package com.pfa.gestion_pfa.service;

import com.pfa.gestion_pfa.model.Sujet;
import com.pfa.gestion_pfa.Repository.SujetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SujetService {

    private final SujetRepository sujetRepository;

    public List<Sujet> getSujetsDisponibles() {
        return sujetRepository.findByDisponibleTrueAndConfirmeTrue();
    }

    public List<Sujet> getSujetsParProfesseur(Long professeurId) {
        return sujetRepository.findByEncadrantId(professeurId);
    }

    public Sujet creerSujet(Sujet sujet) {
        sujet.setDisponible(true);
        sujet.setConfirme(false);
        return sujetRepository.save(sujet);
    }

    public Sujet confirmerSujet(Long sujetId) {
        Sujet sujet = sujetRepository.findById(sujetId)
                .orElseThrow(() -> new RuntimeException("Sujet introuvable : " + sujetId));
        sujet.setConfirme(true);
        return sujetRepository.save(sujet);
    }

    public Sujet getSujetById(Long id) {
        return sujetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sujet introuvable : " + id));
    }

    public List<Sujet> getTousSujetsConfirmes() {
        return sujetRepository.findByConfirmeTrue();
    }
}
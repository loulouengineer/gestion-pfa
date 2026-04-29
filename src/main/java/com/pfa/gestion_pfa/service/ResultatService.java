package com.pfa.gestion_pfa.service;

import com.pfa.gestion_pfa.model.*;
import com.pfa.gestion_pfa.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ResultatService {

    private final ResultatRepository resultatRepository;
    private final NoteParCritereRepository noteParCritereRepository;

    @Transactional(readOnly = true)
    public List<Resultat> getAllResultats() {
        return resultatRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<Resultat> getResultatById(Long id) {
        return resultatRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public List<Resultat> getResultatsByMention(String mention) {
        return resultatRepository.findByMention(mention);
    }

    @Transactional(readOnly = true)
    public Optional<Resultat> getResultatBySoutenance(Long soutenanceId) {
        return resultatRepository.findBySoutenanceId(soutenanceId);
    }

    @Transactional
    public Resultat saveResultat(Resultat resultat) {
        if (resultat.getNoteGlobale() != null) {
            double note = resultat.getNoteGlobale();
            String mention;
            if      (note >= 16) mention = "Excellent";
            else if (note >= 14) mention = "Très bien";
            else if (note >= 12) mention = "Bien";
            else                 mention = "Moyen";
            resultat.setMention(mention);
        }
        return resultatRepository.save(resultat);
    }

    @Transactional
    public void deleteResultat(Long id) {
        resultatRepository.deleteById(id);
    }

    public Double getMoyenne() { return resultatRepository.findMoyenneGenerale(); }
    public Double getNoteMax() { return resultatRepository.findNoteMax(); }
    public Double getNoteMin() { return resultatRepository.findNoteMin(); }

    public List<NoteParCritere> getNotesCriteres(Long resultatId) {
        return noteParCritereRepository.findByResultatId(resultatId);
    }
}
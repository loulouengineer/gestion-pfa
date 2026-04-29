package tn.enicarthage.projetspring.service;

import tn.enicarthage.projetspring.dto.BinomeDTO;
import tn.enicarthage.projetspring.entity.Binome;
import tn.enicarthage.projetspring.entity.Etudiant;
import tn.enicarthage.projetspring.repository.BinomeRepository;
import tn.enicarthage.projetspring.repository.EtudiantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class BinomeService {

    private final BinomeRepository binomeRepository;
    private final EtudiantRepository etudiantRepository;

    @Transactional
    public Binome formerBinome(Long etudiant1Id, Long etudiant2Id) {
        if (etudiant1Id == null || etudiant2Id == null) {
            throw new IllegalArgumentException("Les deux étudiants sont obligatoires.");
        }
        if (etudiant1Id.equals(etudiant2Id)) {
            throw new IllegalArgumentException("Un étudiant ne peut pas être son propre binôme.");
        }

        Etudiant e1 = etudiantRepository.findById(etudiant1Id)
                .orElseThrow(() -> new RuntimeException("Étudiant introuvable : " + etudiant1Id));
        Etudiant e2 = etudiantRepository.findById(etudiant2Id)
                .orElseThrow(() -> new RuntimeException("Étudiant introuvable : " + etudiant2Id));

        if (binomeRepository.findByEtudiant1IdOrEtudiant2Id(etudiant1Id, etudiant1Id).isPresent()) {
            throw new RuntimeException("L'étudiant " + e1.getNom() + " est déjà dans un binôme.");
        }
        if (binomeRepository.findByEtudiant1IdOrEtudiant2Id(etudiant2Id, etudiant2Id).isPresent()) {
            throw new RuntimeException("L'étudiant " + e2.getNom() + " est déjà dans un binôme.");
        }

        Binome binome = Binome.builder()
                .etudiant1(e1)
                .etudiant2(e2)
                .build();

        return binomeRepository.save(binome);
    }

    // ✅ Nouvelle méthode qui retourne directement le DTO
    @Transactional
    public BinomeDTO formerBinomeDTO(Long etudiant1Id, Long etudiant2Id) {
        Binome binome = formerBinome(etudiant1Id, etudiant2Id);
        return BinomeDTO.from(binome, etudiant1Id);
    }

    @Transactional(readOnly = true)
    public Optional<Binome> getBinomeParEtudiant(Long etudiantId) {
        return binomeRepository.findByEtudiant1IdOrEtudiant2Id(etudiantId, etudiantId);
    }

    @Transactional
    public void supprimerBinome(Long id) {
        Binome binome = binomeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Binôme introuvable : " + id));
        binomeRepository.delete(binome);
    }

    public Binome getBinomeById(Long id) {
        return binomeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Binôme introuvable : " + id));
    }

    public List<Binome> getTousBinomesTriesParMoyenne() {
        return binomeRepository.findAllByOrderByMoyenneBinomeDesc();
    }
}
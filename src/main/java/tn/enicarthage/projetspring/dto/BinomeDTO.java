package tn.enicarthage.projetspring.dto;

import tn.enicarthage.projetspring.entity.Binome;
import tn.enicarthage.projetspring.entity.Etudiant;
import lombok.Data;

@Data
public class BinomeDTO {
    private Long id;
    private Double moyenneCommune;
    private EtudiantInfoDTO moi;
    private EtudiantInfoDTO partenaire;

    @Data
    public static class EtudiantInfoDTO {
        private Long id;
        private String nom;
        private String prenom;
        private String matricule;
        private Double moyenne;
    }

    public static BinomeDTO from(Binome binome, Long etudiantConnecteId) {
        BinomeDTO dto = new BinomeDTO();
        dto.setId(binome.getId());
        dto.setMoyenneCommune(binome.getMoyenneBinome());

        Etudiant e1 = binome.getEtudiant1();
        Etudiant e2 = binome.getEtudiant2();

        Etudiant moi        = e1.getId().equals(etudiantConnecteId) ? e1 : e2;
        Etudiant partenaire = e1.getId().equals(etudiantConnecteId) ? e2 : e1;

        dto.setMoi(toInfo(moi));
        dto.setPartenaire(toInfo(partenaire));
        return dto;
    }

    private static EtudiantInfoDTO toInfo(Etudiant e) {
        EtudiantInfoDTO info = new EtudiantInfoDTO();
        info.setId(e.getId());
        info.setNom(e.getNom());
        info.setPrenom(e.getPrenom());
        info.setMatricule(e.getMatricule());
        info.setMoyenne(e.getMoyenne());
        return info;
    }
}
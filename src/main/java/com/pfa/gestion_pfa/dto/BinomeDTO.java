package com.pfa.gestion_pfa.dto;

import com.pfa.gestion_pfa.model.Binome;
import com.pfa.gestion_pfa.model.Etudiant;
import lombok.Data;

@Data
public class BinomeDTO {
    private Long id;
    private float moyenneCommune;
    private EtudiantInfo moi;
    private EtudiantInfo partenaire;

    @Data
    public static class EtudiantInfo {
        private Long id;
        private String nom;
        private String matricule;
        private float moyenne;
        private String specialite;
    }

    public static BinomeDTO from(Binome binome, Long etudiantConnecteId) {
        BinomeDTO dto = new BinomeDTO();
        dto.setId(binome.getId());
        dto.setMoyenneCommune(binome.getMoyenneBinome());

        Etudiant e1 = binome.getEtudiant1();
        Etudiant e2 = binome.getEtudiant2();

        // ✅ détecter qui est "moi" et qui est "partenaire"
        Etudiant moi        = e1.getId().equals(etudiantConnecteId) ? e1 : e2;
        Etudiant partenaire = e1.getId().equals(etudiantConnecteId) ? e2 : e1;

        dto.setMoi(toInfo(moi));
        dto.setPartenaire(toInfo(partenaire));
        return dto;
    }

    private static EtudiantInfo toInfo(Etudiant e) {
        EtudiantInfo info = new EtudiantInfo();
        info.setId(e.getId());
        info.setNom(e.getNom());
        info.setMatricule(e.getMatricule());
        info.setMoyenne(e.getMoyenne());
        return info;
    }
}
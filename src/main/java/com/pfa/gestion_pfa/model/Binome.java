package com.pfa.gestion_pfa.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "binome")
public class Binome {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "etudiant1_id")
    private Etudiant etudiant1;

    @OneToOne
    @JoinColumn(name = "etudiant2_id")
    private Etudiant etudiant2;

    private float moyenneBinome;

    public void calculerMoyenne() {
        this.moyenneBinome = (etudiant1.getMoyenne() + etudiant2.getMoyenne()) / 2;
    }
}
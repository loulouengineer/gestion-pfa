package com.pfa.gestion_pfa.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "choix_sujet")
public class ChoixSujet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "binome_id")
    private Binome binome;

    @ManyToOne
    @JoinColumn(name = "sujet_id")
    private Sujet sujet;

    private int ordre;
}

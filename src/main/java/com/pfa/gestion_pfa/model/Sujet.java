package com.pfa.gestion_pfa.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "sujet")
public class Sujet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String titre;
    private String description;
    private int difficulte;
    private boolean disponible = true;

    @ManyToOne
    @JoinColumn(name = "professeur_id")
    private Professeur encadrant;
}
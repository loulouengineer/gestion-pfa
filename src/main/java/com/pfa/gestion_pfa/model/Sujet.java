package com.pfa.gestion_pfa.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "sujet")
public class Sujet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titre;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private int difficulte; // 1 à 5

    @Builder.Default
    private boolean disponible = true;

    @Builder.Default
    private boolean confirme = false;

    // ✅ Nouveaux attributs
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "sujet_mots_cles", joinColumns = @JoinColumn(name = "sujet_id"))
    @Column(name = "mot_cle")
    @Builder.Default
    private List<String> motsCles = new java.util.ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "sujet_competences", joinColumns = @JoinColumn(name = "sujet_id"))
    @Column(name = "competence")
    @Builder.Default
    private List<String> competences = new java.util.ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "sujet_technologies", joinColumns = @JoinColumn(name = "sujet_id"))
    @Column(name = "technologie")
    @Builder.Default
    private List<String> technologies = new java.util.ArrayList<>();

    private LocalDate dateProposition;

    private Integer rang;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "professeur_id")
    private Professeur encadrant;
}
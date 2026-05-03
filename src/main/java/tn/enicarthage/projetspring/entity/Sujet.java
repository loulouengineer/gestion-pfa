package tn.enicarthage.projetspring.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "sujets")
public class Sujet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titre;

    @Column
    private Integer rang;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private int difficulte;

    @Builder.Default
    private boolean disponible = true;

    @Builder.Default
    private boolean confirme = false;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "sujet_mots_cles", joinColumns = @JoinColumn(name = "sujet_id"))
    @Column(name = "mot_cle")
    private List<String> motsCles;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "sujet_competences", joinColumns = @JoinColumn(name = "sujet_id"))
    @Column(name = "competence")
    private List<String> competences;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "sujet_technologies", joinColumns = @JoinColumn(name = "sujet_id"))
    @Column(name = "technologie")
    private List<String> technologie;

    @Enumerated(EnumType.STRING)
    private StatutSujet statut = StatutSujet.EN_ATTENTE;

    private LocalDate dateProposition;


    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "enseignant_id")
    private Professeur encadrant;
    public List<String> getTechnologies() {
        return technologie;
    }



    public User getEnseignant() {
        return encadrant;
    }
}
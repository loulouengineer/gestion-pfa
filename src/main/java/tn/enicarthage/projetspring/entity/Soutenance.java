package tn.enicarthage.projetspring.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "soutenance")
public class Soutenance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "binome_id", nullable = false, unique = true)
    private Binome binome;

    @OneToOne
    @JoinColumn(name = "affectation_id", nullable = false)
    private Affectation affectation;

    @OneToOne
    @JoinColumn(name = "creneau_id", nullable = false, unique = true)
    private Creneau creneau;

    @JsonIgnore
    @ManyToMany
    @JoinTable(
            name = "soutenance_jury",
            joinColumns = @JoinColumn(name = "soutenance_id"),
            inverseJoinColumns = @JoinColumn(name = "professeur_id")
    )
    @Builder.Default
    private List<Professeur> jury = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private StatutSoutenance statut = StatutSoutenance.PLANIFIEE;

    private Float note;

    @Column(columnDefinition = "TEXT")
    private String observations;

    private Boolean present;
    private Boolean presentEtudiant1;
    private Boolean presentEtudiant2;
    private String mention;

    public enum StatutSoutenance {
        PLANIFIEE, EN_COURS, TERMINEE, ANNULEE
    }

    public boolean encadrantDansJury() {
        if (affectation == null || affectation.getSujet() == null) return false;
        Professeur encadrant = affectation.getSujet().getEncadrant();
        return encadrant != null && jury != null && jury.contains(encadrant);
    }

    public Sujet getSujet() {
        return affectation != null ? affectation.getSujet() : null;
    }

    public Professeur getEncadrant() {
        Sujet sujet = getSujet();
        return sujet != null ? sujet.getEncadrant() : null;
    }

    public void terminer(float note, String observations, Boolean presentEtudiant1,
                         Boolean presentEtudiant2, String mention) {
        this.statut = StatutSoutenance.TERMINEE;
        this.note = note;
        this.observations = observations;
        this.presentEtudiant1 = presentEtudiant1;
        this.presentEtudiant2 = presentEtudiant2;
        this.mention = mention;
        this.present = Boolean.TRUE.equals(presentEtudiant1) || Boolean.TRUE.equals(presentEtudiant2);
    }

    public void annuler() {
        this.statut = StatutSoutenance.ANNULEE;
        if (this.creneau != null) {
            this.creneau.liberer();
        }
    }
}

package tn.enicarthage.projetspring.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "creneau")
public class Creneau {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private LocalTime heureDebut;

    @Column(nullable = false)
    private LocalTime heureFin;

    @Column(nullable = false)
    @Builder.Default
    private int dureeMinutes = 30;

    private String salle;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private StatutCreneau statut = StatutCreneau.DISPONIBLE;

    @JsonIgnore
    @ManyToMany
    @JoinTable(
            name = "creneau_jury",
            joinColumns = @JoinColumn(name = "creneau_id"),
            inverseJoinColumns = @JoinColumn(name = "professeur_id")
    )
    @Builder.Default
    private List<Professeur> jury = new ArrayList<>();

    public boolean chevauche(Creneau autre) {
        if (!this.date.equals(autre.date)) return false;
        return this.heureDebut.isBefore(autre.heureFin)
                && autre.heureDebut.isBefore(this.heureFin);
    }

    public boolean aConflitJury(Professeur prof) {
        return this.jury != null && this.jury.contains(prof);
    }

    public void occuper() {
        this.statut = StatutCreneau.OCCUPE;
    }

    public void liberer() {
        this.statut = StatutCreneau.DISPONIBLE;
    }

    public void calculerHeureFin() {
        this.heureFin = this.heureDebut.plusMinutes(this.dureeMinutes);
    }

    public boolean estDisponible() {
        return this.statut == StatutCreneau.DISPONIBLE;
    }
}
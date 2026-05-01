package tn.enicarthage.projetspring.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "disponibilite_prof")
public class DisponibiliteProf {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "professeur_id", nullable = false)
    private Professeur professeur;

    private LocalDate date;

    @Enumerated(EnumType.STRING)
    private DayOfWeek jourSemaine;

    @Column(nullable = false)
    private LocalTime heureDebut;

    @Column(nullable = false)
    private LocalTime heureFin;

    @Builder.Default
    @Column(nullable = false)
    private boolean disponible = true;

    public boolean couvre(Creneau creneau) {
        boolean bonJour;
        if (this.date != null) {
            bonJour = this.date.equals(creneau.getDate());
        } else {
            bonJour = this.jourSemaine != null
                    && this.jourSemaine == creneau.getDate().getDayOfWeek();
        }
        if (!bonJour) return false;
        boolean heureOk = !this.heureDebut.isAfter(creneau.getHeureDebut())
                && !this.heureFin.isBefore(creneau.getHeureFin());
        return heureOk && this.disponible;
    }

    public boolean estEnConflit(Creneau creneau) {
        if (this.disponible) return false;
        boolean bonJour;
        if (this.date != null) {
            bonJour = this.date.equals(creneau.getDate());
        } else {
            bonJour = this.jourSemaine != null
                    && this.jourSemaine == creneau.getDate().getDayOfWeek();
        }
        if (!bonJour) return false;
        return this.heureDebut.isBefore(creneau.getHeureFin())
                && creneau.getHeureDebut().isBefore(this.heureFin);
    }
}

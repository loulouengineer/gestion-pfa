package tn.enicarthage.projetspring.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "affectation")
public class Affectation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "binome_id", nullable = false, unique = true)
    private Binome binome;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sujet_id", nullable = false)
    private Sujet sujet;

    @Column(nullable = false)
    private float score;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private StatutAffectation statut = StatutAffectation.EN_ATTENTE;

    private LocalDateTime dateDecision;

    private String commentaireAdmin;

    @Column(nullable = false)
    @Builder.Default
    private boolean verrouillee = false;

    public void valider() {
        if (verrouillee) throw new IllegalStateException("L'affectation est déjà verrouillée.");
        this.statut = StatutAffectation.VALIDEE;
        this.verrouillee = true;
        this.dateDecision = LocalDateTime.now();
    }

    public void refuser(String commentaire) {
        if (verrouillee) throw new IllegalStateException("L'affectation est verrouillée.");
        this.statut = StatutAffectation.REFUSEE;
        this.commentaireAdmin = commentaire;
        this.dateDecision = LocalDateTime.now();
    }

    public void modifier(Sujet nouveauSujet, String commentaire) {
        if (verrouillee) throw new IllegalStateException("L'affectation est verrouillée.");
        this.sujet = nouveauSujet;
        this.commentaireAdmin = commentaire;
    }
}

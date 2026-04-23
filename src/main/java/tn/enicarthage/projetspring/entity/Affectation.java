package tn.enicarthage.projetspring.entity;

import jakarta.persistence.*;
import lombok.*;

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

    // Score calculé par le moteur d'affectation
    @Column(nullable = false)
    private float score;
}
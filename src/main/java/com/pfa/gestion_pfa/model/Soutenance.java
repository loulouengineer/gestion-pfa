package com.pfa.gestion_pfa.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "soutenances")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Soutenance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Date et heure de la soutenance
    private LocalDateTime dateHeure;

    // Salle
    private String salle;

    // Lien vers le binôme
    @ManyToOne
    @JoinColumn(name = "binome_id")
    private Binome binome;

    // Lien vers le professeur jury
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "professeur_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Professeur professeur;

    // Lien vers le sujet
    @ManyToOne
    @JoinColumn(name = "sujet_id")
    private Sujet sujet;
}
package tn.enicarthage.projetspring.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "choix_sujet")
public class ChoixSujet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "binome_id", nullable = false)
    @JsonIgnore
    private Binome binome;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sujet_id", nullable = false)
    @JsonIgnoreProperties({"confirme", "disponible", "professeur"})
    private Sujet sujet;

    @Column(nullable = false)
    private int ordre; // 1 à 5
}
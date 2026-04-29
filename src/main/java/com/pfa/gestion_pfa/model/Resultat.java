package com.pfa.gestion_pfa.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "resultats")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Resultat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ✅ Changé OneToOne → ManyToOne
    @ManyToOne
    @JoinColumn(name = "soutenance_id")
    private Soutenance soutenance;

    // Note globale sur 20
    private Double noteGlobale;

    // Mention : Excellent, Très bien, Bien, Moyen
    private String mention;

    // Remarques du jury
    private String remarques;

    // Notes détaillées par critère
    @OneToMany(mappedBy = "resultat", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<NoteParCritere> notesCriteres;
}


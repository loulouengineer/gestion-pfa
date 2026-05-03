package tn.enicarthage.projetspring.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "notes_criteres")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NoteParCritere {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "resultat_id")
    private Resultat resultat;


    private String critere;

    private Double note;
}
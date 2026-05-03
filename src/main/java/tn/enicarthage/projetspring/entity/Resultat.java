package tn.enicarthage.projetspring.entity;


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


    @ManyToOne
    @JoinColumn(name = "soutenance_id")
    private Soutenance soutenance;


    private Double noteGlobale;


    private String mention;


    private String remarques;


    @OneToMany(mappedBy = "resultat", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<NoteParCritere> notesCriteres;
}
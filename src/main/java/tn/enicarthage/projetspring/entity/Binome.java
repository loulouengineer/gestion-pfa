package tn.enicarthage.projetspring.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "binome")
public class Binome {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "etudiant1_id", nullable = false)
    @JsonIgnoreProperties({"difficultes", "motDePasse"})
    private Etudiant etudiant1;

    @OneToOne
    @JoinColumn(name = "etudiant2_id", nullable = false) // ✅ plus nullable
    @JsonIgnoreProperties({"difficultes", "motDePasse"})
    private Etudiant etudiant2;

    private double moyenneBinome;

    @OneToMany(mappedBy = "binome", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("ordre ASC")
    @JsonIgnore
    private List<ChoixSujet> choix = new ArrayList<>();

    @Builder
    public Binome(Etudiant etudiant1, Etudiant etudiant2) {
        if (etudiant1 == null || etudiant2 == null) {
            throw new IllegalArgumentException("Un binôme doit avoir deux étudiants.");
        }
        this.etudiant1 = etudiant1;
        this.etudiant2 = etudiant2;
        this.choix = new ArrayList<>();
        calculerMoyenne();
    }

    public void calculerMoyenne() {

        this.moyenneBinome = (etudiant1.getMoyenne() + etudiant2.getMoyenne()) / 2f;
    }
}
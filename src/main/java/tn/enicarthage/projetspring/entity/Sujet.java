package tn.enicarthage.projetspring.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "sujets")
public class Sujet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titre;

    @Column
    private Integer rang;
    public Integer getRang() {return rang; }
    public void setRang(Integer rang) { this.rang = rang;}

    @Column(columnDefinition = "TEXT")
    private String description;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "sujet_mots_cles", joinColumns = @JoinColumn(name = "sujet_id"))
    @Column(name = "mot_cle")
    private List<String> motsCles;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "sujet_competences", joinColumns = @JoinColumn(name = "sujet_id"))
    @Column(name = "competence")
    private List<String> competences;

    @Enumerated(EnumType.STRING)
    private StatutSujet statut = StatutSujet.EN_ATTENTE;

    private LocalDate dateProposition;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "enseignant_id")
    private User enseignant;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitre() { return titre; }
    public void setTitre(String titre) { this.titre = titre; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public List<String> getMotsCles() { return motsCles; }
    public void setMotsCles(List<String> motsCles) { this.motsCles = motsCles; }

    public List<String> getCompetences() { return competences; }
    public void setCompetences(List<String> competences) { this.competences = competences; }

    public StatutSujet getStatut() { return statut; }
    public void setStatut(StatutSujet statut) { this.statut = statut; }

    public LocalDate getDateProposition() { return dateProposition; }
    public void setDateProposition(LocalDate dateProposition) { this.dateProposition = dateProposition; }

    public User getEnseignant() { return enseignant; }
    public void setEnseignant(User enseignant) { this.enseignant = enseignant; }
}
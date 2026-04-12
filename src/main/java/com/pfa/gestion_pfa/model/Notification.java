package com.pfa.gestion_pfa.model;
import com.pfa.gestion_pfa.model.Soutenance;
import com.pfa.gestion_pfa.model.Utilisateur;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "notification")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "destinataire_id", nullable = false)
    private Utilisateur destinataire;

    @Column(nullable = false)
    private String titre;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Enumerated(EnumType.STRING)
    private TypeNotification type = TypeNotification.INFO;

    private String lien; // ex: /soutenances/42

    private boolean lue = false;

    @Column(nullable = false)
    private LocalDateTime dateCreation = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "soutenance_id", nullable = true)
    private Soutenance soutenance;

    public enum TypeNotification {
        INFO, DEBUT_SOUTENANCE, FIN_SOUTENANCE, RAPPORT, AVERTISSEMENT
    }
}
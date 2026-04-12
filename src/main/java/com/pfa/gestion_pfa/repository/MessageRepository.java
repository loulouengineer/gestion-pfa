package com.pfa.gestion_pfa.repository;

import com.pfa.gestion_pfa.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    /** Conversation entre deux utilisateurs (bidirectionnelle) */
    @Query("""
        SELECT m FROM Message m
        WHERE (m.expediteur.id = :user1 AND m.destinataire.id = :user2)
           OR (m.expediteur.id = :user2 AND m.destinataire.id = :user1)
        ORDER BY m.dateEnvoi ASC
    """)
    List<Message> findConversation(Long user1, Long user2);

    /** Tous les messages d'un utilisateur (envoyés et reçus) */
    @Query("""
        SELECT m FROM Message m
        WHERE m.expediteur.id = :userId OR m.destinataire.id = :userId
        ORDER BY m.dateEnvoi DESC
    """)
    List<Message> findByUserId(Long userId);

    /** Messages non lus pour un destinataire */
    List<Message> findByDestinataireIdAndLuFalseOrderByDateEnvoiAsc(Long destinataireId);

    /** Derniers messages de chaque conversation pour l'admin */
    @Query("""
        SELECT m FROM Message m
        WHERE m.id IN (
            SELECT MAX(m2.id) FROM Message m2
            WHERE m2.expediteur.id = :adminId OR m2.destinataire.id = :adminId
            GROUP BY CASE
                WHEN m2.expediteur.id = :adminId THEN m2.destinataire.id
                ELSE m2.expediteur.id
            END
        )
        ORDER BY m.dateEnvoi DESC
    """)
    List<Message> findLastMessagesByAdmin(Long adminId);
}
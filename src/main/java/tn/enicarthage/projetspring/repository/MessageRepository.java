package tn.enicarthage.projetspring.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import tn.enicarthage.projetspring.entity.Message;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    @Query("""
        SELECT m FROM Message m
        WHERE (m.expediteur.id = :user1 AND m.destinataire.id = :user2)
           OR (m.expediteur.id = :user2 AND m.destinataire.id = :user1)
        ORDER BY m.dateEnvoi ASC
    """)
    List<Message> findConversation(Long user1, Long user2);

    @Query("""
        SELECT m FROM Message m
        WHERE m.expediteur.id = :userId OR m.destinataire.id = :userId
        ORDER BY m.dateEnvoi DESC
    """)
    List<Message> findByUserId(Long userId);

    List<Message> findByDestinataireIdAndLuFalseOrderByDateEnvoiAsc(Long destinataireId);

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

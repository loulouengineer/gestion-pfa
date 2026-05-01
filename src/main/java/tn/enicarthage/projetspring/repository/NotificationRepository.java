package tn.enicarthage.projetspring.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.enicarthage.projetspring.entity.Notification;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByDestinataireIdOrderByDateCreationDesc(Long destinataireId);

    List<Notification> findByDestinataireIdAndLueFalse(Long destinataireId);

    long countByDestinataireIdAndLueFalse(Long destinataireId);
}

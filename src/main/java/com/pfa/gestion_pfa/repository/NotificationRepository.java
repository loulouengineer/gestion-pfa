package com.pfa.gestion_pfa.repository;

import com.pfa.gestion_pfa.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByDestinataireIdOrderByDateCreationDesc(Long destinataireId);

    List<Notification> findByDestinataireIdAndLueFalse(Long destinataireId);

    long countByDestinataireIdAndLueFalse(Long destinataireId);
}
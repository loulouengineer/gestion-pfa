package com.pfa.gestion_pfa.controller;

import com.pfa.gestion_pfa.model.*;
import com.pfa.gestion_pfa.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationRepository notificationRepository;
    private final UtilisateurRepository  utilisateurRepository;
    private final SoutenanceRepository   soutenanceRepository;
    private final ProfesseurRepository   professeurRepository;

    /** GET /api/notifications?userId=1 */
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAll(@RequestParam Long userId) {
        return ResponseEntity.ok(
                notificationRepository.findByDestinataireIdOrderByDateCreationDesc(userId)
                        .stream().map(this::toMap).collect(Collectors.toList())
        );
    }

    /** GET /api/notifications/unread-count?userId=1 */
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Object>> getUnreadCount(@RequestParam Long userId) {
        return ResponseEntity.ok(Map.of(
                "count", notificationRepository.countByDestinataireIdAndLueFalse(userId)
        ));
    }

    /** PUT /api/notifications/{id}/lire */
    @PutMapping("/{id}/lire")
    public ResponseEntity<Void> marquerLue(@PathVariable Long id) {
        notificationRepository.findById(id).ifPresent(n -> {
            n.setLue(true);
            notificationRepository.save(n);
        });
        return ResponseEntity.ok().build();
    }

    /** PUT /api/notifications/lire-toutes?userId=1 */
    @PutMapping("/lire-toutes")
    public ResponseEntity<Void> marquerToutesLues(@RequestParam Long userId) {
        notificationRepository.findByDestinataireIdAndLueFalse(userId)
                .forEach(n -> { n.setLue(true); notificationRepository.save(n); });
        return ResponseEntity.ok().build();
    }

    /**
     * POST /api/notifications/soutenance/{id}/debut
     * Notifie les membres du jury que la soutenance commence
     */
    @PostMapping("/soutenance/{id}/debut")
    public ResponseEntity<Map<String, Object>> notifierDebut(@PathVariable Long id) {
        Soutenance s = soutenanceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Soutenance introuvable."));

        List<Professeur> jury = professeurRepository.findByCreneauId(s.getCreneau().getId());
        List<Notification> notifs = new ArrayList<>();

        for (Professeur prof : jury) {
            Notification n = new Notification();
            n.setDestinataire(prof);
            n.setTitre("Soutenance en cours");
            n.setMessage(String.format(
                    "La soutenance de %s & %s commence maintenant en %s.",
                    s.getBinome().getEtudiant1().getNom(),
                    s.getBinome().getEtudiant2().getNom(),
                    s.getCreneau().getSalle()
            ));
            n.setType(Notification.TypeNotification.DEBUT_SOUTENANCE);
            n.setSoutenance(s);
            n.setLien("/soutenances/" + s.getId());
            notifs.add(notificationRepository.save(n));
        }

        return ResponseEntity.ok(Map.of("notifieees", notifs.size()));
    }

    /**
     * POST /api/notifications/soutenance/{id}/fin
     * Notifie la fin + lien rapport
     */
    @PostMapping("/soutenance/{id}/fin")
    public ResponseEntity<Map<String, Object>> notifierFin(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, Object> body) {

        Soutenance s = soutenanceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Soutenance introuvable."));

        String lienRapport = body != null ? (String) body.getOrDefault("lienRapport", "") : "";

        List<Professeur> jury = professeurRepository.findByCreneauId(s.getCreneau().getId());
        for (Professeur prof : jury) {
            Notification n = new Notification();
            n.setDestinataire(prof);
            n.setTitre("Soutenance terminée");
            n.setMessage(String.format(
                    "La soutenance de %s & %s est terminée. %s",
                    s.getBinome().getEtudiant1().getNom(),
                    s.getBinome().getEtudiant2().getNom(),
                    lienRapport.isEmpty() ? "" : "Rapport disponible."
            ));
            n.setType(Notification.TypeNotification.FIN_SOUTENANCE);
            n.setSoutenance(s);
            n.setLien(lienRapport.isEmpty() ? "/soutenances/" + s.getId() : lienRapport);
            notificationRepository.save(n);
        }

        return ResponseEntity.ok(Map.of("ok", true));
    }

    /**
     * POST /api/notifications/envoyer
     * Envoi manuel d'une notification à un prof
     * Body: { destinataireId, titre, message, lien }
     */
    @PostMapping("/envoyer")
    public ResponseEntity<Map<String, Object>> envoyerManuel(@RequestBody Map<String, Object> body) {
        Long destId = Long.valueOf(body.get("destinataireId").toString());
        Utilisateur dest = utilisateurRepository.findById(destId)
                .orElseThrow(() -> new IllegalArgumentException("Destinataire introuvable."));

        Notification n = new Notification();
        n.setDestinataire(dest);
        n.setTitre((String) body.get("titre"));
        n.setMessage((String) body.get("message"));
        n.setLien((String) body.getOrDefault("lien", ""));
        n.setType(Notification.TypeNotification.INFO);

        return ResponseEntity.ok(toMap(notificationRepository.save(n)));
    }

    private Map<String, Object> toMap(Notification n) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id",       n.getId());
        map.put("titre",    n.getTitre());
        map.put("message",  n.getMessage());
        map.put("type",     n.getType().name());
        map.put("lien",     n.getLien());
        map.put("lue",      n.isLue());
        map.put("date",     n.getDateCreation().toString());
        if (n.getSoutenance() != null) map.put("soutenanceId", n.getSoutenance().getId());
        return map;
    }
}
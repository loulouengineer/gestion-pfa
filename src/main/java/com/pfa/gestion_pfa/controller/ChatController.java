package com.pfa.gestion_pfa.controller;

import com.pfa.gestion_pfa.model.Message;
import com.pfa.gestion_pfa.model.Utilisateur;
import com.pfa.gestion_pfa.repository.MessageRepository;
import com.pfa.gestion_pfa.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final MessageRepository messageRepository;
    private final UtilisateurRepository utilisateurRepository;

    /**
     * GET /api/chat/conversation?user1=1&user2=2
     * Retourne la conversation entre deux utilisateurs
     */
    @GetMapping("/conversation")
    public ResponseEntity<List<Map<String, Object>>> getConversation(
            @RequestParam Long user1,
            @RequestParam Long user2) {

        List<Message> messages = messageRepository.findConversation(user1, user2);

        // Marquer comme lus pour user1
        messages.stream()
                .filter(m -> m.getDestinataire() != null &&
                        m.getDestinataire().getId().equals(user1) && !m.isLu())
                .forEach(m -> { m.setLu(true); messageRepository.save(m); });

        return ResponseEntity.ok(messages.stream().map(this::toMap).collect(Collectors.toList()));
    }

    /**
     * GET /api/chat/conversations?adminId=1
     * Liste des dernières conversations de l'admin
     */
    @GetMapping("/conversations")
    public ResponseEntity<List<Map<String, Object>>> getConversations(@RequestParam Long adminId) {
        List<Message> lasts = messageRepository.findLastMessagesByAdmin(adminId);
        return ResponseEntity.ok(lasts.stream().map(m -> {
            Map<String, Object> map = new LinkedHashMap<>();
            Utilisateur other = m.getExpediteur().getId().equals(adminId)
                    ? m.getDestinataire()
                    : m.getExpediteur();
            if (other != null) {
                map.put("userId",    other.getId());
                map.put("userName",  other.getNom());
                map.put("lastMsg",   m.getContenu().length() > 60
                        ? m.getContenu().substring(0, 60) + "..." : m.getContenu());
                map.put("date",      m.getDateEnvoi().toString());
                map.put("unread",    messageRepository
                        .findByDestinataireIdAndLuFalseOrderByDateEnvoiAsc(adminId)
                        .stream().filter(u -> u.getExpediteur().getId().equals(other.getId())).count());
            }
            return map;
        }).filter(m -> m.containsKey("userId")).collect(Collectors.toList()));
    }

    /**
     * POST /api/chat/send
     * Body: { expediteurId, destinataireId, contenu }
     */
    @PostMapping("/send")
    public ResponseEntity<Map<String, Object>> sendMessage(@RequestBody Map<String, Object> body) {
        Long expediteurId    = Long.valueOf(body.get("expediteurId").toString());
        Long destinataireId  = Long.valueOf(body.get("destinataireId").toString());
        String contenu       = (String) body.get("contenu");

        if (contenu == null || contenu.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("erreur", "Contenu vide."));
        }

        Utilisateur expediteur   = utilisateurRepository.findById(expediteurId)
                .orElseThrow(() -> new IllegalArgumentException("Expéditeur introuvable."));
        Utilisateur destinataire = utilisateurRepository.findById(destinataireId)
                .orElseThrow(() -> new IllegalArgumentException("Destinataire introuvable."));

        Message msg = new Message();
        msg.setExpediteur(expediteur);
        msg.setDestinataire(destinataire);
        msg.setContenu(contenu.trim());
        msg.setDateEnvoi(LocalDateTime.now());

        return ResponseEntity.ok(toMap(messageRepository.save(msg)));
    }

    /**
     * GET /api/chat/unread?userId=1
     * Nombre de messages non lus
     */
    @GetMapping("/unread")
    public ResponseEntity<Map<String, Object>> getUnread(@RequestParam Long userId) {
        long count = messageRepository.findByDestinataireIdAndLuFalseOrderByDateEnvoiAsc(userId).size();
        return ResponseEntity.ok(Map.of("count", count));
    }

    private Map<String, Object> toMap(Message m) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id",       m.getId());
        map.put("contenu",  m.getContenu());
        map.put("date",     m.getDateEnvoi().toString());
        map.put("lu",       m.isLu());
        map.put("expediteur", Map.of(
                "id",  m.getExpediteur().getId(),
                "nom", m.getExpediteur().getNom()
        ));
        if (m.getDestinataire() != null) {
            map.put("destinataire", Map.of(
                    "id",  m.getDestinataire().getId(),
                    "nom", m.getDestinataire().getNom()
            ));
        }
        return map;
    }
}
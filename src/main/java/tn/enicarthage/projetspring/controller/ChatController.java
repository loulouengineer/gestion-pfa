package tn.enicarthage.projetspring.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.enicarthage.projetspring.entity.Message;
import tn.enicarthage.projetspring.entity.User;
import tn.enicarthage.projetspring.repository.MessageRepository;
import tn.enicarthage.projetspring.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;

    @GetMapping("/conversation")
    public ResponseEntity<List<Map<String, Object>>> getConversation(
            @RequestParam Long user1, @RequestParam Long user2) {

        List<Message> messages = messageRepository.findConversation(user1, user2);

        messages.stream()
                .filter(m -> m.getDestinataire() != null &&
                        m.getDestinataire().getId().equals(user1) && !m.isLu())
                .forEach(m -> { m.setLu(true); messageRepository.save(m); });

        return ResponseEntity.ok(messages.stream().map(this::toMap).collect(Collectors.toList()));
    }

    @GetMapping("/conversations")
    public ResponseEntity<List<Map<String, Object>>> getConversations(@RequestParam Long adminId) {
        List<Message> lasts = messageRepository.findLastMessagesByAdmin(adminId);
        return ResponseEntity.ok(lasts.stream().map(m -> {
            Map<String, Object> map = new LinkedHashMap<>();
            User other = m.getExpediteur().getId().equals(adminId)
                    ? m.getDestinataire() : m.getExpediteur();
            if (other != null) {
                map.put("userId", other.getId());
                map.put("userName", other.getNom());
                map.put("lastMsg", m.getContenu().length() > 60
                        ? m.getContenu().substring(0, 60) + "..." : m.getContenu());
                map.put("date", m.getDateEnvoi().toString());
                map.put("unread", messageRepository
                        .findByDestinataireIdAndLuFalseOrderByDateEnvoiAsc(adminId)
                        .stream().filter(u -> u.getExpediteur().getId().equals(other.getId())).count());
            }
            return map;
        }).filter(m -> m.containsKey("userId")).collect(Collectors.toList()));
    }

    @PostMapping("/send")
    public ResponseEntity<Map<String, Object>> sendMessage(@RequestBody Map<String, Object> body) {
        Long expediteurId = Long.valueOf(body.get("expediteurId").toString());
        Long destinataireId = Long.valueOf(body.get("destinataireId").toString());
        String contenu = (String) body.get("contenu");

        if (contenu == null || contenu.trim().isEmpty())
            return ResponseEntity.badRequest().body(Map.of("erreur", "Contenu vide."));

        User expediteur = userRepository.findById(expediteurId)
                .orElseThrow(() -> new IllegalArgumentException("Expéditeur introuvable."));
        User destinataire = userRepository.findById(destinataireId)
                .orElseThrow(() -> new IllegalArgumentException("Destinataire introuvable."));

        Message msg = new Message();
        msg.setExpediteur(expediteur);
        msg.setDestinataire(destinataire);
        msg.setContenu(contenu.trim());
        msg.setDateEnvoi(LocalDateTime.now());

        return ResponseEntity.ok(toMap(messageRepository.save(msg)));
    }

    @GetMapping("/unread")
    public ResponseEntity<Map<String, Object>> getUnread(@RequestParam Long userId) {
        long count = messageRepository.findByDestinataireIdAndLuFalseOrderByDateEnvoiAsc(userId).size();
        return ResponseEntity.ok(Map.of("count", count));
    }

    private Map<String, Object> toMap(Message m) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", m.getId());
        map.put("contenu", m.getContenu());
        map.put("date", m.getDateEnvoi().toString());
        map.put("lu", m.isLu());
        map.put("expediteur", Map.of("id", m.getExpediteur().getId(), "nom", m.getExpediteur().getNom()));
        if (m.getDestinataire() != null) {
            map.put("destinataire", Map.of("id", m.getDestinataire().getId(), "nom", m.getDestinataire().getNom()));
        }
        return map;
    }
}

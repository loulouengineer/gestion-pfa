package com.pfa.gestion_pfa.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

/**
 * Service d'intégration Ollama pour générer des analyses IA de compatibilité
 * étudiant-sujet. Contibution de Wiem — portée dans le package com.pfa.gestion_pfa.
 */
@Service
public class OllamaService {

    @Value("${ollama.url:http://localhost:11434}")
    private String ollamaUrl;

    @Value("${ollama.model:gemma2:2b}")
    private String model;

    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public String genererRecommandation(String prompt) {
        try {
            String requestBody = objectMapper.writeValueAsString(
                    new OllamaRequest(model, prompt, false)
            );

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(ollamaUrl + "/api/generate"))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = httpClient.send(
                    request, HttpResponse.BodyHandlers.ofString()
            );

            StringBuilder fullResponse = new StringBuilder();
            for (String line : response.body().split("\n")) {
                if (line.trim().isEmpty()) continue;
                try {
                    JsonNode node = objectMapper.readTree(line);
                    if (node.has("response")) {
                        fullResponse.append(node.get("response").asText());
                    }
                    if (node.has("done") && node.get("done").asBoolean()) break;
                } catch (Exception ignored) { }
            }

            String result = fullResponse.toString().trim();
            return result.isEmpty() ? "Analyse IA non disponible" : result;

        } catch (Exception e) {
            System.err.println("Erreur Ollama: " + e.getMessage());
            return "Analyse IA non disponible pour le moment";
        }
    }

    static class OllamaRequest {
        public String model;
        public String prompt;
        public boolean stream;

        public OllamaRequest(String model, String prompt, boolean stream) {
            this.model = model;
            this.prompt = prompt;
            this.stream = stream;
        }
    }
}

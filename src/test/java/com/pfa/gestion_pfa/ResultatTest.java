package com.pfa.gestion_pfa;

import com.pfa.gestion_pfa.service.ResultatService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
public class ResultatTest {

    @Autowired
    private ResultatService resultatService;

    @Test
    public void testGetAllResultats() {
        try {
            System.out.println("Fetching resultats...");
            var resultats = resultatService.getAllResultats();
            System.out.println("Fetched " + resultats.size() + " resultats.");
            for (var r : resultats) {
                var dto = com.pfa.gestion_pfa.dto.ResultatMapper.toDTO(r);
                System.out.println("Mapped DTO: " + dto);
            }
        } catch (Exception e) {
            e.printStackTrace();
            throw e;
        }
    }
}

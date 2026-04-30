package tn.enicarthage.projetspring.controller;


import tn.enicarthage.projetspring.dto.DashboardDTO;
import tn.enicarthage.projetspring.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/{etudiantId}")
    public ResponseEntity<DashboardDTO> getDashboardData(@PathVariable Long etudiantId) {
        DashboardDTO data = dashboardService.getDashboardData(etudiantId);
        return ResponseEntity.ok(data);
    }
}
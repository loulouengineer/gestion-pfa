package tn.enicarthage.projetspring.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DashboardDTO {
    private String statutGlobal;
    private String statutGlobalSub;
    private String binomeStatus;
    private String binomeStatusSub;
    private String sujetStatus;
    private String sujetStatusSub;
    private Integer joursRestants;
    private String joursRestantsSub;
    private int progressPercentage;
    private int currentStep;


    private String dateSoutenance;
    private String heureSoutenance;
    private String salleSoutenance;
}
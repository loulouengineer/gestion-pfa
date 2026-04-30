package tn.enicarthage.projetspring.controller;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;
import tn.enicarthage.projetspring.dto.ResultatDTO;
import tn.enicarthage.projetspring.dto.ResultatMapper;
import tn.enicarthage.projetspring.entity.Resultat;
import tn.enicarthage.projetspring.service.ResultatService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@RestController
@RequestMapping("/api/resultats")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ResultatController {

    private final ResultatService resultatService;

    // ── GET tous les résultats ──
    @GetMapping
    public ResponseEntity<List<ResultatDTO>> getAllResultats() {
        List<ResultatDTO> dtos = resultatService.getAllResultats()
                .stream()
                .map(ResultatMapper::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    // ── GET statistiques ──
    @GetMapping("/statistiques")
    public ResponseEntity<Map<String, Double>> getStatistiques() {
        return ResponseEntity.ok(Map.of(
                "moyenne", orZero(resultatService.getMoyenne()),
                "noteMax", orZero(resultatService.getNoteMax()),
                "noteMin", orZero(resultatService.getNoteMin())
        ));
    }

    // ── POST créer ──
    @PostMapping
    public ResponseEntity<ResultatDTO> createResultat(@RequestBody Resultat resultat) {
        return ResponseEntity.ok(ResultatMapper.toDTO(resultatService.saveResultat(resultat)));
    }

    // ── PUT modifier ──
    @PutMapping("/{id}")
    public ResponseEntity<ResultatDTO> updateResultat(
            @PathVariable Long id, @RequestBody Resultat resultat) {
        return resultatService.getResultatById(id)
                .map(existing -> {
                    resultat.setId(id);
                    return ResponseEntity.ok(ResultatMapper.toDTO(resultatService.saveResultat(resultat)));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ── DELETE ──
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResultat(@PathVariable Long id) {
        resultatService.deleteResultat(id);
        return ResponseEntity.noContent().build();
    }

    // ── Export PDF ──
    @GetMapping("/export/pdf")
    public void exportPDF(HttpServletResponse response) throws IOException, DocumentException {
        response.setContentType("application/pdf");
        response.setHeader("Content-Disposition", "attachment; filename=resultats.pdf");

        Document doc = new Document(PageSize.A4);
        PdfWriter.getInstance(doc, response.getOutputStream());
        doc.open();

        // Titre
        com.itextpdf.text.Font titleFont = FontFactory.getFont(
                FontFactory.HELVETICA_BOLD, 18, BaseColor.BLACK);
        Paragraph title = new Paragraph("Résultats des Soutenances PFA", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        doc.add(title);
        doc.add(new Paragraph(" "));

        // Tableau
        PdfPTable table = new PdfPTable(5);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{0.5f, 2f, 2f, 1f, 1.5f});

        Stream.of("#", "Étudiant", "Projet", "Note", "Mention").forEach(col -> {
            PdfPCell cell = new PdfPCell(new Phrase(col,
                    FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, BaseColor.WHITE)));
            cell.setBackgroundColor(new BaseColor(67, 97, 238));
            cell.setPadding(8);
            table.addCell(cell);
        });

        List<ResultatDTO> resultats = resultatService.getAllResultats()
                .stream().map(ResultatMapper::toDTO).collect(Collectors.toList());

        int i = 1;
        for (ResultatDTO r : resultats) {
            BaseColor rowColor = (i % 2 == 0) ? new BaseColor(248, 249, 251) : BaseColor.WHITE;
            String etudiant = Stream.of(r.getEtudiant1(), r.getEtudiant2())
                    .filter(e -> e != null && !e.isEmpty())
                    .collect(Collectors.joining(" & "));

            addCell(table, String.valueOf(i), rowColor);
            addCell(table, etudiant.isEmpty() ? "—" : etudiant, rowColor);
            addCell(table, r.getProjetTitre() != null ? r.getProjetTitre() : "—", rowColor);
            addCell(table, r.getNoteGlobale() != null ? r.getNoteGlobale() + "/20" : "—", rowColor);
            addCell(table, r.getMention() != null ? r.getMention() : "—", rowColor);
            i++;
        }

        doc.add(table);
        doc.close();
    }

    private void addCell(PdfPTable table, String text, BaseColor bg) {
        PdfPCell cell = new PdfPCell(new Phrase(text,
                FontFactory.getFont(FontFactory.HELVETICA, 10)));
        cell.setBackgroundColor(bg);
        cell.setPadding(6);
        table.addCell(cell);
    }

    // ── Export Excel ──
    @GetMapping("/export/excel")
    public void exportExcel(HttpServletResponse response) throws IOException {
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setHeader("Content-Disposition", "attachment; filename=resultats.xlsx");

        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Résultats");

        // Style header
        CellStyle headerStyle = workbook.createCellStyle();
        Font headerFont = workbook.createFont();
        headerFont.setBold(true);
        headerFont.setColor(IndexedColors.WHITE.getIndex());
        headerStyle.setFont(headerFont);
        headerStyle.setFillForegroundColor(IndexedColors.ROYAL_BLUE.getIndex());
        headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

        Row header = sheet.createRow(0);
        String[] cols = {"#", "Étudiant(s)", "Projet", "Note /20", "Mention", "Jury", "Salle", "Date"};
        for (int i = 0; i < cols.length; i++) {
            Cell cell = header.createCell(i);
            cell.setCellValue(cols[i]);
            cell.setCellStyle(headerStyle);
            sheet.setColumnWidth(i, 5000);
        }

        List<ResultatDTO> resultats = resultatService.getAllResultats()
                .stream().map(ResultatMapper::toDTO).collect(Collectors.toList());

        int rowIdx = 1;
        for (ResultatDTO r : resultats) {
            Row row = sheet.createRow(rowIdx);
            String etudiant = Stream.of(r.getEtudiant1(), r.getEtudiant2())
                    .filter(e -> e != null && !e.isEmpty())
                    .collect(Collectors.joining(" & "));

            row.createCell(0).setCellValue(rowIdx);
            row.createCell(1).setCellValue(etudiant.isEmpty() ? "—" : etudiant);
            row.createCell(2).setCellValue(r.getProjetTitre()   != null ? r.getProjetTitre()   : "—");
            row.createCell(3).setCellValue(r.getNoteGlobale()   != null ? r.getNoteGlobale()   : 0);
            row.createCell(4).setCellValue(r.getMention()       != null ? r.getMention()       : "—");
            row.createCell(5).setCellValue(r.getProfesseurNom() != null ? r.getProfesseurNom() : "—");
            row.createCell(6).setCellValue(r.getSalle()         != null ? r.getSalle()         : "—");
            row.createCell(7).setCellValue(r.getDateHeure()     != null ? r.getDateHeure()     : "—");
            rowIdx++;
        }

        workbook.write(response.getOutputStream());
        workbook.close();
    }

    private double orZero(Double val) {
        return val != null ? val : 0.0;
    }
}
package com.piun.piuproject.controller;

import com.piun.piuproject.model.*;
import com.piun.piuproject.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/risks")
public class RiskAssessmentController {

    @Autowired
    private RiskAssessmentRepository riskRepository;

    @Autowired
    private RiskMitigationRepository mitigationRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private ContractProfilingWorksRepository worksRepository;

    @Autowired
    private ContractProfilingGoodsRepository goodsRepository;

    @Autowired
    private ESIARepository esiaRepository;

    @Autowired
    private GrievanceRepository grievanceRepository;

    @GetMapping
    public List<RiskAssessment> getAll() {
        return riskRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<RiskAssessment> getById(@PathVariable Long id) {
        return riskRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/project/{projectId}")
    public List<RiskAssessment> getByProject(@PathVariable String projectId) {
        return riskRepository.findByProject_ProjectId(projectId);
    }

    @GetMapping("/stats")
    public Map<String, Object> getStats() {
        Map<String, Object> stats = new LinkedHashMap<>();
        long total = riskRepository.count();
        stats.put("total", total);
        stats.put("critical", riskRepository.countByRiskLevel("Critical"));
        stats.put("high", riskRepository.countByRiskLevel("High"));
        stats.put("medium", riskRepository.countByRiskLevel("Medium"));
        stats.put("low", riskRepository.countByRiskLevel("Low"));
        stats.put("identified", riskRepository.countByStatus("Identified"));
        stats.put("mitigating", riskRepository.countByStatus("Mitigating"));
        stats.put("resolved", riskRepository.countByStatus("Resolved"));
        return stats;
    }

    @PostMapping
    public RiskAssessment create(@RequestBody RiskAssessment risk) {
        computeRiskScoreAndLevel(risk);
        if (risk.getSource() == null || risk.getSource().isEmpty()) {
            risk.setSource("Manual");
        }
        RiskAssessment saved = riskRepository.save(risk);
        if (saved.getRiskId() == null || saved.getRiskId().isEmpty()) {
            saved.setRiskId("RISK-" + String.format("%04d", saved.getId()));
            saved = riskRepository.save(saved);
        }
        return saved;
    }

    @PutMapping("/{id}")
    public ResponseEntity<RiskAssessment> update(@PathVariable Long id, @RequestBody RiskAssessment details) {
        return riskRepository.findById(id)
                .map(risk -> {
                    risk.setProject(details.getProject());
                    risk.setRiskCategory(details.getRiskCategory());
                    risk.setRiskTitle(details.getRiskTitle());
                    risk.setRiskDescription(details.getRiskDescription());
                    risk.setLikelihood(details.getLikelihood());
                    risk.setImpact(details.getImpact());
                    risk.setStatus(details.getStatus());
                    risk.setIdentifiedDate(details.getIdentifiedDate());
                    risk.setIdentifiedBy(details.getIdentifiedBy());
                    risk.setRiskOwner(details.getRiskOwner());
                    risk.setDueDate(details.getDueDate());
                    risk.setRemarks(details.getRemarks());
                    computeRiskScoreAndLevel(risk);
                    return ResponseEntity.ok(riskRepository.save(risk));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        return riskRepository.findById(id)
                .map(risk -> {
                    List<RiskMitigation> mitigations = mitigationRepository.findByRiskAssessment_Id(id);
                    mitigationRepository.deleteAll(mitigations);
                    riskRepository.delete(risk);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{riskId}/mitigations")
    public List<RiskMitigation> getMitigations(@PathVariable Long riskId) {
        return mitigationRepository.findByRiskAssessment_Id(riskId);
    }

    @PostMapping("/{riskId}/mitigations")
    public ResponseEntity<RiskMitigation> createMitigation(@PathVariable Long riskId, @RequestBody RiskMitigation mitigation) {
        return riskRepository.findById(riskId)
                .map(risk -> {
                    mitigation.setRiskAssessment(risk);
                    return ResponseEntity.ok(mitigationRepository.save(mitigation));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/mitigations/{id}")
    public ResponseEntity<RiskMitigation> updateMitigation(@PathVariable Long id, @RequestBody RiskMitigation details) {
        return mitigationRepository.findById(id)
                .map(m -> {
                    m.setStrategy(details.getStrategy());
                    m.setActionDescription(details.getActionDescription());
                    m.setResponsiblePerson(details.getResponsiblePerson());
                    m.setTargetDate(details.getTargetDate());
                    m.setCompletionDate(details.getCompletionDate());
                    m.setStatus(details.getStatus());
                    m.setEffectiveness(details.getEffectiveness());
                    m.setRemarks(details.getRemarks());
                    return ResponseEntity.ok(mitigationRepository.save(m));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/mitigations/{id}")
    public ResponseEntity<?> deleteMitigation(@PathVariable Long id) {
        return mitigationRepository.findById(id)
                .map(m -> {
                    mitigationRepository.delete(m);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/auto-identify")
    public Map<String, Object> autoIdentifyRisks() {
        List<RiskAssessment> identified = new ArrayList<>();
        LocalDate today = LocalDate.now();

        List<Project> projects = projectRepository.findAll();

        for (Project project : projects) {
            String pid = project.getProjectId();

            List<RiskAssessment> existingProjectRisks = riskRepository.findByProject_ProjectId(pid);
            List<ContractProfilingWorks> works = worksRepository.findByProject_ProjectId(pid);
            for (ContractProfilingWorks w : works) {
                if (w.getContractEndDate() != null && w.getContractEndDate().isBefore(today)) {
                    String identifier = w.getContractRefNo() != null ? w.getContractRefNo() : "ID-" + w.getId();
                    boolean exists = existingProjectRisks.stream()
                            .anyMatch(r -> "Automated".equals(r.getSource())
                                    && r.getRiskTitle() != null
                                    && r.getRiskTitle().contains("Overdue Works Contract")
                                    && r.getRiskTitle().contains(identifier));
                    if (!exists) {
                        RiskAssessment risk = new RiskAssessment();
                        risk.setProject(project);
                        risk.setRiskCategory("Schedule");
                        risk.setRiskTitle("Overdue Works Contract: " + identifier);
                        risk.setRiskDescription("Works contract has passed its end date (" + w.getContractEndDate() + "). Contractor: " + (w.getNameOfContractor() != null ? w.getNameOfContractor() : "N/A") + ". This may indicate delays requiring immediate attention.");
                        risk.setLikelihood("High");
                        risk.setImpact("High");
                        risk.setStatus("Identified");
                        risk.setIdentifiedDate(today);
                        risk.setIdentifiedBy("System");
                        risk.setSource("Automated");
                        computeRiskScoreAndLevel(risk);
                        RiskAssessment saved = riskRepository.save(risk);
                        saved.setRiskId("RISK-" + String.format("%04d", saved.getId()));
                        riskRepository.save(saved);
                        identified.add(saved);
                    }
                }
            }

            List<ContractProfilingGoods> goods = goodsRepository.findByProject_ProjectId(pid);
            for (ContractProfilingGoods g : goods) {
                if (g.getContractEndDate() != null && g.getContractEndDate().isBefore(today)) {
                    String gIdentifier = g.getContractRefNo() != null ? g.getContractRefNo() : "ID-" + g.getId();
                    boolean exists = existingProjectRisks.stream()
                            .anyMatch(r -> "Automated".equals(r.getSource())
                                    && r.getRiskTitle() != null
                                    && r.getRiskTitle().contains("Overdue Goods Contract")
                                    && r.getRiskTitle().contains(gIdentifier));
                    if (!exists) {
                        RiskAssessment risk = new RiskAssessment();
                        risk.setProject(project);
                        risk.setRiskCategory("Schedule");
                        risk.setRiskTitle("Overdue Goods Contract: " + gIdentifier);
                        risk.setRiskDescription("Goods/services contract has passed its end date (" + g.getContractEndDate() + "). Supplier: " + (g.getNameOfSupplier() != null ? g.getNameOfSupplier() : "N/A") + ". Review delivery status and take corrective action.");
                        risk.setLikelihood("High");
                        risk.setImpact("Medium");
                        risk.setStatus("Identified");
                        risk.setIdentifiedDate(today);
                        risk.setIdentifiedBy("System");
                        risk.setSource("Automated");
                        computeRiskScoreAndLevel(risk);
                        RiskAssessment saved = riskRepository.save(risk);
                        saved.setRiskId("RISK-" + String.format("%04d", saved.getId()));
                        riskRepository.save(saved);
                        identified.add(saved);
                    }
                }
            }

            List<ESIA> esiaList = esiaRepository.findByProject_ProjectId(pid);
            if (esiaList.isEmpty()) {
                boolean exists = existingProjectRisks.stream()
                        .anyMatch(r -> "Automated".equals(r.getSource())
                                && r.getRiskTitle() != null
                                && r.getRiskTitle().contains("Missing ESIA"));
                if (!exists) {
                    RiskAssessment risk = new RiskAssessment();
                    risk.setProject(project);
                    risk.setRiskCategory("Environmental");
                    risk.setRiskTitle("Missing ESIA Compliance for " + project.getProject());
                    risk.setRiskDescription("No Environmental and Social Impact Assessment (ESIA) records found for this project. This poses regulatory and compliance risks.");
                    risk.setLikelihood("Medium");
                    risk.setImpact("High");
                    risk.setStatus("Identified");
                    risk.setIdentifiedDate(today);
                    risk.setIdentifiedBy("System");
                    risk.setSource("Automated");
                    computeRiskScoreAndLevel(risk);
                    RiskAssessment saved = riskRepository.save(risk);
                    saved.setRiskId("RISK-" + String.format("%04d", saved.getId()));
                    riskRepository.save(saved);
                    identified.add(saved);
                }
            }

            List<GrievanceMonitoringLog> grievances = grievanceRepository.findByProject_ProjectId(pid);
            long unresolvedCount = grievances.stream()
                    .filter(g -> g.getDecisionOutcome() == null || (!"Y".equalsIgnoreCase(g.getComplainantSatisfied())))
                    .count();
            if (unresolvedCount >= 3) {
                boolean exists = existingProjectRisks.stream()
                        .anyMatch(r -> "Automated".equals(r.getSource())
                                && r.getRiskTitle() != null
                                && r.getRiskTitle().contains("Multiple Unresolved Grievances"));
                if (!exists) {
                    RiskAssessment risk = new RiskAssessment();
                    risk.setProject(project);
                    risk.setRiskCategory("Social");
                    risk.setRiskTitle("Multiple Unresolved Grievances for " + project.getProject());
                    risk.setRiskDescription(unresolvedCount + " unresolved grievance(s) detected. High volume of unresolved community grievances may indicate stakeholder dissatisfaction and project acceptance risks.");
                    risk.setLikelihood("High");
                    risk.setImpact("Medium");
                    risk.setStatus("Identified");
                    risk.setIdentifiedDate(today);
                    risk.setIdentifiedBy("System");
                    risk.setSource("Automated");
                    computeRiskScoreAndLevel(risk);
                    RiskAssessment saved = riskRepository.save(risk);
                    saved.setRiskId("RISK-" + String.format("%04d", saved.getId()));
                    riskRepository.save(saved);
                    identified.add(saved);
                }
            }
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("risksIdentified", identified.size());
        result.put("risks", identified);
        return result;
    }

    private void computeRiskScoreAndLevel(RiskAssessment risk) {
        int likelihoodVal = mapScale(risk.getLikelihood());
        int impactVal = mapScale(risk.getImpact());
        int score = likelihoodVal * impactVal;
        risk.setRiskScore(score);

        if (score >= 20) risk.setRiskLevel("Critical");
        else if (score >= 12) risk.setRiskLevel("High");
        else if (score >= 6) risk.setRiskLevel("Medium");
        else risk.setRiskLevel("Low");
    }

    private int mapScale(String value) {
        if (value == null) return 1;
        return switch (value) {
            case "Very High" -> 5;
            case "High" -> 4;
            case "Medium" -> 3;
            case "Low" -> 2;
            case "Very Low" -> 1;
            default -> 1;
        };
    }
}

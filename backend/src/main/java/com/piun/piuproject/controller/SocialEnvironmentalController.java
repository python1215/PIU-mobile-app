package com.piun.piuproject.controller;

import com.piun.piuproject.model.*;
import com.piun.piuproject.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/social-environmental")
@CrossOrigin(origins = "*")
public class SocialEnvironmentalController {

    @Autowired
    private ESIARepository esiaRepository;
    
    @Autowired
    private PAPRepository papRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private KPIContractSetupRepository kpiContractSetupRepository;

    @Autowired
    private RegionRepository regionRepository;

    @Autowired
    private DistrictRepository districtRepository;

    @Autowired
    private TypeOfPAPRepository papTypeRepository;

    @Autowired
    private PAPCategoryRepository papCategoryRepository;

    @Autowired
    private VulnerabilityCategoryRepository vulnerabilityCategoryRepository;

    @Autowired
    private SettlementRepository settlementRepository;

    @Autowired
    private TypeOfImpactRepository impactTypeRepository;

    @Autowired
    private NatureOfSettlementRepository natureOfSettlementRepository;

    @Autowired
    private CurrencyRepository currencyRepository;
    
    @Autowired
    private GrievanceRepository grievanceRepository;

    @Autowired
    private DecisionOutcomeRepository decisionOutcomeRepository;
    
    @Autowired
    private OHSMonitoringRepository ohsRepository;
    
    @Autowired
    private CommunityEngagementRepository engagementRepository;

    @Autowired
    private StakeholderEngagementTypeRepository stakeholderEngagementTypeRepository;

    @Autowired
    private YearRepository yearRepository;

    @Autowired
    private QuarterRepository quarterRepository;

    @Autowired
    private IdentificationDocumentRepository identificationDocumentRepository;

    @Autowired
    private ElectricityFeederRepository electricityFeederRepository;

    @Autowired
    private KpiEssOhsRepository kpiEssOhsRepository;

    @GetMapping("/esia")
    public List<ESIA> getAllESIA() {
        return esiaRepository.findAll();
    }

    @GetMapping("/esia/project/{projectId}")
    public List<ESIA> getESIAByProject(@PathVariable String projectId) {
        return esiaRepository.findByProject_ProjectId(projectId);
    }

    @PostMapping("/esia")
    public ESIA createESIA(@RequestBody ESIA esia) {
        ESIA saved = esiaRepository.save(esia);
        if (saved.getEsiaId() == null || saved.getEsiaId().isEmpty()) {
            saved.setEsiaId("ESIA-" + String.format("%04d", saved.getId()));
            saved = esiaRepository.save(saved);
        }
        return saved;
    }

    @PutMapping("/esia/{id}")
    public ResponseEntity<ESIA> updateESIA(@PathVariable Long id, @RequestBody ESIA esiaDetails) {
        return esiaRepository.findById(id)
            .map(esia -> {
                esia.setEsiaId(esiaDetails.getEsiaId());
                esia.setProject(esiaDetails.getProject());
                esia.setTypeOfInvestment(esiaDetails.getTypeOfInvestment());
                esia.setProjectDuration(esiaDetails.getProjectDuration());
                esia.setProjectPhase(esiaDetails.getProjectPhase());
                esia.setProjectLocations(esiaDetails.getProjectLocations());
                esia.setNumberOfCommunities(esiaDetails.getNumberOfCommunities());
                esia.setEsiaFindings(esiaDetails.getEsiaFindings());
                return ResponseEntity.ok(esiaRepository.save(esia));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/esia/{id}")
    public ResponseEntity<Void> deleteESIA(@PathVariable Long id) {
        return esiaRepository.findById(id)
            .map(esia -> {
                esiaRepository.delete(esia);
                return ResponseEntity.ok().<Void>build();
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/pap")
    public List<PAP> getAllPAP() {
        return papRepository.findAll();
    }

    @GetMapping("/pap/project/{projectId}")
    public List<PAP> getPAPByProject(@PathVariable String projectId) {
        return papRepository.findByProject_ProjectId(projectId);
    }

    private void resolvePAPReferences(PAP pap) {
        if (pap.getProject() != null && pap.getProject().getProjectId() != null) {
            pap.setProject(projectRepository.findById(pap.getProject().getProjectId()).orElse(null));
        }
        if (pap.getInvestmentType() != null && pap.getInvestmentType().getId() != null) {
            pap.setInvestmentType(kpiContractSetupRepository.findById(pap.getInvestmentType().getId()).orElse(null));
        }
        if (pap.getRegion() != null && pap.getRegion().getRegionCode() != null) {
            pap.setRegion(regionRepository.findById(pap.getRegion().getRegionCode()).orElse(null));
        }
        if (pap.getDistrict() != null && pap.getDistrict().getDistrictCode() != null) {
            pap.setDistrict(districtRepository.findById(pap.getDistrict().getDistrictCode()).orElse(null));
        }
        if (pap.getPapType() != null && pap.getPapType().getId() != null) {
            pap.setPapType(papTypeRepository.findById(pap.getPapType().getId()).orElse(null));
        }
        if (pap.getPapCategory() != null && pap.getPapCategory().getId() != null) {
            pap.setPapCategory(papCategoryRepository.findById(pap.getPapCategory().getId()).orElse(null));
        }
        if (pap.getVulnerabilityCategory() != null && pap.getVulnerabilityCategory().getId() != null) {
            pap.setVulnerabilityCategory(vulnerabilityCategoryRepository.findById(pap.getVulnerabilityCategory().getId()).orElse(null));
        }
        if (pap.getCurrentAddress() != null && pap.getCurrentAddress().getSettlementCode() != null) {
            pap.setCurrentAddress(settlementRepository.findById(pap.getCurrentAddress().getSettlementCode()).orElse(null));
        }
        if (pap.getImpactType() != null && pap.getImpactType().getId() != null) {
            pap.setImpactType(impactTypeRepository.findById(pap.getImpactType().getId()).orElse(null));
        }
        if (pap.getNatureOfCompensation() != null && pap.getNatureOfCompensation().getId() != null) {
            pap.setNatureOfCompensation(natureOfSettlementRepository.findById(pap.getNatureOfCompensation().getId()).orElse(null));
        }
        if (pap.getProfileYear() != null && pap.getProfileYear().getId() != null) {
            pap.setProfileYear(yearRepository.findById(pap.getProfileYear().getId()).orElse(null));
        }
        if (pap.getElectricityFeeder() != null && pap.getElectricityFeeder().getId() != null) {
            pap.setElectricityFeeder(electricityFeederRepository.findById(pap.getElectricityFeeder().getId()).orElse(null));
        }
        if (pap.getCompensationType() != null && pap.getCompensationType().getId() != null) {
            pap.setCompensationType(natureOfSettlementRepository.findById(pap.getCompensationType().getId()).orElse(null));
        }
        if (pap.getCompensationCurrency() != null && pap.getCompensationCurrency().getId() != null) {
            pap.setCompensationCurrency(currencyRepository.findById(pap.getCompensationCurrency().getId()).orElse(null));
        }
        if (pap.getIdentificationDocument() != null && pap.getIdentificationDocument().getId() != null) {
            pap.setIdentificationDocument(identificationDocumentRepository.findById(pap.getIdentificationDocument().getId()).orElse(null));
        }
    }

    @PostMapping("/pap")
    public PAP createPAP(@RequestBody PAP pap) {
        resolvePAPReferences(pap);
        return papRepository.save(pap);
    }

    @PutMapping("/pap/{id}")
    public ResponseEntity<PAP> updatePAP(@PathVariable String id, @RequestBody PAP papDetails) {
        return papRepository.findById(id)
            .map(pap -> {
                resolvePAPReferences(papDetails);
                pap.setProject(papDetails.getProject());
                pap.setInvestmentType(papDetails.getInvestmentType());
                pap.setRegion(papDetails.getRegion());
                pap.setDistrict(papDetails.getDistrict());
                pap.setPapName(papDetails.getPapName());
                pap.setSex(papDetails.getSex());
                pap.setPapType(papDetails.getPapType());
                pap.setPapCategory(papDetails.getPapCategory());
                pap.setVulnerabilityCategory(papDetails.getVulnerabilityCategory());
                pap.setLocationOfImpact(papDetails.getLocationOfImpact());
                pap.setImpactType(papDetails.getImpactType());
                pap.setNatureOfCompensation(papDetails.getNatureOfCompensation());
                pap.setAmount(papDetails.getAmount());
                pap.setArea(papDetails.getArea());
                pap.setPapCompensated(papDetails.getPapCompensated());
                pap.setCompensationDate(papDetails.getCompensationDate());
                pap.setCompensationRefNo(papDetails.getCompensationRefNo());
                pap.setPreProjectSituation(papDetails.getPreProjectSituation());
                pap.setCurrentAddress(papDetails.getCurrentAddress());
                pap.setRemarks(papDetails.getRemarks());
                pap.setProfileYear(papDetails.getProfileYear());
                pap.setElectricityFeeder(papDetails.getElectricityFeeder());
                pap.setImpactLatitude(papDetails.getImpactLatitude());
                pap.setImpactLongitude(papDetails.getImpactLongitude());
                pap.setCompensationType(papDetails.getCompensationType());
                pap.setIdentificationDocument(papDetails.getIdentificationDocument());
                pap.setIdDocumentUpload(papDetails.getIdDocumentUpload());
                pap.setDateReceivedFrom(papDetails.getDateReceivedFrom());
                pap.setDateReceivedTo(papDetails.getDateReceivedTo());
                return ResponseEntity.ok(papRepository.save(pap));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/pap/{id}")
    public ResponseEntity<Void> deletePAP(@PathVariable String id) {
        return papRepository.findById(id)
            .map(pap -> {
                papRepository.delete(pap);
                return ResponseEntity.ok().<Void>build();
            })
            .orElse(ResponseEntity.notFound().build());
    }

    private void resolveGrievanceReferences(GrievanceMonitoringLog g) {
        if (g.getProject() != null && g.getProject().getProjectId() != null) {
            g.setProject(projectRepository.findById(g.getProject().getProjectId()).orElse(null));
        }
        if (g.getInvestmentType() != null && g.getInvestmentType().getId() != null) {
            g.setInvestmentType(kpiContractSetupRepository.findById(g.getInvestmentType().getId()).orElse(null));
        }
        if (g.getDecisionOutcome() != null && g.getDecisionOutcome().getId() != null) {
            g.setDecisionOutcome(decisionOutcomeRepository.findById(g.getDecisionOutcome().getId()).orElse(null));
        }
    }

    @GetMapping("/grievance")
    public List<GrievanceMonitoringLog> getAllGrievances() {
        return grievanceRepository.findAll();
    }

    @GetMapping("/grievance/project/{projectId}")
    public List<GrievanceMonitoringLog> getGrievancesByProject(@PathVariable String projectId) {
        return grievanceRepository.findByProject_ProjectId(projectId);
    }

    @PostMapping("/grievance")
    public GrievanceMonitoringLog createGrievance(@RequestBody GrievanceMonitoringLog grievance) {
        resolveGrievanceReferences(grievance);
        return grievanceRepository.save(grievance);
    }

    @PutMapping("/grievance/{id}")
    public ResponseEntity<GrievanceMonitoringLog> updateGrievance(@PathVariable String id, @RequestBody GrievanceMonitoringLog grievanceDetails) {
        return grievanceRepository.findById(id)
            .map(grievance -> {
                resolveGrievanceReferences(grievanceDetails);
                grievance.setProject(grievanceDetails.getProject());
                grievance.setInvestmentType(grievanceDetails.getInvestmentType());
                grievance.setSex(grievanceDetails.getSex());
                grievance.setDateClaimReceived(grievanceDetails.getDateClaimReceived());
                grievance.setPersonReceivingComplaint(grievanceDetails.getPersonReceivingComplaint());
                grievance.setHowComplaintReceived(grievanceDetails.getHowComplaintReceived());
                grievance.setNameOfComplainant(grievanceDetails.getNameOfComplainant());
                grievance.setPhoneNumber(grievanceDetails.getPhoneNumber());
                grievance.setComplaintContent(grievanceDetails.getComplaintContent());
                grievance.setComplaintAcknowledged(grievanceDetails.getComplaintAcknowledged());
                grievance.setExpectedDecisionDate(grievanceDetails.getExpectedDecisionDate());
                grievance.setDecisionOutcome(grievanceDetails.getDecisionOutcome());
                grievance.setResolution(grievanceDetails.getResolution());
                grievance.setDecisionCommunicated(grievanceDetails.getDecisionCommunicated());
                grievance.setCommunicationMethod(grievanceDetails.getCommunicationMethod());
                grievance.setComplainantSatisfied(grievanceDetails.getComplainantSatisfied());
                grievance.setBriefNoteNoAnswer(grievanceDetails.getBriefNoteNoAnswer());
                grievance.setFollowUpActions(grievanceDetails.getFollowUpActions());
                return ResponseEntity.ok(grievanceRepository.save(grievance));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/grievance/{id}")
    public ResponseEntity<Void> deleteGrievance(@PathVariable String id) {
        return grievanceRepository.findById(id)
            .map(grievance -> {
                grievanceRepository.delete(grievance);
                return ResponseEntity.ok().<Void>build();
            })
            .orElse(ResponseEntity.notFound().build());
    }

    private void resolveOHSReferences(OHSMonitoring ohs) {
        if (ohs.getProject() != null && ohs.getProject().getProjectId() != null) {
            ohs.setProject(projectRepository.findById(ohs.getProject().getProjectId()).orElse(null));
        }
        if (ohs.getInvestmentType() != null && ohs.getInvestmentType().getId() != null) {
            ohs.setInvestmentType(kpiContractSetupRepository.findById(ohs.getInvestmentType().getId()).orElse(null));
        }
        if (ohs.getKpiDescription() != null && ohs.getKpiDescription().getId() != null) {
            ohs.setKpiDescription(kpiContractSetupRepository.findById(ohs.getKpiDescription().getId()).orElse(null));
        }
        if (ohs.getYear() != null && ohs.getYear().getId() != null) {
            ohs.setYear(yearRepository.findById(ohs.getYear().getId()).orElse(null));
        }
        if (ohs.getQuarter() != null && ohs.getQuarter().getId() != null) {
            ohs.setQuarter(quarterRepository.findById(ohs.getQuarter().getId()).orElse(null));
        }
        if (ohs.getRegion() != null && ohs.getRegion().getRegionCode() != null) {
            ohs.setRegion(regionRepository.findById(ohs.getRegion().getRegionCode()).orElse(null));
        }
        if (ohs.getDistrict() != null && ohs.getDistrict().getDistrictCode() != null) {
            ohs.setDistrict(districtRepository.findById(ohs.getDistrict().getDistrictCode()).orElse(null));
        }
        if (ohs.getSettlement() != null && ohs.getSettlement().getSettlementCode() != null) {
            ohs.setSettlement(settlementRepository.findById(ohs.getSettlement().getSettlementCode()).orElse(null));
        }
        if (ohs.getElectricityFeeder() != null && ohs.getElectricityFeeder().getId() != null) {
            ohs.setElectricityFeeder(electricityFeederRepository.findById(ohs.getElectricityFeeder().getId()).orElse(null));
        }
        if (ohs.getKpiEssOhs() != null && ohs.getKpiEssOhs().getId() != null) {
            ohs.setKpiEssOhs(kpiEssOhsRepository.findById(ohs.getKpiEssOhs().getId()).orElse(null));
        }
    }

    @GetMapping("/ohs")
    public List<OHSMonitoring> getAllOHS() {
        return ohsRepository.findAll();
    }

    @GetMapping("/ohs/project/{projectId}")
    public List<OHSMonitoring> getOHSByProject(@PathVariable String projectId) {
        return ohsRepository.findByProject_ProjectId(projectId);
    }

    @PostMapping("/ohs")
    public OHSMonitoring createOHS(@RequestBody OHSMonitoring ohs) {
        resolveOHSReferences(ohs);
        return ohsRepository.save(ohs);
    }

    @PutMapping("/ohs/{id}")
    public ResponseEntity<OHSMonitoring> updateOHS(@PathVariable Long id, @RequestBody OHSMonitoring ohsDetails) {
        return ohsRepository.findById(id)
            .map(ohs -> {
                resolveOHSReferences(ohsDetails);
                ohs.setProject(ohsDetails.getProject());
                ohs.setInvestmentType(ohsDetails.getInvestmentType());
                ohs.setYear(ohsDetails.getYear());
                ohs.setQuarter(ohsDetails.getQuarter());
                ohs.setMonitoringDate(ohsDetails.getMonitoringDate());
                ohs.setRegion(ohsDetails.getRegion());
                ohs.setDistrict(ohsDetails.getDistrict());
                ohs.setSettlement(ohsDetails.getSettlement());
                ohs.setQualityAtEntryRequirement(ohsDetails.getQualityAtEntryRequirement());
                ohs.setWorkingEnvironment(ohsDetails.getWorkingEnvironment());
                ohs.setRemarks(ohsDetails.getRemarks());
                ohs.setMale(ohsDetails.getMale());
                ohs.setFemale(ohsDetails.getFemale());
                ohs.setYouthMale(ohsDetails.getYouthMale());
                ohs.setYouthFemale(ohsDetails.getYouthFemale());
                ohs.setKpiDescription(ohsDetails.getKpiDescription());
                ohs.setElectricityFeeder(ohsDetails.getElectricityFeeder());
                ohs.setKpiEssOhs(ohsDetails.getKpiEssOhs());
                ohs.setPicture(ohsDetails.getPicture());
                return ResponseEntity.ok(ohsRepository.save(ohs));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/ohs/{id}")
    public ResponseEntity<Void> deleteOHS(@PathVariable Long id) {
        return ohsRepository.findById(id)
            .map(ohs -> {
                ohsRepository.delete(ohs);
                return ResponseEntity.ok().<Void>build();
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/engagement-types")
    public List<StakeholderEngagementType> getAllEngagementTypes() {
        return stakeholderEngagementTypeRepository.findAll();
    }

    @GetMapping("/community-engagement")
    public List<CommunityEngagement> getAllEngagements() {
        return engagementRepository.findAll();
    }

    @GetMapping("/community-engagement/project/{projectId}")
    public List<CommunityEngagement> getEngagementsByProject(@PathVariable String projectId) {
        return engagementRepository.findByProject_ProjectId(projectId);
    }

    private void resolveEngagementReferences(CommunityEngagement engagement) {
        if (engagement.getProject() != null && engagement.getProject().getProjectId() != null) {
            engagement.setProject(projectRepository.findById(engagement.getProject().getProjectId()).orElse(null));
        }
        if (engagement.getYear() != null && engagement.getYear().getId() != null) {
            engagement.setYear(yearRepository.findById(engagement.getYear().getId()).orElse(null));
        }
        if (engagement.getEngagementType() != null && engagement.getEngagementType().getId() != null) {
            engagement.setEngagementType(stakeholderEngagementTypeRepository.findById(engagement.getEngagementType().getId()).orElse(null));
        }
    }

    @PostMapping("/community-engagement")
    public CommunityEngagement createEngagement(@RequestBody CommunityEngagement engagement) {
        resolveEngagementReferences(engagement);
        return engagementRepository.save(engagement);
    }

    @PutMapping("/community-engagement/{id}")
    public ResponseEntity<CommunityEngagement> updateEngagement(@PathVariable String id, @RequestBody CommunityEngagement details) {
        return engagementRepository.findById(id)
            .map(engagement -> {
                resolveEngagementReferences(details);
                engagement.setProject(details.getProject());
                engagement.setYear(details.getYear());
                engagement.setPlaceOfEvent(details.getPlaceOfEvent());
                engagement.setDateOfConsultation(details.getDateOfConsultation());
                engagement.setMale(details.getMale());
                engagement.setFemale(details.getFemale());
                engagement.setTotalParticipants(details.getTotalParticipants());
                engagement.setEngagementType(details.getEngagementType());
                engagement.setKeyIssuesDiscussed(details.getKeyIssuesDiscussed());
                engagement.setFollowUpActions(details.getFollowUpActions());
                engagement.setPicture(details.getPicture());
                return ResponseEntity.ok(engagementRepository.save(engagement));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/community-engagement/{id}")
    public ResponseEntity<Void> deleteEngagement(@PathVariable String id) {
        return engagementRepository.findById(id)
            .map(engagement -> {
                engagementRepository.delete(engagement);
                return ResponseEntity.ok().<Void>build();
            })
            .orElse(ResponseEntity.notFound().build());
    }
}

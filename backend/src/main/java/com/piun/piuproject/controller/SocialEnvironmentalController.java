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
    private GrievanceRepository grievanceRepository;
    
    @Autowired
    private OHSMonitoringRepository ohsRepository;
    
    @Autowired
    private CommunityEngagementRepository engagementRepository;

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
            projectRepository.findById(pap.getProject().getProjectId()).ifPresent(pap::setProject);
        }
        if (pap.getInvestmentType() != null && pap.getInvestmentType().getId() != null) {
            kpiContractSetupRepository.findById(pap.getInvestmentType().getId()).ifPresent(pap::setInvestmentType);
        }
        if (pap.getRegion() != null && pap.getRegion().getRegionCode() != null) {
            regionRepository.findById(pap.getRegion().getRegionCode()).ifPresent(pap::setRegion);
        }
        if (pap.getDistrict() != null && pap.getDistrict().getDistrictCode() != null) {
            districtRepository.findById(pap.getDistrict().getDistrictCode()).ifPresent(pap::setDistrict);
        }
        if (pap.getPapType() != null && pap.getPapType().getId() != null) {
            papTypeRepository.findById(pap.getPapType().getId()).ifPresent(pap::setPapType);
        }
        if (pap.getPapCategory() != null && pap.getPapCategory().getId() != null) {
            papCategoryRepository.findById(pap.getPapCategory().getId()).ifPresent(pap::setPapCategory);
        }
        if (pap.getVulnerabilityCategory() != null && pap.getVulnerabilityCategory().getId() != null) {
            vulnerabilityCategoryRepository.findById(pap.getVulnerabilityCategory().getId()).ifPresent(pap::setVulnerabilityCategory);
        }
        if (pap.getCurrentAddress() != null && pap.getCurrentAddress().getSettlementCode() != null) {
            settlementRepository.findById(pap.getCurrentAddress().getSettlementCode()).ifPresent(pap::setCurrentAddress);
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
        return grievanceRepository.save(grievance);
    }

    @PutMapping("/grievance/{id}")
    public ResponseEntity<GrievanceMonitoringLog> updateGrievance(@PathVariable String id, @RequestBody GrievanceMonitoringLog grievanceDetails) {
        return grievanceRepository.findById(id)
            .map(grievance -> {
                grievance.setComplaintContent(grievanceDetails.getComplaintContent());
                grievance.setFollowUpActions(grievanceDetails.getFollowUpActions());
                grievance.setComplainantSatisfied(grievanceDetails.getComplainantSatisfied());
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
        return ohsRepository.save(ohs);
    }

    @PutMapping("/ohs/{id}")
    public ResponseEntity<OHSMonitoring> updateOHS(@PathVariable Long id, @RequestBody OHSMonitoring ohsDetails) {
        return ohsRepository.findById(id)
            .map(ohs -> {
                ohs.setQualityAtEntryRequirement(ohsDetails.getQualityAtEntryRequirement());
                ohs.setWorkingEnvironment(ohsDetails.getWorkingEnvironment());
                ohs.setRemarks(ohsDetails.getRemarks());
                ohs.setMale(ohsDetails.getMale());
                ohs.setFemale(ohsDetails.getFemale());
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

    @GetMapping("/community-engagement")
    public List<CommunityEngagement> getAllEngagements() {
        return engagementRepository.findAll();
    }

    @GetMapping("/community-engagement/project/{projectId}")
    public List<CommunityEngagement> getEngagementsByProject(@PathVariable String projectId) {
        return engagementRepository.findByProject_ProjectId(projectId);
    }

    @PostMapping("/community-engagement")
    public CommunityEngagement createEngagement(@RequestBody CommunityEngagement engagement) {
        return engagementRepository.save(engagement);
    }

    @PutMapping("/community-engagement/{id}")
    public ResponseEntity<CommunityEngagement> updateEngagement(@PathVariable String id, @RequestBody CommunityEngagement details) {
        return engagementRepository.findById(id)
            .map(engagement -> {
                engagement.setPlaceOfEvent(details.getPlaceOfEvent());
                engagement.setKeyIssuesDiscussed(details.getKeyIssuesDiscussed());
                engagement.setFollowUpActions(details.getFollowUpActions());
                engagement.setMale(details.getMale());
                engagement.setFemale(details.getFemale());
                engagement.setTotalParticipants(details.getTotalParticipants());
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

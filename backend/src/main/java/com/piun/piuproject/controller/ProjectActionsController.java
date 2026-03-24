package com.piun.piuproject.controller;

import com.piun.piuproject.model.*;
import com.piun.piuproject.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.LinkedHashMap;

@RestController
@RequestMapping("/api/project-actions")
@CrossOrigin(origins = "*")
public class ProjectActionsController {

    @Autowired
    private ContractProfilingWorksRepository worksRepository;
    
    @Autowired
    private ContractProfilingGoodsRepository goodsRepository;

    @Autowired
    private SpecificContractMonitoringRepository monitoringRepository;

    @Autowired
    private KPIForContractRepository kpiForContractRepository;

    @Autowired
    private PhysicalProgressRepository physicalProgressRepository;

    @Autowired
    private DesignWorkProgressRepository designWorkProgressRepository;

    @Autowired
    private DesignProgressMonitoringRepository designProgressMonitoringRepository;

    @Autowired
    private DesignMonitoringMilestoneRepository designMonitoringMilestoneRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private BoqRepository boqRepository;

    @GetMapping("/works")
    public List<ContractProfilingWorks> getAllWorks() {
        return worksRepository.findAll();
    }

    @GetMapping("/works/project/{projectId}")
    public List<ContractProfilingWorks> getWorksByProject(@PathVariable String projectId) {
        return worksRepository.findByProject_ProjectId(projectId);
    }

    @PostMapping("/works")
    public ContractProfilingWorks createWorks(@RequestBody ContractProfilingWorks works) {
        return worksRepository.save(works);
    }

    @PutMapping("/works/{id}")
    public ResponseEntity<ContractProfilingWorks> updateWorks(
            @PathVariable Long id, 
            @RequestBody ContractProfilingWorks worksDetails) {
        return worksRepository.findById(id)
            .map(works -> {
                works.setProject(worksDetails.getProject());
                works.setComponent(worksDetails.getComponent());
                works.setSubcomponent(worksDetails.getSubcomponent());
                works.setActivity(worksDetails.getActivity());
                works.setProjectCategory(worksDetails.getProjectCategory());
                works.setFundingSource(worksDetails.getFundingSource());
                works.setMainInterventionFocus(worksDetails.getMainInterventionFocus());
                works.setTargetBeneficiarySettlements(worksDetails.getTargetBeneficiarySettlements());
                works.setLocationOfInvestment(worksDetails.getLocationOfInvestment());
                works.setLatitude(worksDetails.getLatitude());
                works.setLongitude(worksDetails.getLongitude());
                works.setGrossFloorAreaM2(worksDetails.getGrossFloorAreaM2());
                works.setCurrency(worksDetails.getCurrency());
                works.setContractValue(worksDetails.getContractValue());
                works.setAmendments(worksDetails.getAmendments());
                works.setContractRefNo(worksDetails.getContractRefNo());
                works.setNameOfContractor(worksDetails.getNameOfContractor());
                works.setNameOfConsultant(worksDetails.getNameOfConsultant());
                works.setContractStartDate(worksDetails.getContractStartDate());
                works.setContractEndDate(worksDetails.getContractEndDate());
                works.setDuration(worksDetails.getDuration());
                works.setRemarks(worksDetails.getRemarks());
                return ResponseEntity.ok(worksRepository.save(works));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/works/{id}")
    public ResponseEntity<Void> deleteWorks(@PathVariable Long id) {
        return worksRepository.findById(id)
            .map(works -> {
                worksRepository.delete(works);
                return ResponseEntity.ok().<Void>build();
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/goods")
    public List<ContractProfilingGoods> getAllGoods() {
        return goodsRepository.findAll();
    }

    @GetMapping("/goods/project/{projectId}")
    public List<ContractProfilingGoods> getGoodsByProject(@PathVariable String projectId) {
        return goodsRepository.findByProject_ProjectId(projectId);
    }

    @PostMapping("/goods")
    public ContractProfilingGoods createGoods(@RequestBody ContractProfilingGoods goods) {
        return goodsRepository.save(goods);
    }

    @PutMapping("/goods/{id}")
    public ResponseEntity<ContractProfilingGoods> updateGoods(
            @PathVariable Long id, 
            @RequestBody ContractProfilingGoods goodsDetails) {
        return goodsRepository.findById(id)
            .map(goods -> {
                goods.setProject(goodsDetails.getProject());
                goods.setComponent(goodsDetails.getComponent());
                goods.setSubcomponent(goodsDetails.getSubcomponent());
                goods.setActivity(goodsDetails.getActivity());
                goods.setProjectCategory(goodsDetails.getProjectCategory());
                goods.setFundingSource(goodsDetails.getFundingSource());
                goods.setCurrency(goodsDetails.getCurrency());
                goods.setContractValue(goodsDetails.getContractValue());
                goods.setAmendments(goodsDetails.getAmendments());
                goods.setContractRefNo(goodsDetails.getContractRefNo());
                goods.setNameOfSupplier(goodsDetails.getNameOfSupplier());
                goods.setNameOfConsultant(goodsDetails.getNameOfConsultant());
                goods.setContractStartDate(goodsDetails.getContractStartDate());
                goods.setContractEndDate(goodsDetails.getContractEndDate());
                goods.setDuration(goodsDetails.getDuration());
                goods.setRemarks(goodsDetails.getRemarks());
                return ResponseEntity.ok(goodsRepository.save(goods));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/goods/{id}")
    public ResponseEntity<Void> deleteGoods(@PathVariable Long id) {
        return goodsRepository.findById(id)
            .map(goods -> {
                goodsRepository.delete(goods);
                return ResponseEntity.ok().<Void>build();
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/monitoring")
    public List<SpecificContractMonitoring> getAllMonitoring() {
        return monitoringRepository.findAll();
    }

    @GetMapping("/monitoring/project/{projectId}")
    public List<SpecificContractMonitoring> getMonitoringByProject(@PathVariable String projectId) {
        return monitoringRepository.findByProject_ProjectId(projectId);
    }

    @PostMapping("/monitoring")
    public SpecificContractMonitoring createMonitoring(@RequestBody SpecificContractMonitoring monitoring) {
        return monitoringRepository.save(monitoring);
    }

    @PutMapping("/monitoring/{id}")
    public ResponseEntity<SpecificContractMonitoring> updateMonitoring(
            @PathVariable Long id,
            @RequestBody SpecificContractMonitoring details) {
        return monitoringRepository.findById(id)
            .map(monitoring -> {
                monitoring.setContractRefNo(details.getContractRefNo());
                monitoring.setMonitoringDate(details.getMonitoringDate());
                monitoring.setQuarter(details.getQuarter());
                monitoring.setMonitoringType(details.getMonitoringType());
                monitoring.setInvestmentType(details.getInvestmentType());
                monitoring.setKpiDescription(details.getKpiDescription());
                monitoring.setMilestoneStartDate(details.getMilestoneStartDate());
                monitoring.setMilestoneEndDate(details.getMilestoneEndDate());
                monitoring.setTarget(details.getTarget());
                monitoring.setAchievedStatus(details.getAchievedStatus());
                monitoring.setImplementationStatus(details.getImplementationStatus());
                monitoring.setPictureOfStatus(details.getPictureOfStatus());
                monitoring.setRemarks(details.getRemarks());
                return ResponseEntity.ok(monitoringRepository.save(monitoring));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/monitoring/{id}")
    public ResponseEntity<Void> deleteMonitoring(@PathVariable Long id) {
        return monitoringRepository.findById(id)
            .map(monitoring -> {
                monitoringRepository.delete(monitoring);
                return ResponseEntity.ok().<Void>build();
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/kpi-for-contracts")
    public List<KPIForContract> getAllKPIForContracts() {
        return kpiForContractRepository.findAll();
    }

    @GetMapping("/kpi-for-contracts/project/{projectId}")
    public List<KPIForContract> getKPIForContractsByProject(@PathVariable String projectId) {
        return kpiForContractRepository.findByProject_ProjectId(projectId);
    }

    @GetMapping("/kpi-for-contracts/monitoring-type/{monitoringTypeCode}")
    public List<KPIForContract> getKPIForContractsByMonitoringType(@PathVariable String monitoringTypeCode) {
        return kpiForContractRepository.findByMonitoringType_MonitoringTypeCode(monitoringTypeCode);
    }

    @PostMapping("/kpi-for-contracts")
    public KPIForContract createKPIForContract(@RequestBody KPIForContract kpiForContract) {
        return kpiForContractRepository.save(kpiForContract);
    }

    @PutMapping("/kpi-for-contracts/{monitoringTypeCode}")
    public ResponseEntity<KPIForContract> updateKPIForContract(
            @PathVariable String monitoringTypeCode,
            @RequestBody KPIForContract details) {
        return kpiForContractRepository.findById(monitoringTypeCode)
            .map(kpi -> {
                kpi.setProject(details.getProject());
                kpi.setTypeOfInvestment(details.getTypeOfInvestment());
                kpi.setKpiDescription(details.getKpiDescription());
                kpi.setMonitoringType(details.getMonitoringType());
                return ResponseEntity.ok(kpiForContractRepository.save(kpi));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/kpi-for-contracts/{monitoringTypeCode}")
    public ResponseEntity<Void> deleteKPIForContract(@PathVariable String monitoringTypeCode) {
        return kpiForContractRepository.findById(monitoringTypeCode)
            .map(kpi -> {
                kpiForContractRepository.delete(kpi);
                return ResponseEntity.ok().<Void>build();
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/implementation-status")
    public List<PhysicalProgress> getAllImplementationStatus() {
        return physicalProgressRepository.findAll();
    }

    @GetMapping("/design-work-progress")
    public List<DesignWorkProgress> getAllDesignWorkProgress() {
        return designWorkProgressRepository.findAllByOrderByDateCreatedDesc();
    }

    @GetMapping("/design-work-progress/project/{projectId}")
    public List<DesignWorkProgress> getDesignWorkProgressByProject(@PathVariable String projectId) {
        return designWorkProgressRepository.findByProject_ProjectIdOrderByDateCreatedDesc(projectId);
    }

    @GetMapping("/design-work-progress/filter")
    public List<DesignWorkProgress> getDesignWorkProgressFiltered(
            @RequestParam String projectId,
            @RequestParam String contractType,
            @RequestParam String contractRefNo,
            @RequestParam(required = false) Long yearId) {
        if (yearId != null) {
            return designWorkProgressRepository.findByProject_ProjectIdAndContractTypeAndContractRefNoAndYear_IdOrderByActivityIdAsc(projectId, contractType, contractRefNo, yearId);
        }
        return designWorkProgressRepository.findByProject_ProjectIdAndContractTypeAndContractRefNoOrderByActivityIdAsc(projectId, contractType, contractRefNo);
    }

    @PostMapping("/design-work-progress")
    public DesignWorkProgress createDesignWorkProgress(@RequestBody DesignWorkProgress item) {
        item.setDateCreated(java.time.LocalDateTime.now());
        return designWorkProgressRepository.save(item);
    }

    @PostMapping("/design-work-progress/batch")
    public List<DesignWorkProgress> createDesignWorkProgressBatch(@RequestBody List<DesignWorkProgress> items) {
        items.forEach(item -> item.setDateCreated(java.time.LocalDateTime.now()));
        return designWorkProgressRepository.saveAll(items);
    }

    @PutMapping("/design-work-progress/{id}")
    public ResponseEntity<DesignWorkProgress> updateDesignWorkProgress(
            @PathVariable Long id,
            @RequestBody DesignWorkProgress details) {
        return designWorkProgressRepository.findById(id)
            .map(item -> {
                item.setYear(details.getYear());
                item.setProject(details.getProject());
                item.setContractType(details.getContractType());
                item.setContractRefNo(details.getContractRefNo());
                item.setActivityId(details.getActivityId());
                item.setActivity(details.getActivity());
                item.setRate(details.getRate());
                item.setUnit(details.getUnit());
                item.setProvisionalQuantities(details.getProvisionalQuantities());
                item.setExecutedQuantities(details.getExecutedQuantities());
                item.setPercentage(details.getPercentage());
                item.setGlobalProgressRate(details.getGlobalProgressRate());
                item.setObservations(details.getObservations());
                return ResponseEntity.ok(designWorkProgressRepository.save(item));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/design-work-progress/{id}")
    public ResponseEntity<Void> deleteDesignWorkProgress(@PathVariable Long id) {
        return designWorkProgressRepository.findById(id)
            .map(item -> {
                designWorkProgressRepository.delete(item);
                return ResponseEntity.ok().<Void>build();
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/boq")
    public List<Boq> getAllBoq() {
        return boqRepository.findAllByOrderByDateCreatedDesc();
    }

    @GetMapping("/boq/project/{projectId}")
    public List<Boq> getBoqByProject(@PathVariable String projectId) {
        return boqRepository.findByProject_ProjectIdOrderByDateCreatedDesc(projectId);
    }

    @PostMapping("/boq")
    public Boq createBoq(@RequestBody Boq item) {
        item.setDateCreated(java.time.LocalDateTime.now());
        return boqRepository.save(item);
    }

    @PostMapping("/boq/batch")
    public List<Boq> createBoqBatch(@RequestBody List<Boq> items) {
        items.forEach(item -> item.setDateCreated(java.time.LocalDateTime.now()));
        return boqRepository.saveAll(items);
    }

    @PutMapping("/boq/{id}")
    public ResponseEntity<Boq> updateBoq(@PathVariable Long id, @RequestBody Boq details) {
        return boqRepository.findById(id)
            .map(item -> {
                item.setEntryDate(details.getEntryDate());
                item.setProject(details.getProject());
                item.setContractType(details.getContractType());
                item.setContractRefNo(details.getContractRefNo());
                item.setItemId(details.getItemId());
                item.setActivity(details.getActivity());
                item.setUnit(details.getUnit());
                item.setBoqQuantity(details.getBoqQuantity());
                return ResponseEntity.ok(boqRepository.save(item));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/boq/{id}")
    public ResponseEntity<Void> deleteBoq(@PathVariable Long id) {
        return boqRepository.findById(id)
            .map(item -> {
                boqRepository.delete(item);
                return ResponseEntity.ok().<Void>build();
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/boq/contract/{contractRefNo}")
    public List<Boq> getBoqByContractRef(@PathVariable String contractRefNo) {
        return boqRepository.findByContractRefNoOrderByDateCreatedDesc(contractRefNo);
    }

    @Autowired
    private SupplyProgressRepository supplyProgressRepository;

    @GetMapping("/supply-progress")
    public List<SupplyProgress> getAllSupplyProgress() {
        return supplyProgressRepository.findAllByOrderByDateCreatedDesc();
    }

    @GetMapping("/supply-progress/project/{projectId}")
    public List<SupplyProgress> getSupplyProgressByProject(@PathVariable String projectId) {
        return supplyProgressRepository.findByProject_ProjectIdOrderByDateCreatedDesc(projectId);
    }

    @PostMapping("/supply-progress")
    public SupplyProgress createSupplyProgress(@RequestBody SupplyProgress item) {
        item.setDateCreated(java.time.LocalDateTime.now());
        return supplyProgressRepository.save(item);
    }

    @PostMapping("/supply-progress/batch")
    public List<SupplyProgress> createSupplyProgressBatch(@RequestBody List<SupplyProgress> items) {
        items.forEach(item -> item.setDateCreated(java.time.LocalDateTime.now()));
        return supplyProgressRepository.saveAll(items);
    }

    @PutMapping("/supply-progress/{id}")
    public ResponseEntity<SupplyProgress> updateSupplyProgress(@PathVariable Long id, @RequestBody SupplyProgress details) {
        return supplyProgressRepository.findById(id)
            .map(item -> {
                item.setEntryDate(details.getEntryDate());
                item.setProject(details.getProject());
                item.setContractType(details.getContractType());
                item.setContractRefNo(details.getContractRefNo());
                item.setItemId(details.getItemId());
                item.setActivity(details.getActivity());
                item.setRate(details.getRate());
                item.setUnit(details.getUnit());
                item.setBoqQuantities(details.getBoqQuantities());
                item.setExecutedQuantities(details.getExecutedQuantities());
                item.setPerformancePercentage(details.getPerformancePercentage());
                item.setGlobalProgressRate(details.getGlobalProgressRate());
                item.setObservation(details.getObservation());
                return ResponseEntity.ok(supplyProgressRepository.save(item));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/supply-progress/{id}")
    public ResponseEntity<Void> deleteSupplyProgress(@PathVariable Long id) {
        return supplyProgressRepository.findById(id)
            .map(item -> {
                supplyProgressRepository.delete(item);
                return ResponseEntity.ok().<Void>build();
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/supply-progress/contract/{contractRefNo}")
    public List<SupplyProgress> getSupplyProgressByContractRef(@PathVariable String contractRefNo) {
        return supplyProgressRepository.findByContractRefNoOrderByDateCreatedDesc(contractRefNo);
    }

    @Autowired
    private InstallationRepository installationRepository;

    @GetMapping("/installation")
    public List<Installation> getAllInstallation() {
        return installationRepository.findAllByOrderByDateCreatedDesc();
    }

    @GetMapping("/installation/project/{projectId}")
    public List<Installation> getInstallationByProject(@PathVariable String projectId) {
        return installationRepository.findByProject_ProjectIdOrderByDateCreatedDesc(projectId);
    }

    @PostMapping("/installation")
    public Installation createInstallation(@RequestBody Installation item) {
        item.setDateCreated(java.time.LocalDateTime.now());
        return installationRepository.save(item);
    }

    @PostMapping("/installation/batch")
    public List<Installation> createInstallationBatch(@RequestBody List<Installation> items) {
        items.forEach(item -> item.setDateCreated(java.time.LocalDateTime.now()));
        return installationRepository.saveAll(items);
    }

    @PutMapping("/installation/{id}")
    public ResponseEntity<Installation> updateInstallation(@PathVariable Long id, @RequestBody Installation details) {
        return installationRepository.findById(id)
            .map(item -> {
                item.setEntryDate(details.getEntryDate());
                item.setProject(details.getProject());
                item.setContractType(details.getContractType());
                item.setContractRefNo(details.getContractRefNo());
                item.setItemId(details.getItemId());
                item.setActivity(details.getActivity());
                item.setRate(details.getRate());
                item.setUnit(details.getUnit());
                item.setBoqQty(details.getBoqQty());
                item.setSuppliedQty(details.getSuppliedQty());
                item.setProvisionalStakingQty(details.getProvisionalStakingQty());
                item.setExecutedQty(details.getExecutedQty());
                item.setPercentage(details.getPercentage());
                item.setGlobalProgressRate(details.getGlobalProgressRate());
                item.setObservation(details.getObservation());
                return ResponseEntity.ok(installationRepository.save(item));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/installation/{id}")
    public ResponseEntity<Void> deleteInstallation(@PathVariable Long id) {
        return installationRepository.findById(id)
            .map(item -> {
                installationRepository.delete(item);
                return ResponseEntity.ok().<Void>build();
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/design-monitoring")
    @Transactional(readOnly = true)
    public List<DesignProgressMonitoring> getAllDesignMonitoring() {
        return designProgressMonitoringRepository.findAllByOrderByDateCreatedDesc();
    }

    @GetMapping("/design-monitoring/project/{projectId}")
    public List<DesignProgressMonitoring> getDesignMonitoringByProject(@PathVariable String projectId) {
        return designProgressMonitoringRepository.findByProject_ProjectIdOrderByDateCreatedDesc(projectId);
    }

    @GetMapping("/design-monitoring/filter")
    @Transactional(readOnly = true)
    public List<DesignProgressMonitoring> getDesignMonitoringFiltered(
            @RequestParam String projectId,
            @RequestParam String contractType,
            @RequestParam String contractRefNo) {
        return designProgressMonitoringRepository.findByProject_ProjectIdAndContractTypeAndContractRefNo(projectId, contractType, contractRefNo);
    }

    @PostMapping("/design-monitoring")
    public DesignProgressMonitoring createDesignMonitoring(@RequestBody DesignProgressMonitoring item) {
        item.setDateCreated(java.time.LocalDateTime.now());
        return designProgressMonitoringRepository.save(item);
    }

    @PostMapping("/design-monitoring/batch")
    public List<DesignProgressMonitoring> createDesignMonitoringBatch(@RequestBody List<DesignProgressMonitoring> items) {
        items.forEach(item -> item.setDateCreated(java.time.LocalDateTime.now()));
        return designProgressMonitoringRepository.saveAll(items);
    }

    @PostMapping("/design-monitoring/import-from-design-work")
    public Map<String, Object> importFromDesignWork(
            @RequestParam String projectId,
            @RequestParam String contractType,
            @RequestParam String contractRefNo,
            @RequestParam(required = false) Long yearId) {
        List<DesignWorkProgress> dwpItems = designWorkProgressRepository.findByProject_ProjectIdOrderByDateCreatedDesc(projectId)
                .stream()
                .filter(d -> contractType.equals(d.getContractType()) && contractRefNo.equals(d.getContractRefNo()))
                .toList();

        List<DesignProgressMonitoring> existing = designProgressMonitoringRepository
                .findByProject_ProjectIdAndContractTypeAndContractRefNo(projectId, contractType, contractRefNo);

        java.util.Set<String> existingActivityIds = existing.stream()
                .map(DesignProgressMonitoring::getActivityId)
                .filter(a -> a != null)
                .collect(java.util.stream.Collectors.toSet());

        List<DesignProgressMonitoring> imported = new java.util.ArrayList<>();
        for (DesignWorkProgress dwp : dwpItems) {
            if (dwp.getActivityId() != null && existingActivityIds.contains(dwp.getActivityId())) {
                continue;
            }
            DesignProgressMonitoring dpm = new DesignProgressMonitoring();
            dpm.setProject(dwp.getProject());
            dpm.setContractType(dwp.getContractType());
            dpm.setContractRefNo(dwp.getContractRefNo());
            dpm.setActivityId(dwp.getActivityId());
            dpm.setActivityDescription(dwp.getActivity());
            dpm.setRate(dwp.getRate());
            dpm.setUnit(dwp.getUnit());
            dpm.setOverallPlannedQuantities(dwp.getProvisionalQuantities());
            dpm.setDateCreated(java.time.LocalDateTime.now());
            if (yearId != null) {
                Year y = new Year();
                y.setId(yearId);
                dpm.setYear(y);
            }
            imported.add(designProgressMonitoringRepository.save(dpm));
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("imported", imported.size());
        result.put("items", imported);
        return result;
    }

    @PutMapping("/design-monitoring/{id}")
    public ResponseEntity<DesignProgressMonitoring> updateDesignMonitoring(
            @PathVariable Long id,
            @RequestBody DesignProgressMonitoring details) {
        return designProgressMonitoringRepository.findById(id)
            .map(item -> {
                item.setYear(details.getYear());
                item.setProject(details.getProject());
                item.setContractType(details.getContractType());
                item.setContractRefNo(details.getContractRefNo());
                item.setActivityId(details.getActivityId());
                item.setActivityDescription(details.getActivityDescription());
                item.setRate(details.getRate());
                item.setUnit(details.getUnit());
                item.setOverallPlannedQuantities(details.getOverallPlannedQuantities());
                return ResponseEntity.ok(designProgressMonitoringRepository.save(item));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/design-monitoring/{id}")
    public ResponseEntity<Void> deleteDesignMonitoring(@PathVariable Long id) {
        return designProgressMonitoringRepository.findById(id)
            .map(item -> {
                designProgressMonitoringRepository.delete(item);
                return ResponseEntity.ok().<Void>build();
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/design-monitoring/{monitoringId}/milestones")
    @Transactional(readOnly = true)
    public List<DesignMonitoringMilestone> getMilestones(@PathVariable Long monitoringId) {
        return designMonitoringMilestoneRepository.findByDesignProgressMonitoring_IdOrderByLogDateDesc(monitoringId);
    }

    @PostMapping("/design-monitoring/{monitoringId}/milestones")
    public ResponseEntity<DesignMonitoringMilestone> createMilestone(
            @PathVariable Long monitoringId,
            @RequestBody DesignMonitoringMilestone milestone) {
        return designProgressMonitoringRepository.findById(monitoringId)
            .map(monitoring -> {
                milestone.setDesignProgressMonitoring(monitoring);
                milestone.setDateCreated(java.time.LocalDateTime.now());
                Double planned = milestone.getOverallPlannedQuantities();
                if (milestone.getAchievedValues() != null && planned != null && planned > 0) {
                    double pct = (milestone.getAchievedValues() / planned) * 100;
                    milestone.setPlannedVsAchievedPct(Math.round(pct * 100.0) / 100.0);
                }
                return ResponseEntity.ok(designMonitoringMilestoneRepository.save(milestone));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/design-monitoring/milestones/{id}")
    public ResponseEntity<DesignMonitoringMilestone> updateMilestone(
            @PathVariable Long id,
            @RequestBody DesignMonitoringMilestone details) {
        return designMonitoringMilestoneRepository.findById(id)
            .map(m -> {
                m.setLogDate(details.getLogDate());
                m.setQuarter(details.getQuarter());
                m.setFrequency(details.getFrequency());
                m.setOverallPlannedQuantities(details.getOverallPlannedQuantities());
                m.setAchievedValues(details.getAchievedValues());
                m.setPlannedVsAchievedPct(details.getPlannedVsAchievedPct());
                m.setAchievedVsGlobalPct(details.getAchievedVsGlobalPct());
                m.setStatus(details.getStatus());
                m.setRemarks(details.getRemarks());
                Double planned = details.getOverallPlannedQuantities();
                if (details.getAchievedValues() != null && planned != null && planned > 0) {
                    double pct = (details.getAchievedValues() / planned) * 100;
                    m.setPlannedVsAchievedPct(Math.round(pct * 100.0) / 100.0);
                }
                return ResponseEntity.ok(designMonitoringMilestoneRepository.save(m));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/design-monitoring/milestones/{id}")
    public ResponseEntity<Void> deleteMilestone(@PathVariable Long id) {
        return designMonitoringMilestoneRepository.findById(id)
            .map(m -> {
                designMonitoringMilestoneRepository.delete(m);
                return ResponseEntity.ok().<Void>build();
            })
            .orElse(ResponseEntity.notFound().build());
    }
}

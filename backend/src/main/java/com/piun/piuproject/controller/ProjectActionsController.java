package com.piun.piuproject.controller;

import com.piun.piuproject.model.*;
import com.piun.piuproject.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
                item.setMonitoringDate(details.getMonitoringDate());
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
}

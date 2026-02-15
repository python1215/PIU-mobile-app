package com.piun.piuproject.controller;

import com.piun.piuproject.model.*;
import com.piun.piuproject.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
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

    @GetMapping("/implementation-status")
    public List<PhysicalProgress> getAllImplementationStatus() {
        return physicalProgressRepository.findAll();
    }
}

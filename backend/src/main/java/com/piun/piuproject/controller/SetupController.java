package com.piun.piuproject.controller;

import com.piun.piuproject.model.*;
import com.piun.piuproject.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/setup")
@CrossOrigin(origins = "*")
public class SetupController {

    @Autowired private RegionRepository regionRepository;
    @Autowired private DistrictRepository districtRepository;
    @Autowired private SettlementRepository settlementRepository;
    @Autowired private YearRepository yearRepository;
    @Autowired private QuarterRepository quarterRepository;
    @Autowired private CurrencyRepository currencyRepository;
    @Autowired private ProjectCategoryRepository projectCategoryRepository;
    @Autowired private MonitoringTypeRepository monitoringTypeRepository;
    @Autowired private DocumentTypeRepository documentTypeRepository;
    @Autowired private ContributorRepository contributorRepository;
    @Autowired private LGARepository lgaRepository;
    @Autowired private WardRepository wardRepository;
    @Autowired private TypeOfPAPRepository typeOfPAPRepository;
    @Autowired private TypeOfImpactRepository typeOfImpactRepository;
    @Autowired private NatureOfSettlementRepository natureOfSettlementRepository;
    @Autowired private DecisionOutcomeRepository decisionOutcomeRepository;
    @Autowired private StakeholderEngagementRepository stakeholderEngagementRepository;
    @Autowired private AccessTypeRepository accessTypeRepository;
    @Autowired private DataCollectionFrequencyRepository dataCollectionFrequencyRepository;
    @Autowired private InvestmentTypeRepository investmentTypeRepository;
    @Autowired private IndicatorTypeRepository indicatorTypeRepository;
    @Autowired private PhysicalProgressRepository physicalProgressRepository;
    @Autowired private MeasurementUnitRepository measurementUnitRepository;
    @Autowired private PAPCategoryRepository papCategoryRepository;
    @Autowired private VulnerabilityCategoryRepository vulnerabilityCategoryRepository;
    @Autowired private KPIContractSetupRepository kpiContractSetupRepository;
    @Autowired private PDORepository pdoRepository;
    @Autowired private ProjectOutcomeRepository projectOutcomeRepository;
    @Autowired private ProjectResultRepository projectResultRepository;
    @Autowired private ProjectRepository projectRepository;

    // Contributors
    @GetMapping("/contributors")
    public List<Contributor> getAllContributors() { return contributorRepository.findAll(); }

    @PostMapping("/contributors")
    public Contributor createContributor(@RequestBody Contributor contributor) { return contributorRepository.save(contributor); }

    @PutMapping("/contributors/{id}")
    public ResponseEntity<Contributor> updateContributor(@PathVariable Long id, @RequestBody Contributor details) {
        return contributorRepository.findById(id).map(c -> { c.setName(details.getName()); return ResponseEntity.ok(contributorRepository.save(c)); }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/contributors/{id}")
    public ResponseEntity<Void> deleteContributor(@PathVariable Long id) {
        return contributorRepository.findById(id).map(c -> { contributorRepository.delete(c); return ResponseEntity.ok().<Void>build(); }).orElse(ResponseEntity.notFound().build());
    }

    // Regions
    @GetMapping("/regions")
    public List<Region> getAllRegions() { return regionRepository.findAll(); }

    @PostMapping("/regions")
    public Region createRegion(@RequestBody Region region) { return regionRepository.save(region); }

    @PutMapping("/regions/{id}")
    public ResponseEntity<Region> updateRegion(@PathVariable String id, @RequestBody Region details) {
        return regionRepository.findById(id).map(r -> { r.setRegionName(details.getRegionName()); r.setDescription(details.getDescription()); return ResponseEntity.ok(regionRepository.save(r)); }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/regions/{id}")
    public ResponseEntity<Void> deleteRegion(@PathVariable String id) {
        return regionRepository.findById(id).map(r -> { regionRepository.delete(r); return ResponseEntity.ok().<Void>build(); }).orElse(ResponseEntity.notFound().build());
    }

    // LGAs
    @GetMapping("/lgas")
    public List<LGA> getAllLGAs() { return lgaRepository.findAll(); }

    @GetMapping("/lgas/region/{regionCode}")
    public List<LGA> getLGAsByRegion(@PathVariable String regionCode) { return lgaRepository.findByRegion_RegionCode(regionCode); }

    @PostMapping("/lgas")
    public LGA createLGA(@RequestBody LGA lga) { return lgaRepository.save(lga); }

    @PutMapping("/lgas/{id}")
    public ResponseEntity<LGA> updateLGA(@PathVariable String id, @RequestBody LGA details) {
        return lgaRepository.findById(id).map(l -> { 
            l.setLgaName(details.getLgaName()); 
            l.setRegion(details.getRegion()); 
            return ResponseEntity.ok(lgaRepository.save(l)); 
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/lgas/{id}")
    public ResponseEntity<Void> deleteLGA(@PathVariable String id) {
        return lgaRepository.findById(id).map(l -> { lgaRepository.delete(l); return ResponseEntity.ok().<Void>build(); }).orElse(ResponseEntity.notFound().build());
    }

    // Districts
    @GetMapping("/districts")
    public List<District> getAllDistricts() { return districtRepository.findAll(); }

    @GetMapping("/districts/lga/{lgaCode}")
    public List<District> getDistrictsByLGA(@PathVariable String lgaCode) { return districtRepository.findByLga_LgaCode(lgaCode); }

    @PostMapping("/districts")
    public District createDistrict(@RequestBody District district) { return districtRepository.save(district); }

    @PutMapping("/districts/{id}")
    public ResponseEntity<District> updateDistrict(@PathVariable String id, @RequestBody District details) {
        return districtRepository.findById(id).map(d -> { 
            d.setDistrictName(details.getDistrictName()); 
            d.setLga(details.getLga()); 
            return ResponseEntity.ok(districtRepository.save(d)); 
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/districts/{id}")
    public ResponseEntity<Void> deleteDistrict(@PathVariable String id) {
        return districtRepository.findById(id).map(d -> { districtRepository.delete(d); return ResponseEntity.ok().<Void>build(); }).orElse(ResponseEntity.notFound().build());
    }

    // Wards
    @GetMapping("/wards")
    public List<Ward> getAllWards() { return wardRepository.findAll(); }

    @GetMapping("/wards/district/{districtCode}")
    public List<Ward> getWardsByDistrict(@PathVariable String districtCode) { return wardRepository.findByDistrict_DistrictCode(districtCode); }

    @PostMapping("/wards")
    public Ward createWard(@RequestBody Ward ward) { return wardRepository.save(ward); }

    @PutMapping("/wards/{id}")
    public ResponseEntity<Ward> updateWard(@PathVariable String id, @RequestBody Ward details) {
        return wardRepository.findById(id).map(w -> { 
            w.setWardName(details.getWardName()); 
            w.setDistrict(details.getDistrict()); 
            return ResponseEntity.ok(wardRepository.save(w)); 
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/wards/{id}")
    public ResponseEntity<Void> deleteWard(@PathVariable String id) {
        return wardRepository.findById(id).map(w -> { wardRepository.delete(w); return ResponseEntity.ok().<Void>build(); }).orElse(ResponseEntity.notFound().build());
    }

    // Settlements
    @GetMapping("/settlements")
    public List<Settlement> getAllSettlements() { return settlementRepository.findAll(); }

    @GetMapping("/settlements/ward/{wardCode}")
    public List<Settlement> getSettlementsByWard(@PathVariable String wardCode) { return settlementRepository.findByWard_WardCode(wardCode); }

    @PostMapping("/settlements")
    public Settlement createSettlement(@RequestBody Settlement settlement) { return settlementRepository.save(settlement); }

    @PutMapping("/settlements/{id}")
    public ResponseEntity<Settlement> updateSettlement(@PathVariable String id, @RequestBody Settlement details) {
        return settlementRepository.findById(id).map(s -> { 
            s.setSettlementName(details.getSettlementName()); 
            s.setWard(details.getWard()); 
            return ResponseEntity.ok(settlementRepository.save(s)); 
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/settlements/{id}")
    public ResponseEntity<Void> deleteSettlement(@PathVariable String id) {
        return settlementRepository.findById(id).map(s -> { settlementRepository.delete(s); return ResponseEntity.ok().<Void>build(); }).orElse(ResponseEntity.notFound().build());
    }

    // Years
    @GetMapping("/years")
    public List<Year> getAllYears() { return yearRepository.findAll(); }

    @PostMapping("/years")
    public Year createYear(@RequestBody Year year) { return yearRepository.save(year); }

    @PutMapping("/years/{id}")
    public ResponseEntity<Year> updateYear(@PathVariable Long id, @RequestBody Year details) {
        return yearRepository.findById(id).map(y -> { y.setProfileYear(details.getProfileYear()); return ResponseEntity.ok(yearRepository.save(y)); }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/years/{id}")
    public ResponseEntity<Void> deleteYear(@PathVariable Long id) {
        return yearRepository.findById(id).map(y -> { yearRepository.delete(y); return ResponseEntity.ok().<Void>build(); }).orElse(ResponseEntity.notFound().build());
    }

    // Quarters
    @GetMapping("/quarters")
    public List<Quarter> getAllQuarters() { return quarterRepository.findAll(); }

    @PostMapping("/quarters")
    public Quarter createQuarter(@RequestBody Quarter quarter) { return quarterRepository.save(quarter); }

    @PutMapping("/quarters/{id}")
    public ResponseEntity<Quarter> updateQuarter(@PathVariable Long id, @RequestBody Quarter details) {
        return quarterRepository.findById(id).map(q -> { q.setQuarter(details.getQuarter()); return ResponseEntity.ok(quarterRepository.save(q)); }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/quarters/{id}")
    public ResponseEntity<Void> deleteQuarter(@PathVariable Long id) {
        return quarterRepository.findById(id).map(q -> { quarterRepository.delete(q); return ResponseEntity.ok().<Void>build(); }).orElse(ResponseEntity.notFound().build());
    }

    // Currencies
    @GetMapping("/currencies")
    public List<Currency> getAllCurrencies() { return currencyRepository.findAll(); }

    @PostMapping("/currencies")
    public Currency createCurrency(@RequestBody Currency currency) { return currencyRepository.save(currency); }

    @PutMapping("/currencies/{id}")
    public ResponseEntity<Currency> updateCurrency(@PathVariable Long id, @RequestBody Currency details) {
        return currencyRepository.findById(id).map(c -> { c.setCurrency(details.getCurrency()); return ResponseEntity.ok(currencyRepository.save(c)); }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/currencies/{id}")
    public ResponseEntity<Void> deleteCurrency(@PathVariable Long id) {
        return currencyRepository.findById(id).map(c -> { currencyRepository.delete(c); return ResponseEntity.ok().<Void>build(); }).orElse(ResponseEntity.notFound().build());
    }

    // Project Categories
    @GetMapping("/categories")
    public List<ProjectCategory> getAllCategories() { return projectCategoryRepository.findAll(); }

    @PostMapping("/categories")
    public ProjectCategory createCategory(@RequestBody ProjectCategory category) { return projectCategoryRepository.save(category); }

    @PutMapping("/categories/{id}")
    public ResponseEntity<ProjectCategory> updateCategory(@PathVariable Long id, @RequestBody ProjectCategory details) {
        return projectCategoryRepository.findById(id).map(c -> { c.setCategory(details.getCategory()); c.setCategoryDescription(details.getCategoryDescription()); return ResponseEntity.ok(projectCategoryRepository.save(c)); }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        return projectCategoryRepository.findById(id).map(c -> { projectCategoryRepository.delete(c); return ResponseEntity.ok().<Void>build(); }).orElse(ResponseEntity.notFound().build());
    }

    // Monitoring Types
    @GetMapping("/monitoring-types")
    public List<MonitoringType> getAllMonitoringTypes() { return monitoringTypeRepository.findAll(); }

    @PostMapping("/monitoring-types")
    public MonitoringType createMonitoringType(@RequestBody MonitoringType type) { return monitoringTypeRepository.save(type); }

    @PutMapping("/monitoring-types/{id}")
    public ResponseEntity<MonitoringType> updateMonitoringType(@PathVariable String id, @RequestBody MonitoringType details) {
        return monitoringTypeRepository.findById(id).map(m -> { m.setMonitoringType(details.getMonitoringType()); return ResponseEntity.ok(monitoringTypeRepository.save(m)); }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/monitoring-types/{id}")
    public ResponseEntity<Void> deleteMonitoringType(@PathVariable String id) {
        return monitoringTypeRepository.findById(id).map(m -> { monitoringTypeRepository.delete(m); return ResponseEntity.ok().<Void>build(); }).orElse(ResponseEntity.notFound().build());
    }

    // Document Types
    @GetMapping("/document-types")
    public List<DocumentType> getAllDocumentTypes() { return documentTypeRepository.findAll(); }

    @PostMapping("/document-types")
    public DocumentType createDocumentType(@RequestBody DocumentType type) { return documentTypeRepository.save(type); }

    @PutMapping("/document-types/{id}")
    public ResponseEntity<DocumentType> updateDocumentType(@PathVariable Long id, @RequestBody DocumentType details) {
        return documentTypeRepository.findById(id).map(d -> { d.setDocumentType(details.getDocumentType()); return ResponseEntity.ok(documentTypeRepository.save(d)); }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/document-types/{id}")
    public ResponseEntity<Void> deleteDocumentType(@PathVariable Long id) {
        return documentTypeRepository.findById(id).map(d -> { documentTypeRepository.delete(d); return ResponseEntity.ok().<Void>build(); }).orElse(ResponseEntity.notFound().build());
    }

    // Type of PAP
    @GetMapping("/pap-types")
    public List<TypeOfPAP> getAllPAPTypes() { return typeOfPAPRepository.findAll(); }

    @PostMapping("/pap-types")
    public TypeOfPAP createPAPType(@RequestBody TypeOfPAP type) { return typeOfPAPRepository.save(type); }

    @PutMapping("/pap-types/{id}")
    public ResponseEntity<TypeOfPAP> updatePAPType(@PathVariable Long id, @RequestBody TypeOfPAP details) {
        return typeOfPAPRepository.findById(id).map(t -> { t.setTypeOfPap(details.getTypeOfPap()); return ResponseEntity.ok(typeOfPAPRepository.save(t)); }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/pap-types/{id}")
    public ResponseEntity<Void> deletePAPType(@PathVariable Long id) {
        return typeOfPAPRepository.findById(id).map(t -> { typeOfPAPRepository.delete(t); return ResponseEntity.ok().<Void>build(); }).orElse(ResponseEntity.notFound().build());
    }

    // PAP Categories
    @GetMapping("/pap-categories")
    public List<PAPCategory> getAllPAPCategories() { return papCategoryRepository.findAll(); }

    @PostMapping("/pap-categories")
    public PAPCategory createPAPCategory(@RequestBody PAPCategory category) { return papCategoryRepository.save(category); }

    @PutMapping("/pap-categories/{id}")
    public ResponseEntity<PAPCategory> updatePAPCategory(@PathVariable Long id, @RequestBody PAPCategory details) {
        return papCategoryRepository.findById(id).map(c -> { c.setPapCategory(details.getPapCategory()); return ResponseEntity.ok(papCategoryRepository.save(c)); }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/pap-categories/{id}")
    public ResponseEntity<Void> deletePAPCategory(@PathVariable Long id) {
        return papCategoryRepository.findById(id).map(c -> { papCategoryRepository.delete(c); return ResponseEntity.ok().<Void>build(); }).orElse(ResponseEntity.notFound().build());
    }

    // Type of Impact
    @GetMapping("/impact-types")
    public List<TypeOfImpact> getAllImpactTypes() { return typeOfImpactRepository.findAll(); }

    @PostMapping("/impact-types")
    public TypeOfImpact createImpactType(@RequestBody TypeOfImpact type) { return typeOfImpactRepository.save(type); }

    @PutMapping("/impact-types/{id}")
    public ResponseEntity<TypeOfImpact> updateImpactType(@PathVariable Long id, @RequestBody TypeOfImpact details) {
        return typeOfImpactRepository.findById(id).map(t -> { t.setImpact(details.getImpact()); return ResponseEntity.ok(typeOfImpactRepository.save(t)); }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/impact-types/{id}")
    public ResponseEntity<Void> deleteImpactType(@PathVariable Long id) {
        return typeOfImpactRepository.findById(id).map(t -> { typeOfImpactRepository.delete(t); return ResponseEntity.ok().<Void>build(); }).orElse(ResponseEntity.notFound().build());
    }

    // Nature of Settlement
    @GetMapping("/settlement-natures")
    public List<NatureOfSettlement> getAllSettlementNatures() { return natureOfSettlementRepository.findAll(); }

    @PostMapping("/settlement-natures")
    public NatureOfSettlement createSettlementNature(@RequestBody NatureOfSettlement nature) { return natureOfSettlementRepository.save(nature); }

    @PutMapping("/settlement-natures/{id}")
    public ResponseEntity<NatureOfSettlement> updateSettlementNature(@PathVariable Long id, @RequestBody NatureOfSettlement details) {
        return natureOfSettlementRepository.findById(id).map(n -> { n.setNatureOfSettlement(details.getNatureOfSettlement()); return ResponseEntity.ok(natureOfSettlementRepository.save(n)); }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/settlement-natures/{id}")
    public ResponseEntity<Void> deleteSettlementNature(@PathVariable Long id) {
        return natureOfSettlementRepository.findById(id).map(n -> { natureOfSettlementRepository.delete(n); return ResponseEntity.ok().<Void>build(); }).orElse(ResponseEntity.notFound().build());
    }

    // Decision Outcomes
    @GetMapping("/decision-outcomes")
    public List<DecisionOutcome> getAllDecisionOutcomes() { return decisionOutcomeRepository.findAll(); }

    @PostMapping("/decision-outcomes")
    public DecisionOutcome createDecisionOutcome(@RequestBody DecisionOutcome outcome) { return decisionOutcomeRepository.save(outcome); }

    @PutMapping("/decision-outcomes/{id}")
    public ResponseEntity<DecisionOutcome> updateDecisionOutcome(@PathVariable Long id, @RequestBody DecisionOutcome details) {
        return decisionOutcomeRepository.findById(id).map(o -> { o.setOutcome(details.getOutcome()); return ResponseEntity.ok(decisionOutcomeRepository.save(o)); }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/decision-outcomes/{id}")
    public ResponseEntity<Void> deleteDecisionOutcome(@PathVariable Long id) {
        return decisionOutcomeRepository.findById(id).map(o -> { decisionOutcomeRepository.delete(o); return ResponseEntity.ok().<Void>build(); }).orElse(ResponseEntity.notFound().build());
    }

    // Stakeholder Engagements
    @GetMapping("/stakeholder-engagements")
    public List<StakeholderEngagement> getAllStakeholderEngagements() { return stakeholderEngagementRepository.findAll(); }

    @PostMapping("/stakeholder-engagements")
    public StakeholderEngagement createStakeholderEngagement(@RequestBody StakeholderEngagement engagement) { return stakeholderEngagementRepository.save(engagement); }

    @PutMapping("/stakeholder-engagements/{id}")
    public ResponseEntity<StakeholderEngagement> updateStakeholderEngagement(@PathVariable Long id, @RequestBody StakeholderEngagement details) {
        return stakeholderEngagementRepository.findById(id).map(e -> { e.setEngagementType(details.getEngagementType()); return ResponseEntity.ok(stakeholderEngagementRepository.save(e)); }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/stakeholder-engagements/{id}")
    public ResponseEntity<Void> deleteStakeholderEngagement(@PathVariable Long id) {
        return stakeholderEngagementRepository.findById(id).map(e -> { stakeholderEngagementRepository.delete(e); return ResponseEntity.ok().<Void>build(); }).orElse(ResponseEntity.notFound().build());
    }

    // Access Types
    @GetMapping("/access-types")
    public List<AccessType> getAllAccessTypes() { return accessTypeRepository.findAll(); }

    @PostMapping("/access-types")
    public AccessType createAccessType(@RequestBody AccessType type) { return accessTypeRepository.save(type); }

    @PutMapping("/access-types/{id}")
    public ResponseEntity<AccessType> updateAccessType(@PathVariable Long id, @RequestBody AccessType details) {
        return accessTypeRepository.findById(id).map(a -> { a.setAccessType(details.getAccessType()); return ResponseEntity.ok(accessTypeRepository.save(a)); }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/access-types/{id}")
    public ResponseEntity<Void> deleteAccessType(@PathVariable Long id) {
        return accessTypeRepository.findById(id).map(a -> { accessTypeRepository.delete(a); return ResponseEntity.ok().<Void>build(); }).orElse(ResponseEntity.notFound().build());
    }

    // Data Collection Frequency
    @GetMapping("/data-frequencies")
    public List<DataCollectionFrequency> getAllDataFrequencies() { return dataCollectionFrequencyRepository.findAll(); }

    @PostMapping("/data-frequencies")
    public DataCollectionFrequency createDataFrequency(@RequestBody DataCollectionFrequency freq) { return dataCollectionFrequencyRepository.save(freq); }

    @PutMapping("/data-frequencies/{id}")
    public ResponseEntity<DataCollectionFrequency> updateDataFrequency(@PathVariable Long id, @RequestBody DataCollectionFrequency details) {
        return dataCollectionFrequencyRepository.findById(id).map(f -> { f.setFrequency(details.getFrequency()); return ResponseEntity.ok(dataCollectionFrequencyRepository.save(f)); }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/data-frequencies/{id}")
    public ResponseEntity<Void> deleteDataFrequency(@PathVariable Long id) {
        return dataCollectionFrequencyRepository.findById(id).map(f -> { dataCollectionFrequencyRepository.delete(f); return ResponseEntity.ok().<Void>build(); }).orElse(ResponseEntity.notFound().build());
    }

    // Investment Types
    @GetMapping("/investment-types")
    public List<InvestmentType> getAllInvestmentTypes() { return investmentTypeRepository.findAll(); }

    @PostMapping("/investment-types")
    public InvestmentType createInvestmentType(@RequestBody InvestmentType type) { return investmentTypeRepository.save(type); }

    @PutMapping("/investment-types/{id}")
    public ResponseEntity<InvestmentType> updateInvestmentType(@PathVariable Long id, @RequestBody InvestmentType details) {
        return investmentTypeRepository.findById(id).map(t -> { t.setNameOfInvestment(details.getNameOfInvestment()); return ResponseEntity.ok(investmentTypeRepository.save(t)); }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/investment-types/{id}")
    public ResponseEntity<Void> deleteInvestmentType(@PathVariable Long id) {
        return investmentTypeRepository.findById(id).map(t -> { investmentTypeRepository.delete(t); return ResponseEntity.ok().<Void>build(); }).orElse(ResponseEntity.notFound().build());
    }

    // Indicator Types
    @GetMapping("/indicator-types")
    public List<IndicatorType> getAllIndicatorTypes() { return indicatorTypeRepository.findAll(); }

    @PostMapping("/indicator-types")
    public IndicatorType createIndicatorType(@RequestBody IndicatorType type) { return indicatorTypeRepository.save(type); }

    @PutMapping("/indicator-types/{id}")
    public ResponseEntity<IndicatorType> updateIndicatorType(@PathVariable Long id, @RequestBody IndicatorType details) {
        return indicatorTypeRepository.findById(id).map(t -> { t.setIndicatorType(details.getIndicatorType()); return ResponseEntity.ok(indicatorTypeRepository.save(t)); }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/indicator-types/{id}")
    public ResponseEntity<Void> deleteIndicatorType(@PathVariable Long id) {
        return indicatorTypeRepository.findById(id).map(t -> { indicatorTypeRepository.delete(t); return ResponseEntity.ok().<Void>build(); }).orElse(ResponseEntity.notFound().build());
    }

    // Physical Progress
    @GetMapping("/physical-progress")
    public List<PhysicalProgress> getAllPhysicalProgress() { return physicalProgressRepository.findAll(); }

    @PostMapping("/physical-progress")
    public PhysicalProgress createPhysicalProgress(@RequestBody PhysicalProgress progress) { return physicalProgressRepository.save(progress); }

    @PutMapping("/physical-progress/{id}")
    public ResponseEntity<PhysicalProgress> updatePhysicalProgress(@PathVariable Long id, @RequestBody PhysicalProgress details) {
        return physicalProgressRepository.findById(id).map(p -> { p.setProgressScale(details.getProgressScale()); return ResponseEntity.ok(physicalProgressRepository.save(p)); }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/physical-progress/{id}")
    public ResponseEntity<Void> deletePhysicalProgress(@PathVariable Long id) {
        return physicalProgressRepository.findById(id).map(p -> { physicalProgressRepository.delete(p); return ResponseEntity.ok().<Void>build(); }).orElse(ResponseEntity.notFound().build());
    }

    // Measurement Units
    @GetMapping("/measurement-units")
    public List<MeasurementUnit> getAllMeasurementUnits() { return measurementUnitRepository.findAll(); }

    @PostMapping("/measurement-units")
    public MeasurementUnit createMeasurementUnit(@RequestBody MeasurementUnit unit) { return measurementUnitRepository.save(unit); }

    @PutMapping("/measurement-units/{id}")
    public ResponseEntity<MeasurementUnit> updateMeasurementUnit(@PathVariable Long id, @RequestBody MeasurementUnit details) {
        return measurementUnitRepository.findById(id).map(u -> { u.setUnit(details.getUnit()); return ResponseEntity.ok(measurementUnitRepository.save(u)); }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/measurement-units/{id}")
    public ResponseEntity<Void> deleteMeasurementUnit(@PathVariable Long id) {
        return measurementUnitRepository.findById(id).map(u -> { measurementUnitRepository.delete(u); return ResponseEntity.ok().<Void>build(); }).orElse(ResponseEntity.notFound().build());
    }

    // Vulnerability Categories
    @GetMapping("/vulnerability-categories")
    public List<VulnerabilityCategory> getAllVulnerabilityCategories() { return vulnerabilityCategoryRepository.findAll(); }

    @PostMapping("/vulnerability-categories")
    public VulnerabilityCategory createVulnerabilityCategory(@RequestBody VulnerabilityCategory category) { return vulnerabilityCategoryRepository.save(category); }

    @PutMapping("/vulnerability-categories/{id}")
    public ResponseEntity<VulnerabilityCategory> updateVulnerabilityCategory(@PathVariable Long id, @RequestBody VulnerabilityCategory details) {
        return vulnerabilityCategoryRepository.findById(id).map(v -> { v.setVulnerability(details.getVulnerability()); return ResponseEntity.ok(vulnerabilityCategoryRepository.save(v)); }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/vulnerability-categories/{id}")
    public ResponseEntity<Void> deleteVulnerabilityCategory(@PathVariable Long id) {
        return vulnerabilityCategoryRepository.findById(id).map(v -> { vulnerabilityCategoryRepository.delete(v); return ResponseEntity.ok().<Void>build(); }).orElse(ResponseEntity.notFound().build());
    }

    // KPI Contracts
    @GetMapping("/kpi-contracts")
    public List<KPIContractSetup> getAllKPIContracts() { return kpiContractSetupRepository.findAll(); }

    @PostMapping("/kpi-contracts")
    public KPIContractSetup createKPIContract(@RequestBody KPIContractSetup kpi) {
        if (kpi.getProject() != null && kpi.getProject().getProjectId() != null) {
            Project project = projectRepository.findById(kpi.getProject().getProjectId()).orElse(null);
            kpi.setProject(project);
        }
        if (kpi.getMonitoringType() != null && kpi.getMonitoringType().getMonitoringTypeCode() != null) {
            MonitoringType type = monitoringTypeRepository.findById(kpi.getMonitoringType().getMonitoringTypeCode()).orElse(null);
            kpi.setMonitoringType(type);
        }
        return kpiContractSetupRepository.save(kpi);
    }

    @PutMapping("/kpi-contracts/{id}")
    public ResponseEntity<KPIContractSetup> updateKPIContract(@PathVariable Long id, @RequestBody KPIContractSetup details) {
        return kpiContractSetupRepository.findById(id).map(k -> { 
            k.setKpiCode(details.getKpiCode()); 
            k.setKpiName(details.getKpiName()); 
            if (details.getProject() != null && details.getProject().getProjectId() != null) {
                Project project = projectRepository.findById(details.getProject().getProjectId()).orElse(null);
                k.setProject(project);
            }
            k.setTypeOfInvestment(details.getTypeOfInvestment());
            k.setKpiDescription(details.getKpiDescription());
            if (details.getMonitoringType() != null && details.getMonitoringType().getMonitoringTypeCode() != null) {
                MonitoringType type = monitoringTypeRepository.findById(details.getMonitoringType().getMonitoringTypeCode()).orElse(null);
                k.setMonitoringType(type);
            }
            return ResponseEntity.ok(kpiContractSetupRepository.save(k)); 
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/kpi-contracts/{id}")
    public ResponseEntity<Void> deleteKPIContract(@PathVariable Long id) {
        return kpiContractSetupRepository.findById(id).map(k -> { kpiContractSetupRepository.delete(k); return ResponseEntity.ok().<Void>build(); }).orElse(ResponseEntity.notFound().build());
    }

    // PDO Statements
    @GetMapping("/pdos")
    public List<PDO> getAllPDOs() { return pdoRepository.findAll(); }

    @PostMapping("/pdos")
    public PDO createPDO(@RequestBody PDO pdo) { return pdoRepository.save(pdo); }

    @PutMapping("/pdos/{id}")
    public ResponseEntity<PDO> updatePDO(@PathVariable Long id, @RequestBody PDO details) {
        return pdoRepository.findById(id).map(p -> { p.setPdoStatement(details.getPdoStatement()); return ResponseEntity.ok(pdoRepository.save(p)); }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/pdos/{id}")
    public ResponseEntity<Void> deletePDO(@PathVariable Long id) {
        return pdoRepository.findById(id).map(p -> { pdoRepository.delete(p); return ResponseEntity.ok().<Void>build(); }).orElse(ResponseEntity.notFound().build());
    }

    // Project Outcomes
    @GetMapping("/outcomes")
    public List<ProjectOutcome> getAllOutcomes() { return projectOutcomeRepository.findAll(); }

    @PostMapping("/outcomes")
    public ProjectOutcome createOutcome(@RequestBody ProjectOutcome outcome) { return projectOutcomeRepository.save(outcome); }

    @PutMapping("/outcomes/{id}")
    public ResponseEntity<ProjectOutcome> updateOutcome(@PathVariable Long id, @RequestBody ProjectOutcome details) {
        return projectOutcomeRepository.findById(id).map(o -> { o.setProjectOutcome(details.getProjectOutcome()); return ResponseEntity.ok(projectOutcomeRepository.save(o)); }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/outcomes/{id}")
    public ResponseEntity<Void> deleteOutcome(@PathVariable Long id) {
        return projectOutcomeRepository.findById(id).map(o -> { projectOutcomeRepository.delete(o); return ResponseEntity.ok().<Void>build(); }).orElse(ResponseEntity.notFound().build());
    }

    // Project Results
    @GetMapping("/results")
    public List<ProjectResult> getAllResults() { return projectResultRepository.findAll(); }

    @PostMapping("/results")
    public ProjectResult createResult(@RequestBody ProjectResult result) { return projectResultRepository.save(result); }

    @PutMapping("/results/{id}")
    public ResponseEntity<ProjectResult> updateResult(@PathVariable Long id, @RequestBody ProjectResult details) {
        return projectResultRepository.findById(id).map(r -> { r.setProjectResult(details.getProjectResult()); return ResponseEntity.ok(projectResultRepository.save(r)); }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/results/{id}")
    public ResponseEntity<Void> deleteResult(@PathVariable Long id) {
        return projectResultRepository.findById(id).map(r -> { projectResultRepository.delete(r); return ResponseEntity.ok().<Void>build(); }).orElse(ResponseEntity.notFound().build());
    }
}

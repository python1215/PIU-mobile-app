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
    @Autowired private KPIForContractRepository kpiForContractRepository;
    @Autowired private PDORepository pdoRepository;
    @Autowired private ProjectOutcomeRepository projectOutcomeRepository;
    @Autowired private ProjectResultRepository projectResultRepository;

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

    @DeleteMapping("/lgas/{id}")
    public ResponseEntity<Void> deleteLGA(@PathVariable String id) {
        return lgaRepository.findById(id).map(l -> { lgaRepository.delete(l); return ResponseEntity.ok().<Void>build(); }).orElse(ResponseEntity.notFound().build());
    }

    // Districts
    @GetMapping("/districts")
    public List<District> getAllDistricts() { return districtRepository.findAll(); }

    @GetMapping("/districts/region/{regionCode}")
    public List<District> getDistrictsByRegion(@PathVariable String regionCode) { return districtRepository.findByRegion_RegionCode(regionCode); }

    @PostMapping("/districts")
    public District createDistrict(@RequestBody District district) { return districtRepository.save(district); }

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

    @DeleteMapping("/wards/{id}")
    public ResponseEntity<Void> deleteWard(@PathVariable String id) {
        return wardRepository.findById(id).map(w -> { wardRepository.delete(w); return ResponseEntity.ok().<Void>build(); }).orElse(ResponseEntity.notFound().build());
    }

    // Settlements
    @GetMapping("/settlements")
    public List<Settlement> getAllSettlements() { return settlementRepository.findAll(); }

    @GetMapping("/settlements/district/{districtCode}")
    public List<Settlement> getSettlementsByDistrict(@PathVariable String districtCode) { return settlementRepository.findByDistrict_DistrictCode(districtCode); }

    @PostMapping("/settlements")
    public Settlement createSettlement(@RequestBody Settlement settlement) { return settlementRepository.save(settlement); }

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

    @DeleteMapping("/pap-types/{id}")
    public ResponseEntity<Void> deletePAPType(@PathVariable Long id) {
        return typeOfPAPRepository.findById(id).map(t -> { typeOfPAPRepository.delete(t); return ResponseEntity.ok().<Void>build(); }).orElse(ResponseEntity.notFound().build());
    }

    // PAP Categories
    @GetMapping("/pap-categories")
    public List<PAPCategory> getAllPAPCategories() { return papCategoryRepository.findAll(); }

    @PostMapping("/pap-categories")
    public PAPCategory createPAPCategory(@RequestBody PAPCategory category) { return papCategoryRepository.save(category); }

    @DeleteMapping("/pap-categories/{id}")
    public ResponseEntity<Void> deletePAPCategory(@PathVariable Long id) {
        return papCategoryRepository.findById(id).map(c -> { papCategoryRepository.delete(c); return ResponseEntity.ok().<Void>build(); }).orElse(ResponseEntity.notFound().build());
    }

    // Type of Impact
    @GetMapping("/impact-types")
    public List<TypeOfImpact> getAllImpactTypes() { return typeOfImpactRepository.findAll(); }

    @PostMapping("/impact-types")
    public TypeOfImpact createImpactType(@RequestBody TypeOfImpact type) { return typeOfImpactRepository.save(type); }

    @DeleteMapping("/impact-types/{id}")
    public ResponseEntity<Void> deleteImpactType(@PathVariable Long id) {
        return typeOfImpactRepository.findById(id).map(t -> { typeOfImpactRepository.delete(t); return ResponseEntity.ok().<Void>build(); }).orElse(ResponseEntity.notFound().build());
    }

    // Nature of Settlement
    @GetMapping("/settlement-natures")
    public List<NatureOfSettlement> getAllSettlementNatures() { return natureOfSettlementRepository.findAll(); }

    @PostMapping("/settlement-natures")
    public NatureOfSettlement createSettlementNature(@RequestBody NatureOfSettlement nature) { return natureOfSettlementRepository.save(nature); }

    @DeleteMapping("/settlement-natures/{id}")
    public ResponseEntity<Void> deleteSettlementNature(@PathVariable Long id) {
        return natureOfSettlementRepository.findById(id).map(n -> { natureOfSettlementRepository.delete(n); return ResponseEntity.ok().<Void>build(); }).orElse(ResponseEntity.notFound().build());
    }

    // Decision Outcomes
    @GetMapping("/decision-outcomes")
    public List<DecisionOutcome> getAllDecisionOutcomes() { return decisionOutcomeRepository.findAll(); }

    @PostMapping("/decision-outcomes")
    public DecisionOutcome createDecisionOutcome(@RequestBody DecisionOutcome outcome) { return decisionOutcomeRepository.save(outcome); }

    @DeleteMapping("/decision-outcomes/{id}")
    public ResponseEntity<Void> deleteDecisionOutcome(@PathVariable Long id) {
        return decisionOutcomeRepository.findById(id).map(o -> { decisionOutcomeRepository.delete(o); return ResponseEntity.ok().<Void>build(); }).orElse(ResponseEntity.notFound().build());
    }

    // Stakeholder Engagements
    @GetMapping("/stakeholder-engagements")
    public List<StakeholderEngagement> getAllStakeholderEngagements() { return stakeholderEngagementRepository.findAll(); }

    @PostMapping("/stakeholder-engagements")
    public StakeholderEngagement createStakeholderEngagement(@RequestBody StakeholderEngagement engagement) { return stakeholderEngagementRepository.save(engagement); }

    @DeleteMapping("/stakeholder-engagements/{id}")
    public ResponseEntity<Void> deleteStakeholderEngagement(@PathVariable Long id) {
        return stakeholderEngagementRepository.findById(id).map(e -> { stakeholderEngagementRepository.delete(e); return ResponseEntity.ok().<Void>build(); }).orElse(ResponseEntity.notFound().build());
    }

    // Access Types
    @GetMapping("/access-types")
    public List<AccessType> getAllAccessTypes() { return accessTypeRepository.findAll(); }

    @PostMapping("/access-types")
    public AccessType createAccessType(@RequestBody AccessType type) { return accessTypeRepository.save(type); }

    @DeleteMapping("/access-types/{id}")
    public ResponseEntity<Void> deleteAccessType(@PathVariable Long id) {
        return accessTypeRepository.findById(id).map(a -> { accessTypeRepository.delete(a); return ResponseEntity.ok().<Void>build(); }).orElse(ResponseEntity.notFound().build());
    }

    // Data Collection Frequency
    @GetMapping("/data-frequencies")
    public List<DataCollectionFrequency> getAllDataFrequencies() { return dataCollectionFrequencyRepository.findAll(); }

    @PostMapping("/data-frequencies")
    public DataCollectionFrequency createDataFrequency(@RequestBody DataCollectionFrequency freq) { return dataCollectionFrequencyRepository.save(freq); }

    @DeleteMapping("/data-frequencies/{id}")
    public ResponseEntity<Void> deleteDataFrequency(@PathVariable Long id) {
        return dataCollectionFrequencyRepository.findById(id).map(f -> { dataCollectionFrequencyRepository.delete(f); return ResponseEntity.ok().<Void>build(); }).orElse(ResponseEntity.notFound().build());
    }

    // Investment Types
    @GetMapping("/investment-types")
    public List<InvestmentType> getAllInvestmentTypes() { return investmentTypeRepository.findAll(); }

    @PostMapping("/investment-types")
    public InvestmentType createInvestmentType(@RequestBody InvestmentType type) { return investmentTypeRepository.save(type); }

    @DeleteMapping("/investment-types/{id}")
    public ResponseEntity<Void> deleteInvestmentType(@PathVariable Long id) {
        return investmentTypeRepository.findById(id).map(t -> { investmentTypeRepository.delete(t); return ResponseEntity.ok().<Void>build(); }).orElse(ResponseEntity.notFound().build());
    }

    // Indicator Types
    @GetMapping("/indicator-types")
    public List<IndicatorType> getAllIndicatorTypes() { return indicatorTypeRepository.findAll(); }

    @PostMapping("/indicator-types")
    public IndicatorType createIndicatorType(@RequestBody IndicatorType type) { return indicatorTypeRepository.save(type); }

    @DeleteMapping("/indicator-types/{id}")
    public ResponseEntity<Void> deleteIndicatorType(@PathVariable Long id) {
        return indicatorTypeRepository.findById(id).map(t -> { indicatorTypeRepository.delete(t); return ResponseEntity.ok().<Void>build(); }).orElse(ResponseEntity.notFound().build());
    }

    // Physical Progress
    @GetMapping("/physical-progress")
    public List<PhysicalProgress> getAllPhysicalProgress() { return physicalProgressRepository.findAll(); }

    @PostMapping("/physical-progress")
    public PhysicalProgress createPhysicalProgress(@RequestBody PhysicalProgress progress) { return physicalProgressRepository.save(progress); }

    @DeleteMapping("/physical-progress/{id}")
    public ResponseEntity<Void> deletePhysicalProgress(@PathVariable Long id) {
        return physicalProgressRepository.findById(id).map(p -> { physicalProgressRepository.delete(p); return ResponseEntity.ok().<Void>build(); }).orElse(ResponseEntity.notFound().build());
    }

    // Measurement Units
    @GetMapping("/measurement-units")
    public List<MeasurementUnit> getAllMeasurementUnits() { return measurementUnitRepository.findAll(); }

    @PostMapping("/measurement-units")
    public MeasurementUnit createMeasurementUnit(@RequestBody MeasurementUnit unit) { return measurementUnitRepository.save(unit); }

    @DeleteMapping("/measurement-units/{id}")
    public ResponseEntity<Void> deleteMeasurementUnit(@PathVariable Long id) {
        return measurementUnitRepository.findById(id).map(u -> { measurementUnitRepository.delete(u); return ResponseEntity.ok().<Void>build(); }).orElse(ResponseEntity.notFound().build());
    }

    // Vulnerability Categories
    @GetMapping("/vulnerability-categories")
    public List<VulnerabilityCategory> getAllVulnerabilityCategories() { return vulnerabilityCategoryRepository.findAll(); }

    @PostMapping("/vulnerability-categories")
    public VulnerabilityCategory createVulnerabilityCategory(@RequestBody VulnerabilityCategory category) { return vulnerabilityCategoryRepository.save(category); }

    @DeleteMapping("/vulnerability-categories/{id}")
    public ResponseEntity<Void> deleteVulnerabilityCategory(@PathVariable Long id) {
        return vulnerabilityCategoryRepository.findById(id).map(v -> { vulnerabilityCategoryRepository.delete(v); return ResponseEntity.ok().<Void>build(); }).orElse(ResponseEntity.notFound().build());
    }

    // KPI Contracts
    @GetMapping("/kpi-contracts")
    public List<KPIForContract> getAllKPIContracts() { return kpiForContractRepository.findAll(); }

    @PostMapping("/kpi-contracts")
    public KPIForContract createKPIContract(@RequestBody KPIForContract kpi) { return kpiForContractRepository.save(kpi); }

    @DeleteMapping("/kpi-contracts/{id}")
    public ResponseEntity<Void> deleteKPIContract(@PathVariable Long id) {
        return kpiForContractRepository.findById(id).map(k -> { kpiForContractRepository.delete(k); return ResponseEntity.ok().<Void>build(); }).orElse(ResponseEntity.notFound().build());
    }

    // PDO Statements
    @GetMapping("/pdos")
    public List<PDO> getAllPDOs() { return pdoRepository.findAll(); }

    @PostMapping("/pdos")
    public PDO createPDO(@RequestBody PDO pdo) { return pdoRepository.save(pdo); }

    @DeleteMapping("/pdos/{id}")
    public ResponseEntity<Void> deletePDO(@PathVariable Long id) {
        return pdoRepository.findById(id).map(p -> { pdoRepository.delete(p); return ResponseEntity.ok().<Void>build(); }).orElse(ResponseEntity.notFound().build());
    }

    // Project Outcomes
    @GetMapping("/outcomes")
    public List<ProjectOutcome> getAllOutcomes() { return projectOutcomeRepository.findAll(); }

    @PostMapping("/outcomes")
    public ProjectOutcome createOutcome(@RequestBody ProjectOutcome outcome) { return projectOutcomeRepository.save(outcome); }

    @DeleteMapping("/outcomes/{id}")
    public ResponseEntity<Void> deleteOutcome(@PathVariable Long id) {
        return projectOutcomeRepository.findById(id).map(o -> { projectOutcomeRepository.delete(o); return ResponseEntity.ok().<Void>build(); }).orElse(ResponseEntity.notFound().build());
    }

    // Project Results
    @GetMapping("/results")
    public List<ProjectResult> getAllResults() { return projectResultRepository.findAll(); }

    @PostMapping("/results")
    public ProjectResult createResult(@RequestBody ProjectResult result) { return projectResultRepository.save(result); }

    @DeleteMapping("/results/{id}")
    public ResponseEntity<Void> deleteResult(@PathVariable Long id) {
        return projectResultRepository.findById(id).map(r -> { projectResultRepository.delete(r); return ResponseEntity.ok().<Void>build(); }).orElse(ResponseEntity.notFound().build());
    }
}

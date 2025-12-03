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

    @Autowired
    private RegionRepository regionRepository;
    
    @Autowired
    private DistrictRepository districtRepository;
    
    @Autowired
    private SettlementRepository settlementRepository;
    
    @Autowired
    private YearRepository yearRepository;
    
    @Autowired
    private QuarterRepository quarterRepository;
    
    @Autowired
    private CurrencyRepository currencyRepository;
    
    @Autowired
    private ProjectCategoryRepository projectCategoryRepository;
    
    @Autowired
    private MonitoringTypeRepository monitoringTypeRepository;
    
    @Autowired
    private DocumentTypeRepository documentTypeRepository;

    @Autowired
    private ContributorRepository contributorRepository;

    @GetMapping("/contributors")
    public List<Contributor> getAllContributors() {
        return contributorRepository.findAll();
    }

    @PostMapping("/contributors")
    public Contributor createContributor(@RequestBody Contributor contributor) {
        return contributorRepository.save(contributor);
    }

    @PutMapping("/contributors/{id}")
    public ResponseEntity<Contributor> updateContributor(@PathVariable Long id, @RequestBody Contributor contributorDetails) {
        return contributorRepository.findById(id)
            .map(contributor -> {
                contributor.setName(contributorDetails.getName());
                return ResponseEntity.ok(contributorRepository.save(contributor));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/contributors/{id}")
    public ResponseEntity<Void> deleteContributor(@PathVariable Long id) {
        return contributorRepository.findById(id)
            .map(contributor -> {
                contributorRepository.delete(contributor);
                return ResponseEntity.ok().<Void>build();
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/regions")
    public List<Region> getAllRegions() {
        return regionRepository.findAll();
    }

    @PostMapping("/regions")
    public Region createRegion(@RequestBody Region region) {
        return regionRepository.save(region);
    }

    @PutMapping("/regions/{id}")
    public ResponseEntity<Region> updateRegion(@PathVariable String id, @RequestBody Region regionDetails) {
        return regionRepository.findById(id)
            .map(region -> {
                region.setRegionName(regionDetails.getRegionName());
                region.setDescription(regionDetails.getDescription());
                return ResponseEntity.ok(regionRepository.save(region));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/regions/{id}")
    public ResponseEntity<Void> deleteRegion(@PathVariable String id) {
        return regionRepository.findById(id)
            .map(region -> {
                regionRepository.delete(region);
                return ResponseEntity.ok().<Void>build();
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/districts")
    public List<District> getAllDistricts() {
        return districtRepository.findAll();
    }

    @GetMapping("/districts/region/{regionCode}")
    public List<District> getDistrictsByRegion(@PathVariable String regionCode) {
        return districtRepository.findByRegion_RegionCode(regionCode);
    }

    @PostMapping("/districts")
    public District createDistrict(@RequestBody District district) {
        return districtRepository.save(district);
    }

    @GetMapping("/settlements")
    public List<Settlement> getAllSettlements() {
        return settlementRepository.findAll();
    }

    @GetMapping("/settlements/district/{districtCode}")
    public List<Settlement> getSettlementsByDistrict(@PathVariable String districtCode) {
        return settlementRepository.findByDistrict_DistrictCode(districtCode);
    }

    @PostMapping("/settlements")
    public Settlement createSettlement(@RequestBody Settlement settlement) {
        return settlementRepository.save(settlement);
    }

    @GetMapping("/years")
    public List<Year> getAllYears() {
        return yearRepository.findAll();
    }

    @PostMapping("/years")
    public Year createYear(@RequestBody Year year) {
        return yearRepository.save(year);
    }

    @PutMapping("/years/{id}")
    public ResponseEntity<Year> updateYear(@PathVariable Long id, @RequestBody Year yearDetails) {
        return yearRepository.findById(id)
            .map(year -> {
                year.setProfileYear(yearDetails.getProfileYear());
                return ResponseEntity.ok(yearRepository.save(year));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/years/{id}")
    public ResponseEntity<Void> deleteYear(@PathVariable Long id) {
        return yearRepository.findById(id)
            .map(year -> {
                yearRepository.delete(year);
                return ResponseEntity.ok().<Void>build();
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/quarters")
    public List<Quarter> getAllQuarters() {
        return quarterRepository.findAll();
    }

    @PostMapping("/quarters")
    public Quarter createQuarter(@RequestBody Quarter quarter) {
        return quarterRepository.save(quarter);
    }

    @PutMapping("/quarters/{id}")
    public ResponseEntity<Quarter> updateQuarter(@PathVariable Long id, @RequestBody Quarter quarterDetails) {
        return quarterRepository.findById(id)
            .map(quarter -> {
                quarter.setQuarter(quarterDetails.getQuarter());
                return ResponseEntity.ok(quarterRepository.save(quarter));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/quarters/{id}")
    public ResponseEntity<Void> deleteQuarter(@PathVariable Long id) {
        return quarterRepository.findById(id)
            .map(quarter -> {
                quarterRepository.delete(quarter);
                return ResponseEntity.ok().<Void>build();
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/currencies")
    public List<Currency> getAllCurrencies() {
        return currencyRepository.findAll();
    }

    @PostMapping("/currencies")
    public Currency createCurrency(@RequestBody Currency currency) {
        return currencyRepository.save(currency);
    }

    @PutMapping("/currencies/{id}")
    public ResponseEntity<Currency> updateCurrency(@PathVariable Long id, @RequestBody Currency currencyDetails) {
        return currencyRepository.findById(id)
            .map(currency -> {
                currency.setCurrency(currencyDetails.getCurrency());
                return ResponseEntity.ok(currencyRepository.save(currency));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/currencies/{id}")
    public ResponseEntity<Void> deleteCurrency(@PathVariable Long id) {
        return currencyRepository.findById(id)
            .map(currency -> {
                currencyRepository.delete(currency);
                return ResponseEntity.ok().<Void>build();
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/categories")
    public List<ProjectCategory> getAllCategories() {
        return projectCategoryRepository.findAll();
    }

    @PostMapping("/categories")
    public ProjectCategory createCategory(@RequestBody ProjectCategory category) {
        return projectCategoryRepository.save(category);
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<ProjectCategory> updateCategory(@PathVariable Long id, @RequestBody ProjectCategory categoryDetails) {
        return projectCategoryRepository.findById(id)
            .map(category -> {
                category.setCategory(categoryDetails.getCategory());
                category.setCategoryDescription(categoryDetails.getCategoryDescription());
                return ResponseEntity.ok(projectCategoryRepository.save(category));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        return projectCategoryRepository.findById(id)
            .map(category -> {
                projectCategoryRepository.delete(category);
                return ResponseEntity.ok().<Void>build();
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/monitoring-types")
    public List<MonitoringType> getAllMonitoringTypes() {
        return monitoringTypeRepository.findAll();
    }

    @PostMapping("/monitoring-types")
    public MonitoringType createMonitoringType(@RequestBody MonitoringType type) {
        return monitoringTypeRepository.save(type);
    }

    @GetMapping("/document-types")
    public List<DocumentType> getAllDocumentTypes() {
        return documentTypeRepository.findAll();
    }

    @PostMapping("/document-types")
    public DocumentType createDocumentType(@RequestBody DocumentType type) {
        return documentTypeRepository.save(type);
    }

    @PutMapping("/document-types/{id}")
    public ResponseEntity<DocumentType> updateDocumentType(@PathVariable Long id, @RequestBody DocumentType typeDetails) {
        return documentTypeRepository.findById(id)
            .map(type -> {
                type.setDocumentType(typeDetails.getDocumentType());
                return ResponseEntity.ok(documentTypeRepository.save(type));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/document-types/{id}")
    public ResponseEntity<Void> deleteDocumentType(@PathVariable Long id) {
        return documentTypeRepository.findById(id)
            .map(type -> {
                documentTypeRepository.delete(type);
                return ResponseEntity.ok().<Void>build();
            })
            .orElse(ResponseEntity.notFound().build());
    }
}

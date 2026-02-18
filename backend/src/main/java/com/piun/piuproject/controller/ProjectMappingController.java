package com.piun.piuproject.controller;

import com.piun.piuproject.model.*;
import com.piun.piuproject.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/mapping")
@CrossOrigin(origins = "*")
public class ProjectMappingController {

    @Autowired
    private ProjectMappingRepository mappingRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private YearRepository yearRepository;

    @Autowired
    private RegionRepository regionRepository;

    @Autowired
    private DistrictRepository districtRepository;

    @Autowired
    private SettlementRepository settlementRepository;

    @Autowired
    private AccessTypeRepository accessTypeRepository;

    @Autowired
    private DonorRepository donorRepository;

    @GetMapping
    public List<ProjectMapping> getAllMappings() {
        return mappingRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectMapping> getMappingById(@PathVariable Long id) {
        return mappingRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/project/{projectId}")
    public List<ProjectMapping> getMappingsByProject(@PathVariable String projectId) {
        return mappingRepository.findByProject_ProjectId(projectId);
    }

    @GetMapping("/region/{regionCode}")
    public List<ProjectMapping> getMappingsByRegion(@PathVariable String regionCode) {
        return mappingRepository.findByRegion_RegionCode(regionCode);
    }

    private void resolveReferences(ProjectMapping mapping, ProjectMapping source) {
        if (source.getProject() != null && source.getProject().getProjectId() != null) {
            mapping.setProject(projectRepository.findById(source.getProject().getProjectId()).orElse(null));
        } else {
            mapping.setProject(null);
        }

        if (source.getProfileYear() != null && source.getProfileYear().getId() != null) {
            mapping.setProfileYear(yearRepository.findById(source.getProfileYear().getId()).orElse(null));
        } else {
            mapping.setProfileYear(null);
        }

        if (source.getRegion() != null && source.getRegion().getRegionCode() != null) {
            mapping.setRegion(regionRepository.findById(source.getRegion().getRegionCode()).orElse(null));
        } else {
            mapping.setRegion(null);
        }

        if (source.getDistrict() != null && source.getDistrict().getDistrictCode() != null) {
            mapping.setDistrict(districtRepository.findById(source.getDistrict().getDistrictCode()).orElse(null));
        } else {
            mapping.setDistrict(null);
        }

        if (source.getSettlement() != null && source.getSettlement().getSettlementCode() != null) {
            mapping.setSettlement(settlementRepository.findById(source.getSettlement().getSettlementCode()).orElse(null));
        } else {
            mapping.setSettlement(null);
        }

        if (source.getAccessType() != null && source.getAccessType().getId() != null) {
            mapping.setAccessType(accessTypeRepository.findById(source.getAccessType().getId()).orElse(null));
        } else {
            mapping.setAccessType(null);
        }

        if (source.getDonors() != null && !source.getDonors().isEmpty()) {
            Set<Donor> resolvedDonors = source.getDonors().stream()
                .filter(d -> d.getDonorId() != null)
                .map(d -> donorRepository.findById(d.getDonorId()).orElse(null))
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
            mapping.setDonors(resolvedDonors);
        } else {
            mapping.setDonors(new HashSet<>());
        }

        mapping.setTotalHouseholds(source.getTotalHouseholds());
        mapping.setConnectedHouseholds(source.getConnectedHouseholds());
        mapping.setCustomerConnections(source.getCustomerConnections());
        mapping.setFemaleHouseholds(source.getFemaleHouseholds());
        mapping.setMaleHouseholds(source.getMaleHouseholds());
        mapping.setLatitude(source.getLatitude());
        mapping.setLongitude(source.getLongitude());
    }

    @PostMapping
    public ProjectMapping createMapping(@RequestBody ProjectMapping mappingData) {
        ProjectMapping mapping = new ProjectMapping();
        resolveReferences(mapping, mappingData);
        return mappingRepository.save(mapping);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProjectMapping> updateMapping(
            @PathVariable Long id,
            @RequestBody ProjectMapping mappingDetails) {
        return mappingRepository.findById(id)
            .map(mapping -> {
                resolveReferences(mapping, mappingDetails);
                return ResponseEntity.ok(mappingRepository.save(mapping));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMapping(@PathVariable Long id) {
        return mappingRepository.findById(id)
            .map(mapping -> {
                mappingRepository.delete(mapping);
                return ResponseEntity.ok().<Void>build();
            })
            .orElse(ResponseEntity.notFound().build());
    }
}

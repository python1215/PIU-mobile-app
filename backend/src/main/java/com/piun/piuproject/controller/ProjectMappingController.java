package com.piun.piuproject.controller;

import com.piun.piuproject.model.*;
import com.piun.piuproject.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mapping")
@CrossOrigin(origins = "*")
public class ProjectMappingController {

    @Autowired
    private ProjectMappingRepository mappingRepository;

    @GetMapping
    public List<ProjectMapping> getAllMappings() {
        return mappingRepository.findAll();
    }

    @GetMapping("/project/{projectId}")
    public List<ProjectMapping> getMappingsByProject(@PathVariable String projectId) {
        return mappingRepository.findByProject_ProjectId(projectId);
    }

    @GetMapping("/region/{regionCode}")
    public List<ProjectMapping> getMappingsByRegion(@PathVariable String regionCode) {
        return mappingRepository.findByRegion_RegionCode(regionCode);
    }

    @PostMapping
    public ProjectMapping createMapping(@RequestBody ProjectMapping mapping) {
        return mappingRepository.save(mapping);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProjectMapping> updateMapping(
            @PathVariable Long id, 
            @RequestBody ProjectMapping mappingDetails) {
        return mappingRepository.findById(id)
            .map(mapping -> {
                mapping.setTotalHouseholds(mappingDetails.getTotalHouseholds());
                mapping.setConnectedHouseholds(mappingDetails.getConnectedHouseholds());
                mapping.setCustomerConnections(mappingDetails.getCustomerConnections());
                mapping.setFemaleHouseholds(mappingDetails.getFemaleHouseholds());
                mapping.setMaleHouseholds(mappingDetails.getMaleHouseholds());
                mapping.setLatitude(mappingDetails.getLatitude());
                mapping.setLongitude(mappingDetails.getLongitude());
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

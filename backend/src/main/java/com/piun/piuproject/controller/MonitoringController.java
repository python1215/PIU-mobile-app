package com.piun.piuproject.controller;

import com.piun.piuproject.model.*;
import com.piun.piuproject.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/monitoring")
@CrossOrigin(origins = "*")
public class MonitoringController {

    @Autowired
    private ResultsMonitoringRepository resultsMonitoringRepository;

    @GetMapping
    public List<ResultsOrientedMonitoring> getAllMonitoring() {
        return resultsMonitoringRepository.findAll();
    }

    @GetMapping("/project/{projectId}")
    public List<ResultsOrientedMonitoring> getMonitoringByProject(@PathVariable String projectId) {
        return resultsMonitoringRepository.findByProject_ProjectId(projectId);
    }

    @PostMapping
    public ResultsOrientedMonitoring createMonitoring(@RequestBody ResultsOrientedMonitoring monitoring) {
        return resultsMonitoringRepository.save(monitoring);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResultsOrientedMonitoring> updateMonitoring(
            @PathVariable Long id, 
            @RequestBody ResultsOrientedMonitoring monitoringDetails) {
        return resultsMonitoringRepository.findById(id)
            .map(monitoring -> {
                monitoring.setIndicatorDescription(monitoringDetails.getIndicatorDescription());
                monitoring.setBaselineValue(monitoringDetails.getBaselineValue());
                monitoring.setAchievedValue(monitoringDetails.getAchievedValue());
                monitoring.setEndTargetValue(monitoringDetails.getEndTargetValue());
                monitoring.setRemarks(monitoringDetails.getRemarks());
                return ResponseEntity.ok(resultsMonitoringRepository.save(monitoring));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMonitoring(@PathVariable Long id) {
        return resultsMonitoringRepository.findById(id)
            .map(monitoring -> {
                resultsMonitoringRepository.delete(monitoring);
                return ResponseEntity.ok().<Void>build();
            })
            .orElse(ResponseEntity.notFound().build());
    }
}

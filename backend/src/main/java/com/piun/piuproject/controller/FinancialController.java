package com.piun.piuproject.controller;

import com.piun.piuproject.model.*;
import com.piun.piuproject.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/financial")
@CrossOrigin(origins = "*")
public class FinancialController {

    @Autowired
    private ComponentRepository componentRepository;
    
    @Autowired
    private SubcomponentRepository subcomponentRepository;
    
    @Autowired
    private ActivityRepository activityRepository;
    
    @Autowired
    private PDORepository pdoRepository;
    
    @Autowired
    private ProjectOutcomeRepository outcomeRepository;
    
    @Autowired
    private ProjectResultRepository resultRepository;

    @GetMapping("/components")
    public List<Component> getAllComponents() {
        return componentRepository.findAll();
    }

    @GetMapping("/components/project/{projectId}")
    public List<Component> getComponentsByProject(@PathVariable String projectId) {
        return componentRepository.findByProject_ProjectId(projectId);
    }

    @PostMapping("/components")
    public Component createComponent(@RequestBody Component component) {
        if (component.getLoginUser() == null) {
            // In a real app we'd get this from SecurityContext
            User user = new User();
            user.setId(1L); 
            component.setLoginUser(user);
        }
        return componentRepository.save(component);
    }

    @PutMapping("/components/{id}")
    public ResponseEntity<Component> updateComponent(@PathVariable Long id, @RequestBody Component componentDetails) {
        return componentRepository.findById(id)
            .map(component -> {
                component.setProjectComponents(componentDetails.getProjectComponents());
                component.setComponentDescription(componentDetails.getComponentDescription());
                component.setAllocation(componentDetails.getAllocation());
                return ResponseEntity.ok(componentRepository.save(component));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/components/{id}")
    public ResponseEntity<Void> deleteComponent(@PathVariable Long id) {
        return componentRepository.findById(id)
            .map(component -> {
                componentRepository.delete(component);
                return ResponseEntity.ok().<Void>build();
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/subcomponents")
    public List<Subcomponent> getAllSubcomponents() {
        return subcomponentRepository.findAll();
    }

    @GetMapping("/subcomponents/component/{compId}")
    public List<Subcomponent> getSubcomponentsByComponent(@PathVariable Long compId) {
        return subcomponentRepository.findByComponent_CompId(compId);
    }

    @PostMapping("/subcomponents")
    public Subcomponent createSubcomponent(@RequestBody Subcomponent subcomponent) {
        return subcomponentRepository.save(subcomponent);
    }

    @PutMapping("/subcomponents/{id}")
    public ResponseEntity<Subcomponent> updateSubcomponent(@PathVariable Long id, @RequestBody Subcomponent details) {
        return subcomponentRepository.findById(id)
            .map(subcomp -> {
                subcomp.setSubcomponent(details.getSubcomponent());
                subcomp.setSubcomponentDescription(details.getSubcomponentDescription());
                subcomp.setAllocation(details.getAllocation());
                return ResponseEntity.ok(subcomponentRepository.save(subcomp));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/subcomponents/{id}")
    public ResponseEntity<Void> deleteSubcomponent(@PathVariable Long id) {
        return subcomponentRepository.findById(id)
            .map(subcomp -> {
                subcomponentRepository.delete(subcomp);
                return ResponseEntity.ok().<Void>build();
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/activities")
    public List<Activity> getAllActivities() {
        return activityRepository.findAll();
    }

    @GetMapping("/activities/project/{projectId}")
    public List<Activity> getActivitiesByProject(@PathVariable String projectId) {
        return activityRepository.findByProject_ProjectId(projectId);
    }

    @PostMapping("/activities")
    public Activity createActivity(@RequestBody Activity activity) {
        return activityRepository.save(activity);
    }

    @PutMapping("/activities/{id}")
    public ResponseEntity<Activity> updateActivity(@PathVariable Long id, @RequestBody Activity details) {
        return activityRepository.findById(id)
            .map(activity -> {
                activity.setActivity(details.getActivity());
                activity.setAllocation(details.getAllocation());
                return ResponseEntity.ok(activityRepository.save(activity));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/activities/{id}")
    public ResponseEntity<Void> deleteActivity(@PathVariable Long id) {
        return activityRepository.findById(id)
            .map(activity -> {
                activityRepository.delete(activity);
                return ResponseEntity.ok().<Void>build();
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/pdos")
    public List<PDO> getAllPDOs() {
        return pdoRepository.findAll();
    }

    @GetMapping("/pdos/project/{projectId}")
    public List<PDO> getPDOsByProject(@PathVariable String projectId) {
        return pdoRepository.findByProject_ProjectId(projectId);
    }

    @PostMapping("/pdos")
    public PDO createPDO(@RequestBody PDO pdo) {
        return pdoRepository.save(pdo);
    }

    @PutMapping("/pdos/{id}")
    public ResponseEntity<PDO> updatePDO(@PathVariable Long id, @RequestBody PDO details) {
        return pdoRepository.findById(id)
            .map(pdo -> {
                pdo.setPdoStatement(details.getPdoStatement());
                return ResponseEntity.ok(pdoRepository.save(pdo));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/pdos/{id}")
    public ResponseEntity<Void> deletePDO(@PathVariable Long id) {
        return pdoRepository.findById(id)
            .map(pdo -> {
                pdoRepository.delete(pdo);
                return ResponseEntity.ok().<Void>build();
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/outcomes")
    public List<ProjectOutcome> getAllOutcomes() {
        return outcomeRepository.findAll();
    }

    @GetMapping("/outcomes/pdo/{pdoId}")
    public List<ProjectOutcome> getOutcomesByPDO(@PathVariable Long pdoId) {
        return outcomeRepository.findByPdo_Id(pdoId);
    }

    @PostMapping("/outcomes")
    public ProjectOutcome createOutcome(@RequestBody ProjectOutcome outcome) {
        return outcomeRepository.save(outcome);
    }

    @PutMapping("/outcomes/{id}")
    public ResponseEntity<ProjectOutcome> updateOutcome(@PathVariable Long id, @RequestBody ProjectOutcome details) {
        return outcomeRepository.findById(id)
            .map(outcome -> {
                outcome.setProjectOutcome(details.getProjectOutcome());
                return ResponseEntity.ok(outcomeRepository.save(outcome));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/outcomes/{id}")
    public ResponseEntity<Void> deleteOutcome(@PathVariable Long id) {
        return outcomeRepository.findById(id)
            .map(outcome -> {
                outcomeRepository.delete(outcome);
                return ResponseEntity.ok().<Void>build();
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/results")
    public List<ProjectResult> getAllResults() {
        return resultRepository.findAll();
    }

    @GetMapping("/results/outcome/{outcomeId}")
    public List<ProjectResult> getResultsByOutcome(@PathVariable Long outcomeId) {
        return resultRepository.findByProjectOutcome_Id(outcomeId);
    }

    @PostMapping("/results")
    public ProjectResult createResult(@RequestBody ProjectResult result) {
        return resultRepository.save(result);
    }

    @PutMapping("/results/{id}")
    public ResponseEntity<ProjectResult> updateResult(@PathVariable Long id, @RequestBody ProjectResult details) {
        return resultRepository.findById(id)
            .map(result -> {
                result.setProjectResult(details.getProjectResult());
                return ResponseEntity.ok(resultRepository.save(result));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/results/{id}")
    public ResponseEntity<Void> deleteResult(@PathVariable Long id) {
        return resultRepository.findById(id)
            .map(result -> {
                resultRepository.delete(result);
                return ResponseEntity.ok().<Void>build();
            })
            .orElse(ResponseEntity.notFound().build());
    }
}

package com.piun.piuproject.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "supply_progress")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class SupplyProgress {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "year_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Year year;

    @Column(name = "entry_date")
    private LocalDate entryDate;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "project_id")
    private Project project;

    @Column(name = "contract_type", length = 30)
    private String contractType;

    @Column(name = "contract_ref_no", length = 50)
    private String contractRefNo;

    @Column(name = "activity_id", length = 60)
    private String activityId;

    @Column(name = "activity_description", length = 500)
    private String activityDescription;

    @Column(name = "rate")
    private Double rate;

    @Column(name = "unit", length = 100)
    private String unit;

    @Column(name = "boq_quantities")
    private Double boqQuantities;

    @Column(name = "executed_quantities")
    private Double executedQuantities;

    @Column(name = "performance_percentage")
    private Double performancePercentage;

    @Column(name = "global_progress_rate")
    private Double globalProgressRate;

    @Column(name = "observation", columnDefinition = "TEXT")
    private String observation;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "duration")
    private Double duration;

    @Column(name = "duration_unit", length = 20)
    private String durationUnit;

    @Column(name = "date_created")
    private LocalDateTime dateCreated = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private User user;

    @OneToMany(mappedBy = "supplyProgress", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @JsonManagedReference("supply-milestone")
    private List<SupplyMonitoringMilestone> milestones = new ArrayList<>();

    public SupplyProgress() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Year getYear() { return year; }
    public void setYear(Year year) { this.year = year; }
    public LocalDate getEntryDate() { return entryDate; }
    public void setEntryDate(LocalDate entryDate) { this.entryDate = entryDate; }
    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }
    public String getContractType() { return contractType; }
    public void setContractType(String contractType) { this.contractType = contractType; }
    public String getContractRefNo() { return contractRefNo; }
    public void setContractRefNo(String contractRefNo) { this.contractRefNo = contractRefNo; }
    public String getActivityId() { return activityId; }
    public void setActivityId(String activityId) { this.activityId = activityId; }
    public String getActivityDescription() { return activityDescription; }
    public void setActivityDescription(String activityDescription) { this.activityDescription = activityDescription; }
    public Double getRate() { return rate; }
    public void setRate(Double rate) { this.rate = rate; }
    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }
    public Double getBoqQuantities() { return boqQuantities; }
    public void setBoqQuantities(Double boqQuantities) { this.boqQuantities = boqQuantities; }
    public Double getExecutedQuantities() { return executedQuantities; }
    public void setExecutedQuantities(Double executedQuantities) { this.executedQuantities = executedQuantities; }
    public Double getPerformancePercentage() { return performancePercentage; }
    public void setPerformancePercentage(Double performancePercentage) { this.performancePercentage = performancePercentage; }
    public Double getGlobalProgressRate() { return globalProgressRate; }
    public void setGlobalProgressRate(Double globalProgressRate) { this.globalProgressRate = globalProgressRate; }
    public String getObservation() { return observation; }
    public void setObservation(String observation) { this.observation = observation; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    public Double getDuration() { return duration; }
    public void setDuration(Double duration) { this.duration = duration; }
    public String getDurationUnit() { return durationUnit; }
    public void setDurationUnit(String durationUnit) { this.durationUnit = durationUnit; }
    public LocalDateTime getDateCreated() { return dateCreated; }
    public void setDateCreated(LocalDateTime dateCreated) { this.dateCreated = dateCreated; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public List<SupplyMonitoringMilestone> getMilestones() { return milestones; }
    public void setMilestones(List<SupplyMonitoringMilestone> milestones) { this.milestones = milestones; }
}

package com.piun.piuproject.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "design_work_progress")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class DesignWorkProgress {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "year_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Year year;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "project_id")
    private Project project;

    @Column(name = "contract_type", length = 30)
    private String contractType;

    @Column(name = "contract_ref_no", length = 50)
    private String contractRefNo;

    @Column(name = "activity_id", length = 60)
    private String activityId;

    @Column(name = "activity", length = 500)
    private String activity;

    @Column(name = "rate")
    private Double rate;

    @Column(name = "unit", length = 100)
    private String unit;

    @Column(name = "provisional_quantities")
    private Double provisionalQuantities;

    @Column(name = "executed_quantities")
    private Double executedQuantities;

    @Column(name = "percentage")
    private Double percentage;

    @Column(name = "global_progress_rate")
    private Double globalProgressRate;

    @Column(name = "observations", columnDefinition = "TEXT")
    private String observations;

    @Column(name = "activity_start_date")
    private LocalDate activityStartDate;

    @Column(name = "activity_end_date")
    private LocalDate activityEndDate;

    @Column(name = "duration")
    private Long duration;

    @Column(name = "duration_unit", length = 10)
    private String durationUnit;

    @Column(name = "date_created")
    private LocalDateTime dateCreated = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private User user;

    public DesignWorkProgress() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Year getYear() { return year; }
    public void setYear(Year year) { this.year = year; }
    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }
    public String getContractType() { return contractType; }
    public void setContractType(String contractType) { this.contractType = contractType; }
    public String getContractRefNo() { return contractRefNo; }
    public void setContractRefNo(String contractRefNo) { this.contractRefNo = contractRefNo; }
    public String getActivityId() { return activityId; }
    public void setActivityId(String activityId) { this.activityId = activityId; }
    public String getActivity() { return activity; }
    public void setActivity(String activity) { this.activity = activity; }
    public Double getRate() { return rate; }
    public void setRate(Double rate) { this.rate = rate; }
    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }
    public Double getProvisionalQuantities() { return provisionalQuantities; }
    public void setProvisionalQuantities(Double provisionalQuantities) { this.provisionalQuantities = provisionalQuantities; }
    public Double getExecutedQuantities() { return executedQuantities; }
    public void setExecutedQuantities(Double executedQuantities) { this.executedQuantities = executedQuantities; }
    public Double getPercentage() { return percentage; }
    public void setPercentage(Double percentage) { this.percentage = percentage; }
    public Double getGlobalProgressRate() { return globalProgressRate; }
    public void setGlobalProgressRate(Double globalProgressRate) { this.globalProgressRate = globalProgressRate; }
    public String getObservations() { return observations; }
    public void setObservations(String observations) { this.observations = observations; }
    public LocalDate getActivityStartDate() { return activityStartDate; }
    public void setActivityStartDate(LocalDate activityStartDate) { this.activityStartDate = activityStartDate; }
    public LocalDate getActivityEndDate() { return activityEndDate; }
    public void setActivityEndDate(LocalDate activityEndDate) { this.activityEndDate = activityEndDate; }
    public Long getDuration() { return duration; }
    public void setDuration(Long duration) { this.duration = duration; }
    public String getDurationUnit() { return durationUnit; }
    public void setDurationUnit(String durationUnit) { this.durationUnit = durationUnit; }
    public LocalDateTime getDateCreated() { return dateCreated; }
    public void setDateCreated(LocalDateTime dateCreated) { this.dateCreated = dateCreated; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}

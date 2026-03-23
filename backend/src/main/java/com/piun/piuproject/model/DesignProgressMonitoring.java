package com.piun.piuproject.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "design_progress_monitoring")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class DesignProgressMonitoring {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "year_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Year year;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "project_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
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

    @Column(name = "overall_planned_quantities")
    private Double overallPlannedQuantities;

    @Column(name = "date_created")
    private LocalDateTime dateCreated = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private User user;

    @OneToMany(mappedBy = "designProgressMonitoring", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonIgnoreProperties({"designProgressMonitoring", "hibernateLazyInitializer", "handler"})
    private List<DesignMonitoringMilestone> milestones;

    public DesignProgressMonitoring() {}

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
    public String getActivityDescription() { return activityDescription; }
    public void setActivityDescription(String activityDescription) { this.activityDescription = activityDescription; }
    public Double getRate() { return rate; }
    public void setRate(Double rate) { this.rate = rate; }
    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }
    public Double getOverallPlannedQuantities() { return overallPlannedQuantities; }
    public void setOverallPlannedQuantities(Double overallPlannedQuantities) { this.overallPlannedQuantities = overallPlannedQuantities; }
    public LocalDateTime getDateCreated() { return dateCreated; }
    public void setDateCreated(LocalDateTime dateCreated) { this.dateCreated = dateCreated; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public List<DesignMonitoringMilestone> getMilestones() { return milestones; }
    public void setMilestones(List<DesignMonitoringMilestone> milestones) { this.milestones = milestones; }
}

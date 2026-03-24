package com.piun.piuproject.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "design_monitoring_milestones")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class DesignMonitoringMilestone {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "design_progress_monitoring_id")
    @JsonIgnore
    private DesignProgressMonitoring designProgressMonitoring;

    @Column(name = "log_date")
    private LocalDate logDate;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "quarter_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Quarter quarter;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "frequency_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private DataCollectionFrequency frequency;

    @Column(name = "overall_planned_quantities")
    private Double overallPlannedQuantities;

    @Column(name = "achieved_values")
    private Double achievedValues;

    @Column(name = "planned_vs_achieved_pct")
    private Double plannedVsAchievedPct;

    @Column(name = "achieved_vs_global_pct")
    private Double achievedVsGlobalPct;

    @Column(name = "status", length = 20)
    private String status;

    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks;

    @Column(name = "date_created")
    private LocalDateTime dateCreated = LocalDateTime.now();

    public DesignMonitoringMilestone() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public DesignProgressMonitoring getDesignProgressMonitoring() { return designProgressMonitoring; }
    public void setDesignProgressMonitoring(DesignProgressMonitoring designProgressMonitoring) { this.designProgressMonitoring = designProgressMonitoring; }
    public LocalDate getLogDate() { return logDate; }
    public void setLogDate(LocalDate logDate) { this.logDate = logDate; }
    public Quarter getQuarter() { return quarter; }
    public void setQuarter(Quarter quarter) { this.quarter = quarter; }
    public DataCollectionFrequency getFrequency() { return frequency; }
    public void setFrequency(DataCollectionFrequency frequency) { this.frequency = frequency; }
    public Double getOverallPlannedQuantities() { return overallPlannedQuantities; }
    public void setOverallPlannedQuantities(Double overallPlannedQuantities) { this.overallPlannedQuantities = overallPlannedQuantities; }
    public Double getAchievedValues() { return achievedValues; }
    public void setAchievedValues(Double achievedValues) { this.achievedValues = achievedValues; }
    public Double getPlannedVsAchievedPct() { return plannedVsAchievedPct; }
    public void setPlannedVsAchievedPct(Double plannedVsAchievedPct) { this.plannedVsAchievedPct = plannedVsAchievedPct; }
    public Double getAchievedVsGlobalPct() { return achievedVsGlobalPct; }
    public void setAchievedVsGlobalPct(Double achievedVsGlobalPct) { this.achievedVsGlobalPct = achievedVsGlobalPct; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
    public LocalDateTime getDateCreated() { return dateCreated; }
    public void setDateCreated(LocalDateTime dateCreated) { this.dateCreated = dateCreated; }
}

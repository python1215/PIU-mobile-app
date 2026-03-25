package com.piun.piuproject.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "supply_monitoring_milestones")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class SupplyMonitoringMilestone {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supply_progress_id")
    @JsonBackReference("supply-milestone")
    private SupplyProgress supplyProgress;

    @Column(name = "log_date")
    private LocalDate logDate;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "quarter_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Quarter quarter;

    @Column(name = "planned_values")
    private Double plannedValues;

    @Column(name = "achieved_values")
    private Double achievedValues;

    @Column(name = "planned_vs_achieved_pct")
    private Double plannedVsAchievedPct;

    @Column(name = "status", length = 20)
    private String status;

    @Column(name = "attachment_path", columnDefinition = "TEXT")
    private String attachmentPath;

    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks;

    @Column(name = "date_created")
    private LocalDateTime dateCreated = LocalDateTime.now();

    public SupplyMonitoringMilestone() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public SupplyProgress getSupplyProgress() { return supplyProgress; }
    public void setSupplyProgress(SupplyProgress supplyProgress) { this.supplyProgress = supplyProgress; }
    public LocalDate getLogDate() { return logDate; }
    public void setLogDate(LocalDate logDate) { this.logDate = logDate; }
    public Quarter getQuarter() { return quarter; }
    public void setQuarter(Quarter quarter) { this.quarter = quarter; }
    public Double getPlannedValues() { return plannedValues; }
    public void setPlannedValues(Double plannedValues) { this.plannedValues = plannedValues; }
    public Double getAchievedValues() { return achievedValues; }
    public void setAchievedValues(Double achievedValues) { this.achievedValues = achievedValues; }
    public Double getPlannedVsAchievedPct() { return plannedVsAchievedPct; }
    public void setPlannedVsAchievedPct(Double plannedVsAchievedPct) { this.plannedVsAchievedPct = plannedVsAchievedPct; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getAttachmentPath() { return attachmentPath; }
    public void setAttachmentPath(String attachmentPath) { this.attachmentPath = attachmentPath; }
    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
    public LocalDateTime getDateCreated() { return dateCreated; }
    public void setDateCreated(LocalDateTime dateCreated) { this.dateCreated = dateCreated; }
}

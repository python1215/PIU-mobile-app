package com.piun.piuproject.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "jmc_monitoring_milestones")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class JmcMonitoringMilestone {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "jmc_id")
    @JsonIgnore
    private Jmc jmc;

    @Column(name = "log_date")
    private LocalDate logDate;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "quarter_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Quarter quarter;

    @Column(name = "electricity_feeders", length = 500)
    private String electricityFeeders;

    @Column(name = "activity_start_date")
    private LocalDate activityStartDate;

    @Column(name = "activity_end_date")
    private LocalDate activityEndDate;

    @Column(name = "duration")
    private Integer duration;

    @Column(name = "planned_values")
    private Double plannedValues;

    @Column(name = "achieved_values")
    private Double achievedValues;

    @Column(name = "planned_vs_achieved_pct")
    private Double plannedVsAchievedPct;

    @Column(name = "achieved_vs_global_pct")
    private Double achievedVsGlobalPct;

    @Column(name = "status", length = 20)
    private String status;

    @Column(name = "attachment_path", columnDefinition = "TEXT")
    private String attachmentPath;

    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks;

    @Column(name = "snag")
    private Boolean snag = false;

    @Column(name = "date_created")
    private LocalDateTime dateCreated = LocalDateTime.now();

    public JmcMonitoringMilestone() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Jmc getJmc() { return jmc; }
    public void setJmc(Jmc jmc) { this.jmc = jmc; }
    public LocalDate getLogDate() { return logDate; }
    public void setLogDate(LocalDate logDate) { this.logDate = logDate; }
    public Quarter getQuarter() { return quarter; }
    public void setQuarter(Quarter quarter) { this.quarter = quarter; }
    public String getElectricityFeeders() { return electricityFeeders; }
    public void setElectricityFeeders(String electricityFeeders) { this.electricityFeeders = electricityFeeders; }
    public LocalDate getActivityStartDate() { return activityStartDate; }
    public void setActivityStartDate(LocalDate activityStartDate) { this.activityStartDate = activityStartDate; }
    public LocalDate getActivityEndDate() { return activityEndDate; }
    public void setActivityEndDate(LocalDate activityEndDate) { this.activityEndDate = activityEndDate; }
    public Integer getDuration() { return duration; }
    public void setDuration(Integer duration) { this.duration = duration; }
    public Double getPlannedValues() { return plannedValues; }
    public void setPlannedValues(Double plannedValues) { this.plannedValues = plannedValues; }
    public Double getAchievedValues() { return achievedValues; }
    public void setAchievedValues(Double achievedValues) { this.achievedValues = achievedValues; }
    public Double getPlannedVsAchievedPct() { return plannedVsAchievedPct; }
    public void setPlannedVsAchievedPct(Double plannedVsAchievedPct) { this.plannedVsAchievedPct = plannedVsAchievedPct; }
    public Double getAchievedVsGlobalPct() { return achievedVsGlobalPct; }
    public void setAchievedVsGlobalPct(Double achievedVsGlobalPct) { this.achievedVsGlobalPct = achievedVsGlobalPct; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getAttachmentPath() { return attachmentPath; }
    public void setAttachmentPath(String attachmentPath) { this.attachmentPath = attachmentPath; }
    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
    public Boolean getSnag() { return snag; }
    public void setSnag(Boolean snag) { this.snag = snag; }
    public LocalDateTime getDateCreated() { return dateCreated; }
    public void setDateCreated(LocalDateTime dateCreated) { this.dateCreated = dateCreated; }
}

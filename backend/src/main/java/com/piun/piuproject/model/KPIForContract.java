package com.piun.piuproject.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "kpi_for_contracts")
public class KPIForContract {
    @Id
    @Column(name = "monitoring_type_code", length = 15)
    private String monitoringTypeCode;

    @ManyToOne
    @JoinColumn(name = "project_id")
    private Project project;

    @Column(name = "type_of_investment", columnDefinition = "TEXT")
    private String typeOfInvestment;

    @Column(name = "kpi_description", columnDefinition = "TEXT")
    private String kpiDescription;

    @ManyToOne
    @JoinColumn(name = "monitoring_type_id")
    private MonitoringType monitoringType;

    @Column(name = "date_created")
    private LocalDateTime dateCreated = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    public KPIForContract() {}

    public String getMonitoringTypeCode() { return monitoringTypeCode; }
    public void setMonitoringTypeCode(String monitoringTypeCode) { this.monitoringTypeCode = monitoringTypeCode; }
    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }
    public String getTypeOfInvestment() { return typeOfInvestment; }
    public void setTypeOfInvestment(String typeOfInvestment) { this.typeOfInvestment = typeOfInvestment; }
    public String getKpiDescription() { return kpiDescription; }
    public void setKpiDescription(String kpiDescription) { this.kpiDescription = kpiDescription; }
    public MonitoringType getMonitoringType() { return monitoringType; }
    public void setMonitoringType(MonitoringType monitoringType) { this.monitoringType = monitoringType; }
    public LocalDateTime getDateCreated() { return dateCreated; }
    public void setDateCreated(LocalDateTime dateCreated) { this.dateCreated = dateCreated; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}

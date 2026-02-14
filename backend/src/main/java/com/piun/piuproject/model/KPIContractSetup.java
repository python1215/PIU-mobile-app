package com.piun.piuproject.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "kpi_contract_setup")
public class KPIContractSetup {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "kpi_code", length = 50)
    private String kpiCode;

    @Column(name = "kpi_name", length = 255)
    private String kpiName;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "project_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Project project;

    @Column(name = "type_of_investment", columnDefinition = "TEXT")
    private String typeOfInvestment;

    @Column(name = "kpi_description", columnDefinition = "TEXT")
    private String kpiDescription;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "monitoring_type_id", referencedColumnName = "monitoring_type_code")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private MonitoringType monitoringType;

    @Column(name = "monitoring_type_code", length = 15)
    private String monitoringTypeCode;

    @Column(name = "date_created")
    private LocalDateTime dateCreated = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    public KPIContractSetup() {}

    public KPIContractSetup(String kpiCode, String kpiName) {
        this.kpiCode = kpiCode;
        this.kpiName = kpiName;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getKpiCode() { return kpiCode; }
    public void setKpiCode(String kpiCode) { this.kpiCode = kpiCode; }
    public String getKpiName() { return kpiName; }
    public void setKpiName(String kpiName) { this.kpiName = kpiName; }
    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }
    public String getTypeOfInvestment() { return typeOfInvestment; }
    public void setTypeOfInvestment(String typeOfInvestment) { this.typeOfInvestment = typeOfInvestment; }
    public String getMonitoringTypeCode() { return monitoringTypeCode; }
    public void setMonitoringTypeCode(String monitoringTypeCode) { this.monitoringTypeCode = monitoringTypeCode; }
    public String getKpiDescription() { return kpiDescription; }
    public void setKpiDescription(String kpiDescription) { this.kpiDescription = kpiDescription; }
    public MonitoringType getMonitoringType() { return monitoringType; }
    public void setMonitoringType(MonitoringType monitoringType) { this.monitoringType = monitoringType; }
    public LocalDateTime getDateCreated() { return dateCreated; }
    public void setDateCreated(LocalDateTime dateCreated) { this.dateCreated = dateCreated; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}

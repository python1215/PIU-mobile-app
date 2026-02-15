package com.piun.piuproject.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "specific_contract_monitoring")
public class SpecificContractMonitoring {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "project_id")
    private Project project;

    @Column(name = "contract_ref_no", length = 50)
    private String contractRefNo;

    @Column(name = "monitoring_date")
    private LocalDate monitoringDate;

    @ManyToOne
    @JoinColumn(name = "quarter_id")
    private Quarter quarter;

    @ManyToOne
    @JoinColumn(name = "monitoring_type_id")
    private MonitoringType monitoringType;

    @ManyToOne
    @JoinColumn(name = "investment_type_id")
    private InvestmentType investmentType;

    @ManyToOne
    @JoinColumn(name = "kpi_description_code")
    private KPIForContract kpiDescription;

    @Column(name = "milestone_start_date")
    private LocalDate milestoneStartDate;

    @Column(name = "milestone_end_date")
    private LocalDate milestoneEndDate;

    @Column(name = "target", columnDefinition = "TEXT")
    private String target;

    @Column(name = "achieved_status", columnDefinition = "TEXT")
    private String achievedStatus;

    @ManyToOne
    @JoinColumn(name = "implementation_status_id")
    private PhysicalProgress implementationStatus;

    @Column(name = "picture_of_status", length = 255)
    private String pictureOfStatus;

    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks;

    @Column(name = "date_created")
    private LocalDateTime dateCreated = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    public SpecificContractMonitoring() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }
    public String getContractRefNo() { return contractRefNo; }
    public void setContractRefNo(String contractRefNo) { this.contractRefNo = contractRefNo; }
    public LocalDate getMonitoringDate() { return monitoringDate; }
    public void setMonitoringDate(LocalDate monitoringDate) { this.monitoringDate = monitoringDate; }
    public Quarter getQuarter() { return quarter; }
    public void setQuarter(Quarter quarter) { this.quarter = quarter; }
    public MonitoringType getMonitoringType() { return monitoringType; }
    public void setMonitoringType(MonitoringType monitoringType) { this.monitoringType = monitoringType; }
    public InvestmentType getInvestmentType() { return investmentType; }
    public void setInvestmentType(InvestmentType investmentType) { this.investmentType = investmentType; }
    public KPIForContract getKpiDescription() { return kpiDescription; }
    public void setKpiDescription(KPIForContract kpiDescription) { this.kpiDescription = kpiDescription; }
    public LocalDate getMilestoneStartDate() { return milestoneStartDate; }
    public void setMilestoneStartDate(LocalDate milestoneStartDate) { this.milestoneStartDate = milestoneStartDate; }
    public LocalDate getMilestoneEndDate() { return milestoneEndDate; }
    public void setMilestoneEndDate(LocalDate milestoneEndDate) { this.milestoneEndDate = milestoneEndDate; }
    public String getTarget() { return target; }
    public void setTarget(String target) { this.target = target; }
    public String getAchievedStatus() { return achievedStatus; }
    public void setAchievedStatus(String achievedStatus) { this.achievedStatus = achievedStatus; }
    public PhysicalProgress getImplementationStatus() { return implementationStatus; }
    public void setImplementationStatus(PhysicalProgress implementationStatus) { this.implementationStatus = implementationStatus; }
    public String getPictureOfStatus() { return pictureOfStatus; }
    public void setPictureOfStatus(String pictureOfStatus) { this.pictureOfStatus = pictureOfStatus; }
    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
    public LocalDateTime getDateCreated() { return dateCreated; }
    public void setDateCreated(LocalDateTime dateCreated) { this.dateCreated = dateCreated; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}

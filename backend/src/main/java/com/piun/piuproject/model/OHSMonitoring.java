package com.piun.piuproject.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "ohs_monitoring")
public class OHSMonitoring {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "project_id")
    private Project project;

    @ManyToOne
    @JoinColumn(name = "investment_type_code")
    private KPIForContract investmentType;

    @ManyToOne
    @JoinColumn(name = "year_id")
    private Year year;

    @ManyToOne
    @JoinColumn(name = "quarter_id")
    private Quarter quarter;

    @Column(name = "monitoring_date")
    private LocalDate monitoringDate;

    @ManyToOne
    @JoinColumn(name = "region_code")
    private Region region;

    @ManyToOne
    @JoinColumn(name = "district_code")
    private District district;

    @ManyToOne
    @JoinColumn(name = "settlement_code")
    private Settlement settlement;

    @Column(name = "quality_at_entry_requirement", columnDefinition = "TEXT")
    private String qualityAtEntryRequirement;

    @Column(name = "working_environment", columnDefinition = "TEXT")
    private String workingEnvironment;

    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks;

    @Column(name = "male")
    private Integer male;

    @Column(name = "female")
    private Integer female;

    @Column(name = "youth_male")
    private Integer youthMale;

    @Column(name = "youth_female")
    private Integer youthFemale;

    @ManyToOne
    @JoinColumn(name = "kpi_description_code")
    private KPIForContract kpiDescription;

    @Column(name = "picture", length = 255)
    private String picture;

    @Column(name = "date_created")
    private LocalDateTime dateCreated = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    public OHSMonitoring() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }
    public KPIForContract getInvestmentType() { return investmentType; }
    public void setInvestmentType(KPIForContract investmentType) { this.investmentType = investmentType; }
    public Year getYear() { return year; }
    public void setYear(Year year) { this.year = year; }
    public Quarter getQuarter() { return quarter; }
    public void setQuarter(Quarter quarter) { this.quarter = quarter; }
    public LocalDate getMonitoringDate() { return monitoringDate; }
    public void setMonitoringDate(LocalDate monitoringDate) { this.monitoringDate = monitoringDate; }
    public Region getRegion() { return region; }
    public void setRegion(Region region) { this.region = region; }
    public District getDistrict() { return district; }
    public void setDistrict(District district) { this.district = district; }
    public Settlement getSettlement() { return settlement; }
    public void setSettlement(Settlement settlement) { this.settlement = settlement; }
    public String getQualityAtEntryRequirement() { return qualityAtEntryRequirement; }
    public void setQualityAtEntryRequirement(String qualityAtEntryRequirement) { this.qualityAtEntryRequirement = qualityAtEntryRequirement; }
    public String getWorkingEnvironment() { return workingEnvironment; }
    public void setWorkingEnvironment(String workingEnvironment) { this.workingEnvironment = workingEnvironment; }
    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
    public Integer getMale() { return male; }
    public void setMale(Integer male) { this.male = male; }
    public Integer getFemale() { return female; }
    public void setFemale(Integer female) { this.female = female; }
    public Integer getYouthMale() { return youthMale; }
    public void setYouthMale(Integer youthMale) { this.youthMale = youthMale; }
    public Integer getYouthFemale() { return youthFemale; }
    public void setYouthFemale(Integer youthFemale) { this.youthFemale = youthFemale; }
    public KPIForContract getKpiDescription() { return kpiDescription; }
    public void setKpiDescription(KPIForContract kpiDescription) { this.kpiDescription = kpiDescription; }
    public String getPicture() { return picture; }
    public void setPicture(String picture) { this.picture = picture; }
    public LocalDateTime getDateCreated() { return dateCreated; }
    public void setDateCreated(LocalDateTime dateCreated) { this.dateCreated = dateCreated; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}

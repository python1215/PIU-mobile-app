package com.piun.piuproject.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "contract_profiling_works")
public class ContractProfilingWorks {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "project_id")
    private Project project;

    @ManyToOne
    @JoinColumn(name = "component_id")
    private Component component;

    @ManyToOne
    @JoinColumn(name = "subcomponent_id")
    private Subcomponent subcomponent;

    @ManyToOne
    @JoinColumn(name = "activity_id")
    private Activity activity;

    @ManyToOne
    @JoinColumn(name = "project_category_id")
    private ProjectCategory projectCategory;

    @ManyToOne
    @JoinColumn(name = "funding_source_id")
    private Donor fundingSource;

    @Column(name = "main_intervention_focus", length = 500)
    private String mainInterventionFocus;

    @Column(name = "target_beneficiary_settlements")
    private Integer targetBeneficiarySettlements;

    @Column(name = "location_of_investment", length = 500)
    private String locationOfInvestment;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Column(name = "gross_floor_area_m2")
    private Integer grossFloorAreaM2;

    @ManyToOne
    @JoinColumn(name = "currency_id")
    private Currency currency;

    @Column(name = "contract_value", precision = 15, scale = 2)
    private BigDecimal contractValue;

    @Column(name = "amendments")
    private Boolean amendments = false;

    @Column(name = "contract_ref_no", length = 50)
    private String contractRefNo;

    @Column(name = "name_of_contractor", length = 100)
    private String nameOfContractor;

    @Column(name = "name_of_consultant", length = 200)
    private String nameOfConsultant;

    @Column(name = "contract_start_date")
    private LocalDate contractStartDate;

    @Column(name = "contract_end_date")
    private LocalDate contractEndDate;

    @Column(name = "duration", length = 20)
    private String duration;

    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks;

    @Column(name = "date_created")
    private LocalDateTime dateCreated = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    public ContractProfilingWorks() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }
    public Component getComponent() { return component; }
    public void setComponent(Component component) { this.component = component; }
    public Subcomponent getSubcomponent() { return subcomponent; }
    public void setSubcomponent(Subcomponent subcomponent) { this.subcomponent = subcomponent; }
    public Activity getActivity() { return activity; }
    public void setActivity(Activity activity) { this.activity = activity; }
    public ProjectCategory getProjectCategory() { return projectCategory; }
    public void setProjectCategory(ProjectCategory projectCategory) { this.projectCategory = projectCategory; }
    public Donor getFundingSource() { return fundingSource; }
    public void setFundingSource(Donor fundingSource) { this.fundingSource = fundingSource; }
    public String getMainInterventionFocus() { return mainInterventionFocus; }
    public void setMainInterventionFocus(String mainInterventionFocus) { this.mainInterventionFocus = mainInterventionFocus; }
    public Integer getTargetBeneficiarySettlements() { return targetBeneficiarySettlements; }
    public void setTargetBeneficiarySettlements(Integer targetBeneficiarySettlements) { this.targetBeneficiarySettlements = targetBeneficiarySettlements; }
    public String getLocationOfInvestment() { return locationOfInvestment; }
    public void setLocationOfInvestment(String locationOfInvestment) { this.locationOfInvestment = locationOfInvestment; }
    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    public Integer getGrossFloorAreaM2() { return grossFloorAreaM2; }
    public void setGrossFloorAreaM2(Integer grossFloorAreaM2) { this.grossFloorAreaM2 = grossFloorAreaM2; }
    public Currency getCurrency() { return currency; }
    public void setCurrency(Currency currency) { this.currency = currency; }
    public BigDecimal getContractValue() { return contractValue; }
    public void setContractValue(BigDecimal contractValue) { this.contractValue = contractValue; }
    public Boolean getAmendments() { return amendments; }
    public void setAmendments(Boolean amendments) { this.amendments = amendments; }
    public String getContractRefNo() { return contractRefNo; }
    public void setContractRefNo(String contractRefNo) { this.contractRefNo = contractRefNo; }
    public String getNameOfContractor() { return nameOfContractor; }
    public void setNameOfContractor(String nameOfContractor) { this.nameOfContractor = nameOfContractor; }
    public String getNameOfConsultant() { return nameOfConsultant; }
    public void setNameOfConsultant(String nameOfConsultant) { this.nameOfConsultant = nameOfConsultant; }
    public LocalDate getContractStartDate() { return contractStartDate; }
    public void setContractStartDate(LocalDate contractStartDate) { this.contractStartDate = contractStartDate; }
    public LocalDate getContractEndDate() { return contractEndDate; }
    public void setContractEndDate(LocalDate contractEndDate) { this.contractEndDate = contractEndDate; }
    public String getDuration() { return duration; }
    public void setDuration(String duration) { this.duration = duration; }
    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
    public LocalDateTime getDateCreated() { return dateCreated; }
    public void setDateCreated(LocalDateTime dateCreated) { this.dateCreated = dateCreated; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}

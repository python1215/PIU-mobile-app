package com.piun.piuproject.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "contract_profiling_goods")
public class ContractProfilingGoods {
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

    @ManyToOne
    @JoinColumn(name = "currency_id")
    private Currency currency;

    @Column(name = "contract_value", precision = 15, scale = 2)
    private BigDecimal contractValue;

    @Column(name = "amendments")
    private Boolean amendments = false;

    @Column(name = "contract_ref_no", length = 50)
    private String contractRefNo;

    @Column(name = "name_of_supplier", length = 100)
    private String nameOfSupplier;

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

    public ContractProfilingGoods() {}

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
    public Currency getCurrency() { return currency; }
    public void setCurrency(Currency currency) { this.currency = currency; }
    public BigDecimal getContractValue() { return contractValue; }
    public void setContractValue(BigDecimal contractValue) { this.contractValue = contractValue; }
    public Boolean getAmendments() { return amendments; }
    public void setAmendments(Boolean amendments) { this.amendments = amendments; }
    public String getContractRefNo() { return contractRefNo; }
    public void setContractRefNo(String contractRefNo) { this.contractRefNo = contractRefNo; }
    public String getNameOfSupplier() { return nameOfSupplier; }
    public void setNameOfSupplier(String nameOfSupplier) { this.nameOfSupplier = nameOfSupplier; }
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

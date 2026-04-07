package com.piun.piuproject.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "pap")
public class PAP {
    @Id
    @Column(name = "pap_identification_number", length = 15)
    private String papIdentificationNumber;

    @ManyToOne
    @JoinColumn(name = "project_id")
    private Project project;

    @ManyToOne
    @JoinColumn(name = "investment_type_code")
    private KPIContractSetup investmentType;

    @ManyToOne
    @JoinColumn(name = "pap_type_id")
    private TypeOfPAP papType;

    @ManyToOne
    @JoinColumn(name = "region_code")
    private Region region;

    @ManyToOne
    @JoinColumn(name = "district_code")
    private District district;

    @Column(name = "pap_name", length = 150)
    private String papName;

    @Column(name = "sex", length = 1)
    private String sex;

    @ManyToOne
    @JoinColumn(name = "pap_category_id")
    private PAPCategory papCategory;

    @ManyToOne
    @JoinColumn(name = "current_address_code")
    private Settlement currentAddress;

    @ManyToOne
    @JoinColumn(name = "vulnerability_category_id")
    private VulnerabilityCategory vulnerabilityCategory;

    @Column(name = "location_of_impact", length = 200)
    private String locationOfImpact;

    @ManyToOne
    @JoinColumn(name = "impact_type_id")
    private TypeOfImpact impactType;

    @ManyToOne
    @JoinColumn(name = "nature_of_compensation_id")
    private NatureOfSettlement natureOfCompensation;

    @Column(name = "amount", precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(name = "area", length = 50)
    private String area;

    @Column(name = "pap_compensated", length = 1)
    private String papCompensated;

    @Column(name = "compensation_date")
    private LocalDate compensationDate;

    @Column(name = "compensation_ref_no", length = 30)
    private String compensationRefNo;

    @Column(name = "pre_project_situation", columnDefinition = "TEXT")
    private String preProjectSituation;

    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks;

    @Column(name = "date_received_from")
    private LocalDate dateReceivedFrom;

    @Column(name = "date_received_to")
    private LocalDate dateReceivedTo;

    @Column(name = "document_upload", length = 255)
    private String documentUpload;

    @ManyToOne
    @JoinColumn(name = "profile_year_id")
    private Year profileYear;

    @ManyToOne
    @JoinColumn(name = "identification_document_id")
    private IdentificationDocument identificationDocument;

    @Column(name = "id_document_upload", length = 255)
    private String idDocumentUpload;

    @Column(name = "date_created")
    private LocalDateTime dateCreated = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    public PAP() {}

    public String getPapIdentificationNumber() { return papIdentificationNumber; }
    public void setPapIdentificationNumber(String papIdentificationNumber) { this.papIdentificationNumber = papIdentificationNumber; }
    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }
    public KPIContractSetup getInvestmentType() { return investmentType; }
    public void setInvestmentType(KPIContractSetup investmentType) { this.investmentType = investmentType; }
    public TypeOfPAP getPapType() { return papType; }
    public void setPapType(TypeOfPAP papType) { this.papType = papType; }
    public Region getRegion() { return region; }
    public void setRegion(Region region) { this.region = region; }
    public District getDistrict() { return district; }
    public void setDistrict(District district) { this.district = district; }
    public String getPapName() { return papName; }
    public void setPapName(String papName) { this.papName = papName; }
    public String getSex() { return sex; }
    public void setSex(String sex) { this.sex = sex; }
    public PAPCategory getPapCategory() { return papCategory; }
    public void setPapCategory(PAPCategory papCategory) { this.papCategory = papCategory; }
    public Settlement getCurrentAddress() { return currentAddress; }
    public void setCurrentAddress(Settlement currentAddress) { this.currentAddress = currentAddress; }
    public VulnerabilityCategory getVulnerabilityCategory() { return vulnerabilityCategory; }
    public void setVulnerabilityCategory(VulnerabilityCategory vulnerabilityCategory) { this.vulnerabilityCategory = vulnerabilityCategory; }
    public String getLocationOfImpact() { return locationOfImpact; }
    public void setLocationOfImpact(String locationOfImpact) { this.locationOfImpact = locationOfImpact; }
    public TypeOfImpact getImpactType() { return impactType; }
    public void setImpactType(TypeOfImpact impactType) { this.impactType = impactType; }
    public NatureOfSettlement getNatureOfCompensation() { return natureOfCompensation; }
    public void setNatureOfCompensation(NatureOfSettlement natureOfCompensation) { this.natureOfCompensation = natureOfCompensation; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public String getArea() { return area; }
    public void setArea(String area) { this.area = area; }
    public String getPapCompensated() { return papCompensated; }
    public void setPapCompensated(String papCompensated) { this.papCompensated = papCompensated; }
    public LocalDate getCompensationDate() { return compensationDate; }
    public void setCompensationDate(LocalDate compensationDate) { this.compensationDate = compensationDate; }
    public String getCompensationRefNo() { return compensationRefNo; }
    public void setCompensationRefNo(String compensationRefNo) { this.compensationRefNo = compensationRefNo; }
    public String getPreProjectSituation() { return preProjectSituation; }
    public void setPreProjectSituation(String preProjectSituation) { this.preProjectSituation = preProjectSituation; }
    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
    public LocalDate getDateReceivedFrom() { return dateReceivedFrom; }
    public void setDateReceivedFrom(LocalDate dateReceivedFrom) { this.dateReceivedFrom = dateReceivedFrom; }
    public LocalDate getDateReceivedTo() { return dateReceivedTo; }
    public void setDateReceivedTo(LocalDate dateReceivedTo) { this.dateReceivedTo = dateReceivedTo; }
    public String getDocumentUpload() { return documentUpload; }
    public void setDocumentUpload(String documentUpload) { this.documentUpload = documentUpload; }
    public Year getProfileYear() { return profileYear; }
    public void setProfileYear(Year profileYear) { this.profileYear = profileYear; }
    public IdentificationDocument getIdentificationDocument() { return identificationDocument; }
    public void setIdentificationDocument(IdentificationDocument identificationDocument) { this.identificationDocument = identificationDocument; }
    public String getIdDocumentUpload() { return idDocumentUpload; }
    public void setIdDocumentUpload(String idDocumentUpload) { this.idDocumentUpload = idDocumentUpload; }
    public LocalDateTime getDateCreated() { return dateCreated; }
    public void setDateCreated(LocalDateTime dateCreated) { this.dateCreated = dateCreated; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}

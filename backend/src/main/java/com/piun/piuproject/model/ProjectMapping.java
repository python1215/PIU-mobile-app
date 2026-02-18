package com.piun.piuproject.model;

import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "project_mapping")
public class ProjectMapping {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "year_id")
    private Year profileYear;

    @ManyToOne
    @JoinColumn(name = "region_code")
    private Region region;

    @ManyToOne
    @JoinColumn(name = "district_code")
    private District district;

    @ManyToOne
    @JoinColumn(name = "settlement_code")
    private Settlement settlement;

    @Column(name = "total_households")
    private Integer totalHouseholds;

    @Column(name = "connected_households")
    private Integer connectedHouseholds;

    @Column(name = "customer_connections")
    private Integer customerConnections;

    @Column(name = "female_households")
    private Integer femaleHouseholds;

    @Column(name = "male_households")
    private Integer maleHouseholds;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @ManyToOne
    @JoinColumn(name = "access_type_id")
    private AccessType accessType;

    @ManyToOne
    @JoinColumn(name = "project_id")
    private Project project;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "project_mapping_donors",
        joinColumns = @JoinColumn(name = "project_mapping_id"),
        inverseJoinColumns = @JoinColumn(name = "donor_id")
    )
    private Set<Donor> donors = new HashSet<>();

    public ProjectMapping() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Year getProfileYear() { return profileYear; }
    public void setProfileYear(Year profileYear) { this.profileYear = profileYear; }
    public Region getRegion() { return region; }
    public void setRegion(Region region) { this.region = region; }
    public District getDistrict() { return district; }
    public void setDistrict(District district) { this.district = district; }
    public Settlement getSettlement() { return settlement; }
    public void setSettlement(Settlement settlement) { this.settlement = settlement; }
    public Integer getTotalHouseholds() { return totalHouseholds; }
    public void setTotalHouseholds(Integer totalHouseholds) { this.totalHouseholds = totalHouseholds; }
    public Integer getConnectedHouseholds() { return connectedHouseholds; }
    public void setConnectedHouseholds(Integer connectedHouseholds) { this.connectedHouseholds = connectedHouseholds; }
    public Integer getCustomerConnections() { return customerConnections; }
    public void setCustomerConnections(Integer customerConnections) { this.customerConnections = customerConnections; }
    public Integer getFemaleHouseholds() { return femaleHouseholds; }
    public void setFemaleHouseholds(Integer femaleHouseholds) { this.femaleHouseholds = femaleHouseholds; }
    public Integer getMaleHouseholds() { return maleHouseholds; }
    public void setMaleHouseholds(Integer maleHouseholds) { this.maleHouseholds = maleHouseholds; }
    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    public AccessType getAccessType() { return accessType; }
    public void setAccessType(AccessType accessType) { this.accessType = accessType; }
    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }
    public Set<Donor> getDonors() { return donors; }
    public void setDonors(Set<Donor> donors) { this.donors = donors; }
}

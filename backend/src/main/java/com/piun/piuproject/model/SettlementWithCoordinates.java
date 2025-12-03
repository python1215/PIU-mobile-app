package com.piun.piuproject.model;

import jakarta.persistence.*;

@Entity
@Table(name = "settlement_with_coordinates")
public class SettlementWithCoordinates {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "region", length = 50)
    private String region;

    @Column(name = "lga", length = 50)
    private String lga;

    @Column(name = "district", length = 100)
    private String district;

    @Column(name = "ward", length = 100)
    private String ward;

    @Column(name = "settlement_code", length = 25)
    private String settlementCode;

    @Column(name = "settlement_name", length = 100)
    private String settlementName;

    @Column(name = "population_household")
    private Integer populationHousehold;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    public SettlementWithCoordinates() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getRegion() { return region; }
    public void setRegion(String region) { this.region = region; }
    public String getLga() { return lga; }
    public void setLga(String lga) { this.lga = lga; }
    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }
    public String getWard() { return ward; }
    public void setWard(String ward) { this.ward = ward; }
    public String getSettlementCode() { return settlementCode; }
    public void setSettlementCode(String settlementCode) { this.settlementCode = settlementCode; }
    public String getSettlementName() { return settlementName; }
    public void setSettlementName(String settlementName) { this.settlementName = settlementName; }
    public Integer getPopulationHousehold() { return populationHousehold; }
    public void setPopulationHousehold(Integer populationHousehold) { this.populationHousehold = populationHousehold; }
    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
}

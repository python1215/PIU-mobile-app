package com.piun.piuproject.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.List;

@Entity
@Table(name = "districts")
public class District {
    @Id
    @Column(name = "district_code", length = 5)
    private String districtCode;

    @Column(name = "district_name", length = 100, unique = true)
    private String districtName;

    @ManyToOne
    @JoinColumn(name = "lga_code")
    private LGA lga;

    @OneToMany(mappedBy = "district", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Settlement> settlements;

    @OneToMany(mappedBy = "district", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Ward> wards;

    public District() {}

    public District(String districtCode, String districtName, LGA lga) {
        this.districtCode = districtCode;
        this.districtName = districtName;
        this.lga = lga;
    }

    public String getDistrictCode() { return districtCode; }
    public void setDistrictCode(String districtCode) { this.districtCode = districtCode; }
    public String getDistrictName() { return districtName; }
    public void setDistrictName(String districtName) { this.districtName = districtName; }
    public LGA getLga() { return lga; }
    public void setLga(LGA lga) { this.lga = lga; }
    public List<Settlement> getSettlements() { return settlements; }
    public void setSettlements(List<Settlement> settlements) { this.settlements = settlements; }
    public List<Ward> getWards() { return wards; }
    public void setWards(List<Ward> wards) { this.wards = wards; }
}

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
    @JoinColumn(name = "region_code")
    private Region region;

    @OneToMany(mappedBy = "district", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Settlement> settlements;

    public District() {}

    public District(String districtCode, String districtName, Region region) {
        this.districtCode = districtCode;
        this.districtName = districtName;
        this.region = region;
    }

    public String getDistrictCode() { return districtCode; }
    public void setDistrictCode(String districtCode) { this.districtCode = districtCode; }
    public String getDistrictName() { return districtName; }
    public void setDistrictName(String districtName) { this.districtName = districtName; }
    public Region getRegion() { return region; }
    public void setRegion(Region region) { this.region = region; }
    public List<Settlement> getSettlements() { return settlements; }
    public void setSettlements(List<Settlement> settlements) { this.settlements = settlements; }
}

package com.piun.piuproject.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "regions")
public class Region {
    @Id
    @Column(name = "region_code", length = 5)
    private String regionCode;

    @Column(name = "region_name", length = 50, unique = true)
    private String regionName;

    @Column(name = "description", length = 100)
    private String description;

    @JsonIgnore
    @OneToMany(mappedBy = "region", cascade = CascadeType.ALL)
    private List<LGA> lgas;

    public Region() {}

    public Region(String regionCode, String regionName, String description) {
        this.regionCode = regionCode;
        this.regionName = regionName;
        this.description = description;
    }

    public String getRegionCode() { return regionCode; }
    public void setRegionCode(String regionCode) { this.regionCode = regionCode; }
    public String getRegionName() { return regionName; }
    public void setRegionName(String regionName) { this.regionName = regionName; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public List<LGA> getLgas() { return lgas; }
    public void setLgas(List<LGA> lgas) { this.lgas = lgas; }
}

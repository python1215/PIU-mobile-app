package com.piun.piuproject.model;

import jakarta.persistence.*;

@Entity
@Table(name = "lgas")
public class LGA {
    @Id
    @Column(name = "lga_code", length = 5)
    private String lgaCode;

    @Column(name = "lga_name", length = 50, unique = true)
    private String lgaName;

    @ManyToOne
    @JoinColumn(name = "region_code")
    private Region region;

    public LGA() {}

    public LGA(String lgaCode, String lgaName, Region region) {
        this.lgaCode = lgaCode;
        this.lgaName = lgaName;
        this.region = region;
    }

    public String getLgaCode() { return lgaCode; }
    public void setLgaCode(String lgaCode) { this.lgaCode = lgaCode; }
    public String getLgaName() { return lgaName; }
    public void setLgaName(String lgaName) { this.lgaName = lgaName; }
    public Region getRegion() { return region; }
    public void setRegion(Region region) { this.region = region; }
}

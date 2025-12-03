package com.piun.piuproject.model;

import jakarta.persistence.*;

@Entity
@Table(name = "wards")
public class Ward {
    @Id
    @Column(name = "ward_code", length = 5)
    private String wardCode;

    @Column(name = "ward_name", length = 50, unique = true)
    private String wardName;

    @ManyToOne
    @JoinColumn(name = "district_code")
    private District district;

    public Ward() {}

    public Ward(String wardCode, String wardName, District district) {
        this.wardCode = wardCode;
        this.wardName = wardName;
        this.district = district;
    }

    public String getWardCode() { return wardCode; }
    public void setWardCode(String wardCode) { this.wardCode = wardCode; }
    public String getWardName() { return wardName; }
    public void setWardName(String wardName) { this.wardName = wardName; }
    public District getDistrict() { return district; }
    public void setDistrict(District district) { this.district = district; }
}

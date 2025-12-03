package com.piun.piuproject.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.List;

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

    @OneToMany(mappedBy = "ward", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Settlement> settlements;

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
    public List<Settlement> getSettlements() { return settlements; }
    public void setSettlements(List<Settlement> settlements) { this.settlements = settlements; }
}

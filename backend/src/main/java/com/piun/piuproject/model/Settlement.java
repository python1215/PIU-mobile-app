package com.piun.piuproject.model;

import jakarta.persistence.*;

@Entity
@Table(name = "settlements")
public class Settlement {
    @Id
    @Column(name = "settlement_code", length = 10)
    private String settlementCode;

    @Column(name = "settlement_name", length = 150)
    private String settlementName;

    @ManyToOne
    @JoinColumn(name = "district_code")
    private District district;

    @Column(name = "ward_code", length = 10)
    private String wardCode;

    @Column(name = "ea", length = 10)
    private String ea;

    public Settlement() {}

    public Settlement(String settlementCode, String settlementName, District district) {
        this.settlementCode = settlementCode;
        this.settlementName = settlementName;
        this.district = district;
    }

    public String getSettlementCode() { return settlementCode; }
    public void setSettlementCode(String settlementCode) { this.settlementCode = settlementCode; }
    public String getSettlementName() { return settlementName; }
    public void setSettlementName(String settlementName) { this.settlementName = settlementName; }
    public District getDistrict() { return district; }
    public void setDistrict(District district) { this.district = district; }
    public String getWardCode() { return wardCode; }
    public void setWardCode(String wardCode) { this.wardCode = wardCode; }
    public String getEa() { return ea; }
    public void setEa(String ea) { this.ea = ea; }
}

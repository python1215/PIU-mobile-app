package com.piun.piuproject.model;

import jakarta.persistence.*;

@Entity
@Table(name = "kpi_contract_setup")
public class KPIContractSetup {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "kpi_code", length = 50)
    private String kpiCode;

    @Column(name = "kpi_name", length = 255)
    private String kpiName;

    public KPIContractSetup() {}

    public KPIContractSetup(String kpiCode, String kpiName) {
        this.kpiCode = kpiCode;
        this.kpiName = kpiName;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getKpiCode() { return kpiCode; }
    public void setKpiCode(String kpiCode) { this.kpiCode = kpiCode; }
    public String getKpiName() { return kpiName; }
    public void setKpiName(String kpiName) { this.kpiName = kpiName; }
}

package com.piun.piuproject.model;

import jakarta.persistence.*;

@Entity
@Table(name = "nawec_infrastructure")
public class NawecInfrastructure {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "scode", length = 50)
    private String scode;

    @Column(name = "no_of_transformers")
    private Integer noOfTransformers;

    @Column(name = "transformer_name", length = 50)
    private String transformerName;

    @Column(name = "households_with_electricity")
    private Integer householdsWithElectricity;

    @Column(name = "water_supply_source", length = 50)
    private String waterSupplySource;

    @Column(name = "households_with_water")
    private Integer householdsWithWater;

    public NawecInfrastructure() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getScode() { return scode; }
    public void setScode(String scode) { this.scode = scode; }
    public Integer getNoOfTransformers() { return noOfTransformers; }
    public void setNoOfTransformers(Integer noOfTransformers) { this.noOfTransformers = noOfTransformers; }
    public String getTransformerName() { return transformerName; }
    public void setTransformerName(String transformerName) { this.transformerName = transformerName; }
    public Integer getHouseholdsWithElectricity() { return householdsWithElectricity; }
    public void setHouseholdsWithElectricity(Integer householdsWithElectricity) { this.householdsWithElectricity = householdsWithElectricity; }
    public String getWaterSupplySource() { return waterSupplySource; }
    public void setWaterSupplySource(String waterSupplySource) { this.waterSupplySource = waterSupplySource; }
    public Integer getHouseholdsWithWater() { return householdsWithWater; }
    public void setHouseholdsWithWater(Integer householdsWithWater) { this.householdsWithWater = householdsWithWater; }
}

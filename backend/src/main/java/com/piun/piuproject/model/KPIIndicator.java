package com.piun.piuproject.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "kpi_indicators")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class KPIIndicator {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(name = "indicator_no", unique = true, length = 20)
    private String indicatorNo;

    @Column(name = "indicator_description", columnDefinition = "TEXT")
    private String indicatorDescription;

    @Column(length = 200)
    private String attributes;

    @Column(name = "baseline_value")
    private Double baselineValue;

    @Column(name = "end_target_value")
    private Double endTargetValue;

    @Column(name = "targeted_weight_value")
    private Double targetedWeightValue;

    @Column(name = "date_created")
    private LocalDateTime dateCreated = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "login_user_id", nullable = false)
    private User loginUser;
}

package com.piun.piuproject.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "kpi_ess_ohs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class KpiEssOhs {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(name = "indicator", nullable = false, length = 500)
    private String indicator;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "ess_ohs_type_id")
    private EssOshMonitoringType essOhsType;

    @Column(name = "date_created")
    private LocalDateTime dateCreated = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "login_user_id")
    private User loginUser;
}

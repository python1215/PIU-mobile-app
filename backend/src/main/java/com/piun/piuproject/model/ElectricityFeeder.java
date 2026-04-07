package com.piun.piuproject.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "electricity_feeders")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ElectricityFeeder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(name = "feeder_id", unique = true, nullable = false, length = 30)
    private String feederId;

    @NotBlank
    @Column(nullable = false)
    private String feeder;

    @Column(name = "date_created")
    private LocalDateTime dateCreated = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "login_user_id")
    private User loginUser;
}

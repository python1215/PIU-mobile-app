package com.piun.piuproject.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "issue_actions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class IssueAction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "issue_id")
    private Long issueId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "project_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "donors", "contributors", "loginUser"})
    private Project project;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "year_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "loginUser"})
    private Year year;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "quarter_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "loginUser"})
    private Quarter quarter;

    @NotBlank
    @Column(name = "issue_code", length = 100)
    private String issueCode;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "issue_action_type_code")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "user"})
    private MonitoringType issueActionType;

    @Column(name = "description_of_issue_or_action", columnDefinition = "TEXT")
    private String descriptionOfIssueOrAction;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "source_of_issue_or_action_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "user"})
    private IssueActionSource sourceOfIssueOrAction;

    @Column(length = 50)
    private String status = "incomplete";

    @Column(length = 20)
    private String priority = "medium";

    @Column(name = "assigned_to", length = 100)
    private String assignedTo;

    @Column(name = "date_created")
    private LocalDateTime dateCreated = LocalDateTime.now();

    @Column(name = "date_updated")
    private LocalDateTime dateUpdated = LocalDateTime.now();

    @Column(name = "assign_date")
    private LocalDate assignDate;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "login_user_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "passwordHash"})
    private User loginUser;

    @PreUpdate
    protected void onUpdate() {
        dateUpdated = LocalDateTime.now();
        if ("complete".equals(status)) {
            priority = "done";
        } else if ("incomplete".equals(status) && "done".equals(priority)) {
            priority = "medium";
        }
    }
}

package com.piun.piuproject.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "grievance_monitoring_log")
public class GrievanceMonitoringLog {
    @Id
    @Column(name = "case_no", length = 15)
    private String caseNo;

    @ManyToOne
    @JoinColumn(name = "project_id")
    private Project project;

    @ManyToOne
    @JoinColumn(name = "investment_type_code")
    private KPIContractSetup investmentType;

    @Column(name = "sex", length = 1)
    private String sex;

    @Column(name = "date_claim_received")
    private LocalDate dateClaimReceived;

    @Column(name = "person_receiving_complaint", length = 150)
    private String personReceivingComplaint;

    @Column(name = "how_complaint_received", length = 20)
    private String howComplaintReceived;

    @Column(name = "name_of_complainant", length = 150)
    private String nameOfComplainant;

    @Column(name = "phone_number", length = 20)
    private String phoneNumber;

    @Column(name = "complaint_content", columnDefinition = "TEXT")
    private String complaintContent;

    @Column(name = "complaint_acknowledged", length = 1)
    private String complaintAcknowledged;

    @Column(name = "expected_decision_date")
    private LocalDate expectedDecisionDate;

    @ManyToOne
    @JoinColumn(name = "decision_outcome_id")
    private DecisionOutcome decisionOutcome;

    @Column(name = "resolution", length = 300)
    private String resolution;

    @Column(name = "decision_communicated", length = 1)
    private String decisionCommunicated;

    @Column(name = "communication_method", length = 20)
    private String communicationMethod;

    @Column(name = "complainant_satisfied", length = 1)
    private String complainantSatisfied;

    @Column(name = "brief_note_no_answer", columnDefinition = "TEXT")
    private String briefNoteNoAnswer;

    @Column(name = "follow_up_actions", columnDefinition = "TEXT")
    private String followUpActions;

    @Column(name = "date_created")
    private LocalDateTime dateCreated = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    public GrievanceMonitoringLog() {}

    public String getCaseNo() { return caseNo; }
    public void setCaseNo(String caseNo) { this.caseNo = caseNo; }
    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }
    public KPIContractSetup getInvestmentType() { return investmentType; }
    public void setInvestmentType(KPIContractSetup investmentType) { this.investmentType = investmentType; }
    public String getSex() { return sex; }
    public void setSex(String sex) { this.sex = sex; }
    public LocalDate getDateClaimReceived() { return dateClaimReceived; }
    public void setDateClaimReceived(LocalDate dateClaimReceived) { this.dateClaimReceived = dateClaimReceived; }
    public String getPersonReceivingComplaint() { return personReceivingComplaint; }
    public void setPersonReceivingComplaint(String personReceivingComplaint) { this.personReceivingComplaint = personReceivingComplaint; }
    public String getHowComplaintReceived() { return howComplaintReceived; }
    public void setHowComplaintReceived(String howComplaintReceived) { this.howComplaintReceived = howComplaintReceived; }
    public String getNameOfComplainant() { return nameOfComplainant; }
    public void setNameOfComplainant(String nameOfComplainant) { this.nameOfComplainant = nameOfComplainant; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public String getComplaintContent() { return complaintContent; }
    public void setComplaintContent(String complaintContent) { this.complaintContent = complaintContent; }
    public String getComplaintAcknowledged() { return complaintAcknowledged; }
    public void setComplaintAcknowledged(String complaintAcknowledged) { this.complaintAcknowledged = complaintAcknowledged; }
    public LocalDate getExpectedDecisionDate() { return expectedDecisionDate; }
    public void setExpectedDecisionDate(LocalDate expectedDecisionDate) { this.expectedDecisionDate = expectedDecisionDate; }
    public DecisionOutcome getDecisionOutcome() { return decisionOutcome; }
    public void setDecisionOutcome(DecisionOutcome decisionOutcome) { this.decisionOutcome = decisionOutcome; }
    public String getResolution() { return resolution; }
    public void setResolution(String resolution) { this.resolution = resolution; }
    public String getDecisionCommunicated() { return decisionCommunicated; }
    public void setDecisionCommunicated(String decisionCommunicated) { this.decisionCommunicated = decisionCommunicated; }
    public String getCommunicationMethod() { return communicationMethod; }
    public void setCommunicationMethod(String communicationMethod) { this.communicationMethod = communicationMethod; }
    public String getComplainantSatisfied() { return complainantSatisfied; }
    public void setComplainantSatisfied(String complainantSatisfied) { this.complainantSatisfied = complainantSatisfied; }
    public String getBriefNoteNoAnswer() { return briefNoteNoAnswer; }
    public void setBriefNoteNoAnswer(String briefNoteNoAnswer) { this.briefNoteNoAnswer = briefNoteNoAnswer; }
    public String getFollowUpActions() { return followUpActions; }
    public void setFollowUpActions(String followUpActions) { this.followUpActions = followUpActions; }
    public LocalDateTime getDateCreated() { return dateCreated; }
    public void setDateCreated(LocalDateTime dateCreated) { this.dateCreated = dateCreated; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}

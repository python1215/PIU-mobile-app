package com.piun.piuproject.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "community_engagement")
public class CommunityEngagement {
    @Id
    @Column(name = "reference_number", length = 15)
    private String referenceNumber;

    @ManyToOne
    @JoinColumn(name = "project_id")
    private Project project;

    @ManyToOne
    @JoinColumn(name = "year_id")
    private Year year;

    @ManyToOne
    @JoinColumn(name = "region_code")
    private Region region;

    @ManyToOne
    @JoinColumn(name = "district_code")
    private District district;

    @ManyToOne
    @JoinColumn(name = "settlement_code")
    private Settlement settlement;

    @Column(name = "place_of_event", length = 100)
    private String placeOfEvent;

    @Column(name = "date_of_consultation")
    private LocalDate dateOfConsultation;

    @Column(name = "male")
    private Integer male;

    @Column(name = "female")
    private Integer female;

    @Column(name = "total_participants")
    private Integer totalParticipants;

    @ManyToOne
    @JoinColumn(name = "engagement_type_id")
    private StakeholderEngagementType engagementType;

    @Column(name = "key_issues_discussed", columnDefinition = "TEXT")
    private String keyIssuesDiscussed;

    @Column(name = "follow_up_actions", columnDefinition = "TEXT")
    private String followUpActions;

    @Column(name = "picture", length = 255)
    private String picture;

    @Column(name = "date_created")
    private LocalDateTime dateCreated = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    public CommunityEngagement() {}

    public String getReferenceNumber() { return referenceNumber; }
    public void setReferenceNumber(String referenceNumber) { this.referenceNumber = referenceNumber; }
    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }
    public Year getYear() { return year; }
    public void setYear(Year year) { this.year = year; }
    public String getPlaceOfEvent() { return placeOfEvent; }
    public void setPlaceOfEvent(String placeOfEvent) { this.placeOfEvent = placeOfEvent; }
    public LocalDate getDateOfConsultation() { return dateOfConsultation; }
    public void setDateOfConsultation(LocalDate dateOfConsultation) { this.dateOfConsultation = dateOfConsultation; }
    public Integer getMale() { return male; }
    public void setMale(Integer male) { this.male = male; }
    public Integer getFemale() { return female; }
    public void setFemale(Integer female) { this.female = female; }
    public Integer getTotalParticipants() { return totalParticipants; }
    public void setTotalParticipants(Integer totalParticipants) { this.totalParticipants = totalParticipants; }
    public StakeholderEngagementType getEngagementType() { return engagementType; }
    public void setEngagementType(StakeholderEngagementType engagementType) { this.engagementType = engagementType; }
    public String getKeyIssuesDiscussed() { return keyIssuesDiscussed; }
    public void setKeyIssuesDiscussed(String keyIssuesDiscussed) { this.keyIssuesDiscussed = keyIssuesDiscussed; }
    public String getFollowUpActions() { return followUpActions; }
    public void setFollowUpActions(String followUpActions) { this.followUpActions = followUpActions; }
    public String getPicture() { return picture; }
    public void setPicture(String picture) { this.picture = picture; }
    public LocalDateTime getDateCreated() { return dateCreated; }
    public void setDateCreated(LocalDateTime dateCreated) { this.dateCreated = dateCreated; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public Region getRegion() { return region; }
    public void setRegion(Region region) { this.region = region; }
    public District getDistrict() { return district; }
    public void setDistrict(District district) { this.district = district; }
    public Settlement getSettlement() { return settlement; }
    public void setSettlement(Settlement settlement) { this.settlement = settlement; }
}

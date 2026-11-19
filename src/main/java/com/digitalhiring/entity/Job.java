package com.digitalhiring.entity;

import java.time.LocalDate;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.persistence.Column;

@Entity
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "employer_id")
    private Employer employer;

    @NotBlank(message = "Job title is required")
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    @NotBlank
    private String description;

    @NotBlank(message = "Skill requirement cannot be empty")
    private String requiredSkill;

    @NotBlank(message = "Location is required")
    private String location;

    @Enumerated(EnumType.STRING)
    @NotNull(message = "Job Type is required")
    private JobType jobType;

    @NotNull(message = "Budget is required")
    @Positive(message = "Budget must be greater than zero")
    private Double budget;

    @NotNull(message = "Start Date is required")
    private LocalDate startDate;

    @NotNull(message = "Duration is required")
    @Positive(message = "Duration must be a positive number")
    private Integer durationDays;

    @NotNull(message = "Number of workers is required")
    @Positive(message = "At least one worker is required")
    private Integer numberOfWorkers;

    @Enumerated(EnumType.STRING)
    private JobStatus status;

    public Job() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Employer getEmployer() {
        return employer;
    }

    public void setEmployer(Employer employer) {
        this.employer = employer;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getRequiredSkill() {
        return requiredSkill;
    }

    public void setRequiredSkill(String requiredSkill) {
        this.requiredSkill = requiredSkill;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public JobType getJobType() {
        return jobType;
    }

    public void setJobType(JobType jobType) {
        this.jobType = jobType;
    }

    public Double getBudget() {
        return budget;
    }

    public void setBudget(Double budget) {
        this.budget = budget;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public Integer getDurationDays() {
        return durationDays;
    }

    public void setDurationDays(Integer durationDays) {
        this.durationDays = durationDays;
    }

    public Integer getNumberOfWorkers() {
        return numberOfWorkers;
    }

    public void setNumberOfWorkers(Integer numberOfWorkers) {
        this.numberOfWorkers = numberOfWorkers;
    }

    public JobStatus getStatus() {
        return status;
    }

    public void setStatus(JobStatus status) {
        this.status = status;
    }
}
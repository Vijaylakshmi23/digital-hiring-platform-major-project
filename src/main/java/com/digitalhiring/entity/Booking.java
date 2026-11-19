package com.digitalhiring.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Column;

@Entity
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "job_id")
    private Job job;

    @ManyToOne
    @JoinColumn(name = "worker_id")
    private Worker worker;

    private LocalDateTime startDateTime;

    private LocalDateTime endDateTime;

    @Enumerated(EnumType.STRING)
    private BookingStatus status;

    @Column(nullable = false)
    private Double agreedAmount;

    private LocalDateTime completionRequestedAt;

    private LocalDateTime employerResponseDeadline;

    private String disputeReason;

    private LocalDateTime disputeRaisedAt;

    public Booking() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Job getJob() {
        return job;
    }

    public void setJob(Job job) {
        this.job = job;
    }

    public Worker getWorker() {
        return worker;
    }

    public void setWorker(Worker worker) {
        this.worker = worker;
    }

    public LocalDateTime getStartDateTime() {
        return startDateTime;
    }

    public void setStartDateTime(LocalDateTime startDateTime) {
        this.startDateTime = startDateTime;
    }

    public LocalDateTime getEndDateTime() {
        return endDateTime;
    }

    public void setEndDateTime(LocalDateTime endDateTime) {
        this.endDateTime = endDateTime;
    }

    public BookingStatus getStatus() {
        return status;
    }

    public void setStatus(BookingStatus status) {
        this.status = status;
    }

    public Double getAgreedAmount() {
        return agreedAmount;
    }

    public void setAgreedAmount(Double agreedAmount) {
        this.agreedAmount = agreedAmount;
    }

    public LocalDateTime getCompletionRequestedAt() {
        return completionRequestedAt;
    }

    public void setCompletionRequestedAt(LocalDateTime completionRequestedAt) {
        this.completionRequestedAt = completionRequestedAt;
    }

    public LocalDateTime getEmployerResponseDeadline() {
        return employerResponseDeadline;
    }

    public void setEmployerResponseDeadline(LocalDateTime employerResponseDeadline) {
        this.employerResponseDeadline = employerResponseDeadline;
    }

    public String getDisputeReason() {
        return disputeReason;
    }

    public void setDisputeReason(String disputeReason) {
        this.disputeReason = disputeReason;
    }

    public LocalDateTime getDisputeRaisedAt() {
        return disputeRaisedAt;
    }

    public void setDisputeRaisedAt(LocalDateTime disputeRaisedAt) {
        this.disputeRaisedAt = disputeRaisedAt;
    }
}
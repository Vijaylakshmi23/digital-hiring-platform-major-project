
package com.digitalhiring.dto;

import java.time.LocalDateTime;

import com.digitalhiring.entity.Booking;
import com.digitalhiring.entity.BookingStatus;

public class BookingResponse {

    private Long id;
    private Long jobId;
    private String jobTitle;
    private Long workerId;
    private String workerName;
    private Long employerId;
    private String companyName;
    private LocalDateTime startDateTime;
    private LocalDateTime endDateTime;
    private BookingStatus status;
    private Double agreedAmount;
    private String disputeReason;
    private LocalDateTime disputeRaisedAt;

    public BookingResponse() {
    }

    public static BookingResponse fromEntity(Booking booking) {
        BookingResponse response = new BookingResponse();

        response.setId(booking.getId());
        response.setJobId(booking.getJob().getId());
        response.setJobTitle(booking.getJob().getTitle());
        response.setWorkerId(booking.getWorker().getId());
        response.setWorkerName(
                booking.getWorker().getUser().getName());
        response.setEmployerId(
                booking.getJob().getEmployer().getId());
        response.setCompanyName(
                booking.getJob().getEmployer().getCompanyName());
        response.setStartDateTime(booking.getStartDateTime());
        response.setEndDateTime(booking.getEndDateTime());
        response.setStatus(booking.getStatus());
        response.setAgreedAmount(booking.getAgreedAmount());
        response.setDisputeReason(booking.getDisputeReason());
        response.setDisputeRaisedAt(booking.getDisputeRaisedAt());

        return response;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getJobId() {
        return jobId;
    }

    public void setJobId(Long jobId) {
        this.jobId = jobId;
    }

    public String getJobTitle() {
        return jobTitle;
    }

    public void setJobTitle(String jobTitle) {
        this.jobTitle = jobTitle;
    }

    public Long getWorkerId() {
        return workerId;
    }

    public void setWorkerId(Long workerId) {
        this.workerId = workerId;
    }

    public String getWorkerName() {
        return workerName;
    }

    public void setWorkerName(String workerName) {
        this.workerName = workerName;
    }

    public Long getEmployerId() {
        return employerId;
    }

    public void setEmployerId(Long employerId) {
        this.employerId = employerId;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
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

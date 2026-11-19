package com.digitalhiring.dto;

import java.time.LocalDateTime;

import com.digitalhiring.entity.ApplicationStatus;
import com.digitalhiring.entity.JobApplication;

public class JobApplicationResponse {

    private Long id;
    private Long jobId;
    private String jobTitle;
    private Long workerId;
    private String workerName;
    private String message;
    private LocalDateTime appliedAt;
    private ApplicationStatus status;

    public JobApplicationResponse(JobApplication application) {
        this.id = application.getId();
        this.jobId = application.getJob().getId();
        this.jobTitle = application.getJob().getTitle();
        this.workerId = application.getWorker().getId();
        this.workerName = application.getWorker().getUser().getName();
        this.message = application.getMessage();
        this.appliedAt = application.getAppliedAt();
        this.status = application.getStatus();
    }

    public Long getId() { return id; }
    public Long getJobId() { return jobId; }
    public String getJobTitle() { return jobTitle; }
    public Long getWorkerId() { return workerId; }
    public String getWorkerName() { return workerName; }
    public String getMessage() { return message; }
    public LocalDateTime getAppliedAt() { return appliedAt; }
    public ApplicationStatus getStatus() { return status; }
}
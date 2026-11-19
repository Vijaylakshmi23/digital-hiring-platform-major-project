
package com.digitalhiring.dto;

import com.digitalhiring.entity.DirectHireRequest;
import com.digitalhiring.entity.DirectHireStatus;

import java.time.LocalDateTime;

public class DirectHireResponseDTO {

    private Long id;
    private Long employerId;
    private String companyName;
    private Long workerId;
    private String workerName;
    private String title;
    private String description;
    private String location;
    private Double proposedWage;
    private LocalDateTime startDateTime;
    private LocalDateTime endDateTime;
    private LocalDateTime createdAt;
    private DirectHireStatus status;

    public static DirectHireResponseDTO fromEntity(
            DirectHireRequest request) {

        DirectHireResponseDTO dto = new DirectHireResponseDTO();

        dto.id = request.getId();
        dto.employerId = request.getEmployer().getId();
        dto.companyName = request.getEmployer().getCompanyName();
        dto.workerId = request.getWorker().getId();
        dto.workerName = request.getWorker().getUser().getName();
        dto.title = request.getTitle();
        dto.description = request.getDescription();
        dto.location = request.getLocation();
        dto.proposedWage = request.getProposedWage();
        dto.startDateTime = request.getStartDateTime();
        dto.endDateTime = request.getEndDateTime();
        dto.createdAt = request.getCreatedAt();
        dto.status = request.getStatus();

        return dto;
    }

    public Long getId() {
        return id;
    }

    public Long getEmployerId() {
        return employerId;
    }

    public String getCompanyName() {
        return companyName;
    }

    public Long getWorkerId() {
        return workerId;
    }

    public String getWorkerName() {
        return workerName;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public String getLocation() {
        return location;
    }

    public Double getProposedWage() {
        return proposedWage;
    }

    public LocalDateTime getStartDateTime() {
        return startDateTime;
    }

    public LocalDateTime getEndDateTime() {
        return endDateTime;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public DirectHireStatus getStatus() {
        return status;
    }
}

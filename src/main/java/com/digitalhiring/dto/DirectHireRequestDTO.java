
package com.digitalhiring.dto;

import java.time.LocalDateTime;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class DirectHireRequestDTO {

    @NotNull(message = "Worker ID is required")
    @Positive(message = "Worker ID must be positive")
    private Long workerId;

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Location is required")
    private String location;

    @NotNull(message = "Proposed wage is required")
    @Positive(message = "Proposed wage must be greater than zero")
    private Double proposedWage;

    @NotNull(message = "Start date and time are required")
    private LocalDateTime startDateTime;

    @NotNull(message = "End date and time are required")
    private LocalDateTime endDateTime;


    public Long getWorkerId() {
        return workerId;
    }

    public void setWorkerId(Long workerId) {
        this.workerId = workerId;
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

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public Double getProposedWage() {
        return proposedWage;
    }

    public void setProposedWage(Double proposedWage) {
        this.proposedWage = proposedWage;
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
}


package com.digitalhiring.dto;

import java.time.LocalDate;

import com.digitalhiring.entity.AvailabilityStatus;

import jakarta.validation.constraints.NotNull;

public class AvailabilityRequest {

    @NotNull(message = "Date is required")
    private LocalDate date;

    @NotNull(message = "Availability status is required")
    private AvailabilityStatus status;

    public AvailabilityRequest() {
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public AvailabilityStatus getStatus() {
        return status;
    }

    public void setStatus(AvailabilityStatus status) {
        this.status = status;
    }
}

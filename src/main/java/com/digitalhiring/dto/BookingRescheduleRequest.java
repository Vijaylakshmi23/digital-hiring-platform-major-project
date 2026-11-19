
package com.digitalhiring.dto;

import java.time.LocalDateTime;

import jakarta.validation.constraints.NotNull;

public class BookingRescheduleRequest {

    @NotNull(message = "Start date and time are required")
    private LocalDateTime startDateTime;

    @NotNull(message = "End date and time are required")
    private LocalDateTime endDateTime;

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

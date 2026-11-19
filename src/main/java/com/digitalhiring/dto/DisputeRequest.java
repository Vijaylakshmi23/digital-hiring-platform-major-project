
package com.digitalhiring.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class DisputeRequest {

    @NotBlank(message = "Dispute reason is required")
    @Size(max = 1000, message = "Dispute reason cannot exceed 1000 characters")
    private String reason;

    public DisputeRequest() {
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

}

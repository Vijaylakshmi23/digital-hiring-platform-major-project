
package com.digitalhiring.controller;

import com.digitalhiring.dto.DirectHireRequestDTO;
import com.digitalhiring.dto.DirectHireResponseDTO;
import com.digitalhiring.entity.DirectHireStatus;
import com.digitalhiring.service.DirectHireRequestService;
import com.digitalhiring.service.DirectHireBookingService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/direct-hire-requests")
public class DirectHireRequestController {

    private final DirectHireRequestService directHireService;
    private final DirectHireBookingService directHireBookingService;

    public DirectHireRequestController(
        DirectHireRequestService directHireService,
        DirectHireBookingService directHireBookingService) {
        this.directHireService = directHireService;
        this.directHireBookingService = directHireBookingService;
    }

    // Employer sends a direct-hiring offer.
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public DirectHireResponseDTO createOffer(
            Authentication authentication,
            @Valid @RequestBody DirectHireRequestDTO dto) {

        return directHireService.createOffer(
                authentication.getName(), dto);
    }

    // Employer sees offers sent; worker sees offers received.
    @GetMapping("/my")
    public List<DirectHireResponseDTO> getMyOffers(
            Authentication authentication) {

        return directHireService.getMyOffers(
                authentication.getName());
    }

    // Worker accepts or rejects an offer.
    @PatchMapping("/{requestId}/status")
    public DirectHireResponseDTO respondToOffer(
            Authentication authentication,
            @PathVariable Long requestId,
            @RequestBody Map<String, String> body) {

        String statusValue = body.get("status");

        if (statusValue == null) {
            throw new org.springframework.web.server.ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Status is required");
        }

        DirectHireStatus status;

        try {
            status = DirectHireStatus.valueOf(
                    statusValue.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new org.springframework.web.server.ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid status. Use ACCEPTED or REJECTED");
        }

        return directHireService.respondToOffer(
                authentication.getName(), requestId, status);
    }
    
    @PostMapping("/{requestId}/booking")
    @ResponseStatus(HttpStatus.CREATED)
    public com.digitalhiring.dto.BookingResponse createBooking(
            Authentication authentication,
            @PathVariable Long requestId) {

        return directHireBookingService.createBooking(
                authentication.getName(), requestId);
    }
}

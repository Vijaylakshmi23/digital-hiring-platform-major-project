
package com.digitalhiring.controller;

import java.net.URI;
import java.util.List;
import java.time.LocalDateTime;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import jakarta.validation.Valid;

import com.digitalhiring.dto.BookingRequest;
import com.digitalhiring.dto.BookingRescheduleRequest;
import com.digitalhiring.dto.BookingResponse;
import com.digitalhiring.dto.BookingStatusRequest;
import com.digitalhiring.entity.Booking;
import com.digitalhiring.service.BookingService;
import com.digitalhiring.dto.DisputeRequest;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping("/applications/{applicationId}")
    public ResponseEntity<BookingResponse> createBooking(
            @PathVariable Long applicationId,
            @RequestBody BookingRequest request,
            Authentication authentication) {

        Booking booking = bookingService.createBooking(
                authentication.getName(),
                applicationId,
                request.getStartDateTime(),
                request.getEndDateTime());

        BookingResponse response =
                BookingResponse.fromEntity(booking);

        return ResponseEntity
                .created(URI.create("/api/bookings/" + booking.getId()))
                .body(response);
    }

    @GetMapping("/my")
    public ResponseEntity<List<BookingResponse>> getMyBookings(
            Authentication authentication) {

        List<BookingResponse> responses = bookingService
                .getMyBookings(authentication.getName())
                .stream()
                .map(BookingResponse::fromEntity)
                .toList();

        return ResponseEntity.ok(responses);
    }

    @PatchMapping("/{bookingId}/status")
    public ResponseEntity<BookingResponse> updateBookingStatus(
            @PathVariable Long bookingId,
            @RequestBody BookingStatusRequest request,
            Authentication authentication) {

        Booking booking = bookingService.updateBookingStatus(
                authentication.getName(),
                bookingId,
                request.getStatus());

        return ResponseEntity.ok(
                BookingResponse.fromEntity(booking));
    }
    
        @PostMapping("/{bookingId}/cancel")
        public ResponseEntity<BookingResponse> cancelBooking(
                @PathVariable Long bookingId,
                Authentication authentication) {

        Booking booking = bookingService.cancelBooking(
                authentication.getName(), bookingId);

        return ResponseEntity.ok(
                BookingResponse.fromEntity(booking));
        }


        @PatchMapping("/{bookingId}/reschedule")
        public ResponseEntity<BookingResponse> rescheduleBooking(
                @PathVariable Long bookingId,
                @Valid @RequestBody BookingRescheduleRequest request,
                Authentication authentication) {

        Booking booking = bookingService.rescheduleBooking(
                authentication.getName(),
                bookingId,
                request.getStartDateTime(),
                request.getEndDateTime());

        return ResponseEntity.ok(
                BookingResponse.fromEntity(booking));
        }       

        
        @PostMapping("/{bookingId}/completion-request")
        public ResponseEntity<BookingResponse> requestCompletion(
                @PathVariable Long bookingId,
                Authentication authentication) {

        Booking booking = bookingService.requestCompletion(
                authentication.getName(), bookingId);

        return ResponseEntity.ok(BookingResponse.fromEntity(booking));
        }

        @PostMapping("/{bookingId}/approve-completion")
        public ResponseEntity<BookingResponse> approveCompletion(
                @PathVariable Long bookingId,
                Authentication authentication) {

        Booking booking = bookingService.approveCompletion(
                authentication.getName(), bookingId);

        return ResponseEntity.ok(BookingResponse.fromEntity(booking));
        }

        @PostMapping("/{bookingId}/dispute")
        public ResponseEntity<BookingResponse> raiseDispute(
                @PathVariable Long bookingId,
                @Valid @RequestBody DisputeRequest request,
                Authentication authentication) {

        Booking booking = bookingService.raiseDispute(
                authentication.getName(),
                bookingId,
                request.getReason());

        return ResponseEntity.ok(BookingResponse.fromEntity(booking));
        }

}

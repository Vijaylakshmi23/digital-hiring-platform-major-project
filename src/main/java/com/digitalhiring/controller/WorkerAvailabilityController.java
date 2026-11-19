package com.digitalhiring.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

import com.digitalhiring.dto.AvailabilityRequest;
import com.digitalhiring.dto.AvailabilityResponse;
import com.digitalhiring.entity.WorkerAvailability;
import com.digitalhiring.service.WorkerAvailabilityService;

@RestController
@RequestMapping("/api/availability")
public class WorkerAvailabilityController {

    private final WorkerAvailabilityService availabilityService;

    public WorkerAvailabilityController(
            WorkerAvailabilityService availabilityService) {
        this.availabilityService = availabilityService;
    }

    @PutMapping("/me")
    public ResponseEntity<AvailabilityResponse> setMyAvailability(
            @Valid @RequestBody AvailabilityRequest request,
            Authentication authentication) {

        WorkerAvailability result =
                availabilityService.setAvailability(
                        authentication.getName(), request);

        return ResponseEntity.ok(
                new AvailabilityResponse(
                        result.getDate(),
                        result.getStatus().name()
                )
        );
    }

    @GetMapping("/me")
    public ResponseEntity<List<AvailabilityResponse>> getMyCalendar(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate startDate,

            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate endDate,

            Authentication authentication) {

        List<AvailabilityResponse> calendar =
                availabilityService.getMyCalendar(
                        authentication.getName(), startDate, endDate);

        return ResponseEntity.ok(calendar);
    }

    @GetMapping("/worker/{workerId}")
    public ResponseEntity<List<AvailabilityResponse>> getWorkerCalendar(
            @PathVariable Long workerId,

            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate startDate,

            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate endDate,

            Authentication authentication) {

        List<AvailabilityResponse> calendar =
                availabilityService.getWorkerCalendar(
                        authentication.getName(),
                        workerId,
                        startDate,
                        endDate
                );

        return ResponseEntity.ok(calendar);
    }
}
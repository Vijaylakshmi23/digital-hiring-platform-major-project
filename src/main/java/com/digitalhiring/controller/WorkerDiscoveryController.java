
package com.digitalhiring.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.digitalhiring.dto.WorkerProfileResponse;
import com.digitalhiring.entity.Worker;
import com.digitalhiring.service.WorkerDiscoveryService;

@RestController
@RequestMapping("/api/workers")
public class WorkerDiscoveryController {

    private final WorkerDiscoveryService discoveryService;

    public WorkerDiscoveryController(
            WorkerDiscoveryService discoveryService) {
        this.discoveryService = discoveryService;
    }

    // Get all workers
    @GetMapping
    public ResponseEntity<List<WorkerProfileResponse>> getAllWorkers(
            Authentication authentication) {

        List<WorkerProfileResponse> workers =
                discoveryService.getAllWorkers(authentication.getName())
                        .stream()
                        .map(WorkerProfileResponse::new)
                        .toList();

        return ResponseEntity.ok(workers);
    }

    // Get individual worker details
    @GetMapping("/{id}")
    public ResponseEntity<WorkerProfileResponse> getWorkerById(
            @PathVariable Long id,
            Authentication authentication) {

        Worker worker = discoveryService.getWorkerById(
                authentication.getName(), id);

        return ResponseEntity.ok(
                new WorkerProfileResponse(worker));
    }

    // Search and filter workers
    @GetMapping("/search")
    public ResponseEntity<List<WorkerProfileResponse>> searchWorkers(
            @RequestParam(required = false) String profession,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Integer minExperience,
            @RequestParam(required = false) String availabilityStatus,
            Authentication authentication) {

        if (minExperience != null && minExperience < 0) {
            throw new IllegalArgumentException(
                    "Minimum experience cannot be negative");
        }

        List<WorkerProfileResponse> workers =
                discoveryService.searchWorkers(
                        authentication.getName(),
                        profession,
                        location,
                        minExperience,
                        availabilityStatus
                ).stream()
                .map(WorkerProfileResponse::new)
                .toList();

        return ResponseEntity.ok(workers);
    }
}

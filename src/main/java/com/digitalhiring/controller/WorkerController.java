
package com.digitalhiring.controller;

import com.digitalhiring.dto.WorkerProfileResponse;
import com.digitalhiring.entity.Worker;
import com.digitalhiring.service.WorkerService;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/workers")
public class WorkerController {

    private final WorkerService workerService;

    public WorkerController(WorkerService workerService) {
        this.workerService = workerService;
    }

    // Create worker profile
    @PostMapping
    public WorkerProfileResponse createWorker(
            @RequestBody Worker worker,
            Authentication authentication) {

        Worker savedWorker = workerService.createWorker(
                authentication.getName(), worker);

        return new WorkerProfileResponse(savedWorker);
    }

    // Get logged-in worker profile
    @GetMapping("/me")
    public WorkerProfileResponse getMyProfile(
            Authentication authentication) {

        Worker worker = workerService.getMyProfile(
                authentication.getName());

        return new WorkerProfileResponse(worker);
    }

    // Update worker profile
    @PutMapping("/me")
    public WorkerProfileResponse updateMyProfile(
            @RequestBody Worker worker,
            Authentication authentication) {

        Worker updatedWorker = workerService.updateWorker(
                authentication.getName(), worker);

        return new WorkerProfileResponse(updatedWorker);
    }

    // Upload or replace profile image
    @PostMapping(
            value = "/me/profile-image",
            consumes = "multipart/form-data")
    public WorkerProfileResponse uploadProfileImage(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) throws IOException {

        Worker worker = workerService.uploadProfileImage(
                authentication.getName(), file);

        return new WorkerProfileResponse(worker);
    }

    // Delete profile image
    @DeleteMapping("/me/profile-image")
    public WorkerProfileResponse deleteProfileImage(
            Authentication authentication) throws IOException {

        Worker worker = workerService.deleteProfileImage(
                authentication.getName());

        return new WorkerProfileResponse(worker);
    }
}

package com.digitalhiring.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.digitalhiring.dto.JobApplicationResponse;
import com.digitalhiring.entity.ApplicationStatus;
import com.digitalhiring.service.JobApplicationService;

@RestController
@RequestMapping("/api/applications")
public class JobApplicationController {

    private final JobApplicationService applicationService;

    public JobApplicationController(
            JobApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    public static class ApplyRequest {
        private String message;

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }

    public static class StatusRequest {
        private ApplicationStatus status;

        public ApplicationStatus getStatus() {
            return status;
        }

        public void setStatus(ApplicationStatus status) {
            this.status = status;
        }
    }

    @PostMapping("/jobs/{jobId}")
    public ResponseEntity<JobApplicationResponse> apply(
            @PathVariable Long jobId,
            @RequestBody ApplyRequest request,
            Authentication authentication) {

        JobApplicationResponse result = applicationService.apply(
                authentication.getName(),
                jobId,
                request.getMessage());

        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    @GetMapping("/my")
    public ResponseEntity<List<JobApplicationResponse>> getMyApplications(
            Authentication authentication) {

        return ResponseEntity.ok(
                applicationService.getMyApplications(
                        authentication.getName()));
    }

    @GetMapping("/employer")
    public ResponseEntity<List<JobApplicationResponse>>
            getApplicationsForEmployer(
                    Authentication authentication) {

        return ResponseEntity.ok(
                applicationService.getApplicationsForEmployer(
                        authentication.getName()));
    }

    @PatchMapping("/{applicationId}/status")
    public ResponseEntity<JobApplicationResponse> updateStatus(
            @PathVariable Long applicationId,
            @RequestBody StatusRequest request,
            Authentication authentication) {

        return ResponseEntity.ok(
                applicationService.updateStatus(
                        authentication.getName(),
                        applicationId,
                        request.getStatus()));
    }
}
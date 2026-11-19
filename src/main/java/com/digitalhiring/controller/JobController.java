package com.digitalhiring.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import com.digitalhiring.entity.Job;
import com.digitalhiring.service.JobService;

@RestController
@RequestMapping("/api/jobs")
public class JobController {

    private final JobService jobService;

    public JobController(JobService jobService) {
        this.jobService = jobService;
    }

    @PostMapping
    public ResponseEntity<Job> createJob(
            @Valid @RequestBody Job job,
            Authentication authentication) {

        Job createdJob = jobService.createJob(
                authentication.getName(), job);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(createdJob);
    }

    @GetMapping
    public ResponseEntity<List<Job>> getAllJobs() {
        return ResponseEntity.ok(jobService.getAllJobs());
    }

    @GetMapping("/my")
    public ResponseEntity<List<Job>> getMyJobs(
            Authentication authentication) {

        return ResponseEntity.ok(
                jobService.getJobsByEmployer(authentication.getName())  );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Job> getJobById(
            @PathVariable Long id) {
        return ResponseEntity.ok(jobService.getJobById(id));
    }

    @GetMapping("/search/location")
    public ResponseEntity<List<Job>> searchByLocation(
            @RequestParam String location) {
        return ResponseEntity.ok(
                jobService.searchJobsByLocation(location));
    }

    @GetMapping("/search/skill")
    public ResponseEntity<List<Job>> searchBySkill(
            @RequestParam String skill) {
        return ResponseEntity.ok(
                jobService.searchJobsBySkill(skill));
    }

}
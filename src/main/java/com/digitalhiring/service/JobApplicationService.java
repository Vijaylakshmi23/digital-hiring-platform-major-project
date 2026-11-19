package com.digitalhiring.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.digitalhiring.dto.JobApplicationResponse;
import com.digitalhiring.entity.*;
import com.digitalhiring.repository.*;

@Service
public class JobApplicationService {

    private final JobApplicationRepository applicationRepository;
    private final JobRepository jobRepository;
    private final WorkerRepository workerRepository;
    private final EmployerRepository employerRepository;
    private final UserRepository userRepository;

    public JobApplicationService(
            JobApplicationRepository applicationRepository,
            JobRepository jobRepository,
            WorkerRepository workerRepository,
            EmployerRepository employerRepository,
            UserRepository userRepository) {
        this.applicationRepository = applicationRepository;
        this.jobRepository = jobRepository;
        this.workerRepository = workerRepository;
        this.employerRepository = employerRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public JobApplicationResponse apply(
            String email, Long jobId, String message) {

        User user = getUser(email);

        if (user.getRole() != Role.WORKER) {
            throw new RuntimeException(
                    "Only worker accounts can apply for jobs");
        }

        Worker worker = workerRepository.findByUserId(user.getId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Create a worker profile first"));

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() ->
                        new RuntimeException("Job not found"));

        if (job.getStatus() != JobStatus.OPEN) {
            throw new RuntimeException(
                    "This job is not accepting applications");
        }

        if (applicationRepository.existsByJobIdAndWorkerId(
                jobId, worker.getId())) {
            throw new RuntimeException(
                    "You have already applied for this job");
        }

        JobApplication application = new JobApplication();
        application.setJob(job);
        application.setWorker(worker);
        application.setMessage(message);

        return new JobApplicationResponse(
                applicationRepository.save(application));
    }

    public List<JobApplicationResponse> getMyApplications(
            String email) {

        User user = getUser(email);

        if (user.getRole() != Role.WORKER) {
            throw new RuntimeException(
                    "Only workers can view their applications");
        }

        Worker worker = workerRepository.findByUserId(user.getId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Worker profile not found"));

        return applicationRepository.findByWorkerId(worker.getId())
                .stream()
                .map(JobApplicationResponse::new)
                .toList();
    }

    public List<JobApplicationResponse> getApplicationsForEmployer(
            String email) {

        User user = getUser(email);

        if (user.getRole() != Role.EMPLOYER) {
            throw new RuntimeException(
                    "Only employers can view applicants");
        }

        Employer employer = employerRepository
                .findByUserId(user.getId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Employer profile not found"));

        return applicationRepository
                .findByJobEmployerId(employer.getId())
                .stream()
                .map(JobApplicationResponse::new)
                .toList();
    }

    @Transactional
    public JobApplicationResponse updateStatus(
            String email, Long applicationId,
            ApplicationStatus newStatus) {

        User user = getUser(email);

        if (user.getRole() != Role.EMPLOYER) {
            throw new RuntimeException(
                    "Only employers can update application status");
        }

        if (newStatus != ApplicationStatus.ACCEPTED
                && newStatus != ApplicationStatus.REJECTED) {
            throw new RuntimeException(
                    "Status must be ACCEPTED or REJECTED");
        }

        Employer employer = employerRepository
                .findByUserId(user.getId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Employer profile not found"));

        JobApplication application = applicationRepository
                .findById(applicationId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Application not found"));

        if (!application.getJob().getEmployer().getId()
                .equals(employer.getId())) {
            throw new RuntimeException(
                    "You cannot update applications for another employer's job");
        }

        application.setStatus(newStatus);

        return new JobApplicationResponse(
                applicationRepository.save(application));
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));
    }
}
package com.digitalhiring.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.digitalhiring.entity.Employer;
import com.digitalhiring.entity.Job;
import com.digitalhiring.entity.JobStatus;
import com.digitalhiring.entity.User;
import com.digitalhiring.repository.EmployerRepository;
import com.digitalhiring.repository.JobRepository;
import com.digitalhiring.repository.UserRepository;

@Service
public class JobService {

    private final JobRepository jobRepository;
    private final EmployerRepository employerRepository;
    private final UserRepository userRepository;

    public JobService(
            JobRepository jobRepository,
            EmployerRepository employerRepository,
            UserRepository userRepository) {
        this.jobRepository = jobRepository;
        this.employerRepository = employerRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Job createJob(String email, Job job) {

        System.out.println("DEBUG - Email received: " + email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found: " + email));

        System.out.println("DEBUG - User ID: " + user.getId());

        Employer employer = employerRepository
                .findByUserId(user.getId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Create an employer profile first. User ID: "
                                        + user.getId()));

        System.out.println("DEBUG - Employer ID: " + employer.getId());

        job.setId(null);
        job.setEmployer(employer);
        job.setStatus(JobStatus.OPEN);

        return jobRepository.save(job);
    }

    public List<Job> getAllJobs() {
        return jobRepository.findByStatus(JobStatus.OPEN);
    }

    public Job getJobById(Long id) {
        return jobRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Job not found"));
    }

    public List<Job> searchJobsByLocation(String location) {
        return jobRepository
                .findByLocationContainingIgnoreCase(location);
    }

    public List<Job> searchJobsBySkill(String skill) {
        return jobRepository
                .findByRequiredSkillContainingIgnoreCase(skill);
    }

    public List<Job> getJobsByEmployer(String email) {
        return jobRepository.findByEmployer_User_Email(email);
    }
}
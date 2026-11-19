package com.digitalhiring.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.digitalhiring.entity.JobApplication;

public interface JobApplicationRepository
        extends JpaRepository<JobApplication, Long> {

    boolean existsByJobIdAndWorkerId(Long jobId, Long workerId);

    List<JobApplication> findByWorkerId(Long workerId);

    List<JobApplication> findByJobId(Long jobId);

    List<JobApplication> findByJobEmployerId(Long employerId);
}
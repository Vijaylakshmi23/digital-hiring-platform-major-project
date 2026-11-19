package com.digitalhiring.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.digitalhiring.entity.Job;
import com.digitalhiring.entity.JobStatus;

public interface JobRepository extends JpaRepository<Job, Long> {

    List<Job> findByStatus(JobStatus status);

    List<Job> findByLocationContainingIgnoreCase(String location);

    List<Job> findByRequiredSkillContainingIgnoreCase(String requiredSkill);

    List<Job> findByEmployer_User_Email(String email);
}
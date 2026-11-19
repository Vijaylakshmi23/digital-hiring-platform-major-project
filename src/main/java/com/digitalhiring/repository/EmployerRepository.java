package com.digitalhiring.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.digitalhiring.entity.Employer;

public interface EmployerRepository
        extends JpaRepository<Employer, Long> {

    Optional<Employer> findByUserId(Long userId);

    boolean existsByUserId(Long userId);
}
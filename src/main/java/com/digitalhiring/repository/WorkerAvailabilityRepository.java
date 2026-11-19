
package com.digitalhiring.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.digitalhiring.entity.WorkerAvailability;

public interface WorkerAvailabilityRepository
        extends JpaRepository<WorkerAvailability, Long> {

    List<WorkerAvailability> findByWorkerIdAndDateBetween(
            Long workerId,
            LocalDate startDate,
            LocalDate endDate
    );

    Optional<WorkerAvailability> findByWorkerIdAndDate(
            Long workerId,
            LocalDate date
    );

    void deleteByWorkerIdAndDate(
            Long workerId,
            LocalDate date
    );
}

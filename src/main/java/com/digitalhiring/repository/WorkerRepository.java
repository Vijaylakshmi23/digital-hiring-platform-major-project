
package com.digitalhiring.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.digitalhiring.entity.Worker;

public interface WorkerRepository extends JpaRepository<Worker, Long> {

    // Find a worker using the associated user ID
    Optional<Worker> findByUserId(Long userId);

    // Retrieve all worker profiles with user details
    @Query("""
        SELECT w FROM Worker w
        JOIN FETCH w.user
        """)
    List<Worker> findAllWithUser();

    // Retrieve one worker profile with user details
    @Query("""
        SELECT w FROM Worker w
        JOIN FETCH w.user
        WHERE w.id = :workerId
        """)
    Optional<Worker> findByIdWithUser(
            @Param("workerId") Long workerId);

    // Search workers using optional filters
    @Query("""
        SELECT w FROM Worker w
        JOIN FETCH w.user
        WHERE
            (:profession IS NULL OR
             LOWER(w.profession) LIKE
             LOWER(CONCAT('%', :profession, '%')))
        AND
            (:location IS NULL OR
             LOWER(w.location) LIKE
             LOWER(CONCAT('%', :location, '%')))
        AND
            (:minExperience IS NULL OR
             w.experience >= :minExperience)
        AND
            (:availabilityStatus IS NULL OR
             w.availabilityStatus = :availabilityStatus)
        """)
    List<Worker> searchWorkers(
            @Param("profession") String profession,
            @Param("location") String location,
            @Param("minExperience") Integer minExperience,
            @Param("availabilityStatus") String availabilityStatus
    );
}

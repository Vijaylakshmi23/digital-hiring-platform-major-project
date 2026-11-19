
package com.digitalhiring.service;

import java.util.List;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.digitalhiring.entity.Role;
import com.digitalhiring.entity.User;
import com.digitalhiring.entity.Worker;
import com.digitalhiring.repository.UserRepository;
import com.digitalhiring.repository.WorkerRepository;

@Service
public class WorkerDiscoveryService {

    private final WorkerRepository workerRepository;
    private final UserRepository userRepository;

    public WorkerDiscoveryService(
            WorkerRepository workerRepository,
            UserRepository userRepository) {

        this.workerRepository = workerRepository;
        this.userRepository = userRepository;
    }

    // Verify that the logged-in user is an employer
    private void validateEmployer(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        if (user.getRole() != Role.EMPLOYER) {
            throw new AccessDeniedException(
                    "Only employers can browse worker profiles");
        }
    }

    // Get all workers
    @Transactional(readOnly = true)
    public List<Worker> getAllWorkers(String email) {

        validateEmployer(email);

        return workerRepository.findAllWithUser();
    }

    // Get one worker by profile ID
    @Transactional(readOnly = true)
    public Worker getWorkerById(String email, Long workerId) {

        validateEmployer(email);

        return workerRepository.findByIdWithUser(workerId)
                .orElseThrow(() ->
                        new RuntimeException("Worker profile not found"));
    }

    // Search and filter workers
    @Transactional(readOnly = true)
    public List<Worker> searchWorkers(
            String email,
            String profession,
            String location,
            Integer minExperience,
            String availabilityStatus) {

        validateEmployer(email);

        return workerRepository.searchWorkers(
                clean(profession),
                clean(location),
                minExperience,
                clean(availabilityStatus)
        );
    }

    private String clean(String value) {
        return value == null || value.isBlank()
                ? null
                : value.trim();
    }
}

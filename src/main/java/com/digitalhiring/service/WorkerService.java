
package com.digitalhiring.service;

import com.digitalhiring.entity.Role;
import com.digitalhiring.entity.User;
import com.digitalhiring.entity.Worker;
import com.digitalhiring.repository.UserRepository;
import com.digitalhiring.repository.WorkerRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.Set;

@Service
public class WorkerService {

    private final WorkerRepository workerRepository;
    private final UserRepository userRepository;
    private final CloudinaryService cloudinaryService;

    public WorkerService(
            WorkerRepository workerRepository,
            UserRepository userRepository,
            CloudinaryService cloudinaryService) {

        this.workerRepository = workerRepository;
        this.userRepository = userRepository;
        this.cloudinaryService = cloudinaryService;
    }

    // Get and validate the logged-in worker
    private User getWorkerUser(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        if (user.getRole() != Role.WORKER) {
            throw new AccessDeniedException(
                    "Only workers can access worker profiles");
        }

        return user;
    }

    // Create worker profile
    @Transactional
    public Worker createWorker(String email, Worker worker) {

        User user = getWorkerUser(email);

        if (workerRepository.findByUserId(user.getId()).isPresent()) {
            throw new RuntimeException(
                    "Worker profile already exists for this user");
        }

        worker.setId(null);
        worker.setUser(user);

        // Do not accept image details directly from the request
        worker.setProfileImageUrl(null);
        worker.setProfileImagePublicId(null);

        if (worker.getWageType() == null) {
            worker.setWageType("DAILY");
        }

        if (worker.getAvailabilityStatus() == null) {
            worker.setAvailabilityStatus("AVAILABLE");
        }

        validateWorkerDetails(worker);

        return workerRepository.save(worker);
    }

    // Get logged-in worker profile
    @Transactional(readOnly = true)
    public Worker getMyProfile(String email) {

        User user = getWorkerUser(email);

        return workerRepository.findByUserId(user.getId())
                .orElseThrow(() ->
                        new RuntimeException("Worker profile not found"));
    }

    // Update worker professional details
    @Transactional
    public Worker updateWorker(String email, Worker updatedWorker) {

        User user = getWorkerUser(email);

        Worker existingWorker = workerRepository.findByUserId(user.getId())
                .orElseThrow(() ->
                        new RuntimeException("Worker profile not found"));

        validateWorkerDetails(updatedWorker);

        // Update professional details
        existingWorker.setProfession(updatedWorker.getProfession());
        existingWorker.setSkills(updatedWorker.getSkills());
        existingWorker.setExperience(updatedWorker.getExperience());
        existingWorker.setExpectedWage(updatedWorker.getExpectedWage());
        existingWorker.setWageType(updatedWorker.getWageType());
        existingWorker.setLocation(updatedWorker.getLocation());
        existingWorker.setDescription(updatedWorker.getDescription());
        existingWorker.setAvailabilityStatus(
                updatedWorker.getAvailabilityStatus());

        // Preserve profile image and user information
        return workerRepository.save(existingWorker);
    }

    // Validate worker profile details
    private void validateWorkerDetails(Worker worker) {

        if (worker.getExperience() != null &&
                worker.getExperience() < 0) {
            throw new IllegalArgumentException(
                    "Experience cannot be negative");
        }

        if (worker.getExpectedWage() != null &&
                worker.getExpectedWage() < 0) {
            throw new IllegalArgumentException(
                    "Expected wage cannot be negative");
        }

        if (worker.getWageType() != null &&
                !Set.of("DAILY", "HOURLY", "FIXED")
                        .contains(worker.getWageType().toUpperCase())) {
            throw new IllegalArgumentException(
                    "Wage type must be DAILY, HOURLY or FIXED");
        }

        if (worker.getAvailabilityStatus() != null &&
                !Set.of("AVAILABLE", "BUSY")
                        .contains(worker.getAvailabilityStatus().toUpperCase())) {
            throw new IllegalArgumentException(
                    "Availability must be AVAILABLE or BUSY");
        }
    }

    // Upload or replace worker profile image
    @Transactional
    public Worker uploadProfileImage(String email, MultipartFile file)
            throws IOException {

        User user = getWorkerUser(email);

        Worker worker = workerRepository.findByUserId(user.getId())
                .orElseThrow(() ->
                        new RuntimeException("Worker profile not found"));

        // Validate image
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException(
                    "Please select an image");
        }

        String contentType = file.getContentType();

        if (contentType == null ||
                !Set.of(
                        "image/jpeg",
                        "image/png",
                        "image/webp"
                ).contains(contentType)) {

            throw new IllegalArgumentException(
                    "Only JPG, PNG and WEBP images are allowed");
        }

        if (file.getSize() > 5 * 1024 * 1024) {
            throw new IllegalArgumentException(
                    "Image size must not exceed 5 MB");
        }

        // Remember previous image
        String oldPublicId = worker.getProfileImagePublicId();

        // Upload new image to Cloudinary
        Map<String, Object> result =
                cloudinaryService.uploadImage(file);

        worker.setProfileImageUrl(
                (String) result.get("imageUrl"));

        worker.setProfileImagePublicId(
                (String) result.get("publicId"));

        Worker savedWorker = workerRepository.save(worker);

        // Delete old image after successful replacement
        if (oldPublicId != null && !oldPublicId.isBlank()) {
            cloudinaryService.deleteImage(oldPublicId);
        }

        return savedWorker;
    }

    // Delete worker profile image
    @Transactional
    public Worker deleteProfileImage(String email) throws IOException {

        User user = getWorkerUser(email);

        Worker worker = workerRepository.findByUserId(user.getId())
                .orElseThrow(() ->
                        new RuntimeException("Worker profile not found"));

        String publicId = worker.getProfileImagePublicId();

        if (publicId != null && !publicId.isBlank()) {
            cloudinaryService.deleteImage(publicId);
        }

        worker.setProfileImageUrl(null);
        worker.setProfileImagePublicId(null);

        return workerRepository.save(worker);
    }
}

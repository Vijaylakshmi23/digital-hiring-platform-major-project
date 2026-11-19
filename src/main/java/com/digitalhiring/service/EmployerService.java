
package com.digitalhiring.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.multipart.MultipartFile;

import com.digitalhiring.entity.Employer;
import com.digitalhiring.entity.Role;
import com.digitalhiring.entity.User;
import com.digitalhiring.repository.EmployerRepository;
import com.digitalhiring.repository.UserRepository;

import java.io.IOException;
import java.util.Map;
import java.util.Set;

@Service
public class EmployerService {

    private final EmployerRepository employerRepository;
    private final UserRepository userRepository;
    private final CloudinaryService cloudinaryService;

    public EmployerService(
            EmployerRepository employerRepository,
            UserRepository userRepository,
            CloudinaryService cloudinaryService) {

        this.employerRepository = employerRepository;
        this.userRepository = userRepository;
        this.cloudinaryService = cloudinaryService;
    }

    private User getEmployerUser(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        if (user.getRole() != Role.EMPLOYER) {
            throw new AccessDeniedException(
                    "Only employers can access employer profiles");
        }

        return user;
    }

    @Transactional(readOnly = true)
    public Employer getMyProfile(String email) {

        User user = getEmployerUser(email);

        return employerRepository.findByUserId(user.getId())
                .orElseThrow(() ->
                        new RuntimeException("Employer profile not found"));
    }

    @Transactional
    public Employer updateMyProfile(
            String email,
            Employer updatedEmployer) {

        User user = getEmployerUser(email);

        Employer existingEmployer =
                employerRepository.findByUserId(user.getId())
                        .orElseGet(() -> {
                            Employer newEmployer = new Employer();
                            newEmployer.setUser(user);
                            return newEmployer;
                        });

        existingEmployer.setCompanyName(
                updatedEmployer.getCompanyName());

        existingEmployer.setEmployerType(
                updatedEmployer.getEmployerType());

        existingEmployer.setLocation(
                updatedEmployer.getLocation());

        existingEmployer.setDescription(
                updatedEmployer.getDescription());

        // Preserve existing profile image
        return employerRepository.save(existingEmployer);
    }

    // Upload or replace employer profile image
    @Transactional
    public Employer uploadProfileImage(
            String email,
            MultipartFile file) throws IOException {

        User user = getEmployerUser(email);

        Employer employer = employerRepository.findByUserId(user.getId())
                .orElseThrow(() ->
                        new RuntimeException("Employer profile not found"));

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

        String oldPublicId = employer.getProfileImagePublicId();

        Map<String, Object> result =
                cloudinaryService.uploadImage(file);

        employer.setProfileImageUrl(
                (String) result.get("imageUrl"));

        employer.setProfileImagePublicId(
                (String) result.get("publicId"));

        Employer savedEmployer = employerRepository.save(employer);

        // Delete previous image after successful replacement
        if (oldPublicId != null && !oldPublicId.isBlank()) {
            cloudinaryService.deleteImage(oldPublicId);
        }

        return savedEmployer;
    }

    // Delete employer profile image
    @Transactional
    public Employer deleteProfileImage(String email)
            throws IOException {

        User user = getEmployerUser(email);

        Employer employer = employerRepository.findByUserId(user.getId())
                .orElseThrow(() ->
                        new RuntimeException("Employer profile not found"));

        String publicId = employer.getProfileImagePublicId();

        if (publicId != null && !publicId.isBlank()) {
            cloudinaryService.deleteImage(publicId);
        }

        employer.setProfileImageUrl(null);
        employer.setProfileImagePublicId(null);

        return employerRepository.save(employer);
    }
}

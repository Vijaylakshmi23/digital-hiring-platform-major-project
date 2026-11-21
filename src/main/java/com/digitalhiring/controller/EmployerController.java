
package com.digitalhiring.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

import com.digitalhiring.entity.Employer;
import com.digitalhiring.entity.EmployerType;
import com.digitalhiring.service.EmployerService;

@RestController
@RequestMapping("/api/employers")
public class EmployerController {

    private final EmployerService employerService;

    public EmployerController(EmployerService employerService) {
        this.employerService = employerService;
    }

    // Request DTO
    public static class EmployerRequest {

        private String companyName;
        private EmployerType employerType;
        private String location;
        private String description;

        public String getCompanyName() {
            return companyName;
        }

        public void setCompanyName(String companyName) {
            this.companyName = companyName;
        }

        public EmployerType getEmployerType() {
            return employerType;
        }

        public void setEmployerType(EmployerType employerType) {
            this.employerType = employerType;
        }

        public String getLocation() {
            return location;
        }

        public void setLocation(String location) {
            this.location = location;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }
    }

    // Safe response DTO
    public static class EmployerProfileResponse {

        private Long id;
        private String employerName;
        private String email;
        private String mobileNumber;
        private String companyName;
        private EmployerType employerType;
        private String location;
        private String description;
        private String profileImageUrl;

        public EmployerProfileResponse(Employer employer) {
            this.id = employer.getId();
            this.employerName = employer.getUser().getName();
            this.email = employer.getUser().getEmail();
            this.mobileNumber = employer.getUser().getMobileNumber();
            this.companyName = employer.getCompanyName();
            this.employerType = employer.getEmployerType();
            this.location = employer.getLocation();
            this.description = employer.getDescription();
            this.profileImageUrl = employer.getProfileImageUrl();
        }

        public Long getId() {
            return id;
        }

        public String getEmployerName() {
            return employerName;
        }

        public String getEmail() {
            return email;
        }

        public String getMobileNumber() {
            return mobileNumber;
        }

        public String getCompanyName() {
            return companyName;
        }

        public EmployerType getEmployerType() {
            return employerType;
        }

        public String getLocation() {
            return location;
        }

        public String getDescription() {
            return description;
        }

        public String getProfileImageUrl() {
            return profileImageUrl;
        }
    }

    // GET: View own employer profile
    @GetMapping("/me")
    public ResponseEntity<EmployerProfileResponse> getMyProfile(
            Authentication authentication) {

        Employer employer = employerService.getMyProfile(
                authentication.getName());

        return ResponseEntity.ok(
                new EmployerProfileResponse(employer));
    }

    // PUT: Update own employer profile
    @PutMapping("/me")
    public ResponseEntity<EmployerProfileResponse> updateMyProfile(
            @RequestBody EmployerRequest request,
            Authentication authentication) {

        Employer updatedEmployer = new Employer();

        updatedEmployer.setCompanyName(request.getCompanyName());
        updatedEmployer.setEmployerType(request.getEmployerType());
        updatedEmployer.setLocation(request.getLocation());
        updatedEmployer.setDescription(request.getDescription());

        Employer savedEmployer = employerService.updateMyProfile(
                authentication.getName(),
                updatedEmployer);

        return ResponseEntity.ok(
                new EmployerProfileResponse(savedEmployer));
    }

    // POST: Upload or replace employer profile image
    @PostMapping(
            value = "/me/profile-image",
            consumes = "multipart/form-data")
    public ResponseEntity<EmployerProfileResponse> uploadProfileImage(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) throws IOException {

        Employer employer = employerService.uploadProfileImage(
                authentication.getName(), file);

        return ResponseEntity.ok(
                new EmployerProfileResponse(employer));
    }

    // DELETE: Remove employer profile image
    @DeleteMapping("/me/profile-image")
    public ResponseEntity<EmployerProfileResponse> deleteProfileImage(
            Authentication authentication) throws IOException {

        Employer employer = employerService.deleteProfileImage(
                authentication.getName());

        return ResponseEntity.ok(
                new EmployerProfileResponse(employer));
    }
}

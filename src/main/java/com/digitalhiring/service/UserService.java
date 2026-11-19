package com.digitalhiring.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.digitalhiring.entity.User;
import com.digitalhiring.entity.Worker;
import com.digitalhiring.entity.Employer;
import com.digitalhiring.entity.Role;

import com.digitalhiring.repository.UserRepository;
import com.digitalhiring.repository.WorkerRepository;
import com.digitalhiring.repository.EmployerRepository;

import com.digitalhiring.exception.DuplicateResourceException;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final WorkerRepository workerRepository;
    private final EmployerRepository employerRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(
            UserRepository userRepository,
            WorkerRepository workerRepository,
            EmployerRepository employerRepository,
            PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.workerRepository = workerRepository;
        this.employerRepository = employerRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public User registerUser(User user) {

        if (user.getName() == null || user.getName().isBlank()) {
            throw new IllegalArgumentException("Name is required");
        }

        if (user.getEmail() == null || user.getEmail().isBlank()) {
            throw new IllegalArgumentException("Email is required");
        }

        // Normalize email
        String email = user.getEmail().trim().toLowerCase();
        user.setEmail(email);

        if (user.getMobileNumber() == null
                || !user.getMobileNumber().trim().matches("^[0-9]{10}$")) {
            throw new IllegalArgumentException(
                    "Mobile number must contain exactly 10 digits");
        }

        // Normalize mobile number
        String mobileNumber = user.getMobileNumber().trim();
        user.setMobileNumber(mobileNumber);

        if (user.getPassword() == null
                || user.getPassword().length() < 8) {
            throw new IllegalArgumentException(
                    "Password must contain at least 8 characters");
        }

        if (user.getRole() != Role.WORKER
                && user.getRole() != Role.EMPLOYER) {
            throw new IllegalArgumentException(
                    "Only WORKER and EMPLOYER roles can register publicly");
        }

        // Check duplicate email
        if (userRepository.existsByEmail(email)) {
            throw new DuplicateResourceException(
                    "Email already registered");
        }

        // Check duplicate mobile
        if (userRepository.existsByMobileNumber(mobileNumber)) {
            throw new DuplicateResourceException(
                    "Mobile number already registered");
        }

        // Encrypt password
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        // Save user account
        User savedUser = userRepository.save(user);

        // Automatically create role-specific profile
        if (savedUser.getRole() == Role.WORKER) {

            Worker worker = new Worker();
            worker.setUser(savedUser);

            workerRepository.save(worker);

        } else if (savedUser.getRole() == Role.EMPLOYER) {

            Employer employer = new Employer();
            employer.setUser(savedUser);

            employerRepository.save(employer);
        }

        return savedUser;
    }

    public boolean emailExists(String email) {
        return userRepository.existsByEmail(email);
    }

    public User loginUser(String email, String password) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        return user;
    }
}

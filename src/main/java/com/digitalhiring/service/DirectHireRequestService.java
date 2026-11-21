
package com.digitalhiring.service;

import com.digitalhiring.dto.DirectHireRequestDTO;
import com.digitalhiring.dto.DirectHireResponseDTO;
import com.digitalhiring.entity.DirectHireRequest;
import com.digitalhiring.entity.DirectHireStatus;
import com.digitalhiring.entity.Employer;
import com.digitalhiring.entity.Role;
import com.digitalhiring.entity.User;
import com.digitalhiring.entity.Worker;
import com.digitalhiring.repository.DirectHireRequestRepository;
import com.digitalhiring.repository.EmployerRepository;
import com.digitalhiring.repository.UserRepository;
import com.digitalhiring.repository.WorkerRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

@Service
public class DirectHireRequestService {

    private final DirectHireRequestRepository directHireRepository;
    private final EmployerRepository employerRepository;
    private final WorkerRepository workerRepository;
    private final UserRepository userRepository;

    public DirectHireRequestService(
            DirectHireRequestRepository directHireRepository,
            EmployerRepository employerRepository,
            WorkerRepository workerRepository,
            UserRepository userRepository) {
        this.directHireRepository = directHireRepository;
        this.employerRepository = employerRepository;
        this.workerRepository = workerRepository;
        this.userRepository = userRepository;
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "User not found"));
    }

    @Transactional
    public DirectHireResponseDTO createOffer(
            String email, DirectHireRequestDTO dto) {

        User user = getUser(email);

        if (user.getRole() != Role.EMPLOYER) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only employers can send direct-hiring offers");
        }

        if (dto.getWorkerId() == null
                || dto.getTitle() == null
                || dto.getTitle().isBlank()
                || dto.getLocation() == null
                || dto.getLocation().isBlank()
                || dto.getProposedWage() == null
                || dto.getProposedWage() <= 0
                || dto.getStartDateTime() == null
                || dto.getEndDateTime() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Worker, title, location, positive wage, start time and end time are required");
        }

        LocalDateTime nowInIndia = LocalDateTime.now(ZoneId.of("Asia/Kolkata"));
        if (!dto.getStartDateTime().isAfter(nowInIndia)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Booking start time must be in the future");
        }

        if (!dto.getEndDateTime().isAfter(dto.getStartDateTime())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "End time must be after start time");
        }

        Employer employer = employerRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Create an employer profile first"));

        Worker worker = workerRepository.findById(dto.getWorkerId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Worker not found"));

        if (worker.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "You cannot send a direct offer to yourself");
        }

        boolean pendingOfferExists =
                directHireRepository
                        .existsByEmployer_IdAndWorker_IdAndStatus(
                                employer.getId(),
                                worker.getId(),
                                DirectHireStatus.PENDING);

        if (pendingOfferExists) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "A pending direct offer already exists for this worker");
        }

        DirectHireRequest request = new DirectHireRequest();
        request.setEmployer(employer);
        request.setWorker(worker);
        request.setTitle(dto.getTitle().trim());
        request.setDescription(dto.getDescription());
        request.setLocation(dto.getLocation().trim());
        request.setProposedWage(dto.getProposedWage());
        request.setStartDateTime(dto.getStartDateTime());
        request.setEndDateTime(dto.getEndDateTime());

        // Status and creation time are initialized by @PrePersist.
        DirectHireRequest saved = directHireRepository.save(request);

        return DirectHireResponseDTO.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<DirectHireResponseDTO> getMyOffers(String email) {
        User user = getUser(email);

        if (user.getRole() == Role.EMPLOYER) {
            Employer employer = employerRepository
                    .findByUserId(user.getId())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "Create an employer profile first"));

            return directHireRepository
                    .findByEmployer_Id(employer.getId())
                    .stream()
                    .map(DirectHireResponseDTO::fromEntity)
                    .toList();
        }

        if (user.getRole() == Role.WORKER) {
            Worker worker = workerRepository
                    .findByUserId(user.getId())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "Create a worker profile first"));

            return directHireRepository
                    .findByWorker_Id(worker.getId())
                    .stream()
                    .map(DirectHireResponseDTO::fromEntity)
                    .toList();
        }

        throw new ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "This account cannot access direct-hiring offers");
    }

    @Transactional
    public DirectHireResponseDTO respondToOffer(
            String email, Long requestId, DirectHireStatus newStatus) {

        User user = getUser(email);

        if (user.getRole() != Role.WORKER) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only workers can respond to direct-hiring offers");
        }

        if (newStatus != DirectHireStatus.ACCEPTED
                && newStatus != DirectHireStatus.REJECTED) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Workers can only ACCEPT or REJECT an offer");
        }

        Worker worker = workerRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Create a worker profile first"));

        DirectHireRequest request = directHireRepository.findById(requestId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Direct-hiring offer not found"));

        if (!request.getWorker().getId().equals(worker.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You can only respond to offers sent to you");
        }

        if (request.getStatus() != DirectHireStatus.PENDING) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Only pending offers can be accepted or rejected");
        }

        request.setStatus(newStatus);

        DirectHireRequest saved = directHireRepository.save(request);

        return DirectHireResponseDTO.fromEntity(saved);
    }
}

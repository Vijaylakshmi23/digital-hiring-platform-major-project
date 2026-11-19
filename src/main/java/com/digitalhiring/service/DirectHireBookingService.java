
package com.digitalhiring.service;

import com.digitalhiring.dto.BookingResponse;
import com.digitalhiring.entity.*;
import com.digitalhiring.repository.*;
import com.digitalhiring.exception.BookingConflictException;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class DirectHireBookingService {

    private final DirectHireRequestRepository directHireRepository;
    private final EmployerRepository employerRepository;
    private final JobRepository jobRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final WorkerAvailabilityRepository availabilityRepository;

    public DirectHireBookingService(
            DirectHireRequestRepository directHireRepository,
            EmployerRepository employerRepository,
            JobRepository jobRepository,
            BookingRepository bookingRepository,
            UserRepository userRepository,
            WorkerAvailabilityRepository availabilityRepository) {

        this.directHireRepository = directHireRepository;
        this.employerRepository = employerRepository;
        this.jobRepository = jobRepository;
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.availabilityRepository = availabilityRepository;
    }

    @Transactional
    public BookingResponse createBooking(
            String email, Long directHireRequestId) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "User not found"));

        if (user.getRole() != Role.EMPLOYER) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only employers can create direct-hire bookings");
        }

        Employer employer = employerRepository
                .findByUserId(user.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Create an employer profile first"));

        DirectHireRequest offer = directHireRepository
                .findById(directHireRequestId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Direct-hiring offer not found"));

        if (!offer.getEmployer().getId().equals(employer.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You can only book offers you sent");
        }

        if (offer.getStatus() != DirectHireStatus.ACCEPTED) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "The worker must accept the offer before booking");
        }

        LocalDateTime start = offer.getStartDateTime();
        LocalDateTime end = offer.getEndDateTime();

        // Validate the booking schedule on the backend.
        if (start == null || end == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Booking start and end times are required");
        }

        if (!start.isAfter(LocalDateTime.now())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Booking must start in the future");
        }

        if (!end.isAfter(start)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Booking end time must be after start time");
        }

        Worker worker = offer.getWorker();

        // Check whether the worker has marked any booking date unavailable.
        LocalDate firstDate = start.toLocalDate();
        LocalDate lastDate = end.toLocalDate();

        // If the booking ends exactly at midnight, that final date
        // is not part of the working period.
        if (end.toLocalTime().equals(java.time.LocalTime.MIDNIGHT)
                && lastDate.isAfter(firstDate)) {
            lastDate = lastDate.minusDays(1);
        }

        List<WorkerAvailability> availabilityRecords =
                availabilityRepository.findByWorkerIdAndDateBetween(
                        worker.getId(), firstDate, lastDate);

        boolean unavailable = availabilityRecords.stream()
                .anyMatch(record ->
                        record.getStatus() == AvailabilityStatus.UNAVAILABLE);

        if (unavailable) {
            throw new BookingConflictException(
                    "The worker has marked one or more selected dates unavailable");
        }

        // Check for overlapping active bookings.
        List<BookingStatus> activeStatuses = List.of(
                BookingStatus.REQUESTED,
                BookingStatus.ACCEPTED,
                BookingStatus.IN_PROGRESS
        );

        boolean hasConflict = bookingRepository
                .existsByWorkerIdAndStatusInAndStartDateTimeLessThanAndEndDateTimeGreaterThan(
                        worker.getId(),
                        activeStatuses,
                        end,
                        start
                );

        if (hasConflict) {
            throw new BookingConflictException(
                    "This worker already has a booking during the selected time");
        }

        // Create a private job record for the Booking relationship.
        // CLOSED jobs do not appear in public job searches.
        Job job = new Job();
        job.setEmployer(employer);
        job.setTitle(offer.getTitle());
        job.setDescription(offer.getDescription());
        job.setRequiredSkill(offer.getTitle());
        job.setLocation(offer.getLocation());
        job.setJobType(JobType.ONE_TIME);
        job.setBudget(offer.getProposedWage());
        job.setStartDate(start.toLocalDate());

        long days = ChronoUnit.DAYS.between(
                start.toLocalDate(),
                end.toLocalDate());

        job.setDurationDays((int) Math.max(1, days));
        job.setNumberOfWorkers(1);
        job.setStatus(JobStatus.CLOSED);

        Job savedJob = jobRepository.save(job);

        // Worker has already accepted the offer and employer is
        // confirming it by creating the booking.
        Booking booking = new Booking();
        booking.setJob(savedJob);
        booking.setWorker(worker);
        booking.setAgreedAmount(offer.getProposedWage());
        booking.setStartDateTime(start);
        booking.setEndDateTime(end);
        booking.setStatus(BookingStatus.ACCEPTED);

        Booking savedBooking = bookingRepository.save(booking);

        // Prevent this offer from being converted into another booking.
        offer.setStatus(DirectHireStatus.BOOKED);
        directHireRepository.save(offer);

        return BookingResponse.fromEntity(savedBooking);
    }
}

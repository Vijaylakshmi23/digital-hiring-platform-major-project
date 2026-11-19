package com.digitalhiring.service;

import java.time.LocalDateTime;
import java.util.List;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.digitalhiring.entity.*;
import com.digitalhiring.repository.*;
import org.springframework.security.access.AccessDeniedException;
import com.digitalhiring.exception.BookingConflictException;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final JobApplicationRepository applicationRepository;
    private final EmployerRepository employerRepository;
    private final UserRepository userRepository;
    private final WorkerRepository workerRepository;
    private final WorkerAvailabilityRepository availabilityRepository;
    private final PaymentRepository paymentRepository;

    public BookingService(
        BookingRepository bookingRepository,
        JobApplicationRepository applicationRepository,
        EmployerRepository employerRepository,
        UserRepository userRepository,
        WorkerRepository workerRepository,
        WorkerAvailabilityRepository availabilityRepository,
        PaymentRepository paymentRepository) {

        this.bookingRepository = bookingRepository;
        this.applicationRepository = applicationRepository;
        this.employerRepository = employerRepository;
        this.userRepository = userRepository;
        this.workerRepository = workerRepository;
        this.availabilityRepository = availabilityRepository;
        this.paymentRepository = paymentRepository;
    }

    @Transactional
    public Booking createBooking(
            String email,
            Long applicationId,
            LocalDateTime startDateTime,
            LocalDateTime endDateTime) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        if (user.getRole() != Role.EMPLOYER) {
            throw new AccessDeniedException(
                    "Only employers can create bookings");
        }

        Employer employer = employerRepository
                .findByUserId(user.getId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Employer profile not found"));

        JobApplication application = applicationRepository
                .findById(applicationId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Application not found"));

        if (!application.getJob().getEmployer().getId()
                .equals(employer.getId())) {
            throw new AccessDeniedException(
                    "You cannot book another employer's applicant");
        }

        if (application.getStatus() != ApplicationStatus.ACCEPTED) {
            throw new RuntimeException(
                    "The application must be accepted before booking");
        }

        if (startDateTime == null || endDateTime == null) {
                throw new RuntimeException(
                        "Start date and time and end date and time are required");
                }

                LocalDateTime now = LocalDateTime.now(
                        ZoneId.of("Asia/Kolkata"));

                if (startDateTime.isBefore(now)) {
                throw new RuntimeException(
                        "Booking start date and time cannot be in the past");
                }

        if (startDateTime != null && endDateTime != null
                && !endDateTime.isAfter(startDateTime)) {
            throw new RuntimeException(
                    "End time must be after start time");
        }

        Long jobId = application.getJob().getId();
        Long workerId = application.getWorker().getId();

        if (startDateTime != null && endDateTime != null) {
                checkWorkerAvailability(workerId, null, startDateTime, endDateTime);
        }

        List<BookingStatus> activeBookingStatuses = List.of(
                BookingStatus.REQUESTED,
                BookingStatus.ACCEPTED,
                BookingStatus.IN_PROGRESS,
                BookingStatus.COMPLETION_REQUESTED,
                BookingStatus.DISPUTED
        );

        if (bookingRepository.existsByJobIdAndWorkerIdAndStatusIn(
                jobId, workerId, activeBookingStatuses)) {
        throw new RuntimeException(
                "An active booking already exists for this worker and job");
        }

        Booking booking = new Booking();
        booking.setJob(application.getJob());
        booking.setWorker(application.getWorker());
        booking.setAgreedAmount(application.getJob().getBudget());
        booking.setStartDateTime(startDateTime);
        booking.setEndDateTime(endDateTime);
        booking.setStatus(BookingStatus.REQUESTED);

        return bookingRepository.save(booking);
    }

    @Transactional(readOnly = true)
    public List<Booking> getMyBookings(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        if (user.getRole() == Role.WORKER) {

            Worker worker = workerRepository
                    .findByUserId(user.getId())
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Worker profile not found"));

            return bookingRepository.findByWorkerId(worker.getId());
        }

        if (user.getRole() == Role.EMPLOYER) {

            Employer employer = employerRepository
                    .findByUserId(user.getId())
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Employer profile not found"));

            return bookingRepository
                    .findByJobEmployerId(employer.getId());
        }

        throw new RuntimeException(
                "Only workers and employers can view bookings");
    }

    @Transactional
    public Booking updateBookingStatus(
            String email,
            Long bookingId,
            BookingStatus newStatus) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        if (newStatus == null) {
            throw new RuntimeException(
                    "Booking status is required");
        }

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() ->
                        new RuntimeException("Booking not found"));

        BookingStatus currentStatus = booking.getStatus();

        // Employer accepts or rejects a requested booking.
        if (currentStatus == BookingStatus.REQUESTED) {

            if (user.getRole() != Role.EMPLOYER) {
                throw new AccessDeniedException(
                        "Only the employer can accept or reject a booking");
            }

            Employer employer = employerRepository
                    .findByUserId(user.getId())
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Employer profile not found"));

            if (!booking.getJob().getEmployer().getId()
                    .equals(employer.getId())) {
                throw new AccessDeniedException(
                        "You cannot update another employer's booking");
            }

            if (newStatus != BookingStatus.ACCEPTED
                    && newStatus != BookingStatus.REJECTED) {
                throw new RuntimeException(
                        "For requested bookings, allowed statuses are "
                                + "ACCEPTED and REJECTED");
            }

            booking.setStatus(newStatus);
            return bookingRepository.save(booking);
        }

        // Assigned worker starts an accepted booking.
        if (currentStatus == BookingStatus.ACCEPTED) {

            if (user.getRole() != Role.WORKER) {
                throw new AccessDeniedException(
                        "Only the assigned worker can start this booking");
            }

            Worker worker = workerRepository
                    .findByUserId(user.getId())
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Worker profile not found"));

            if (!booking.getWorker().getId()
                    .equals(worker.getId())) {
                throw new AccessDeniedException(
                        "You cannot update another worker's booking");
            }

            LocalDateTime now = LocalDateTime.now(ZoneId.of("Asia/Kolkata"));

            if (now.isBefore(booking.getStartDateTime())) {
                throw new BookingConflictException(
                        "You cannot start this job before its scheduled date and time");
            }

            boolean advancePaid = paymentRepository.existsByBookingIdAndPaymentTypeAndStatus(
                        bookingId,
                        PaymentType.ADVANCE,
                        PaymentStatus.PAID
                );

            if (!advancePaid) {
                    throw new BookingConflictException(
                            "You must receive successful advance payment before starting this job");
            }

            // Completion must follow the completion request workflow.
            if (currentStatus == BookingStatus.IN_PROGRESS) {
                throw new AccessDeniedException(
                "Use the completion request workflow to complete this booking");
            }

            booking.setStatus(BookingStatus.IN_PROGRESS);
            return bookingRepository.save(booking);
        }

        // Employer completes a booking that is in progress.
        if (currentStatus == BookingStatus.IN_PROGRESS) {

            if (user.getRole() != Role.EMPLOYER) {
                throw new AccessDeniedException(
                        "Only the employer can complete this booking");
            }

            Employer employer = employerRepository
                    .findByUserId(user.getId())
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Employer profile not found"));

            if (!booking.getJob().getEmployer().getId()
                    .equals(employer.getId())) {
                throw new AccessDeniedException(
                        "You cannot update another employer's booking");
            }

            if (newStatus != BookingStatus.COMPLETED) {
                throw new AccessDeniedException(
                        "An in-progress booking can only move to COMPLETED");
            }

            booking.setStatus(BookingStatus.COMPLETED);
            return bookingRepository.save(booking);
        }

        throw new AccessDeniedException(
                "Booking cannot be updated from its current status: "
                        + currentStatus);
        }
    
        @Transactional
        public Booking cancelBooking(String email, Long bookingId) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() ->
                        new RuntimeException("Booking not found"));

        // Verify that this user is involved in the booking.
        if (user.getRole() == Role.EMPLOYER) {

                Employer employer = employerRepository
                        .findByUserId(user.getId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Employer profile not found"));

                if (!booking.getJob().getEmployer().getId()
                        .equals(employer.getId())) {
                throw new AccessDeniedException(
                        "You cannot cancel another employer's booking");
                }

        } else if (user.getRole() == Role.WORKER) {

                Worker worker = workerRepository
                        .findByUserId(user.getId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Worker profile not found"));

                if (!booking.getWorker().getId().equals(worker.getId())) {
                throw new AccessDeniedException(
                        "You cannot cancel another worker's booking");
                }

        } else {
                throw new RuntimeException(
                        "Only employers and workers can cancel bookings");
        }

        BookingStatus currentStatus = booking.getStatus();

        if (currentStatus != BookingStatus.REQUESTED
        && currentStatus != BookingStatus.ACCEPTED) {
                throw new BookingConflictException(
                "Only requested or accepted bookings can be cancelled");
        }
        booking.setStatus(BookingStatus.CANCELLED);

        return bookingRepository.save(booking);
        }


        @Transactional
        public Booking rescheduleBooking(
                String email,
                Long bookingId,
                LocalDateTime startDateTime,
                LocalDateTime endDateTime) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() ->
                        new RuntimeException("Booking not found"));

        // Verify booking ownership or assignment.
        if (user.getRole() == Role.EMPLOYER) {

                Employer employer = employerRepository
                        .findByUserId(user.getId())
                        .orElseThrow(() ->
                                new RuntimeException("Employer profile not found"));

                if (!booking.getJob().getEmployer().getId()
                        .equals(employer.getId())) {
                throw new AccessDeniedException(
                        "You cannot reschedule another employer's booking");
                }

        } else if (user.getRole() == Role.WORKER) {

                Worker worker = workerRepository
                        .findByUserId(user.getId())
                        .orElseThrow(() ->
                                new RuntimeException("Worker profile not found"));

                if (!booking.getWorker().getId().equals(worker.getId())) {
                throw new AccessDeniedException(
                        "You cannot reschedule another worker's booking");
                }

        } else {
                throw new RuntimeException(
                        "Only employers and workers can reschedule bookings");
        }

        BookingStatus currentStatus = booking.getStatus();

        if (currentStatus != BookingStatus.REQUESTED
        && currentStatus != BookingStatus.ACCEPTED) {
                throw new BookingConflictException(
                        "Only requested or accepted bookings can be rescheduled");
        }

        if (startDateTime == null || endDateTime == null) {
                throw new RuntimeException(
                        "Start time and end time are required");
        }

        LocalDateTime now = LocalDateTime.now(
                ZoneId.of("Asia/Kolkata"));

        if (startDateTime.isBefore(now)) {
        throw new RuntimeException(
                "Rescheduled start date and time cannot be in the past");
        }

        if (!endDateTime.isAfter(startDateTime)) {
                throw new RuntimeException(
                        "End time must be after start time");
        }

        // Check conflicts, excluding the current booking.
        checkWorkerAvailability(
                booking.getWorker().getId(),
                bookingId,
                startDateTime,
                endDateTime
        );

        booking.setStartDateTime(startDateTime);
        booking.setEndDateTime(endDateTime);

        return bookingRepository.save(booking);
        } 

        private void checkWorkerAvailability(
                Long workerId,
                Long bookingId,
                LocalDateTime requestedStart,
                LocalDateTime requestedEnd) {

        List<BookingStatus> activeStatuses = List.of(
                BookingStatus.REQUESTED,
                BookingStatus.ACCEPTED,
                BookingStatus.IN_PROGRESS
        );

        boolean hasConflict;

        if (bookingId == null) {

                hasConflict = bookingRepository
                        .existsByWorkerIdAndStatusInAndStartDateTimeLessThanAndEndDateTimeGreaterThan(
                                workerId,
                                activeStatuses,
                                requestedEnd,
                                requestedStart
                        );

        } else {

                hasConflict = bookingRepository
                        .existsByWorkerIdAndIdNotAndStatusInAndStartDateTimeLessThanAndEndDateTimeGreaterThan(
                                workerId,
                                bookingId,
                                activeStatuses,
                                requestedEnd,
                                requestedStart
                        );
        }

        if (hasConflict) {
                throw new BookingConflictException(
                        "This worker already has a booking during the selected time");
        }

        // Check manually marked unavailable dates
        LocalDate currentDate = requestedStart.toLocalDate();

        LocalDate lastDate = requestedEnd.toLocalTime().equals(LocalTime.MIDNIGHT)
                ? requestedEnd.toLocalDate().minusDays(1)
                : requestedEnd.toLocalDate();

        while (!currentDate.isAfter(lastDate)) {

        boolean isUnavailable = availabilityRepository
                .findByWorkerIdAndDate(workerId, currentDate)
                .map(availability ->
                        availability.getStatus() == AvailabilityStatus.UNAVAILABLE)
                .orElse(false);

        if (isUnavailable) {
                throw new BookingConflictException(
                        "Worker is unavailable on " + currentDate);
        }

        currentDate = currentDate.plusDays(1);
        }
    }

    
        @Transactional
        public Booking requestCompletion(String email, Long bookingId) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        if (user.getRole() != Role.WORKER) {
                throw new AccessDeniedException(
                        "Only workers can request completion");
        }

        Worker worker = workerRepository.findByUserId(user.getId())
                .orElseThrow(() ->
                        new RuntimeException("Worker profile not found"));

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() ->
                        new RuntimeException("Booking not found"));

        if (!booking.getWorker().getId().equals(worker.getId())) {
                throw new AccessDeniedException(
                        "You cannot request completion for another worker's booking");
        }

        if (booking.getStatus() != BookingStatus.IN_PROGRESS) {
                throw new BookingConflictException(
                        "Only in-progress bookings can request completion");
        }

        LocalDateTime now = LocalDateTime.now();

        booking.setCompletionRequestedAt(now);
        booking.setEmployerResponseDeadline(now.plusHours(48));
        booking.setStatus(BookingStatus.COMPLETION_REQUESTED);

        return bookingRepository.save(booking);
        }

        
        @Transactional
        public Booking approveCompletion(String email, Long bookingId) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        if (user.getRole() != Role.EMPLOYER) {
                throw new AccessDeniedException(
                        "Only employers can approve completion");
        }

        Employer employer = employerRepository.findByUserId(user.getId())
                .orElseThrow(() ->
                        new RuntimeException("Employer profile not found"));

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() ->
                        new RuntimeException("Booking not found"));

        if (!booking.getJob().getEmployer().getId()
                .equals(employer.getId())) {
                throw new AccessDeniedException(
                        "You cannot approve another employer's booking");
        }

        if (booking.getStatus() != BookingStatus.COMPLETION_REQUESTED) {
                throw new BookingConflictException(
                        "This booking has no pending completion request");
        }

        if (LocalDateTime.now().isAfter(
                booking.getEmployerResponseDeadline())) {
                throw new BookingConflictException(
                        "The response deadline has passed. This booking requires resolution");
        }

        booking.setStatus(BookingStatus.COMPLETED);

        return bookingRepository.save(booking);
        }

        
        @Transactional
        public Booking raiseDispute(String email, Long bookingId, String reason) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        if (user.getRole() != Role.EMPLOYER) {
                throw new AccessDeniedException(
                        "Only employers can raise a dispute");
        }

        Employer employer = employerRepository.findByUserId(user.getId())
                .orElseThrow(() ->
                        new RuntimeException("Employer profile not found"));

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() ->
                        new RuntimeException("Booking not found"));

        if (!booking.getJob().getEmployer().getId()
                .equals(employer.getId())) {
                throw new AccessDeniedException(
                        "You cannot dispute another employer's booking");
        }

        if (booking.getStatus() != BookingStatus.COMPLETION_REQUESTED) {
                throw new BookingConflictException(
                        "There is no pending completion request to dispute");
        }

        if (LocalDateTime.now().isAfter(
                booking.getEmployerResponseDeadline())) {
                throw new BookingConflictException(
                        "The response deadline has passed. This booking requires resolution");
        }

        if (reason == null || reason.isBlank()) {
                throw new IllegalArgumentException(
                        "Dispute reason is required");
        }

        if (reason.length() > 1000) {
                throw new IllegalArgumentException(
                        "Dispute reason cannot exceed 1000 characters");
        }

        booking.setDisputeReason(reason.trim());
        booking.setDisputeRaisedAt(LocalDateTime.now());
        booking.setStatus(BookingStatus.DISPUTED);

        return bookingRepository.save(booking);
        }

}

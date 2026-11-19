
package com.digitalhiring.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.access.AccessDeniedException;

import com.digitalhiring.entity.*;
import com.digitalhiring.repository.*;
import com.digitalhiring.dto.AvailabilityRequest;
import com.digitalhiring.dto.AvailabilityResponse;
import com.digitalhiring.exception.BookingConflictException;

@Service
public class WorkerAvailabilityService {

    private final WorkerAvailabilityRepository availabilityRepository;
    private final WorkerRepository workerRepository;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;

    public WorkerAvailabilityService(
            WorkerAvailabilityRepository availabilityRepository,
            WorkerRepository workerRepository,
            UserRepository userRepository,
            BookingRepository bookingRepository) {

        this.availabilityRepository = availabilityRepository;
        this.workerRepository = workerRepository;
        this.userRepository = userRepository;
        this.bookingRepository = bookingRepository;
    }

    @Transactional
    public WorkerAvailability setAvailability(
            String email,
            AvailabilityRequest request) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        if (user.getRole() != Role.WORKER) {
            throw new AccessDeniedException(
                    "Only workers can update their availability");
        }

        Worker worker = workerRepository.findByUserId(user.getId())
                .orElseThrow(() ->
                        new RuntimeException("Worker profile not found"));

        LocalDate date = request.getDate();

        if (date.isBefore(LocalDate.now())) {
            throw new IllegalArgumentException(
                    "Past dates cannot be updated");
        }

        LocalDateTime dayStart = date.atStartOfDay();
        LocalDateTime dayEnd = date.plusDays(1).atStartOfDay();

        List<BookingStatus> activeStatuses = List.of(
                BookingStatus.REQUESTED,
                BookingStatus.ACCEPTED,
                BookingStatus.IN_PROGRESS
        );

        boolean isBooked = bookingRepository
                .existsByWorkerIdAndStatusInAndStartDateTimeLessThanAndEndDateTimeGreaterThan(
                        worker.getId(),
                        activeStatuses,
                        dayEnd,
                        dayStart
                );

        if (isBooked) {
            throw new BookingConflictException(
                    "This date has an existing booking and cannot be changed");
        }

        WorkerAvailability availability = availabilityRepository
                .findByWorkerIdAndDate(worker.getId(), date)
                .orElse(new WorkerAvailability());

        availability.setWorker(worker);
        availability.setDate(date);
        availability.setStatus(request.getStatus());

        return availabilityRepository.save(availability);
    }

    @Transactional(readOnly = true)
    public List<AvailabilityResponse> getCalendar(
            Long workerId,
            LocalDate startDate,
            LocalDate endDate) {

        if (startDate == null || endDate == null
                || startDate.isAfter(endDate)) {
            throw new IllegalArgumentException("Invalid calendar date range");
        }

        if (startDate.plusDays(62).isBefore(endDate)) {
            throw new IllegalArgumentException(
                    "Calendar range cannot exceed 63 days");
        }

        Map<LocalDate, String> calendar = new HashMap<>();

        // Default all dates to AVAILABLE
        for (LocalDate date = startDate;
                !date.isAfter(endDate);
                date = date.plusDays(1)) {

            calendar.put(date, "AVAILABLE");
        }

        // Apply manually selected availability
        List<WorkerAvailability> manualRecords =
                availabilityRepository.findByWorkerIdAndDateBetween(
                        workerId, startDate, endDate);

        for (WorkerAvailability record : manualRecords) {
            calendar.put(record.getDate(), record.getStatus().name());
        }

        // Find bookings overlapping the requested calendar period
        List<BookingStatus> activeStatuses = List.of(
                BookingStatus.REQUESTED,
                BookingStatus.ACCEPTED,
                BookingStatus.IN_PROGRESS
        );

        List<Booking> bookings =
                bookingRepository
                        .findByWorkerIdAndStatusInAndStartDateTimeLessThanAndEndDateTimeGreaterThan(
                                workerId,
                                activeStatuses,
                                endDate.plusDays(1).atStartOfDay(),
                                startDate.atStartOfDay()
                        );

        // Booked dates always take priority
        for (LocalDate date = startDate;
                !date.isAfter(endDate);
                date = date.plusDays(1)) {

            LocalDateTime dayStart = date.atStartOfDay();
            LocalDateTime dayEnd = date.plusDays(1).atStartOfDay();

            for (Booking booking : bookings) {
                if (booking.getStartDateTime().isBefore(dayEnd)
                        && booking.getEndDateTime().isAfter(dayStart)) {

                    calendar.put(date, "BOOKED");
                    break;
                }
            }
        }

        // Convert calendar data into response DTOs
        List<AvailabilityResponse> response = new ArrayList<>();

        for (LocalDate date = startDate;
                !date.isAfter(endDate);
                date = date.plusDays(1)) {

            response.add(
                    new AvailabilityResponse(date, calendar.get(date))
            );
        }

        return response;
    }

    @Transactional(readOnly = true)
    public List<AvailabilityResponse> getMyCalendar(
            String email,
            LocalDate startDate,
            LocalDate endDate) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() != Role.WORKER) {
            throw new AccessDeniedException("Only workers can view their calendar");
        }

        Worker worker = workerRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Worker profile not found"));

        return getCalendar(worker.getId(), startDate, endDate);
    }

    @Transactional(readOnly = true)
    public List<AvailabilityResponse> getWorkerCalendar(
            String email,
            Long workerId,
            LocalDate startDate,
            LocalDate endDate) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() != Role.EMPLOYER) {
            throw new AccessDeniedException("Only employers can view worker calendars");
        }

        workerRepository.findById(workerId)
                .orElseThrow(() -> new RuntimeException("Worker not found"));

        return getCalendar(workerId, startDate, endDate);
    }
}

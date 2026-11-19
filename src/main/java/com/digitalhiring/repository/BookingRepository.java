package com.digitalhiring.repository;

import java.util.List;
import java.util.Optional;
import java.time.LocalDateTime;
import com.digitalhiring.entity.BookingStatus;

import org.springframework.data.jpa.repository.JpaRepository;

import com.digitalhiring.entity.Booking;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByWorkerId(Long workerId);

    List<Booking> findByJobEmployerId(Long employerId);

    Optional<Booking> findByJobIdAndWorkerId(
            Long jobId, Long workerId);

    boolean existsByJobIdAndWorkerIdAndStatusIn(
        Long jobId,
        Long workerId,
        List<BookingStatus> statuses);

    boolean existsByWorkerIdAndStatusInAndStartDateTimeLessThanAndEndDateTimeGreaterThan(
            Long workerId,
            List<BookingStatus> statuses,
            LocalDateTime requestedEnd,
            LocalDateTime requestedStart
    );

    boolean existsByWorkerIdAndIdNotAndStatusInAndStartDateTimeLessThanAndEndDateTimeGreaterThan(
        Long workerId,
        Long bookingId,
        List<BookingStatus> statuses,
        LocalDateTime requestedEnd,
        LocalDateTime requestedStart
    );

    List<Booking> findByWorkerIdAndStatusInAndStartDateTimeLessThanAndEndDateTimeGreaterThan(
        Long workerId,
        List<BookingStatus> statuses,
        LocalDateTime rangeEnd,
        LocalDateTime rangeStart
    );
}

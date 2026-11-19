package com.digitalhiring.service;

import java.time.LocalDateTime;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.digitalhiring.dto.ReviewRequest;
import com.digitalhiring.entity.*;
import com.digitalhiring.exception.BookingConflictException;
import com.digitalhiring.repository.*;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    public ReviewService(
            ReviewRepository reviewRepository,
            BookingRepository bookingRepository,
            UserRepository userRepository) {

        this.reviewRepository = reviewRepository;
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Review createReview(String email, ReviewRequest request) {

        // Find the authenticated reviewer
        User reviewer = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Find the booking
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        // Reviews are allowed only after booking completion
        if (booking.getStatus() != BookingStatus.COMPLETED) {
            throw new BookingConflictException(
                    "Reviews can only be submitted for completed bookings");
        }

        // Identify both participants
        User employerUser = booking.getJob().getEmployer().getUser();
        User workerUser = booking.getWorker().getUser();

        User reviewee;

        // Employer reviews worker
        if (reviewer.getRole() == Role.EMPLOYER
                && reviewer.getId().equals(employerUser.getId())) {

            reviewee = workerUser;

        }
        // Worker reviews employer
        else if (reviewer.getRole() == Role.WORKER
                && reviewer.getId().equals(workerUser.getId())) {

            reviewee = employerUser;

        } else {
            throw new AccessDeniedException(
                    "You are not authorized to review this booking");
        }

        // Prevent duplicate reviews by the same user
        if (reviewRepository.existsByBookingIdAndReviewerId(
                booking.getId(), reviewer.getId())) {

            throw new BookingConflictException(
                    "You have already reviewed this booking");
        }

        // Create and save the review
        Review review = new Review();

        review.setBooking(booking);
        review.setReviewer(reviewer);
        review.setReviewee(reviewee);
        review.setRating(request.getRating());
        review.setComment(request.getComment());
        review.setCreatedAt(LocalDateTime.now());

        return reviewRepository.save(review);
    }

    
    // Get all reviews received by a user
    @Transactional(readOnly = true)
    public java.util.List<Review> getUserReviews(Long userId) {

        return reviewRepository.findByRevieweeIdOrderByCreatedAtDesc(userId);
    }

    // Get a user's average rating and total review count
    @Transactional(readOnly = true)
    public java.util.Map<String, Object> getUserRatingSummary(Long userId) {

        Double averageRating =
                reviewRepository.findAverageRatingByRevieweeId(userId);

        long totalReviews =
                reviewRepository.countByRevieweeId(userId);

        java.util.Map<String, Object> summary = new java.util.HashMap<>();

        summary.put("userId", userId);
        summary.put("averageRating",
                averageRating == null ? 0.0 : averageRating);
        summary.put("totalReviews", totalReviews);

        return summary;
    }

    // Get reviews received by the currently logged-in user
    @Transactional(readOnly = true)
    public java.util.List<Review> getMyReviews(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return getUserReviews(user.getId());
    }

    // Get rating summary of the currently logged-in user
    @Transactional(readOnly = true)
    public java.util.Map<String, Object> getMyRatingSummary(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return getUserRatingSummary(user.getId());
    }

    @Transactional(readOnly = true)
    public boolean hasReviewedBooking(String email, Long bookingId) {

        User reviewer = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        User employerUser = booking.getJob().getEmployer().getUser();
        User workerUser = booking.getWorker().getUser();

        boolean isEmployer = reviewer.getRole() == Role.EMPLOYER
                && reviewer.getId().equals(employerUser.getId());

        boolean isWorker = reviewer.getRole() == Role.WORKER
                && reviewer.getId().equals(workerUser.getId());

        if (!isEmployer && !isWorker) {
            throw new AccessDeniedException(
                    "You are not authorized to view this booking's review status");
        }

        return reviewRepository.existsByBookingIdAndReviewerId(
                bookingId, reviewer.getId());
    }

}


package com.digitalhiring.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.digitalhiring.entity.Review;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    // Check whether a user has already reviewed a booking
    boolean existsByBookingIdAndReviewerId(Long bookingId, Long reviewerId);

    // Get all reviews received by a user
    List<Review> findByRevieweeIdOrderByCreatedAtDesc(Long revieweeId);

    // Get all reviews submitted for a booking
    List<Review> findByBookingId(Long bookingId);

    // Calculate average rating received by a user
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.reviewee.id = :revieweeId")
    Double findAverageRatingByRevieweeId(@Param("revieweeId") Long revieweeId);

    // Count total reviews received by a user
    long countByRevieweeId(Long revieweeId);
}

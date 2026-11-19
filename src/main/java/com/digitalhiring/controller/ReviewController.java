
package com.digitalhiring.controller;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

import com.digitalhiring.dto.ReviewRequest;
import com.digitalhiring.dto.ReviewResponse;
import com.digitalhiring.entity.Review;
import com.digitalhiring.service.ReviewService;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    // Submit a review
    @PostMapping
    public ResponseEntity<ReviewResponse> createReview(
            @Valid @RequestBody ReviewRequest request,
            Authentication authentication) {

        Review review = reviewService.createReview(
                authentication.getName(), request);

        return ResponseEntity
                .created(URI.create("/api/reviews/" + review.getId()))
                .body(ReviewResponse.fromEntity(review));
    }

    // Get reviews received by a user
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ReviewResponse>> getUserReviews(
            @PathVariable Long userId) {

        List<ReviewResponse> responses = reviewService
                .getUserReviews(userId)
                .stream()
                .map(ReviewResponse::fromEntity)
                .toList();

        return ResponseEntity.ok(responses);
    }

    // Get a user's rating summary
    @GetMapping("/user/{userId}/summary")
    public ResponseEntity<?> getUserRatingSummary(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                reviewService.getUserRatingSummary(userId));
    }

    @GetMapping("/me")
    public ResponseEntity<List<ReviewResponse>> getMyReviews(Authentication authentication) {
    List<ReviewResponse> responses = reviewService
            .getMyReviews(authentication.getName())
            .stream()
            .map(ReviewResponse::fromEntity)
            .toList();

        return ResponseEntity.ok(responses);
    }

    @GetMapping("/me/summary")
    public ResponseEntity<?> getMyRatingSummary(Authentication authentication) {
        return ResponseEntity.ok(
            reviewService.getMyRatingSummary(authentication.getName()));
    }

    @GetMapping("/booking/{bookingId}/my-status")
    public ResponseEntity<?> getMyReviewStatus(
            @PathVariable Long bookingId,
            Authentication authentication) {
            boolean hasReviewed = reviewService.hasReviewedBooking(
                authentication.getName(), bookingId);

        return ResponseEntity.ok(
                java.util.Map.of("hasReviewed", hasReviewed));
    }
}


package com.digitalhiring.dto;

import java.time.LocalDateTime;

import com.digitalhiring.entity.Review;

public class ReviewResponse {

    private Long id;
    private Long bookingId;
    private Long reviewerId;
    private String reviewerName;
    private Long revieweeId;
    private String revieweeName;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;

    public ReviewResponse() {}

    public static ReviewResponse fromEntity(Review review) {

        ReviewResponse response = new ReviewResponse();

        response.setId(review.getId());
        response.setBookingId(review.getBooking().getId());

        response.setReviewerId(review.getReviewer().getId());
        response.setReviewerName(review.getReviewer().getName());

        response.setRevieweeId(review.getReviewee().getId());
        response.setRevieweeName(review.getReviewee().getName());

        response.setRating(review.getRating());
        response.setComment(review.getComment());
        response.setCreatedAt(review.getCreatedAt());

        return response;
    }

    // Getters and setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getBookingId() {
        return bookingId;
    }

    public void setBookingId(Long bookingId) {
        this.bookingId = bookingId;
    }

    public Long getReviewerId() {
        return reviewerId;
    }

    public void setReviewerId(Long reviewerId) {
        this.reviewerId = reviewerId;
    }

    public String getReviewerName() {
        return reviewerName;
    }

    public void setReviewerName(String reviewerName) {
        this.reviewerName = reviewerName;
    }

    public Long getRevieweeId() {
        return revieweeId;
    }

    public void setRevieweeId(Long revieweeId) {
        this.revieweeId = revieweeId;
    }

    public String getRevieweeName() {
        return revieweeName;
    }

    public void setRevieweeName(String revieweeName) {
        this.revieweeName = revieweeName;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}

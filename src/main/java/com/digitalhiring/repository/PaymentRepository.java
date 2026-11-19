
package com.digitalhiring.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.digitalhiring.entity.Payment;
import com.digitalhiring.entity.PaymentStatus;
import com.digitalhiring.entity.PaymentType;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    List<Payment> findByBookingIdOrderByCreatedAtDesc(Long bookingId);

    List<Payment> findByBookingIdAndPaymentType(
            Long bookingId, PaymentType paymentType);

    Optional<Payment> findByRazorpayOrderId(String razorpayOrderId);

    Optional<Payment> findByRazorpayPaymentId(String razorpayPaymentId);

    boolean existsByBookingIdAndPaymentTypeAndStatus(
            Long bookingId,
            PaymentType paymentType,
            PaymentStatus status);
}

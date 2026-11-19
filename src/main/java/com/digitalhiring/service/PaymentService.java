package com.digitalhiring.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.digitalhiring.config.RazorpayConfig;
import com.digitalhiring.dto.PaymentOrderRequest;
import com.digitalhiring.dto.PaymentOrderResponse;
import com.digitalhiring.entity.*;
import com.digitalhiring.repository.*;
import java.time.LocalDateTime;
import com.digitalhiring.dto.PaymentVerificationRequest;
import com.razorpay.Utils;
import com.razorpay.RazorpayException;
import com.digitalhiring.dto.PaymentStatusResponse;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;

@Service
public class PaymentService {

    private final RazorpayClient razorpayClient;
    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    public PaymentService(
            RazorpayClient razorpayClient,
            PaymentRepository paymentRepository,
            BookingRepository bookingRepository,
            UserRepository userRepository) {

        this.razorpayClient = razorpayClient;
        this.paymentRepository = paymentRepository;
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public PaymentOrderResponse createPaymentOrder(
            String email, PaymentOrderRequest request) {

            System.out.println("Razorpay Key ID present: "
        + (razorpayKeyId != null && !razorpayKeyId.isBlank()));

        System.out.println("Razorpay Secret present: "
        + (razorpayKeySecret != null && !razorpayKeySecret.isBlank()));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() != Role.EMPLOYER) {
            throw new AccessDeniedException(
                    "Only employers can make booking payments");
        }

        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!booking.getJob().getEmployer().getUser()
                .getId().equals(user.getId())) {
            throw new AccessDeniedException(
                    "You cannot pay for another employer's booking");
        }

        PaymentType type = request.getPaymentType();

        if (type == PaymentType.FINAL
        && !paymentRepository.existsByBookingIdAndPaymentTypeAndStatus(
                booking.getId(),
                PaymentType.ADVANCE,
                PaymentStatus.PAID)) {

            throw new IllegalStateException(
                    "Advance payment must be completed before final payment");
        }

        if (type == PaymentType.ADVANCE
                && booking.getStatus() != BookingStatus.ACCEPTED) {
            throw new IllegalStateException(
                    "Advance payment is allowed only for accepted bookings");
        }

        if (type == PaymentType.FINAL
                && booking.getStatus() != BookingStatus.COMPLETED) {
            throw new IllegalStateException(
                    "Final payment is allowed only after completion approval");
        }

        if (type == PaymentType.ADVANCE
                && paymentRepository.existsByBookingIdAndPaymentTypeAndStatus(
                        booking.getId(), type, PaymentStatus.PAID)) {
            throw new IllegalStateException(
                    "Advance payment has already been completed");
        }

        if (type == PaymentType.FINAL
                && paymentRepository.existsByBookingIdAndPaymentTypeAndStatus(
                        booking.getId(), type, PaymentStatus.PAID)) {
            throw new IllegalStateException(
                    "Final payment has already been completed");
        }

        List<Payment> existingPayments =
                paymentRepository.findByBookingIdAndPaymentType(
                        booking.getId(), type);

        for (Payment payment : existingPayments) {
            if (payment.getStatus() == PaymentStatus.CREATED
                    && payment.getRazorpayOrderId() != null) {

                long amountInPaise = payment.getAmount()
                        .movePointRight(2)
                        .longValueExact();

                return new PaymentOrderResponse(
                        payment.getRazorpayOrderId(),
                        razorpayKeyId,
                        amountInPaise,
                        payment.getCurrency(),
                        payment.getId());
            }
        }

        BigDecimal totalAmount =
                BigDecimal.valueOf(booking.getAgreedAmount())
                        .setScale(2, RoundingMode.HALF_UP);

        BigDecimal amount;

        if (type == PaymentType.ADVANCE) {
            amount = totalAmount.multiply(new BigDecimal("0.20"))
                    .setScale(2, RoundingMode.HALF_UP);
        } else {
            BigDecimal advance = totalAmount
                    .multiply(new BigDecimal("0.20"))
                    .setScale(2, RoundingMode.HALF_UP);

            amount = totalAmount.subtract(advance);
        }

        if (amount.signum() <= 0) {
            throw new IllegalStateException(
                    "Payment amount must be greater than zero");
        }

        long amountInPaise = amount.movePointRight(2).longValueExact();

        try {
            JSONObject orderRequest = new JSONObject();

            orderRequest.put("amount", amountInPaise);
            orderRequest.put("currency", "INR");
            orderRequest.put(
                    "receipt",
                    "booking_" + booking.getId() + "_" + type.name());

            Order razorpayOrder =
                    razorpayClient.orders.create(orderRequest);

            String razorpayOrderId =
                    razorpayOrder.get("id").toString();

            Payment payment = new Payment();

            payment.setBooking(booking);
            payment.setPayer(user);
            payment.setPaymentType(type);
            payment.setStatus(PaymentStatus.CREATED);
            payment.setAmount(amount);
            payment.setCurrency("INR");
            payment.setRazorpayOrderId(razorpayOrderId);

            Payment savedPayment = paymentRepository.save(payment);

            return new PaymentOrderResponse(
                    razorpayOrderId,
                    razorpayKeyId,
                    amountInPaise,
                    "INR",
                    savedPayment.getId());

        } catch (Exception e) {
            throw new RuntimeException(
                    "Unable to create Razorpay order: " + e.getMessage(), e);
        }
    }

    
        @Transactional
        public void verifyPayment(
                String email,
                PaymentVerificationRequest request) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Payment payment = paymentRepository
                .findByRazorpayOrderId(request.getRazorpayOrderId())
                .orElseThrow(() ->
                        new RuntimeException("Payment order not found"));

        // 1. Verify payment ownership
        if (!payment.getPayer().getId().equals(user.getId())) {
                throw new AccessDeniedException(
                        "You cannot verify another user's payment");
        }

        // 2. Verify Razorpay signature
        JSONObject options = new JSONObject();
        options.put("razorpay_order_id", payment.getRazorpayOrderId());
        options.put("razorpay_payment_id", request.getRazorpayPaymentId());
        options.put("razorpay_signature", request.getRazorpaySignature());

        try {
                boolean signatureValid = Utils.verifyPaymentSignature(
                        options, razorpayKeySecret);

                if (!signatureValid) {
                throw new IllegalArgumentException(
                        "Invalid Razorpay payment signature");
                }

        } catch (RazorpayException e) {
                throw new IllegalArgumentException(
                        "Payment signature verification failed", e);
        }

        // 3. Handle repeated successful callbacks
        if (payment.getStatus() == PaymentStatus.PAID) {
                if (request.getRazorpayPaymentId()
                        .equals(payment.getRazorpayPaymentId())) {
                return;
                }

                throw new IllegalStateException(
                        "This order has already been paid");
        }

        if (payment.getStatus() != PaymentStatus.CREATED) {
                throw new IllegalStateException(
                        "This payment order cannot be verified");
        }

        // 4. Prevent reuse of an existing payment ID
        if (paymentRepository
                .findByRazorpayPaymentId(request.getRazorpayPaymentId())
                .isPresent()) {
                throw new IllegalStateException(
                        "This payment ID has already been used");
        }

        // 5. Fetch actual payment details directly from Razorpay
        try {
                com.razorpay.Payment razorpayPayment = razorpayClient.payments.fetch(request.getRazorpayPaymentId());

                // Confirm payment is captured
                String status = razorpayPayment.get("status");

                if (!"captured".equalsIgnoreCase(status)) {
                throw new IllegalStateException(
                        "Payment has not been captured by Razorpay");
                }

                // Confirm order ID
                String actualOrderId = razorpayPayment.get("order_id");

                if (!payment.getRazorpayOrderId().equals(actualOrderId)) {
                throw new IllegalStateException(
                        "Razorpay order ID mismatch");
                }

                // Confirm amount
                Number actualAmount = razorpayPayment.get("amount");
                long expectedAmountInPaise = payment.getAmount()
                        .movePointRight(2)
                        .longValueExact();

                if (actualAmount == null
                        || actualAmount.longValue() != expectedAmountInPaise) {
                throw new IllegalStateException(
                        "Payment amount mismatch");
                }

                // Confirm currency
                String actualCurrency = razorpayPayment.get("currency");

                if (!payment.getCurrency().equalsIgnoreCase(actualCurrency)) {
                throw new IllegalStateException(
                        "Payment currency mismatch");
                }

                // 6. Mark payment as PAID only after all checks pass
                payment.setRazorpayPaymentId(
                        request.getRazorpayPaymentId());

                payment.setRazorpaySignature(
                        request.getRazorpaySignature());

                payment.setStatus(PaymentStatus.PAID);
                payment.setPaidAt(LocalDateTime.now());

                paymentRepository.save(payment);

        } catch (RazorpayException e) {
                throw new RuntimeException(
                        "Unable to verify payment with Razorpay", e);
        }
        }


    @Transactional(readOnly = true)
    public List<PaymentStatusResponse> getBookingPayments(
            String email, Long bookingId) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        boolean isEmployer = user.getRole() == Role.EMPLOYER
                && booking.getJob().getEmployer().getUser()
                        .getId().equals(user.getId());

        boolean isWorker = user.getRole() == Role.WORKER
                && booking.getWorker().getUser()
                        .getId().equals(user.getId());

        if (!isEmployer && !isWorker) {
                throw new AccessDeniedException(
                        "You cannot view payments for this booking");
        }

        return paymentRepository
                .findByBookingIdOrderByCreatedAtDesc(bookingId)
                .stream()
                .map(PaymentStatusResponse::new)
                .toList();
    }
}

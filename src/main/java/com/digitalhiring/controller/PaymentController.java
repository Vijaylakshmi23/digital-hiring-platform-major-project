
package com.digitalhiring.controller;

import com.digitalhiring.dto.PaymentOrderRequest;
import com.digitalhiring.dto.PaymentOrderResponse;
import com.digitalhiring.service.PaymentService;
import com.digitalhiring.dto.PaymentVerificationRequest;
import java.util.List;
import com.digitalhiring.dto.PaymentStatusResponse;
import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/orders")
    public ResponseEntity<PaymentOrderResponse> createPaymentOrder(
            @Valid @RequestBody PaymentOrderRequest request,
            Authentication authentication) {

        PaymentOrderResponse response =
                paymentService.createPaymentOrder(
                        authentication.getName(), request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @PostMapping("/verify")
    public ResponseEntity<String> verifyPayment(
            @Valid @RequestBody PaymentVerificationRequest request,
            Authentication authentication) {

        paymentService.verifyPayment(
                authentication.getName(), request);

        return ResponseEntity.ok("Payment verified successfully");
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<List<PaymentStatusResponse>> getBookingPayments(
            @PathVariable Long bookingId,
            Authentication authentication) {

        List<PaymentStatusResponse> payments =
                paymentService.getBookingPayments(
                        authentication.getName(), bookingId);

        return ResponseEntity.ok(payments);
    }
}

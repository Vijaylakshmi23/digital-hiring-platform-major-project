
package com.digitalhiring.dto;

import com.digitalhiring.entity.PaymentType;
import jakarta.validation.constraints.NotNull;

public class PaymentOrderRequest {

    @NotNull(message = "Booking ID is required")
    private Long bookingId;

    @NotNull(message = "Payment type is required")
    private PaymentType paymentType;

    public Long getBookingId() {
        return bookingId;
    }

    public void setBookingId(Long bookingId) {
        this.bookingId = bookingId;
    }

    public PaymentType getPaymentType() {
        return paymentType;
    }

    public void setPaymentType(PaymentType paymentType) {
        this.paymentType = paymentType;
    }
}

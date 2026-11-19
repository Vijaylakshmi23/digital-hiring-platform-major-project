
package com.digitalhiring.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.digitalhiring.entity.Payment;
import com.digitalhiring.entity.PaymentStatus;
import com.digitalhiring.entity.PaymentType;

public class PaymentStatusResponse {

    private Long id;
    private PaymentType paymentType;
    private PaymentStatus status;
    private BigDecimal amount;
    private String currency;
    private LocalDateTime createdAt;
    private LocalDateTime paidAt;

    public PaymentStatusResponse(Payment payment) {
        this.id = payment.getId();
        this.paymentType = payment.getPaymentType();
        this.status = payment.getStatus();
        this.amount = payment.getAmount();
        this.currency = payment.getCurrency();
        this.createdAt = payment.getCreatedAt();
        this.paidAt = payment.getPaidAt();
    }

    public Long getId() {
        return id;
    }

    public PaymentType getPaymentType() {
        return paymentType;
    }

    public PaymentStatus getStatus() {
        return status;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public String getCurrency() {
        return currency;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getPaidAt() {
        return paidAt;
    }
}

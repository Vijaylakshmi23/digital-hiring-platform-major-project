
package com.digitalhiring.dto;

public class PaymentOrderResponse {

    private String razorpayOrderId;
    private String razorpayKeyId;
    private Long amount;
    private String currency;
    private Long paymentId;

    public PaymentOrderResponse() {
    }

    public PaymentOrderResponse(
            String razorpayOrderId,
            String razorpayKeyId,
            Long amount,
            String currency,
            Long paymentId) {
        this.razorpayOrderId = razorpayOrderId;
        this.razorpayKeyId = razorpayKeyId;
        this.amount = amount;
        this.currency = currency;
        this.paymentId = paymentId;
    }

    public String getRazorpayOrderId() {
        return razorpayOrderId;
    }

    public void setRazorpayOrderId(String razorpayOrderId) {
        this.razorpayOrderId = razorpayOrderId;
    }

    public String getRazorpayKeyId() {
        return razorpayKeyId;
    }

    public void setRazorpayKeyId(String razorpayKeyId) {
        this.razorpayKeyId = razorpayKeyId;
    }

    public Long getAmount() {
        return amount;
    }

    public void setAmount(Long amount) {
        this.amount = amount;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public Long getPaymentId() {
        return paymentId;
    }

    public void setPaymentId(Long paymentId) {
        this.paymentId = paymentId;
    }
}

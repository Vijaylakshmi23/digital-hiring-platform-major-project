import axios from "axios";
import API_BASE_URL from "./api";

const API_URL = `${API_BASE_URL}/api/payments`;

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Please login to continue.");
  }

  return {
    Authorization: `Bearer ${token}`,
  };
};

export type PaymentType = "ADVANCE" | "FINAL";

export interface PaymentOrderResponse {
  razorpayOrderId: string;
  razorpayKeyId: string;
  amount: number;
  currency: string;
  paymentId: number;
}

export interface PaymentVerificationRequest {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface PaymentStatusResponse {
  id: number;
  paymentType: PaymentType;
  status: "CREATED" | "PAID" | "FAILED" | "REFUNDED";
  amount: number;
  currency: string;
  createdAt: string;
  paidAt: string | null;
}

// Create Razorpay order
export const createPaymentOrder = async (
  bookingId: number,
  paymentType: PaymentType
): Promise<PaymentOrderResponse> => {
  const response = await axios.post<PaymentOrderResponse>(
    `${API_URL}/orders`,
    {
      bookingId,
      paymentType,
    },
    {
      headers: getAuthHeaders(),
    }
  );

  return response.data;
};

// Verify Razorpay payment
export const verifyPayment = async (
  data: PaymentVerificationRequest
) => {
  const response = await axios.post(
    `${API_URL}/verify`,
    {
      razorpayOrderId: data.razorpayOrderId,
      razorpayPaymentId: data.razorpayPaymentId,
      razorpaySignature: data.razorpaySignature,
    },
    {
      headers: getAuthHeaders(),
    }
  );

  return response.data;
};

// Get payment history for a booking
export const getBookingPayments = async (
  bookingId: number
): Promise<PaymentStatusResponse[]> => {
  const response = await axios.get<PaymentStatusResponse[]>(
    `${API_URL}/booking/${bookingId}`,
    { headers: getAuthHeaders() }
  );

  return response.data;
};
 
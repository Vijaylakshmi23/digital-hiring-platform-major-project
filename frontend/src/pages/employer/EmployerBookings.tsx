import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../../services/api";
import {
  createPaymentOrder,
  verifyPayment,
  getBookingPayments,
} from "../../services/paymentService";

import type {
  PaymentStatusResponse,
  PaymentType,
} from "../../services/paymentService";

import ReviewForm from "../../components/ReviewForm";

import {
  CalendarDays,
  Clock,
  Search,
  RefreshCw,
  BriefcaseBusiness,
  UserRound,
  Building2,
  IndianRupee,
  CheckCircle2,
  AlertCircle,
  XCircle,
  FileText,
  ShieldAlert,
} from "lucide-react";

type BookingStatus =
  | "REQUESTED"
  | "ACCEPTED"
  | "REJECTED"
  | "CANCELLED"
  | "IN_PROGRESS"
  | "COMPLETION_REQUESTED"
  | "DISPUTED"
  | "COMPLETED";

interface Booking {
  id: number;
  jobId: number;
  jobTitle: string;
  employerId: number;
  companyName: string;
  workerId: number;
  workerName: string;
  startDateTime: string;
  endDateTime: string;
  status: BookingStatus;
  agreedAmount: number;
  disputeReason: string | null;
  disputeRaisedAt: string | null;
}

const API_URL = API_BASE_URL;

const formatCurrency = (amount: number) =>
  `₹${Number(amount || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (date: string) =>
  new Date(date).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

const getStatusStyle = (status: BookingStatus) => {
  switch (status) {
    case "ACCEPTED":
      return "bg-green-100 text-green-700 border-green-200";
    case "COMPLETED":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "IN_PROGRESS":
      return "bg-indigo-100 text-indigo-700 border-indigo-200";
    case "COMPLETION_REQUESTED":
      return "bg-purple-100 text-purple-700 border-purple-200";
    case "DISPUTED":
      return "bg-red-100 text-red-700 border-red-200";
    case "REJECTED":
      return "bg-gray-100 text-gray-600 border-gray-200";
    case "CANCELLED":
      return "bg-red-50 text-red-600 border-red-200";
    case "REQUESTED":
    default:
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
  }
};

function EmployerBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [paymentStatuses, setPaymentStatuses] = useState<
    Record<number, PaymentStatusResponse[]>
  >({});

  const [processingPaymentId, setProcessingPaymentId] =
    useState<number | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const fetchBookings = async () => {
    try {
      setRefreshing(true);

      const token = localStorage.getItem("token");

      const response = await axios.get(
        `${API_URL}/api/bookings/my`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setBookings(response.data);

      const paymentEntries = await Promise.all(
        response.data.map(async (booking: Booking) => {
          try {
            const payments = await getBookingPayments(booking.id);
            return [booking.id, payments] as const;
          } catch (err) {
            console.error(
              `Unable to fetch payments for booking ${booking.id}`,
              err
            );
            return [booking.id, []] as const;
          }
        })
      );

      setPaymentStatuses(Object.fromEntries(paymentEntries));
      setError("");
    } catch (err) {
      console.error(err);
      setError("Unable to load bookings. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const getPaymentStatus = (
    bookingId: number,
    type: PaymentType
  ) => {
    return (
      paymentStatuses[bookingId]?.find(
        (payment) => payment.paymentType === type
      )?.status ?? "NOT_CREATED"
    );
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const search = searchTerm.toLowerCase().trim();

      const matchesSearch =
        !search ||
        booking.jobTitle?.toLowerCase().includes(search) ||
        booking.workerName?.toLowerCase().includes(search) ||
        booking.companyName?.toLowerCase().includes(search) ||
        String(booking.id).includes(search);

      const matchesStatus =
        statusFilter === "ALL" ||
        booking.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [bookings, searchTerm, statusFilter]);

  const summary = {
    total: bookings.length,
    requested: bookings.filter((b) => b.status === "REQUESTED").length,
    active: bookings.filter(
      (b) =>
        b.status === "ACCEPTED" ||
        b.status === "IN_PROGRESS" ||
        b.status === "COMPLETION_REQUESTED"
    ).length,
    completed: bookings.filter((b) => b.status === "COMPLETED").length,
    disputed: bookings.filter((b) => b.status === "DISPUTED").length,
  };

  const payForBooking = async (
    booking: Booking,
    paymentType: PaymentType
  ) => {
    try {
      setProcessingPaymentId(booking.id);

      if (!window.Razorpay) {
        throw new Error(
          "Razorpay Checkout could not be loaded. Please refresh the page."
        );
      }

      const order = await createPaymentOrder(
        booking.id,
        paymentType
      );

      const checkout = new window.Razorpay({
        key: order.razorpayKeyId,
        amount: order.amount,
        currency: order.currency,
        name: "Digital Hiring Platform",
        description: `${
          paymentType === "ADVANCE" ? "Advance" : "Final"
        } payment for ${booking.jobTitle}`,
        order_id: order.razorpayOrderId,

        handler: async (response) => {
          try {
            await verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            alert("Payment verified successfully!");
            await fetchBookings();
          } catch (error) {
            console.error("Payment verification error:", error);
            alert(
              "Payment verification failed. Please contact support before retrying."
            );
          } finally {
            setProcessingPaymentId(null);
          }
        },
      });

      checkout.on("payment.failed", (response) => {
        const failure = response as {
          error?: {
            code?: string;
            description?: string;
            reason?: string;
            source?: string;
            step?: string;
          };
        };

        console.error("Razorpay Payment Failure:", failure);

        alert(
          `Payment Failed!\nReason: ${
            failure.error?.description || "Unknown error"
          }\nCode: ${failure.error?.code || "Not available"}`
        );

        setProcessingPaymentId(null);
      });

      checkout.open();
    } catch (error) {
      console.error("Payment error:", error);

      alert(
        axios.isAxiosError(error)
          ? error.response?.data?.message ||
              "Unable to initiate payment."
          : error instanceof Error
            ? error.message
            : "Something went wrong."
      );

      setProcessingPaymentId(null);
    }
  };

  const updateStatus = async (
    bookingId: number,
    status: string
  ) => {
    try {
      const token = localStorage.getItem("token");

      await axios.patch(
        `${API_URL}/api/bookings/${bookingId}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await fetchBookings();
      alert("Booking status updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Unable to update booking status.");
    }
  };

  const approveCompletion = async (bookingId: number) => {
    if (!window.confirm("Approve completion of this booking?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        `${API_URL}/api/bookings/${bookingId}/approve-completion`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Booking completion approved!");
      await fetchBookings();
    } catch (err) {
      console.error(err);
      alert("Unable to approve completion. Please try again.");
    }
  };

  const raiseDispute = async (bookingId: number) => {
    const reason = window.prompt(
      "Please explain why you are disputing this completion:"
    );

    if (!reason || !reason.trim()) {
      return;
    }

    if (!window.confirm("Are you sure you want to raise this dispute?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        `${API_URL}/api/bookings/${bookingId}/dispute`,
        { reason: reason.trim() },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Dispute raised successfully!");
      await fetchBookings();
    } catch (err) {
      console.error("Dispute error:", err);
      alert("Unable to raise dispute. Please try again.");
    }
  };

  const cancelBooking = async (bookingId: number) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        `${API_URL}/api/bookings/${bookingId}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await fetchBookings();
      alert("Booking cancelled successfully!");
    } catch (err) {
      console.error(err);
      alert("Unable to cancel booking.");
    }
  };

  const rescheduleBooking = async (booking: Booking) => {
    const startDateTime = window.prompt(
      "Enter new start date and time (YYYY-MM-DDTHH:mm):",
      booking.startDateTime.slice(0, 16)
    );

    if (!startDateTime) return;

    const endDateTime = window.prompt(
      "Enter new end date and time (YYYY-MM-DDTHH:mm):",
      booking.endDateTime.slice(0, 16)
    );

    if (!endDateTime) return;

    if (
      !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(startDateTime) ||
      !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(endDateTime) ||
      new Date(endDateTime) <= new Date(startDateTime)
    ) {
      alert("Enter valid dates. End time must be after start time.");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await axios.patch(
        `${API_URL}/api/bookings/${booking.id}/reschedule`,
        {
          startDateTime,
          endDateTime,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await fetchBookings();
      alert("Booking rescheduled successfully!");
    } catch (err) {
      console.error(err);
      alert("Unable to reschedule booking.");
    }
  };

  const renderPaymentStatus = (status: string) => {
    const paid = status === "PAID";

    return (
      <span
        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
          paid
            ? "bg-green-100 text-green-700"
            : "bg-orange-100 text-orange-700"
        }`}
      >
        {status.replaceAll("_", " ")}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <RefreshCw className="mx-auto mb-3 h-8 w-8 animate-spin text-blue-600" />
          <p className="font-medium text-gray-600">
            Loading your bookings...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
        <div className="max-w-md rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
          <AlertCircle className="mx-auto mb-3 h-10 w-10 text-red-500" />
          <h2 className="text-xl font-bold text-gray-900">
            Unable to load bookings
          </h2>
          <p className="mt-2 text-sm text-gray-500">{error}</p>
          <button
            onClick={fetchBookings}
            className="mt-5 rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Page Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-600">
              <BriefcaseBusiness size={17} />
              Employer Workspace
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Manage Bookings
            </h1>

            <p className="mt-2 text-sm text-gray-500 sm:text-base">
              Track your workers, manage schedules and handle payments.
            </p>
          </div>

          <button
            onClick={fetchBookings}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-100 disabled:opacity-60"
          >
            <RefreshCw
              size={17}
              className={refreshing ? "animate-spin" : ""}
            />
            {refreshing ? "Refreshing..." : "Refresh Bookings"}
          </button>
        </div>

        {/* Summary Cards */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {[
            {
              label: "Total Bookings",
              value: summary.total,
              icon: BriefcaseBusiness,
              style: "bg-blue-50 text-blue-600",
            },
            {
              label: "Requested",
              value: summary.requested,
              icon: Clock,
              style: "bg-yellow-50 text-yellow-600",
            },
            {
              label: "Active",
              value: summary.active,
              icon: CalendarDays,
              style: "bg-indigo-50 text-indigo-600",
            },
            {
              label: "Completed",
              value: summary.completed,
              icon: CheckCircle2,
              style: "bg-green-50 text-green-600",
            },
            {
              label: "Disputed",
              value: summary.disputed,
              icon: ShieldAlert,
              style: "bg-red-50 text-red-600",
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.style}`}
                  >
                    <Icon size={20} />
                  </div>
                  <span className="text-2xl font-bold text-gray-900">
                    {item.value}
                  </span>
                </div>

                <p className="mt-3 text-sm font-medium text-gray-500">
                  {item.label}
                </p>
              </div>
            );
          })}
        </div>

        {/* Search and Filters */}
        <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search
                size={19}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by job title, worker name or booking ID..."
                className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 md:w-56"
            >
              <option value="ALL">All Booking Statuses</option>
              <option value="REQUESTED">Requested</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETION_REQUESTED">Completion Requested</option>
              <option value="COMPLETED">Completed</option>
              <option value="DISPUTED">Disputed</option>
              <option value="REJECTED">Rejected</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div className="mt-3 text-xs text-gray-500">
            Showing {filteredBookings.length} of {bookings.length} bookings
          </div>
        </div>

        {/* Booking List */}
        {bookings.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
              <BriefcaseBusiness className="h-8 w-8 text-blue-500" />
            </div>

            <h2 className="mt-5 text-xl font-bold text-gray-900">
              No bookings yet
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Once workers accept your job offers, your bookings will appear here.
            </p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-white px-6 py-14 text-center shadow-sm">
            <Search className="mx-auto h-9 w-9 text-gray-400" />
            <h2 className="mt-4 text-lg font-semibold text-gray-900">
              No matching bookings
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Try changing your search term or status filter.
            </p>

            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("ALL");
              }}
              className="mt-4 text-sm font-semibold text-blue-600 hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredBookings.map((booking) => {
              const advanceStatus = getPaymentStatus(
                booking.id,
                "ADVANCE"
              );

              const finalStatus = getPaymentStatus(
                booking.id,
                "FINAL"
              );

              return (
                <div
                  key={booking.id}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
                >
                  {/* Booking Header */}
                  <div className="flex flex-col justify-between gap-4 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:p-6">
                    <div>
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
                          Booking #{booking.id}
                        </span>
                        <span className="text-xs text-gray-400">
                          Job #{booking.jobId}
                        </span>
                      </div>

                      <h2 className="text-xl font-bold text-gray-900">
                        {booking.jobTitle}
                      </h2>

                      <p className="mt-1 text-sm text-gray-500">
                        Booking details and payment information
                      </p>
                    </div>

                    <span
                      className={`w-fit rounded-full border px-3 py-1.5 text-xs font-bold ${getStatusStyle(
                        booking.status
                      )}`}
                    >
                      {booking.status.replaceAll("_", " ")}
                    </span>
                  </div>

                  <div className="space-y-6 p-5 sm:p-6">

                    {/* Worker and Employer Details */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
                          <UserRound size={17} className="text-blue-600" />
                          Worker Details
                        </div>

                        <p className="font-semibold text-gray-900">
                          {booking.workerName}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          Worker ID: {booking.workerId}
                        </p>
                      </div>

                      <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
                          <Building2 size={17} className="text-blue-600" />
                          Employer Details
                        </div>

                        <p className="font-semibold text-gray-900">
                          {booking.companyName}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          Employer ID: {booking.employerId}
                        </p>
                      </div>
                    </div>

                    {/* Booking Schedule */}
                    <div className="rounded-xl border border-gray-100 p-4">
                      <div className="mb-4 flex items-center gap-2 font-semibold text-gray-800">
                        <CalendarDays size={18} className="text-blue-600" />
                        Booking Schedule
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                            Start Date & Time
                          </p>
                          <p className="mt-1 text-sm font-semibold text-gray-800">
                            {formatDate(booking.startDateTime)}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                            End Date & Time
                          </p>
                          <p className="mt-1 text-sm font-semibold text-gray-800">
                            {formatDate(booking.endDateTime)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Dispute Details */}
                    {booking.status === "DISPUTED" && (
                      <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                        <div className="flex items-center gap-2 font-semibold text-red-800">
                          <ShieldAlert size={18} />
                          Dispute Details
                        </div>

                        <p className="mt-3 text-sm text-gray-700">
                          <strong>Reason:</strong>{" "}
                          {booking.disputeReason || "No reason provided"}
                        </p>

                        {booking.disputeRaisedAt && (
                          <p className="mt-2 text-sm text-gray-600">
                            <strong>Raised on:</strong>{" "}
                            {formatDate(booking.disputeRaisedAt)}
                          </p>
                        )}

                        <p className="mt-3 text-xs font-semibold text-red-700">
                          This booking is currently under dispute.
                        </p>
                      </div>
                    )}

                    {/* Payment Details */}
                    <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4 sm:p-5">
                      <div className="mb-4 flex items-center gap-2 font-semibold text-gray-800">
                        <IndianRupee size={19} className="text-blue-600" />
                        Payment Breakdown
                      </div>

                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between gap-3">
                          <span className="text-gray-600">
                            Total Agreed Amount
                          </span>
                          <strong className="text-gray-900">
                            {formatCurrency(booking.agreedAmount)}
                          </strong>
                        </div>

                        <div className="flex justify-between gap-3">
                          <span className="text-gray-600">
                            Advance Payment (20%)
                          </span>
                          <strong className="text-gray-900">
                            {formatCurrency(booking.agreedAmount * 0.2)}
                          </strong>
                        </div>

                        <div className="flex justify-between gap-3">
                          <span className="text-gray-600">
                            Final Payment (80%)
                          </span>
                          <strong className="text-gray-900">
                            {formatCurrency(booking.agreedAmount * 0.8)}
                          </strong>
                        </div>
                      </div>

                      <div className="mt-5 border-t border-blue-200 pt-4">
                        <p className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-500">
                          Payment Status
                        </p>

                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-sm text-gray-600">
                              Advance Payment
                            </span>
                            {renderPaymentStatus(advanceStatus)}
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-sm text-gray-600">
                              Final Payment
                            </span>
                            {renderPaymentStatus(finalStatus)}
                          </div>
                        </div>
                      </div>

                      {/* Payment Actions */}
                      <div className="mt-5 flex flex-wrap gap-3">
                        {booking.status === "ACCEPTED" &&
                          advanceStatus !== "PAID" && (
                            <button
                              onClick={() =>
                                payForBooking(booking, "ADVANCE")
                              }
                              disabled={
                                processingPaymentId === booking.id
                              }
                              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {processingPaymentId === booking.id
                                ? "Processing..."
                                : `Pay Advance ${formatCurrency(
                                    booking.agreedAmount * 0.2
                                  )}`}
                            </button>
                          )}

                        {booking.status === "COMPLETED" &&
                          advanceStatus === "PAID" &&
                          finalStatus !== "PAID" && (
                            <button
                              onClick={() =>
                                payForBooking(booking, "FINAL")
                              }
                              disabled={
                                processingPaymentId === booking.id
                              }
                              className="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {processingPaymentId === booking.id
                                ? "Processing..."
                                : `Pay Final ${formatCurrency(
                                    booking.agreedAmount * 0.8
                                  )}`}
                            </button>
                          )}
                      </div>
                    </div>

                    {/* Booking Actions */}
                    {(booking.status === "REQUESTED" ||
                      booking.status === "ACCEPTED" ||
                      booking.status === "COMPLETION_REQUESTED") && (
                      <div className="border-t border-gray-100 pt-5">
                        <h3 className="mb-3 text-sm font-semibold text-gray-700">
                          Booking Actions
                        </h3>

                        <div className="flex flex-wrap gap-3">
                          {booking.status === "REQUESTED" && (
                            <>
                              <button
                                onClick={() =>
                                  updateStatus(booking.id, "ACCEPTED")
                                }
                                className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
                              >
                                <CheckCircle2 size={16} />
                                Accept Booking
                              </button>

                              <button
                                onClick={() =>
                                  updateStatus(booking.id, "REJECTED")
                                }
                                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
                              >
                                <XCircle size={16} />
                                Reject Booking
                              </button>
                            </>
                          )}

                          {booking.status === "ACCEPTED" && (
                            <>
                              <button
                                onClick={() =>
                                  rescheduleBooking(booking)
                                }
                                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                              >
                                <CalendarDays size={16} />
                                Reschedule
                              </button>

                              <button
                                onClick={() =>
                                  cancelBooking(booking.id)
                                }
                                className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                              >
                                <XCircle size={16} />
                                Cancel Booking
                              </button>
                            </>
                          )}

                          {booking.status === "COMPLETION_REQUESTED" && (
                            <>
                              <button
                                onClick={() =>
                                  approveCompletion(booking.id)
                                }
                                className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
                              >
                                <CheckCircle2 size={16} />
                                Approve Completion
                              </button>

                              <button
                                onClick={() =>
                                  raiseDispute(booking.id)
                                }
                                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
                              >
                                <ShieldAlert size={16} />
                                Raise Dispute
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Completed Booking and Review */}
                    {booking.status === "COMPLETED" && (
                      <div className="border-t border-gray-100 pt-5">
                        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-green-700">
                          <CheckCircle2 size={19} />
                          This booking has been completed.
                        </div>

                        <ReviewForm
                          bookingId={booking.id}
                          revieweeName={booking.workerName}
                          onReviewSubmitted={fetchBookings}
                        />
                      </div>
                    )}

                    {/* Informational statuses */}
                    {(booking.status === "IN_PROGRESS" ||
                      booking.status === "REJECTED" ||
                      booking.status === "CANCELLED" ||
                      booking.status === "DISPUTED") && (
                      <div className="flex items-start gap-2 border-t border-gray-100 pt-4 text-sm text-gray-500">
                        <FileText size={17} className="mt-0.5 shrink-0" />
                        {booking.status === "IN_PROGRESS"
                          ? "Work is currently in progress. You can review the completion request once the worker submits it."
                          : booking.status === "DISPUTED"
                            ? "This booking is under dispute. Review the dispute details above."
                            : `This booking has been ${booking.status.toLowerCase()}.`}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default EmployerBookings;

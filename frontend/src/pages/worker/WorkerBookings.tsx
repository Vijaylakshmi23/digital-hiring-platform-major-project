import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../../services/api";
import { useNavigate } from "react-router-dom";
import {
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  RefreshCw,
  AlertCircle,
  Loader2,
  Building2,
  CreditCard,
  PlayCircle,
  ClipboardCheck,
  ShieldAlert,
  FileText,
} from "lucide-react";
import ReviewForm from "../../components/ReviewForm";

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
  status: string;
  disputeReason: string | null;
  disputeRaisedAt: string | null;
}

interface Payment {
  id: number;
  paymentType: "ADVANCE" | "FINAL";
  status: "CREATED" | "PAID" | "FAILED" | "REFUNDED";
  amount: number;
  currency: string;
  createdAt: string;
  paidAt: string | null;
}

type FilterStatus =
  | "ALL"
  | "REQUESTED"
  | "ACCEPTED"
  | "IN_PROGRESS"
  | "COMPLETION_REQUESTED"
  | "COMPLETED"
  | "DISPUTED"
  | "CANCELLED"
  | "REJECTED";

const API_URL = API_BASE_URL;

function formatDate(date: string) {
  if (!date) return "Not available";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Not available";
  }

  return parsedDate.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function WorkerBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [paymentsByBooking, setPaymentsByBooking] = useState<
    Record<number, Payment[]>
  >({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] =
    useState<FilterStatus>("ALL");

  const [actionLoading, setActionLoading] = useState<
    Record<number, string>
  >({});
  const [actionMessages, setActionMessages] = useState<
    Record<number, { type: "success" | "error"; message: string }>
  >({});

  const navigate = useNavigate();

  const fetchBookings = useCallback(
    async (isRefresh = false) => {
      const token = localStorage.getItem("token");

      if (!token) {
        setLoading(false);
        navigate("/login");
        return;
      }

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        const response = await axios.get<Booking[]>(
          `${API_URL}/api/bookings/my`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const bookingData = Array.isArray(response.data)
          ? response.data
          : [];

        setBookings(bookingData);

        const paymentResults = await Promise.all(
          bookingData.map(async (booking) => {
            try {
              const paymentResponse = await axios.get<Payment[]>(
                `${API_URL}/api/payments/booking/${booking.id}`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              return [
                booking.id,
                Array.isArray(paymentResponse.data)
                  ? paymentResponse.data
                  : [],
              ] as const;
            } catch (err) {
              console.error(
                `Unable to fetch payments for booking ${booking.id}:`,
                err
              );

              return [booking.id, []] as const;
            }
          })
        );

        setPaymentsByBooking(
          Object.fromEntries(paymentResults)
        );
      } catch (err) {
        console.error("Error fetching bookings:", err);
        setError("Unable to load your bookings. Please try again.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [navigate]
  );

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const getPayment = (
    bookingId: number,
    paymentType: "ADVANCE" | "FINAL"
  ) => {
    return paymentsByBooking[bookingId]?.find(
      (payment) => payment.paymentType === paymentType
    );
  };

  const isAdvancePaid = (bookingId: number) => {
    return (
      paymentsByBooking[bookingId]?.some(
        (payment) =>
          payment.paymentType === "ADVANCE" &&
          payment.status === "PAID"
      ) ?? false
    );
  };

  const performBookingAction = async (
    bookingId: number,
    action: "START" | "COMPLETION"
  ) => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    const confirmation =
      action === "START"
        ? "Are you ready to start this work?"
        : "Are you sure you have completed this work?";

    if (!window.confirm(confirmation)) {
      return;
    }

    setActionLoading((previous) => ({
      ...previous,
      [bookingId]: action,
    }));

    setActionMessages((previous) => {
      const updated = { ...previous };
      delete updated[bookingId];
      return updated;
    });

    try {
      if (action === "START") {
        await axios.patch(
          `${API_URL}/api/bookings/${bookingId}/status`,
          { status: "IN_PROGRESS" },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        await axios.post(
          `${API_URL}/api/bookings/${bookingId}/completion-request`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      await fetchBookings(true);

      setActionMessages((previous) => ({
        ...previous,
        [bookingId]: {
          type: "success",
          message:
            action === "START"
              ? "Work started successfully!"
              : "Completion request submitted successfully!",
        },
      }));
    } catch (err) {
      console.error("Booking action failed:", err);

      setActionMessages((previous) => ({
        ...previous,
        [bookingId]: {
          type: "error",
          message:
            action === "START"
              ? "Unable to start work. Please check the payment and schedule."
              : "Unable to submit the completion request. Please try again.",
        },
      }));
    } finally {
      setActionLoading((previous) => {
        const updated = { ...previous };
        delete updated[bookingId];
        return updated;
      });
    }
  };

  const getStatusDetails = (status: string) => {
    switch (status) {
      case "REQUESTED":
        return {
          label: "Requested",
          style: "bg-amber-100 text-amber-700",
          icon: <Clock size={15} />,
        };

      case "ACCEPTED":
        return {
          label: "Accepted",
          style: "bg-green-100 text-green-700",
          icon: <CheckCircle2 size={15} />,
        };

      case "IN_PROGRESS":
        return {
          label: "In Progress",
          style: "bg-blue-100 text-blue-700",
          icon: <PlayCircle size={15} />,
        };

      case "COMPLETION_REQUESTED":
        return {
          label: "Completion Requested",
          style: "bg-orange-100 text-orange-700",
          icon: <ClipboardCheck size={15} />,
        };

      case "COMPLETED":
        return {
          label: "Completed",
          style: "bg-purple-100 text-purple-700",
          icon: <CheckCircle2 size={15} />,
        };

      case "DISPUTED":
        return {
          label: "Disputed",
          style: "bg-red-100 text-red-700",
          icon: <ShieldAlert size={15} />,
        };

      case "REJECTED":
        return {
          label: "Rejected",
          style: "bg-red-100 text-red-700",
          icon: <XCircle size={15} />,
        };

      case "CANCELLED":
        return {
          label: "Cancelled",
          style: "bg-gray-200 text-gray-700",
          icon: <XCircle size={15} />,
        };

      default:
        return {
          label: status.replace(/_/g, " "),
          style: "bg-gray-100 text-gray-700",
          icon: <Clock size={15} />,
        };
    }
  };

  const counts = useMemo(() => {
    const count = (status: string) =>
      bookings.filter((booking) => booking.status === status).length;

    return {
      total: bookings.length,
      active: count("IN_PROGRESS"),
      accepted: count("ACCEPTED"),
      completed: count("COMPLETED"),
      pending: count("REQUESTED"),
    };
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const searchText = search.toLowerCase().trim();

      const matchesSearch =
        !searchText ||
        booking.jobTitle?.toLowerCase().includes(searchText) ||
        booking.companyName?.toLowerCase().includes(searchText) ||
        String(booking.id).includes(searchText) ||
        String(booking.jobId).includes(searchText);

      const matchesFilter =
        activeFilter === "ALL" ||
        booking.status === activeFilter;

      return matchesSearch && matchesFilter;
    });
  }, [bookings, search, activeFilter]);

  const filterOptions: {
    label: string;
    value: FilterStatus;
  }[] = [
    { label: "All", value: "ALL" },
    { label: "Requested", value: "REQUESTED" },
    { label: "Accepted", value: "ACCEPTED" },
    { label: "In Progress", value: "IN_PROGRESS" },
    { label: "Completion Requested", value: "COMPLETION_REQUESTED" },
    { label: "Completed", value: "COMPLETED" },
    { label: "Disputed", value: "DISPUTED" },
    { label: "Cancelled", value: "CANCELLED" },
    { label: "Rejected", value: "REJECTED" },
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-gray-50">
        <Loader2 className="h-9 w-9 animate-spin text-blue-600" />
        <p className="font-medium text-gray-600">
          Loading your bookings...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-10">
        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-700">
              <BriefcaseBusiness size={18} />
              Worker Dashboard
            </div>

            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              My Bookings
            </h1>

            <p className="mt-2 text-sm text-gray-600 sm:text-base">
              Track your work assignments, schedules and payments.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate("/worker/dashboard")}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
            >
              Dashboard
            </button>

            <button
              onClick={() => fetchBookings(true)}
              disabled={refreshing}
              className="flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:opacity-60"
            >
              <RefreshCw
                size={16}
                className={refreshing ? "animate-spin" : ""}
              />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <SummaryCard
            title="Total Bookings"
            count={counts.total}
            icon={<BriefcaseBusiness size={21} />}
            color="blue"
          />

          <SummaryCard
            title="Requested"
            count={counts.pending}
            icon={<Clock size={21} />}
            color="amber"
          />

          <SummaryCard
            title="Accepted"
            count={counts.accepted}
            icon={<CheckCircle2 size={21} />}
            color="green"
          />

          <SummaryCard
            title="In Progress"
            count={counts.active}
            icon={<PlayCircle size={21} />}
            color="indigo"
          />

          <SummaryCard
            title="Completed"
            count={counts.completed}
            icon={<ClipboardCheck size={21} />}
            color="purple"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-2 text-sm text-red-700">
              <AlertCircle size={19} className="mt-0.5 shrink-0" />
              <p>{error}</p>
            </div>

            <button
              onClick={() => fetchBookings(true)}
              disabled={refreshing}
              className="self-start rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50 sm:self-auto"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Search and Filters */}
        {bookings.length > 0 && (
          <section className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="relative">
              <Search
                size={19}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by job title, company or booking ID..."
                className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {filterOptions.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setActiveFilter(filter.value)}
                  className={`rounded-lg px-3 py-2 text-xs font-semibold transition sm:text-sm ${
                    activeFilter === filter.value
                      ? "bg-blue-700 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {bookings.length === 0 && !error && (
          <div className="rounded-2xl border border-gray-200 bg-white px-6 py-14 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
              <BriefcaseBusiness
                size={30}
                className="text-blue-600"
              />
            </div>

            <h2 className="mt-5 text-xl font-bold text-gray-900">
              No bookings yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              Your confirmed work assignments will appear here.
              Explore available jobs to find your next opportunity.
            </p>

            <button
              onClick={() => navigate("/jobs")}
              className="mt-6 rounded-lg bg-blue-700 px-6 py-3 font-semibold text-white transition hover:bg-blue-800"
            >
              Find Jobs
            </button>
          </div>
        )}

        {/* Booking List */}
        {bookings.length > 0 && (
          <section>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-bold text-gray-900">
                Your Work Assignments
              </h2>

              <p className="text-sm text-gray-500">
                Showing {filteredBookings.length} of {bookings.length}
              </p>
            </div>

            {filteredBookings.length === 0 ? (
              <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
                <Search className="mx-auto h-9 w-9 text-gray-400" />

                <h3 className="mt-4 font-semibold text-gray-900">
                  No matching bookings
                </h3>

                <p className="mt-2 text-sm text-gray-500">
                  Try changing your search or status filter.
                </p>

                <button
                  onClick={() => {
                    setSearch("");
                    setActiveFilter("ALL");
                  }}
                  className="mt-4 font-semibold text-blue-700 hover:underline"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredBookings.map((booking) => {
                  const status = getStatusDetails(booking.status);
                  const advancePayment = getPayment(booking.id, "ADVANCE");
                  const finalPayment = getPayment(booking.id, "FINAL");

                  const advancePaid = isAdvancePaid(booking.id);
                  const scheduledStart = new Date(booking.startDateTime);
                  const validStartDate = !Number.isNaN(
                    scheduledStart.getTime()
                  );

                  const canStart =
                    booking.status === "ACCEPTED" &&
                    advancePaid &&
                    validStartDate &&
                    new Date() >= scheduledStart;

                  const action = actionLoading[booking.id];
                  const actionMessage = actionMessages[booking.id];

                  return (
                    <article
                      key={booking.id}
                      className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
                    >
                      <div className="p-5 sm:p-6">
                        {/* Booking Header */}
                        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-blue-700">
                              <BriefcaseBusiness size={15} />
                              Work Assignment
                            </div>

                            <h3 className="mt-2 break-words text-lg font-bold text-gray-900 sm:text-xl">
                              {booking.jobTitle || "Untitled Job"}
                            </h3>

                            <p className="mt-1 text-xs text-gray-500">
                              Booking #{booking.id}
                              {" · "}
                              Job #{booking.jobId}
                            </p>
                          </div>

                          <span
                            className={`inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${status.style}`}
                          >
                            {status.icon}
                            {status.label}
                          </span>
                        </div>

                        {/* Employer Details */}
                        <div className="mt-6 grid gap-3 sm:grid-cols-2">
                          <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-4">
                            <Building2
                              size={19}
                              className="mt-0.5 text-blue-600"
                            />

                            <div>
                              <p className="text-xs text-gray-500">
                                Company / Employer
                              </p>
                              <p className="mt-1 font-semibold text-gray-900">
                                {booking.companyName || "Not provided"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-4">
                            <BriefcaseBusiness
                              size={19}
                              className="mt-0.5 text-blue-600"
                            />

                            <div>
                              <p className="text-xs text-gray-500">
                                Employer ID
                              </p>
                              <p className="mt-1 font-semibold text-gray-900">
                                {booking.employerId}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Schedule */}
                        <div className="mt-6 rounded-xl border border-gray-200 p-4 sm:p-5">
                          <div className="flex items-center gap-2">
                            <CalendarDays
                              size={19}
                              className="text-blue-600"
                            />
                            <h4 className="font-bold text-gray-900">
                              Booking Schedule
                            </h4>
                          </div>

                          <div className="mt-4 grid gap-4 sm:grid-cols-2">
                            <div>
                              <p className="text-xs font-medium text-gray-500">
                                Scheduled Start
                              </p>
                              <p className="mt-1 text-sm font-semibold text-gray-900">
                                {formatDate(booking.startDateTime)}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs font-medium text-gray-500">
                                Scheduled End
                              </p>
                              <p className="mt-1 text-sm font-semibold text-gray-900">
                                {formatDate(booking.endDateTime)}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Payment Details */}
                        <div className="mt-6 rounded-xl border border-gray-200 p-4 sm:p-5">
                          <div className="flex items-center gap-2">
                            <CreditCard
                              size={19}
                              className="text-blue-600"
                            />
                            <h4 className="font-bold text-gray-900">
                              Payment Details
                            </h4>
                          </div>

                          <p className="mt-1 text-xs text-gray-500">
                            Track your advance and final payment status.
                          </p>

                          <div className="mt-4 divide-y divide-gray-100">
                            {(
                              [
                                {
                                  type: "ADVANCE",
                                  title: "Advance Payment",
                                  percentage: "20%",
                                  payment: advancePayment,
                                },
                                {
                                  type: "FINAL",
                                  title: "Final Payment",
                                  percentage: "80%",
                                  payment: finalPayment,
                                },
                              ] as const
                            ).map((item) => (
                              <div
                                key={item.type}
                                className="flex flex-col justify-between gap-3 py-4 sm:flex-row sm:items-center"
                              >
                                <div>
                                  <p className="font-semibold text-gray-800">
                                    {item.title}
                                    <span className="ml-2 text-xs font-medium text-gray-500">
                                      ({item.percentage})
                                    </span>
                                  </p>

                                  <p className="mt-1 text-sm text-gray-500">
                                    {item.payment
                                      ? `${item.payment.currency} ${Number(
                                          item.payment.amount
                                        ).toLocaleString("en-IN")}`
                                      : "Payment not initiated yet"}
                                  </p>
                                </div>

                                <PaymentBadge
                                  status={
                                    item.payment?.status || "NOT INITIATED"
                                  }
                                />
                              </div>
                            ))}
                          </div>

                          {!advancePaid &&
                            booking.status === "ACCEPTED" && (
                              <div className="mt-3 flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                                <AlertCircle
                                  size={18}
                                  className="mt-0.5 shrink-0"
                                />
                                <p>
                                  Advance payment must be successfully
                                  completed before you can start work.
                                </p>
                              </div>
                            )}
                        </div>

                        {/* Dispute Details */}
                        {booking.status === "DISPUTED" && (
                          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 sm:p-5">
                            <div className="flex items-center gap-2 text-red-800">
                              <ShieldAlert size={20} />
                              <h4 className="font-bold">
                                Dispute Details
                              </h4>
                            </div>

                            <p className="mt-3 text-sm leading-6 text-gray-700">
                              <strong>Reason:</strong>{" "}
                              {booking.disputeReason ||
                                "No reason provided"}
                            </p>

                            {booking.disputeRaisedAt && (
                              <p className="mt-2 text-sm text-gray-600">
                                <strong>Raised on:</strong>{" "}
                                {formatDate(booking.disputeRaisedAt)}
                              </p>
                            )}

                            <p className="mt-3 text-sm font-medium text-red-700">
                              The employer has raised a dispute regarding
                              this booking.
                            </p>
                          </div>
                        )}

                        {/* Action Feedback */}
                        {actionMessage && (
                          <div
                            className={`mt-5 flex items-start gap-2 rounded-lg border p-3 text-sm ${
                              actionMessage.type === "success"
                                ? "border-green-200 bg-green-50 text-green-700"
                                : "border-red-200 bg-red-50 text-red-700"
                            }`}
                          >
                            {actionMessage.type === "success" ? (
                              <CheckCircle2 size={18} className="shrink-0" />
                            ) : (
                              <AlertCircle size={18} className="shrink-0" />
                            )}
                            <p>{actionMessage.message}</p>
                          </div>
                        )}

                        {/* Accepted: Start Work */}
                        {booking.status === "ACCEPTED" && (
                          <div className="mt-6 rounded-xl border border-green-200 bg-green-50/50 p-4 sm:p-5">
                            <h4 className="font-bold text-gray-900">
                              Ready to Start?
                            </h4>

                            <p className="mt-1 text-sm leading-6 text-gray-600">
                              You can start your assignment after the
                              advance payment is paid and the scheduled
                              start time has arrived.
                            </p>

                            {!validStartDate && (
                              <p className="mt-3 text-sm text-red-600">
                                The scheduled start date is invalid.
                                Please contact the employer.
                              </p>
                            )}

                            {validStartDate &&
                              new Date() < scheduledStart && (
                                <p className="mt-3 text-sm text-amber-700">
                                  Your scheduled start time is{" "}
                                  {formatDate(booking.startDateTime)}.
                                </p>
                              )}

                            <button
                              onClick={() =>
                                performBookingAction(booking.id, "START")
                              }
                              disabled={!canStart || !!action}
                              className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-gray-400 sm:w-auto"
                            >
                              {action === "START" ? (
                                <>
                                  <Loader2
                                    size={18}
                                    className="animate-spin"
                                  />
                                  Starting Work...
                                </>
                              ) : (
                                <>
                                  <PlayCircle size={18} />
                                  Start Work
                                </>
                              )}
                            </button>
                          </div>
                        )}

                        {/* In Progress: Request Completion */}
                        {booking.status === "IN_PROGRESS" && (
                          <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50/50 p-4 sm:p-5">
                            <div className="flex items-center gap-2 text-blue-800">
                              <PlayCircle size={20} />
                              <h4 className="font-bold">
                                Work in Progress
                              </h4>
                            </div>

                            <p className="mt-2 text-sm leading-6 text-gray-600">
                              Once you have finished the assigned work,
                              submit a completion request for employer
                              approval.
                            </p>

                            <button
                              onClick={() =>
                                performBookingAction(
                                  booking.id,
                                  "COMPLETION"
                                )
                              }
                              disabled={!!action}
                              className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                            >
                              {action === "COMPLETION" ? (
                                <>
                                  <Loader2
                                    size={18}
                                    className="animate-spin"
                                  />
                                  Submitting Request...
                                </>
                              ) : (
                                <>
                                  <ClipboardCheck size={18} />
                                  Request Completion
                                </>
                              )}
                            </button>
                          </div>
                        )}

                        {/* Completion Requested */}
                        {booking.status === "COMPLETION_REQUESTED" && (
                          <div className="mt-6 flex items-start gap-3 rounded-xl border border-orange-200 bg-orange-50 p-4">
                            <Clock
                              size={21}
                              className="mt-0.5 shrink-0 text-orange-600"
                            />

                            <div>
                              <p className="font-bold text-orange-800">
                                Completion Request Submitted
                              </p>
                              <p className="mt-1 text-sm leading-6 text-orange-700">
                                Your work completion request has been
                                submitted. Waiting for employer approval.
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Completed */}
                        {booking.status === "COMPLETED" && (
                          <div className="mt-6 rounded-xl border border-green-200 bg-green-50/50 p-4 sm:p-5">
                            <div className="flex items-center gap-2 text-green-800">
                              <CheckCircle2 size={21} />
                              <h4 className="font-bold">
                                Booking Completed
                              </h4>
                            </div>

                            <p className="mt-2 text-sm text-green-700">
                              This booking has been completed. Share your
                              experience by reviewing the employer.
                            </p>

                            <div className="mt-5 rounded-lg border border-gray-200 bg-white p-4">
                              <div className="mb-4 flex items-center gap-2">
                                <FileText
                                  size={18}
                                  className="text-blue-600"
                                />
                                <h5 className="font-semibold text-gray-900">
                                  Rate Your Experience
                                </h5>
                              </div>

                              <ReviewForm
                                bookingId={booking.id}
                                revieweeName={booking.companyName}
                                onReviewSubmitted={() =>
                                  fetchBookings(true)
                                }
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

interface SummaryCardProps {
  title: string;
  count: number;
  icon: React.ReactNode;
  color: "blue" | "amber" | "green" | "indigo" | "purple";
}

function SummaryCard({
  title,
  count,
  icon,
  color,
}: SummaryCardProps) {
  const colors = {
    blue: "bg-blue-50 text-blue-700",
    amber: "bg-amber-50 text-amber-700",
    green: "bg-green-50 text-green-700",
    indigo: "bg-indigo-50 text-indigo-700",
    purple: "bg-purple-50 text-purple-700",
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-gray-500">
          {title}
        </p>

        <div className={`rounded-lg p-2.5 ${colors[color]}`}>
          {icon}
        </div>
      </div>

      <p className="mt-3 text-3xl font-bold text-gray-900">
        {count}
      </p>
    </div>
  );
}

function PaymentBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PAID: "bg-green-100 text-green-700",
    CREATED: "bg-amber-100 text-amber-700",
    FAILED: "bg-red-100 text-red-700",
    REFUNDED: "bg-purple-100 text-purple-700",
    "NOT INITIATED": "bg-gray-100 text-gray-600",
  };

  return (
    <span
      className={`inline-flex w-fit items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold ${
        styles[status] || "bg-gray-100 text-gray-700"
      }`}
    >
      {status === "PAID" && <CheckCircle2 size={14} />}
      {status === "FAILED" && <XCircle size={14} />}
      {status === "CREATED" && <Clock size={14} />}
      {status}
    </span>
  );
}

export default WorkerBookings;

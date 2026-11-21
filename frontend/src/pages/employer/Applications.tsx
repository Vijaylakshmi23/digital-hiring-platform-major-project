import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../../services/api";
import {
  Search,
  RefreshCw,
  BriefcaseBusiness,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  CalendarDays,
  UserRound,
  CalendarCheck,
} from "lucide-react";

interface JobApplication {
  id: number;
  jobId: number;
  jobTitle: string;
  workerId: number;
  workerName: string;
  workerProfession?: string | null;
  message: string;
  status: string;
  appliedAt: string;
}

interface AvailabilityDay {
  date: string;
  status: "AVAILABLE" | "UNAVAILABLE" | "BOOKED";
}

interface Booking {
  id: number;
  jobId: number;
  workerId: number;
  startDateTime: string | null;
  endDateTime: string | null;
  status: string;
}

type ApplicationFilter = "ALL" | "PENDING" | "ACCEPTED" | "REJECTED";

const API_URL = API_BASE_URL;

function Applications() {
  const [bookingApplicationId, setBookingApplicationId] = useState<number | null>(null);
  const [bookingDate, setBookingDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");

  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<ApplicationFilter>("ALL");

  const [bookingAvailability, setBookingAvailability] = useState<AvailabilityDay[]>([]);
  const [bookingCalendarDate, setBookingCalendarDate] = useState(new Date());
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState("");

  const fetchApplications = async () => {
    try {
      setError("");
      setRefreshing(true);

      const token = localStorage.getItem("token");

      if (!token) {
        window.location.href = "/login";
        return;
      }

      const response = await axios.get<JobApplication[]>(
        `${API_URL}/api/applications/employer`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setApplications(response.data);
    } catch (err) {
      console.error(err);
      setError("Unable to load applications. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get<Booking[]>(
        `${API_URL}/api/bookings/my`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setBookings(response.data);
    } catch (err) {
      console.error("Unable to load bookings:", err);
    }
  };

  useEffect(() => {
    fetchApplications();
    fetchBookings();
  }, []);

  useEffect(() => {
    const fetchBookingAvailability = async () => {
      if (bookingApplicationId === null) return;

      const selectedApplication = applications.find(
        (application) => application.id === bookingApplicationId
      );

      if (!selectedApplication) return;

      try {
        setAvailabilityLoading(true);
        setAvailabilityError("");

        const year = bookingCalendarDate.getFullYear();
        const month = bookingCalendarDate.getMonth();

        const startDate = `${year}-${String(month + 1).padStart(2, "0")}-01`;
        const lastDay = new Date(year, month + 1, 0).getDate();
        const endDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

        const token = localStorage.getItem("token");

        const response = await axios.get<AvailabilityDay[]>(
          `${API_URL}/api/availability/worker/${selectedApplication.workerId}`,
          {
            params: { startDate, endDate },
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setBookingAvailability(response.data);
      } catch (err: any) {
        console.error(err);
        setAvailabilityError(
          err.response?.data?.message || "Unable to load worker availability."
        );
      } finally {
        setAvailabilityLoading(false);
      }
    };

    fetchBookingAvailability();
  }, [bookingApplicationId, applications, bookingCalendarDate]);

  const calendarYear = bookingCalendarDate.getFullYear();
  const calendarMonth = bookingCalendarDate.getMonth();

  const firstDayOfMonth = new Date(calendarYear, calendarMonth, 1).getDay();
  const totalDaysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();

  const today = new Date();
  const todayString = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  const calendarDays = [
    ...Array(firstDayOfMonth).fill(null),
    ...Array.from({ length: totalDaysInMonth }, (_, i) => i + 1),
  ];

  const getBookingAvailabilityStatus = (day: number) => {
    const dateString = [
      calendarYear,
      String(calendarMonth + 1).padStart(2, "0"),
      String(day).padStart(2, "0"),
    ].join("-");

    return (
      bookingAvailability.find((item) => item.date === dateString)?.status ??
      "AVAILABLE"
    );
  };

  const previousBookingMonth = () => {
    setBookingCalendarDate(new Date(calendarYear, calendarMonth - 1, 1));
    setBookingDate("");
  };

  const nextBookingMonth = () => {
    setBookingCalendarDate(new Date(calendarYear, calendarMonth + 1, 1));
    setBookingDate("");
  };

  const updateStatus = async (
    applicationId: number,
    status: "ACCEPTED" | "REJECTED"
  ) => {
    try {
      const token = localStorage.getItem("token");

      await axios.patch(
        `${API_URL}/api/applications/${applicationId}/status`,
        { status },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      await fetchApplications();
    } catch (err) {
      console.error(err);
      alert("Unable to update application status.");
    }
  };

  const createBooking = async (
    applicationId: number,
    startDateTime: string,
    endDateTime: string
  ) => {
    try {
      const token = localStorage.getItem("token");

      await axios.post(
        `${API_URL}/api/bookings/applications/${applicationId}`,
        { startDateTime, endDateTime },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Booking created successfully!");

      await fetchApplications();
      await fetchBookings();

      setBookingApplicationId(null);
      setBookingDate("");
    } catch (err: any) {
      console.error(err);
      alert(
        err.response?.data?.message ||
          "Unable to create booking. Please check worker availability."
      );
    }
  };

  const getActiveBooking = (application: JobApplication) => {
    const activeStatuses = [
      "REQUESTED",
      "ACCEPTED",
      "IN_PROGRESS",
      "COMPLETION_REQUESTED",
      "DISPUTED",
    ];

    return bookings.find(
      (booking) =>
        booking.jobId === application.jobId &&
        booking.workerId === application.workerId &&
        activeStatuses.includes(booking.status)
    );
  };

  const counts = useMemo(
    () => ({
      total: applications.length,
      pending: applications.filter((a) => a.status === "PENDING").length,
      accepted: applications.filter((a) => a.status === "ACCEPTED").length,
      rejected: applications.filter((a) => a.status === "REJECTED").length,
    }),
    [applications]
  );

  const filteredApplications = useMemo(() => {
    return applications.filter((application) => {
      const search = searchTerm.toLowerCase();

      const matchesSearch =
        application.workerName?.toLowerCase().includes(search) ||
        application.jobTitle?.toLowerCase().includes(search) ||
        String(application.id).includes(search);

      const matchesFilter =
        filter === "ALL" || application.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [applications, searchTerm, filter]);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return "border-green-200 bg-green-50 text-green-700";
      case "REJECTED":
        return "border-red-200 bg-red-50 text-red-700";
      default:
        return "border-amber-200 bg-amber-50 text-amber-700";
    }
  };

  const summaryCards = [
    {
      label: "Total Applications",
      value: counts.total,
      icon: <BriefcaseBusiness size={21} />,
      style: "bg-blue-50 text-blue-700",
    },
    {
      label: "Pending",
      value: counts.pending,
      icon: <Clock size={21} />,
      style: "bg-amber-50 text-amber-700",
    },
    {
      label: "Accepted",
      value: counts.accepted,
      icon: <CheckCircle2 size={21} />,
      style: "bg-green-50 text-green-700",
    },
    {
      label: "Rejected",
      value: counts.rejected,
      icon: <XCircle size={21} />,
      style: "bg-red-50 text-red-700",
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-700" />
          <p className="mt-4 text-sm text-slate-500">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:py-10">
      <main className="mx-auto max-w-6xl">
        {/* Heading */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-700">
              <Users size={17} />
              EMPLOYER PORTAL
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Job Applications
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Review workers, evaluate applications and schedule successful candidates.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              fetchApplications();
              fetchBookings();
            }}
            disabled={refreshing}
            className="flex items-center justify-center gap-2 self-start rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-60 sm:self-auto"
          >
            <RefreshCw size={17} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* Summary */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {summaryCards.map((card) => (
            <div
              key={card.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-slate-500">{card.label}</p>
                <div className={`rounded-xl p-2.5 ${card.style}`}>
                  {card.icon}
                </div>
              </div>
              <p className="mt-3 text-3xl font-bold text-slate-900">{card.value}</p>
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-6 flex flex-col justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center">
            <p className="text-sm text-red-700">{error}</p>
            <button
              type="button"
              onClick={fetchApplications}
              className="text-sm font-bold text-red-700 underline"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Search and filters */}
        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="font-bold text-slate-800">Applications Received</h2>
              <p className="mt-1 text-sm text-slate-500">
                Find and review applications submitted by workers.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search worker or job..."
                  className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:w-64"
                />
              </div>

              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as ApplicationFilter)}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="ALL">All Applications</option>
                <option value="PENDING">Pending</option>
                <option value="ACCEPTED">Accepted</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>
        </section>

        {/* Empty states */}
        {applications.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
              <BriefcaseBusiness size={32} />
            </div>
            <h2 className="mt-5 text-xl font-bold text-slate-800">
              No applications yet
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Applications from workers will appear here when they apply to your jobs.
            </p>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
            <Search size={32} className="mx-auto text-slate-400" />
            <h2 className="mt-4 font-bold text-slate-800">
              No matching applications
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Try another search term or status filter.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setFilter("ALL");
              }}
              className="mt-4 text-sm font-semibold text-blue-700 hover:underline"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <p className="mb-4 text-sm text-slate-500">
              Showing <strong className="text-slate-800">{filteredApplications.length}</strong> of{" "}
              <strong className="text-slate-800">{applications.length}</strong> applications
            </p>

            <div className="space-y-5">
              {filteredApplications.map((application) => {
                const activeBooking = getActiveBooking(application);
                const isScheduling = bookingApplicationId === application.id;

                return (
                  <article
                    key={application.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6"
                  >
                    {/* Application heading */}
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                          Application #{application.id}
                        </p>
                        <h2 className="mt-1 break-words text-xl font-bold text-slate-900">
                          {application.jobTitle}
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                          Job ID: {application.jobId}
                        </p>
                      </div>

                      <span
                        className={`self-start rounded-full border px-3 py-1.5 text-xs font-bold ${getStatusStyle(application.status)}`}
                      >
                        {application.status}
                      </span>
                    </div>

                    {/* Worker information */}
                    <div className="mt-5 flex flex-wrap gap-4 rounded-xl bg-slate-50 p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                          <UserRound size={22} />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Applicant</p>
                          <p className="font-semibold text-slate-800">
                            {application.workerName}
                          </p>
                          <p className="mt-1 text-sm font-medium text-blue-700">
                            {application.workerProfession || "Profession not provided"}
                          </p>
                        </div>
                      </div>

                      <div className="sm:ml-auto">
                        <p className="text-xs text-slate-500">Worker ID</p>
                        <p className="mt-1 font-semibold text-slate-800">
                          #{application.workerId}
                        </p>
                      </div>
                    </div>

                    {/* Message */}
                    <div className="mt-5">
                      <h3 className="text-sm font-bold text-slate-800">
                        Application Message
                      </h3>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                        {application.message || "No message provided."}
                      </p>
                    </div>

                    <p className="mt-4 text-xs text-slate-400">
                      Applied on: {new Date(application.appliedAt).toLocaleString()}
                    </p>

                    {/* Pending actions */}
                    {application.status === "PENDING" && (
                      <div className="mt-5 flex flex-wrap gap-3 border-t border-slate-100 pt-5">
                        <button
                          type="button"
                          onClick={() => updateStatus(application.id, "ACCEPTED")}
                          className="flex items-center gap-2 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
                        >
                          <CheckCircle2 size={17} />
                          Accept Application
                        </button>

                        <button
                          type="button"
                          onClick={() => updateStatus(application.id, "REJECTED")}
                          className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                        >
                          <XCircle size={17} />
                          Reject
                        </button>
                      </div>
                    )}

                    {/* Accepted application */}
                    {application.status === "ACCEPTED" && (
                      <div className="mt-5 border-t border-slate-100 pt-5">
                        {activeBooking ? (
                          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                            <div className="flex items-center gap-2 font-bold text-amber-800">
                              <CalendarCheck size={19} />
                              Worker Already Booked
                            </div>

                            <p className="mt-2 text-sm text-slate-700">
                              An active booking exists for this worker and job.
                            </p>

                            <div className="mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
                              <p>
                                <strong>Start:</strong>{" "}
                                {activeBooking.startDateTime
                                  ? new Date(activeBooking.startDateTime).toLocaleString()
                                  : "Not scheduled"}
                              </p>
                              <p>
                                <strong>End:</strong>{" "}
                                {activeBooking.endDateTime
                                  ? new Date(activeBooking.endDateTime).toLocaleString()
                                  : "Not scheduled"}
                              </p>
                            </div>

                            <p className="mt-3 text-sm font-bold text-amber-800">
                              Booking Status: {activeBooking.status}
                            </p>
                          </div>
                        ) : isScheduling ? (
                          <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-4 sm:p-5">
                            <div className="mb-5">
                              <h3 className="font-bold text-slate-900">
                                Schedule Worker
                              </h3>
                              <p className="mt-1 text-sm text-slate-500">
                                Select an available date and working hours.
                              </p>
                            </div>

                            {/* Calendar legend */}
                            <div className="mb-4 flex flex-wrap gap-4 text-xs text-slate-600">
                              <span className="flex items-center gap-1.5">
                                <span className="h-3 w-3 rounded bg-green-500" />
                                Available
                              </span>
                              <span className="flex items-center gap-1.5">
                                <span className="h-3 w-3 rounded bg-red-500" />
                                Unavailable
                              </span>
                              <span className="flex items-center gap-1.5">
                                <span className="h-3 w-3 rounded bg-amber-400" />
                                Booked
                              </span>
                            </div>

                            {/* Availability calendar */}
                            <div className="rounded-xl border border-slate-200 bg-white p-3 sm:p-4">
                              <div className="mb-4 flex items-center justify-between">
                                <button
                                  type="button"
                                  onClick={previousBookingMonth}
                                  className="rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-100"
                                >
                                  &lt;
                                </button>

                                <h4 className="font-bold text-slate-800">
                                  {bookingCalendarDate.toLocaleString("default", {
                                    month: "long",
                                    year: "numeric",
                                  })}
                                </h4>

                                <button
                                  type="button"
                                  onClick={nextBookingMonth}
                                  className="rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-100"
                                >
                                  &gt;
                                </button>
                              </div>

                              <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-500 sm:gap-2">
                                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                                  (day) => (
                                    <div key={day} className="py-2">{day}</div>
                                  )
                                )}
                              </div>

                              {availabilityLoading ? (
                                <p className="py-8 text-center text-sm text-slate-500">
                                  Loading worker availability...
                                </p>
                              ) : availabilityError ? (
                                <p className="py-8 text-center text-sm text-red-600">
                                  {availabilityError}
                                </p>
                              ) : (
                                <div className="grid grid-cols-7 gap-1 sm:gap-2">
                                  {calendarDays.map((day, index) => {
                                    if (day === null) {
                                      return <div key={`empty-${index}`} />;
                                    }

                                    const dateString = [
                                      calendarYear,
                                      String(calendarMonth + 1).padStart(2, "0"),
                                      String(day).padStart(2, "0"),
                                    ].join("-");

                                    const status = getBookingAvailabilityStatus(day);
                                    const isPast = dateString < todayString;
                                    const isSelected = bookingDate === dateString;

                                    const disabled =
                                      isPast ||
                                      status !== "AVAILABLE" ||
                                      availabilityLoading;

                                    const colorClass =
                                      isSelected
                                        ? "bg-blue-700 text-white ring-2 ring-blue-200"
                                        : status === "UNAVAILABLE"
                                        ? "bg-red-500 text-white"
                                        : status === "BOOKED"
                                        ? "bg-amber-400 text-slate-900"
                                        : "bg-green-500 text-white";

                                    return (
                                      <button
                                        key={dateString}
                                        type="button"
                                        disabled={disabled}
                                        onClick={() => setBookingDate(dateString)}
                                        title={`${dateString} - ${status}`}
                                        className={`rounded-lg py-2 text-xs font-semibold transition sm:py-2.5 sm:text-sm ${colorClass} ${
                                          disabled
                                            ? "cursor-not-allowed opacity-50"
                                            : "hover:opacity-80"
                                        }`}
                                      >
                                        {day}
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>

                            {bookingDate && (
                              <p className="mt-3 text-sm font-semibold text-green-700">
                                Selected date: {bookingDate}
                              </p>
                            )}

                            {/* Time selection */}
                            <div className="mt-5 grid gap-4 sm:grid-cols-2">
                              <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                  Start Time
                                </label>
                                <input
                                  type="time"
                                  value={startTime}
                                  min={
                                    bookingDate === todayString
                                      ? `${String(new Date().getHours()).padStart(2, "0")}:${String(new Date().getMinutes()).padStart(2, "0")}`
                                      : undefined
                                  }
                                  onChange={(e) => setStartTime(e.target.value)}
                                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                              </div>

                              <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                  End Time
                                </label>
                                <input
                                  type="time"
                                  value={endTime}
                                  onChange={(e) => setEndTime(e.target.value)}
                                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                              </div>
                            </div>

                            <div className="mt-5 flex flex-wrap gap-3">
                              <button
                                type="button"
                                onClick={() => {
                                  if (!bookingDate) {
                                    alert("Please select a working date.");
                                    return;
                                  }

                                  const now = new Date();
                                  const selectedDateTime = new Date(
                                    `${bookingDate}T${startTime}:00`
                                  );

                                  if (selectedDateTime <= now) {
                                    alert("Please select a future start time.");
                                    return;
                                  }

                                  if (endTime <= startTime) {
                                    alert("End time must be after start time.");
                                    return;
                                  }

                                  createBooking(
                                    application.id,
                                    `${bookingDate}T${startTime}:00`,
                                    `${bookingDate}T${endTime}:00`
                                  );
                                }}
                                className="flex items-center gap-2 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
                              >
                                <CalendarCheck size={17} />
                                Confirm Booking
                              </button>

                              <button
                                type="button"
                                onClick={() => setBookingApplicationId(null)}
                                className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setBookingApplicationId(application.id);
                              setBookingDate("");
                              setStartTime("09:00");
                              setEndTime("17:00");
                            }}
                            className="flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"
                          >
                            <CalendarDays size={17} />
                            Create Booking
                          </button>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default Applications;

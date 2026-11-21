import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  Wallet,
  UserRound,
  Loader2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import axios from "axios";
import API_BASE_URL from "../../services/api";

import { getWorkerById } from "../../services/workerService";
import type { WorkerProfile } from "../../types/worker";

interface AvailabilityDay {
  date: string;
  status: "AVAILABLE" | "UNAVAILABLE" | "BOOKED";
}

export default function WorkerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [worker, setWorker] = useState<WorkerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [calendarDate, setCalendarDate] = useState(new Date());
  const [availabilityDays, setAvailabilityDays] = useState<AvailabilityDay[]>([]);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [calendarError, setCalendarError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  // Direct Hire Form
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [jobLocation, setJobLocation] = useState("");
  const [proposedWage, setProposedWage] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const [submittingOffer, setSubmittingOffer] = useState(false);
  const [offerError, setOfferError] = useState("");
  const [offerSuccess, setOfferSuccess] = useState("");

  const calendarYear = calendarDate.getFullYear();
  const calendarMonth = calendarDate.getMonth();

  const calendarStartDate = `${calendarYear}-${String(
    calendarMonth + 1
  ).padStart(2, "0")}-01`;

  const calendarEndDate = `${calendarYear}-${String(
    calendarMonth + 1
  ).padStart(2, "0")}-${new Date(
    calendarYear,
    calendarMonth + 1,
    0
  ).getDate()}`;

  // Fetch worker profile
  useEffect(() => {
    const fetchWorker = async () => {
      try {
        setLoading(true);
        setError("");

        if (!id || isNaN(Number(id))) {
          setError("Invalid worker ID.");
          return;
        }

        const data = await getWorkerById(Number(id));
        setWorker(data);
      } catch {
        setError("Unable to load worker details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchWorker();
  }, [id]);

  // Fetch worker availability
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!id || !worker) return;

      try {
        setCalendarLoading(true);
        setCalendarError("");

        const token = localStorage.getItem("token");

        const response = await axios.get(
          `${API_BASE_URL}/api/availability/worker/${id}`,
          {
            params: {
              startDate: calendarStartDate,
              endDate: calendarEndDate,
            },
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setAvailabilityDays(response.data);
      } catch (err: any) {
        setCalendarError(
          err.response?.data?.message ||
            "Unable to load worker availability."
        );
      } finally {
        setCalendarLoading(false);
      }
    };

    fetchAvailability();
  }, [id, worker, calendarStartDate, calendarEndDate, refreshKey]);

  const firstCalendarDay = new Date(
    calendarYear,
    calendarMonth,
    1
  ).getDay();

  const totalCalendarDays = new Date(
    calendarYear,
    calendarMonth + 1,
    0
  ).getDate();

  const getAvailabilityStatus = (date: string) =>
    availabilityDays.find((day) => day.date === date)?.status ?? "AVAILABLE";

  const previousCalendarMonth = () => {
    setCalendarDate(new Date(calendarYear, calendarMonth - 1, 1));
    setSelectedDate("");
  };

  const nextCalendarMonth = () => {
    setCalendarDate(new Date(calendarYear, calendarMonth + 1, 1));
    setSelectedDate("");
  };

  const goToCurrentMonth = () => {
    setCalendarDate(new Date());
    setSelectedDate("");
  };

  const sendDirectHireOffer = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setOfferError("");
    setOfferSuccess("");

    if (!id || !selectedDate) {
      setOfferError("Please select an available date.");
      return;
    }

    if (selectedDate < todayDateString) {
      setOfferError("You cannot book a worker for a previous date.");
      return;
    }

    if (
      !jobTitle.trim() ||
      !jobDescription.trim() ||
      !jobLocation.trim() ||
      !proposedWage ||
      !startTime ||
      !endTime
    ) {
      setOfferError("Please fill in all the fields.");
      return;
    }

    const wage = Number(proposedWage);

    if (!Number.isFinite(wage) || wage <= 0) {
      setOfferError("Please enter a valid proposed wage.");
      return;
    }

    const startDateTime = `${selectedDate}T${startTime}:00`;
    const endDateTime = `${selectedDate}T${endTime}:00`;

    const start = new Date(startDateTime);
    const end = new Date(endDateTime);

    if (start <= new Date()) {
      setOfferError("Please select a future start time.");
      return;
    }

    if (end <= start) {
      setOfferError("End time must be later than start time.");
      return;
    }

    try {
      setSubmittingOffer(true);

      const token = localStorage.getItem("token");

      await axios.post(
        `${API_BASE_URL}/api/direct-hire-requests`,
        {
          workerId: Number(id),
          title: jobTitle.trim(),
          description: jobDescription.trim(),
          location: jobLocation.trim(),
          proposedWage: wage,
          startDateTime,
          endDateTime,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setOfferSuccess(
        "Direct-hire offer sent successfully! The worker can now accept or reject your offer."
      );

      setJobTitle("");
      setJobDescription("");
      setJobLocation("");
      setProposedWage("");
      setStartTime("");
      setEndTime("");
    } catch (err: any) {
      console.error("Error sending direct-hire offer:", err);

      setOfferError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Unable to send the offer. Please try again."
      );
    } finally {
      setSubmittingOffer(false);
    }
  };

  const getStatusStyle = (status?: string) => {
    switch (status?.toUpperCase()) {
      case "AVAILABLE":
        return "bg-green-100 text-green-700 border-green-200";
      case "UNAVAILABLE":
        return "bg-red-100 text-red-700 border-red-200";
      case "BOOKED":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  const formatStatus = (status?: string) => {
    if (!status) return "Not specified";

    return status
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  const formatDate = (date: string) =>
    new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const today = new Date();
  const todayDateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const isToday = (dayNumber: number) =>
    calendarYear === today.getFullYear() &&
    calendarMonth === today.getMonth() &&
    dayNumber === today.getDate();

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-gray-50">
        <Loader2 className="h-9 w-9 animate-spin text-blue-600" />
        <p className="text-sm font-medium text-gray-500">
          Loading worker profile...
        </p>
      </div>
    );
  }

  if (error || !worker) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
            <AlertCircle className="h-7 w-7 text-red-500" />
          </div>

          <h2 className="text-xl font-bold text-gray-800">
            Unable to load profile
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            {error || "Worker not found."}
          </p>

          <button
            onClick={() => navigate("/employer/workers")}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <ArrowLeft size={17} />
            Back to Workers
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-blue-700">
              LabourConnect
            </h1>
            <p className="text-xs text-gray-500">
              Employer Portal
            </p>
          </div>

          <button
            onClick={() => navigate("/employer/workers")}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
          >
            <ArrowLeft size={17} />
            <span className="hidden sm:inline">Back to Workers</span>
            <span className="sm:hidden">Back</span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-7 px-4 py-7 sm:px-6 sm:py-9">
        {/* Page heading */}
        <div>
          <p className="text-sm font-medium text-blue-600">
            Worker Directory
          </p>
          <h2 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">
            Worker Profile
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            View professional details, skills and work availability.
          </p>
        </div>

        {/* Profile Header */}
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="h-2 bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-400" />

          <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:p-8">
            <div className="flex shrink-0 justify-center sm:justify-start">
              {worker.profileImageUrl ? (
                <img
                  src={worker.profileImageUrl}
                  alt={worker.name}
                  className="h-28 w-28 rounded-2xl border-4 border-white object-cover shadow-md sm:h-32 sm:w-32"
                />
              ) : (
                <div className="flex h-28 w-28 items-center justify-center rounded-2xl bg-blue-100 text-4xl font-bold text-blue-700 sm:h-32 sm:w-32">
                  {worker.name?.charAt(0).toUpperCase() || "W"}
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1 text-center sm:text-left">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <h3 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                  {worker.name}
                </h3>

                <span
                  className={`mx-auto inline-flex w-fit items-center rounded-full border px-3 py-1 text-xs font-semibold sm:mx-0 ${getStatusStyle(
                    worker.availabilityStatus ?? undefined
                  )}`}
                >
                  {formatStatus(worker.availabilityStatus ?? undefined)}
                </span>
              </div>

              <p className="mt-2 text-lg font-semibold text-blue-600">
                {worker.profession || "Profession not specified"}
              </p>

              <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm text-gray-500 sm:justify-start">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin size={16} className="text-gray-400" />
                  {worker.location || "Location not specified"}
                </span>

                <span className="inline-flex items-center gap-1.5">
                  <Briefcase size={16} className="text-gray-400" />
                  {worker.experience ?? 0} years experience
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Professional Information */}
        <section>
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-900">
              Professional Information
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Important details about this worker.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <InfoCard
              icon={<Briefcase size={21} />}
              label="Experience"
              value={`${worker.experience ?? 0} years`}
              description="Professional experience"
            />

            <InfoCard
              icon={<MapPin size={21} />}
              label="Location"
              value={worker.location || "Not specified"}
              description="Worker's location"
            />

            <InfoCard
              icon={<Wallet size={21} />}
              label="Expected Wage"
              value={
                worker.expectedWage != null
                  ? `₹${worker.expectedWage}`
                  : "Not specified"
              }
              description={
                worker.expectedWage != null
                  ? `Per ${worker.wageType || "N/A"}`
                  : "Wage preference"
              }
            />

            <InfoCard
              icon={<UserRound size={21} />}
              label="Availability"
              value={formatStatus(worker.availabilityStatus ?? undefined)}
              description="Current availability status"
            />
          </div>
        </section>

        {/* Skills */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
              <Briefcase size={21} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Skills & Expertise</h3>
              <p className="text-sm text-gray-500">
                Work skills and areas of expertise.
              </p>
            </div>
          </div>

          {worker.skills?.trim() ? (
            <p className="whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-sm leading-7 text-gray-700">
              {worker.skills}
            </p>
          ) : (
            <div className="rounded-xl bg-slate-50 px-4 py-6 text-center">
              <p className="text-sm text-gray-500">
                No skills have been added yet.
              </p>
            </div>
          )}
        </section>

        {/* About Worker */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
              <UserRound size={21} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">About Worker</h3>
              <p className="text-sm text-gray-500">
                Additional information provided by the worker.
              </p>
            </div>
          </div>

          <p className="whitespace-pre-wrap text-sm leading-7 text-gray-600">
            {worker.description || "No description has been added yet."}
          </p>
        </section>

        {/* Availability Calendar */}
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                <CalendarDays size={24} />
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Worker Availability
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Check the worker's available dates before planning a booking.
                </p>
              </div>
            </div>

            <button
              onClick={() => setRefreshKey((prev) => prev + 1)}
              disabled={calendarLoading}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                size={15}
                className={calendarLoading ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>

          {/* Calendar Legend */}
          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-3 rounded-xl bg-slate-50 p-4 text-sm">
            <LegendItem color="bg-green-500" label="Available" />
            <LegendItem color="bg-red-500" label="Unavailable" />
            <LegendItem color="bg-yellow-400" label="Booked" />
          </div>

          {/* Month Navigation */}
          <div className="mb-5 mt-6 flex items-center justify-between">
            <button
              type="button"
              onClick={previousCalendarMonth}
              aria-label="Previous month"
              className="rounded-lg border border-gray-200 p-2 text-gray-600 transition hover:bg-gray-50"
            >
              <ChevronLeft size={20} />
            </button>

            <div className="text-center">
              <h4 className="font-bold text-gray-900">
                {calendarDate.toLocaleString("en-IN", {
                  month: "long",
                  year: "numeric",
                })}
              </h4>

              <button
                type="button"
                onClick={goToCurrentMonth}
                className="mt-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
              >
                Go to current month
              </button>
            </div>

            <button
              type="button"
              onClick={nextCalendarMonth}
              aria-label="Next month"
              className="rounded-lg border border-gray-200 p-2 text-gray-600 transition hover:bg-gray-50"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Weekday Names */}
          <div className="grid grid-cols-7 gap-1 text-center sm:gap-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
              (day) => (
                <div
                  key={day}
                  className="py-2 text-xs font-semibold text-gray-500 sm:text-sm"
                >
                  {day}
                </div>
              )
            )}
          </div>

          {/* Calendar Dates */}
          {calendarLoading ? (
            <div className="flex min-h-48 flex-col items-center justify-center gap-3">
              <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
              <p className="text-sm text-gray-500">
                Loading availability...
              </p>
            </div>
          ) : calendarError ? (
            <div className="rounded-xl border border-red-100 bg-red-50 p-5 text-center">
              <AlertCircle className="mx-auto h-7 w-7 text-red-500" />
              <p className="mt-2 text-sm text-red-700">{calendarError}</p>

              <button
                onClick={() => setRefreshKey((prev) => prev + 1)}
                className="mt-3 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-red-600 shadow-sm hover:bg-red-100"
              >
                <RefreshCw size={14} />
                Try again
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {Array.from({ length: firstCalendarDay }).map((_, index) => (
                <div key={`empty-${index}`} className="min-h-11 sm:min-h-14" />
              ))}

              {Array.from({ length: totalCalendarDays }, (_, index) => {
                const dayNumber = index + 1;

                const date = `${calendarYear}-${String(
                  calendarMonth + 1
                ).padStart(2, "0")}-${String(dayNumber).padStart(2, "0")}`;

                const status = getAvailabilityStatus(date);
                const isSelected = selectedDate === date;
                const available = status === "AVAILABLE";
                const isPast = date < todayDateString;
                const canSelect = available && !isPast;

                const statusStyle =
                  status === "BOOKED"
                    ? "bg-yellow-400 text-yellow-950"
                    : status === "UNAVAILABLE"
                    ? "bg-red-500 text-white"
                    : "bg-green-500 text-white";

                return (
                  <button
                    key={date}
                    type="button"
                    disabled={!canSelect}
                    onClick={() => canSelect && setSelectedDate(date)}
                    title={`${date}: ${isPast ? "PAST DATE" : formatStatus(status)}`}
                    className={`relative flex min-h-11 items-center justify-center rounded-lg text-sm font-semibold transition sm:min-h-14 sm:text-base ${statusStyle} ${
                      isSelected
                        ? "z-10 ring-4 ring-blue-500 ring-offset-2"
                        : ""
                    } ${
                      isToday(dayNumber)
                        ? "outline outline-2 outline-blue-500 outline-offset-2"
                        : ""
                    } ${
                      !available
                        ? "cursor-not-allowed opacity-75"
                        : "cursor-pointer hover:scale-[1.03] hover:shadow-sm"
                    }`}
                  >
                    {dayNumber}

                    {isSelected && (
                      <span className="absolute -right-1 -top-1">
                        <CheckCircle2
                          size={14}
                          className="rounded-full bg-white text-blue-600"
                        />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Selected Date */}
          {selectedDate && !calendarLoading && (
            <div className="mt-6 flex flex-col gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 shrink-0 text-blue-600" />
                <div>
                  <p className="font-semibold text-blue-900">
                    Available date selected
                  </p>
                  <p className="mt-1 text-sm text-blue-700">
                    {formatDate(selectedDate)}
                  </p>
                </div>
              </div>

              <p className="text-xs text-blue-700">
                Use this date when creating a booking.
              </p>
            </div>
          )}


          {/* Direct Hire Booking Form */}
          {selectedDate && !calendarLoading && !calendarError && (
            <div className="mt-6 rounded-2xl border border-blue-200 bg-white p-5 shadow-sm sm:p-7">
              <div className="mb-6">
                <p className="text-sm font-semibold text-blue-600">
                  Direct Hiring
                </p>
                <h3 className="mt-1 text-xl font-bold text-gray-900">
                  Send a Hire Offer
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Create a job offer for {worker.name} on{" "}
                  <span className="font-semibold text-gray-700">
                    {formatDate(selectedDate)}
                  </span>.
                </p>
              </div>

              {offerError && (
                <div className="mb-4 flex gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  <AlertCircle size={18} className="shrink-0" />
                  {offerError}
                </div>
              )}

              {offerSuccess && (
                <div className="mb-4 flex gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                  <CheckCircle2 size={18} className="shrink-0" />
                  {offerSuccess}
                </div>
              )}

              <form onSubmit={sendDirectHireOffer} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g. Experienced Carpenter Required"
                    maxLength={150}
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Job Description *
                  </label>
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Describe the work and responsibilities..."
                    rows={4}
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Work Location *
                  </label>
                  <input
                    type="text"
                    value={jobLocation}
                    onChange={(e) => setJobLocation(e.target.value)}
                    placeholder="Enter complete work location"
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Proposed Wage (₹) *
                  </label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={proposedWage}
                    onChange={(e) => setProposedWage(e.target.value)}
                    placeholder="Enter proposed wage"
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Start Time *
                    </label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      required
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      End Time *
                    </label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      required
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

                <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
                  <p className="font-semibold">Selected Work Date</p>
                  <p className="mt-1">{formatDate(selectedDate)}</p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDate("");
                      setOfferError("");
                      setOfferSuccess("");
                    }}
                    disabled={submittingOffer}
                    className="rounded-lg border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submittingOffer}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submittingOffer ? (
                      <>
                        <Loader2 size={17} className="animate-spin" />
                        Sending Offer...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={17} />
                        Send Hire Offer
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}


          <div className="mt-5 flex items-start gap-2 text-xs leading-5 text-gray-500">
            <Clock size={15} className="mt-0.5 shrink-0" />
            <p>
              Only dates marked Available can be selected. Booked and
              unavailable dates cannot be selected.
            </p>
          </div>
        </section>

        {/* Back Button */}
        <div className="flex justify-center pb-4 sm:justify-start">
          <button
            onClick={() => navigate("/employer/workers")}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            <ArrowLeft size={17} />
            Back to Worker Directory
          </button>
        </div>
      </main>
    </div>
  );
}

function InfoCard({
  icon,
  label,
  value,
  description,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        {icon}
      </div>

      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-1 break-words text-lg font-bold text-gray-900">
        {value}
      </p>
      <p className="mt-1 text-xs text-gray-400">{description}</p>
    </div>
  );
}

function LegendItem({
  color,
  label,
}: {
  color: string;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-2 text-gray-600">
      <span className={`h-3 w-3 rounded-sm ${color}`} />
      {label}
    </span>
  );
}

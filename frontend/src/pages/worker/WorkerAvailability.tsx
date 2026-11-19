import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../../services/api";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  AlertCircle,
  Info,
} from "lucide-react";

interface AvailabilityDay {
  date: string;
  status: "AVAILABLE" | "UNAVAILABLE" | "BOOKED";
}

export default function WorkerAvailability() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [days, setDays] = useState<AvailabilityDay[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [updatingDate, setUpdatingDate] = useState<string | null>(null);

  const token = localStorage.getItem("token");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const startDate = `${year}-${String(month + 1).padStart(2, "0")}-01`;
  const endDate = `${year}-${String(month + 1).padStart(2, "0")}-${new Date(year, month + 1, 0).getDate()}`;

  const fetchCalendar = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");
      setSuccess("");

      if (!token) {
        setError("Your session has expired. Please log in again.");
        return;
      }

      const response = await axios.get<AvailabilityDay[]>(
        `${API_BASE_URL}/api/availability/me`,
        {
          params: { startDate, endDate },
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setDays(Array.isArray(response.data) ? response.data : []);
    } catch {
      setError("Unable to load your availability calendar. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [startDate, endDate, token]);

  useEffect(() => {
    fetchCalendar();
  }, [fetchCalendar]);

  const updateAvailability = async (
    date: string,
    status: "AVAILABLE" | "UNAVAILABLE"
  ) => {
    if (!token || updatingDate) return;

    try {
      setUpdatingDate(date);
      setError("");
      setSuccess("");

      const response = await axios.put(
        `${API_BASE_URL}/api/availability/me`,
        { date, status },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const updatedStatus = response.data?.status || status;

      setDays((previous) => {
        const existing = previous.some((day) => day.date === date);

        if (existing) {
          return previous.map((day) =>
            day.date === date
              ? { ...day, status: updatedStatus }
              : day
          );
        }

        return [...previous, { date, status: updatedStatus }];
      });

      setSuccess(
        `Availability updated: ${date} is now ${updatedStatus.toLowerCase()}.`
      );
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Unable to update availability. Please try again."
      );
    } finally {
      setUpdatingDate(null);
    }
  };

  const getStatus = (date: string): AvailabilityDay["status"] =>
    days.find((day) => day.date === date)?.status || "AVAILABLE";

  const firstDay = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setError("");
    setSuccess("");
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setError("");
    setSuccess("");
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setError("");
    setSuccess("");
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const availableCount = days.filter(
    (day) => day.status === "AVAILABLE"
  ).length;

  const unavailableCount = days.filter(
    (day) => day.status === "UNAVAILABLE"
  ).length;

  const bookedCount = days.filter(
    (day) => day.status === "BOOKED"
  ).length;

  const isToday = (dayNumber: number) => {
    return (
      year === today.getFullYear() &&
      month === today.getMonth() &&
      dayNumber === today.getDate()
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:py-10">
      <div className="mx-auto max-w-5xl">

        {/* Page Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-blue-100 p-3 text-blue-700">
              <CalendarDays size={30} />
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
                Work Schedule
              </p>
              <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
                My Availability
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                Manage your work schedule by marking the dates you are
                available or unavailable for work.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => fetchCalendar(true)}
            disabled={loading || refreshing}
            className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 sm:self-center"
          >
            <RefreshCw
              size={16}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {/* Status Summary */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-green-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Available Days
                </p>
                <p className="mt-2 text-3xl font-bold text-green-600">
                  {loading ? "—" : availableCount}
                </p>
              </div>
              <div className="rounded-xl bg-green-50 p-3 text-green-600">
                <CheckCircle2 size={24} />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-red-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Unavailable Days
                </p>
                <p className="mt-2 text-3xl font-bold text-red-600">
                  {loading ? "—" : unavailableCount}
                </p>
              </div>
              <div className="rounded-xl bg-red-50 p-3 text-red-600">
                <XCircle size={24} />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-amber-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Booked Days
                </p>
                <p className="mt-2 text-3xl font-bold text-amber-600">
                  {loading ? "—" : bookedCount}
                </p>
              </div>
              <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
                <Clock size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* Calendar Header */}
          <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {currentDate.toLocaleString("en-IN", {
                  month: "long",
                  year: "numeric",
                })}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Select a date to change your availability.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={goToToday}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Today
              </button>

              <button
                type="button"
                onClick={previousMonth}
                aria-label="Previous month"
                className="rounded-lg border border-slate-200 p-2 text-slate-700 transition hover:bg-slate-100"
              >
                <ChevronLeft size={20} />
              </button>

              <button
                type="button"
                onClick={nextMonth}
                aria-label="Next month"
                className="rounded-lg border border-slate-200 p-2 text-slate-700 transition hover:bg-slate-100"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="p-3 sm:p-6">

            {/* Legend */}
            <div className="mb-6 flex flex-wrap gap-x-5 gap-y-3">
              <span className="flex items-center gap-2 text-xs font-medium text-slate-600 sm:text-sm">
                <span className="h-3 w-3 rounded-full bg-green-500" />
                Available
              </span>

              <span className="flex items-center gap-2 text-xs font-medium text-slate-600 sm:text-sm">
                <span className="h-3 w-3 rounded-full bg-red-500" />
                Unavailable
              </span>

              <span className="flex items-center gap-2 text-xs font-medium text-slate-600 sm:text-sm">
                <span className="h-3 w-3 rounded-full bg-amber-400" />
                Booked
              </span>

              <span className="flex items-center gap-2 text-xs font-medium text-slate-600 sm:text-sm">
                <span className="h-3 w-3 rounded-full border-2 border-blue-600 bg-white" />
                Today
              </span>
            </div>

            {/* Weekday Names */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                (day) => (
                  <div
                    key={day}
                    className="py-2 text-center text-xs font-bold text-slate-400 sm:text-sm"
                  >
                    {day}
                  </div>
                )
              )}
            </div>

            {/* Calendar Dates */}
            {loading ? (
              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {Array.from({ length: 35 }).map((_, index) => (
                  <div
                    key={index}
                    className="aspect-square animate-pulse rounded-xl bg-slate-100"
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {Array.from({ length: firstDay }).map((_, index) => (
                  <div key={`empty-${index}`} />
                ))}

                {Array.from({ length: totalDays }, (_, index) => {
                  const dayNumber = index + 1;

                  const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNumber).padStart(2, "0")}`;

                  const status = getStatus(date);

                  const calendarDate = new Date(year, month, dayNumber);
                  const isPast = calendarDate < today;
                  const booked = status === "BOOKED";
                  const isUpdating = updatingDate === date;
                  const disabled = isPast || booked || updatingDate !== null;

                  let statusStyle = "";

                  if (status === "BOOKED") {
                    statusStyle =
                      "bg-amber-400 text-amber-950 border-amber-400";
                  } else if (status === "UNAVAILABLE") {
                    statusStyle =
                      "bg-red-500 text-white border-red-500";
                  } else {
                    statusStyle =
                      "bg-green-500 text-white border-green-500";
                  }

                  return (
                    <button
                      key={date}
                      type="button"
                      disabled={disabled}
                      onClick={() =>
                        updateAvailability(
                          date,
                          status === "AVAILABLE"
                            ? "UNAVAILABLE"
                            : "AVAILABLE"
                        )
                      }
                      className={`relative flex aspect-square min-h-10 flex-col items-center justify-center rounded-lg border text-sm font-semibold transition sm:rounded-xl sm:text-base ${
                        statusStyle
                      } ${
                        isPast
                          ? "cursor-not-allowed opacity-35"
                          : booked
                          ? "cursor-not-allowed opacity-90"
                          : "cursor-pointer hover:brightness-95"
                      } ${
                        isToday(dayNumber)
                          ? "ring-2 ring-blue-600 ring-offset-2"
                          : ""
                      } ${
                        isUpdating ? "animate-pulse opacity-70" : ""
                      }`}
                      title={`${date}: ${status}${isPast ? " (Past date)" : booked ? " (Cannot change booked date)" : " (Click to change)"}`}
                    >
                      <span>{dayNumber}</span>

                      {booked && (
                        <span className="hidden text-[9px] font-bold sm:block">
                          BOOKED
                        </span>
                      )}

                      {isUpdating && (
                        <span className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/10">
                          <RefreshCw size={15} className="animate-spin" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Calendar Footer */}
          <div className="border-t border-slate-100 bg-slate-50 px-5 py-4">
            <div className="flex items-start gap-2 text-xs leading-5 text-slate-500 sm:text-sm">
              <Info size={17} className="mt-0.5 shrink-0 text-blue-600" />
              <p>
                Green dates are available, red dates are unavailable, and
                yellow dates are booked. Past dates and booked dates cannot
                be changed.
              </p>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mt-5 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
            <CheckCircle2
              size={19}
              className="mt-0.5 shrink-0 text-green-600"
            />
            <p className="text-sm font-medium text-green-800">
              {success}
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
            <AlertCircle
              size={19}
              className="mt-0.5 shrink-0 text-red-600"
            />
            <div>
              <p className="text-sm font-semibold text-red-800">
                Something went wrong
              </p>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-5">
          <h3 className="font-semibold text-blue-900">
            How to manage your availability
          </h3>

          <ul className="mt-3 space-y-2 text-sm leading-6 text-blue-800">
            <li>
              • Click a green date to mark yourself unavailable.
            </li>
            <li>
              • Click a red date to mark yourself available again.
            </li>
            <li>
              • Booked dates are automatically protected from changes.
            </li>
            <li>
              • Past dates cannot be modified.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

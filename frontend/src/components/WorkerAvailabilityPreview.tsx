import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../services/api";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  BriefcaseBusiness,
  Building2,
  Clock,
  X,
} from "lucide-react";

interface AvailabilityDay {
  date: string;
  status: "AVAILABLE" | "UNAVAILABLE" | "BOOKED";
}

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

const API_URL = API_BASE_URL;

export default function WorkerAvailabilityPreview() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [days, setDays] = useState<AvailabilityDay[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const startDate = `${year}-${String(month + 1).padStart(2, "0")}-01`;
  const endDate = `${year}-${String(month + 1).padStart(2, "0")}-${new Date(year, month + 1, 0).getDate()}`;

  useEffect(() => {
    const fetchCalendar = async () => {
      try {
        setLoading(true);
        setError("");

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [calendarResponse, bookingsResponse] = await Promise.all([
          axios.get(`${API_URL}/api/availability/me`, {
            params: { startDate, endDate },
            headers,
          }),
          axios.get(`${API_URL}/api/bookings/my`, { headers }),
        ]);

        setDays(calendarResponse.data);
        setBookings(
          bookingsResponse.data.filter((booking: Booking) =>
            ["REQUESTED", "ACCEPTED", "IN_PROGRESS"].includes(booking.status)
          )
        );
      } catch (err) {
        console.error(err);
        setError("Unable to load your availability or bookings.");
      } finally {
        setLoading(false);
      }
    };

    fetchCalendar();
  }, [startDate, endDate, token]);

  const getStatus = (date: string) =>
    days.find((day) => day.date === date)?.status || "AVAILABLE";

  const getBookingsForDate = (date: string) => {
    const dayStart = new Date(`${date}T00:00:00`);
    const dayEnd = new Date(`${date}T00:00:00`);
    dayEnd.setDate(dayEnd.getDate() + 1);

    return bookings.filter((booking) => {
      const bookingStart = new Date(booking.startDateTime);
      const bookingEnd = new Date(booking.endDateTime);

      return bookingStart < dayEnd && bookingEnd > dayStart;
    });
  };

  const selectedBookings = selectedDate
    ? getBookingsForDate(selectedDate)
    : [];

  const firstDay = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getBookingStatusStyle = (status: string) => {
    switch (status) {
      case "REQUESTED":
        return "bg-yellow-100 text-yellow-800";
      case "ACCEPTED":
        return "bg-green-100 text-green-800";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <CalendarDays className="text-blue-600" size={21} />
            <h3 className="text-lg font-bold text-slate-800">
              My Availability
            </h3>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Your monthly work schedule
          </p>
        </div>

        <button
          onClick={() => navigate("/worker/availability")}
          className="text-sm font-semibold text-blue-600 hover:text-blue-800"
        >
          Manage
        </button>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => {
            setCurrentDate(new Date(year, month - 1, 1));
            setSelectedDate(null);
          }}
          className="rounded-lg p-1.5 hover:bg-slate-100"
          aria-label="Previous month"
        >
          <ChevronLeft size={19} />
        </button>

        <h4 className="font-semibold text-slate-700">
          {currentDate.toLocaleString("en-IN", {
            month: "long",
            year: "numeric",
          })}
        </h4>

        <button
          onClick={() => {
            setCurrentDate(new Date(year, month + 1, 1));
            setSelectedDate(null);
          }}
          className="rounded-lg p-1.5 hover:bg-slate-100"
          aria-label="Next month"
        >
          <ChevronRight size={19} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
          <div key={`${day}-${index}`} className="py-2 text-xs font-semibold text-slate-400">
            {day}
          </div>
        ))}

        {loading ? (
          <p className="col-span-7 py-8 text-sm text-slate-500">
            Loading calendar...
          </p>
        ) : (
          <>
            {Array.from({ length: firstDay }).map((_, index) => (
              <div key={`empty-${index}`} />
            ))}

            {Array.from({ length: totalDays }, (_, index) => {
              const dayNumber = index + 1;
              const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNumber).padStart(2, "0")}`;
              const status = getStatus(date);
              const isToday =
                new Date(year, month, dayNumber).getTime() === today.getTime();

              const isSelected = selectedDate === date;

              const color =
                status === "BOOKED"
                  ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 cursor-pointer"
                  : status === "UNAVAILABLE"
                  ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700";

              return (
                <button
                  key={date}
                  type="button"
                  disabled={status !== "BOOKED"}
                  onClick={() => setSelectedDate(date)}
                  title={`${date}: ${status}`}
                  className={`flex aspect-square items-center justify-center rounded-lg text-sm font-medium transition ${color} ${
                    isToday ? "ring-2 ring-blue-600 ring-offset-1" : ""
                  } ${
                    isSelected ? "ring-2 ring-yellow-600 ring-offset-1" : ""
                  }`}
                >
                  {dayNumber}
                </button>
              );
            })}
          </>
        )}
      </div>

      {error && (
        <p className="mt-3 text-xs text-red-600">{error}</p>
      )}

      {selectedDate && (
        <div className="mt-5 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h4 className="font-bold text-slate-800">
              Work Details
            </h4>

            <button
              onClick={() => setSelectedDate(null)}
              className="rounded-md p-1 text-slate-500 hover:bg-yellow-100"
              aria-label="Close booking details"
            >
              <X size={18} />
            </button>
          </div>

          <p className="mb-3 text-xs text-slate-600">
            Selected date:{" "}
            {new Date(`${selectedDate}T00:00:00`).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>

          {selectedBookings.length === 0 ? (
            <p className="text-sm text-red-600">
              No matching booking details were found for this date.
              Please refresh the dashboard.
            </p>
          ) : (
            <div className="space-y-3">
              {selectedBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="rounded-lg border border-yellow-200 bg-white p-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h5 className="font-bold text-slate-800">
                      {booking.jobTitle}
                    </h5>

                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${getBookingStatusStyle(
                        booking.status
                      )}`}
                    >
                      {booking.status.replace("_", " ")}
                    </span>
                  </div>

                  <div className="mt-3 space-y-2 text-sm text-slate-600">
                    <p className="flex items-center gap-2">
                      <BriefcaseBusiness size={15} />
                      Booking #{booking.id} · Job #{booking.jobId}
                    </p>

                    <p className="flex items-center gap-2">
                      <Building2 size={15} />
                      {booking.companyName}
                    </p>

                    <p className="flex items-center gap-2">
                      <Clock size={15} />
                      {new Date(booking.startDateTime).toLocaleString("en-IN")}
                    </p>

                    <p className="flex items-center gap-2">
                      <Clock size={15} />
                      Until {new Date(booking.endDateTime).toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mt-5 flex flex-wrap justify-center gap-x-4 gap-y-2 border-t border-slate-100 pt-4">
        <span className="flex items-center gap-1.5 text-xs text-slate-600">
          <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
          Available
        </span>
        <span className="flex items-center gap-1.5 text-xs text-slate-600">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
          Unavailable
        </span>
        <span className="flex items-center gap-1.5 text-xs text-slate-600">
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
          Booked · Click for details
        </span>
      </div>
    </div>
  );
}

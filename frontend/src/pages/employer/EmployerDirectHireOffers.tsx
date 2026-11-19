import { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../../services/api";
import {
  ArrowLeft,
  Briefcase,
  MapPin,
  Wallet,
  CalendarDays,
  Clock,
  RefreshCw,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Inbox,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface DirectHireOffer {
  id: number;
  employerId: number;
  companyName: string;
  workerId: number;
  workerName: string;
  title: string;
  description: string;
  location: string;
  proposedWage: number;
  startDateTime: string;
  endDateTime: string;
  createdAt: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "BOOKED";
}

const API_URL = `${API_BASE_URL}/api/direct-hire-requests`;

export default function EmployerDirectHireOffers() {
  const navigate = useNavigate();

  const [offers, setOffers] = useState<DirectHireOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingId, setBookingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchOffers = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await axios.get(`${API_URL}/my`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setOffers(response.data);
    } catch (err: any) {
      console.error("Error fetching direct-hire offers:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load direct-hire offers."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const createBooking = async (requestId: number) => {
    try {
      setBookingId(requestId);
      setError("");
      setSuccess("");

      const token = localStorage.getItem("token");

      await axios.post(
        `${API_URL}/${requestId}/booking`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setSuccess(
        "Booking created successfully! The job is now available in Manage Jobs."
      );

      await fetchOffers();
    } catch (err: any) {
      console.error("Error creating direct-hire booking:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Unable to create booking. Please try again."
      );
    } finally {
      setBookingId(null);
    }
  };

  const formatDateTime = (value: string) => {
    if (!value) return "Not specified";

    return new Date(value).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatWage = (amount: number) =>
    `₹${Number(amount).toLocaleString("en-IN")}`;

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return "bg-green-100 text-green-700";
      case "REJECTED":
        return "bg-red-100 text-red-700";
      case "BOOKED":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  const pendingCount = offers.filter(
    (offer) => offer.status === "PENDING"
  ).length;

  const acceptedCount = offers.filter(
    (offer) => offer.status === "ACCEPTED"
  ).length;

  const bookedCount = offers.filter(
    (offer) => offer.status === "BOOKED"
  ).length;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-medium text-blue-600">
              Employer Portal
            </p>
            <h1 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">
              Direct Hire Offers
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Track offers sent to workers and create bookings after acceptance.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => navigate("/employer/dashboard")}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              <ArrowLeft size={16} />
              Dashboard
            </button>

            <button
              onClick={fetchOffers}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SummaryCard label="Pending Offers" count={pendingCount} />
          <SummaryCard label="Accepted Offers" count={acceptedCount} />
          <SummaryCard label="Bookings Created" count={bookedCount} />
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-5 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle size={18} className="shrink-0" />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            <CheckCircle2 size={18} className="shrink-0" />
            {success}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="mb-3 animate-spin text-blue-600" size={32} />
            <p className="text-gray-500">Loading your offers...</p>
          </div>
        ) : offers.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white px-6 py-16 text-center">
            <Inbox className="mx-auto mb-4 text-gray-400" size={48} />
            <h2 className="text-lg font-semibold text-gray-800">
              No direct-hire offers yet
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Offers you send from worker profiles will appear here.
            </p>
            <button
              onClick={() => navigate("/employer/workers")}
              className="mt-5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Find Workers
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {offers.map((offer) => (
              <div
                key={offer.id}
                className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
              >
                {/* Offer Header */}
                <div className="flex flex-col justify-between gap-3 border-b border-gray-100 p-5 sm:flex-row sm:items-center">
                  <div>
                    <p className="text-sm text-gray-500">Worker</p>
                    <h2 className="mt-1 text-lg font-bold text-gray-900">
                      {offer.workerName || "Worker"}
                    </h2>
                  </div>

                  <span
                    className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                      offer.status
                    )}`}
                  >
                    {offer.status}
                  </span>
                </div>

                <div className="p-5">
                  <h3 className="mb-3 text-xl font-semibold text-gray-900">
                    {offer.title}
                  </h3>

                  <p className="mb-5 whitespace-pre-wrap text-sm leading-6 text-gray-600">
                    {offer.description}
                  </p>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <DetailItem
                      icon={<MapPin size={19} />}
                      label="Work Location"
                      value={offer.location}
                    />

                    <DetailItem
                      icon={<Wallet size={19} />}
                      label="Proposed Wage"
                      value={formatWage(offer.proposedWage)}
                    />

                    <DetailItem
                      icon={<CalendarDays size={19} />}
                      label="Start"
                      value={formatDateTime(offer.startDateTime)}
                    />

                    <DetailItem
                      icon={<Clock size={19} />}
                      label="End"
                      value={formatDateTime(offer.endDateTime)}
                    />

                    <DetailItem
                      icon={<Briefcase size={19} />}
                      label="Offer ID"
                      value={`#${offer.id}`}
                    />
                  </div>

                  {/* Pending */}
                  {offer.status === "PENDING" && (
                    <div className="mt-6 rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800">
                      Waiting for the worker to accept or reject your offer.
                    </div>
                  )}

                  {/* Accepted */}
                  {offer.status === "ACCEPTED" && (
                    <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4">
                      <div className="flex items-start gap-2">
                        <CheckCircle2
                          size={20}
                          className="mt-0.5 shrink-0 text-green-600"
                        />
                        <div>
                          <p className="font-semibold text-green-800">
                            Worker accepted your offer!
                          </p>
                          <p className="mt-1 text-sm text-green-700">
                            You can now create the booking for this offer.
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => createBooking(offer.id)}
                        disabled={bookingId !== null}
                        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-5 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                      >
                        {bookingId === offer.id ? (
                          <>
                            <Loader2 size={17} className="animate-spin" />
                            Creating Booking...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={17} />
                            Create Booking
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Rejected */}
                  {offer.status === "REJECTED" && (
                    <div className="mt-6 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                      <XCircle size={18} />
                      The worker rejected this offer.
                    </div>
                  )}

                  {/* Booked */}
                  {offer.status === "BOOKED" && (
                    <div className="mt-6 flex flex-col gap-3 rounded-lg bg-blue-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-start gap-2 text-sm text-blue-800">
                        <CheckCircle2 size={19} className="shrink-0" />
                        <div>
                          <p className="font-semibold">
                            Booking created successfully
                          </p>
                          <p className="mt-1">
                            You can view this job under Manage Jobs and track
                            the booking under Bookings.
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => navigate("/employer/manage-jobs")}
                        className="shrink-0 rounded-lg border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
                      >
                        Manage Jobs
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  count,
}: {
  label: string;
  count: number;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-gray-900">{count}</p>
    </div>
  );
}

function DetailItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-gray-400">{icon}</span>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-800">
          {value || "Not specified"}
        </p>
      </div>
    </div>
  );
}

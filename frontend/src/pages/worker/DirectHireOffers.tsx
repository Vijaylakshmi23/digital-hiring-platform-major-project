import { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../../services/api";
import {
  Briefcase,
  MapPin,
  Wallet,
  CalendarDays,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Loader2,
  Inbox,
} from "lucide-react";

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

function DirectHireOffers() {
  const [offers, setOffers] = useState<DirectHireOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token = localStorage.getItem("token");

  const fetchOffers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(`${API_URL}/my`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setOffers(response.data);
    } catch (err) {
      console.error("Error fetching direct hire offers:", err);
      setError("Unable to load direct-hire offers. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const respondToOffer = async (
    requestId: number,
    status: "ACCEPTED" | "REJECTED"
  ) => {
    try {
      setActionId(requestId);
      setError("");
      setSuccess("");

      await axios.patch(
        `${API_URL}/${requestId}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setSuccess(
        status === "ACCEPTED"
          ? "Offer accepted successfully!"
          : "Offer rejected successfully!"
      );

      await fetchOffers();
    } catch (err: any) {
      console.error("Error responding to offer:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Unable to update the offer. Please try again."
      );
    } finally {
      setActionId(null);
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

  const formatDate = (value: string) => {
    if (!value) return "Not specified";

    return new Date(value).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
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

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Direct Hire Offers
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              View and respond to employers who want to hire you directly.
            </p>
          </div>

          <button
            onClick={fetchOffers}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {/* Summary */}
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Pending offers</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">
            {pendingCount}
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
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
          /* Empty state */
          <div className="rounded-xl border border-gray-200 bg-white px-6 py-16 text-center">
            <Inbox className="mx-auto mb-4 text-gray-400" size={48} />
            <h2 className="text-lg font-semibold text-gray-800">
              No direct-hire offers yet
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              When an employer sends you a direct-hire offer, it will appear here.
            </p>
          </div>
        ) : (
          /* Offers */
          <div className="space-y-5">
            {offers.map((offer) => (
              <div
                key={offer.id}
                className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
              >
                <div className="flex flex-col justify-between gap-3 border-b border-gray-100 p-5 sm:flex-row sm:items-center">
                  <div>
                    <p className="text-sm text-gray-500">Offer from</p>
                    <h2 className="mt-1 text-lg font-bold text-gray-900">
                      {offer.companyName || "Employer"}
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
                  <h3 className="mb-4 text-xl font-semibold text-gray-900">
                    {offer.title}
                  </h3>

                  <p className="mb-5 whitespace-pre-wrap text-sm leading-6 text-gray-600">
                    {offer.description}
                  </p>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex items-start gap-3">
                      <MapPin className="mt-0.5 text-gray-400" size={19} />
                      <div>
                        <p className="text-xs text-gray-500">Work location</p>
                        <p className="text-sm font-medium text-gray-800">
                          {offer.location}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Wallet className="mt-0.5 text-gray-400" size={19} />
                      <div>
                        <p className="text-xs text-gray-500">Proposed wage</p>
                        <p className="text-sm font-semibold text-green-700">
                          {formatWage(offer.proposedWage)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <CalendarDays className="mt-0.5 text-gray-400" size={19} />
                      <div>
                        <p className="text-xs text-gray-500">Start date</p>
                        <p className="text-sm font-medium text-gray-800">
                          {formatDate(offer.startDateTime)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Clock className="mt-0.5 text-gray-400" size={19} />
                      <div>
                        <p className="text-xs text-gray-500">Work schedule</p>
                        <p className="text-sm font-medium text-gray-800">
                          {formatDateTime(offer.startDateTime)}
                        </p>
                        <p className="text-xs text-gray-500">
                          to {formatDateTime(offer.endDateTime)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Briefcase className="mt-0.5 text-gray-400" size={19} />
                      <div>
                        <p className="text-xs text-gray-500">Offer received</p>
                        <p className="text-sm font-medium text-gray-800">
                          {formatDate(offer.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {offer.status === "PENDING" && (
                    <div className="mt-6 flex flex-col gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
                      <button
                        onClick={() =>
                          respondToOffer(offer.id, "REJECTED")
                        }
                        disabled={actionId !== null}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 px-5 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        <XCircle size={17} />
                        Reject Offer
                      </button>

                      <button
                        onClick={() =>
                          respondToOffer(offer.id, "ACCEPTED")
                        }
                        disabled={actionId !== null}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                      >
                        {actionId === offer.id ? (
                          <Loader2 size={17} className="animate-spin" />
                        ) : (
                          <CheckCircle2 size={17} />
                        )}
                        Accept Offer
                      </button>
                    </div>
                  )}

                  {offer.status === "ACCEPTED" && (
                    <div className="mt-5 rounded-lg bg-green-50 p-3 text-sm text-green-700">
                      You accepted this offer. The employer can now proceed
                      with creating your booking.
                    </div>
                  )}

                  {offer.status === "BOOKED" && (
                    <div className="mt-5 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
                      This direct-hire offer has been converted into a booking.
                    </div>
                  )}

                  {offer.status === "REJECTED" && (
                    <div className="mt-5 rounded-lg bg-gray-100 p-3 text-sm text-gray-600">
                      You rejected this offer.
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

export default DirectHireOffers;

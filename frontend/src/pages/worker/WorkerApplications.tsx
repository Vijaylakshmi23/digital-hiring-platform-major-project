import { useEffect, useMemo, useState } from "react";
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
  FileText,
  AlertCircle,
  ArrowRight,
  Loader2,
  ClipboardList,
} from "lucide-react";

interface JobApplication {
  id: number;
  jobId: number;
  jobTitle: string;
  workerId: number;
  workerName: string;
  message: string;
  status: string;
  appliedAt: string;
}

const API_URL = API_BASE_URL;

type FilterStatus = "ALL" | "PENDING" | "ACCEPTED" | "REJECTED";

function formatDate(date: string) {
  if (!date) return "Date unavailable";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "Date unavailable";

  return parsedDate.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function WorkerApplications() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterStatus>("ALL");

  const navigate = useNavigate();

  const fetchApplications = async (isRefresh = false) => {
    const token = localStorage.getItem("token");

    if (!token) {
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
      const response = await axios.get<JobApplication[]>(
        `${API_URL}/api/applications/my`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setApplications(
        Array.isArray(response.data) ? response.data : []
      );
    } catch (err) {
      console.error("Error fetching applications:", err);
      setError("Unable to load your applications. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const pendingCount = applications.filter(
    (app) => app.status === "PENDING"
  ).length;

  const acceptedCount = applications.filter(
    (app) => app.status === "ACCEPTED"
  ).length;

  const rejectedCount = applications.filter(
    (app) => app.status === "REJECTED"
  ).length;

  const filteredApplications = useMemo(() => {
    return applications.filter((application) => {
      const searchText = search.toLowerCase().trim();

      const matchesSearch =
        !searchText ||
        application.jobTitle?.toLowerCase().includes(searchText) ||
        application.message?.toLowerCase().includes(searchText) ||
        String(application.id).includes(searchText) ||
        String(application.jobId).includes(searchText);

      const matchesFilter =
        activeFilter === "ALL" ||
        application.status === activeFilter;

      return matchesSearch && matchesFilter;
    });
  }, [applications, search, activeFilter]);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return {
          style: "bg-green-100 text-green-700",
          icon: <CheckCircle2 size={15} />,
          label: "Accepted",
        };

      case "REJECTED":
        return {
          style: "bg-red-100 text-red-700",
          icon: <XCircle size={15} />,
          label: "Rejected",
        };

      case "PENDING":
        return {
          style: "bg-amber-100 text-amber-700",
          icon: <Clock size={15} />,
          label: "Pending",
        };

      default:
        return {
          style: "bg-gray-100 text-gray-700",
          icon: <Clock size={15} />,
          label: status.replace(/_/g, " "),
        };
    }
  };

  const filterOptions: {
    label: string;
    value: FilterStatus;
    count: number;
  }[] = [
    { label: "All", value: "ALL", count: applications.length },
    { label: "Pending", value: "PENDING", count: pendingCount },
    { label: "Accepted", value: "ACCEPTED", count: acceptedCount },
    { label: "Rejected", value: "REJECTED", count: rejectedCount },
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-gray-50">
        <Loader2 className="h-9 w-9 animate-spin text-blue-600" />
        <p className="font-medium text-gray-600">
          Loading your applications...
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
              <ClipboardList size={18} />
              Worker Dashboard
            </div>

            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              My Applications
            </h1>

            <p className="mt-2 text-sm text-gray-600 sm:text-base">
              Keep track of the jobs you've applied for and their
              latest status.
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
              onClick={() => fetchApplications(true)}
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

        {/* Summary Cards */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            title="Total Applications"
            count={applications.length}
            icon={<BriefcaseBusiness size={21} />}
            color="blue"
          />

          <SummaryCard
            title="Pending"
            count={pendingCount}
            icon={<Clock size={21} />}
            color="amber"
          />

          <SummaryCard
            title="Accepted"
            count={acceptedCount}
            icon={<CheckCircle2 size={21} />}
            color="green"
          />

          <SummaryCard
            title="Rejected"
            count={rejectedCount}
            icon={<XCircle size={21} />}
            color="red"
          />
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-2 text-sm text-red-700">
              <AlertCircle size={19} className="mt-0.5 shrink-0" />
              <p>{error}</p>
            </div>

            <button
              onClick={() => fetchApplications(true)}
              disabled={refreshing}
              className="self-start rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50 sm:self-auto"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Search and Filters */}
        {applications.length > 0 && (
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
                placeholder="Search by job title, message or application ID..."
                className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {filterOptions.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setActiveFilter(filter.value)}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                    activeFilter === filter.value
                      ? "bg-blue-700 text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {filter.label}
                  <span className="ml-2 opacity-80">
                    {filter.count}
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* No Applications */}
        {applications.length === 0 && !error && (
          <div className="rounded-2xl border border-gray-200 bg-white px-6 py-14 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
              <BriefcaseBusiness size={30} className="text-blue-600" />
            </div>

            <h2 className="mt-5 text-xl font-bold text-gray-900">
              No applications yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              You haven't applied for any jobs yet. Explore available
              opportunities and submit your first application.
            </p>

            <button
              onClick={() => navigate("/jobs")}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-700 px-6 py-3 font-semibold text-white transition hover:bg-blue-800"
            >
              Find Jobs
              <ArrowRight size={17} />
            </button>
          </div>
        )}

        {/* Applications List */}
        {applications.length > 0 && (
          <section>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-bold text-gray-900">
                Your Applications
              </h2>

              <p className="text-sm text-gray-500">
                Showing {filteredApplications.length} of{" "}
                {applications.length}
              </p>
            </div>

            {filteredApplications.length === 0 ? (
              <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
                <Search className="mx-auto h-9 w-9 text-gray-400" />

                <h3 className="mt-4 font-semibold text-gray-900">
                  No matching applications
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
              <div className="space-y-5">
                {filteredApplications.map((application) => {
                  const status = getStatusStyle(application.status);

                  return (
                    <article
                      key={application.id}
                      className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
                    >
                      <div className="p-5 sm:p-6">
                        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-blue-700">
                              <BriefcaseBusiness size={15} />
                              Job Application
                            </div>

                            <h3 className="mt-2 break-words text-lg font-bold text-gray-900 sm:text-xl">
                              {application.jobTitle || "Untitled Job"}
                            </h3>

                            <p className="mt-1 text-xs text-gray-500">
                              Application #{application.id}
                              {" · "}
                              Job #{application.jobId}
                            </p>
                          </div>

                          <span
                            className={`inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${status.style}`}
                          >
                            {status.icon}
                            {status.label}
                          </span>
                        </div>

                        {/* Message */}
                        <div className="mt-6 rounded-lg bg-gray-50 p-4">
                          <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                            <FileText size={17} className="text-gray-500" />
                            Your Application Message
                          </div>

                          <p className="mt-2 whitespace-pre-line break-words text-sm leading-6 text-gray-600">
                            {application.message || "No message provided."}
                          </p>
                        </div>

                        {/* Date */}
                        <div className="mt-5 flex flex-wrap items-center gap-2 text-sm text-gray-500">
                          <CalendarDays size={17} />
                          <span>
                            Applied on: {formatDate(application.appliedAt)}
                          </span>
                        </div>

                        {/* Status Information */}
                        {application.status === "ACCEPTED" && (
                          <div className="mt-5 flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
                            <CheckCircle2
                              size={20}
                              className="mt-0.5 shrink-0 text-green-600"
                            />

                            <div>
                              <p className="font-semibold text-green-800">
                                Congratulations! Your application was accepted.
                              </p>

                              <p className="mt-1 text-sm leading-6 text-green-700">
                                Check My Bookings for booking details,
                                scheduling and further updates.
                              </p>

                              <button
                                onClick={() => navigate("/worker/bookings")}
                                className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-green-800 hover:underline"
                              >
                                Go to My Bookings
                                <ArrowRight size={16} />
                              </button>
                            </div>
                          </div>
                        )}

                        {application.status === "REJECTED" && (
                          <div className="mt-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
                            <XCircle
                              size={20}
                              className="mt-0.5 shrink-0 text-red-600"
                            />

                            <div>
                              <p className="font-semibold text-red-800">
                                Application not selected
                              </p>

                              <p className="mt-1 text-sm leading-6 text-red-700">
                                Unfortunately, this application was not
                                selected. Keep exploring other opportunities!
                              </p>
                            </div>
                          </div>
                        )}

                        {application.status === "PENDING" && (
                          <div className="mt-5 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
                            <Clock
                              size={20}
                              className="mt-0.5 shrink-0 text-amber-600"
                            />

                            <div>
                              <p className="font-semibold text-amber-800">
                                Application under review
                              </p>

                              <p className="mt-1 text-sm leading-6 text-amber-700">
                                Your application is waiting for the employer's
                                decision. Check back for updates.
                              </p>
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
  color: "blue" | "amber" | "green" | "red";
}

function SummaryCard({ title, count, icon, color }: SummaryCardProps) {
  const colors = {
    blue: "bg-blue-50 text-blue-700",
    amber: "bg-amber-50 text-amber-700",
    green: "bg-green-50 text-green-700",
    red: "bg-red-50 text-red-700",
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-gray-500">{title}</p>

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

export default WorkerApplications;

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../../services/api";
import {
  MapPin,
  Calendar,
  Users,
  Briefcase,
  Plus,
  RefreshCw,
  Search,
  IndianRupee,
  Clock3,
  ClipboardList,
} from "lucide-react";

interface Job {
  id: number;
  title: string;
  description: string;
  requiredSkill: string;
  location: string;
  jobType: string;
  budget: number;
  startDate: string;
  durationDays: number;
  numberOfWorkers: number;
  status: string;
}

type StatusFilter = "ALL" | "OPEN" | "CLOSED" | "FILLED";

function ManageJobs() {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  const fetchJobs = async () => {
    try {
      setError("");
      setRefreshing(true);

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.get<Job[]>(
        `${API_BASE_URL}/api/jobs/my`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setJobs(response.data);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setError("Unable to load your jobs. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const counts = useMemo(() => {
    return {
      total: jobs.length,
      open: jobs.filter((job) => job.status?.toUpperCase() === "OPEN").length,
      closed: jobs.filter((job) => job.status?.toUpperCase() === "CLOSED").length,
      filled: jobs.filter((job) => job.status?.toUpperCase() === "FILLED").length,
    };
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const search = searchTerm.toLowerCase();

      const matchesSearch =
        job.title?.toLowerCase().includes(search) ||
        job.requiredSkill?.toLowerCase().includes(search) ||
        job.location?.toLowerCase().includes(search);

      const matchesStatus =
        statusFilter === "ALL" ||
        job.status?.toUpperCase() === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [jobs, searchTerm, statusFilter]);

  const getStatusStyle = (status: string) => {
    switch (status?.toUpperCase()) {
      case "OPEN":
        return "bg-green-50 text-green-700 border-green-200";
      case "CLOSED":
        return "bg-red-50 text-red-700 border-red-200";
      case "FILLED":
        return "bg-blue-50 text-blue-700 border-blue-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const summaryCards = [
    {
      label: "Total Jobs",
      value: counts.total,
      icon: <Briefcase size={21} />,
      style: "bg-blue-50 text-blue-700",
    },
    {
      label: "Open Jobs",
      value: counts.open,
      icon: <ClipboardList size={21} />,
      style: "bg-green-50 text-green-700",
    },
    {
      label: "Filled Jobs",
      value: counts.filled,
      icon: <Users size={21} />,
      style: "bg-indigo-50 text-indigo-700",
    },
    {
      label: "Closed Jobs",
      value: counts.closed,
      icon: <Clock3 size={21} />,
      style: "bg-red-50 text-red-700",
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-700" />
          <p className="mt-4 text-sm font-medium text-slate-500">
            Loading your jobs...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:py-10">
      <main className="mx-auto max-w-7xl">

        {/* Page heading */}
        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-700">
              <Briefcase size={17} />
              EMPLOYER PORTAL
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Manage Jobs
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Track your job postings and monitor their current status.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={fetchJobs}
              disabled={refreshing}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-60"
            >
              <RefreshCw
                size={17}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>

            <button
              type="button"
              onClick={() => navigate("/employer/post-job")}
              className="flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800"
            >
              <Plus size={19} />
              Post New Job
            </button>
          </div>
        </div>

        {/* Summary cards */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {summaryCards.map((card) => (
            <div
              key={card.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-slate-500">
                  {card.label}
                </p>
                <div className={`rounded-xl p-2.5 ${card.style}`}>
                  {card.icon}
                </div>
              </div>

              <p className="mt-3 text-3xl font-bold text-slate-900">
                {card.value}
              </p>
            </div>
          ))}
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 flex flex-col justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center">
            <p className="text-sm text-red-700">{error}</p>
            <button
              type="button"
              onClick={fetchJobs}
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
              <h2 className="font-bold text-slate-800">
                Your Job Postings
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Search and filter your posted opportunities.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search jobs..."
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:w-64"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as StatusFilter)
                }
                className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="ALL">All Statuses</option>
                <option value="OPEN">Open</option>
                <option value="FILLED">Filled</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
          </div>
        </section>

        {/* Job listings */}
        {jobs.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
              <Briefcase size={32} />
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-800">
              No jobs posted yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Your job postings will appear here. Create your first
              opportunity to start connecting with skilled workers.
            </p>

            <button
              type="button"
              onClick={() => navigate("/employer/post-job")}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
            >
              <Plus size={18} />
              Post Your First Job
            </button>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
            <Search size={32} className="mx-auto text-slate-400" />
            <h2 className="mt-4 font-bold text-slate-800">
              No matching jobs found
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Try changing your search term or status filter.
            </p>

            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("ALL");
              }}
              className="mt-4 text-sm font-semibold text-blue-700 hover:underline"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Showing{" "}
                <span className="font-semibold text-slate-800">
                  {filteredJobs.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-800">
                  {jobs.length}
                </span>{" "}
                jobs
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {filteredJobs.map((job) => (
                <article
                  key={job.id}
                  className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-6"
                >
                  {/* Title and status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="break-words text-lg font-bold text-slate-900">
                        {job.title}
                      </h2>

                      <p className="mt-1 text-sm font-semibold text-blue-700">
                        {job.requiredSkill}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full border px-3 py-1 text-xs font-bold ${getStatusStyle(job.status)}`}
                    >
                      {job.status || "UNKNOWN"}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">
                    {job.description}
                  </p>

                  {/* Job information */}
                  <div className="mt-5 grid grid-cols-1 gap-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-600 sm:grid-cols-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <MapPin size={17} className="shrink-0 text-slate-400" />
                      <span className="break-words">{job.location}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar size={17} className="shrink-0 text-slate-400" />
                      <span>{job.startDate}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Users size={17} className="shrink-0 text-slate-400" />
                      <span>{job.numberOfWorkers} workers required</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock3 size={17} className="shrink-0 text-slate-400" />
                      <span>{job.durationDays} days</span>
                    </div>
                  </div>

                  {/* Job type */}
                  <div className="mt-4">
                    <span className="rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700">
                      {job.jobType?.replace("_", " ") || "Job"}
                    </span>
                  </div>

                  {/* Budget and action */}
                  <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-5 mt-5">
                    <div>
                      <p className="text-xs font-medium text-slate-500">
                        Total Budget
                      </p>
                      <p className="mt-1 flex items-center text-xl font-bold text-slate-900">
                        <IndianRupee size={18} />
                        {job.budget?.toLocaleString("en-IN") ?? "N/A"}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => navigate(`/jobs/${job.id}`)}
                      className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                    >
                      View Details
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default ManageJobs;


import { useEffect, useMemo, useState } from "react";
import {
  Search,
  MapPin,
  Briefcase,
  Loader2,
  Users,
  SlidersHorizontal,
  IndianRupee,
  UserRound,
  RefreshCw,
  X,
  Award,
  CheckCircle2,
} from "lucide-react";

import {
  getAllWorkers,
  searchWorkers,
} from "../../services/workerService";

import type { WorkerProfile } from "../../types/worker";
import { useNavigate } from "react-router-dom";

export default function FindWorkers() {
  const [workers, setWorkers] = useState<WorkerProfile[]>([]);
  const [profession, setProfession] = useState("");
  const [location, setLocation] = useState("");
  const [minExperience, setMinExperience] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchApplied, setSearchApplied] = useState(false);

  const navigate = useNavigate();

  const loadWorkers = async () => {
    try {
      setLoading(true);
      setError("");
      setSearchApplied(false);

      const data = await getAllWorkers();
      setWorkers(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load workers. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      setError("");
      setSearchApplied(true);

      const data = await searchWorkers({
        profession: profession.trim() || undefined,
        location: location.trim() || undefined,
        minExperience: minExperience
          ? Number(minExperience)
          : undefined,
      });

      setWorkers(data);
    } catch (err) {
      console.error(err);
      setError("Worker search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = async () => {
    setProfession("");
    setLocation("");
    setMinExperience("");
    await loadWorkers();
  };

  useEffect(() => {
    loadWorkers();
  }, []);

  const availableCount = useMemo(
    () =>
      workers.filter(
        (worker) =>
          worker.availabilityStatus?.toLowerCase() === "available"
      ).length,
    [workers]
  );

  const getAvailabilityStyle = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case "available":
        return "bg-green-100 text-green-700";
      case "busy":
      case "unavailable":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const formatWage = (worker: WorkerProfile) => {
    if (worker.expectedWage == null) {
      return "Not specified";
    }

    return `₹${Number(worker.expectedWage).toLocaleString("en-IN")} / ${
      worker.wageType || "N/A"
    }`;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-gray-100 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
              <Users size={22} />
            </div>

            <div>
              <h1 className="text-lg font-bold text-gray-900">
                LabourConnect
              </h1>
              <p className="text-xs text-gray-500">
                Employer Workspace
              </p>
            </div>
          </div>

          <button
            onClick={loadWorkers}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Introduction */}
        <div className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
            <Users size={14} />
            Worker Directory
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Find the Right Workers
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">
            Discover skilled professionals, compare their experience
            and find the right people for your projects.
          </p>
        </div>

        {/* Summary */}
        <div className="mb-7 grid grid-cols-2 gap-4 sm:max-w-xl">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <Users className="text-blue-600" size={22} />
              <span className="text-2xl font-bold text-gray-900">
                {workers.length}
              </span>
            </div>
            <p className="mt-2 text-sm font-medium text-gray-500">
              Workers Found
            </p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <CheckCircle2 className="text-green-600" size={22} />
              <span className="text-2xl font-bold text-gray-900">
                {availableCount}
              </span>
            </div>
            <p className="mt-2 text-sm font-medium text-gray-500">
              Available Workers
            </p>
          </div>
        </div>

        {/* Search Panel */}
        <section className="mb-8 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <SlidersHorizontal size={19} />
            </div>

            <div>
              <h3 className="font-bold text-gray-900">
                Search and Filter
              </h3>
              <p className="text-xs text-gray-500">
                Narrow down workers based on your requirements.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Profession
              </label>
              <input
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
                placeholder="e.g. Electrician"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Location
              </label>
              <div className="relative">
                <MapPin
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSearch();
                  }}
                  placeholder="Enter location"
                  className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Minimum Experience
              </label>
              <div className="relative">
                <Briefcase
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="number"
                  min="0"
                  value={minExperience}
                  onChange={(e) => setMinExperience(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSearch();
                  }}
                  placeholder="Years of experience"
                  className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleSearch}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Search size={18} />
                Search Workers
              </button>
            </div>
          </div>

          {(profession || location || minExperience || searchApplied) && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={clearFilters}
                disabled={loading}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition hover:text-red-600 disabled:opacity-50"
              >
                <X size={15} />
                Clear Filters
              </button>
            </div>
          )}
        </section>

        {/* Results Heading */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              Worker Profiles
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {loading
                ? "Finding suitable workers..."
                : `${workers.length} worker(s) found`}
            </p>
          </div>

          {searchApplied && !loading && (
            <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
              Filtered Results
            </span>
          )}
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white">
            <Loader2 className="mb-3 h-9 w-9 animate-spin text-blue-600" />
            <p className="font-medium text-gray-700">
              Loading worker profiles...
            </p>
            <p className="mt-1 text-sm text-gray-400">
              Please wait a moment.
            </p>
          </div>
        ) : error ? (
          /* Error */
          <div className="rounded-2xl border border-red-100 bg-white p-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
              <X size={26} />
            </div>

            <h3 className="mt-4 text-lg font-bold text-gray-900">
              Something went wrong
            </h3>

            <p className="mt-2 text-sm text-red-600">{error}</p>

            <button
              onClick={loadWorkers}
              className="mt-5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        ) : workers.length === 0 ? (
          /* Empty State */
          <div className="rounded-2xl border border-gray-100 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
              <Users size={30} className="text-blue-500" />
            </div>

            <h3 className="mt-5 text-xl font-bold text-gray-900">
              No workers found
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              We couldn't find workers matching your current search.
              Try another profession, location or experience requirement.
            </p>

            <button
              onClick={clearFilters}
              className="mt-5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              View All Workers
            </button>
          </div>
        ) : (
          /* Worker Cards */
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {workers.map((worker) => (
              <article
                key={worker.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="h-1.5 bg-gradient-to-r from-blue-600 to-indigo-500" />

                <div className="flex-1 p-5 sm:p-6">
                  {/* Profile Header */}
                  <div className="flex items-start gap-4">
                    {worker.profileImageUrl ? (
                      <img
                        src={worker.profileImageUrl}
                        alt={worker.name || "Worker"}
                        className="h-16 w-16 shrink-0 rounded-2xl border border-gray-100 object-cover"
                      />
                    ) : (
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-2xl font-bold text-blue-600">
                        {worker.name?.charAt(0).toUpperCase() || "W"}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <h4 className="truncate text-lg font-bold text-gray-900">
                        {worker.name || "Worker"}
                      </h4>

                      <p className="mt-1 truncate text-sm font-medium text-blue-600">
                        {worker.profession || "Profession not specified"}
                      </p>

                      <span
                        className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getAvailabilityStyle(
                          worker.availabilityStatus
                        )}`}
                      >
                        {worker.availabilityStatus || "Status not specified"}
                      </span>
                    </div>
                  </div>

                  {/* Worker Information */}
                  <div className="mt-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                        <Briefcase size={17} />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">
                          Experience
                        </p>
                        <p className="text-sm font-semibold text-gray-800">
                          {worker.experience ?? 0} years
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 text-green-600">
                        <MapPin size={17} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-gray-400">
                          Location
                        </p>
                        <p className="truncate text-sm font-semibold text-gray-800">
                          {worker.location || "Not specified"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                        <IndianRupee size={17} />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">
                          Expected Wage
                        </p>
                        <p className="text-sm font-semibold text-gray-800">
                          {formatWage(worker)}
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-gray-100 pt-4">
                      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                        <Award size={15} />
                        Skills
                      </div>

                      <p className="text-sm leading-6 text-gray-600">
                        {worker.skills || "Skills not specified"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="border-t border-gray-100 bg-gray-50/70 p-5">
                  <button
                    onClick={() =>
                      navigate(`/employer/workers/${worker.id}`)
                    }
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    <UserRound size={17} />
                    View Worker Profile
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

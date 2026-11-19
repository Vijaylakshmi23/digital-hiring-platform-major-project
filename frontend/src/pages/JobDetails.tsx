import { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../services/api";
import { useNavigate, useParams } from "react-router-dom";
import {
  MapPin,
  BriefcaseBusiness,
  IndianRupee,
  CalendarDays,
  Users,
  ArrowLeft,
  Clock,
  FileText,
  Loader2,
  AlertCircle,
  RefreshCw,
  Send,
  LogIn,
} from "lucide-react";
import Navbar from "../components/Navbar";

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
}

function formatDate(date: string) {
  if (!date) return "Not specified";

  const parsedDate = new Date(
    date.length === 10 ? `${date}T00:00:00` : date
  );

  if (Number.isNaN(parsedDate.getTime())) return date;

  return parsedDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");

  const [job, setJob] = useState<Job | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState("");
  const [applicationError, setApplicationError] = useState("");

  useEffect(() => {
    let active = true;

    const fetchJob = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await axios.get<Job>(
          `${API_BASE_URL}/api/jobs/${id}`
        );

        if (active) {
          setJob(response.data);
        }
      } catch (err) {
        console.error("Error fetching job:", err);

        if (active) {
          setError("Unable to load job details. Please try again.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    if (id) {
      fetchJob();
    } else {
      setError("Invalid job ID.");
      setLoading(false);
    }

    return () => {
      active = false;
    };
  }, [id]);

  const applyForJob = async () => {
    setApplicationError("");

    if (!token) {
      navigate("/login");
      return;
    }

    if (role !== "WORKER") {
      setApplicationError("Only registered workers can apply for jobs.");
      return;
    }

    if (!message.trim()) {
      setApplicationError("Please enter an application message.");
      return;
    }

    try {
      setApplying(true);

      await axios.post(
        `${API_BASE_URL}/api/applications/jobs/${id}`,
        { message: message.trim() },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      navigate("/worker/applications");
    } catch (err) {
      console.error("Application submission failed:", err);

      if (axios.isAxiosError(err) && err.response?.status === 409) {
        setApplicationError(
          "You have already applied for this job."
        );
      } else {
        setApplicationError(
          "Unable to submit your application. Please try again."
        );
      }
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
          <Loader2 className="h-9 w-9 animate-spin text-blue-600" />
          <p className="font-medium text-gray-600">
            Loading job details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <div className="mx-auto flex max-w-xl flex-col items-center px-6 py-24 text-center">
          <div className="rounded-full bg-red-100 p-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>

          <h2 className="mt-5 text-2xl font-bold text-gray-900">
            Unable to load job
          </h2>

          <p className="mt-2 text-gray-600">
            {error || "Job not found."}
          </p>

          <button
            onClick={() => window.location.reload()}
            className="mt-6 flex items-center gap-2 rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white transition hover:bg-blue-800"
          >
            <RefreshCw size={17} />
            Try Again
          </button>

          <button
            onClick={() => navigate("/jobs")}
            className="mt-4 font-medium text-blue-700 hover:underline"
          >
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  const jobType = job.jobType
    ? job.jobType.replace(/_/g, " ")
    : "Not specified";

  const budget = Number(job.budget);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
        <button
          onClick={() => navigate("/jobs")}
          className="mb-6 flex items-center gap-2 text-sm font-semibold text-blue-700 transition hover:text-blue-900"
        >
          <ArrowLeft size={18} />
          Back to Jobs
        </button>

        {/* Job Header */}
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-green-700">
                Open
              </span>

              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                {jobType}
              </span>
            </div>

            <h1 className="mt-5 text-2xl font-bold leading-tight text-gray-900 sm:text-3xl">
              {job.title}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-gray-500">
              <BriefcaseBusiness size={17} />
              <span className="font-medium text-blue-700">
                {job.requiredSkill || "Skill not specified"}
              </span>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <InfoItem
                icon={<MapPin />}
                label="Job Location"
                value={job.location || "Not specified"}
              />

              <InfoItem
                icon={<IndianRupee />}
                label="Total Budget"
                value={
                  Number.isFinite(budget)
                    ? `₹${budget.toLocaleString("en-IN")}`
                    : "Not specified"
                }
              />

              <InfoItem
                icon={<CalendarDays />}
                label="Start Date"
                value={formatDate(job.startDate)}
              />

              <InfoItem
                icon={<Users />}
                label="Workers Required"
                value={`${job.numberOfWorkers} worker(s)`}
              />

              <InfoItem
                icon={<Clock />}
                label="Duration"
                value={`${job.durationDays} days`}
              />
            </div>
          </div>

          {/* Job Description */}
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-2">
              <FileText className="text-blue-700" size={21} />
              <h2 className="text-xl font-bold text-gray-900">
                Job Description
              </h2>
            </div>

            <p className="mt-4 whitespace-pre-line text-sm leading-7 text-gray-600 sm:text-base">
              {job.description || "No job description provided."}
            </p>
          </div>

          {/* Application Section */}
          {role === "WORKER" && (
            <div className="border-t border-gray-100 bg-blue-50/40 p-6 sm:p-8">
              <div className="flex items-center gap-2">
                <Send className="text-blue-700" size={21} />
                <h2 className="text-xl font-bold text-gray-900">
                  Apply for this Job
                </h2>
              </div>

              <p className="mt-2 text-sm text-gray-600">
                Introduce yourself and explain why you are suitable
                for this work.
              </p>

              <label
                htmlFor="applicationMessage"
                className="mt-6 block text-sm font-semibold text-gray-700"
              >
                Application Message
              </label>

              <textarea
                id="applicationMessage"
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  setApplicationError("");
                }}
                rows={5}
                maxLength={1000}
                placeholder="Example: I have 3 years of experience in this field and have completed similar projects..."
                className="mt-2 w-full resize-y rounded-xl border border-gray-300 bg-white p-4 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />

              <div className="mt-2 flex justify-end text-xs text-gray-500">
                {message.length}/1000 characters
              </div>

              {applicationError && (
                <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  <AlertCircle
                    size={18}
                    className="mt-0.5 shrink-0"
                  />
                  <p>{applicationError}</p>
                </div>
              )}

              <button
                onClick={applyForJob}
                disabled={applying || !message.trim()}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-6 py-3.5 font-semibold text-white shadow-sm transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                {applying ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Submitting Application...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Apply Now
                  </>
                )}
              </button>
            </div>
          )}

          {/* Non-worker information */}
          {role !== "WORKER" && (
            <div className="border-t border-gray-100 bg-gray-50 p-6 sm:p-8">
              <p className="text-sm text-gray-600">
                {token
                  ? "Only worker accounts can apply for this job."
                  : "Please log in with your worker account to apply for this job."}
              </p>

              {!token && (
                <button
                  onClick={() => navigate("/login")}
                  className="mt-4 flex items-center gap-2 rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white transition hover:bg-blue-800"
                >
                  <LogIn size={18} />
                  Log In to Apply
                </button>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function InfoItem({ icon, label, value }: InfoItemProps) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4">
      <div className="mt-0.5 text-blue-600">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-500">
          {label}
        </p>
        <p className="mt-1 break-words text-sm font-semibold text-gray-900">
          {value}
        </p>
      </div>
    </div>
  );
}

export default JobDetails;

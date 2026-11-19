import { useState, type FormEvent, type ChangeEvent, type ReactNode } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../../services/api";
import {
  ArrowLeft,
  BriefcaseBusiness,
  MapPin,
  CalendarDays,
  IndianRupee,
  Users,
  Clock3,
  FileText,
  CheckCircle2,
} from "lucide-react";

const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export default function PostJob() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requiredSkill: "",
    location: "",
    jobType: "ONE_TIME",
    budget: "",
    startDate: "",
    durationDays: "",
    numberOfWorkers: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const payload = {
        ...formData,
        budget: Number(formData.budget),
        durationDays: Number(formData.durationDays),
        numberOfWorkers: Number(formData.numberOfWorkers),
      };

      await axios.post(
        `${API_BASE_URL}/api/jobs`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setSuccess("Your job has been posted successfully!");

      setTimeout(() => {
        navigate("/jobs");
      }, 1500);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(
          typeof err.response?.data === "string"
            ? err.response.data
            : err.response?.data?.message ||
                "Failed to post job. Please check your details."
        );
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/95 px-4 py-4 shadow-sm backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/employer/dashboard")}
            className="flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-blue-700"
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </button>

          <span className="text-sm font-semibold text-blue-700">
            Employer Portal
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:py-10">
        {/* Page heading */}
        <div className="mb-8">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
            <BriefcaseBusiness size={25} />
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Post a New Job
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Share your requirements and connect with skilled workers
            who can get the job done.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Job details */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <SectionHeading
              icon={<FileText size={20} />}
              title="Job Information"
              description="Tell workers what the job is about."
            />

            <div className="mt-6 space-y-5">
              <FormField label="Job Title" required>
                <input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Plumbing Repair Worker"
                  required
                  maxLength={150}
                  className="form-input"
                />
              </FormField>

              <FormField label="Job Description" required>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the work, responsibilities and any special requirements..."
                  required
                  rows={5}
                  className="form-input resize-y"
                />
              </FormField>

              <div className="grid gap-5 sm:grid-cols-2">
                <FormField label="Required Skill" required>
                  <input
                    name="requiredSkill"
                    value={formData.requiredSkill}
                    onChange={handleChange}
                    placeholder="e.g. Plumbing"
                    required
                    className="form-input"
                  />
                </FormField>

                <FormField label="Job Location" required>
                  <div className="relative">
                    <MapPin
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="e.g. Bengaluru"
                      required
                      className="form-input"
                    />
                  </div>
                </FormField>
              </div>

              <FormField label="Job Type" required>
                <select
                  name="jobType"
                  value={formData.jobType}
                  onChange={handleChange}
                  required
                  className="form-input"
                >
                  <option value="ONE_TIME">One Time</option>
                  <option value="RECURRING">Recurring</option>
                  <option value="LONG_TERM">Long Term</option>
                </select>
              </FormField>
            </div>
          </section>

          {/* Budget and workers */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <SectionHeading
              icon={<IndianRupee size={20} />}
              title="Budget and Workforce"
              description="Set the budget and number of workers you need."
            />

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <FormField label="Budget (₹)" required>
                <div className="relative">
                  <IndianRupee
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="number"
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    placeholder="e.g. 5000"
                    min="0.01"
                    step="0.01"
                    required
                    className="form-input"
                  />
                </div>
              </FormField>

              <FormField label="Number of Workers" required>
                <div className="relative">
                  <Users
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="number"
                    name="numberOfWorkers"
                    value={formData.numberOfWorkers}
                    onChange={handleChange}
                    placeholder="e.g. 2"
                    min="1"
                    step="1"
                    required
                    className="form-input"
                  />
                </div>
              </FormField>
            </div>
          </section>

          {/* Schedule */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <SectionHeading
              icon={<CalendarDays size={20} />}
              title="Job Schedule"
              description="When should the work begin and how long will it take?"
            />

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <FormField label="Start Date" required>
                <div className="relative">
                  <CalendarDays
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    min={getTodayDate()}
                    required
                    className="form-input"
                  />
                </div>
              </FormField>

              <FormField label="Duration (Days)" required>
                <div className="relative">
                  <Clock3
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="number"
                    name="durationDays"
                    value={formData.durationDays}
                    onChange={handleChange}
                    placeholder="e.g. 5"
                    min="1"
                    step="1"
                    required
                    className="form-input pl-10"
                  />
                </div>
              </FormField>
            </div>
          </section>

          {/* Messages */}
          {error && (
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <span className="font-bold">!</span>
              <p>{error}</p>
            </div>
          )}

          {success && (
            <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
              <CheckCircle2 size={20} className="shrink-0" />
              <p>{success}</p>
            </div>
          )}

          {/* Submit */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate("/employer/dashboard")}
              disabled={loading}
              className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading || !!success}
              className="flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-8 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Posting Job..." : success ? "Job Posted" : "Post Job"}
              {!loading && !success && <BriefcaseBusiness size={17} />}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

function SectionHeading({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 border-b border-slate-100 pb-5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
        {icon}
      </div>

      <div>
        <h2 className="font-bold text-slate-800">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
    </div>
  );
}

function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

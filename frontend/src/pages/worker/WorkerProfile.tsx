import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import axios from "axios";
import API_BASE_URL from "../../services/api";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  UserRound,
  Pencil,
  Save,
  X,
  Camera,
  Trash2,
  Briefcase,
  Mail,
  Phone,
  ShieldCheck,
  Star,
  IndianRupee,
  Loader2,
  Award,
  MessageSquare,
} from "lucide-react";

interface WorkerProfileData {
  id: number;
  name: string;
  email?: string;
  mobileNumber?: string;
  role?: string;
  profession: string | null;
  skills: string | null;
  location: string | null;
  description: string | null;
  wageType: string | null;
  availabilityStatus: string | null;
  expectedWage: number | null;
  experience: number | null;
  profileImageUrl: string | null;
  profileImagePublicId: string | null;
}

interface Review {
  id: number;
  bookingId: number;
  reviewerName: string;
  revieweeName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface RatingSummary {
  averageRating: number;
  totalReviews: number;
}

export default function WorkerProfile() {
  const [profile, setProfile] = useState<WorkerProfileData | null>(null);
  const [profession, setProfession] = useState("");
  const [experience, setExperience] = useState("");
  const [expectedWage, setExpectedWage] = useState("");

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [deletingImage, setDeletingImage] = useState(false);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [ratingSummary, setRatingSummary] = useState<RatingSummary | null>(null);

  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const authConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const fetchProfile = async () => {
    try {
      const response = await axios.get<WorkerProfileData>(
        `${API_BASE_URL}/api/workers/me`,
        authConfig
      );

      setProfile(response.data);
      setProfession(response.data.profession ?? "");
      setExperience(String(response.data.experience ?? 0));
      setExpectedWage(String(response.data.expectedWage ?? 0));
    } catch (err) {
      console.error("Unable to load profile:", err);
      setError("Unable to load your profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const [reviewsResponse, summaryResponse] = await Promise.all([
        axios.get<Review[]>(
          `${API_BASE_URL}/api/reviews/me`,
          authConfig
        ),
        axios.get<RatingSummary>(
          `${API_BASE_URL}/api/reviews/me/summary`,
          authConfig
        ),
      ]);

      setReviews(reviewsResponse.data);
      setRatingSummary(summaryResponse.data);
    } catch (err) {
      console.error("Unable to load reviews:", err);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchReviews();
  }, []);

  // Release temporary image preview URLs when they are replaced or removed.
  useEffect(() => {
    return () => {
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage]);

  const handleUpdate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const experienceValue = Number(experience);
    const wageValue = Number(expectedWage);

    if (
      experience.trim() === "" ||
      expectedWage.trim() === "" ||
      !Number.isFinite(experienceValue) ||
      !Number.isFinite(wageValue) ||
      experienceValue < 0 ||
      wageValue <= 0
    ) {
      setError("Please enter valid experience and expected wage.");
      return;
    }

    setSaving(true);

    try {
      const response = await axios.put<WorkerProfileData>(
        `${API_BASE_URL}/api/workers/me`,
        {
          profession: profession.trim(),
          skills: profile.skills,
          location: profile.location,
          description: profile.description,
          experience: experienceValue,
          expectedWage: wageValue,
          wageType: profile.wageType,
          availabilityStatus: profile.availabilityStatus,
        },
        authConfig
      );

      setProfile(response.data);
      setProfession(response.data.profession ?? "");
      setExperience(String(response.data.experience ?? 0));
      setExpectedWage(String(response.data.expectedWage ?? 0));
      setEditing(false);
      setSuccess("Your profile has been updated successfully.");
    } catch (err) {
      console.error("Profile update failed:", err);
      setError("Unable to update your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setError("");
    setSuccess("");

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setError("Only JPG, PNG and WEBP images are allowed.");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must not exceed 5 MB.");
      e.target.value = "";
      return;
    }

    setSelectedImage(file);
    setPreviewImage(URL.createObjectURL(file));

    // Allow selecting the same file again after cancelling.
    e.target.value = "";
  };

  const cancelImageSelection = () => {
    setSelectedImage(null);
    setPreviewImage(null);
    setError("");
  };

  const handleImageUpload = async () => {
    if (!selectedImage) {
      setError("Please select an image first.");
      return;
    }

    setUploadingImage(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("file", selectedImage);

      const response = await axios.post<WorkerProfileData>(
        `${API_BASE_URL}/api/workers/me/profile-image`,
        formData,
        authConfig
      );

      setProfile(response.data);
      setSelectedImage(null);
      setPreviewImage(null);
      setSuccess("Profile image uploaded successfully.");
    } catch (err) {
      console.error("Image upload failed:", err);
      setError("Unable to upload profile image. Please try again.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageDelete = async () => {
    if (!window.confirm("Are you sure you want to remove your profile image?")) {
      return;
    }

    setDeletingImage(true);
    setError("");
    setSuccess("");

    try {
      const response = await axios.delete<WorkerProfileData>(
        `${API_BASE_URL}/api/workers/me/profile-image`,
        authConfig
      );

      setProfile(response.data);
      setSelectedImage(null);
      setPreviewImage(null);
      setSuccess("Profile image removed successfully.");
    } catch (err) {
      console.error("Image removal failed:", err);
      setError("Unable to remove profile image. Please try again.");
    } finally {
      setDeletingImage(false);
    }
  };

  const cancelEditing = () => {
    setProfession(profile?.profession ?? "");
    setExperience(String(profile?.experience ?? 0));
    setExpectedWage(String(profile?.expectedWage ?? 0));
    setEditing(false);
    setError("");
    setSuccess("");
  };

  const formatDate = (date: string) => {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Date unavailable";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const averageRating = ratingSummary?.averageRating ?? 0;
  const roundedRating = Math.max(0, Math.min(5, Math.round(averageRating)));

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50">
        <Loader2 className="mb-4 h-10 w-10 animate-spin text-blue-600" />
        <p className="font-semibold text-gray-700">Loading your profile...</p>
        <p className="mt-1 text-sm text-gray-400">Please wait a moment.</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-5 text-center">
        <div className="rounded-2xl bg-red-50 p-5 text-red-500">
          <UserRound size={35} />
        </div>
        <h2 className="mt-4 text-xl font-bold text-gray-900">
          Profile unavailable
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          {error || "We couldn't find your profile."}
        </p>
        <button
          onClick={() => navigate("/worker/dashboard")}
          className="mt-6 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-gray-100 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate("/worker/dashboard")}
            className="inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-gray-600 transition hover:bg-blue-50 hover:text-blue-700"
          >
            <ArrowLeft size={19} />
            <span>Back to Dashboard</span>
          </button>

          <div className="flex items-center gap-2 text-sm font-bold text-blue-700">
            <UserRound size={19} />
            <span>My Profile</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
        {/* Page Introduction */}
        <div className="mb-7">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            Worker Workspace
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Your Profile
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">
            Manage your professional details, update your profile picture and
            keep track of your ratings and reviews.
          </p>
        </div>

        {/* Notifications */}
        {success && (
          <div
            role="status"
            className="mb-5 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-800"
          >
            <ShieldCheck className="mt-0.5 shrink-0" size={19} />
            {success}
            <button
              onClick={() => setSuccess("")}
              className="ml-auto text-green-700 hover:text-green-900"
              aria-label="Dismiss success message"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700"
          >
            <X className="mt-0.5 shrink-0" size={19} />
            {error}
            <button
              onClick={() => setError("")}
              className="ml-auto text-red-700 hover:text-red-900"
              aria-label="Dismiss error message"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {/* Profile Header Card */}
        <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="h-2 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500" />

          <div className="flex flex-col gap-6 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div className="flex min-w-0 flex-col items-center gap-5 sm:flex-row sm:items-center">
              {/* Profile Image */}
              <div className="relative shrink-0">
                <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-2xl border-4 border-blue-50 bg-blue-50 shadow-sm sm:h-32 sm:w-32">
                  {previewImage || profile.profileImageUrl ? (
                    <img
                      src={previewImage || profile.profileImageUrl || ""}
                      alt={`${profile.name}'s profile`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <UserRound size={55} className="text-blue-600" />
                  )}
                </div>

                <label
                  htmlFor="profileImage"
                  title="Change profile image"
                  className="absolute -bottom-2 -right-2 flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border-4 border-white bg-blue-600 text-white shadow-md transition hover:bg-blue-700"
                >
                  <Camera size={17} />
                </label>

                <input
                  id="profileImage"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleImageSelect}
                  disabled={uploadingImage || deletingImage}
                />
              </div>

              {/* Name and Details */}
              <div className="min-w-0 text-center sm:text-left">
                <h2 className="break-words text-2xl font-bold text-gray-900">
                  {profile.name || "Worker"}
                </h2>
                <p className="mt-1 text-sm font-medium text-blue-600">
                  {profile.profession || "Profession not added yet"}
                </p>
                <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-gray-500 sm:justify-start">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 font-semibold text-green-700">
                    <ShieldCheck size={14} />
                    Registered Worker
                  </span>
                  {ratingSummary && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 font-semibold text-amber-700">
                      <Star size={14} className="fill-amber-400" />
                      {averageRating.toFixed(1)} Rating
                    </span>
                  )}
                </div>
              </div>
            </div>

            {!editing && (
              <button
                onClick={() => {
                  setError("");
                  setSuccess("");
                  setEditing(true);
                }}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                <Pencil size={16} />
                Edit Profile
              </button>
            )}
          </div>

          {/* Image Actions */}
          {(selectedImage || profile.profileImageUrl) && (
            <div className="border-t border-gray-100 bg-gray-50/70 px-5 py-4 sm:px-8">
              {selectedImage ? (
                <div className="flex flex-wrap items-center gap-3">
                  <div className="mr-auto min-w-0">
                    <p className="text-sm font-semibold text-gray-800">
                      New profile image selected
                    </p>
                    <p className="max-w-xs truncate text-xs text-gray-500">
                      {selectedImage.name}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleImageUpload}
                    disabled={uploadingImage}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
                  >
                    {uploadingImage ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Camera size={16} />
                    )}
                    {uploadingImage ? "Uploading..." : "Upload Image"}
                  </button>

                  <button
                    type="button"
                    onClick={cancelImageSelection}
                    disabled={uploadingImage}
                    className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-100 disabled:opacity-60"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-gray-500">
                    Your profile picture is visible on your worker profile.
                  </p>
                  <button
                    type="button"
                    onClick={handleImageDelete}
                    disabled={deletingImage}
                    className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                  >
                    {deletingImage ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                    {deletingImage ? "Removing..." : "Remove Image"}
                  </button>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Personal Information */}
        <section className="mt-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <UserRound size={20} />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">Personal Information</h2>
              <p className="text-xs text-gray-500">
                Your registered account details
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <InfoCard
              icon={<UserRound size={18} />}
              label="Full Name"
              value={profile.name || "Not provided"}
            />
            <InfoCard
              icon={<Mail size={18} />}
              label="Email Address"
              value={profile.email || "Not provided"}
            />
            <InfoCard
              icon={<Phone size={18} />}
              label="Mobile Number"
              value={profile.mobileNumber || "Not provided"}
            />
            <InfoCard
              icon={<ShieldCheck size={18} />}
              label="Account Role"
              value={profile.role || "WORKER"}
            />
          </div>
        </section>

        {/* Professional Information */}
        <section className="mt-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <Briefcase size={20} />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">
                Professional Information
              </h2>
              <p className="text-xs text-gray-500">
                Your experience and expected earnings
              </p>
            </div>
          </div>

          {editing ? (
            <form onSubmit={handleUpdate} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label
                    htmlFor="profession"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Profession
                  </label>
                  <div className="relative">
                    <Briefcase
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      id="profession"
                      type="text"
                      maxLength={100}
                      required
                      value={profession}
                      onChange={(e) => setProfession(e.target.value)}
                      placeholder="e.g. Carpenter, Plumber, Electrician"
                      className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="experience"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Experience (Years)
                  </label>
                  <div className="relative">
                    <Briefcase
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      id="experience"
                      type="number"
                      min="0"
                      step="1"
                      required
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="expectedWage"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Expected Daily Wage (₹)
                  </label>
                  <div className="relative">
                    <IndianRupee
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      id="expectedWage"
                      type="number"
                      min="1"
                      step="0.01"
                      required
                      value={expectedWage}
                      onChange={(e) => setExpectedWage(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 border-t border-gray-100 pt-5">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <Loader2 size={17} className="animate-spin" />
                  ) : (
                    <Save size={17} />
                  )}
                  {saving ? "Saving..." : "Save Changes"}
                </button>

                <button
                  type="button"
                  onClick={cancelEditing}
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-60"
                >
                  <X size={17} />
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <InfoCard
                  icon={<Briefcase size={18} />}
                  label="Profession"
                  value={profile.profession || "Not specified"}
                />
                <InfoCard
                  icon={<Briefcase size={18} />}
                  label="Work Experience"
                  value={`${profile.experience ?? 0} years`}
                />
                <InfoCard
                  icon={<IndianRupee size={18} />}
                  label="Expected Daily Wage"
                  value={`₹${(profile.expectedWage ?? 0).toLocaleString("en-IN")} / day`}
                />
              </div>

              <div className="mt-5 border-t border-gray-100 pt-5">
                <button
                  onClick={() => {
                    setError("");
                    setSuccess("");
                    setEditing(true);
                  }}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-800"
                >
                  <Pencil size={15} />
                  Update Professional Information
                </button>
              </div>
            </>
          )}
        </section>

        {/* Ratings and Reviews */}
        <section className="mt-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Award size={20} />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">Ratings & Reviews</h2>
              <p className="text-xs text-gray-500">
                Feedback received from employers
              </p>
            </div>
          </div>

          {/* Rating Summary */}
          {ratingSummary && (
            <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-amber-100 bg-amber-50/60 p-5 sm:flex-row sm:items-center">
              <div className="text-center sm:min-w-32">
                <p className="text-4xl font-bold text-gray-900">
                  {averageRating.toFixed(1)}
                </p>
                <div
                  className="mt-1 flex justify-center gap-0.5 text-amber-500"
                  aria-label={`${averageRating.toFixed(1)} out of 5 stars`}
                >
                  {Array.from({ length: 5 }, (_, index) => (
                    <Star
                      key={index}
                      size={17}
                      className={
                        index < roundedRating ? "fill-amber-400" : ""
                      }
                    />
                  ))}
                </div>
              </div>

              <div className="sm:border-l sm:border-amber-200 sm:pl-6">
                <p className="font-semibold text-gray-900">
                  Your overall rating
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  Based on {ratingSummary.totalReviews}{" "}
                  {ratingSummary.totalReviews === 1 ? "review" : "reviews"} from
                  employers.
                </p>
              </div>
            </div>
          )}

          {reviews.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 px-5 py-10 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                <MessageSquare size={22} />
              </div>
              <h3 className="mt-3 font-semibold text-gray-800">
                No reviews yet
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Reviews from employers will appear here after completed work.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <article
                  key={review.id}
                  className="rounded-xl border border-gray-100 p-4 transition hover:border-blue-100 sm:p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 font-bold text-blue-600">
                        {review.reviewerName?.charAt(0).toUpperCase() || "E"}
                      </div>
                      <div className="min-w-0">
                        <h3 className="truncate font-semibold text-gray-900">
                          {review.reviewerName || "Employer"}
                        </h3>
                        <p className="mt-0.5 text-xs text-gray-500">
                          Employer review
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex justify-end gap-0.5 text-amber-500">
                        {Array.from({ length: 5 }, (_, index) => (
                          <Star
                            key={index}
                            size={15}
                            className={
                              index < Math.max(0, Math.min(5, review.rating))
                                ? "fill-amber-400"
                                : ""
                            }
                          />
                        ))}
                      </div>
                      <p className="mt-1 text-xs text-gray-400">
                        {formatDate(review.createdAt)}
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-gray-600">
                    {review.comment || "No written comment provided."}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Footer Note */}
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/70 p-4">
          <ShieldCheck className="mt-0.5 shrink-0 text-blue-600" size={19} />
          <p className="text-xs leading-5 text-blue-800 sm:text-sm">
            Keep your professional information and profile picture up to date.
            A complete profile helps employers understand your experience and
            qualifications.
          </p>
        </div>
      </main>
    </div>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/80 p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-500">{label}</p>
        <p className="mt-1 break-words text-sm font-semibold text-gray-900">
          {value}
        </p>
      </div>
    </div>
  );
}

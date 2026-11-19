import { useEffect, useState } from "react";
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
  Upload,
} from "lucide-react";

interface EmployerProfileData {
  id: number;
  employerName: string;
  companyName: string | null;
  employerType: "INDIVIDUAL" | "BUSINESS" | null;
  location: string | null;
  description: string | null;
  profileImageUrl: string | null;
}

export default function EmployerProfile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState<EmployerProfileData | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [employerType, setEmployerType] = useState<
    "INDIVIDUAL" | "BUSINESS"
  >("INDIVIDUAL");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [deletingImage, setDeletingImage] = useState(false);

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token = localStorage.getItem("token");

  const authHeaders = {
    Authorization: `Bearer ${token}`,
  };

  // Generate and clean up selected image preview
  useEffect(() => {
    if (!selectedImage) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedImage);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedImage]);

  const fetchProfile = async () => {
    try {
      const response = await axios.get<EmployerProfileData>(
        `${API_BASE_URL}/api/employers/me`,
        { headers: authHeaders }
      );

      setProfile(response.data);
      setCompanyName(response.data.companyName ?? "");
      setEmployerType(response.data.employerType ?? "INDIVIDUAL");
      setLocation(response.data.location ?? "");
      setDescription(response.data.description ?? "");
    } catch (err) {
      console.error("Unable to load employer profile:", err);
      setError("Unable to load your profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleImageSelection = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setError("");
    setSuccess("");

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Please select a JPG, PNG, or WEBP image.");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must not exceed 5 MB.");
      e.target.value = "";
      return;
    }

    setSelectedImage(file);
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

      const response = await axios.post<EmployerProfileData>(
        `${API_BASE_URL}/api/employers/me/profile-image`,
        formData,
        {
          headers: authHeaders,
        }
      );

      setProfile(response.data);
      setSelectedImage(null);
      setSuccess("Profile picture uploaded successfully!");
    } catch (err) {
      console.error("Image upload failed:", err);
      setError("Unable to upload image. Please try again.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageDelete = async () => {
    if (!profile?.profileImageUrl) return;

    const confirmed = window.confirm(
      "Are you sure you want to remove your profile picture?"
    );

    if (!confirmed) return;

    setDeletingImage(true);
    setError("");
    setSuccess("");

    try {
      const response = await axios.delete<EmployerProfileData>(
        `${API_BASE_URL}/api/employers/me/profile-image`,
        {
          headers: authHeaders,
        }
      );

      setProfile(response.data);
      setSelectedImage(null);
      setSuccess("Profile picture removed successfully!");
    } catch (err) {
      console.error("Image deletion failed:", err);
      setError("Unable to remove profile picture. Please try again.");
    } finally {
      setDeletingImage(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!companyName.trim() || !location.trim() || !description.trim()) {
      setError("Please fill in all the required fields.");
      return;
    }

    setSaving(true);

    try {
      const response = await axios.put<EmployerProfileData>(
        `${API_BASE_URL}/api/employers/me`,
        {
          companyName: companyName.trim(),
          employerType,
          location: location.trim(),
          description: description.trim(),
        },
        {
          headers: authHeaders,
        }
      );

      setProfile(response.data);
      setCompanyName(response.data.companyName ?? "");
      setEmployerType(response.data.employerType ?? "INDIVIDUAL");
      setLocation(response.data.location ?? "");
      setDescription(response.data.description ?? "");
      setEditing(false);
      setSuccess("Employer profile updated successfully!");
    } catch (err) {
      console.error("Unable to update employer profile:", err);
      setError("Unable to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-10 text-center">Loading profile...</div>;
  }

  if (!profile) {
    return (
      <div className="p-10 text-center">
        <p className="text-red-600">{error || "Profile not found."}</p>
        <button
          onClick={() => navigate("/employer/dashboard")}
          className="mt-4 rounded-lg bg-blue-700 px-4 py-2 text-white"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const displayedImage =
    previewUrl || profile.profileImageUrl;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white px-6 py-4 shadow-sm">
        <button
          onClick={() => navigate("/employer/dashboard")}
          className="flex items-center gap-2 text-blue-700"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-8">

          {/* Profile heading and picture */}
          <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="relative h-24 w-24 shrink-0">
                {displayedImage ? (
                  <img
                    src={displayedImage}
                    alt="Employer profile"
                    className="h-24 w-24 rounded-full border-4 border-blue-100 object-cover"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                    <UserRound size={44} />
                  </div>
                )}

                <label
                  htmlFor="employer-profile-image"
                  className="absolute bottom-0 right-0 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-blue-700 text-white shadow hover:bg-blue-800"
                  title="Choose profile picture"
                >
                  <Camera size={17} />
                </label>

                <input
                  id="employer-profile-image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleImageSelection}
                />
              </div>

              <div>
                <h1 className="text-xl font-bold text-gray-800 sm:text-2xl">
                  {profile.employerName}
                </h1>
                <p className="text-gray-500">Employer Profile</p>
                <p className="mt-1 text-xs text-gray-400">
                  JPG, PNG or WEBP · Maximum 5 MB
                </p>
              </div>
            </div>

            {!editing && (
              <button
                onClick={() => {
                  setError("");
                  setSuccess("");
                  setEditing(true);
                }}
                className="flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-white hover:bg-blue-800"
              >
                <Pencil size={16} />
                Edit Profile
              </button>
            )}
          </div>

          {/* Image upload controls */}
          {selectedImage && (
            <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50 p-4">
              <p className="mb-3 text-sm font-medium text-blue-900">
                New profile picture selected: {selectedImage.name}
              </p>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleImageUpload}
                  disabled={uploadingImage}
                  className="flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-white hover:bg-blue-800 disabled:opacity-60"
                >
                  <Upload size={16} />
                  {uploadingImage ? "Uploading..." : "Upload Picture"}
                </button>

                <button
                  onClick={() => setSelectedImage(null)}
                  disabled={uploadingImage}
                  className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  <X size={16} />
                  Cancel Selection
                </button>
              </div>
            </div>
          )}

          {profile.profileImageUrl && !selectedImage && (
            <div className="mb-6">
              <button
                onClick={handleImageDelete}
                disabled={deletingImage}
                className="flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-60"
              >
                <Trash2 size={16} />
                {deletingImage ? "Removing..." : "Remove Profile Picture"}
              </button>
            </div>
          )}

          {success && (
            <p className="mb-5 rounded-lg bg-green-100 p-3 text-green-700">
              {success}
            </p>
          )}

          {error && (
            <p className="mb-5 rounded-lg bg-red-100 p-3 text-red-700">
              {error}
            </p>
          )}

          {/* Profile editing form */}
          {editing ? (
            <form onSubmit={handleUpdate} className="space-y-5">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Company / Employer Name
                </label>
                <input
                  type="text"
                  required
                  maxLength={255}
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full rounded-lg border p-3"
                  placeholder="Enter company or employer name"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Employer Type
                </label>
                <select
                  value={employerType}
                  onChange={(e) =>
                    setEmployerType(
                      e.target.value as "INDIVIDUAL" | "BUSINESS"
                    )
                  }
                  className="w-full rounded-lg border p-3"
                >
                  <option value="INDIVIDUAL">Individual</option>
                  <option value="BUSINESS">Business</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Location
                </label>
                <input
                  type="text"
                  required
                  maxLength={255}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full rounded-lg border p-3"
                  placeholder="Enter your location"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  About Company / Employer
                </label>
                <textarea
                  required
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-lg border p-3"
                  placeholder="Tell workers about your company or work"
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-lg bg-blue-700 px-5 py-2 text-white hover:bg-blue-800 disabled:opacity-60"
                >
                  <Save size={16} />
                  {saving ? "Saving..." : "Save Changes"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCompanyName(profile.companyName ?? "");
                    setEmployerType(profile.employerType ?? "INDIVIDUAL");
                    setLocation(profile.location ?? "");
                    setDescription(profile.description ?? "");
                    setEditing(false);
                    setError("");
                  }}
                  className="flex items-center gap-2 rounded-lg border px-5 py-2"
                >
                  <X size={16} />
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              <ProfileField
                label="Company / Employer Name"
                value={profile.companyName || "Not provided"}
              />

              <ProfileField
                label="Employer Type"
                value={
                  profile.employerType === "BUSINESS"
                    ? "Business"
                    : profile.employerType === "INDIVIDUAL"
                    ? "Individual"
                    : "Not provided"
                }
              />

              <ProfileField
                label="Location"
                value={profile.location || "Not provided"}
              />

              <div className="rounded-lg bg-gray-50 p-4 sm:col-span-2">
                <p className="text-sm text-gray-500">Description</p>
                <p className="mt-1 whitespace-pre-wrap font-semibold text-gray-800">
                  {profile.description || "Not provided"}
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function ProfileField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg bg-gray-50 p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 font-semibold text-gray-800">{value}</p>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../../services/api";
import {
  UserRound,
  BriefcaseBusiness,
  ClipboardList,
  CalendarDays,
  PlusCircle,
  Users,
  MapPin,
  Building2,
  Pencil,
} from "lucide-react";

import Navbar from "../../components/Navbar";

interface EmployerProfileData {
  id: number;
  employerName: string;
  companyName: string | null;
  employerType: "INDIVIDUAL" | "BUSINESS" | null;
  location: string | null;
  description: string | null;
  profileImageUrl: string | null;
}

export default function EmployerDashboard() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState<EmployerProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get<EmployerProfileData>(
          `${API_BASE_URL}/api/employers/me`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setProfile(response.data);
      } catch (err) {
        console.error("Unable to load employer profile:", err);
        setError("Unable to load employer profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const dashboardItems = [
    {
      title: "My Profile",
      description: "View and update your employer details",
      icon: <UserRound size={24} />,
      path: "/employer/profile",
    },
    {
      title: "Post a Job",
      description: "Create a new job opportunity",
      icon: <PlusCircle size={24} />,
      path: "/employer/post-job",
    },
    {
      title: "Manage Jobs",
      description: "View and manage your job postings",
      icon: <BriefcaseBusiness size={24} />,
      path: "/employer/manage-jobs",
    },
    {
      title: "Applications",
      description: "Review applications from workers",
      icon: <ClipboardList size={24} />,
      path: "/employer/applications",
    },
    {
      title: "Bookings",
      description: "Manage your worker bookings",
      icon: <CalendarDays size={24} />,
      path: "/employer/bookings",
    },
    {
      title: "Direct Hire Offers",
      description: "Send and track direct hiring requests to workers",
      icon: <Users size={24} />,
      path: "/employer/direct-hire-offers",
    },
    {
      title: "Find Workers",
      description: "Discover skilled workers for your jobs",
      icon: <Users size={24} />,
      path: "/employer/workers",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="mb-8 rounded-2xl bg-gradient-to-r from-[#102A56] to-[#2458E8] p-7 text-white shadow-lg">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-200">
            Employer Dashboard
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Welcome, {localStorage.getItem("userName") || "Employer"}!
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100">
            Manage your job opportunities, discover skilled workers, and
            keep track of your hiring activities.
          </p>
        </section>

        <div className="grid items-start gap-8 lg:grid-cols-[1fr_1.1fr]">
          {/* LEFT: QUICK ACCESS */}
          <section>
            <div className="mb-5">
              <h2 className="text-xl font-bold text-gray-800">
                Quick Access
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Everything you need to manage your hiring activities.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {dashboardItems.map((item) => (
                <button
                  key={item.title}
                  onClick={() => navigate(item.path)}
                  className="group rounded-xl border border-gray-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-md"
                >
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-700 transition group-hover:bg-blue-700 group-hover:text-white">
                    {item.icon}
                  </div>

                  <h3 className="font-semibold text-gray-800">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-sm leading-5 text-gray-500">
                    {item.description}
                  </p>
                </button>
              ))}
            </div>
          </section>

          {/* RIGHT: EMPLOYER PROFILE */}
          <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Employer Profile
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Your professional information
                </p>
              </div>

              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-white text-blue-700 shadow-sm">
                {profile?.profileImageUrl ? (
                  <img
                    src={profile.profileImageUrl}
                    alt="Employer profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Building2 size={30} />
                )}
              </div>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="py-12 text-center text-gray-500">
                  Loading employer profile...
                </div>
              ) : error ? (
                <div className="py-10 text-center">
                  <p className="text-sm text-red-600">{error}</p>
                  <button
                    onClick={() => navigate("/employer/profile")}
                    className="mt-4 text-sm font-semibold text-blue-700 hover:underline"
                  >
                    Open Profile
                  </button>
                </div>
              ) : profile ? (
                <>
                  <div className="mb-6 flex items-center gap-4">
                    <div className="min-w-0">
                      <h3 className="text-2xl font-bold text-gray-800">
                        {profile.employerName}
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        {profile.employerType === "BUSINESS"
                          ? "Business Employer"
                          : profile.employerType === "INDIVIDUAL"
                          ? "Individual Employer"
                          : "Employer"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Company / Employer Name
                      </p>
                      <p className="mt-1 font-semibold text-gray-800">
                        {profile.companyName || "Not provided"}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-gray-400">
                        <MapPin size={16} />
                        <p className="text-xs font-semibold uppercase tracking-wide">
                          Location
                        </p>
                      </div>
                      <p className="mt-1 font-semibold text-gray-800">
                        {profile.location || "Not provided"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                        About Employer
                      </p>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-600">
                        {profile.description || "No description added yet."}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate("/employer/profile")}
                    className="mt-8 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
                  >
                    <Pencil size={16} />
                    Edit Profile
                  </button>
                </>
              ) : null}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

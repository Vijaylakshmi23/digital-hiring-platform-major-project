import { useNavigate } from "react-router-dom";
import {
  BriefcaseBusiness,
  CalendarDays,
  ClipboardList,
  UserRound,
  Handshake,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import WorkerAvailabilityPreview from "../../components/WorkerAvailabilityPreview";

export default function WorkerDashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 py-10">
        {/* Welcome Banner */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#102A56] to-[#2458E8] p-8 text-white shadow-lg md:p-10">
          <div className="relative z-10 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-200">
              Worker Dashboard
            </p>

            <h2 className="mt-3 text-3xl font-bold md:text-4xl">
              Welcome to LabourConnect!
            </h2>

            <p className="mt-3 text-sm leading-6 text-blue-100 md:text-base">
              Find meaningful work opportunities, manage your applications,
              and keep your professional profile up to date.
            </p>

            <button
              onClick={() => navigate("/jobs")}
              className="mt-6 rounded-lg bg-white px-6 py-3 text-sm font-bold text-blue-700 transition hover:bg-blue-50"
            >
              Explore Jobs
            </button>
          </div>

          <div className="pointer-events-none absolute -right-12 -top-16 h-64 w-64 rounded-full border-[35px] border-white/10" />
        </section>

        {/* Dashboard Content */}
        <div className="mt-8 grid grid-cols-1 items-start gap-6 lg:grid-cols-[1.1fr_0.9fr]">

          {/* Left: Quick Access */}
          <section>
            <div className="mb-5">
              <h2 className="text-xl font-bold text-slate-800">
                Quick Access
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Manage your work activities from one place.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <DashboardCard
                title="My Profile"
                description="View and update your professional profile."
                icon={<UserRound size={28} />}
                onClick={() => navigate("/worker/profile")}
              />

              <DashboardCard
                title="Find Jobs"
                description="Explore available work opportunities."
                icon={<BriefcaseBusiness size={28} />}
                onClick={() => navigate("/jobs")}
              />

              <DashboardCard
                title="My Applications"
                description="Track the status of your job applications."
                icon={<ClipboardList size={28} />}
                onClick={() => navigate("/worker/applications")}
              />

              <DashboardCard
                title="My Bookings"
                description="View your confirmed work bookings."
                icon={<CalendarDays size={28} />}
                onClick={() => navigate("/worker/bookings")}
              />

              <DashboardCard
                title="Direct Hire Requests"
                description="View and accept or reject direct hiring offers from employers."
                icon={<Handshake size={28} />}
                onClick={() => navigate("/worker/direct-hire-offers")}
              />
            </div>
          </section>

          {/* Right: Availability Calendar */}
          <section>
            <WorkerAvailabilityPreview />
          </section>

        </div>
      </main>
    </div>
  );
}

function DashboardCard({
  title,
  description,
  icon,
  onClick,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100/50"
    >
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
        {icon}
      </div>

      <h3 className="text-lg font-bold text-slate-800">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {description}
      </p>
    </button>
  );
}

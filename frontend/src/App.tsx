import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Jobs from "./pages/Jobs";
import JobDetails from "./pages/JobDetails";
import WorkerDashboard from "./pages/worker/WorkerDashboard";
import WorkerProfile from "./pages/worker/WorkerProfile";
import WorkerBookings from "./pages/worker/WorkerBookings";
import WorkerApplications from "./pages/worker/WorkerApplications";
import EmployerDashboard from "./pages/employer/EmployerDashboard";
import PostJob from "./pages/employer/PostJob";
import ManageJobs from "./pages/employer/ManageJobs";
import Applications from "./pages/employer/Applications";
import EmployerBookings from "./pages/employer/EmployerBookings";
import ProtectedRoute from "./components/ProtectedRoute";
import WorkerDetails from "./pages/employer/WorkerDetails";
import FindWorkers from "./pages/employer/FindWorkers";
import WorkerAvailability from "./pages/worker/WorkerAvailability";
import EmployerProfile from "./pages/employer/EmployerProfile";
import DirectHireOffers from "./pages/worker/DirectHireOffers";
import EmployerDirectHireOffers from "./pages/employer/EmployerDirectHireOffers";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/jobs/:id" element={<JobDetails />} />

        {/* Worker Routes */}
        <Route element={<ProtectedRoute allowedRole="WORKER" />}>
          <Route path="/worker/dashboard" element={<WorkerDashboard />} />
          <Route path="/worker/profile" element={<WorkerProfile />} />
          <Route path="/worker/bookings" element={<WorkerBookings />} />
          <Route path="/worker/applications" element={<WorkerApplications />} />
          <Route path="/worker/availability" element={<WorkerAvailability />} />
          <Route path="/worker/direct-hire-offers" element={<DirectHireOffers />} />
        </Route>

        {/* Employer Routes */}
        <Route element={<ProtectedRoute allowedRole="EMPLOYER" />}>
          <Route path="/employer/dashboard" element={<EmployerDashboard />} />
          <Route path="/employer/post-job" element={<PostJob />} />
          <Route path="/employer/manage-jobs" element={<ManageJobs />} />
          <Route path="/employer/applications" element={<Applications />} />
          <Route path="/employer/bookings" element={<EmployerBookings />} />
          <Route path="/employer/workers/:id" element={<WorkerDetails />} />
          <Route path="/employer/workers" element={<FindWorkers />} />
          <Route path="/employer/profile" element={<EmployerProfile />} />
          <Route path="/employer/direct-hire-offers" element={<EmployerDirectHireOffers />} />
          
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
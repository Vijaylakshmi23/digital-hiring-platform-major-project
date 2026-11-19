
import { Link, useNavigate } from 'react-router-dom'
import {
  BriefcaseBusiness,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  Search,
  Users,
  PlusCircle,
  ClipboardList,
  ChevronDown
} from 'lucide-react'
import { useState } from 'react'

export default function Navbar() {
  const navigate = useNavigate()

  const [token, setToken] = useState(localStorage.getItem('token'))
  const [menuOpen, setMenuOpen] = useState(false)
  const [hireMenuOpen, setHireMenuOpen] = useState(false)
  const role = localStorage.getItem('role')
  const userName = localStorage.getItem('userName')

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    localStorage.removeItem('userName')
    localStorage.removeItem('userEmail')
    localStorage.removeItem('role')

    setToken(null)
    setMenuOpen(false)

    navigate('/login', { replace: true })
  }

  const closeMenu = () => setMenuOpen(false)

  const dashboardLink =
    role === 'WORKER' ? '/worker/dashboard' : '/employer/dashboard'

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-12">

        {/* Brand */}
        <Link
          to="/"
          onClick={closeMenu}
          className="flex items-center gap-2.5"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2458E8] text-white shadow-md shadow-blue-200">
            <BriefcaseBusiness size={23} />
          </div>

          <span className="text-xl font-extrabold tracking-tight text-[#0D1D38] md:text-2xl">
            Labour<span className="text-[#2458E8]">Connect</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-8 md:flex">

          <Link
            to="/"
            className="text-sm font-medium text-slate-600 transition hover:text-[#2458E8]"
          >
            Home
          </Link>

          <Link
            to="/jobs"
            className="flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-[#2458E8]"
          >
            <Search size={16} />
            Find Jobs
          </Link>

          {token && role === 'EMPLOYER' && (
            <div className="relative">
              <button
                onClick={() => setHireMenuOpen(!hireMenuOpen)}
                className="flex items-center gap-2 text-sm font-semibold text-slate-700 transition hover:text-[#2458E8]"
              >
                Hire Workers
                <ChevronDown
                  size={16}
                  className={`transition-transform ${hireMenuOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {hireMenuOpen && (
                <div className="absolute left-0 top-full mt-3 w-52 rounded-xl border border-slate-100 bg-white p-2 shadow-xl">
                  <Link
                    to="/employer/workers"
                    onClick={() => setHireMenuOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-slate-700 hover:bg-blue-50 hover:text-[#2458E8]"
                  >
                    <Users size={17} />
                    Find Workers
                  </Link>

                  <Link
                    to="/employer/post-job"
                    onClick={() => setHireMenuOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-slate-700 hover:bg-blue-50 hover:text-[#2458E8]"
                  >
                    <PlusCircle size={17} />
                    Post a Job
                  </Link>

                  <Link
                    to="/employer/manage-jobs"
                    onClick={() => setHireMenuOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-slate-700 hover:bg-blue-50 hover:text-[#2458E8]"
                  >
                    <ClipboardList size={17} />
                    Manage Jobs
                  </Link>
                </div>
              )}
            </div>
          )}

          {token ? (
            <>
              <Link
                to={dashboardLink}
                className="flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-[#2458E8]"
              >
                <LayoutDashboard size={16} />
                Dashboard
              </Link>

              <span className="text-sm font-medium text-[#0D1D38]">
                Hi, {userName || 'User'}
              </span>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-xl bg-red-50 px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100"
              >
                <LogOut size={17} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-semibold text-slate-600 transition hover:text-[#2458E8]"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="rounded-xl bg-[#2458E8] px-6 py-3 text-sm font-semibold text-white shadow-md shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-800"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="rounded-lg p-2 text-[#0D1D38] transition hover:bg-blue-50 md:hidden"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={25} /> : <Menu size={25} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {menuOpen && (
        <div className="border-t border-slate-100 bg-white px-6 py-5 shadow-lg md:hidden">
          <div className="flex flex-col gap-2">

            <Link
              to="/"
              onClick={closeMenu}
              className="rounded-lg px-4 py-3 font-medium text-slate-700 hover:bg-blue-50 hover:text-[#2458E8]"
            >
              Home
            </Link>

            <Link
              to="/jobs"
              onClick={closeMenu}
              className="flex items-center gap-3 rounded-lg px-4 py-3 font-medium text-slate-700 hover:bg-blue-50 hover:text-[#2458E8]"
            >
              <Search size={18} />
              Find Jobs
            </Link>

            {token && role === 'EMPLOYER' && (
              <Link
                to="/employer/workers"
                onClick={closeMenu}
                className="flex items-center gap-3 rounded-lg px-4 py-3 font-medium text-slate-700 hover:bg-blue-50 hover:text-[#2458E8]"
              >
                <Users size={18} />
                Find Workers
              </Link>
            )}

            {token && role === 'EMPLOYER' && (
              <>
                <Link
                  to="/employer/post-job"
                  onClick={closeMenu}
                  className="flex items-center gap-3 rounded-lg px-4 py-3 font-medium text-slate-700 hover:bg-blue-50 hover:text-[#2458E8]"
                >
                  <PlusCircle size={18} />
                  Post a Job
                </Link>

                <Link
                  to="/employer/manage-jobs"
                  onClick={closeMenu}
                  className="flex items-center gap-3 rounded-lg px-4 py-3 font-medium text-slate-700 hover:bg-blue-50 hover:text-[#2458E8]"
                >
                  <ClipboardList size={18} />
                  Manage Jobs
                </Link>
              </>
            )}

            {token ? (
              <>
                <Link
                  to={dashboardLink}
                  onClick={closeMenu}
                  className="flex items-center gap-3 rounded-lg px-4 py-3 font-medium text-slate-700 hover:bg-blue-50 hover:text-[#2458E8]"
                >
                  <LayoutDashboard size={18} />
                  Dashboard
                </Link>

                <div className="my-2 border-t border-slate-100" />

                <p className="px-4 py-2 text-sm font-medium text-slate-500">
                  Signed in as {userName || 'User'}
                </p>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 rounded-lg bg-red-50 px-4 py-3 text-left font-semibold text-red-600 hover:bg-red-100"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="rounded-lg px-4 py-3 font-medium text-slate-700 hover:bg-blue-50 hover:text-[#2458E8]"
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  onClick={closeMenu}
                  className="mt-2 rounded-xl bg-[#2458E8] px-5 py-3 text-center font-semibold text-white shadow-md hover:bg-blue-800"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

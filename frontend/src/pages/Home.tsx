import { Link, useNavigate } from 'react-router-dom'
import {
  Search, MapPin, Hammer, Wrench, PaintBucket,
  Zap, Truck, Sparkles, ArrowRight, Users, ShieldCheck
} from 'lucide-react'
import { useState } from 'react'
import Navbar from '../components/Navbar'

const categories = [
  { name: 'Construction', icon: Hammer },
  { name: 'Plumbing', icon: Wrench },
  { name: 'Painting', icon: PaintBucket },
  { name: 'Electrical', icon: Zap },
  { name: 'Transportation', icon: Truck },
  { name: 'Cleaning', icon: Sparkles },
]

export default function Home() {
  const navigate = useNavigate()
  const [skillSearch, setSkillSearch] = useState('')
  const [locationSearch, setLocationSearch] = useState('')
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      
    <section
      className="relative overflow-hidden px-6 py-20 md:px-12 lg:py-28"
      style={{
        backgroundColor: '#F7F8FC',
        backgroundImage:
          'linear-gradient(rgba(30, 64, 120, 0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(30, 64, 120, 0.045) 1px, transparent 1px)',
        backgroundSize: '44px 44px',
      }}
    >
      <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2">

        {/* Left content */}
        <div className="relative z-10">
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-800 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-blue-600" />
            India's skilled trades marketplace
          </span>

          <h1 className="mt-7 text-5xl font-extrabold leading-[1.08] tracking-tight text-[#0D1D38] md:text-6xl xl:text-7xl">
            Hire skilled hands.
            <br />
            Find honest work.
            <br />
            <span className="text-[#2458E8]">Build together.</span>
          </h1>

          <p className="mt-7 max-w-xl text-base leading-8 text-slate-600 md:text-lg">
            LabourConnect connects skilled workers with employers who need them.
            Discover opportunities, connect directly and build a better future
            through reliable work.
          </p>

          {/* Search bar */}
          <div className="mt-9 flex max-w-2xl flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-xl shadow-slate-200/60 sm:flex-row">
            <div className="flex flex-1 items-center gap-3 px-3">
              <Search className="shrink-0 text-[#2458E8]" size={21} />
              <input
                type="text"
                placeholder="What work are you looking for?"
                value={skillSearch}
                onChange={e => setSkillSearch(e.target.value)}
                className="w-full bg-transparent py-3 text-sm text-[#0D1D38] outline-none placeholder:text-slate-400"
              />
            </div>

            <div className="hidden w-px bg-slate-200 sm:block" />

            <div className="flex flex-1 items-center gap-3 px-3">
              <MapPin className="shrink-0 text-[#2458E8]" size={21} />
              <input
                type="text"
                placeholder="Any city"
                value={locationSearch}
                onChange={e => setLocationSearch(e.target.value)}
                className="w-full bg-transparent py-3 text-sm text-[#0D1D38] outline-none placeholder:text-slate-400"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                const params = new URLSearchParams()

                if (skillSearch.trim()) {
                  params.set('skill', skillSearch.trim())
                }

                if (locationSearch.trim()) {
                  params.set('location', locationSearch.trim())
                }

                navigate(`/jobs${params.toString() ? `?${params.toString()}` : ''}`)
              }}
              className="rounded-lg bg-blue-700 px-8 py-3 font-semibold text-white hover:bg-blue-800"
            >
              Search Jobs
            </button>
          </div>

          {/* Trust indicators */}
          <div className="mt-8 flex flex-wrap gap-x-7 gap-y-4 text-sm text-slate-600">
            <span className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-emerald-600" />
              Trusted connections
            </span>
            <span className="flex items-center gap-2">
              <Users size={18} className="text-blue-700" />
              Direct hiring
            </span>
            <span className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-amber-500" />
              Transparent wages
            </span>
          </div>
        </div>

        {/* Right image */}
        <div className="relative mx-auto w-full max-w-xl">
          <div className="absolute -inset-5 rounded-[3rem] bg-blue-100/70 blur-3xl" />

          <div className="relative h-[390px] overflow-hidden rounded-[2rem] shadow-2xl shadow-slate-300/60 md:h-[510px]">
            <img
              src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=85"
              alt="Skilled construction workers at work"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0D1D38]/50 via-transparent to-transparent" />
          </div>

          {/* Floating information card */}
          <div className="absolute -left-4 top-12 rounded-2xl border border-slate-100 bg-white p-4 shadow-xl md:-left-12">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              Skilled trades
            </p>
            <p className="mt-1 font-bold text-[#0D1D38]">
              Work. Skills. Opportunity.
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Connecting people directly
            </p>
          </div>

          <div className="absolute -bottom-5 right-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-xl md:-right-8">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50">
                <ShieldCheck className="text-emerald-600" size={23} />
              </div>
              <div>
                <p className="font-bold text-[#0D1D38]">Built on trust</p>
                <p className="text-xs text-slate-500">Better work relationships</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>


      
    <section className="bg-white px-6 py-24 md:px-12">
      <div className="mx-auto max-w-7xl">

        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <span className="text-sm font-bold uppercase tracking-[0.18em] text-[#2458E8]">
              Find your opportunity
            </span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#0D1D38] md:text-4xl">
              Explore Job Categories
            </h2>
            <p className="mt-3 max-w-xl text-slate-500">
              Discover work opportunities across different skilled trades.
              Find the right job that matches your expertise.
            </p>
          </div>

          <Link
            to="/jobs"
            className="inline-flex items-center gap-2 font-semibold text-[#2458E8] transition hover:gap-3"
          >
            Explore all jobs <ArrowRight size={18} />
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map(({ name, icon: Icon }) => (
            <Link
              to="/jobs"
              key={name}
              className="group rounded-2xl border border-slate-200 bg-white p-7 transition-all duration-300 hover:-translate-y-1.5 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100/60"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 transition-colors duration-300 group-hover:bg-[#2458E8]">
                  <Icon
                    size={27}
                    className="text-[#2458E8] transition-colors duration-300 group-hover:text-white"
                  />
                </div>

                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition-all duration-300 group-hover:bg-blue-50 group-hover:text-[#2458E8]">
                  <ArrowRight size={18} />
                </div>
              </div>

              <h3 className="mt-6 text-xl font-bold text-[#0D1D38] transition-colors group-hover:text-[#2458E8]">
                {name}
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Explore opportunities and connect with employers looking for skilled professionals.
              </p>

              <span className="mt-5 inline-block text-sm font-semibold text-[#2458E8]">
                Explore opportunities
              </span>
            </Link>
          ))}
        </div>

      </div>
    </section>


      
    <section className="bg-[#F7F8FC] px-6 py-24 md:px-12">
      <div className="mx-auto max-w-7xl">

        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-bold uppercase tracking-[0.18em] text-[#2458E8]">
            Why LabourConnect?
          </span>

          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#0D1D38] md:text-4xl">
            Work made simpler. Connections made stronger.
          </h2>

          <p className="mt-4 leading-7 text-slate-500">
            We bring skilled professionals and employers together through a
            transparent and reliable hiring experience.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">

          <div className="group rounded-2xl border border-slate-200 bg-white p-8 transition-all duration-300 hover:-translate-y-2 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100/50">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 transition-colors group-hover:bg-[#2458E8]">
              <Users size={28} className="text-[#2458E8] transition-colors group-hover:text-white" />
            </div>

            <h3 className="mt-7 text-xl font-bold text-[#0D1D38]">
              Connect Directly
            </h3>

            <p className="mt-3 leading-7 text-slate-500">
              Bring workers and employers together on one platform.
              Connect directly and build meaningful working relationships.
            </p>

            <div className="mt-6 h-1 w-12 rounded-full bg-[#2458E8] transition-all duration-300 group-hover:w-20" />
          </div>

          <div className="group rounded-2xl border border-slate-200 bg-white p-8 transition-all duration-300 hover:-translate-y-2 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100/50">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 transition-colors group-hover:bg-[#2458E8]">
              <Search size={28} className="text-[#2458E8] transition-colors group-hover:text-white" />
            </div>

            <h3 className="mt-7 text-xl font-bold text-[#0D1D38]">
              Find Opportunities
            </h3>

            <p className="mt-3 leading-7 text-slate-500">
              Explore job opportunities based on your skills and location.
              Discover work that matches your experience.
            </p>

            <div className="mt-6 h-1 w-12 rounded-full bg-[#2458E8] transition-all duration-300 group-hover:w-20" />
          </div>

          <div className="group rounded-2xl border border-slate-200 bg-white p-8 transition-all duration-300 hover:-translate-y-2 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100/50">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 transition-colors group-hover:bg-[#2458E8]">
              <ShieldCheck size={28} className="text-[#2458E8] transition-colors group-hover:text-white" />
            </div>

            <h3 className="mt-7 text-xl font-bold text-[#0D1D38]">
              Build Trust
            </h3>

            <p className="mt-3 leading-7 text-slate-500">
              Experience a more transparent hiring process with secure
              bookings and clearer communication.
            </p>

            <div className="mt-6 h-1 w-12 rounded-full bg-[#2458E8] transition-all duration-300 group-hover:w-20" />
          </div>

        </div>
      </div>
    </section>


      
    {/* Final Call to Action */}
    <section className="bg-[#F7F8FC] px-6 py-20 md:px-12">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-[#0D1D38] px-6 py-16 text-center shadow-xl md:px-16 md:py-20">

        <div className="absolute -right-20 -top-32 h-80 w-80 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-20 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">
            Your next opportunity starts here
          </span>

          <h2 className="mt-5 text-3xl font-extrabold text-white md:text-5xl">
            Ready to get to work?
          </h2>

          <p className="mt-5 leading-7 text-slate-300 md:text-lg">
            Join workers and employers building better opportunities
            through LabourConnect. One connection at a time.
          </p>

          <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2458E8] px-8 py-4 font-semibold text-white shadow-lg shadow-blue-900/40 transition hover:-translate-y-1 hover:bg-blue-500"
            >
              Find Work <ArrowRight size={18} />
            </Link>

            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-500 px-8 py-4 font-semibold text-white transition hover:-translate-y-1 hover:border-white hover:bg-white/10"
            >
              Hire Workers <Users size={18} />
            </Link>
          </div>
        </div>
      </div>
    </section>

    {/* Footer */}
    <footer className="bg-[#0D1D38] px-6 pb-7 pt-14 text-white md:px-12">
      <div className="mx-auto max-w-7xl">

        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">

          <div className="lg:col-span-2">
            <Link to="/" className="inline-flex items-center gap-2 text-2xl font-extrabold">
              <span>Labour<span className="text-blue-400">Connect</span></span>
            </Link>

            <p className="mt-5 max-w-sm text-sm leading-7 text-slate-400">
              Connecting India's skilled trades with honest work and
              reliable opportunities. Building stronger connections,
              one booking at a time.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-blue-300">
              Explore
            </h3>

            <div className="mt-5 flex flex-col gap-4 text-sm text-slate-300">
              <Link to="/jobs" className="transition hover:text-white">Find Jobs</Link>
              <Link to="/employer/workers" className="transition hover:text-white">Find Workers</Link>
              <Link to="/register" className="transition hover:text-white">Create Account</Link>
              <Link to="/login" className="transition hover:text-white">Sign In</Link>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-blue-300">
              Popular Trades
            </h3>

            <div className="mt-5 flex flex-col gap-4 text-sm text-slate-300">
              <Link to="/jobs" className="transition hover:text-white">Electricians</Link>
              <Link to="/jobs" className="transition hover:text-white">Carpenters</Link>
              <Link to="/jobs" className="transition hover:text-white">Plumbers</Link>
              <Link to="/jobs" className="transition hover:text-white">Painters</Link>
            </div>
          </div>

        </div>

        <div className="mt-14 flex flex-col justify-between gap-4 border-t border-slate-700 pt-7 text-xs text-slate-400 md:flex-row">
          <p>© 2026 LabourConnect. All rights reserved.</p>
          <p>Made with care for India's workforce.</p>
        </div>

      </div>
    </footer>

    </div>
  )
}

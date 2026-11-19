import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import API_BASE_URL from "../services/api";
import {
  MapPin,
  BriefcaseBusiness,
  IndianRupee,
  Search,
  CalendarDays,
  Users,
  Clock,
  RefreshCw,
  X,
  SlidersHorizontal,
  ArrowRight,
  AlertCircle,
  Briefcase,
} from 'lucide-react'
import Navbar from '../components/Navbar'
import { useNavigate, useSearchParams } from 'react-router-dom'

type Job = {
  id: number
  title: string
  description: string
  requiredSkill: string
  location: string
  jobType: string
  budget: number
  startDate: string
  durationDays: number
  numberOfWorkers: number
}

export default function Jobs() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [search, setSearch] = useState(searchParams.get('skill') || '')
  const [locationSearch, setLocationSearch] = useState(
    searchParams.get('location') || ''
  )
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  const fetchJobs = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)

    setError('')

    try {
      const response = await axios.get<Job[]>(
        `${API_BASE_URL}/api/jobs`
      )
      setJobs(Array.isArray(response.data) ? response.data : [])
    } catch {
      setError('Could not load jobs. Please check your connection and try again.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchJobs()
  }, [])

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const skillText = `${job.title || ''} ${job.requiredSkill || ''}`.toLowerCase()
      const locationText = (job.location || '').toLowerCase()

      const matchesSkill = skillText.includes(search.trim().toLowerCase())
      const matchesLocation = locationText.includes(
        locationSearch.trim().toLowerCase()
      )

      return matchesSkill && matchesLocation
    })
  }, [jobs, search, locationSearch])

  const formatDate = (date: string) => {
    if (!date) return 'Not specified'

    const parsedDate = new Date(`${date}T00:00:00`)

    if (Number.isNaN(parsedDate.getTime())) return date

    return parsedDate.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const formatJobType = (jobType: string) => {
    if (!jobType) return 'Not specified'

    return jobType
      .replaceAll('_', ' ')
      .toLowerCase()
      .replace(/\b\w/g, letter => letter.toUpperCase())
  }

  const formatBudget = (budget: number) => {
    if (typeof budget !== 'number' || Number.isNaN(budget)) {
      return 'Not specified'
    }

    return budget.toLocaleString('en-IN')
  }

  const clearFilters = () => {
    setSearch('')
    setLocationSearch('')
  }

  const hasFilters = search.trim() !== '' || locationSearch.trim() !== ''

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Hero and Search */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-800 via-blue-700 to-indigo-800 px-4 py-12 text-white sm:px-6 lg:py-16">
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-blue-300/10 blur-3xl" />

        <div className="relative mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-blue-100">
              <Briefcase size={14} />
              WORK OPPORTUNITIES
            </span>

            <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Find Work That
              <span className="block text-blue-200">Matches Your Skills</span>
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-6 text-blue-100 sm:text-base">
              Explore available jobs, connect with employers and discover
              opportunities that match your experience.
            </p>
          </div>

          {/* Search Panel */}
          <div className="mt-8 max-w-4xl rounded-2xl bg-white p-3 shadow-xl sm:p-4">
            <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
              <div className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 px-3 transition focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
                <Search size={19} className="shrink-0 text-blue-600" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Job title or skill"
                  className="min-w-0 w-full bg-transparent py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    aria-label="Clear skill search"
                    className="text-slate-400 hover:text-slate-700"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              <div className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 px-3 transition focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
                <MapPin size={19} className="shrink-0 text-blue-600" />
                <input
                  value={locationSearch}
                  onChange={e => setLocationSearch(e.target.value)}
                  placeholder="City or location"
                  className="min-w-0 w-full bg-transparent py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400"
                />
                {locationSearch && (
                  <button
                    type="button"
                    onClick={() => setLocationSearch('')}
                    aria-label="Clear location search"
                    className="text-slate-400 hover:text-slate-700"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  document.getElementById('available-jobs')?.scrollIntoView({
                    behavior: 'smooth',
                  })
                }}
                className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                <Search size={17} />
                Find Jobs
              </button>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-1">
              <p className="text-xs text-slate-500">
                Search by your skill, profession or preferred location.
              </p>

              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Job Listings */}
      <main
        id="available-jobs"
        className="mx-auto max-w-6xl px-4 py-9 sm:px-6 lg:py-12"
      >
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              Explore opportunities
            </p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
              Available Jobs
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Find opportunities and take the next step in your career.
            </p>
          </div>

          <button
            type="button"
            onClick={() => fetchJobs(true)}
            disabled={loading || refreshing}
            className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 sm:self-auto"
          >
            <RefreshCw
              size={16}
              className={refreshing ? 'animate-spin' : ''}
            />
            Refresh
          </button>
        </div>

        {/* Summary */}
        <div className="mt-7 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
                <BriefcaseBusiness size={21} />
              </div>
              <div>
                <p className="text-sm text-slate-500">Total available jobs</p>
                <p className="text-2xl font-bold text-slate-900">
                  {loading ? '—' : jobs.length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-emerald-50 p-3 text-emerald-600">
                <SlidersHorizontal size={21} />
              </div>
              <div>
                <p className="text-sm text-slate-500">Matching your search</p>
                <p className="text-2xl font-bold text-slate-900">
                  {loading ? '—' : filteredJobs.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Results heading */}
        <div className="mt-9 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold text-slate-900">
              {hasFilters ? 'Search Results' : 'Latest Opportunities'}
            </h3>
            {!loading && !error && (
              <p className="mt-1 text-sm text-slate-500">
                Showing {filteredJobs.length} of {jobs.length} jobs
              </p>
            )}
          </div>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              <X size={15} />
              Reset search
            </button>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {[1, 2, 3, 4].map(item => (
              <div
                key={item}
                className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6"
              >
                <div className="h-5 w-2/3 rounded bg-slate-200" />
                <div className="mt-4 h-4 w-1/3 rounded bg-slate-100" />
                <div className="mt-6 h-16 rounded bg-slate-100" />
                <div className="mt-5 h-4 w-1/2 rounded bg-slate-100" />
                <div className="mt-6 h-10 rounded bg-slate-200" />
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 shrink-0 text-red-600" size={21} />
              <div className="flex-1">
                <h3 className="font-semibold text-red-800">
                  Unable to load jobs
                </h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
                <button
                  type="button"
                  onClick={() => fetchJobs()}
                  className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && jobs.length === 0 && (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <BriefcaseBusiness size={26} />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-900">
              No jobs available right now
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Please check back later for new work opportunities.
            </p>
          </div>
        )}

        {/* No search results */}
        {!loading && !error && jobs.length > 0 && filteredJobs.length === 0 && (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
              <Search size={25} />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-900">
              No matching jobs found
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Try a different skill or location.
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="mt-5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Job Cards */}
        {!loading && !error && filteredJobs.length > 0 && (
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            {filteredJobs.map(job => (
              <article
                key={job.id}
                className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg sm:p-6"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold text-slate-900 transition group-hover:text-blue-700 sm:text-xl">
                      {job.title || 'Untitled Job'}
                    </h3>
                    <p className="mt-2 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                      {job.requiredSkill || 'Skill not specified'}
                    </p>
                  </div>

                  <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                    Open
                  </span>
                </div>

                <p className="mt-4 line-clamp-3 min-h-[60px] text-sm leading-6 text-slate-600">
                  {job.description || 'No job description provided.'}
                </p>

                {/* Job information */}
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <div className="flex items-center gap-2 text-slate-500">
                      <MapPin size={15} />
                      <span className="text-xs">Location</span>
                    </div>
                    <p className="mt-1 break-words text-sm font-semibold text-slate-800">
                      {job.location || 'Not specified'}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3">
                    <div className="flex items-center gap-2 text-slate-500">
                      <IndianRupee size={15} />
                      <span className="text-xs">Budget</span>
                    </div>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {formatBudget(job.budget)}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3">
                    <div className="flex items-center gap-2 text-slate-500">
                      <BriefcaseBusiness size={15} />
                      <span className="text-xs">Job type</span>
                    </div>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {formatJobType(job.jobType)}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Users size={15} />
                      <span className="text-xs">Workers needed</span>
                    </div>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {job.numberOfWorkers ?? 'Not specified'}
                    </p>
                  </div>
                </div>

                {/* Schedule */}
                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays size={14} />
                    Starts: {formatDate(job.startDate)}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock size={14} />
                    {job.durationDays ?? '—'} days
                  </span>
                </div>

                {/* Details button */}
                <div className="mt-5 border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    onClick={() => navigate(`/jobs/${job.id}`)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    View Job Details
                    <ArrowRight size={17} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

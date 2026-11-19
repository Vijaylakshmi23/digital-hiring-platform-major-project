
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import API_BASE_URL from "../../services/api";

interface ApiErrorResponse {
  status: number
  error: string
  message: string
  path: string
}

export default function Register() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '',
    email: '',
    mobileNumber: '',
    password: '',
    role: 'WORKER',
  })

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
    setSuccess('')
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      await axios.post(
        `${API_BASE_URL}/api/auth/register`,
        form
      )

      setSuccess('Registration successful! Redirecting to login...')

      setTimeout(() => {
        navigate('/login')
      }, 1500)

    } catch (err: unknown) {
      if (axios.isAxiosError<ApiErrorResponse>(err)) {
        const backendMessage = err.response?.data?.message

        setError(
          backendMessage ||
          'Registration failed. Please check your details and try again.'
        )
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-blue-50 px-4 py-10">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-5 rounded-2xl bg-white p-8 shadow-lg"
      >
        <h1 className="text-center text-3xl font-bold">
          Create Account
        </h1>

        <p className="text-center text-gray-600">
          Join LabourConnect today
        </p>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Full Name
          </label>
          <input
            name="name"
            required
            value={form.name}
            onChange={handleChange}
            className="w-full rounded-lg border p-3"
            placeholder="Enter your name"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Email
          </label>
          <input
            name="email"
            type="email"
            required
            value={form.email}
            onChange={handleChange}
            className="w-full rounded-lg border p-3"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Password
          </label>
          <input
            name="password"
            type="password"
            required
            minLength={8}
            pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}"
            title="Password must contain at least 8 characters, one uppercase letter, one lowercase letter, and one number."
            value={form.password}
            onChange={handleChange}
            className="w-full rounded-lg border p-3"
            placeholder="Create a password"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Mobile Number
          </label>
          <input
            name="mobileNumber"
            type="tel"
            required
            pattern="[0-9]{10}"
            maxLength={10}
            value={form.mobileNumber}
            onChange={handleChange}
            className="w-full rounded-lg border p-3"
            placeholder="Enter 10-digit mobile number"
            title="Enter a valid 10-digit mobile number"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Register as
          </label>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full rounded-lg border bg-white p-3"
          >
            <option value="WORKER">Worker</option>
            <option value="EMPLOYER">Employer</option>
          </select>
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        {success && (
          <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
            {success}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-blue-700 p-3 font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
        >
          {loading ? 'Creating account...' : 'Register'}
        </button>

        <p className="text-center text-sm text-gray-600">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-blue-700">
            Login
          </Link>
        </p>

        <p className="text-center text-sm text-gray-600">
          <Link
            to="/"
            className="font-semibold text-blue-700 hover:underline"
          >
            ← Back to Home
          </Link>
        </p>
      </form>
    </div>
  )
}

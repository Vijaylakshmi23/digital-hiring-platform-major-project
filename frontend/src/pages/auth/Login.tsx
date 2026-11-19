import { useState } from "react";
import API_BASE_URL from "../../services/api";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

interface LoginResponse {
  token: string;
  id: number;
  name: string;
  email: string;
  role: "WORKER" | "EMPLOYER";
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post<LoginResponse>(
        `${API_BASE_URL}/api/auth/login`,
        { email, password }
      );

      const data = response.data;

      // Save login information
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", String(data.id));
      localStorage.setItem("userName", data.name);
      localStorage.setItem("userEmail", data.email);
      localStorage.setItem("role", data.role);

      // Redirect according to user role
      if (data.role === "WORKER") {
        navigate("/worker/dashboard");
      } else if (data.role === "EMPLOYER") {
        navigate("/employer/dashboard");
      } else {
        setError("Invalid user role.");
      }
    } catch (err) {
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg"
      >
        <h1 className="mb-2 text-3xl font-bold text-gray-800">
          Welcome Back
        </h1>

        <p className="mb-6 text-gray-500">
          Login to your LabourConnect account
        </p>

        <label className="mb-2 block text-sm font-medium">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mb-5 w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-500"
          placeholder="Enter your email"
        />

        <label className="mb-2 block text-sm font-medium">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="mb-5 w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-500"
          placeholder="Enter your password"
        />

        {error && (
          <p className="mb-4 text-sm text-red-600">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
        <p className="mt-6 text-center text-sm text-gray-600">
        <Link to="/" className="font-semibold text-blue-700 hover:underline">
            ← Back to Home
        </Link>
</p>
      </form>
    </div>
  );
}

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    password2: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password.length < 10) {
      setError("Password must be at least 10 characters.");
      return;
    }
    if (formData.password !== formData.password2) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/users/register/", formData);
      login(res.data.user, res.data.access, res.data.refresh);
      navigate("/");
    } catch (err) {
      const data = err.response?.data;
      if (data) {
        // Flatten DRF error response into a single readable message
        const firstKey = Object.keys(data)[0];
        const firstVal = data[firstKey];
        const msg = Array.isArray(firstVal) ? firstVal[0] : firstVal;
        setError(typeof msg === "string" ? msg : JSON.stringify(msg));
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left side - decorative */}
      <div className="hidden lg:flex flex-1 bg-gray-900 flex-col justify-between p-16">
        <Link to="/" className="text-2xl font-black tracking-tighter text-white">
          SHOPAPP
        </Link>
        <div>
          <p className="text-6xl font-black text-white leading-none tracking-tighter mb-6">
            JOIN<br />
            THE<br />
            <span className="text-transparent" style={{ WebkitTextStroke: "2px white" }}>
              CLUB
            </span>
          </p>
          <p className="text-gray-400 text-lg max-w-sm">
            Create an account and start shopping the best curated products today.
          </p>
        </div>
        <p className="text-gray-600 text-xs uppercase tracking-widest">
          © {new Date().getFullYear()} ShopApp
        </p>
      </div>

      {/* Right side - form */}
      <div className="flex-1 flex items-center justify-center px-8 py-16">
        <div className="w-full max-w-md">
          <h2 className="text-4xl font-black tracking-tighter text-gray-900 mb-2">Create Account</h2>
          <p className="text-gray-400 mb-10">
            Already have an account?{" "}
            <Link to="/login" className="text-gray-900 font-bold underline">
              Sign in
            </Link>
          </p>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
              <p className="text-red-600 text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full border-2 border-gray-200 px-4 py-3 text-gray-900 focus:outline-none focus:border-gray-900 transition-colors"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full border-2 border-gray-200 px-4 py-3 text-gray-900 focus:outline-none focus:border-gray-900 transition-colors"
                placeholder="yourname"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full border-2 border-gray-200 px-4 py-3 text-gray-900 focus:outline-none focus:border-gray-900 transition-colors"
                placeholder="••••••••"
              />
              <p className="text-xs text-gray-400 mt-1">Minimum 10 characters.</p>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                name="password2"
                value={formData.password2}
                onChange={handleChange}
                required
                className="w-full border-2 border-gray-200 px-4 py-3 text-gray-900 focus:outline-none focus:border-gray-900 transition-colors"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 text-white py-4 font-black text-sm uppercase tracking-widest hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Create Account →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
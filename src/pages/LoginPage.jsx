import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/users/login/", { email, password });
      const profileRes = await api.get("/users/profile/", {
        headers: { Authorization: `Bearer ${res.data.access}` },
      });
      login(profileRes.data, res.data.access, res.data.refresh);
      navigate("/");
    } catch {
      setError("Invalid email or password");
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
            WELCOME<br />
            <span className="text-transparent" style={{ WebkitTextStroke: "2px white" }}>
              BACK
            </span>
          </p>
          <p className="text-gray-400 text-lg max-w-sm">
            Sign in to access your orders, wishlist and exclusive deals.
          </p>
        </div>
        <p className="text-gray-600 text-xs uppercase tracking-widest">
          © {new Date().getFullYear()} ShopApp
        </p>
      </div>

      {/* Right side - form */}
      <div className="flex-1 flex items-center justify-center px-8 py-16">
        <div className="w-full max-w-md">
          <h2 className="text-4xl font-black tracking-tighter text-gray-900 mb-2">Sign In</h2>
          <p className="text-gray-400 mb-10">
            Don't have an account?{" "}
            <Link to="/register" className="text-gray-900 font-bold underline">
              Register
            </Link>
          </p>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
              <p className="text-red-600 text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border-2 border-gray-200 px-4 py-3 text-gray-900 focus:outline-none focus:border-gray-900 transition-colors"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              {loading ? "Signing in..." : "Sign In →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
import { useState } from "react";
import { Link } from "react-router-dom";
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
  const [registeredEmail, setRegisteredEmail] = useState(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

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
      await api.post("/users/register/", formData);
      setRegisteredEmail(formData.email);
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

  const handleResend = async () => {
    setResendLoading(true);
    setResendMessage("");
    try {
      await api.post("/users/resend-verification/", { email: registeredEmail });
      setResendMessage("Verification email resent. Please check your inbox.");
    } catch {
      setResendMessage("Could not resend email. Please try again later.");
    } finally {
      setResendLoading(false);
    }
  };

  if (registeredEmail) {
    return (
      <div className="min-h-screen bg-white flex">
        <div className="hidden lg:flex flex-1 bg-gray-900 flex-col justify-between p-16">
          <Link to="/" className="text-2xl font-black tracking-tighter text-white">
            SHOPAPP
          </Link>
          <div>
            <p className="text-6xl font-black text-white leading-none tracking-tighter mb-6">
              CHECK<br />
              YOUR<br />
              <span className="text-transparent" style={{ WebkitTextStroke: "2px white" }}>
                EMAIL
              </span>
            </p>
            <p className="text-gray-400 text-lg max-w-sm">
              One last step to get you started.
            </p>
          </div>
          <p className="text-gray-600 text-xs uppercase tracking-widest">
            © {new Date().getFullYear()} ShopApp
          </p>
        </div>

        <div className="flex-1 flex items-center justify-center px-8 py-16">
          <div className="w-full max-w-md">
            <div className="w-16 h-16 bg-gray-900 flex items-center justify-center mb-8">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-4xl font-black tracking-tighter text-gray-900 mb-2">Verify Your Email</h2>
            <p className="text-gray-400 mb-6">
              We sent a verification link to{" "}
              <span className="text-gray-900 font-bold">{registeredEmail}</span>.
              Click the link in the email to activate your account.
            </p>
            <p className="text-gray-400 text-sm mb-8">
              Didn't receive it? Check your spam folder or resend below.
            </p>

            {resendMessage && (
              <div className="bg-gray-50 border-l-4 border-gray-900 p-4 mb-6">
                <p className="text-gray-700 text-sm font-medium">{resendMessage}</p>
              </div>
            )}

            <button
              onClick={handleResend}
              disabled={resendLoading}
              className="w-full bg-gray-900 text-white py-4 font-black text-sm uppercase tracking-widest hover:bg-gray-700 transition-colors disabled:opacity-50 mb-4"
            >
              {resendLoading ? "Sending..." : "Resend Verification Email"}
            </button>
            <Link
              to="/login"
              className="block text-center text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
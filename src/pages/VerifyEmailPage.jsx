import { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { login } = useAuth();
  const navigate = useNavigate();

  const [status, setStatus] = useState("verifying"); // verifying | success | error
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMessage("No verification token found in the link.");
      return;
    }

    api
      .post("/users/verify-email/", { token })
      .then((res) => {
        if (res.data.access && res.data.refresh && res.data.user) {
          login(res.data.user, res.data.access, res.data.refresh);
          setStatus("success");
          setTimeout(() => navigate("/"), 2500);
        } else {
          setStatus("success");
        }
      })
      .catch((err) => {
        const msg =
          err.response?.data?.detail ||
          err.response?.data?.error ||
          "The verification link is invalid or has expired.";
        setErrorMessage(msg);
        setStatus("error");
      });
  }, [token]);

  return (
    <div className="min-h-screen bg-white flex">
      <div className="hidden lg:flex flex-1 bg-gray-900 flex-col justify-between p-16">
        <Link to="/" className="text-2xl font-black tracking-tighter text-white">
          SHOPAPP
        </Link>
        <div>
          <p className="text-6xl font-black text-white leading-none tracking-tighter mb-6">
            {status === "verifying" && (
              <>VERIFYING<br />YOUR<br /><span className="text-transparent" style={{ WebkitTextStroke: "2px white" }}>EMAIL</span></>
            )}
            {status === "success" && (
              <>ALL<br />SET<br /><span className="text-transparent" style={{ WebkitTextStroke: "2px white" }}>WELCOME</span></>
            )}
            {status === "error" && (
              <>OOPS<br />SOMETHING<br /><span className="text-transparent" style={{ WebkitTextStroke: "2px white" }}>WENT WRONG</span></>
            )}
          </p>
        </div>
        <p className="text-gray-600 text-xs uppercase tracking-widest">
          © {new Date().getFullYear()} ShopApp
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center px-8 py-16">
        <div className="w-full max-w-md text-center">
          {status === "verifying" && (
            <>
              <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-8" />
              <h2 className="text-4xl font-black tracking-tighter text-gray-900 mb-2">Verifying...</h2>
              <p className="text-gray-400">Please wait while we confirm your email address.</p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="w-16 h-16 bg-gray-900 flex items-center justify-center mx-auto mb-8">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-4xl font-black tracking-tighter text-gray-900 mb-2">Email Verified</h2>
              <p className="text-gray-400 mb-8">
                Your account is now active. Redirecting you to the store...
              </p>
              <Link
                to="/"
                className="inline-block bg-gray-900 text-white px-8 py-4 font-black text-sm uppercase tracking-widest hover:bg-gray-700 transition-colors"
              >
                Go to Store →
              </Link>
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-16 h-16 bg-red-500 flex items-center justify-center mx-auto mb-8">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-4xl font-black tracking-tighter text-gray-900 mb-2">Verification Failed</h2>
              <p className="text-gray-400 mb-8">{errorMessage}</p>
              <div className="space-y-3">
                <Link
                  to="/register"
                  className="block bg-gray-900 text-white px-8 py-4 font-black text-sm uppercase tracking-widest hover:bg-gray-700 transition-colors"
                >
                  Register Again
                </Link>
                <Link
                  to="/login"
                  className="block text-sm text-gray-500 hover:text-gray-900 transition-colors py-2"
                >
                  Back to Sign In
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav className="bg-zinc-900 text-white px-8 py-4 flex justify-between items-center shadow-lg">
      <Link to="/" className="text-2xl font-black tracking-tight">
        SHOP<span className="text-amber-400">APP</span>
      </Link>
      <div className="flex gap-6 items-center text-sm font-medium">
        {user ? (
          <>
            <Link to="/cart" className="text-zinc-300 hover:text-amber-400 transition-colors">Cart</Link>
            <Link to="/orders" className="text-zinc-300 hover:text-amber-400 transition-colors">Orders</Link>
            {user.is_admin && (
              <Link to="/admin" className="text-zinc-300 hover:text-amber-400 transition-colors">Dashboard</Link>
            )}
            <span className="text-zinc-500">|</span>
            <span className="text-zinc-400">{user.username}</span>
            <button
              onClick={handleLogout}
              className="bg-amber-400 text-zinc-900 px-4 py-1.5 rounded-full font-bold hover:bg-amber-300 transition-colors"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-zinc-300 hover:text-amber-400 transition-colors">Login</Link>
            <Link
              to="/register"
              className="bg-amber-400 text-zinc-900 px-4 py-1.5 rounded-full font-bold hover:bg-amber-300 transition-colors"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
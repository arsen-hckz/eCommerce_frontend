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
    <nav className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
      <Link to="/" className="text-xl font-bold">ShopApp</Link>
      <div className="flex gap-4 items-center">
        {user ? (
          <>
            <Link to="/cart" className="hover:underline">Cart</Link>
            <Link to="/orders" className="hover:underline">Orders</Link>
            {user.is_admin && (
              <Link to="/admin" className="hover:underline">Dashboard</Link>
            )}
            <button onClick={handleLogout} className="hover:underline">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:underline">Login</Link>
            <Link to="/register" className="hover:underline">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
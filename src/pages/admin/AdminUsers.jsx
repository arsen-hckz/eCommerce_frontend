import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get("/dashboard/users/");
        setUsers(res.data.results || res.data);
      } catch {
        console.error("Failed to fetch users");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-4xl font-black text-gray-200 tracking-tighter">LOADING...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b-2 border-gray-900 px-8 py-8">
        <div className="max-w-7xl mx-auto flex justify-between items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Admin</p>
            <h1 className="text-5xl font-black tracking-tighter text-gray-900">USERS</h1>
          </div>
          <Link to="/admin" className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors">
            ← Dashboard
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="border-2 border-gray-900 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-900">
                <th className="text-left px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Email</th>
                <th className="text-left px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Username</th>
                <th className="text-left px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Joined</th>
                <th className="text-left px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={user.id} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${index % 2 === 0 ? "" : "bg-gray-50/50"}`}>
                  <td className="px-6 py-4 font-black text-gray-900">{user.email}</td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-500 uppercase tracking-widest">
                    {user.username}
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-400 uppercase tracking-widest font-bold">
                    {new Date(user.date_joined).toLocaleDateString("en-GB", {
                      day: "numeric", month: "short", year: "numeric"
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-3 py-1 border font-black uppercase tracking-wider ${
                      user.is_admin
                        ? "bg-purple-50 text-purple-700 border-purple-200"
                        : "bg-gray-50 text-gray-500 border-gray-200"
                    }`}>
                      {user.is_admin ? "Admin" : "Customer"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
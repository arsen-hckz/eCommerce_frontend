import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/dashboard/stats/");
        setStats(res.data);
      } catch {
        console.error("Failed to fetch stats");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-4xl font-black text-gray-200 tracking-tighter">LOADING...</p>
    </div>
  );
  if (!stats) return null;

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b-2 border-gray-900 px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Admin</p>
          <h1 className="text-5xl font-black tracking-tighter text-gray-900">DASHBOARD</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-gray-900 border-2 border-gray-900 mb-12">
          <div className="bg-white p-8">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Revenue</p>
            <p className="text-4xl font-black text-gray-900">${stats.total_revenue}</p>
          </div>
          <div className="bg-white p-8">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Orders</p>
            <p className="text-4xl font-black text-gray-900">{stats.total_orders}</p>
          </div>
          <div className="bg-white p-8">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Pending</p>
            <p className="text-4xl font-black text-yellow-500">{stats.pending_orders}</p>
          </div>
          <div className="bg-white p-8">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Users</p>
            <p className="text-4xl font-black text-gray-900">{stats.total_users}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Top products */}
          <div className="border-2 border-gray-900 p-8">
            <h2 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-6">
              Top Products
            </h2>
            <div className="space-y-4">
              {stats.top_products.map((product, index) => (
                <div key={product.product__id} className="flex justify-between items-center py-3 border-b border-gray-100">
                  <div className="flex items-center gap-4">
                    <span className="text-3xl font-black text-gray-100">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="font-bold text-gray-900">{product.product__name}</span>
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest text-gray-400">
                    {product.total_sold} sold
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent orders */}
          <div className="border-2 border-gray-900 p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xs font-black uppercase tracking-widest text-gray-400">
                Recent Orders
              </h2>
              <Link to="/admin/orders" className="text-xs font-black uppercase tracking-widest text-gray-900 hover:underline">
                View All →
              </Link>
            </div>
            <div className="space-y-4">
              {stats.recent_orders.map((order) => (
                <Link
                  key={order.id}
                  to={`/orders/${order.id}`}
                  className="flex justify-between items-center py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <p className="font-black text-gray-900">#{order.id}</p>
                    <p className="text-xs text-gray-400 uppercase tracking-widest">{order.user__email}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-gray-900">${order.total_price}</p>
                    <p className="text-xs text-gray-400 uppercase tracking-widest">{order.status}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-gray-900 border-2 border-gray-900">
          <Link to="/admin/orders" className="group bg-white p-8 hover:bg-gray-900 transition-colors">
            <p className="text-4xl mb-4">📦</p>
            <p className="font-black uppercase tracking-widest text-gray-900 group-hover:text-white transition-colors">
              Manage Orders
            </p>
            <p className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors mt-1 uppercase tracking-widest">
              View & update →
            </p>
          </Link>
          <Link to="/admin/products" className="group bg-white p-8 hover:bg-gray-900 transition-colors">
            <p className="text-4xl mb-4">🛍️</p>
            <p className="font-black uppercase tracking-widest text-gray-900 group-hover:text-white transition-colors">
              Manage Products
            </p>
            <p className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors mt-1 uppercase tracking-widest">
              Add & edit →
            </p>
          </Link>
          <Link to="/admin/users" className="group bg-white p-8 hover:bg-gray-900 transition-colors">
            <p className="text-4xl mb-4">👥</p>
            <p className="font-black uppercase tracking-widest text-gray-900 group-hover:text-white transition-colors">
              Manage Users
            </p>
            <p className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors mt-1 uppercase tracking-widest">
              View all →
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
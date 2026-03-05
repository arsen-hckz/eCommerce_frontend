import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get("/dashboard/orders/");
        setOrders(res.data.results || res.data);
      } catch {
        console.error("Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, status) => {
    try {
      await api.patch(`/dashboard/orders/${orderId}/`, { status });
      setOrders(orders.map((o) => (o.id === orderId ? { ...o, status } : o)));
    } catch {
      console.error("Failed to update status");
    }
  };

  const getStatusStyle = (status) => {
    const styles = {
      pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
      processing: "bg-blue-50 text-blue-700 border-blue-200",
      shipped: "bg-purple-50 text-purple-700 border-purple-200",
      delivered: "bg-green-50 text-green-700 border-green-200",
      cancelled: "bg-red-50 text-red-700 border-red-200",
    };
    return styles[status] || "bg-gray-50 text-gray-700 border-gray-200";
  };

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
            <h1 className="text-5xl font-black tracking-tighter text-gray-900">ORDERS</h1>
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
                <th className="text-left px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Order</th>
                <th className="text-left px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Customer</th>
                <th className="text-left px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Total</th>
                <th className="text-left px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Payment</th>
                <th className="text-left px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Status</th>
                <th className="text-left px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Update</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <tr key={order.id} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${index % 2 === 0 ? "" : "bg-gray-50/50"}`}>
                  <td className="px-6 py-4">
                    <Link to={`/orders/${order.id}`} className="font-black text-gray-900 hover:underline">
                      #{order.id}
                    </Link>
                    <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-600">{order.user_email}</td>
                  <td className="px-6 py-4 font-black text-gray-900">${order.total_price}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-3 py-1 border font-black uppercase tracking-wider ${
                      order.payment_status === "paid"
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-red-50 text-red-700 border-red-200"
                    }`}>
                      {order.payment_status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-3 py-1 border font-black uppercase tracking-wider ${getStatusStyle(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className="text-xs border-2 border-gray-200 px-2 py-1 font-bold uppercase focus:outline-none focus:border-gray-900"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
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
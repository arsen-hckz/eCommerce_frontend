import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get("/orders/");
        setOrders(res.data.results || res.data);
      } catch {
        console.error("Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

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

  const getPaymentStyle = (status) => {
    const styles = {
      unpaid: "bg-red-50 text-red-700 border-red-200",
      pending: "bg-red-50 text-red-700 border-red-200",
      paid: "bg-green-50 text-green-700 border-green-200",
      refunded: "bg-gray-50 text-gray-700 border-gray-200",
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
      {/* Header */}
      <div className="border-b-2 border-gray-900 px-8 py-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-5xl font-black tracking-tighter text-gray-900">YOUR ORDERS</h1>
          <p className="text-gray-400 text-sm uppercase tracking-widest font-bold mt-1">
            {orders.length} {orders.length === 1 ? "order" : "orders"}
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-12">
        {orders.length === 0 ? (
          <div className="text-center py-32">
            <p className="text-8xl font-black text-gray-100 tracking-tighter mb-4">NOTHING</p>
            <p className="text-gray-400 mb-8">You haven't placed any orders yet</p>
            <Link
              to="/"
              className="bg-gray-900 text-white px-12 py-4 font-black text-sm uppercase tracking-widest hover:bg-gray-700 transition-colors"
            >
              Start Shopping →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link
                key={order.id}
                to={`/orders/${order.id}`}
                className="group block border-2 border-gray-100 hover:border-gray-900 transition-colors p-6"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-8">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">
                        Order
                      </p>
                      <p className="text-2xl font-black text-gray-900">#{order.id}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">
                        Date
                      </p>
                      <p className="font-bold text-gray-900">
                        {new Date(order.created_at).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">
                        Status
                      </p>
                      <div className="flex gap-2">
                        <span className={`text-xs px-3 py-1 border font-bold uppercase tracking-wider ${getStatusStyle(order.status)}`}>
                          {order.status}
                        </span>
                        <span className={`text-xs px-3 py-1 border font-bold uppercase tracking-wider ${getPaymentStyle(order.payment_status)}`}>
                          {order.payment_status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">
                      Total
                    </p>
                    <p className="text-2xl font-black text-gray-900">${order.total_price}</p>
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-300 group-hover:text-gray-900 transition-colors mt-2">
                      View Details →
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
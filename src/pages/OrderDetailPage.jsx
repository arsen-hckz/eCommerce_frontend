import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const [address, setAddress] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/${id}/`);
        setOrder(res.data);
        if (res.data.shipping_address !== "To be filled") {
          setAddress(res.data.shipping_address);
        }
      } catch {
        navigate("/orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const handleGetLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();
          setAddress(data.display_name);
        } catch {
          console.error("Failed to get location");
        }
      }
    );
  };

  const handleCheckout = async () => {
    setCheckingOut(true);
    try {
      await api.patch(`/orders/${id}/update-address/`, {
        shipping_address: address,
      });
      const res = await api.post(`/orders/${id}/checkout/`);
      window.location.href = res.data.checkout_url;
    } catch {
      console.error("Checkout failed");
      setCheckingOut(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-blue-100 text-blue-800",
      shipped: "bg-purple-100 text-purple-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;
  if (!order) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate("/orders")}
        className="text-blue-600 hover:underline mb-6 block"
      >
        ← Back to Orders
      </button>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold">Order #{order.id}</h1>
            <p className="text-gray-500 text-sm">
              {new Date(order.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-2">
            <span className={`text-sm px-3 py-1 rounded-full font-medium ${getStatusColor(order.status)}`}>
              {order.status}
            </span>
            <span className={`text-sm px-3 py-1 rounded-full font-medium ${
              order.payment_status === "paid"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}>
              {order.payment_status}
            </span>
          </div>
        </div>

        {/* Order items */}
        <div className="border-t pt-4">
          <h2 className="font-semibold mb-3">Items</h2>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden">
                    {item.product.image ? (
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : null}
                  </div>
                  <div>
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-sm text-gray-500">x{item.quantity}</p>
                  </div>
                </div>
                <p className="font-bold">${item.subtotal}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t mt-4 pt-4 flex justify-between items-center">
          <span className="text-lg font-bold">Total</span>
          <span className="text-lg font-bold text-blue-600">${order.total_price}</span>
        </div>
      </div>

      {/* Address and payment */}
      {order.payment_status === "unpaid" && (
        <div className="bg-white rounded-lg shadow p-6 space-y-3">
          <h2 className="font-bold text-lg mb-2">Shipping Address</h2>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter your full shipping address"
            rows={3}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={handleGetLocation}
            className="w-full border border-blue-500 text-blue-600 py-2 rounded-md hover:bg-blue-50 text-sm"
          >
            📍 Use My Current Location
          </button>
          <button
            onClick={handleCheckout}
            disabled={checkingOut || !address}
            className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 disabled:opacity-50 font-semibold"
          >
            {checkingOut ? "Redirecting to Payment..." : "Pay Now with Stripe"}
          </button>
        </div>
      )}

      {order.payment_status === "paid" && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <p className="text-green-600 font-bold text-lg">✓ Payment Successful</p>
          <p className="text-gray-600 mt-1">Shipping to: {order.shipping_address}</p>
        </div>
      )}
    </div>
  );
}
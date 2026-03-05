import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function CartPage() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [address, setAddress] = useState("");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchCart = async () => {
    try {
      const res = await api.get("/orders/cart/");
      const cartData = res.data;
      if (cartData.items && !Array.isArray(cartData.items)) {
        cartData.items = cartData.items.results || [];
      }
      setCart(cartData);
    } catch {
      console.error("Failed to fetch cart");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleRemove = async (itemId) => {
    try {
      await api.delete(`/orders/cart/remove/${itemId}/`);
      fetchCart();
    } catch {
      console.error("Failed to remove item");
    }
  };

  const handleQuantityChange = async (itemId, quantity) => {
    try {
      await api.patch(`/orders/cart/update/${itemId}/`, { quantity });
      fetchCart();
    } catch {
      console.error("Failed to update quantity");
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setPlacingOrder(true);
    setError("");
    try {
      const res = await api.post("/orders/create/", {
        shipping_address: address,
      });
      navigate(`/orders/${res.data.id}`);
    } catch (err) {
      const data = err.response?.data;
      if (data) {
        const firstError = Object.values(data)[0];
        setError(Array.isArray(firstError) ? firstError[0] : firstError);
      } else {
        setError("Failed to place order. Please try again.");
      }
    } finally {
      setPlacingOrder(false);
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }
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
          setError("Failed to get address from location");
        }
      },
      () => setError("Unable to retrieve your location")
    );
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Cart</h1>

      {!cart || cart.items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Your cart is empty</p>
          <button
            onClick={() => navigate("/")}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart items */}
          <div className="flex-1 space-y-4">
            {cart.items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow p-4 flex gap-4 items-center"
              >
                <div className="w-20 h-20 bg-gray-200 rounded-md overflow-hidden flex-shrink-0">
                  {item.product.image ? (
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                      No image
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold">{item.product.name}</h3>
                  <p className="text-blue-600 font-bold">${item.product.price}</p>
                </div>

                <div className="flex items-center border border-gray-300 rounded-md">
                  <button
                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                    className="px-3 py-1 hover:bg-gray-100"
                  >
                    -
                  </button>
                  <span className="px-3 py-1">{item.quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                    className="px-3 py-1 hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>

                <p className="font-bold w-20 text-right">${item.subtotal}</p>

                <button
                  onClick={() => handleRemove(item.id)}
                  className="text-red-500 hover:text-red-700 ml-2"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Order summary */}
          <div className="w-full lg:w-80">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-bold">${cart.total}</span>
              </div>
              <div className="flex justify-between mb-6">
                <span className="text-gray-600">Shipping</span>
                <span className="text-green-500">Free</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-4 mb-6">
                <span>Total</span>
                <span>${cart.total}</span>
              </div>

              {!showAddressForm ? (
                <button
                  onClick={() => setShowAddressForm(true)}
                  className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
                >
                  Proceed to Checkout
                </button>
              ) : (
                <form onSubmit={handlePlaceOrder} className="space-y-3">
                  {error && (
                    <p className="text-red-500 text-sm bg-red-50 p-2 rounded">
                      {error}
                    </p>
                  )}
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter your full shipping address&#10;e.g. 123 Main St, Athens, Greece"
                    rows={3}
                    required
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
                    type="submit"
                    disabled={placingOrder}
                    className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {placingOrder ? "Placing Order..." : "Place Order"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddressForm(false)}
                    className="w-full border border-gray-300 text-gray-600 py-2 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
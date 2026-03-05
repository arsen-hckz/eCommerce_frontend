import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function CartPage() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
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

  useEffect(() => { fetchCart(); }, []);

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

  const handlePlaceOrder = async () => {
    setPlacingOrder(true);
    setError("");
    try {
      const res = await api.post("/orders/create/", { shipping_address: "" });
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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-4xl font-black text-gray-200 tracking-tighter">LOADING...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b-2 border-gray-900 px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-5xl font-black tracking-tighter text-gray-900">YOUR CART</h1>
          <p className="text-gray-400 text-sm uppercase tracking-widest font-bold mt-1">
            {cart?.items?.length || 0} items
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-12">
        {!cart || cart.items.length === 0 ? (
          <div className="text-center py-32">
            <p className="text-8xl font-black text-gray-100 tracking-tighter mb-4">EMPTY</p>
            <p className="text-gray-400 mb-8">Your cart has no items yet</p>
            <button
              onClick={() => navigate("/")}
              className="bg-gray-900 text-white px-12 py-4 font-black text-sm uppercase tracking-widest hover:bg-gray-700 transition-colors"
            >
              Start Shopping →
            </button>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-16">
            {/* Cart items */}
            <div className="flex-1">
              <div className="grid grid-cols-4 text-xs font-bold uppercase tracking-widest text-gray-400 pb-4 border-b border-gray-100 mb-6">
                <span className="col-span-2">Product</span>
                <span className="text-center">Quantity</span>
                <span className="text-right">Total</span>
              </div>

              <div className="space-y-6">
                {cart.items.map((item) => (
                  <div key={item.id} className="grid grid-cols-4 items-center py-6 border-b border-gray-100">
                    {/* Product info */}
                    <div className="col-span-2 flex items-center gap-4">
                      <div className="w-20 h-20 bg-gray-50 overflow-hidden flex-shrink-0">
                        {item.product.image ? (
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-200 text-2xl">
                            🛍️
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-black text-gray-900">{item.product.name}</p>
                        <p className="text-gray-400 text-sm font-bold">${item.product.price}</p>
                        <button
                          onClick={() => handleRemove(item.id)}
                          className="text-xs text-red-400 uppercase tracking-widest font-bold hover:text-red-600 transition-colors mt-1"
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    {/* Quantity */}
                    <div className="flex items-center justify-center">
                      <div className="flex items-center border-2 border-gray-900">
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center font-bold hover:bg-gray-100 transition-colors"
                        >
                          −
                        </button>
                        <span className="w-8 h-8 flex items-center justify-center font-black text-sm border-x-2 border-gray-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center font-bold hover:bg-gray-100 transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Subtotal */}
                    <p className="font-black text-gray-900 text-right">${item.subtotal}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Order summary */}
            <div className="w-full lg:w-96">
              <div className="border-2 border-gray-900 p-8 sticky top-8">
                <h2 className="text-xl font-black tracking-tighter uppercase mb-8">
                  Order Summary
                </h2>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 uppercase tracking-widest font-bold">Subtotal</span>
                    <span className="font-black">${cart.total}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 uppercase tracking-widest font-bold">Shipping</span>
                    <span className="font-black text-green-600">Free</span>
                  </div>
                  <div className="border-t-2 border-gray-900 pt-4 flex justify-between">
                    <span className="font-black uppercase tracking-widest">Total</span>
                    <span className="font-black text-2xl">${cart.total}</span>
                  </div>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={placingOrder}
                  className="w-full bg-gray-900 text-white py-5 font-black text-sm uppercase tracking-widest hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  {placingOrder ? "Processing..." : "Place Order →"}
                </button>

                {error && (
                  <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-3">
                    <p className="text-red-600 text-sm font-medium">{error}</p>
                  </div>
                )}

                <button
                  onClick={() => navigate("/")}
                  className="w-full mt-3 border-2 border-gray-200 py-3 text-xs font-bold uppercase tracking-widest text-gray-500 hover:border-gray-900 hover:text-gray-900 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
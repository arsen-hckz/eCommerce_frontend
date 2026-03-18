import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useLoadScript, Autocomplete } from "@react-google-maps/api";
import api from "../api/axios";

const libraries = ["places"];

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const [address, setAddress] = useState("");
  const [country, setCountry] = useState("");
  const [postcode, setPostcode] = useState("");
  const [checkoutError, setCheckoutError] = useState("");
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");
  const autocompleteRef = useRef(null);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/${id}/`);
        setOrder(res.data);
        if (res.data.shipping_address && res.data.shipping_address !== "To be filled") {
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

  useEffect(() => {
    if (searchParams.get("payment") === "success") {
      const timer = setTimeout(() => navigate("/orders"), 3000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  const handlePlaceChanged = () => {
    const place = autocompleteRef.current.getPlace();
    if (!place.address_components) return;
    setAddress(place.formatted_address);
    place.address_components.forEach((component) => {
      if (component.types.includes("country")) setCountry(component.long_name);
      if (component.types.includes("postal_code")) setPostcode(component.long_name);
    });
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }
    setLocationLoading(true);
    setLocationError("");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { headers: { Accept: "application/json" } }
          );
          if (!res.ok) throw new Error(`Nominatim error: ${res.status}`);
          const data = await res.json();
          setAddress(data.display_name || "");
          setCountry(data.address?.country || "");
          setPostcode(data.address?.postcode || "");
        } catch (err) {
          setLocationError("Could not look up your address. Please type it manually.");
          console.error("Reverse geocoding failed:", err);
        } finally {
          setLocationLoading(false);
        }
      },
      (error) => {
        setLocationLoading(false);
        setLocationError("Could not get your location: " + error.message);
        console.error("Geolocation error:", error);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };
  const handleCheckout = async () => {
    setCheckingOut(true);
    setCheckoutError("");
    // address from Google Places / Nominatim already contains postcode & country,
    // so only append them if they are not already present in the address string.
    const postcodeAppend = postcode && !address.includes(postcode) ? `, ${postcode}` : "";
    const countryAppend = country && !address.includes(country) ? `, ${country}` : "";
    const fullAddress = `${address}${postcodeAppend}${countryAppend}`;
    try {
      await api.patch(`/orders/${id}/update-address/`, { shipping_address: fullAddress });
      const res = await api.post(`/orders/${id}/checkout/`);
      if (!res.data.checkout_url) throw new Error("No checkout URL returned from server.");
      window.location.href = res.data.checkout_url;
    } catch (err) {
      console.error("Checkout failed:", err);
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.error ||
        err?.message ||
        "Payment setup failed. Please try again.";
      setCheckoutError(msg);
      setCheckingOut(false);
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

  if (searchParams.get("payment") === "success") return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center text-center px-8">
      <p className="text-6xl font-black tracking-tighter text-gray-900 mb-4">✓ PAYMENT SUCCESSFUL</p>
      <p className="text-gray-400 text-sm uppercase tracking-widest font-bold mb-2">
        Order #{id} is confirmed
      </p>
      <p className="text-gray-400 text-xs">Redirecting to your orders...</p>
    </div>
  );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-4xl font-black text-gray-200 tracking-tighter">LOADING...</p>
    </div>
  );
  if (!order) return null;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b-2 border-gray-900 px-8 py-8">
        <div className="max-w-4xl mx-auto flex justify-between items-end">
          <div>
            <button
              onClick={() => navigate("/orders")}
              className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors mb-3 block"
            >
              ← Back to Orders
            </button>
            <h1 className="text-5xl font-black tracking-tighter text-gray-900">
              ORDER #{order.id}
            </h1>
            <p className="text-gray-400 text-sm uppercase tracking-widest font-bold mt-1">
              {new Date(order.created_at).toLocaleDateString("en-GB", {
                day: "numeric", month: "long", year: "numeric"
              })}
            </p>
          </div>
          <div className="flex gap-2">
            <span className={`text-xs px-4 py-2 border-2 font-black uppercase tracking-widest ${getStatusStyle(order.status)}`}>
              {order.status}
            </span>
            <span className={`text-xs px-4 py-2 border-2 font-black uppercase tracking-widest ${
              order.payment_status === "paid"
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-red-50 text-red-700 border-red-200"
            }`}>
              {order.payment_status}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-12">
        {/* Order items */}
        <div className="mb-12">
          <h2 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-6">
            Items
          </h2>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-6 py-4 border-b border-gray-100">
                <div className="w-16 h-16 bg-gray-50 overflow-hidden flex-shrink-0">
                  {item.product.image ? (
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-200">
                      🛍️
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-black text-gray-900">{item.product.name}</p>
                  <p className="text-sm text-gray-400 font-bold">x{item.quantity}</p>
                </div>
                <p className="font-black text-gray-900 text-lg">${item.subtotal}</p>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-6 border-t-2 border-gray-900 mt-6">
            <span className="font-black uppercase tracking-widest">Total</span>
            <span className="text-3xl font-black text-gray-900">${order.total_price}</span>
          </div>
        </div>

        {/* Checkout section */}
        {(order.payment_status === "unpaid" || order.payment_status === "pending") && (
          <div className="border-2 border-gray-900 p-8">
            <h2 className="text-xl font-black tracking-tighter uppercase mb-6">
              Shipping Address
            </h2>

            <div className="space-y-4 mb-6">
              {isLoaded ? (
                <Autocomplete
                  onLoad={(ref) => (autocompleteRef.current = ref)}
                  onPlaceChanged={handlePlaceChanged}
                >
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Start typing your address..."
                    className="w-full border-2 border-gray-200 px-4 py-3 focus:outline-none focus:border-gray-900 transition-colors"
                  />
                </Autocomplete>
              ) : (
                <input
                  type="text"
                  placeholder="Loading address search..."
                  className="w-full border-2 border-gray-200 px-4 py-3"
                  disabled
                />
              )}

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="Country"
                    className="w-full border-2 border-gray-200 px-4 py-3 focus:outline-none focus:border-gray-900 transition-colors"
                  />
                </div>
                <div className="w-40">
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                    Postcode
                  </label>
                  <input
                    type="text"
                    value={postcode}
                    onChange={(e) => setPostcode(e.target.value)}
                    placeholder="Postcode"
                    className="w-full border-2 border-gray-200 px-4 py-3 focus:outline-none focus:border-gray-900 transition-colors"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleGetLocation}
                disabled={locationLoading}
                className="w-full border-2 border-gray-200 py-3 text-xs font-bold uppercase tracking-widest text-gray-500 hover:border-gray-900 hover:text-gray-900 transition-colors disabled:opacity-50"
              >
                {locationLoading ? "Detecting Location..." : "📍 Use My Current Location"}
              </button>
              {locationError && (
                <p className="text-red-600 text-xs font-bold mt-1">{locationError}</p>
              )}
            </div>

            {checkoutError && (
              <p className="text-red-600 text-sm font-bold mb-4 border border-red-200 bg-red-50 px-4 py-3">
                {checkoutError}
              </p>
            )}
            <button
              onClick={handleCheckout}
              disabled={checkingOut || !address}
              className="w-full bg-gray-900 text-white py-5 font-black text-sm uppercase tracking-widest hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              {checkingOut ? "Redirecting to Payment..." : "Pay Now with Stripe →"}
            </button>
          </div>
        )}

        {order.payment_status === "paid" && (
          <div className="border-2 border-green-500 bg-green-50 p-8 text-center">
            <p className="text-3xl font-black tracking-tighter text-green-700 mb-2">
              ✓ PAYMENT SUCCESSFUL
            </p>
            <p className="text-green-600 font-bold uppercase tracking-widest text-xs">
              Shipping to: {order.shipping_address}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

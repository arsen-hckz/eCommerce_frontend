import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function ProductDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartMessage, setCartMessage] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const [productRes, reviewsRes] = await Promise.all([
          api.get(`/products/${id}/`),
          api.get(`/reviews/product/${id}/`),
        ]);
        setProduct(productRes.data);
        setReviews(reviewsRes.data.results || reviewsRes.data);
      } catch {
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) { navigate("/login"); return; }
    setAddingToCart(true);
    try {
      await api.post("/orders/cart/add/", { product_id: product.id, quantity });
      setCartMessage("Added to cart!");
      setTimeout(() => setCartMessage(""), 3000);
    } catch {
      setCartMessage("Failed to add to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError("");
    setReviewSuccess("");
    try {
      const res = await api.post("/reviews/", { product: product.id, rating, comment });
      setReviews([res.data, ...reviews]);
      setReviewSuccess("Review submitted!");
      setComment("");
      setRating(5);
    } catch (err) {
      const data = err.response?.data;
      if (data) {
        const firstError = Object.values(data)[0];
        setReviewError(Array.isArray(firstError) ? firstError[0] : firstError);
      } else {
        setReviewError("Failed to submit review");
      }
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-4xl font-black text-gray-200 tracking-tighter">LOADING...</p>
    </div>
  );
  if (!product) return null;

  return (
    <div className="min-h-screen bg-white">

      {/* Breadcrumb */}
      <div className="border-b border-gray-100 px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs text-gray-400 uppercase tracking-widest font-bold">
          <button onClick={() => navigate("/")} className="hover:text-gray-900 transition-colors">
            Shop
          </button>
          <span>/</span>
          <span>{product.category_name}</span>
          <span>/</span>
          <span className="text-gray-900">{product.name}</span>
        </div>
      </div>

      {/* Product section */}
      <div className="max-w-7xl mx-auto px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

          {/* Image */}
          <div className="aspect-square bg-gray-50 overflow-hidden">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-200 text-8xl">
                🛍️
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col justify-center">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
              {product.category_name}
            </p>
            <h1 className="text-5xl font-black tracking-tighter text-gray-900 leading-none mb-6">
              {product.name}
            </h1>
            <p className="text-4xl font-black text-gray-900 mb-8">
              ${product.price}
            </p>
            <p className="text-gray-500 leading-relaxed mb-10">
              {product.description}
            </p>

            {product.stock === 0 ? (
              <div className="border-2 border-red-200 bg-red-50 px-6 py-4 mb-6">
                <p className="text-red-500 font-bold uppercase tracking-widest text-sm">
                  Out of Stock
                </p>
              </div>
            ) : product.stock < 10 ? (
              <div className="border-2 border-orange-200 bg-orange-50 px-6 py-4 mb-6">
                <p className="text-orange-500 font-bold uppercase tracking-widest text-sm">
                  Only {product.stock} left
                </p>
              </div>
            ) : null}

            {product.stock > 0 && (
              <>
                {/* Quantity selector */}
                <div className="flex items-center gap-6 mb-6">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Quantity</p>
                  <div className="flex items-center border-2 border-gray-900">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-12 h-12 flex items-center justify-center text-xl font-bold hover:bg-gray-100 transition-colors"
                    >
                      −
                    </button>
                    <span className="w-12 h-12 flex items-center justify-center font-black text-lg border-x-2 border-gray-900">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="w-12 h-12 flex items-center justify-center text-xl font-bold hover:bg-gray-100 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Add to cart */}
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  className="w-full bg-gray-900 text-white py-5 font-black text-sm uppercase tracking-widest hover:bg-gray-700 transition-colors disabled:opacity-50 mb-4"
                >
                  {addingToCart ? "Adding..." : "Add to Cart →"}
                </button>

                {cartMessage && (
                  <p className={`text-sm font-bold uppercase tracking-wider text-center ${
                    cartMessage.includes("Failed") ? "text-red-500" : "text-green-500"
                  }`}>
                    {cartMessage}
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        {/* Reviews section */}
        <div className="mt-24 border-t-2 border-gray-900 pt-16">
          <div className="flex items-end justify-between mb-12">
            <h2 className="text-4xl font-black tracking-tighter text-gray-900">
              REVIEWS
            </h2>
            <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">
              {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Write review */}
            {user && (
              <div>
                <h3 className="text-xl font-black tracking-tight mb-6 uppercase">
                  Write a Review
                </h3>
                {reviewError && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                    <p className="text-red-600 text-sm font-medium">{reviewError}</p>
                  </div>
                )}
                {reviewSuccess && (
                  <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
                    <p className="text-green-600 text-sm font-medium">{reviewSuccess}</p>
                  </div>
                )}
                <form onSubmit={handleReviewSubmit} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                      Rating
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setRating(r)}
                          className={`w-10 h-10 border-2 font-black text-sm transition-colors ${
                            r <= rating
                              ? "bg-gray-900 text-white border-gray-900"
                              : "bg-white text-gray-300 border-gray-200 hover:border-gray-900"
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                      Comment
                    </label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={4}
                      placeholder="Share your experience..."
                      className="w-full border-2 border-gray-200 px-4 py-3 focus:outline-none focus:border-gray-900 transition-colors resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-gray-900 text-white py-4 font-black text-sm uppercase tracking-widest hover:bg-gray-700 transition-colors"
                  >
                    Submit Review →
                  </button>
                </form>
              </div>
            )}

            {/* Reviews list */}
            <div className="space-y-6">
              {reviews.length === 0 ? (
                <div className="py-16 text-center">
                  <p className="text-5xl font-black text-gray-100 tracking-tighter">NO REVIEWS</p>
                  <p className="text-gray-400 mt-2 text-sm">Be the first to review this product</p>
                </div>
              ) : (
                reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-100 pb-6">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-black text-gray-900 text-sm uppercase tracking-wider">
                          {review.user_email}
                        </p>
                        <div className="flex gap-1 mt-1">
                          {[1, 2, 3, 4, 5].map((r) => (
                            <span
                              key={r}
                              className={`text-sm ${r <= review.rating ? "text-gray-900" : "text-gray-200"}`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 uppercase tracking-widest">
                        {new Date(review.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="text-gray-600 leading-relaxed">{review.comment}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
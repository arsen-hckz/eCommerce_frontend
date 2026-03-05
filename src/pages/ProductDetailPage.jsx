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
    if (!user) {
      navigate("/login");
      return;
    }
    setAddingToCart(true);
    try {
      await api.post("/orders/cart/add/", {
        product_id: product.id,
        quantity,
      });
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
      const res = await api.post("/reviews/", {
        product: product.id,
        rating,
        comment,
      });
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

  if (loading) return <div className="text-center py-12">Loading...</div>;
  if (!product) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Product details */}
      <div className="flex flex-col md:flex-row gap-8 mb-12">
        <div className="w-full md:w-1/2 h-80 bg-gray-200 rounded-lg overflow-hidden">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No image
            </div>
          )}
        </div>

        <div className="w-full md:w-1/2">
          <p className="text-sm text-gray-500 mb-1">{product.category_name}</p>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <p className="text-2xl text-blue-600 font-bold mb-4">${product.price}</p>
          <p className="text-gray-600 mb-6">{product.description}</p>

          {product.stock === 0 ? (
            <p className="text-red-500 font-medium mb-4">Out of stock</p>
          ) : product.stock < 10 ? (
            <p className="text-orange-500 font-medium mb-4">Low stock</p>
          ) : null}

          {product.stock > 0 && (
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center border border-gray-300 rounded-md">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 hover:bg-gray-100"
                >
                  -
                </button>
                <span className="px-4 py-2">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="px-3 py-2 hover:bg-gray-100"
                >
                  +
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={addingToCart}
                className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {addingToCart ? "Adding..." : "Add to Cart"}
              </button>
            </div>
          )}

          {cartMessage && (
            <p className={`text-sm ${cartMessage.includes("Failed") ? "text-red-500" : "text-green-500"}`}>
              {cartMessage}
            </p>
          )}
        </div>
      </div>

      {/* Reviews section */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Reviews</h2>

        {/* Write a review */}
        {user && (
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
            {reviewError && <p className="text-red-500 text-sm mb-3">{reviewError}</p>}
            {reviewSuccess && <p className="text-green-500 text-sm mb-3">{reviewSuccess}</p>}
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                <select
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {[5, 4, 3, 2, 1].map((r) => (
                    <option key={r} value={r}>{r} stars</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Share your thoughts..."
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
              >
                Submit Review
              </button>
            </form>
          </div>
        )}

        {/* Reviews list */}
        {reviews.length === 0 ? (
          <p className="text-gray-500">No reviews yet. Be the first to review!</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium">{review.user_email}</p>
                    <p className="text-yellow-500">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</p>
                  </div>
                  <p className="text-sm text-gray-400">
                    {new Date(review.created_at).toLocaleDateString()}
                  </p>
                </div>
                <p className="text-gray-600">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
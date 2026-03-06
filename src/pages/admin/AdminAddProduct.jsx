import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../api/axios";

export default function AdminAddProduct() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    is_active: true,
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/products/categories/");
        setCategories(res.data.results || res.data);
      } catch {
        console.error("Failed to fetch categories");
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("description", formData.description);
      data.append("price", formData.price);
      data.append("stock", formData.stock);
      data.append("category", formData.category);
      data.append("is_active", formData.is_active);
      if (image) data.append("image", image);
      await api.post("/products/create/", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate("/admin/products");
    } catch (err) {
      const data = err.response?.data;
      if (data) {
        const firstError = Object.values(data)[0];
        setError(Array.isArray(firstError) ? firstError[0] : firstError);
      } else {
        setError("Failed to create product");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b-2 border-gray-900 px-8 py-8">
        <div className="max-w-3xl mx-auto flex justify-between items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Admin / Products</p>
            <h1 className="text-5xl font-black tracking-tighter text-gray-900">ADD PRODUCT</h1>
          </div>
          <Link to="/admin/products" className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors">
            ← Back
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-8 py-12">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8">
            <p className="text-red-600 text-sm font-bold">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">
              Product Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="e.g. Leather Wallet"
              className="w-full border-2 border-gray-200 px-4 py-3 font-bold focus:outline-none focus:border-gray-900 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Describe the product..."
              className="w-full border-2 border-gray-200 px-4 py-3 focus:outline-none focus:border-gray-900 transition-colors resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">
                Price ($)
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                step="0.01"
                min="0"
                required
                placeholder="0.00"
                className="w-full border-2 border-gray-200 px-4 py-3 font-bold focus:outline-none focus:border-gray-900 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">
                Stock
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                min="0"
                required
                placeholder="0"
                className="w-full border-2 border-gray-200 px-4 py-3 font-bold focus:outline-none focus:border-gray-900 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full border-2 border-gray-200 px-4 py-3 font-bold focus:outline-none focus:border-gray-900 transition-colors"
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">
              Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full border-2 border-gray-200 px-4 py-3 text-sm font-bold text-gray-500 file:mr-4 file:py-1 file:px-4 file:border-0 file:bg-gray-900 file:text-white file:font-black file:text-xs file:uppercase file:tracking-widest hover:file:bg-gray-700"
            />
            {imagePreview && (
              <div className="mt-4 w-48 h-48 border-2 border-gray-900 overflow-hidden">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 py-4 border-t-2 border-gray-100">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="w-5 h-5 border-2 border-gray-900"
              id="is_active"
            />
            <label htmlFor="is_active" className="text-xs font-black uppercase tracking-widest text-gray-700">
              Active — visible to customers
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 text-white py-5 font-black text-sm uppercase tracking-widest hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Product →"}
          </button>
        </form>
      </div>
    </div>
  );
}
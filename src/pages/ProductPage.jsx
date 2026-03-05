import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const fetchCategories = async () => {
    try {
      const res = await api.get("/products/categories/");
      setCategories(res.data.results || res.data);
    } catch {
      console.error("Failed to fetch categories");
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (minPrice) params.append("min_price", minPrice);
      if (maxPrice) params.append("max_price", maxPrice);
      if (selectedCategory) params.append("category", selectedCategory);

      const res = await api.get(`/products/?${params.toString()}`);
      setProducts(res.data.results || res.data);
    } catch {
      console.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Products</h1>

      {/* Search and filters */}
      <form onSubmit={handleSearch} className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 flex-1 min-w-48 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="number"
          placeholder="Min price"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 w-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="number"
          placeholder="Max price"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 w-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Search
        </button>
      </form>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap mb-8">
        <button
          onClick={() => setSelectedCategory("")}
          className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
            selectedCategory === ""
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.name)}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
              selectedCategory === cat.name
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Products grid */}
      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No products found</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Link
              key={product.id}
              to={`/products/${product.id}`}
              className="bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="h-48 bg-gray-200 rounded-t-lg overflow-hidden">
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
              <div className="p-4">
                <h3 className="font-semibold text-gray-800">{product.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{product.category_name}</p>
                <p className="text-blue-600 font-bold mt-2">${product.price}</p>
                <p className="text-sm mt-1">
                  {product.stock === 0 ? (
                    <span className="text-red-500">Out of stock</span>
                  ) : product.stock < 10 ? (
                    <span className="text-orange-500">Low stock</span>
                  ) : null}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
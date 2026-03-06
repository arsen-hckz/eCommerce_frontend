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

  useEffect(() => { fetchCategories(); }, []);
  useEffect(() => { fetchProducts(); }, [selectedCategory]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Hero */}
      <div className="bg-zinc-900 text-white px-8 py-16 text-center">
        <h1 className="text-5xl font-black tracking-tight mb-3">
          DISCOVER <span className="text-amber-400">PRODUCTS</span>
        </h1>
        <p className="text-zinc-400 text-lg">You're legally robbing us here!</p>

        {/* Search */}
        <form onSubmit={handleSearch} className="mt-8 flex gap-2 max-w-2xl mx-auto">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 rounded-full px-5 py-3 focus:outline-none focus:border-amber-400"
          />
          <input
            type="number"
            placeholder="Min $"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-24 bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 rounded-full px-4 py-3 focus:outline-none focus:border-amber-400"
          />
          <input
            type="number"
            placeholder="Max $"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-24 bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 rounded-full px-4 py-3 focus:outline-none focus:border-amber-400"
          />
          <button
            type="submit"
            className="bg-amber-400 text-zinc-900 font-bold px-6 py-3 rounded-full hover:bg-amber-300 transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Category filter */}
        <div className="flex gap-2 flex-wrap mb-8">
          <button
            onClick={() => setSelectedCategory("")}
            className={`px-4 py-2 rounded-full text-sm font-bold border-2 transition-colors ${
              selectedCategory === ""
                ? "bg-zinc-900 text-white border-zinc-900"
                : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-900"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-4 py-2 rounded-full text-sm font-bold border-2 transition-colors ${
                selectedCategory === cat.name
                  ? "bg-zinc-900 text-white border-zinc-900"
                  : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-900"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Products grid */}
        {loading ? (
          <div className="text-center py-24 text-zinc-400 text-lg">Loading...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-24 text-zinc-400 text-lg">No products found</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <Link
                key={product.id}
                to={`/products/${product.id}`}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow"
              >
                <div className="h-52 bg-zinc-100 overflow-hidden">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-300 text-4xl">
                      🛍️
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-xs text-amber-500 font-bold uppercase tracking-wider mb-1">
                    {product.category_name}
                  </p>
                  <h3 className="font-bold text-zinc-900 text-lg leading-tight">{product.name}</h3>
                  <div className="flex justify-between items-center mt-3">
                    <p className="text-2xl font-black text-zinc-900">${product.price}</p>
                    {product.stock === 0 ? (
                      <span className="text-xs text-red-500 font-bold">Out of stock</span>
                    ) : product.stock < 10 ? (
                      <span className="text-xs text-orange-500 font-bold">Low stock</span>
                    ) : null}
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
//force rebuild
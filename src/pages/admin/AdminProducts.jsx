import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stockModal, setStockModal] = useState(null); // product object
  const [stockAmount, setStockAmount] = useState(1);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get("/dashboard/products/");
        setProducts(res.data.results || res.data);
      } catch {
        console.error("Failed to fetch products");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleAddStock = async () => {
    if (stockAmount < 1) return;
    try {
      const newStock = stockModal.stock + stockAmount;
      await api.patch(`/products/${stockModal.id}/`, { stock: newStock });
      setProducts(products.map((p) =>
        p.id === stockModal.id ? { ...p, stock: newStock } : p
      ));
      setStockModal(null);
      setStockAmount(1);
    } catch {
      console.error("Failed to update stock");
    }
  };

  const handleToggleActive = async (productId, isActive) => {
    try {
      await api.patch(`/products/${productId}/`, { is_active: !isActive });
      setProducts(products.map((p) =>
        p.id === productId ? { ...p, is_active: !isActive } : p
      ));
    } catch {
      console.error("Failed to update product");
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-4xl font-black text-gray-200 tracking-tighter">LOADING...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b-2 border-gray-900 px-8 py-8">
        <div className="max-w-7xl mx-auto flex justify-between items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Admin</p>
            <h1 className="text-5xl font-black tracking-tighter text-gray-900">PRODUCTS</h1>
          </div>
          <div className="flex gap-4 items-center">
            <Link
              to="/admin/products/add"
              className="bg-gray-900 text-white px-6 py-3 text-xs font-black uppercase tracking-widest hover:bg-gray-700 transition-colors"
            >
              + Add Product
            </Link>
            <Link to="/admin" className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors">
              ← Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="border-2 border-gray-900 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-900">
                <th className="text-left px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Product</th>
                <th className="text-left px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Category</th>
                <th className="text-left px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Price</th>
                <th className="text-left px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Stock</th>
                <th className="text-left px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Status</th>
                <th className="text-left px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => (
                <tr key={product.id} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${index % 2 === 0 ? "" : "bg-gray-50/50"}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 overflow-hidden flex-shrink-0">
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">🛍️</div>
                        )}
                      </div>
                      <span className="font-black text-gray-900">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">
                    {product.category_name}
                  </td>
                  <td className="px-6 py-4 font-black text-gray-900">${product.price}</td>
                  <td className="px-6 py-4">
                    <span className={`font-black ${product.stock === 0 ? "text-red-500" : product.stock < 10 ? "text-orange-500" : "text-gray-900"}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-3 py-1 border font-black uppercase tracking-wider ${
                      product.is_active
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-red-50 text-red-700 border-red-200"
                    }`}>
                      {product.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    <button
                      onClick={() => { setStockModal(product); setStockAmount(1); }}
                      className="text-xs px-3 py-2 border-2 border-blue-200 text-blue-600 font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-colors"
                    >
                      + Stock
                    </button>
                    <button
                      onClick={() => handleToggleActive(product.id, product.is_active)}
                      className={`text-xs px-3 py-2 border-2 font-black uppercase tracking-widest transition-colors ${
                        product.is_active
                          ? "border-red-200 text-red-500 hover:bg-red-500 hover:text-white"
                          : "border-green-200 text-green-600 hover:bg-green-600 hover:text-white"
                      }`}
                    >
                      {product.is_active ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {stockModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white border-2 border-gray-900 p-8 w-full max-w-sm">
            <h2 className="text-xl font-black uppercase tracking-tighter text-gray-900 mb-1">Add Stock</h2>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">{stockModal.name} — current: {stockModal.stock}</p>
            <input
              type="number"
              min="1"
              value={stockAmount}
              onChange={(e) => setStockAmount(Number(e.target.value))}
              className="w-full border-2 border-gray-200 px-4 py-3 font-bold text-gray-900 focus:outline-none focus:border-gray-900 mb-6"
            />
            <div className="flex gap-3">
              <button
                onClick={handleAddStock}
                className="flex-1 bg-gray-900 text-white py-3 text-xs font-black uppercase tracking-widest hover:bg-gray-700 transition-colors"
              >
                Confirm
              </button>
              <button
                onClick={() => setStockModal(null)}
                className="flex-1 border-2 border-gray-200 text-gray-500 py-3 text-xs font-black uppercase tracking-widest hover:border-gray-900 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
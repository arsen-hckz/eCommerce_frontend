import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-zinc-900 text-white mt-16">
      <div className="max-w-6xl mx-auto px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-black tracking-tight mb-3">
              SHOP<span className="text-amber-400">APP</span>
            </h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Curated products for the discerning buyer. Quality over quantity, always.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-4">Shop</h4>
            <div className="space-y-2">
              <Link to="/" className="block text-zinc-300 hover:text-amber-400 transition-colors text-sm">
                All Products
              </Link>
              <Link to="/cart" className="block text-zinc-300 hover:text-amber-400 transition-colors text-sm">
                Cart
              </Link>
              <Link to="/orders" className="block text-zinc-300 hover:text-amber-400 transition-colors text-sm">
                My Orders
              </Link>
            </div>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-4">Account</h4>
            <div className="space-y-2">
              <Link to="/login" className="block text-zinc-300 hover:text-amber-400 transition-colors text-sm">
                Login
              </Link>
              <Link to="/register" className="block text-zinc-300 hover:text-amber-400 transition-colors text-sm">
                Register
              </Link>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-zinc-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-zinc-500 text-sm">
            © {new Date().getFullYear()} ShopApp. All rights reserved.
          </p>
          <div className="flex gap-6">
            <span className="text-zinc-500 text-sm hover:text-amber-400 cursor-pointer transition-colors">
              Privacy Policy
            </span>
            <span className="text-zinc-500 text-sm hover:text-amber-400 cursor-pointer transition-colors">
              Terms of Service
            </span>
            <span className="text-zinc-500 text-sm hover:text-amber-400 cursor-pointer transition-colors">
              Contact Us
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
import React from 'react';
import { ShoppingCart, User, Search, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <nav className="fixed w-full z-50 top-0 left-0 bg-slate-950/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent tracking-tighter">
              LUMINA
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/shop" className="text-slate-300 hover:text-white transition-colors">Shop</Link>
            <Link to="/categories" className="text-slate-300 hover:text-white transition-colors">Categories</Link>
            <Link to="/new" className="text-slate-300 hover:text-white transition-colors">New Arrivals</Link>
          </div>

          {/* Icons */}
          <div className="hidden md:flex items-center space-x-6">
            <button className="text-slate-400 hover:text-white transition-colors">
              <Search size={22} />
            </button>
            <Link to="/cart" className="text-slate-400 hover:text-white transition-colors relative">
              <ShoppingCart size={22} />
              <span className="absolute -top-2 -right-2 bg-primary-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white">0</span>
            </Link>
            <Link to="/login" className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors">
              <User size={22} />
              <span className="text-sm font-medium">Account</span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-slate-400 hover:text-white">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-slate-900 border-b border-white/5 animate-in slide-in-from-top duration-300">
          <div className="px-4 pt-2 pb-6 space-y-4">
            <Link to="/shop" className="block text-lg text-slate-300">Shop</Link>
            <Link to="/categories" className="block text-lg text-slate-300">Categories</Link>
            <Link to="/new" className="block text-lg text-slate-300">New Arrivals</Link>
            <div className="flex items-center space-x-6 pt-4 border-t border-white/5">
              <Link to="/cart" className="flex items-center space-x-2 text-slate-300">
                <ShoppingCart size={20} />
                <span>Cart (0)</span>
              </Link>
              <Link to="/login" className="flex items-center space-x-2 text-slate-300">
                <User size={20} />
                <span>Login</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
import React from 'react';
import { ShoppingCart, User, Search, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <nav className="fixed w-full z-50 top-0 left-0 bg-[rgba(2,6,23,0.80)] backdrop-blur-md border-b border-white/5">

      {/* Inner container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">

          {/* Logo */}
          <Link
            to="/"
            className="text-2xl font-bold tracking-tighter no-underline shrink-0"
            style={{
              background: 'linear-gradient(90deg,#a78bfa,#7c3aed)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            LUMINA
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/shop"       className="text-slate-300 no-underline text-[15px] hover:text-white transition-colors duration-200">Shop</Link>
            <Link to="/categories" className="text-slate-300 no-underline text-[15px] hover:text-white transition-colors duration-200">Categories</Link>
            <Link to="/new"        className="text-slate-300 no-underline text-[15px] hover:text-white transition-colors duration-200">New Arrivals</Link>
          </div>

          {/* Desktop Icons */}
          <div className="hidden md:flex items-center gap-6">
            <button className="p-0 bg-transparent border-0 cursor-pointer text-slate-400 hover:text-white transition-colors duration-200">
              <Search size={22} />
            </button>
            <Link to="/cart" className="relative text-slate-400 no-underline hover:text-white transition-colors duration-200">
              <ShoppingCart size={22} />
              <span className="absolute -top-2 -right-2 bg-violet-700 text-white text-[10px] font-bold px-1.5 py-px rounded-full leading-none">
                0
              </span>
            </Link>
            <Link to="/login" className="flex items-center gap-2 text-slate-400 no-underline hover:text-white transition-colors duration-200">
              <User size={22} />
              <span className="text-sm font-medium">Account</span>
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-0 bg-transparent border-0 cursor-pointer text-slate-400 hover:text-white transition-colors duration-200"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-slate-900 border-b border-white/5">
          <div className="px-4 pt-2 pb-6 flex flex-col gap-4">
            <Link to="/shop"       className="block text-lg text-slate-300 no-underline py-1">Shop</Link>
            <Link to="/categories" className="block text-lg text-slate-300 no-underline py-1">Categories</Link>
            <Link to="/new"        className="block text-lg text-slate-300 no-underline py-1">New Arrivals</Link>

            <div className="flex items-center gap-6 pt-4 border-t border-white/5">
              <Link to="/cart"  className="flex items-center gap-2 text-slate-300 no-underline text-[15px]">
                <ShoppingCart size={20} /><span>Cart (0)</span>
              </Link>
              <Link to="/login" className="flex items-center gap-2 text-slate-300 no-underline text-[15px]">
                <User size={20} /><span>Login</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
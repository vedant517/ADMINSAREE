import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ShoppingBag } from 'lucide-react';

const Hero = () => {
  return (
    <div className="relative min-height-[90vh] flex items-center pt-20 overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] bg-primary-600/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm font-semibold mb-6">
              New Season 2026
            </span>
            <h1 className="text-6xl md:text-8xl font-bold leading-[1.1] mb-8 tracking-tight">
              Elegance in <br />
              <span className="text-slate-400">Every Detail.</span>
            </h1>
            <p className="text-xl text-slate-400 mb-10 max-w-lg leading-relaxed">
              Discover a curated collection of premium products designed to elevate your lifestyle. Quality meets modern aesthetics.
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="btn-primary flex items-center space-x-2 py-4 px-8">
                <span>Shop Collection</span>
                <ArrowRight size={20} />
              </button>
              <button className="px-8 py-4 border border-white/10 hover:bg-white/5 rounded-lg transition-all flex items-center space-x-2">
                <ShoppingBag size={20} />
                <span>Explore More</span>
              </button>
            </div>

            <div className="mt-16 flex items-center space-x-12 grayscale opacity-50">
              <div className="text-2xl font-bold italic tracking-wider">Vogue</div>
              <div className="text-2xl font-bold italic tracking-wider">Forbes</div>
              <div className="text-2xl font-bold italic tracking-wider">Hypebeast</div>
            </div>
          </motion.div>

          {/* Hero Image Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative"
          >
            <div className="aspect-[4/5] rounded-3xl overflow-hidden glass-card relative group">
              <img
                src="https://images.unsplash.com/photo-1539106609512-7179619d92ad?q=80&w=1470&auto=format&fit=crop"
                alt="Hero Fashion"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
              
              <div className="absolute bottom-8 left-8 right-8 p-6 glass-card border-white/10 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                <div className="text-sm font-medium text-primary-400 mb-1">Featured Item</div>
                <div className="text-lg font-bold">Midnight Tech Collection</div>
              </div>
            </div>

            {/* Floating UI elements */}
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-10 -right-10 p-6 glass-card shadow-2xl hidden md:block"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold">4.9</div>
                <div>
                  <div className="text-sm font-bold">Customer Rating</div>
                  <div className="text-xs text-slate-400">Based on 2.4k reviews</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Hero;

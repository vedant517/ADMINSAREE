import React from 'react';
import Navbar from '../../components/layout/Navbar';

export default function Shop() {
  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <main className="pt-28 px-6 max-w-4xl mx-auto text-center">
        <h1 className="text-2xl font-bold text-white mb-2">Welcome to Sheetalya</h1>
        <p className="text-slate-400 text-sm">You are signed in. Browse products from the shop menu.</p>
      </main>
    </div>
  );
}

import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/layout/AdminLayout';
import ProductMedia from './pages/admin/productMedia';
import AdminProfile from './pages/admin/adminprofile';
import Coupons from'./pages/admin/Coupons';   

// Lazy load components
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const Login = lazy(() => import('./pages/admin/Login'));
const AddProduct = lazy(() => import('./pages/admin/AddProduct'));

const Products = lazy(() => import('./pages/admin/Products'));
const Order = lazy(() => import('./pages/admin/Order'));
const Transactions = lazy(() => import('./pages/admin/Transactions'));
const Customers = lazy(() => import('./pages/admin/Customers'));
const ProductReviews = lazy(() => import('./pages/admin/ProductReviews'));
const Categories = lazy(() => import('./pages/admin/Categories'));
const Enquiries = lazy(() => import('./pages/admin/Enquiries'));
const ProductReviewPage = lazy(() => import('./pages/user/ProductReviewPage'));

const LoadingSpinner = () => (
  <div className="flex-1 flex items-center justify-center min-h-[400px]">
    <div className="w-10 h-10 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin"></div>
  </div>
);

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('isLoggedIn'));

  useEffect(() => {
    const checkAuth = () => {
      setIsAuthenticated(!!localStorage.getItem('isLoggedIn'));
    };
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  return (
    <Router>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route
            path="/"
            element={!isAuthenticated ? <Login setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/dashboard" replace />}
          />
          
          {/* Public / User routes */}
          <Route path="/product/:id/reviews" element={<ProductReviewPage />} />


          {/* Protected Dashboard Routes */}
          <Route
            element={isAuthenticated ? <AdminLayout setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/" replace />}
          >
            <Route path="/dashboard" element={<Dashboard />} />

            <Route path="/products" element={<Products />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/add-product" element={<AddProduct />} />
            <Route path="/edit-product/:id" element={<AddProduct />} />
            <Route path="/orders" element={<Order />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/media" element={<ProductMedia />} />
            <Route path="/reviews" element={<ProductReviews />} />
            <Route path="/roles" element={<AdminProfile />} />
            <Route path="/coupons" element={<Coupons />} />
            <Route path="/enquiries" element={<Enquiries />} />
            <Route path="*" element={<div className="p-8 text-slate-400 text-center"></div>} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

/** Protects customer-only routes — redirects to /login if not authenticated. */
export default function ProtectedRoute({ children }) {
  const isCustomerLoggedIn = useSelector((s) => s.auth.isCustomerLoggedIn);
  const location = useLocation();

  if (!isCustomerLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

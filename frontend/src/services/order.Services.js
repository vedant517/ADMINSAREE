import api from './api';

export const orderService = {
  // Get all orders with optional status filter
  getOrders: async (params) => {
    const response = await api.get('/orders', { params });
    return response.data;
  },

  // Update order status
  updateOrderStatus: async (orderId, orderData) => {
    const response = await api.put(`/orders/${orderId}`, orderData);
    return response.data;
  },

  // Get order statistics for dashboard
  getOrderStats: async () => {
    const response = await api.get('/orders/stats');
    return response.data;
  },
};
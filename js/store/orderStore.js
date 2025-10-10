import { API_BASE } from '../config.js';

let orders = [];
let isLoading = false;

export async function loadAllOrders() {
  if (isLoading) return orders;
  
  try {
    isLoading = true;
    
    if (API_BASE) {
      const response = await fetch(`${API_BASE}/api/admin/orders`, {
        credentials: 'include',
        cache: 'no-store'
      });
      
      if (response.ok) {
        orders = await response.json();
        return orders;
      } else if (response.status === 401) {
        throw new Error('Unauthorized - Admin access required');
      } else {
        throw new Error('Failed to fetch orders');
      }
    }
    
    // Fallback mock data for demo purposes
    orders = [
      {
        id: 1,
        user_id: 1,
        user_email: 'customer@example.com',
        total_price: 299.99,
        status: 'pending',
        created_at: '2024-01-15T10:30:00Z',
        items: [
          {
            product_id: 1,
            product_name: 'Aurora Headphones',
            quantity: 2,
            price: 129.99,
            image: 'https://images.unsplash.com/photo-1518447654495-6a1b6e155b43?q=80&w=800&auto=format&fit=crop'
          },
          {
            product_id: 2,
            product_name: 'Nebula Smartwatch',
            quantity: 1,
            price: 40.01,
            image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop'
          }
        ]
      },
      {
        id: 2,
        user_id: 2,
        user_email: 'user@example.com',
        total_price: 549.00,
        status: 'completed',
        created_at: '2024-01-14T15:45:00Z',
        items: [
          {
            product_id: 3,
            product_name: 'Stellar Drone',
            quantity: 1,
            price: 549.00,
            image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=800&auto=format&fit=crop'
          }
        ]
      },
      {
        id: 3,
        user_id: 3,
        user_email: 'test@example.com',
        total_price: 129.99,
        status: 'cancelled',
        created_at: '2024-01-13T09:15:00Z',
        items: [
          {
            product_id: 1,
            product_name: 'Aurora Headphones',
            quantity: 1,
            price: 129.99,
            image: 'https://images.unsplash.com/photo-1518447654495-6a1b6e155b43?q=80&w=800&auto=format&fit=crop'
          }
        ]
      }
    ];
    
    return orders;
  } catch (error) {
    console.error('Error loading orders:', error);
    return [];
  } finally {
    isLoading = false;
  }
}

export function getAllOrders() {
  return orders;
}

export function getOrdersByStatus(status) {
  if (!status || status === 'all') return orders;
  return orders.filter(order => order.status === status);
}

export function getOrderById(id) {
  return orders.find(order => order.id === parseInt(id));
}

export async function updateOrderStatus(orderId, newStatus) {
  try {
    if (API_BASE) {
      const response = await fetch(`${API_BASE}/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        // Update local state
        const order = orders.find(o => o.id === parseInt(orderId));
        if (order) {
          order.status = newStatus;
        }
        return { success: true };
      } else {
        throw new Error('Failed to update order status');
      }
    } else {
      // Mock update for demo
      const order = orders.find(o => o.id === parseInt(orderId));
      if (order) {
        order.status = newStatus;
        return { success: true };
      }
      throw new Error('Order not found');
    }
  } catch (error) {
    console.error('Error updating order status:', error);
    return { success: false, error: error.message };
  }
}

export function getOrderStats() {
  const total = orders.length;
  const pending = orders.filter(o => o.status === 'pending').length;
  const completed = orders.filter(o => o.status === 'completed').length;
  const cancelled = orders.filter(o => o.status === 'cancelled').length;
  
  return { total, pending, completed, cancelled };
}

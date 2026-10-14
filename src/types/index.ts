export type UserRole = 'admin' | 'waiter' | 'kitchen' | 'cashier' | 'customer';

export interface UserProfile {
  id: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
  image_url?: string;
  sort_order: number;
  created_at: string;
}

export interface MenuItem {
  id: string;
  category_id: string;
  name: string;
  description: string;
  price: number; // in UZS (so'm)
  image_url: string;
  is_available: boolean;
  preparation_time_minutes: number;
  calories?: number;
  weight_or_portion?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export type TableZone = 'main' | 'terrace' | 'vip';

export type TableStatus = 'free' | 'busy' | 'service' | 'bill';

export interface RestaurantTable {
  id: string;
  table_number: number;
  label?: string; // e.g. "Stol №12" or "VIP Samarqand"
  zone: TableZone;
  seats: number;
  qr_token: string;
  is_active: boolean;
  assigned_waiter_name?: string;
  created_at: string;
}

export type OrderStatus = 'new' | 'preparing' | 'ready' | 'delivered' | 'cancelled';

export interface OrderItem {
  id: string;
  order_id?: string;
  menu_item_id: string;
  item_name: string;
  unit_price: number; // price snapshot at order time
  quantity: number;
  item_note?: string;
  line_total: number;
}

export interface Order {
  id: string;
  order_number: string; // e.g. "#DF-1082"
  table_id: string;
  table_number: number;
  status: OrderStatus;
  total_amount: number;
  customer_note?: string;
  waiter_called?: boolean;
  waiter_call_note?: string;
  bill_requested?: boolean;
  waiter_name?: string;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  item_note?: string;
}

export interface ServiceCall {
  id: string;
  table_id: string;
  table_number: number;
  type: 'waiter' | 'bill' | 'water';
  note?: string;
  created_at: string;
  status: 'pending' | 'resolved';
}

export interface SalesReportEntry {
  date: string;
  revenue: number;
  orders_count: number;
  avg_check: number;
}

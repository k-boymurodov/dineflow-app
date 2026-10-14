import {
  Category,
  MenuItem,
  RestaurantTable,
  Order,
  OrderItem,
  OrderStatus,
  CartItem,
  ServiceCall,
} from '../types';
import {
  INITIAL_CATEGORIES,
  INITIAL_MENU_ITEMS,
  INITIAL_TABLES,
  INITIAL_ORDERS,
} from './seedData';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { generateOrderNumber } from '../utils/formatters';
import { soundService } from './sound';

const STORAGE_KEYS = {
  CATEGORIES: 'dineflow_categories_v1',
  MENU_ITEMS: 'dineflow_menu_items_v1',
  TABLES: 'dineflow_tables_v1',
  ORDERS: 'dineflow_orders_v1',
  SERVICE_CALLS: 'dineflow_service_calls_v1',
};

// Cross-tab real-time event channel
let broadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel('dineflow_realtime_channel');
  }
} catch {
  // Ignore fallback
}

export const emitRealtimeEvent = (type: 'orders' | 'tables' | 'menu' | 'service') => {
  window.dispatchEvent(new CustomEvent('dineflow:sync', { detail: { type } }));
  if (broadcastChannel) {
    broadcastChannel.postMessage({ type });
  }
};

class DataService {
  private isDemo: boolean;

  constructor() {
    this.isDemo = !isSupabaseConfigured();
    this.ensureInitialized();
  }

  public getIsDemo(): boolean {
    return this.isDemo;
  }

  private ensureInitialized() {
    if (typeof window === 'undefined') return;

    if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.MENU_ITEMS)) {
      localStorage.setItem(STORAGE_KEYS.MENU_ITEMS, JSON.stringify(INITIAL_MENU_ITEMS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.TABLES)) {
      localStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(INITIAL_TABLES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SERVICE_CALLS)) {
      localStorage.setItem(
        STORAGE_KEYS.SERVICE_CALLS,
        JSON.stringify([
          {
            id: 'call-1',
            table_id: 'table-14',
            table_number: 14,
            type: 'waiter',
            note: "Iltimos, qo'shimcha choynak va stakan olib keling",
            created_at: new Date(Date.now() - 2 * 60000).toISOString(),
            status: 'pending',
          },
        ])
      );
    }
  }

  // --- CATEGORIES ---
  public async getCategories(): Promise<Category[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from('categories').select('*').order('sort_order', { ascending: true });
        if (!error && data && data.length > 0) return data as Category[];
      } catch (e) {
        console.warn('Supabase categories error, falling back to local storage:', e);
      }
    }
    const raw = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return raw ? JSON.parse(raw) : INITIAL_CATEGORIES;
  }

  public async saveCategory(category: Category): Promise<Category> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from('categories').upsert(category).select().single();
        if (!error && data) {
          emitRealtimeEvent('menu');
          return data as Category;
        }
      } catch (e) {
        console.warn('Supabase saveCategory error:', e);
      }
    }
    const current = await this.getCategories();
    const idx = current.findIndex((c) => c.id === category.id);
    let updated: Category[];
    if (idx >= 0) {
      updated = [...current];
      updated[idx] = category;
    } else {
      updated = [...current, category];
    }
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(updated));
    emitRealtimeEvent('menu');
    return category;
  }

  public async deleteCategory(id: string): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('categories').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase deleteCategory error:', e);
      }
    }
    const current = await this.getCategories();
    const filtered = current.filter((c) => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(filtered));
    emitRealtimeEvent('menu');
  }

  // --- MENU ITEMS ---
  public async getMenuItems(): Promise<MenuItem[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from('menu_items').select('*');
        if (!error && data && data.length > 0) return data as MenuItem[];
      } catch (e) {
        console.warn('Supabase menu_items error, falling back to local storage:', e);
      }
    }
    const raw = localStorage.getItem(STORAGE_KEYS.MENU_ITEMS);
    return raw ? JSON.parse(raw) : INITIAL_MENU_ITEMS;
  }

  public async saveMenuItem(item: MenuItem): Promise<MenuItem> {
    item.updated_at = new Date().toISOString();
    if (!item.id) {
      item.id = 'dish-' + Date.now();
      item.created_at = new Date().toISOString();
    }
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from('menu_items').upsert(item).select().single();
        if (!error && data) {
          emitRealtimeEvent('menu');
          return data as MenuItem;
        }
      } catch (e) {
        console.warn('Supabase saveMenuItem error:', e);
      }
    }
    const current = await this.getMenuItems();
    const idx = current.findIndex((m) => m.id === item.id);
    let updated: MenuItem[];
    if (idx >= 0) {
      updated = [...current];
      updated[idx] = item;
    } else {
      updated = [item, ...current];
    }
    localStorage.setItem(STORAGE_KEYS.MENU_ITEMS, JSON.stringify(updated));
    emitRealtimeEvent('menu');
    return item;
  }

  public async deleteMenuItem(id: string): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('menu_items').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase deleteMenuItem error:', e);
      }
    }
    const current = await this.getMenuItems();
    const filtered = current.filter((m) => m.id !== id);
    localStorage.setItem(STORAGE_KEYS.MENU_ITEMS, JSON.stringify(filtered));
    emitRealtimeEvent('menu');
  }

  public async toggleDishAvailability(id: string, isAvailable: boolean): Promise<void> {
    const items = await this.getMenuItems();
    const target = items.find((m) => m.id === id);
    if (target) {
      target.is_available = isAvailable;
      await this.saveMenuItem(target);
    }
  }

  // --- TABLES ---
  public async getTables(): Promise<RestaurantTable[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from('restaurant_tables').select('*').order('table_number', { ascending: true });
        if (!error && data && data.length > 0) return data as RestaurantTable[];
      } catch (e) {
        console.warn('Supabase tables error, falling back to local storage:', e);
      }
    }
    const raw = localStorage.getItem(STORAGE_KEYS.TABLES);
    return raw ? JSON.parse(raw) : INITIAL_TABLES;
  }

  public async saveTable(table: RestaurantTable): Promise<RestaurantTable> {
    if (!table.id) {
      table.id = 'table-' + Date.now();
      table.created_at = new Date().toISOString();
      table.qr_token = `qr-${table.table_number}-${Math.random().toString(36).substring(2, 8)}`;
    }
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from('restaurant_tables').upsert(table).select().single();
        if (!error && data) {
          emitRealtimeEvent('tables');
          return data as RestaurantTable;
        }
      } catch (e) {
        console.warn('Supabase saveTable error:', e);
      }
    }
    const current = await this.getTables();
    const idx = current.findIndex((t) => t.id === table.id);
    let updated: RestaurantTable[];
    if (idx >= 0) {
      updated = [...current];
      updated[idx] = table;
    } else {
      updated = [...current, table].sort((a, b) => a.table_number - b.table_number);
    }
    localStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(updated));
    emitRealtimeEvent('tables');
    return table;
  }

  public async deleteTable(id: string): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('restaurant_tables').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase deleteTable error:', e);
      }
    }
    const current = await this.getTables();
    const filtered = current.filter((t) => t.id !== id);
    localStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(filtered));
    emitRealtimeEvent('tables');
  }

  // --- ORDERS ---
  public async getOrders(): Promise<Order[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*, items:order_items(*)')
          .order('created_at', { ascending: false });
        if (!error && data && data.length > 0) return data as Order[];
      } catch (e) {
        console.warn('Supabase orders error, falling back to local storage:', e);
      }
    }
    const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return raw ? JSON.parse(raw) : INITIAL_ORDERS;
  }

  /**
   * Safe order creation: calculates verified line totals and unit price snapshots
   * prevents client-side price tampering.
   */
  public async createOrder(params: {
    tableNumber: number;
    cartItems: CartItem[];
    customerNote?: string;
  }): Promise<Order> {
    const { tableNumber, cartItems, customerNote } = params;

    // Validate table
    const allTables = await this.getTables();
    const table = allTables.find((t) => t.table_number === tableNumber);
    if (!table) {
      throw new Error(`Stol №${tableNumber} tizimda topilmadi.`);
    }

    // Validate dishes from database/storage snapshots
    const allDishes = await this.getMenuItems();
    const dishMap = new Map<string, MenuItem>(allDishes.map((d) => [d.id, d]));

    let calculatedTotal = 0;
    const orderId = 'order-' + Date.now();
    const orderNumber = generateOrderNumber();

    const orderItems: OrderItem[] = cartItems.map((cart, idx) => {
      const liveDish = dishMap.get(cart.menuItem.id);
      if (!liveDish) {
        throw new Error(`Taom "${cart.menuItem.name}" topilmadi.`);
      }
      if (!liveDish.is_available) {
        throw new Error(`Taom "${liveDish.name}" hozirda mavjud emas.`);
      }
      const verifiedUnitPrice = liveDish.price;
      const verifiedLineTotal = verifiedUnitPrice * cart.quantity;
      calculatedTotal += verifiedLineTotal;

      return {
        id: `item-${orderId}-${idx + 1}`,
        order_id: orderId,
        menu_item_id: liveDish.id,
        item_name: liveDish.name,
        unit_price: verifiedUnitPrice,
        quantity: cart.quantity,
        item_note: cart.item_note || '',
        line_total: verifiedLineTotal,
      };
    });

    const newOrder: Order = {
      id: orderId,
      order_number: orderNumber,
      table_id: table.id,
      table_number: table.table_number,
      status: 'new',
      total_amount: calculatedTotal,
      customer_note: customerNote || '',
      waiter_name: table.assigned_waiter_name || 'Mas\'ul ofitsiant',
      items: orderItems,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        const { error: orderErr } = await supabase.from('orders').insert({
          id: newOrder.id,
          order_number: newOrder.order_number,
          table_id: newOrder.table_id,
          status: newOrder.status,
          total_amount: newOrder.total_amount,
          customer_note: newOrder.customer_note,
        });

        if (!orderErr) {
          const formattedItems = newOrder.items.map((it) => ({
            id: it.id,
            order_id: newOrder.id,
            menu_item_id: it.menu_item_id,
            item_name: it.item_name,
            unit_price: it.unit_price,
            quantity: it.quantity,
            item_note: it.item_note,
            line_total: it.line_total,
          }));
          await supabase.from('order_items').insert(formattedItems);
        }
      } catch (e) {
        console.warn('Supabase createOrder error, saving to local store:', e);
      }
    }

    // Save to local storage as well
    const currentOrders = await this.getOrders();
    const updatedOrders = [newOrder, ...currentOrders];
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updatedOrders));

    // Sound chime and notify all connected tabs
    soundService.playNewOrderChime();
    emitRealtimeEvent('orders');

    return newOrder;
  }

  public async updateOrderStatus(orderId: string, newStatus: OrderStatus): Promise<Order | null> {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase
          .from('orders')
          .update({ status: newStatus, updated_at: new Date().toISOString() })
          .eq('id', orderId);
      } catch (e) {
        console.warn('Supabase updateOrderStatus error:', e);
      }
    }

    const currentOrders = await this.getOrders();
    const target = currentOrders.find((o) => o.id === orderId);
    if (!target) return null;

    target.status = newStatus;
    target.updated_at = new Date().toISOString();

    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(currentOrders));

    if (newStatus === 'ready') {
      soundService.playSuccess();
    } else {
      soundService.playTick();
    }

    emitRealtimeEvent('orders');
    return target;
  }

  // --- SERVICE CALLS (Ofitsiantni chaqirish, Hisob so'rash) ---
  public async getServiceCalls(): Promise<ServiceCall[]> {
    const raw = localStorage.getItem(STORAGE_KEYS.SERVICE_CALLS);
    return raw ? JSON.parse(raw) : [];
  }

  public async requestService(tableNumber: number, type: 'waiter' | 'bill' | 'water', note?: string): Promise<ServiceCall> {
    const allTables = await this.getTables();
    const table = allTables.find((t) => t.table_number === tableNumber);

    const call: ServiceCall = {
      id: 'call-' + Date.now(),
      table_id: table ? table.id : `table-${tableNumber}`,
      table_number: tableNumber,
      type,
      note: note || (type === 'waiter' ? 'Ofitsiant chaqirildi' : type === 'bill' ? 'Hisob so\'radi' : 'Choy/suv to\'ldirish'),
      created_at: new Date().toISOString(),
      status: 'pending',
    };

    const currentCalls = await this.getServiceCalls();
    // replace any existing pending call for this table or append
    const updated = [call, ...currentCalls.filter((c) => !(c.table_number === tableNumber && c.status === 'pending'))];
    localStorage.setItem(STORAGE_KEYS.SERVICE_CALLS, JSON.stringify(updated));

    // Also update any active orders on that table to flag waiter_called
    const currentOrders = await this.getOrders();
    const activeOrder = currentOrders.find((o) => o.table_number === tableNumber && o.status !== 'delivered' && o.status !== 'cancelled');
    if (activeOrder) {
      if (type === 'waiter') activeOrder.waiter_called = true;
      if (type === 'bill') activeOrder.bill_requested = true;
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(currentOrders));
    }

    soundService.playNewOrderChime();
    emitRealtimeEvent('service');
    return call;
  }

  public async resolveServiceCall(callId: string): Promise<void> {
    const currentCalls = await this.getServiceCalls();
    const updated = currentCalls.map((c) => (c.id === callId ? { ...c, status: 'resolved' as const } : c));
    localStorage.setItem(STORAGE_KEYS.SERVICE_CALLS, JSON.stringify(updated));

    const target = currentCalls.find((c) => c.id === callId);
    if (target) {
      const currentOrders = await this.getOrders();
      const activeOrder = currentOrders.find((o) => o.table_number === target.table_number);
      if (activeOrder) {
        activeOrder.waiter_called = false;
        activeOrder.bill_requested = false;
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(currentOrders));
      }
    }

    soundService.playTick();
    emitRealtimeEvent('service');
  }

  public async resetAllDemoData(): Promise<void> {
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.MENU_ITEMS);
    localStorage.removeItem(STORAGE_KEYS.TABLES);
    localStorage.removeItem(STORAGE_KEYS.ORDERS);
    localStorage.removeItem(STORAGE_KEYS.SERVICE_CALLS);
    this.ensureInitialized();
    emitRealtimeEvent('orders');
    emitRealtimeEvent('menu');
    emitRealtimeEvent('tables');
    emitRealtimeEvent('service');
  }
}

export const dataService = new DataService();

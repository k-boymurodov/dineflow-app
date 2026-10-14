import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import {
  Category,
  MenuItem,
  RestaurantTable,
  Order,
  CartItem,
  UserRole,
  UserProfile,
  ServiceCall,
} from '../types';
import { dataService } from '../services/storage';
import { INITIAL_PROFILES } from '../services/seedData';
import { soundService } from '../services/sound';
import confetti from 'canvas-confetti';

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
}

interface AppContextType {
  // Auth & Roles
  userRole: UserRole;
  currentUser: UserProfile | null;
  setUserRole: (role: UserRole) => void;
  isDemoMode: boolean;

  // Active customer table
  activeTableNumber: number;
  setActiveTableNumber: (num: number) => void;

  // Cart
  cart: CartItem[];
  addToCart: (item: MenuItem, quantity?: number, note?: string) => void;
  updateCartQuantity: (itemId: string, quantity: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  cartTotal: number;
  cartItemCount: number;

  // Data
  categories: Category[];
  menuItems: MenuItem[];
  tables: RestaurantTable[];
  orders: Order[];
  serviceCalls: ServiceCall[];
  isLoading: boolean;

  // Sound
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;

  // Actions
  refreshData: () => Promise<void>;
  placeOrder: (customerNote?: string) => Promise<Order>;
  callWaiter: (note?: string) => Promise<void>;
  requestBill: () => Promise<void>;
  resolveServiceCall: (callId: string) => Promise<void>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;

  // Toasts
  toasts: ToastMessage[];
  addToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'dineflow_customer_cart_v1';
const TABLE_STORAGE_KEY = 'dineflow_active_table_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Read table from URL params if present e.g. ?table=12 or localStorage
  const getInitialTable = (): number => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlTable = params.get('table');
      if (urlTable && !isNaN(Number(urlTable))) {
        return Number(urlTable);
      }
      const saved = localStorage.getItem(TABLE_STORAGE_KEY);
      if (saved && !isNaN(Number(saved))) {
        return Number(saved);
      }
    }
    return 12; // Default to table 12 from mockup
  };

  const [activeTableNumber, setActiveTableNumberState] = useState<number>(getInitialTable);
  const [userRole, setUserRoleState] = useState<UserRole>('customer');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(INITIAL_PROFILES[0]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [serviceCalls, setServiceCalls] = useState<ServiceCall[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(soundService.isEnabled());
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Cart state persisted to localStorage
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const setActiveTableNumber = useCallback((num: number) => {
    setActiveTableNumberState(num);
    localStorage.setItem(TABLE_STORAGE_KEY, num.toString());
  }, []);

  const setSoundEnabled = useCallback((enabled: boolean) => {
    soundService.setEnabled(enabled);
    setSoundEnabledState(enabled);
  }, []);

  const addToast = useCallback((type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const id = 'toast-' + Date.now() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const setUserRole = useCallback((role: UserRole) => {
    setUserRoleState(role);
    const profile = INITIAL_PROFILES.find((p) => p.role === role) || INITIAL_PROFILES[0];
    setCurrentUser(role === 'customer' ? null : profile);
    soundService.playTick();
  }, []);

  // Fetch all live data
  const refreshData = useCallback(async () => {
    try {
      const [cats, items, tbls, ords, calls] = await Promise.all([
        dataService.getCategories(),
        dataService.getMenuItems(),
        dataService.getTables(),
        dataService.getOrders(),
        dataService.getServiceCalls(),
      ]);
      setCategories(cats);
      setMenuItems(items);
      setTables(tbls);
      setOrders(ords);
      setServiceCalls(calls);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load & real-time sync listeners
  useEffect(() => {
    refreshData();

    // Listen to local window events
    const handleSync = () => {
      refreshData();
    };
    window.addEventListener('dineflow:sync', handleSync);

    // Listen to cross-tab BroadcastChannel
    let bc: BroadcastChannel | null = null;
    try {
      if ('BroadcastChannel' in window) {
        bc = new BroadcastChannel('dineflow_realtime_channel');
        bc.onmessage = () => {
          refreshData();
        };
      }
    } catch {
      // Ignore
    }

    // Polling fallback every 6 seconds to ensure pristine synchronization
    const timer = setInterval(() => {
      refreshData();
    }, 6000);

    return () => {
      window.removeEventListener('dineflow:sync', handleSync);
      if (bc) bc.close();
      clearInterval(timer);
    };
  }, [refreshData]);

  // Save cart changes
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  // Cart operations
  const addToCart = useCallback((item: MenuItem, quantity: number = 1, note?: string) => {
    if (!item.is_available) {
      addToast('error', 'Taom tugagan', `"${item.name}" hozirda mavjud emas.`);
      return;
    }
    soundService.playTick();
    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (ci) => ci.menuItem.id === item.id && (ci.item_note || '') === (note || '')
      );
      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx].quantity += quantity;
        return copy;
      }
      return [...prev, { menuItem: item, quantity, item_note: note }];
    });
    addToast('success', "Savatga qo'shildi", `${item.name} (${quantity} dona)`);
  }, [addToast]);

  const updateCartQuantity = useCallback((itemId: string, quantity: number) => {
    soundService.playTick();
    setCart((prev) => {
      if (quantity <= 0) {
        return prev.filter((ci) => ci.menuItem.id !== itemId);
      }
      return prev.map((ci) => (ci.menuItem.id === itemId ? { ...ci, quantity } : ci));
    });
  }, []);

  const removeFromCart = useCallback((itemId: string) => {
    soundService.playTick();
    setCart((prev) => prev.filter((ci) => ci.menuItem.id !== itemId));
    addToast('info', 'O\'chirildi', 'Taom savatdan olib tashlandi');
  }, [addToast]);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const cartTotal = useMemo(() => {
    return cart.reduce((acc, it) => acc + it.menuItem.price * it.quantity, 0);
  }, [cart]);

  const cartItemCount = useMemo(() => {
    return cart.reduce((acc, it) => acc + it.quantity, 0);
  }, [cart]);

  // Order Placement
  const placeOrder = useCallback(async (customerNote?: string): Promise<Order> => {
    if (cart.length === 0) {
      throw new Error('Savatingiz bo\'sh');
    }
    try {
      const order = await dataService.createOrder({
        tableNumber: activeTableNumber,
        cartItems: cart,
        customerNote,
      });

      // Confetti burst
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#173F35', '#F59E0B', '#10B981'],
        });
      } catch {
        // Ignore
      }

      clearCart();
      addToast(
        'success',
        `Buyurtma qabul qilindi: ${order.order_number}`,
        'Oshxona tez orada tayyorlashni boshlaydi!'
      );
      await refreshData();
      return order;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Buyurtma yuborishda xatolik yuz berdi';
      addToast('error', 'Xatolik', msg);
      throw err;
    }
  }, [cart, activeTableNumber, clearCart, addToast, refreshData]);

  // Table Service Actions
  const callWaiter = useCallback(async (note?: string) => {
    try {
      await dataService.requestService(activeTableNumber, 'waiter', note);
      addToast(
        'success',
        'Ofitsiant chaqirildi',
        `Stol №${activeTableNumber} chaqiruvi zal xodimlariga uzatildi.`
      );
      await refreshData();
    } catch {
      addToast('error', 'Xatolik', 'Xizmat chaqirishda xatolik yuz berdi');
    }
  }, [activeTableNumber, addToast, refreshData]);

  const requestBill = useCallback(async () => {
    try {
      await dataService.requestService(activeTableNumber, 'bill');
      addToast(
        'success',
        'Hisob so\'raldi',
        `Stol №${activeTableNumber} hisobi ofitsiantga yuborildi.`
      );
      await refreshData();
    } catch {
      addToast('error', 'Xatolik', 'Hisob so\'rashda xatolik yuz berdi');
    }
  }, [activeTableNumber, addToast, refreshData]);

  const resolveServiceCall = useCallback(async (callId: string) => {
    await dataService.resolveServiceCall(callId);
    addToast('success', 'Bajarildi', 'Xizmat chaqiruvi ko\'rib chiqildi');
    await refreshData();
  }, [addToast, refreshData]);

  const updateOrderStatus = useCallback(async (orderId: string, status: Order['status']) => {
    await dataService.updateOrderStatus(orderId, status);
    addToast('info', 'Holat o\'zgardi', `Buyurtma yangilandi`);
    await refreshData();
  }, [addToast, refreshData]);

  const value = useMemo(
    () => ({
      userRole,
      currentUser,
      setUserRole,
      isDemoMode: dataService.getIsDemo(),
      activeTableNumber,
      setActiveTableNumber,
      cart,
      addToCart,
      updateCartQuantity,
      removeFromCart,
      clearCart,
      cartTotal,
      cartItemCount,
      categories,
      menuItems,
      tables,
      orders,
      serviceCalls,
      isLoading,
      soundEnabled,
      setSoundEnabled,
      refreshData,
      placeOrder,
      callWaiter,
      requestBill,
      resolveServiceCall,
      updateOrderStatus,
      toasts,
      addToast,
      removeToast,
    }),
    [
      userRole,
      currentUser,
      setUserRole,
      activeTableNumber,
      setActiveTableNumber,
      cart,
      addToCart,
      updateCartQuantity,
      removeFromCart,
      clearCart,
      cartTotal,
      cartItemCount,
      categories,
      menuItems,
      tables,
      orders,
      serviceCalls,
      isLoading,
      soundEnabled,
      setSoundEnabled,
      refreshData,
      placeOrder,
      callWaiter,
      requestBill,
      resolveServiceCall,
      updateOrderStatus,
      toasts,
      addToast,
      removeToast,
    ]
  );

  return (
    <AppContext.Provider value={value}>
      {children}
      {/* Toast Notification Container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-xl shadow-lg border flex items-start justify-between gap-3 transition-all transform duration-200 animate-in fade-in slide-in-from-top-2 ${
              toast.type === 'success'
                ? 'bg-white border-emerald-200 text-slate-800'
                : toast.type === 'error'
                ? 'bg-white border-red-200 text-red-900'
                : 'bg-white border-amber-200 text-slate-800'
            }`}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    toast.type === 'success'
                      ? 'bg-emerald-500'
                      : toast.type === 'error'
                      ? 'bg-red-500'
                      : 'bg-amber-500'
                  }`}
                />
                <h4 className="text-sm font-semibold">{toast.title}</h4>
              </div>
              {toast.message && <p className="text-xs text-slate-600 mt-1">{toast.message}</p>}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-700 text-xs p-1"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

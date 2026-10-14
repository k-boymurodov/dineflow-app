/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { MenuPage } from './pages/customer/MenuPage';
import { CartPage } from './pages/customer/CartPage';
import { OrderTrackPage } from './pages/customer/OrderTrackPage';
import { WaiterDashboard } from './pages/waiter/WaiterDashboard';
import { KitchenDisplayPage } from './pages/kitchen/KitchenDisplayPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { TableManagementPage } from './pages/admin/TableManagementPage';
import { MenuManagementPage } from './pages/admin/MenuManagementPage';
import { OrdersHistoryPage } from './pages/admin/OrdersHistoryPage';
import { ReportsPage } from './pages/admin/ReportsPage';
import { SettingsPage } from './pages/admin/SettingsPage';
import { LoginPage } from './pages/auth/LoginPage';
import { Utensils, UserCheck, ChefHat, LayoutDashboard, ChevronUp, ChevronDown } from 'lucide-react';

const DemoRoleBar: React.FC = () => {
  const { userRole, setUserRole, activeTableNumber } = useApp();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  // Do not show role bar when in fullscreen print or hidden
  return (
    <div className="fixed bottom-2 right-2 z-50 font-sans print:hidden">
      {collapsed ? (
        <button
          onClick={() => setCollapsed(false)}
          className="bg-[#173F35] text-white p-2 rounded-xl shadow-lg border border-emerald-700 hover:bg-[#235B4E] transition-all flex items-center gap-1 text-[11px] font-bold"
          title="Rolni o'zgartirish panelini ochish"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>DineFlow Rol</span>
          <ChevronUp className="w-3.5 h-3.5" />
        </button>
      ) : (
        <div className="bg-[#173F35]/95 backdrop-blur-md text-white p-2 rounded-2xl shadow-2xl border border-emerald-800 flex items-center gap-1.5 text-xs">
          <span className="text-[10px] font-bold text-amber-300 px-2 uppercase tracking-wider hidden sm:inline">
            Rol:
          </span>

          <Link
            to={`/menu?table=${activeTableNumber}`}
            onClick={() => setUserRole('customer')}
            className={`px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-1 transition-all ${
              location.pathname.startsWith('/menu') || location.pathname.startsWith('/cart') || location.pathname.startsWith('/orders')
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-white/80 hover:bg-white/10'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>Mijoz</span>
          </Link>

          <Link
            to="/waiter"
            onClick={() => setUserRole('waiter')}
            className={`px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-1 transition-all ${
              location.pathname.startsWith('/waiter')
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-white/80 hover:bg-white/10'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Ofitsiant</span>
          </Link>

          <Link
            to="/kitchen"
            onClick={() => setUserRole('kitchen')}
            className={`px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-1 transition-all ${
              location.pathname.startsWith('/kitchen')
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-white/80 hover:bg-white/10'
            }`}
          >
            <ChefHat className="w-3.5 h-3.5" />
            <span>KDS</span>
          </Link>

          <Link
            to="/admin"
            onClick={() => setUserRole('admin')}
            className={`px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-1 transition-all ${
              location.pathname.startsWith('/admin')
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-white/80 hover:bg-white/10'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Admin</span>
          </Link>

          <button
            onClick={() => setCollapsed(true)}
            className="p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10 ml-1"
            title="Yashirish"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          {/* Customer Routes */}
          <Route path="/" element={<Navigate to="/menu?table=12" replace />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/orders" element={<OrderTrackPage />} />

          {/* Waiter Terminal */}
          <Route path="/waiter" element={<WaiterDashboard />} />

          {/* Kitchen Display System */}
          <Route path="/kitchen" element={<KitchenDisplayPage />} />

          {/* Admin Suite */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/tables" element={<TableManagementPage />} />
          <Route path="/admin/menu" element={<MenuManagementPage />} />
          <Route path="/admin/orders" element={<OrdersHistoryPage />} />
          <Route path="/admin/reports" element={<ReportsPage />} />
          <Route path="/admin/settings" element={<SettingsPage />} />

          {/* Authentication */}
          <Route path="/login" element={<LoginPage />} />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/menu" replace />} />
        </Routes>

        {/* Global Role Switcher */}
        <DemoRoleBar />
      </AppProvider>
    </BrowserRouter>
  );
}

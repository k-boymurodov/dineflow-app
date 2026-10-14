import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  QrCode,
  MenuSquare,
  BarChart3,
  Settings,
  Store,
  Wifi,
  UtensilsCrossed,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AdminSidebar: React.FC = () => {
  const { orders } = useApp();
  const newOrdersCount = orders.filter((o) => o.status === 'new').length;

  return (
    <aside className="w-72 bg-white border-r border-[#E5E0D8] hidden lg:flex flex-col justify-between py-6 shrink-0 h-screen sticky top-0 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="flex flex-col gap-6">
        {/* Brand Header */}
        <div className="px-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#173F35] text-white flex items-center justify-center shadow-sm">
            <UtensilsCrossed className="w-5 h-5 text-amber-400" />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-xl text-[#173F35] tracking-tight leading-none">
              DineFlow
            </span>
            <span className="text-[11px] font-medium text-[#737A75] mt-1">
              Restoran boshqaruvi
            </span>
          </div>
        </div>

        {/* Branch Selector */}
        <div className="px-5">
          <div className="bg-[#FAF8F3] rounded-xl p-3 border border-[#E5E0D8] flex flex-col gap-1">
            <span className="text-[10px] uppercase font-bold text-[#737A75] tracking-wider">
              Filial tanlovi
            </span>
            <div className="flex items-center justify-between text-xs font-semibold text-[#202622]">
              <div className="flex items-center gap-2 truncate">
                <Store className="w-4 h-4 text-[#173F35] shrink-0" />
                <span className="truncate">Rayhon — Chilonzor</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1.5 px-4">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-[#173F35] text-white shadow-sm'
                  : 'text-[#414845] hover:bg-[#FAF8F3] hover:text-[#173F35]'
              }`
            }
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/admin/orders"
            className={({ isActive }) =>
              `flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-[#173F35] text-white shadow-sm'
                  : 'text-[#414845] hover:bg-[#FAF8F3] hover:text-[#173F35]'
              }`
            }
          >
            <div className="flex items-center gap-3">
              <Receipt className="w-4 h-4" />
              <span>Buyurtmalar oqimi</span>
            </div>
            {newOrdersCount > 0 && (
              <span className="bg-amber-500 text-slate-900 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                {newOrdersCount} yangi
              </span>
            )}
          </NavLink>

          <NavLink
            to="/admin/tables"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-[#173F35] text-white shadow-sm'
                  : 'text-[#414845] hover:bg-[#FAF8F3] hover:text-[#173F35]'
              }`
            }
          >
            <QrCode className="w-4 h-4" />
            <span>Stollar & QR Kodlar</span>
          </NavLink>

          <NavLink
            to="/admin/menu"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-[#173F35] text-white shadow-sm'
                  : 'text-[#414845] hover:bg-[#FAF8F3] hover:text-[#173F35]'
              }`
            }
          >
            <MenuSquare className="w-4 h-4" />
            <span>Raqamli Menyu</span>
          </NavLink>

          <NavLink
            to="/admin/reports"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-[#173F35] text-white shadow-sm'
                  : 'text-[#414845] hover:bg-[#FAF8F3] hover:text-[#173F35]'
              }`
            }
          >
            <BarChart3 className="w-4 h-4" />
            <span>Hisobotlar & Moliya</span>
          </NavLink>

          <NavLink
            to="/admin/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-[#173F35] text-white shadow-sm'
                  : 'text-[#414845] hover:bg-[#FAF8F3] hover:text-[#173F35]'
              }`
            }
          >
            <Settings className="w-4 h-4" />
            <span>Sozlamalar</span>
          </NavLink>
        </nav>
      </div>

      {/* System Status Footer */}
      <div className="px-5">
        <div className="bg-[#FAF8F3] rounded-xl p-3 border border-[#E5E0D8] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-[#202622]">Tizim holati</span>
              <span className="text-[11px] text-[#737A75]">Smena ochiq</span>
            </div>
          </div>
          <Wifi className="w-4 h-4 text-emerald-700" />
        </div>
      </div>
    </aside>
  );
};

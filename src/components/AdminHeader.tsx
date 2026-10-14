import React from 'react';
import { useApp } from '../context/AppContext';
import { Bell, Volume2, VolumeX, User, LayoutGrid, ChefHat, UserCheck, Utensils } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const AdminHeader: React.FC = () => {
  const { tables, orders, serviceCalls, soundEnabled, setSoundEnabled, currentUser, setUserRole } =
    useApp();
  const navigate = useNavigate();

  // Active occupied tables
  const busyTablesCount = new Set(
    orders
      .filter((o) => o.status !== 'delivered' && o.status !== 'cancelled')
      .map((o) => o.table_number)
  ).size;

  const pendingCallsCount = serviceCalls.filter((c) => c.status === 'pending').length;

  return (
    <header className="sticky top-0 z-40 h-16 bg-white/90 backdrop-blur-md border-b border-[#E5E0D8] px-6 flex items-center justify-between shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      {/* Left: Occupancy metrics & pending alerts */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-[#FAF8F3] px-3.5 py-1.5 rounded-xl border border-[#E5E0D8]">
          <span className="text-xs text-[#737A75] font-medium">Band stollar:</span>
          <span className="font-display font-bold text-sm text-[#173F35]">
            {busyTablesCount}/{tables.length}
          </span>
        </div>

        {pendingCallsCount > 0 ? (
          <Link
            to="/admin/tables"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold animate-pulse"
          >
            <Bell className="w-3.5 h-3.5 text-amber-600" />
            <span>{pendingCallsCount} ta kutayotgan chaqiruv</span>
          </Link>
        ) : (
          <span className="hidden sm:inline-block text-xs text-[#737A75]">
            Barcha xizmatlar barqaror
          </span>
        )}
      </div>

      {/* Right: Sound toggle, quick view switch, and profile */}
      <div className="flex items-center gap-3">
        {/* Quick View Navigation */}
        <div className="hidden md:flex items-center gap-1 bg-[#FAF8F3] p-1 rounded-xl border border-[#E5E0D8] text-xs">
          <Link
            to="/menu"
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[#737A75] hover:text-[#173F35] hover:bg-white transition-all font-medium"
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>Mijoz menyusi</span>
          </Link>
          <button
            onClick={() => {
              setUserRole('waiter');
              navigate('/waiter');
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[#737A75] hover:text-[#173F35] hover:bg-white transition-all font-medium"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Ofitsiant</span>
          </button>
          <button
            onClick={() => {
              setUserRole('kitchen');
              navigate('/kitchen');
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[#737A75] hover:text-[#173F35] hover:bg-white transition-all font-medium"
          >
            <ChefHat className="w-3.5 h-3.5" />
            <span>KDS Oshxona</span>
          </button>
        </div>

        {/* Sound toggle */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-2 rounded-xl text-[#737A75] hover:text-[#202622] hover:bg-[#FAF8F3] transition-colors border border-transparent hover:border-[#E5E0D8]"
          title={soundEnabled ? 'Ovozni o\'chirish' : 'Ovozni yoqish'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-700" /> : <VolumeX className="w-4 h-4" />}
        </button>

        <div className="h-6 w-px bg-[#E5E0D8]" />

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-1">
          <div className="hidden sm:flex flex-col items-end text-right">
            <span className="text-xs font-bold text-[#202622]">
              {currentUser?.full_name || 'Sardor Aliyev'}
            </span>
            <span className="text-[10px] text-[#737A75]">Bosh administrator</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-[#173F35] text-white flex items-center justify-center font-bold text-xs shadow-xs">
            <User className="w-4 h-4 text-amber-300" />
          </div>
        </div>
      </div>
    </header>
  );
};

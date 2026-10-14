import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatUZS, formatTimeAgo, formatShortTime, ORDER_STATUS_MAP } from '../../utils/formatters';
import { Order, OrderStatus } from '../../types';
import {
  Bell,
  CheckCircle2,
  Clock,
  Receipt,
  UtensilsCrossed,
  FileText,
  Volume2,
  VolumeX,
  X,
  Eye,
  Check,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const WaiterDashboard: React.FC = () => {
  const {
    orders,
    tables,
    serviceCalls,
    resolveServiceCall,
    updateOrderStatus,
    soundEnabled,
    setSoundEnabled,
    setUserRole,
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedTableFilter, setSelectedTableFilter] = useState<number | 'all'>('all');
  const [inspectOrder, setInspectOrder] = useState<Order | null>(null);

  // Filter orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchStatus = statusFilter === 'all' || o.status === statusFilter;
      const matchTable = selectedTableFilter === 'all' || o.table_number === selectedTableFilter;
      return matchStatus && matchTable;
    });
  }, [orders, statusFilter, selectedTableFilter]);

  // Pending service calls
  const pendingCalls = useMemo(() => {
    return serviceCalls.filter((c) => c.status === 'pending');
  }, [serviceCalls]);

  // Counts
  const newOrdersCount = orders.filter((o) => o.status === 'new').length;
  const readyOrdersCount = orders.filter((o) => o.status === 'ready').length;

  return (
    <div className="min-h-screen bg-[#FAF8F3] text-[#202622] flex flex-col">
      {/* Top Bar for Waiter Terminal */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E5E0D8] px-4 py-3 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#173F35] text-white flex items-center justify-center font-bold shadow-sm">
              <UtensilsCrossed className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-bold text-lg text-[#173F35] leading-none">
                  Ofitsiant TerminaIi
                </h1>
                <span className="text-[11px] font-semibold bg-emerald-100 text-[#173F35] px-2 py-0.5 rounded-full">
                  Zal smenasi
                </span>
              </div>
              <p className="text-xs text-[#737A75] mt-0.5">Rayhon Milliy — Chilonzor</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Sound toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-xl border border-[#E5E0D8] text-[#737A75] hover:text-[#202622] bg-[#FAF8F3] transition-colors"
              title={soundEnabled ? 'Ovozni o\'chirish' : 'Ovozni yoqish'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Quick role switcher to Admin / Kitchen / Customer */}
            <div className="flex items-center gap-1 bg-[#FAF8F3] p-1 rounded-xl border border-[#E5E0D8] text-xs">
              <button
                onClick={() => setUserRole('admin')}
                className="px-2.5 py-1 rounded-lg text-[#737A75] hover:text-[#202622]"
              >
                Admin
              </button>
              <button
                onClick={() => setUserRole('kitchen')}
                className="px-2.5 py-1 rounded-lg text-[#737A75] hover:text-[#202622]"
              >
                KDS Oshxona
              </button>
              <Link
                to="/menu"
                className="px-2.5 py-1 rounded-lg text-[#737A75] hover:text-[#202622]"
              >
                Mijoz menyusi
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 space-y-5">
        {/* Urgent Service Calls Strip */}
        {pendingCalls.length > 0 && (
          <div className="space-y-2">
            {pendingCalls.map((call) => (
              <div
                key={call.id}
                className="bg-amber-500 text-slate-950 p-3.5 rounded-2xl shadow-md flex items-center justify-between flex-wrap gap-3 animate-pulse"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-950 text-amber-400 flex items-center justify-center shrink-0">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-sm">
                      Stol №{call.table_number}: {call.type === 'bill' ? 'Hisob-kitob so\'radi' : 'Ofitsiantni chaqirdi!'}
                    </h3>
                    <p className="text-xs font-medium text-slate-900/80">
                      {call.note} • {formatTimeAgo(call.created_at)}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => resolveServiceCall(call.id)}
                  className="px-4 py-2 rounded-xl bg-slate-950 text-white font-display font-bold text-xs hover:bg-slate-900 transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Xizmat ko'rsatildi (Yopish)</span>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Stats Quick Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-[#E5E0D8] shadow-xs">
            <span className="text-xs text-[#737A75] font-medium block">Yangi buyurtmalar</span>
            <span className="font-display font-bold text-2xl text-red-600 mt-1 block">
              {newOrdersCount}
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#E5E0D8] shadow-xs">
            <span className="text-xs text-[#737A75] font-medium block">Zalga tayyor taomlar</span>
            <span className="font-display font-bold text-2xl text-emerald-700 mt-1 block">
              {readyOrdersCount}
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#E5E0D8] shadow-xs">
            <span className="text-xs text-[#737A75] font-medium block">Faol chaqiruvlar</span>
            <span className="font-display font-bold text-2xl text-amber-600 mt-1 block">
              {pendingCalls.length}
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#E5E0D8] shadow-xs">
            <span className="text-xs text-[#737A75] font-medium block">Jami stollar</span>
            <span className="font-display font-bold text-2xl text-[#173F35] mt-1 block">
              {tables.length}
            </span>
          </div>
        </div>

        {/* Filters Strip */}
        <div className="bg-white p-3 rounded-2xl border border-[#E5E0D8] shadow-xs flex flex-wrap items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: 'Barchasi' },
              { id: 'new', label: 'Yangi' },
              { id: 'preparing', label: 'Oshxonada' },
              { id: 'ready', label: 'Tayyor (Olib chiqish)' },
              { id: 'delivered', label: 'Yetkazilgan' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setStatusFilter(st.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  statusFilter === st.id
                    ? 'bg-[#173F35] text-white shadow-xs'
                    : 'text-[#737A75] hover:bg-[#FAF8F3] hover:text-[#202622]'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* Table Selector Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#737A75]">Stol:</span>
            <select
              value={selectedTableFilter}
              onChange={(e) =>
                setSelectedTableFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))
              }
              className="text-xs font-semibold p-1.5 rounded-xl bg-[#FAF8F3] border border-[#E5E0D8] focus:outline-none focus:border-[#173F35]"
            >
              <option value="all">Barcha stollar</option>
              {tables.map((t) => (
                <option key={t.id} value={t.table_number}>
                  Stol №{t.table_number} ({t.label || t.zone})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Orders Stream Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => {
              const statusCfg = ORDER_STATUS_MAP[order.status] || ORDER_STATUS_MAP.new;
              return (
                <div
                  key={order.id}
                  className={`bg-white rounded-2xl border p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
                    order.status === 'new'
                      ? 'border-red-300 ring-1 ring-red-200'
                      : order.status === 'ready'
                      ? 'border-emerald-300 ring-1 ring-emerald-200'
                      : 'border-[#E5E0D8]'
                  }`}
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 pb-3 border-b border-[#FAF8F3]">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-display font-bold text-base text-[#173F35]">
                            Stol №{order.table_number}
                          </span>
                          <span className="text-xs font-mono font-semibold text-[#737A75]">
                            {order.order_number}
                          </span>
                        </div>
                        <span className="text-[11px] text-[#737A75] flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          <span>{formatShortTime(order.created_at)} ({formatTimeAgo(order.created_at)})</span>
                        </span>
                      </div>

                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${statusCfg.badgeBg}`}>
                        {statusCfg.label}
                      </span>
                    </div>

                    {/* Dishes summary */}
                    <div className="py-3 space-y-1.5">
                      {order.items.map((item) => (
                        <div key={item.id} className="text-xs flex items-start justify-between gap-2">
                          <span className="text-[#202622]">
                            <strong className="text-[#173F35]">{item.quantity}x</strong> {item.item_name}
                          </span>
                          <span className="text-[#737A75] font-mono tabular-nums">
                            {formatUZS(item.line_total)}
                          </span>
                        </div>
                      ))}

                      {order.customer_note && (
                        <p className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg mt-2 italic">
                          "{order.customer_note}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions & Status Advancement */}
                  <div className="pt-3 border-t border-[#FAF8F3] flex items-center justify-between gap-2">
                    <button
                      onClick={() => setInspectOrder(order)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#202622] text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Chek</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      {order.status === 'new' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'preparing')}
                          className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 text-xs font-bold transition-all shadow-xs"
                        >
                          Qabul qilish
                        </button>
                      )}

                      {order.status === 'preparing' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'ready')}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs"
                        >
                          Tayyor deb belgilash
                        </button>
                      )}

                      {order.status === 'ready' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'delivered')}
                          className="px-3 py-1.5 rounded-xl bg-[#173F35] hover:bg-[#235B4E] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                          <span>Yetkazildi</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full bg-white rounded-2xl border border-[#E5E0D8] p-12 text-center text-[#737A75]">
              <Receipt className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-semibold text-[#202622]">Bu toifada buyurtmalar mavjud emas</p>
              <p className="text-xs text-[#737A75] mt-1">Mijozlar buyurtma berganda bu yerda avtomatik ko'rinadi.</p>
            </div>
          )}
        </div>
      </main>

      {/* Order Chit Full Modal */}
      {inspectOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E5E0D8] flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E0D8]">
              <div>
                <h3 className="font-display font-bold text-lg text-[#173F35]">
                  Chek: {inspectOrder.order_number}
                </h3>
                <span className="text-xs text-[#737A75]">
                  Stol №{inspectOrder.table_number} • {formatShortTime(inspectOrder.created_at)}
                </span>
              </div>
              <button
                onClick={() => setInspectOrder(null)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="my-4 overflow-y-auto space-y-3 flex-1">
              <div className="divide-y divide-[#FAF8F3]">
                {inspectOrder.items.map((it) => (
                  <div key={it.id} className="py-2.5 flex items-start justify-between gap-3 text-xs">
                    <div>
                      <span className="font-semibold text-[#202622]">
                        {it.quantity}x {it.item_name}
                      </span>
                      {it.item_note && (
                        <p className="text-[11px] text-amber-700 italic">"{it.item_note}"</p>
                      )}
                    </div>
                    <span className="font-mono font-bold text-[#173F35] tabular-nums">
                      {formatUZS(it.line_total)}
                    </span>
                  </div>
                ))}
              </div>

              {inspectOrder.customer_note && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
                  <span className="font-semibold block">Maxsus eslatma:</span>
                  <p className="italic">"{inspectOrder.customer_note}"</p>
                </div>
              )}

              <div className="p-3 bg-[#FAF8F3] rounded-xl flex items-center justify-between font-bold text-sm">
                <span>Jami hisob:</span>
                <span className="text-[#173F35] font-display text-base tabular-nums">
                  {formatUZS(inspectOrder.total_amount)}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E5E0D8] flex items-center justify-end gap-2">
              <button
                onClick={() => setInspectOrder(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-800"
              >
                Yopish
              </button>
              {inspectOrder.status !== 'delivered' && (
                <button
                  onClick={async () => {
                    await updateOrderStatus(inspectOrder.id, 'delivered');
                    setInspectOrder(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#173F35] text-white hover:bg-[#235B4E] text-xs font-bold"
                >
                  Yetkazildi deb belgilash
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

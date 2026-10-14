import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { CustomerHeader } from '../../components/CustomerHeader';
import { CustomerBottomNav } from '../../components/CustomerBottomNav';
import { formatUZS, formatTimeAgo, formatShortTime, ORDER_STATUS_MAP } from '../../utils/formatters';
import { OrderStatus } from '../../types';
import {
  Clock,
  CheckCircle2,
  Bell,
  FileText,
  AlertCircle,
  Receipt,
  Utensils,
  ChevronRight,
} from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const STATUS_STEPS: { key: OrderStatus; label: string; desc: string }[] = [
  { key: 'new', label: 'Qabul qilindi', desc: 'Oshxonaga uzatildi' },
  { key: 'preparing', label: 'Tayyorlanmoqda', desc: 'Oshpazlar qovurmoqda' },
  { key: 'ready', label: 'Tayyor', desc: 'Zalga chiqmoqda' },
  { key: 'delivered', label: 'Yetkazildi', desc: 'Yoqimli ishtaha!' },
];

export const OrderTrackPage: React.FC = () => {
  const { orders, activeTableNumber, callWaiter, requestBill } = useApp();
  const [searchParams] = useSearchParams();
  const urlOrderId = searchParams.get('orderId');
  const navigate = useNavigate();

  // Find all orders for this table
  const tableOrders = useMemo(() => {
    return orders.filter((o) => o.table_number === activeTableNumber);
  }, [orders, activeTableNumber]);

  // Selected order or latest active order
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(urlOrderId);

  useEffect(() => {
    if (urlOrderId) {
      setSelectedOrderId(urlOrderId);
    } else if (tableOrders.length > 0) {
      // Pick first active or most recent
      setSelectedOrderId(tableOrders[0].id);
    }
  }, [urlOrderId, tableOrders]);

  const activeOrder = useMemo(() => {
    if (!selectedOrderId) return tableOrders[0] || null;
    return tableOrders.find((o) => o.id === selectedOrderId) || tableOrders[0] || null;
  }, [selectedOrderId, tableOrders]);

  const getStepState = (stepKey: OrderStatus, currentStatus: OrderStatus) => {
    const orderRanks: Record<OrderStatus, number> = {
      new: 1,
      preparing: 2,
      ready: 3,
      delivered: 4,
      cancelled: 0,
    };
    const stepRank = orderRanks[stepKey];
    const currentRank = orderRanks[currentStatus];

    if (currentStatus === 'cancelled') return 'cancelled';
    if (currentRank > stepRank) return 'completed';
    if (currentRank === stepRank) return 'current';
    return 'pending';
  };

  return (
    <div className="min-h-screen bg-[#FAF8F3] pb-24 md:pb-12 flex flex-col">
      <CustomerHeader />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 pt-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="font-display font-bold text-2xl text-[#202622]">Buyurtmalar holati</h1>
            <p className="text-xs text-[#737A75]">Real vaqtda stol buyurtmasi kuzatuvi</p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#173F35] text-white">
            Stol №{activeTableNumber}
          </span>
        </div>

        {activeOrder ? (
          <div className="flex flex-col gap-4">
            {/* Main Order Status Tracker Card */}
            <div className="bg-white rounded-3xl border border-[#E5E0D8] p-5 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-[#E5E0D8]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-lg text-[#173F35]">
                      {activeOrder.order_number}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        ORDER_STATUS_MAP[activeOrder.status]?.badgeBg || 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      {ORDER_STATUS_MAP[activeOrder.status]?.label || activeOrder.status}
                    </span>
                  </div>
                  <span className="text-xs text-[#737A75] flex items-center gap-1 mt-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Vaqti: {formatShortTime(activeOrder.created_at)} ({formatTimeAgo(activeOrder.created_at)})</span>
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-xs text-[#737A75] block">Jami summa:</span>
                  <span className="font-display font-bold text-lg text-[#173F35] tabular-nums">
                    {formatUZS(activeOrder.total_amount)}
                  </span>
                </div>
              </div>

              {/* Status Stepper */}
              {activeOrder.status === 'cancelled' ? (
                <div className="py-6 text-center text-red-600 flex flex-col items-center">
                  <AlertCircle className="w-10 h-10 mb-2" />
                  <h4 className="font-bold text-base">Ushbu buyurtma bekor qilingan</h4>
                  <p className="text-xs text-[#737A75] mt-1">
                    Batafsil ma'lumot uchun ofitsiantga murojaat qiling.
                  </p>
                </div>
              ) : (
                <div className="py-6">
                  <div className="relative flex items-center justify-between">
                    {/* Background Connecting Line */}
                    <div className="absolute left-6 right-6 top-4 h-1 bg-[#E5E0D8] -z-0" />
                    
                    {STATUS_STEPS.map((st, idx) => {
                      const state = getStepState(st.key, activeOrder.status);
                      return (
                        <div key={st.key} className="flex flex-col items-center text-center z-10 w-1/4">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                              state === 'completed'
                                ? 'bg-[#173F35] text-white ring-4 ring-emerald-100'
                                : state === 'current'
                                ? 'bg-amber-500 text-slate-900 ring-4 ring-amber-100 animate-pulse'
                                : 'bg-white border-2 border-[#E5E0D8] text-[#737A75]'
                            }`}
                          >
                            {state === 'completed' ? (
                              <CheckCircle2 className="w-5 h-5 text-white" />
                            ) : (
                              <span>{idx + 1}</span>
                            )}
                          </div>
                          <span
                            className={`text-xs font-semibold mt-2 ${
                              state === 'current'
                                ? 'text-amber-600'
                                : state === 'completed'
                                ? 'text-[#173F35]'
                                : 'text-[#737A75]'
                            }`}
                          >
                            {st.label}
                          </span>
                          <span className="text-[10px] text-[#737A75] hidden sm:block">
                            {st.desc}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Waiter & Quick Action Buttons */}
              <div className="pt-4 border-t border-[#E5E0D8] flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-[#737A75]">
                  <span>Mas'ul ofitsiant: </span>
                  <span className="font-semibold text-[#202622]">
                    {activeOrder.waiter_name || "Zal xodimi"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => callWaiter("Stol №" + activeTableNumber + " ofitsiantni kutmoqda")}
                    className="px-3 py-1.5 rounded-xl bg-amber-100 text-amber-900 hover:bg-amber-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Bell className="w-3.5 h-3.5" />
                    <span>Ofitsiantni chaqirish</span>
                  </button>
                  <button
                    onClick={requestBill}
                    className="px-3 py-1.5 rounded-xl bg-[#173F35] text-white hover:bg-[#235B4E] text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Hisob so'rash</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Order Items Breakdown Chit */}
            <div className="bg-white rounded-3xl border border-[#E5E0D8] p-5 shadow-sm">
              <h3 className="font-display font-bold text-base text-[#202622] mb-3 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-[#173F35]" />
                <span>Buyurtma tarkibi ({activeOrder.items.length} xil taom)</span>
              </h3>

              <div className="divide-y divide-[#FAF8F3]">
                {activeOrder.items.map((item) => (
                  <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-[#FAF8F3] text-[#173F35] font-bold flex items-center justify-center text-[11px]">
                        {item.quantity}x
                      </span>
                      <div>
                        <span className="font-semibold text-[#202622] block">{item.item_name}</span>
                        {item.item_note && (
                          <span className="text-[11px] text-amber-700 italic">
                            "{item.item_note}"
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="font-bold text-[#173F35] tabular-nums">
                      {formatUZS(item.line_total)}
                    </span>
                  </div>
                ))}
              </div>

              {activeOrder.customer_note && (
                <div className="mt-4 p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900">
                  <span className="font-semibold block mb-0.5">Mijoz istagi:</span>
                  <p className="italic">"{activeOrder.customer_note}"</p>
                </div>
              )}
            </div>

            {/* Multiple orders switcher if table had prior orders */}
            {tableOrders.length > 1 && (
              <div className="bg-white rounded-2xl border border-[#E5E0D8] p-4 shadow-sm">
                <h4 className="font-display font-semibold text-xs text-[#737A75] mb-2 uppercase tracking-wider">
                  Ushbu stoldagi boshqa buyurtmalar:
                </h4>
                <div className="space-y-2">
                  {tableOrders.map((ord) => (
                    <button
                      key={ord.id}
                      onClick={() => setSelectedOrderId(ord.id)}
                      className={`w-full p-2.5 rounded-xl text-xs flex items-center justify-between border transition-all ${
                        ord.id === activeOrder.id
                          ? 'bg-[#E8F0EC] border-[#173F35] font-semibold text-[#173F35]'
                          : 'bg-[#FAF8F3] border-transparent hover:border-[#E5E0D8] text-[#202622]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{ord.order_number}</span>
                        <span className="text-[10px] text-[#737A75]">
                          {formatShortTime(ord.created_at)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="tabular-nums font-bold">{formatUZS(ord.total_amount)}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-[#737A75]" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-[#E5E0D8] p-10 text-center shadow-sm my-8">
            <div className="w-16 h-16 rounded-2xl bg-[#E8F0EC] text-[#173F35] flex items-center justify-center mx-auto mb-4">
              <Utensils className="w-8 h-8" />
            </div>
            <h2 className="font-display font-bold text-xl text-[#202622] mb-1">
              Faol buyurtma topilmadi
            </h2>
            <p className="text-xs text-[#737A75] max-w-xs mx-auto mb-6 leading-relaxed">
              Stol №{activeTableNumber} uchun hozircha hech qanday buyurtma berilmagan.
            </p>
            <button
              onClick={() => navigate('/menu')}
              className="py-3 px-6 rounded-xl bg-[#173F35] text-white text-xs font-bold hover:bg-[#235B4E] transition-all shadow-sm"
            >
              Menyuni ko'rish
            </button>
          </div>
        )}
      </main>

      <CustomerBottomNav />
    </div>
  );
};

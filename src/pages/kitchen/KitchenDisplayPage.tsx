import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Order, OrderStatus } from '../../types';
import { formatShortTime } from '../../utils/formatters';
import {
  Flame,
  ChefHat,
  Volume2,
  VolumeX,
  Maximize2,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const KitchenDisplayPage: React.FC = () => {
  const { orders, updateOrderStatus, soundEnabled, setSoundEnabled, setUserRole } = useApp();
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({});
  const [, setTicker] = useState<number>(0);

  // Tick elapsed time counter every 10 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setTicker((t) => t + 1);
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const toggleItemCheck = (itemId: string) => {
    setCompletedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const getMinutesAgo = (isoDate: string) => {
    const diff = Date.now() - new Date(isoDate).getTime();
    return Math.max(0, Math.floor(diff / 60000));
  };

  // Group orders into 3 columns
  const newOrders = useMemo(
    () => orders.filter((o) => o.status === 'new').sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
    [orders]
  );

  const preparingOrders = useMemo(
    () => orders.filter((o) => o.status === 'preparing').sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
    [orders]
  );

  const readyOrders = useMemo(
    () => orders.filter((o) => o.status === 'ready').sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()),
    [orders]
  );

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div className="min-h-screen bg-[#111827] text-white flex flex-col font-sans select-none">
      {/* Top KDS Header */}
      <header className="h-16 px-6 bg-[#1F2937] border-b border-gray-700 flex items-center justify-between shrink-0 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg leading-none tracking-tight">
              DineFlow KDS — Oshxona Ekrani
            </h1>
            <span className="text-xs text-gray-400 mt-0.5 block">
              Real vaqt rejimidagi taomlar buyurtma oqimi
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-4 text-xs font-semibold">
            <span className="text-red-400 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <span>Yangi: {newOrders.length}</span>
            </span>
            <span className="text-amber-400 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Oshxonada: {preparingOrders.length}</span>
            </span>
            <span className="text-emerald-400 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Tayyor: {readyOrders.length}</span>
            </span>
          </div>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2.5 rounded-xl border border-gray-600 transition-colors ${
              soundEnabled ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500' : 'bg-gray-800 text-gray-400'
            }`}
            title={soundEnabled ? "Ovoz yoqilgan" : "Ovoz o'chirilgan"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2.5 rounded-xl bg-gray-800 border border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
            title="To'liq ekranga o'tish"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          <div className="h-6 w-px bg-gray-700" />

          {/* Quick link back to admin */}
          <button
            onClick={() => setUserRole('admin')}
            className="text-xs text-gray-300 hover:text-white bg-gray-800 px-3 py-1.5 rounded-xl border border-gray-700"
          >
            Admin Panel
          </button>
          <Link
            to="/menu"
            className="text-xs text-amber-400 hover:underline"
          >
            Menyuga
          </Link>
        </div>
      </header>

      {/* 3-Column Touchscreen Grid */}
      <main className="flex-1 p-4 grid grid-cols-1 md:grid-cols-3 gap-4 overflow-hidden">
        {/* COLUMN 1: YANGI (NEW) */}
        <div className="flex flex-col bg-[#1F2937]/70 rounded-2xl border border-red-950/60 p-3 h-full overflow-hidden">
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-gray-700/80 px-1">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500 ring-4 ring-red-500/20 animate-ping" />
              <h2 className="font-display font-bold text-base text-red-400 uppercase tracking-wider">
                Yangi Buyurtmalar
              </h2>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 font-bold text-xs">
              {newOrders.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {newOrders.map((order) => {
              const minutes = getMinutesAgo(order.created_at);
              const isUrgent = minutes >= 10;
              return (
                <div
                  key={order.id}
                  className={`bg-[#111827] rounded-xl border p-4 shadow-lg flex flex-col justify-between ${
                    isUrgent ? 'border-red-500 ring-2 ring-red-500/30' : 'border-red-900/60'
                  }`}
                >
                  <div>
                    {/* Ticket Header */}
                    <div className="flex items-start justify-between pb-2.5 border-b border-gray-800">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-display font-black text-xl text-amber-400">
                            Stol №{order.table_number}
                          </span>
                          <span className="font-mono text-xs text-gray-400">
                            {order.order_number}
                          </span>
                        </div>
                        <span className="text-[11px] text-gray-400 mt-0.5 block">
                          Vaqt: {formatShortTime(order.created_at)}
                        </span>
                      </div>

                      <div
                        className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 ${
                          isUrgent ? 'bg-red-600 text-white animate-bounce' : 'bg-red-950/80 text-red-300'
                        }`}
                      >
                        {isUrgent && <AlertTriangle className="w-3 h-3" />}
                        <span>{minutes} daqiqa</span>
                      </div>
                    </div>

                    {/* Dish Checklist */}
                    <div className="py-3 space-y-2">
                      {order.items.map((it) => {
                        const checked = !!completedItems[it.id];
                        return (
                          <div
                            key={it.id}
                            onClick={() => toggleItemCheck(it.id)}
                            className={`p-2 rounded-lg cursor-pointer transition-colors flex items-start gap-2.5 ${
                              checked ? 'bg-gray-800/40 opacity-50 line-through' : 'bg-gray-800/80 hover:bg-gray-800'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              readOnly
                              className="mt-0.5 rounded accent-amber-500 cursor-pointer"
                            />
                            <div className="flex-1">
                              <span className="text-sm font-bold text-white block">
                                <span className="text-amber-400 mr-1.5">{it.quantity}x</span>
                                {it.item_name}
                              </span>
                              {it.item_note && (
                                <p className="text-xs text-amber-300 italic mt-0.5 font-medium">
                                  "{it.item_note}"
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      {order.customer_note && (
                        <div className="p-2 rounded-lg bg-amber-950/40 border border-amber-900/60 text-xs text-amber-300 italic">
                          <span>Mijoz izohi: "{order.customer_note}"</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Advance to Preparing */}
                  <button
                    onClick={() => updateOrderStatus(order.id, 'preparing')}
                    className="w-full mt-2 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-display font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-md"
                  >
                    <Flame className="w-4 h-4" />
                    <span>Tayyorlashni boshlash</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              );
            })}

            {newOrders.length === 0 && (
              <div className="h-48 flex flex-col items-center justify-center text-gray-500 text-xs">
                <ChefHat className="w-8 h-8 mb-2 opacity-30" />
                <span>Yangi buyurtmalar yo'q</span>
              </div>
            )}
          </div>
        </div>

        {/* COLUMN 2: TAYYORLANMOQDA (PREPARING) */}
        <div className="flex flex-col bg-[#1F2937]/70 rounded-2xl border border-amber-950/60 p-3 h-full overflow-hidden">
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-gray-700/80 px-1">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              <h2 className="font-display font-bold text-base text-amber-400 uppercase tracking-wider">
                Tayyorlanmoqda
              </h2>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs">
              {preparingOrders.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {preparingOrders.map((order) => {
              const minutes = getMinutesAgo(order.created_at);
              const isOverdue = minutes >= 20;
              return (
                <div
                  key={order.id}
                  className={`bg-[#111827] rounded-xl border p-4 shadow-lg flex flex-col justify-between ${
                    isOverdue ? 'border-amber-400 ring-2 ring-amber-400/30' : 'border-amber-900/60'
                  }`}
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between pb-2.5 border-b border-gray-800">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-display font-black text-xl text-amber-400">
                            Stol №{order.table_number}
                          </span>
                          <span className="font-mono text-xs text-gray-400">
                            {order.order_number}
                          </span>
                        </div>
                        <span className="text-[11px] text-gray-400 mt-0.5 block">
                          Oshxonaga berildi: {formatShortTime(order.updated_at)}
                        </span>
                      </div>

                      <div
                        className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 ${
                          isOverdue ? 'bg-amber-600 text-slate-950 animate-pulse' : 'bg-amber-950/80 text-amber-300'
                        }`}
                      >
                        <Flame className="w-3 h-3" />
                        <span>{minutes} daq kutmoqda</span>
                      </div>
                    </div>

                    {/* Dish Checklist */}
                    <div className="py-3 space-y-2">
                      {order.items.map((it) => {
                        const checked = !!completedItems[it.id];
                        return (
                          <div
                            key={it.id}
                            onClick={() => toggleItemCheck(it.id)}
                            className={`p-2 rounded-lg cursor-pointer transition-colors flex items-start gap-2.5 ${
                              checked ? 'bg-gray-800/40 opacity-50 line-through' : 'bg-gray-800/80 hover:bg-gray-800'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              readOnly
                              className="mt-0.5 rounded accent-emerald-500 cursor-pointer"
                            />
                            <div className="flex-1">
                              <span className="text-sm font-bold text-white block">
                                <span className="text-amber-400 mr-1.5">{it.quantity}x</span>
                                {it.item_name}
                              </span>
                              {it.item_note && (
                                <p className="text-xs text-amber-300 italic mt-0.5 font-medium">
                                  "{it.item_note}"
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Mark as Ready Button */}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateOrderStatus(order.id, 'new')}
                      className="p-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-400"
                      title="Qayta yangiga o'tkazish"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => updateOrderStatus(order.id, 'ready')}
                      className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-display font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-md"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Tayyor (Zalga chaqirish)</span>
                    </button>
                  </div>
                </div>
              );
            })}

            {preparingOrders.length === 0 && (
              <div className="h-48 flex flex-col items-center justify-center text-gray-500 text-xs">
                <span>Hozirda pishirilayotgan taom yo'q</span>
              </div>
            )}
          </div>
        </div>

        {/* COLUMN 3: TAYYOR (READY) */}
        <div className="flex flex-col bg-[#1F2937]/70 rounded-2xl border border-emerald-950/60 p-3 h-full overflow-hidden">
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-gray-700/80 px-1">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <h2 className="font-display font-bold text-base text-emerald-400 uppercase tracking-wider">
                Tayyor (Olib ketish)
              </h2>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs">
              {readyOrders.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {readyOrders.map((order) => {
              return (
                <div
                  key={order.id}
                  className="bg-[#111827] rounded-xl border border-emerald-900/60 p-4 shadow-lg flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between pb-2.5 border-b border-gray-800">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-display font-black text-xl text-emerald-400">
                            Stol №{order.table_number}
                          </span>
                          <span className="font-mono text-xs text-gray-400">
                            {order.order_number}
                          </span>
                        </div>
                        <span className="text-[11px] text-gray-400 mt-0.5 block">
                          Tayyor bo'ldi: {formatShortTime(order.updated_at)}
                        </span>
                      </div>

                      <span className="px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 text-xs font-bold">
                        Ofitsiant kutmoqda
                      </span>
                    </div>

                    <div className="py-3 space-y-1">
                      {order.items.map((it) => (
                        <div key={it.id} className="text-xs text-gray-300">
                          <strong className="text-white">{it.quantity}x</strong> {it.item_name}
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => updateOrderStatus(order.id, 'delivered')}
                    className="w-full mt-2 py-3 px-4 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 font-display font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-gray-700"
                  >
                    <span>Stolga yetkazildi deb yopish</span>
                  </button>
                </div>
              );
            })}

            {readyOrders.length === 0 && (
              <div className="h-48 flex flex-col items-center justify-center text-gray-500 text-xs">
                <span>Tayyor taomlar tarqatilgan</span>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

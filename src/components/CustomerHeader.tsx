import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Bell, ShoppingBag, UtensilsCrossed, ChevronDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const CustomerHeader: React.FC = () => {
  const { activeTableNumber, setActiveTableNumber, tables, callWaiter, cartItemCount } = useApp();
  const [showTableSelect, setShowTableSelect] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const navigate = useNavigate();

  const handleCallWaiter = async () => {
    setIsCalling(true);
    await callWaiter();
    setTimeout(() => setIsCalling(false), 2000);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#FAF8F3]/90 backdrop-blur-md border-b border-[#E5E0D8] px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          {/* Brand Wordmark */}
          <Link to={`/menu?table=${activeTableNumber}`} className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-[#173F35] text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <UtensilsCrossed className="w-5 h-5 text-amber-400" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-lg text-[#173F35] leading-none tracking-tight">
                DineFlow
              </span>
              <span className="text-[11px] font-medium text-[#737A75] mt-0.5">
                Rayhon Chilonzor
              </span>
            </div>
          </Link>

          {/* Table Selector & Actions */}
          <div className="flex items-center gap-2">
            {/* Table Badge & Selector Button */}
            <button
              onClick={() => setShowTableSelect(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#173F35] text-white text-xs font-semibold shadow-sm hover:bg-[#235B4E] transition-colors"
              title="Stolni o'zgartirish"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Stol №{activeTableNumber}</span>
              <ChevronDown className="w-3.5 h-3.5 text-white/70" />
            </button>

            {/* Call Waiter Quick Action */}
            <button
              onClick={handleCallWaiter}
              disabled={isCalling}
              className={`p-2 rounded-full transition-all flex items-center justify-center ${
                isCalling
                  ? 'bg-amber-500 text-white animate-spin'
                  : 'bg-amber-100 text-amber-900 hover:bg-amber-200 active:scale-95'
              }`}
              title="Ofitsiantni chaqirish"
              aria-label="Ofitsiantni chaqirish"
            >
              <Bell className="w-4 h-4" />
            </button>

            {/* Cart Button */}
            <button
              onClick={() => navigate('/cart')}
              className="relative p-2 rounded-full bg-white border border-[#E5E0D8] text-[#173F35] hover:bg-[#FAF8F3] active:scale-95 transition-all shadow-sm"
              title="Savatni ko'rish"
              aria-label="Savat"
            >
              <ShoppingBag className="w-4 h-4" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow">
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Table Change Modal */}
      {showTableSelect && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-xl border border-[#E5E0D8]">
            <h3 className="font-display font-bold text-lg text-[#173F35] mb-1">
              Stol raqamini tanlang
            </h3>
            <p className="text-xs text-[#737A75] mb-4">
              QR kod orqali skanerlangan bo'lsa avtomatik biriktiriladi. Kerak bo'lsa qo'lda o'zgartiring:
            </p>
            <div className="grid grid-cols-4 gap-2 max-h-60 overflow-y-auto p-1 mb-4">
              {tables.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setActiveTableNumber(t.table_number);
                    setShowTableSelect(false);
                  }}
                  className={`py-2 px-1 rounded-xl text-xs font-semibold flex flex-col items-center justify-center border transition-all ${
                    t.table_number === activeTableNumber
                      ? 'bg-[#173F35] text-white border-[#173F35] shadow-sm'
                      : 'bg-[#FAF8F3] text-[#202622] border-[#E5E0D8] hover:border-[#173F35]'
                  }`}
                >
                  <span className="text-[10px] opacity-70">№</span>
                  <span className="text-sm font-bold">{t.table_number}</span>
                </button>
              ))}
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setShowTableSelect(false)}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

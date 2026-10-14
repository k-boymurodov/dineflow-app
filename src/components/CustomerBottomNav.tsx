import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Utensils, ShoppingBag, Receipt, HelpCircle, Bell, FileText, Coffee } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const CustomerBottomNav: React.FC = () => {
  const { cartItemCount, activeTableNumber, callWaiter, requestBill } = useApp();
  const [showHelpModal, setShowHelpModal] = useState(false);

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E5E0D8] shadow-[0_-4px_16px_rgba(32,38,34,0.06)] md:hidden">
        <div className="flex items-center justify-around h-16 max-w-md mx-auto px-2">
          <NavLink
            to={`/menu?table=${activeTableNumber}`}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center min-w-[56px] py-1 text-xs transition-colors ${
                isActive ? 'text-[#173F35] font-semibold' : 'text-[#737A75] hover:text-[#202622]'
              }`
            }
          >
            <Utensils className="w-5 h-5 mb-0.5" />
            <span>Menyu</span>
          </NavLink>

          <NavLink
            to="/cart"
            className={({ isActive }) =>
              `relative flex flex-col items-center justify-center min-w-[56px] py-1 text-xs transition-colors ${
                isActive ? 'text-[#173F35] font-semibold' : 'text-[#737A75] hover:text-[#202622]'
              }`
            }
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5 mb-0.5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-amber-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow">
                  {cartItemCount}
                </span>
              )}
            </div>
            <span>Savat</span>
          </NavLink>

          <NavLink
            to="/orders"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center min-w-[56px] py-1 text-xs transition-colors ${
                isActive ? 'text-[#173F35] font-semibold' : 'text-[#737A75] hover:text-[#202622]'
              }`
            }
          >
            <Receipt className="w-5 h-5 mb-0.5" />
            <span>Buyurtmalar</span>
          </NavLink>

          <button
            onClick={() => setShowHelpModal(true)}
            className="flex flex-col items-center justify-center min-w-[56px] py-1 text-xs text-[#737A75] hover:text-[#202622] transition-colors"
          >
            <HelpCircle className="w-5 h-5 mb-0.5" />
            <span>Xizmat</span>
          </button>
        </div>
      </nav>

      {/* Quick Service Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-[#E5E0D8]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E0D8]">
              <div>
                <h3 className="font-display font-bold text-base text-[#173F35]">
                  Stol №{activeTableNumber} Xizmatlari
                </h3>
                <p className="text-xs text-[#737A75]">Ofitsiantga tezkor chaqiruv yo'llash</p>
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                className="text-slate-400 hover:text-slate-700 text-lg p-1"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-2.5 my-4">
              <button
                onClick={async () => {
                  await callWaiter("Ofitsiant kerak");
                  setShowHelpModal(false);
                }}
                className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition-colors text-left"
              >
                <div className="w-9 h-9 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold">Ofitsiantni chaqirish</h4>
                  <p className="text-[11px] text-amber-700">Yordam yoki maslahat olish uchun</p>
                </div>
              </button>

              <button
                onClick={async () => {
                  await callWaiter("Choy yoki suv to'ldirish");
                  setShowHelpModal(false);
                }}
                className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 transition-colors text-left"
              >
                <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Coffee className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold">Choy / Suv so'rash</h4>
                  <p className="text-[11px] text-emerald-700">Choynakni yangilash yoki to'ldirish</p>
                </div>
              </button>

              <button
                onClick={async () => {
                  await requestBill();
                  setShowHelpModal(false);
                }}
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 transition-colors text-left"
              >
                <div className="w-9 h-9 rounded-lg bg-[#173F35] text-white flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold">Hisob-kitobni so'rash</h4>
                  <p className="text-[11px] text-slate-600">Chekni olib kelish (Click, Payme yoki naqd)</p>
                </div>
              </button>
            </div>

            <button
              onClick={() => setShowHelpModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
            >
              Yopish
            </button>
          </div>
        </div>
      )}
    </>
  );
};

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CustomerHeader } from '../../components/CustomerHeader';
import { CustomerBottomNav } from '../../components/CustomerBottomNav';
import { formatUZS } from '../../utils/formatters';
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag, Utensils, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CartPage: React.FC = () => {
  const {
    cart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    cartTotal,
    activeTableNumber,
    placeOrder,
  } = useApp();

  const [customerNote, setCustomerNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmitOrder = async () => {
    if (cart.length === 0 || isSubmitting) return;

    if (!activeTableNumber || activeTableNumber <= 0) {
      setErrorMessage("Iltimos, avval to'g'ri stol raqamini tanlang.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const order = await placeOrder(customerNote.trim());
      // Navigate to order tracking page
      navigate(`/orders?orderId=${order.id}`);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : "Buyurtma yuborishda kutilmagan xatolik yuz berdi"
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F3] pb-24 md:pb-12 flex flex-col">
      <CustomerHeader />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 pt-4">
        {/* Back Link & Title */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#173F35] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Menyuga qaytish</span>
          </button>

          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs font-medium text-red-600 hover:text-red-700 flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Savatni tozalash</span>
            </button>
          )}
        </div>

        <div className="flex items-center justify-between mb-4">
          <h1 className="font-display font-bold text-2xl text-[#202622]">Savatingiz</h1>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#173F35] text-white">
            Stol №{activeTableNumber}
          </span>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {cart.length > 0 ? (
          <div className="flex flex-col gap-4">
            {/* Cart Items List */}
            <div className="bg-white rounded-2xl border border-[#E5E0D8] p-4 shadow-sm divide-y divide-[#FAF8F3]">
              {cart.map((item) => {
                const lineTotal = item.menuItem.price * item.quantity;
                return (
                  <div key={item.menuItem.id} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                    {/* Item details */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#FAF8F3] shrink-0 border border-[#E5E0D8]">
                        {item.menuItem.image_url ? (
                          <img
                            src={item.menuItem.image_url}
                            alt={item.menuItem.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#173F35]">
                            <Utensils className="w-5 h-5" />
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col min-w-0">
                        <h4 className="font-display font-bold text-sm text-[#202622] truncate">
                          {item.menuItem.name}
                        </h4>
                        <span className="text-xs text-[#737A75] tabular-nums">
                          {formatUZS(item.menuItem.price)} dona
                        </span>
                        {item.item_note && (
                          <span className="text-[11px] text-amber-700 italic mt-0.5 truncate">
                            "{item.item_note}"
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quantity Stepper & Removal */}
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex items-center gap-1.5 bg-[#FAF8F3] border border-[#E5E0D8] rounded-xl p-1">
                        <button
                          onClick={() => updateCartQuantity(item.menuItem.id, item.quantity - 1)}
                          className="w-7 h-7 rounded-lg bg-white text-[#173F35] shadow-xs flex items-center justify-center hover:bg-slate-50 transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-6 text-center text-xs font-bold font-display tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.menuItem.id, item.quantity + 1)}
                          className="w-7 h-7 rounded-lg bg-[#173F35] text-white shadow-xs flex items-center justify-center hover:bg-[#235B4E] transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-right min-w-[75px]">
                        <span className="font-display font-bold text-sm text-[#173F35] block tabular-nums">
                          {formatUZS(lineTotal)}
                        </span>
                        <button
                          onClick={() => removeFromCart(item.menuItem.id)}
                          className="text-[11px] text-[#737A75] hover:text-red-600 transition-colors"
                        >
                          O'chirish
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Optional Customer Note for Kitchen */}
            <div className="bg-white rounded-2xl border border-[#E5E0D8] p-4 shadow-sm">
              <label className="block text-xs font-semibold text-[#202622] mb-1.5">
                Oshxona yoki ofitsiant uchun umumiy izoh:
              </label>
              <textarea
                value={customerNote}
                onChange={(e) => setCustomerNote(e.target.value)}
                placeholder="Masalan: Barcha taomlar bir vaqtda tortilsin, qo'shimcha non..."
                rows={2}
                maxLength={160}
                className="w-full text-xs p-3 rounded-xl bg-[#FAF8F3] border border-[#E5E0D8] focus:outline-none focus:border-[#173F35] focus:ring-1 focus:ring-[#173F35] resize-none"
              />
            </div>

            {/* Price Summary Breakdown */}
            <div className="bg-white rounded-2xl border border-[#E5E0D8] p-4 shadow-sm space-y-2.5">
              <div className="flex items-center justify-between text-xs text-[#737A75]">
                <span>Taomlar qiymati:</span>
                <span className="font-medium text-[#202622] tabular-nums">{formatUZS(cartTotal)}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-[#737A75]">
                <span>Xizmat ko'rsatish (0%):</span>
                <span className="font-medium text-emerald-600">Tekin</span>
              </div>
              <div className="pt-2 border-t border-[#E5E0D8] flex items-center justify-between">
                <div>
                  <span className="font-display font-bold text-base text-[#202622] block">
                    Jami to'lov:
                  </span>
                  <span className="text-[11px] text-[#737A75]">
                    To'lov taom yetkazilgach amalga oshiriladi
                  </span>
                </div>
                <span className="font-display font-bold text-xl text-[#173F35] tabular-nums">
                  {formatUZS(cartTotal)}
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmitOrder}
              disabled={isSubmitting}
              className={`w-full py-4 px-6 rounded-2xl font-display font-bold text-base flex items-center justify-center gap-2 shadow-md transition-all ${
                isSubmitting
                  ? 'bg-slate-400 text-white cursor-wait'
                  : 'bg-amber-500 hover:bg-amber-600 active:scale-[0.99] text-[#202622]'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-slate-700 border-t-transparent rounded-full animate-spin" />
                  <span>Buyurtma yuborilmoqda...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Buyurtma berish (Stol №{activeTableNumber})</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-[#E5E0D8] p-10 text-center shadow-sm my-8">
            <div className="w-16 h-16 rounded-2xl bg-[#E8F0EC] text-[#173F35] flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h2 className="font-display font-bold text-xl text-[#202622] mb-1">
              Savatingiz hozircha bo'sh
            </h2>
            <p className="text-xs text-[#737A75] max-w-xs mx-auto mb-6 leading-relaxed">
              Bizning boy milliy taomlarimiz, qarsildoq somsalarimiz va salqin ichimliklarimizdan tatib ko'ring!
            </p>
            <button
              onClick={() => navigate('/menu')}
              className="py-3 px-6 rounded-xl bg-[#173F35] text-white text-xs font-bold hover:bg-[#235B4E] transition-all shadow-sm"
            >
              Menyudan tanlash
            </button>
          </div>
        )}
      </main>

      <CustomerBottomNav />
    </div>
  );
};

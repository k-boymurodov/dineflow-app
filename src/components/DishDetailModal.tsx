import React, { useState } from 'react';
import { MenuItem } from '../types';
import { formatUZS } from '../utils/formatters';
import { X, Minus, Plus, Clock, Flame, ShoppingBag, Utensils } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface DishDetailModalProps {
  dish: MenuItem | null;
  onClose: () => void;
}

export const DishDetailModal: React.FC<DishDetailModalProps> = ({ dish, onClose }) => {
  const { addToCart } = useApp();
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');
  const [imageError, setImageError] = useState(false);

  if (!dish) return null;

  const handleAddToCart = () => {
    addToCart(dish, quantity, note.trim() ? note.trim() : undefined);
    onClose();
  };

  const totalPrice = dish.price * quantity;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-[#E5E0D8] flex flex-col">
        {/* Modal Image Header */}
        <div className="relative aspect-[16/10] w-full bg-[#FAF8F3] overflow-hidden">
          {dish.image_url && !imageError ? (
            <img
              src={dish.image_url}
              alt={dish.name}
              referrerPolicy="no-referrer"
              onError={() => setImageError(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-[#E8F0EC] to-[#FAF8F3]">
              <div className="w-14 h-14 rounded-2xl bg-[#173F35]/10 flex items-center justify-center text-[#173F35] mb-2">
                <Utensils className="w-7 h-7" />
              </div>
              <span className="font-display font-bold text-lg text-[#173F35]">{dish.name}</span>
            </div>
          )}

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-md transition-colors shadow"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Prep time & calories tag */}
          <div className="absolute bottom-3 left-4 flex items-center gap-2">
            <span className="bg-black/60 backdrop-blur-md text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-amber-300" />
              <span>{dish.preparation_time_minutes} daqiqa</span>
            </span>
            {dish.calories && (
              <span className="bg-black/60 backdrop-blur-md text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 font-medium">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                <span>{dish.calories} kkal</span>
              </span>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-3 mb-2">
              <h2 className="font-display font-bold text-xl text-[#202622]">{dish.name}</h2>
              <span className="font-display font-bold text-lg text-[#173F35] whitespace-nowrap tabular-nums">
                {formatUZS(dish.price)}
              </span>
            </div>

            {dish.weight_or_portion && (
              <p className="text-xs text-[#737A75] mb-3">Vazni / Porsiya: {dish.weight_or_portion}</p>
            )}

            <p className="text-sm text-[#737A75] leading-relaxed mb-5">{dish.description}</p>

            {/* Special Instruction Input */}
            <div className="mb-6">
              <label className="block text-xs font-semibold text-[#202622] mb-1.5">
                Maxsus ko'rsatma yoki istaklar (ixtiyoriy):
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={120}
                placeholder="Masalan: piyozsiz, achchiq bo'lmasin, go'shti ko'proq pishsin..."
                rows={2}
                className="w-full text-xs p-3 rounded-xl bg-[#FAF8F3] border border-[#E5E0D8] focus:outline-none focus:border-[#173F35] focus:ring-1 focus:ring-[#173F35] resize-none placeholder:text-[#737A75]"
              />
              <div className="flex justify-end mt-1">
                <span className="text-[10px] text-[#737A75]">{note.length}/120</span>
              </div>
            </div>
          </div>

          {/* Quantity Stepper & Add Action */}
          <div className="pt-4 border-t border-[#E5E0D8] flex items-center gap-4">
            {/* Quantity Stepper */}
            <div className="flex items-center gap-2 bg-[#FAF8F3] border border-[#E5E0D8] rounded-xl p-1 shrink-0">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-8 h-8 rounded-lg bg-white text-[#173F35] shadow-xs flex items-center justify-center hover:bg-slate-50 active:scale-95 transition-all"
                disabled={quantity <= 1}
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center text-sm font-bold font-display tabular-nums">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="w-8 h-8 rounded-lg bg-[#173F35] text-white shadow-xs flex items-center justify-center hover:bg-[#235B4E] active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Submit Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={!dish.is_available}
              className={`flex-1 py-3.5 px-4 rounded-xl font-display font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-all ${
                dish.is_available
                  ? 'bg-[#173F35] text-white hover:bg-[#235B4E] active:scale-[0.98]'
                  : 'bg-slate-200 text-slate-500 cursor-not-allowed'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Savatga qo'shish</span>
              <span className="text-xs opacity-90 tabular-nums">· {formatUZS(totalPrice)}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

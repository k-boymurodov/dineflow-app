import React, { useState } from 'react';
import { MenuItem } from '../types';
import { formatUZS } from '../utils/formatters';
import { Plus, Clock, Utensils } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface DishCardProps {
  dish: MenuItem;
  onSelect: (dish: MenuItem) => void;
}

export const DishCard: React.FC<DishCardProps> = ({ dish, onSelect }) => {
  const { addToCart } = useApp();
  const [imageError, setImageError] = useState(false);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!dish.is_available) return;
    addToCart(dish, 1);
  };

  return (
    <div
      onClick={() => onSelect(dish)}
      className={`group relative bg-white rounded-2xl p-3 border border-[#E5E0D8] shadow-[0_2px_8px_-2px_rgba(23,63,53,0.04)] hover:shadow-[0_8px_20px_-4px_rgba(23,63,53,0.08)] transition-all duration-200 cursor-pointer flex flex-col justify-between ${
        !dish.is_available ? 'opacity-65 grayscale-[30%]' : ''
      }`}
    >
      <div>
        {/* Image Frame */}
        <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-[#FAF8F3] mb-3">
          {dish.image_url && !imageError ? (
            <img
              src={dish.image_url}
              alt={dish.name}
              referrerPolicy="no-referrer"
              onError={() => setImageError(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-[#E8F0EC] to-[#FAF8F3]">
              <div className="w-10 h-10 rounded-full bg-[#173F35]/10 flex items-center justify-center text-[#173F35] mb-1">
                <Utensils className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-medium text-[#737A75] line-clamp-1">
                {dish.name}
              </span>
            </div>
          )}

          {/* Prep time badge */}
          <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-medium px-2 py-0.5 rounded-md flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-300" />
            <span>{dish.preparation_time_minutes} daq</span>
          </div>

          {/* Availability or Tag Badge */}
          {!dish.is_available ? (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
              <span className="bg-red-500/90 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow">
                Vaqtincha tugagan
              </span>
            </div>
          ) : dish.tags && dish.tags[0] ? (
            <div className="absolute top-2 right-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
              {dish.tags[0]}
            </div>
          ) : null}
        </div>

        {/* Dish Title & Description */}
        <h3 className="font-display font-bold text-base text-[#202622] group-hover:text-[#173F35] transition-colors line-clamp-1 mb-1">
          {dish.name}
        </h3>
        <p className="text-xs text-[#737A75] line-clamp-2 leading-relaxed mb-3">
          {dish.description}
        </p>
      </div>

      {/* Bottom Price & Add to Cart button */}
      <div className="pt-2 border-t border-[#FAF8F3] flex items-center justify-between mt-auto">
        <div className="flex flex-col">
          <span className="font-display font-bold text-base text-[#173F35] tabular-nums">
            {formatUZS(dish.price)}
          </span>
          {dish.weight_or_portion && (
            <span className="text-[10px] text-[#737A75]">{dish.weight_or_portion}</span>
          )}
        </div>

        <button
          onClick={handleQuickAdd}
          disabled={!dish.is_available}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
            dish.is_available
              ? 'bg-[#173F35] text-white hover:bg-[#235B4E] active:scale-95 shadow-sm'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
          title={dish.is_available ? "Savatga tez qo'shish" : 'Mavjud emas'}
          aria-label={`${dish.name} savatga qo'shish`}
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

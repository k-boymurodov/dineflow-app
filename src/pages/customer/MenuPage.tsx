import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { CustomerHeader } from '../../components/CustomerHeader';
import { CustomerBottomNav } from '../../components/CustomerBottomNav';
import { DishCard } from '../../components/DishCard';
import { DishDetailModal } from '../../components/DishDetailModal';
import { MenuItem } from '../../types';
import { formatUZS } from '../../utils/formatters';
import { Search, X, ShoppingBag, ArrowRight, Utensils } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const MenuPage: React.FC = () => {
  const { categories, menuItems, cart, cartTotal, cartItemCount } = useApp();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('cat-all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDish, setSelectedDish] = useState<MenuItem | null>(null);
  const navigate = useNavigate();

  // Filter dishes
  const filteredDishes = useMemo(() => {
    return menuItems.filter((dish) => {
      const matchesCategory =
        selectedCategoryId === 'cat-all' || dish.category_id === selectedCategoryId;
      const matchesSearch =
        searchQuery.trim() === '' ||
        dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dish.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [menuItems, selectedCategoryId, searchQuery]);

  return (
    <div className="min-h-screen bg-[#FAF8F3] pb-28 md:pb-12 flex flex-col">
      <CustomerHeader />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 pt-4">
        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737A75]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Taom nomi yoki tarkibi bo'yicha qidiruv..."
            className="w-full pl-10 pr-10 py-3 rounded-2xl bg-white border border-[#E5E0D8] text-sm text-[#202622] placeholder:text-[#737A75] focus:outline-none focus:border-[#173F35] focus:ring-1 focus:ring-[#173F35] shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#737A75] hover:text-[#202622] p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Horizontal Filter Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-5 no-scrollbar scroll-smooth">
          {categories.map((cat) => {
            const isSelected = selectedCategoryId === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryId(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#173F35] text-white shadow-sm'
                    : 'bg-white text-[#737A75] hover:text-[#202622] border border-[#E5E0D8]'
                }`}
              >
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Menu Grid Header */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-bold text-lg text-[#202622]">
            {categories.find((c) => c.id === selectedCategoryId)?.name || 'Barcha taomlar'}
          </h2>
          <span className="text-xs text-[#737A75]">
            {filteredDishes.length} ta taom topildi
          </span>
        </div>

        {/* Dishes Grid */}
        {filteredDishes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {filteredDishes.map((dish) => (
              <DishCard key={dish.id} dish={dish} onSelect={(d) => setSelectedDish(d)} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#E5E0D8] p-10 text-center my-6">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-500">
              <Utensils className="w-6 h-6" />
            </div>
            <h3 className="font-display font-semibold text-base text-[#202622] mb-1">
              Taom topilmadi
            </h3>
            <p className="text-xs text-[#737A75] mb-4">
              "{searchQuery}" so'rovi bo'yicha hech qanday taom mavjud emas.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategoryId('cat-all');
              }}
              className="px-4 py-2 rounded-xl bg-[#173F35] text-white text-xs font-semibold hover:bg-[#235B4E] transition-colors"
            >
              Barcha taomlarni ko'rsatish
            </button>
          </div>
        )}
      </main>

      {/* Floating Sticky Cart Tray if cart has items */}
      {cart.length > 0 && (
        <div className="fixed bottom-20 md:bottom-6 left-4 right-4 z-40 max-w-lg mx-auto">
          <div
            onClick={() => navigate('/cart')}
            className="bg-[#173F35] text-white p-3.5 rounded-2xl shadow-xl flex items-center justify-between cursor-pointer hover:bg-[#235B4E] transition-all transform hover:-translate-y-0.5 active:scale-[0.99] border border-emerald-900"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-900 flex items-center justify-center font-bold text-sm">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-bold text-sm">
                  {cartItemCount} ta taom savatda
                </span>
                <span className="text-xs text-white/80 tabular-nums">
                  Jami: {formatUZS(cartTotal)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl text-xs font-semibold">
              <span>Savatga o'tish</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      )}

      {/* Dish Detail Modal */}
      <DishDetailModal dish={selectedDish} onClose={() => setSelectedDish(null)} />

      {/* Mobile Bottom Navigation */}
      <CustomerBottomNav />
    </div>
  );
};

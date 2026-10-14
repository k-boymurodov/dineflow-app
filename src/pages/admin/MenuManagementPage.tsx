import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { AdminSidebar } from '../../components/AdminSidebar';
import { AdminHeader } from '../../components/AdminHeader';
import { MenuItem, Category } from '../../types';
import { formatUZS } from '../../utils/formatters';
import { dataService } from '../../services/storage';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Clock,
  Utensils,
  X,
  Check,
  Flame,
  CheckCircle2,
} from 'lucide-react';

export const MenuManagementPage: React.FC = () => {
  const { categories, menuItems, refreshData, addToast } = useApp();
  const [selectedCatId, setSelectedCatId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Dish modal
  const [dishModalOpen, setDishModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<MenuItem | null>(null);

  // Form fields
  const [dishName, setDishName] = useState('');
  const [dishCategoryId, setDishCategoryId] = useState('');
  const [dishDescription, setDishDescription] = useState('');
  const [dishPrice, setDishPrice] = useState<number>(35000);
  const [dishImageUrl, setDishImageUrl] = useState('');
  const [dishPrepTime, setDishPrepTime] = useState<number>(15);
  const [dishPortion, setDishPortion] = useState('');
  const [dishAvailable, setDishAvailable] = useState(true);

  // Category modal
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [catName, setCatName] = useState('');

  // Preset images
  const PRESET_IMAGES = [
    { label: "To'y oshi", url: '/src/assets/images/dish_wedding_plov_1791957217112.jpg' },
    { label: 'Qozon kabob', url: '/src/assets/images/dish_kazan_kabob_1791957217871.jpg' },
    { label: 'Tandir somsa', url: '/src/assets/images/dish_tandoor_somsa_1791957218501.jpg' },
    { label: 'Shashlik', url: '/src/assets/images/dish_shashlik_assorted_1791957218563.jpg' },
  ];

  const filteredDishes = useMemo(() => {
    return menuItems.filter((d) => {
      const matchCat = selectedCatId === 'all' || d.category_id === selectedCatId;
      const matchSearch =
        searchQuery.trim() === '' ||
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [menuItems, selectedCatId, searchQuery]);

  const openCreateDishModal = () => {
    setEditingDish(null);
    setDishName('');
    setDishCategoryId(categories[1]?.id || categories[0]?.id || 'cat-milliy');
    setDishDescription('');
    setDishPrice(40000);
    setDishImageUrl(PRESET_IMAGES[0].url);
    setDishPrepTime(15);
    setDishPortion('350 g');
    setDishAvailable(true);
    setDishModalOpen(true);
  };

  const openEditDishModal = (dish: MenuItem) => {
    setEditingDish(dish);
    setDishName(dish.name);
    setDishCategoryId(dish.category_id);
    setDishDescription(dish.description);
    setDishPrice(dish.price);
    setDishImageUrl(dish.image_url || '');
    setDishPrepTime(dish.preparation_time_minutes);
    setDishPortion(dish.weight_or_portion || '');
    setDishAvailable(dish.is_available);
    setDishModalOpen(true);
  };

  const handleSaveDish = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const item: MenuItem = {
        id: editingDish ? editingDish.id : 'dish-' + Date.now(),
        category_id: dishCategoryId,
        name: dishName,
        description: dishDescription,
        price: Number(dishPrice),
        image_url: dishImageUrl,
        is_available: dishAvailable,
        preparation_time_minutes: Number(dishPrepTime),
        weight_or_portion: dishPortion,
        created_at: editingDish ? editingDish.created_at : new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      await dataService.saveMenuItem(item);
      await refreshData();
      setDishModalOpen(false);
      addToast('success', 'Taom saqlandi', `"${dishName}" muvaffaqiyatli yangilandi.`);
    } catch {
      addToast('error', 'Xatolik', 'Taomni saqlashda xatolik yuz berdi');
    }
  };

  const handleDeleteDish = async (id: string, name: string) => {
    if (!window.confirm(`Haqiqatdan ham "${name}" taomini o'chirmoqchimisiz?`)) return;
    try {
      await dataService.deleteMenuItem(id);
      await refreshData();
      addToast('info', 'O\'chirildi', `"${name}" menyudan olib tashlandi.`);
    } catch {
      addToast('error', 'Xatolik', 'Taomni o\'chirishda xatolik yuz berdi');
    }
  };

  const handleToggleAvailability = async (dish: MenuItem) => {
    try {
      await dataService.toggleDishAvailability(dish.id, !dish.is_available);
      await refreshData();
      addToast(
        'info',
        'Holat o\'zgardi',
        `"${dish.name}" ${!dish.is_available ? 'mavjud' : 'tugagan'} deb belgilandi.`
      );
    } catch {
      addToast('error', 'Xatolik', 'Holatni o\'zgartirib bo\'lmadi');
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;
    try {
      const newCat: Category = {
        id: 'cat-' + Date.now(),
        name: catName.trim(),
        sort_order: categories.length + 1,
        created_at: new Date().toISOString(),
      };
      await dataService.saveCategory(newCat);
      await refreshData();
      setCatName('');
      setCatModalOpen(false);
      addToast('success', 'Kategoriya qo\'shildi', `"${newCat.name}" yaratildi.`);
    } catch {
      addToast('error', 'Xatolik', 'Kategoriya yaratishda xatolik');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F3] text-[#202622] flex">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader />

        <main className="flex-1 p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-display font-bold text-2xl text-[#173F35] tracking-tight">
                Raqamli Menyu Boshqaruvi
              </h1>
              <p className="text-xs text-[#737A75] mt-0.5">
                Taomlar tarkibi, narxlar va oshxona mavjudligini sozlash
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setCatModalOpen(true)}
                className="bg-white hover:bg-slate-50 text-[#173F35] px-3.5 py-2 rounded-xl border border-[#E5E0D8] text-xs font-semibold flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4 text-[#173F35]" />
                <span>+ Yangi kategoriya</span>
              </button>

              <button
                onClick={openCreateDishModal}
                className="bg-[#173F35] hover:bg-[#235B4E] text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>+ Yangi taom qo'shish</span>
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#E5E0D8] shadow-xs">
            {/* Category tabs */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setSelectedCatId('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCatId === 'all'
                    ? 'bg-[#173F35] text-white'
                    : 'text-[#737A75] hover:bg-[#FAF8F3] hover:text-[#202622]'
                }`}
              >
                Barchasi ({menuItems.length})
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCatId(c.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedCatId === c.id
                      ? 'bg-[#173F35] text-white'
                      : 'text-[#737A75] hover:bg-[#FAF8F3] hover:text-[#202622]'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative min-w-[200px]">
              <Search className="w-4 h-4 text-[#737A75] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Taom qidiruvi..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-[#FAF8F3] border border-[#E5E0D8] focus:outline-none focus:border-[#173F35]"
              />
            </div>
          </div>

          {/* Dishes Table / Cards Grid */}
          <div className="bg-white rounded-3xl border border-[#E5E0D8] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#FAF8F3] text-[#737A75] font-semibold border-b border-[#E5E0D8]">
                    <th className="py-3 px-4">Taom</th>
                    <th className="py-3 px-4">Kategoriya</th>
                    <th className="py-3 px-4">Narxi</th>
                    <th className="py-3 px-4">Tayyorlash vaqti</th>
                    <th className="py-3 px-4">Mavjudlik</th>
                    <th className="py-3 px-4 text-right">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#FAF8F3]">
                  {filteredDishes.map((dish) => {
                    const catName = categories.find((c) => c.id === dish.category_id)?.name || 'Kategoriya';
                    return (
                      <tr key={dish.id} className="hover:bg-[#FAF8F3]/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#FAF8F3] shrink-0 border border-[#E5E0D8]">
                              {dish.image_url ? (
                                <img
                                  src={dish.image_url}
                                  alt={dish.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[#173F35]">
                                  <Utensils className="w-5 h-5" />
                                </div>
                              )}
                            </div>
                            <div>
                              <span className="font-display font-bold text-sm text-[#202622] block">
                                {dish.name}
                              </span>
                              <span className="text-[11px] text-[#737A75] line-clamp-1 max-w-xs">
                                {dish.description}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-[#737A75] font-medium">{catName}</td>

                        <td className="py-3 px-4 font-display font-bold text-[#173F35] text-sm tabular-nums whitespace-nowrap">
                          {formatUZS(dish.price)}
                        </td>

                        <td className="py-3 px-4 text-[#737A75]">
                          <span className="inline-flex items-center gap-1 font-medium">
                            <Clock className="w-3.5 h-3.5 text-amber-500" />
                            <span>{dish.preparation_time_minutes} daqiqa</span>
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleToggleAvailability(dish)}
                            className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all border ${
                              dish.is_available
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                            }`}
                          >
                            {dish.is_available ? 'Mavjud (Sotuvda)' : 'Tugagan (Nofaol)'}
                          </button>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openEditDishModal(dish)}
                              className="p-2 rounded-lg text-[#737A75] hover:text-[#173F35] hover:bg-slate-100 transition-colors"
                              title="Tahrirlash"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteDish(dish.id, dish.name)}
                              className="p-2 rounded-lg text-[#737A75] hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="O'chirish"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Dish Form Modal */}
      {dishModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#E5E0D8] max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E0D8]">
              <h3 className="font-display font-bold text-lg text-[#173F35]">
                {editingDish ? "Taomni tahrirlash" : "Yangi taom qo'shish"}
              </h3>
              <button
                onClick={() => setDishModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveDish} className="my-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#202622] mb-1">Taom nomi:</label>
                <input
                  type="text"
                  required
                  value={dishName}
                  onChange={(e) => setDishName(e.target.value)}
                  placeholder="Masalan: To'y Oshi (Maxsus)"
                  className="w-full p-2.5 rounded-xl bg-[#FAF8F3] border border-[#E5E0D8] text-xs focus:outline-none focus:border-[#173F35]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#202622] mb-1">Kategoriya:</label>
                  <select
                    value={dishCategoryId}
                    onChange={(e) => setDishCategoryId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#FAF8F3] border border-[#E5E0D8] text-xs focus:outline-none focus:border-[#173F35]"
                  >
                    {categories.filter((c) => c.id !== 'cat-all').map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#202622] mb-1">
                    Narxi (so'mda):
                  </label>
                  <input
                    type="number"
                    required
                    min="1000"
                    step="1000"
                    value={dishPrice}
                    onChange={(e) => setDishPrice(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-[#FAF8F3] border border-[#E5E0D8] text-xs font-bold text-[#173F35] focus:outline-none focus:border-[#173F35]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#202622] mb-1">Tavsifi & Tarkibi:</label>
                <textarea
                  required
                  rows={3}
                  value={dishDescription}
                  onChange={(e) => setDishDescription(e.target.value)}
                  placeholder="Masalan: Lahm mol go'shti, sariq sabzi, no'xat, mayiz..."
                  className="w-full p-2.5 rounded-xl bg-[#FAF8F3] border border-[#E5E0D8] text-xs focus:outline-none focus:border-[#173F35] resize-none"
                />
              </div>

              {/* Preset Image Selection */}
              <div>
                <label className="block font-semibold text-[#202622] mb-1">
                  Taom rasmi (Foto tanlash):
                </label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {PRESET_IMAGES.map((preset) => (
                    <button
                      type="button"
                      key={preset.url}
                      onClick={() => setDishImageUrl(preset.url)}
                      className={`relative aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all ${
                        dishImageUrl === preset.url
                          ? 'border-[#173F35] ring-2 ring-[#173F35]/20'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                      <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] p-0.5 truncate text-center">
                        {preset.label}
                      </span>
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={dishImageUrl}
                  onChange={(e) => setDishImageUrl(e.target.value)}
                  placeholder="yoki rasm havolasini kiriting (/src/assets/...)"
                  className="w-full p-2 rounded-xl bg-[#FAF8F3] border border-[#E5E0D8] text-[11px] text-[#737A75]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#202622] mb-1">
                    Tayyorlash vaqti (daq):
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={dishPrepTime}
                    onChange={(e) => setDishPrepTime(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-[#FAF8F3] border border-[#E5E0D8] text-xs focus:outline-none focus:border-[#173F35]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#202622] mb-1">
                    Vazni / Porsiya:
                  </label>
                  <input
                    type="text"
                    value={dishPortion}
                    onChange={(e) => setDishPortion(e.target.value)}
                    placeholder="Masalan: 400 g yoki 1 dona"
                    className="w-full p-2.5 rounded-xl bg-[#FAF8F3] border border-[#E5E0D8] text-xs focus:outline-none focus:border-[#173F35]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="dishAvailableCheckbox"
                  checked={dishAvailable}
                  onChange={(e) => setDishAvailable(e.target.checked)}
                  className="rounded accent-[#173F35] w-4 h-4 cursor-pointer"
                />
                <label htmlFor="dishAvailableCheckbox" className="font-semibold text-xs text-[#202622] cursor-pointer">
                  Hozirda sotuvda mavjud (buyurtma berish mumkin)
                </label>
              </div>

              <div className="pt-3 border-t border-[#E5E0D8] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDishModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#173F35] hover:bg-[#235B4E] text-white font-bold shadow-xs"
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Creation Modal */}
      {catModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-[#E5E0D8]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E0D8]">
              <h3 className="font-display font-bold text-base text-[#173F35]">
                Yangi kategoriya
              </h3>
              <button
                onClick={() => setCatModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="my-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-[#202622] mb-1">
                  Kategoriya nomi:
                </label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="Masalan: Tandir nonlar yoki Gazaklar"
                  className="w-full p-2.5 rounded-xl bg-[#FAF8F3] border border-[#E5E0D8] text-xs focus:outline-none focus:border-[#173F35]"
                />
              </div>

              <div className="pt-3 border-t border-[#E5E0D8] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCatModalOpen(false)}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#173F35] text-white font-bold"
                >
                  Qo'shish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

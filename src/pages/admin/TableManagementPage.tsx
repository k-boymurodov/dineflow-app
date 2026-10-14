import React, { useState, useMemo, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { AdminSidebar } from '../../components/AdminSidebar';
import { AdminHeader } from '../../components/AdminHeader';
import { RestaurantTable, TableZone, TableStatus } from '../../types';
import { formatUZS } from '../../utils/formatters';
import {
  Download,
  Plus,
  QrCode,
  Printer,
  Copy,
  Check,
  MapPin,
  Users,
  UtensilsCrossed,
  Wifi,
  X,
  Store,
  Layers,
} from 'lucide-react';
import { dataService } from '../../services/storage';

export const TableManagementPage: React.FC = () => {
  const { tables, orders, serviceCalls, refreshData, addToast, resolveServiceCall } = useApp();
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedTableId, setSelectedTableId] = useState<string>(tables[0]?.id || 'table-12');
  const [copied, setCopied] = useState(false);

  // New table modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTableNumber, setNewTableNumber] = useState<number>(tables.length + 1);
  const [newTableZone, setNewTableZone] = useState<TableZone>('main');
  const [newTableSeats, setNewTableSeats] = useState<number>(4);
  const [newTableWaiter, setNewTableWaiter] = useState<string>('Dilshod Karimiy');

  // Currently inspected table
  const inspectedTable = useMemo(() => {
    return tables.find((t) => t.id === selectedTableId) || tables[0] || null;
  }, [tables, selectedTableId]);

  // Active order on inspected table
  const inspectedOrder = useMemo(() => {
    if (!inspectedTable) return null;
    return (
      orders.find(
        (o) =>
          o.table_number === inspectedTable.table_number &&
          o.status !== 'delivered' &&
          o.status !== 'cancelled'
      ) || null
    );
  }, [inspectedTable, orders]);

  // Zone filters
  const filteredTables = useMemo(() => {
    return tables.filter((table) => {
      const matchZone = selectedZone === 'all' || table.zone === selectedZone;

      const activeOrder = orders.find(
        (o) =>
          o.table_number === table.table_number &&
          o.status !== 'delivered' &&
          o.status !== 'cancelled'
      );
      const isBusy = !!activeOrder;
      const isService = serviceCalls.some(
        (c) => c.table_number === table.table_number && c.status === 'pending'
      );
      const isBill = activeOrder?.bill_requested;

      let matchStatus = true;
      if (selectedStatus === 'busy') matchStatus = isBusy;
      if (selectedStatus === 'free') matchStatus = !isBusy;
      if (selectedStatus === 'service') matchStatus = isService;
      if (selectedStatus === 'bill') matchStatus = !!isBill;

      return matchZone && matchStatus;
    });
  }, [tables, selectedZone, selectedStatus, orders, serviceCalls]);

  const handleCopyUrl = () => {
    if (!inspectedTable) return;
    const url = `${window.location.origin}/menu?table=${inspectedTable.table_number}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    addToast('success', 'Nusxalandi', `Stol №${inspectedTable.table_number} QR havolasi nusxalandi.`);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateTable = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const table: RestaurantTable = {
        id: 'table-' + Date.now(),
        table_number: Number(newTableNumber),
        label: newTableZone === 'vip' ? `VIP №${newTableNumber}` : `Stol №${newTableNumber}`,
        zone: newTableZone,
        seats: Number(newTableSeats),
        qr_token: `qr-${newTableNumber}-${Math.random().toString(36).substring(2, 7)}`,
        is_active: true,
        assigned_waiter_name: newTableWaiter,
        created_at: new Date().toISOString(),
      };
      await dataService.saveTable(table);
      await refreshData();
      setSelectedTableId(table.id);
      setShowAddModal(false);
      addToast('success', 'Stol yaratildi', `${table.label} muvaffaqiyatli qo'shildi.`);
    } catch {
      addToast('error', 'Xatolik', 'Stol yaratishda xatolik yuz berdi');
    }
  };

  const handlePrintCard = () => {
    window.print();
  };

  const handleDownloadQr = () => {
    if (!inspectedTable) return;
    addToast(
      'success',
      'QR kod yuklab olindi',
      `${inspectedTable.label || 'Stol'} uchun A6 pechat formati tayyorlandi.`
    );
  };

  const handleBulkDownload = () => {
    addToast(
      'info',
      'To\'plam shakllanmoqda',
      `Barcha ${tables.length} ta stol uchun QR kodlar ZIP/PDF to'plami yaratilmoqda.`
    );
  };

  return (
    <div className="min-h-screen bg-[#FAF8F3] text-[#202622] flex">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader />

        <main className="flex-1 p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* Top Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#737A75] uppercase tracking-wider mb-1">
                <span>Zal boshqaruvi & Raqamlashtirish</span>
                <span>·</span>
                <span className="text-emerald-700">Jonli sinxronizatsiya</span>
              </div>
              <h1 className="font-display font-bold text-2xl text-[#173F35] tracking-tight">
                Stollar va QR Kodlar boshqaruvi
              </h1>
              <p className="text-xs text-[#737A75] mt-0.5">
                Zal xaritasi, real vaqt rejimidagi stollar holati va shaxsiy QR menyu generatori
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={handleBulkDownload}
                className="bg-white hover:bg-slate-50 text-[#173F35] px-4 py-2.5 rounded-xl border border-[#E5E0D8] text-xs font-semibold flex items-center gap-2 shadow-xs transition-all active:scale-95"
              >
                <Download className="w-4 h-4 text-[#173F35]" />
                <span>QR to'plamini yuklash (ZIP/PDF)</span>
              </button>

              <button
                onClick={() => setShowAddModal(true)}
                className="bg-[#173F35] hover:bg-[#235B4E] text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Yangi stol qo'shish</span>
              </button>
            </div>
          </div>

          {/* Zone & Status Filter Strips */}
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#E5E0D8] shadow-xs">
            {/* Zones */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              {[
                { id: 'all', label: `Barchasi (${tables.length})` },
                { id: 'main', label: 'Asosiy Zal' },
                { id: 'terrace', label: 'Veranda / Terrasa' },
                { id: 'vip', label: 'VIP Xonalar' },
              ].map((z) => (
                <button
                  key={z.id}
                  onClick={() => setSelectedZone(z.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedZone === z.id
                      ? 'bg-[#173F35] text-white shadow-xs'
                      : 'text-[#737A75] hover:bg-[#FAF8F3] hover:text-[#202622]'
                  }`}
                >
                  {z.label}
                </button>
              ))}
            </div>

            {/* Status Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {[
                { id: 'all', label: 'Barchasi', count: tables.length },
                { id: 'busy', label: 'Band' },
                { id: 'free', label: 'Bo\'sh' },
                { id: 'service', label: 'Xizmat chaqirgan' },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setSelectedStatus(st.id)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all border ${
                    selectedStatus === st.id
                      ? 'bg-[#173F35] text-white border-[#173F35]'
                      : 'bg-white text-[#737A75] border-[#E5E0D8] hover:border-[#173F35]'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Main Work Area: Table Grid (8 cols) + QR Inspector (4 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Table Cards Grid (8 cols) */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5">
                {filteredTables.map((tbl) => {
                  const isSelected = tbl.id === selectedTableId;
                  const activeOrder = orders.find(
                    (o) =>
                      o.table_number === tbl.table_number &&
                      o.status !== 'delivered' &&
                      o.status !== 'cancelled'
                  );
                  const isBusy = !!activeOrder;
                  const serviceCall = serviceCalls.find(
                    (c) => c.table_number === tbl.table_number && c.status === 'pending'
                  );
                  const isService = !!serviceCall;

                  return (
                    <div
                      key={tbl.id}
                      onClick={() => setSelectedTableId(tbl.id)}
                      className={`relative bg-white rounded-2xl p-4 border transition-all cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between ${
                        isSelected
                          ? 'border-[#173F35] ring-2 ring-[#173F35]/20'
                          : 'border-[#E5E0D8]'
                      }`}
                    >
                      {/* Urgent Call Badge */}
                      {isService && (
                        <div className="absolute -top-2.5 -right-1 z-10">
                          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-bold shadow-md animate-bounce">
                            Chaqiruv!
                          </span>
                        </div>
                      )}

                      <div>
                        {/* Table Header */}
                        <div className="flex items-start justify-between pb-3 border-b border-[#FAF8F3]">
                          <div className="flex items-center gap-2.5">
                            <div className="w-11 h-11 rounded-xl bg-[#173F35] text-white flex flex-col items-center justify-center font-bold">
                              <span className="text-[9px] uppercase tracking-wider opacity-70">
                                Stol
                              </span>
                              <span className="font-display text-base leading-none">
                                {tbl.table_number}
                              </span>
                            </div>
                            <div>
                              <h3 className="font-display font-bold text-sm text-[#202622]">
                                {tbl.label || `Stol №${tbl.table_number}`}
                              </h3>
                              <span className="text-[11px] text-[#737A75] flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                <span>{tbl.seats} kishilik ({tbl.zone})</span>
                              </span>
                            </div>
                          </div>

                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isService
                                ? 'bg-amber-100 text-amber-800'
                                : isBusy
                                ? 'bg-red-100 text-red-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {isService ? 'Xizmat kerak' : isBusy ? 'Band' : "Bo'sh / Toza"}
                          </span>
                        </div>

                        {/* Order snippet */}
                        <div className="my-3 p-2.5 rounded-xl bg-[#FAF8F3] border border-[#E5E0D8]/60 text-xs space-y-1">
                          {isBusy ? (
                            <>
                              <div className="flex justify-between text-[#737A75]">
                                <span>Buyurtma:</span>
                                <span className="font-mono font-bold text-[#173F35]">
                                  {activeOrder.order_number}
                                </span>
                              </div>
                              <div className="flex justify-between font-bold">
                                <span>Jami hisob:</span>
                                <span className="font-display text-[#173F35] tabular-nums">
                                  {formatUZS(activeOrder.total_amount)}
                                </span>
                              </div>
                              <div className="flex justify-between text-[11px] text-[#737A75] pt-1 border-t border-[#E5E0D8]/60">
                                <span>Xodim: {tbl.assigned_waiter_name || 'Mas\'ul'}</span>
                              </div>
                            </>
                          ) : (
                            <div className="py-2 text-center text-[#737A75] text-[11px]">
                              Stol tozalangan va mehmon qabuliga tayyor
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Card Bottom Actions */}
                      <div className="pt-2 flex items-center justify-between gap-2">
                        {isService ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              resolveServiceCall(serviceCall.id);
                            }}
                            className="flex-1 py-1.5 px-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-xs rounded-lg transition-colors"
                          >
                            Xizmatga javob berish
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTableId(tbl.id);
                            }}
                            className="flex-1 py-1.5 px-2 bg-[#FAF8F3] hover:bg-[#E8F0EC] text-[#173F35] font-semibold text-xs rounded-lg transition-colors text-center"
                          >
                            QR ko'rish
                          </button>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTableId(tbl.id);
                          }}
                          className="p-1.5 rounded-lg bg-[#173F35] text-white hover:bg-[#235B4E] transition-colors"
                          title="QR kodni ochish"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Interactive Floor Mini-Map */}
              <div className="bg-white p-5 rounded-3xl border border-[#E5E0D8] shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#173F35]" />
                    <h3 className="font-display font-bold text-sm text-[#202622]">
                      Interaktiv zal sxemasi
                    </h3>
                  </div>
                  <span className="text-xs text-[#737A75]">
                    Zonalar: Asosiy zal, Veranda, Oshxona darchasi
                  </span>
                </div>

                <div className="relative w-full h-44 bg-[#FAF8F3] rounded-2xl p-4 flex flex-col justify-between border border-[#E5E0D8] overflow-hidden">
                  <div className="flex items-center justify-between text-xs text-[#737A75] z-10">
                    <span className="bg-white px-2.5 py-1 rounded-lg border border-[#E5E0D8]">
                      Oshxona / KDS Tarqatish
                    </span>
                    <span className="bg-white px-2.5 py-1 rounded-lg border border-[#E5E0D8]">
                      Yozgi Verandaga chiqish
                    </span>
                  </div>

                  {/* Stylized tables */}
                  <div className="flex items-center justify-around z-10">
                    {tables.slice(0, 5).map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setSelectedTableId(t.id)}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-display font-bold text-xs transition-transform hover:scale-110 shadow-xs ${
                          t.id === selectedTableId
                            ? 'bg-[#173F35] text-white ring-4 ring-[#173F35]/20 scale-105'
                            : 'bg-white border border-[#E5E0D8] text-[#202622]'
                        }`}
                      >
                        {t.table_number}
                      </button>
                    ))}
                  </div>

                  <div className="text-[11px] text-[#737A75] z-10 flex items-center justify-between">
                    <span>* Stol ustiga bosib QR kodini ko'ring</span>
                    <span className="text-emerald-700 font-semibold">Jonli rejim</span>
                  </div>
                </div>
              </div>
            </div>

            {/* QR Code Preview & Inspector Panel (5 cols / 4 cols) */}
            <div className="lg:col-span-5 xl:col-span-4 sticky top-20">
              {inspectedTable && (
                <div className="bg-white rounded-3xl p-6 border border-[#E5E0D8] shadow-sm space-y-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-[#737A75]">
                        <span className="bg-[#E8F0EC] text-[#173F35] font-bold px-2 py-0.5 rounded-full">
                          Individual QR
                        </span>
                        <span>A6 formati</span>
                      </div>
                      <h2 className="font-display font-bold text-xl text-[#202622] mt-1">
                        {inspectedTable.label || `Stol №${inspectedTable.table_number}`}
                      </h2>
                      <span className="text-xs text-[#737A75]">
                        {inspectedTable.zone === 'main'
                          ? 'Asosiy zal'
                          : inspectedTable.zone === 'terrace'
                          ? 'Veranda'
                          : 'VIP xona'}{' '}
                        · {inspectedTable.seats} kishilik sig'im
                      </span>
                    </div>

                    <div className="w-10 h-10 rounded-xl bg-[#FAF8F3] text-[#173F35] flex items-center justify-center border border-[#E5E0D8]">
                      <QrCode className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Printable QR Card Graphic Mockup */}
                  <div
                    id="printable-qr-card"
                    className="bg-[#FAF8F3] rounded-2xl p-6 border border-[#E5E0D8] flex flex-col items-center text-center shadow-inner relative"
                  >
                    <div className="w-full flex items-center justify-between mb-3 text-xs text-[#737A75]">
                      <div className="flex items-center gap-1 font-bold text-[#173F35]">
                        <UtensilsCrossed className="w-4 h-4 text-amber-500" />
                        <span>Rayhon Milliy</span>
                      </div>
                      <span className="text-[10px] uppercase tracking-wider">DineFlow QR</span>
                    </div>

                    <h3 className="font-display font-bold text-base text-[#202622] mb-0.5">
                      Menyuni skanerlang
                    </h3>
                    <p className="text-[11px] text-[#737A75] mb-4 max-w-[200px]">
                      Smartfon kamerangizni yo'naltiring va buyurtma bering
                    </p>

                    {/* High-Contrast SVG QR Code with Logo Badge */}
                    <div className="relative p-3 bg-white rounded-2xl shadow-md border border-[#E5E0D8]">
                      <svg className="w-44 h-44 text-[#173F35]" viewBox="0 0 100 100" fill="currentColor">
                        {/* Corner Finder 1 */}
                        <rect x="5" y="5" width="26" height="26" rx="4" fill="none" stroke="currentColor" strokeWidth="6" />
                        <rect x="12" y="12" width="12" height="12" rx="2" fill="currentColor" />
                        {/* Corner Finder 2 */}
                        <rect x="69" y="5" width="26" height="26" rx="4" fill="none" stroke="currentColor" strokeWidth="6" />
                        <rect x="76" y="12" width="12" height="12" rx="2" fill="currentColor" />
                        {/* Corner Finder 3 */}
                        <rect x="5" y="69" width="26" height="26" rx="4" fill="none" stroke="currentColor" strokeWidth="6" />
                        <rect x="12" y="76" width="12" height="12" rx="2" fill="currentColor" />
                        {/* Data matrix dots */}
                        <rect x="36" y="8" width="6" height="6" fill="currentColor" />
                        <rect x="46" y="8" width="6" height="6" fill="currentColor" />
                        <rect x="56" y="14" width="6" height="6" fill="currentColor" />
                        <rect x="8" y="36" width="6" height="6" fill="currentColor" />
                        <rect x="18" y="44" width="6" height="6" fill="currentColor" />
                        <rect x="8" y="54" width="6" height="6" fill="currentColor" />
                        <rect x="76" y="36" width="6" height="6" fill="currentColor" />
                        <rect x="86" y="44" width="6" height="6" fill="currentColor" />
                        <rect x="68" y="52" width="6" height="6" fill="currentColor" />
                        <rect x="36" y="68" width="6" height="6" fill="currentColor" />
                        <rect x="46" y="78" width="6" height="6" fill="currentColor" />
                        <rect x="56" y="86" width="6" height="6" fill="currentColor" />
                        <rect x="74" y="74" width="6" height="6" fill="currentColor" />
                        <rect x="84" y="84" width="6" height="6" fill="currentColor" />
                        <circle cx="50" cy="50" r="3" fill="currentColor" />
                        <circle cx="65" cy="35" r="2.5" fill="currentColor" />
                        <circle cx="35" cy="65" r="2.5" fill="currentColor" />
                      </svg>
                      {/* Center Brand Icon */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-10 rounded-xl bg-white shadow-md flex items-center justify-center text-[#173F35]">
                          <UtensilsCrossed className="w-5 h-5 text-amber-500" />
                        </div>
                      </div>
                    </div>

                    <div className="mt-3">
                      <span className="font-display font-bold text-sm tracking-wider px-3 py-1 rounded-full bg-[#173F35] text-white">
                        STOL № {inspectedTable.table_number}
                      </span>
                      <div className="text-[11px] text-[#737A75] mt-1 flex items-center justify-center gap-1">
                        <Wifi className="w-3 h-3 text-emerald-600" />
                        <span>Wi-Fi: rayhon2025</span>
                      </div>
                    </div>

                    {/* Direct URL Box */}
                    <div className="mt-3 w-full py-1.5 px-3 bg-white rounded-xl border border-[#E5E0D8] flex items-center justify-between text-xs">
                      <span className="text-[#737A75] truncate mr-2 select-all font-mono text-[11px]">
                        dineflow.uz/menu?table={inspectedTable.table_number}
                      </span>
                      <button
                        onClick={handleCopyUrl}
                        className="text-[#173F35] hover:text-[#235B4E] p-1 rounded"
                        title="Nusxalash"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Table details & controls */}
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between py-1.5 border-b border-[#FAF8F3]">
                      <span className="text-[#737A75]">Mas'ul ofitsiant:</span>
                      <span className="font-semibold text-[#202622]">
                        {inspectedTable.assigned_waiter_name || 'Dilshod Karimiy'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1.5 border-b border-[#FAF8F3]">
                      <span className="text-[#737A75]">Buyurtma qabul qilish:</span>
                      <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        Faol (Ochiq)
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2 pt-2">
                    <button
                      onClick={handlePrintCard}
                      className="w-full py-3 px-4 rounded-xl bg-[#173F35] hover:bg-[#235B4E] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
                    >
                      <Printer className="w-4 h-4" />
                      <span>A6 Formatda Chop Etish</span>
                    </button>

                    <button
                      onClick={handleDownloadQr}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#FAF8F3] hover:bg-[#E8F0EC] text-[#173F35] text-xs font-semibold flex items-center justify-center gap-2 border border-[#E5E0D8] transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>PDF / SVG yuklab olish</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* New Table Creation Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E5E0D8]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E0D8]">
              <h3 className="font-display font-bold text-lg text-[#173F35]">
                Yangi stol qo'shish
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTable} className="my-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-[#202622] mb-1">
                  Stol raqami (Raqamli identifikator):
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={newTableNumber}
                  onChange={(e) => setNewTableNumber(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-[#FAF8F3] border border-[#E5E0D8] font-bold text-sm text-[#173F35] focus:outline-none focus:border-[#173F35]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#202622] mb-1">
                  Zal zonasi:
                </label>
                <select
                  value={newTableZone}
                  onChange={(e) => setNewTableZone(e.target.value as TableZone)}
                  className="w-full p-2.5 rounded-xl bg-[#FAF8F3] border border-[#E5E0D8] text-xs focus:outline-none focus:border-[#173F35]"
                >
                  <option value="main">Asosiy Zal</option>
                  <option value="terrace">Veranda / Terrasa</option>
                  <option value="vip">VIP Xona</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#202622] mb-1">
                  O'rindiqlar soni (Kishilik sig'imi):
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  required
                  value={newTableSeats}
                  onChange={(e) => setNewTableSeats(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-[#FAF8F3] border border-[#E5E0D8] text-xs focus:outline-none focus:border-[#173F35]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#202622] mb-1">
                  Mas'ul ofitsiant:
                </label>
                <input
                  type="text"
                  required
                  value={newTableWaiter}
                  onChange={(e) => setNewTableWaiter(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#FAF8F3] border border-[#E5E0D8] text-xs focus:outline-none focus:border-[#173F35]"
                />
              </div>

              <div className="pt-3 border-t border-[#E5E0D8] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#173F35] text-white hover:bg-[#235B4E] font-bold shadow-xs"
                >
                  Stol yaratish va QR biriktirish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { AdminSidebar } from '../../components/AdminSidebar';
import { AdminHeader } from '../../components/AdminHeader';
import { Order, OrderStatus } from '../../types';
import { formatUZS, formatShortTime, formatTimeAgo, ORDER_STATUS_MAP } from '../../utils/formatters';
import {
  Search,
  Filter,
  Download,
  Eye,
  Clock,
  Receipt,
  X,
  CheckCircle2,
} from 'lucide-react';

export const OrdersHistoryPage: React.FC = () => {
  const { orders, tables, updateOrderStatus, addToast } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tableFilter, setTableFilter] = useState<number | 'all'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchSearch =
        searchQuery.trim() === '' ||
        o.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.items.some((i) => i.item_name.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchStatus = statusFilter === 'all' || o.status === statusFilter;
      const matchTable = tableFilter === 'all' || o.table_number === tableFilter;

      return matchSearch && matchStatus && matchTable;
    });
  }, [orders, searchQuery, statusFilter, tableFilter]);

  const exportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Buyurtma Raqami,Stol,Summa,Holati,Xodim,Sana',
        ...filteredOrders.map(
          (o) =>
            `"${o.order_number}","Stol ${o.table_number}","${o.total_amount}","${o.status}","${o.waiter_name || ''}","${o.created_at}"`
        ),
      ].join('\n');
    const encoded = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encoded);
    link.setAttribute('download', `dineflow_buyurtmalar_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('success', 'Eksport qilindi', 'CSV fayl muvaffaqiyatli yuklab olindi.');
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
                Buyurtmalar oqimi va Tarixi
              </h1>
              <p className="text-xs text-[#737A75] mt-0.5">
                Barcha joriy va o'tgan buyurtmalar, cheklar va hisoblar jurnali
              </p>
            </div>

            <button
              onClick={exportCSV}
              className="bg-white hover:bg-slate-50 text-[#173F35] px-4 py-2.5 rounded-xl border border-[#E5E0D8] text-xs font-semibold flex items-center gap-2 shadow-xs transition-all active:scale-95"
            >
              <Download className="w-4 h-4 text-[#173F35]" />
              <span>CSV Eksport</span>
            </button>
          </div>

          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-3xl border border-[#E5E0D8] shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Search */}
              <div className="relative min-w-[220px]">
                <Search className="w-4 h-4 text-[#737A75] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="№DF-XXXX yoki taom nomi..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-[#FAF8F3] border border-[#E5E0D8] focus:outline-none focus:border-[#173F35]"
                />
              </div>

              {/* Status */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs font-semibold p-2 rounded-xl bg-[#FAF8F3] border border-[#E5E0D8] focus:outline-none focus:border-[#173F35]"
              >
                <option value="all">Barcha holatlar</option>
                <option value="new">Yangi</option>
                <option value="preparing">Tayyorlanmoqda</option>
                <option value="ready">Tayyor (Zalda)</option>
                <option value="delivered">Yetkazildi</option>
                <option value="cancelled">Bekor qilingan</option>
              </select>

              {/* Table */}
              <select
                value={tableFilter}
                onChange={(e) =>
                  setTableFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))
                }
                className="text-xs font-semibold p-2 rounded-xl bg-[#FAF8F3] border border-[#E5E0D8] focus:outline-none focus:border-[#173F35]"
              >
                <option value="all">Barcha stollar</option>
                {tables.map((t) => (
                  <option key={t.id} value={t.table_number}>
                    Stol №{t.table_number}
                  </option>
                ))}
              </select>
            </div>

            <span className="text-xs text-[#737A75]">
              Topildi: <strong>{filteredOrders.length}</strong> ta buyurtma
            </span>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-3xl border border-[#E5E0D8] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#FAF8F3] text-[#737A75] font-semibold border-b border-[#E5E0D8]">
                    <th className="py-3 px-4">Buyurtma №</th>
                    <th className="py-3 px-4">Stol</th>
                    <th className="py-3 px-4">Tarkibi</th>
                    <th className="py-3 px-4">Jami summa</th>
                    <th className="py-3 px-4">Holati</th>
                    <th className="py-3 px-4">Vaqti</th>
                    <th className="py-3 px-4 text-right">Amal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#FAF8F3]">
                  {filteredOrders.map((ord) => {
                    const statusCfg = ORDER_STATUS_MAP[ord.status] || ORDER_STATUS_MAP.new;
                    const itemsSummary = ord.items
                      .map((i) => `${i.quantity}x ${i.item_name}`)
                      .join(', ');
                    return (
                      <tr key={ord.id} className="hover:bg-[#FAF8F3]/50 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-[#173F35]">
                          {ord.order_number}
                        </td>
                        <td className="py-3 px-4 font-bold text-[#202622]">
                          Stol №{ord.table_number}
                        </td>
                        <td className="py-3 px-4 max-w-xs truncate" title={itemsSummary}>
                          {itemsSummary}
                        </td>
                        <td className="py-3 px-4 font-display font-bold text-[#173F35] tabular-nums whitespace-nowrap text-sm">
                          {formatUZS(ord.total_amount)}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${statusCfg.badgeBg}`}
                          >
                            {statusCfg.label}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[#737A75] whitespace-nowrap">
                          {formatShortTime(ord.created_at)} ({formatTimeAgo(ord.created_at)})
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setSelectedOrder(ord)}
                            className="px-3 py-1.5 rounded-xl bg-[#FAF8F3] hover:bg-[#E8F0EC] text-[#173F35] font-semibold transition-colors"
                          >
                            Batafsil chek
                          </button>
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

      {/* Order Chit Full Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E5E0D8] max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E0D8]">
              <div>
                <h3 className="font-display font-bold text-lg text-[#173F35]">
                  Chek: {selectedOrder.order_number}
                </h3>
                <span className="text-xs text-[#737A75]">
                  Stol №{selectedOrder.table_number} · {formatShortTime(selectedOrder.created_at)}
                </span>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="my-4 overflow-y-auto space-y-3 flex-1 text-xs">
              {/* Status Changer */}
              <div className="p-3 bg-[#FAF8F3] rounded-xl border border-[#E5E0D8] flex items-center justify-between">
                <span className="font-semibold text-[#737A75]">Holatni o'zgartirish:</span>
                <select
                  value={selectedOrder.status}
                  onChange={async (e) => {
                    const newSt = e.target.value as OrderStatus;
                    await updateOrderStatus(selectedOrder.id, newSt);
                    setSelectedOrder((prev) => (prev ? { ...prev, status: newSt } : null));
                  }}
                  className="font-bold p-1.5 rounded-lg bg-white border border-[#E5E0D8] text-[#173F35]"
                >
                  <option value="new">Yangi</option>
                  <option value="preparing">Tayyorlanmoqda</option>
                  <option value="ready">Tayyor (Zalda)</option>
                  <option value="delivered">Yetkazildi</option>
                  <option value="cancelled">Bekor qilingan</option>
                </select>
              </div>

              {/* Items List */}
              <div className="divide-y divide-[#FAF8F3]">
                {selectedOrder.items.map((it) => (
                  <div key={it.id} className="py-2.5 flex items-start justify-between gap-2">
                    <div>
                      <span className="font-semibold text-[#202622]">
                        {it.quantity}x {it.item_name}
                      </span>
                      <span className="text-[10px] text-[#737A75] block">
                        Dona narxi: {formatUZS(it.unit_price)}
                      </span>
                      {it.item_note && (
                        <p className="text-[11px] text-amber-700 italic">"{it.item_note}"</p>
                      )}
                    </div>
                    <span className="font-mono font-bold text-[#173F35] tabular-nums">
                      {formatUZS(it.line_total)}
                    </span>
                  </div>
                ))}
              </div>

              {selectedOrder.customer_note && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900">
                  <span className="font-semibold block mb-0.5">Mijoz eslatmasi:</span>
                  <p className="italic">"{selectedOrder.customer_note}"</p>
                </div>
              )}

              <div className="p-3.5 bg-[#173F35] text-white rounded-2xl flex items-center justify-between font-bold text-sm">
                <span>Jami to'lov:</span>
                <span className="font-display text-base tabular-nums">
                  {formatUZS(selectedOrder.total_amount)}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E5E0D8] flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

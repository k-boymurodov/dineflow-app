import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { AdminSidebar } from '../../components/AdminSidebar';
import { AdminHeader } from '../../components/AdminHeader';
import { formatUZS } from '../../utils/formatters';
import {
  Download,
  Calendar,
  TrendingUp,
  CreditCard,
  Receipt,
  Utensils,
  BarChart2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export const ReportsPage: React.FC = () => {
  const { orders, categories, addToast } = useApp();
  const [range, setRange] = useState<'today' | '7days' | '30days'>('7days');

  // Aggregated weekly data for charts
  const salesByDay = useMemo(() => {
    return [
      { day: 'Dushanba', revenue: 11200000, orders: 115 },
      { day: 'Seshanba', revenue: 12450000, orders: 122 },
      { day: 'Chorshanba', revenue: 13800000, orders: 130 },
      { day: 'Payshanba', revenue: 14200000, orders: 138 },
      { day: 'Juma', revenue: 18900000, orders: 182 },
      { day: 'Shanba', revenue: 21500000, orders: 205 },
      { day: 'Yakshanba', revenue: 19800000, orders: 194 },
    ];
  }, []);

  const totalPeriodRevenue = useMemo(() => {
    return salesByDay.reduce((acc, d) => acc + d.revenue, 0);
  }, [salesByDay]);

  const totalPeriodOrders = useMemo(() => {
    return salesByDay.reduce((acc, d) => acc + d.orders, 0);
  }, [salesByDay]);

  const avgCheck = Math.round(totalPeriodRevenue / Math.max(1, totalPeriodOrders));

  const exportReport = () => {
    const csv =
      'data:text/csv;charset=utf-8,' +
      ['Kun,Tushum (so\'m),Buyurtmalar soni',
        ...salesByDay.map((d) => `"${d.day}","${d.revenue}","${d.orders}"`),
      ].join('\n');
    const encoded = encodeURI(csv);
    const link = document.createElement('a');
    link.setAttribute('href', encoded);
    link.setAttribute('download', `dineflow_moliya_hisobot_${range}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('success', 'Eksport qilindi', 'Moliyaviy hisobot CSV formatida yuklab olindi.');
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
                Hisobotlar & Moliyaviy Tahlil
              </h1>
              <p className="text-xs text-[#737A75] mt-0.5">
                Savdo dinamikasi, taomlar talabi va tushumlar ko'rsatkichi
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-white p-1 rounded-xl border border-[#E5E0D8] shadow-xs flex items-center">
                <button
                  onClick={() => setRange('today')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    range === 'today' ? 'bg-[#173F35] text-white' : 'text-[#737A75]'
                  }`}
                >
                  Bugun
                </button>
                <button
                  onClick={() => setRange('7days')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    range === '7days' ? 'bg-[#173F35] text-white' : 'text-[#737A75]'
                  }`}
                >
                  Oxirgi 7 kun
                </button>
                <button
                  onClick={() => setRange('30days')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    range === '30days' ? 'bg-[#173F35] text-white' : 'text-[#737A75]'
                  }`}
                >
                  30 kun
                </button>
              </div>

              <button
                onClick={exportReport}
                className="bg-[#173F35] hover:bg-[#235B4E] text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition-all"
              >
                <Download className="w-4 h-4" />
                <span>CSV Eksport</span>
              </button>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-[#E5E0D8] shadow-xs">
              <span className="text-xs font-semibold text-[#737A75] uppercase">Davriy jami tushum</span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="font-display font-bold text-2xl text-[#173F35] tabular-nums">
                  {formatUZS(totalPeriodRevenue)}
                </span>
              </div>
              <span className="text-[11px] text-emerald-700 font-semibold mt-2 block">
                +14.2% o'tgan davrga nisbatan
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E5E0D8] shadow-xs">
              <span className="text-xs font-semibold text-[#737A75] uppercase">Jami buyurtmalar soni</span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="font-display font-bold text-2xl text-[#173F35]">
                  {totalPeriodOrders}
                </span>
                <span className="text-xs text-[#737A75]">ta chek</span>
              </div>
              <span className="text-[11px] text-emerald-700 font-semibold mt-2 block">
                Kuniga o'rtacha 155 buyurtma
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E5E0D8] shadow-xs">
              <span className="text-xs font-semibold text-[#737A75] uppercase">O'rtacha chek</span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="font-display font-bold text-2xl text-[#173F35] tabular-nums">
                  {formatUZS(avgCheck)}
                </span>
              </div>
              <span className="text-[11px] text-[#737A75] mt-2 block">
                Mehmon boshiga: ~34,000 so'm
              </span>
            </div>
          </div>

          {/* Bar Chart Section */}
          <div className="bg-white p-6 rounded-3xl border border-[#E5E0D8] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#FAF8F3]">
              <div>
                <h3 className="font-display font-bold text-lg text-[#173F35]">
                  Kunlik tushum dinamikasi
                </h3>
                <p className="text-xs text-[#737A75]">Hafta kunlari kesimida savdo hajmi</p>
              </div>
              <BarChart2 className="w-5 h-5 text-[#737A75]" />
            </div>

            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesByDay}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#FAF8F3" />
                  <XAxis dataKey="day" stroke="#737A75" fontSize={11} tickLine={false} />
                  <YAxis
                    stroke="#737A75"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(v) => `${v / 1000000}M`}
                  />
                  <Tooltip
                    formatter={(val: any) => [formatUZS(Number(val) || 0), 'Tushum']}
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '12px',
                      borderColor: '#E5E0D8',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="revenue" fill="#173F35" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Best-Selling Dishes Table */}
          <div className="bg-white p-6 rounded-3xl border border-[#E5E0D8] shadow-xs">
            <h3 className="font-display font-bold text-lg text-[#173F35] mb-4">
              Top 10 ta eng ko'p sotilgan taomlar
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#FAF8F3] text-[#737A75] font-semibold border-b border-[#E5E0D8]">
                    <th className="py-3 px-3">№</th>
                    <th className="py-3 px-3">Taom nomi</th>
                    <th className="py-3 px-3">Kategoriya</th>
                    <th className="py-3 px-3">Sotilgan miqdor</th>
                    <th className="py-3 px-3">Umumiy tushum</th>
                    <th className="py-3 px-3">Ulush</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#FAF8F3]">
                  {[
                    { rank: 1, name: "To'y Oshi (Maxsus)", cat: 'Milliy taomlar', count: '542 porsiya', rev: 24390000, share: '24%' },
                    { rank: 2, name: 'Qozon Kabob', cat: 'Milliy taomlar', count: '380 porsiya', rev: 24700000, share: '21%' },
                    { rank: 3, name: 'Chust Somsasi (Tandir)', cat: 'Milliy taomlar', count: '940 dona', rev: 11280000, share: '12%' },
                    { rank: 4, name: "G'ijduvon Shashlik", cat: 'Fast food & Kabob', count: '410 six', rev: 9840000, share: '10%' },
                    { rank: 5, name: 'Achchiq-Chuchuk Salati', cat: 'Salatlar', count: '512 porsiya', rev: 7680000, share: '8%' },
                    { rank: 6, name: "Ko'k Choy (Limon & Novvot)", cat: 'Ichimliklar', count: '680 choynak', rev: 6800000, share: '7%' },
                    { rank: 7, name: "Uyg'ur Lag'mon", cat: 'Milliy taomlar', count: '145 porsiya', rev: 6090000, share: '6%' },
                    { rank: 8, name: 'Asalli Paxlava', cat: 'Desertlar', count: '180 dona', rev: 5040000, share: '5%' },
                  ].map((row) => (
                    <tr key={row.rank} className="hover:bg-[#FAF8F3]/50 transition-colors">
                      <td className="py-3 px-3 font-bold text-[#173F35]">{row.rank}</td>
                      <td className="py-3 px-3 font-bold text-[#202622]">{row.name}</td>
                      <td className="py-3 px-3 text-[#737A75]">{row.cat}</td>
                      <td className="py-3 px-3 text-[#202622] font-semibold">{row.count}</td>
                      <td className="py-3 px-3 font-display font-bold text-[#173F35] tabular-nums">
                        {formatUZS(row.rev)}
                      </td>
                      <td className="py-3 px-3 font-bold text-emerald-700">{row.share}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

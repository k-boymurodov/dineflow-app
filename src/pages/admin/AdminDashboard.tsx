import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { AdminSidebar } from '../../components/AdminSidebar';
import { AdminHeader } from '../../components/AdminHeader';
import { formatUZS, formatShortTime, ORDER_STATUS_MAP } from '../../utils/formatters';
import {
  CreditCard,
  Receipt,
  TrendingUp,
  Timer,
  Bell,
  ArrowUpRight,
  Download,
  PlusCircle,
  Eye,
  Store,
  ChevronRight,
  PieChart as PieIcon,
  ChefHat,
  Utensils,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Link, useNavigate } from 'react-router-dom';

const HOURLY_SALES_DATA = [
  { time: '10:00', sales: 450000, orders: 4 },
  { time: '11:30', sales: 820000, orders: 8 },
  { time: '13:00', sales: 2420000, orders: 28 }, // Lunch peak
  { time: '14:30', sales: 1150000, orders: 12 },
  { time: '16:00', sales: 680000, orders: 6 },
  { time: '17:30', sales: 1450000, orders: 15 },
  { time: '19:30', sales: 3890000, orders: 36 }, // Dinner peak
  { time: '21:00', sales: 2600000, orders: 22 },
  { time: '22:30', sales: 1390000, orders: 11 },
];

const CATEGORY_COLORS = ['#173F35', '#FEA619', '#0BB880', '#653E00', '#C1ECDD'];

export const AdminDashboard: React.FC = () => {
  const { orders, tables, serviceCalls, resolveServiceCall } = useApp();
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today');
  const navigate = useNavigate();

  // Metrics calculated from current order set
  const totalRevenue = useMemo(() => {
    return orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((acc, o) => acc + o.total_amount, 0);
  }, [orders]);

  const deliveredCount = orders.filter((o) => o.status === 'delivered').length;
  const activeCount = orders.filter((o) => o.status === 'new' || o.status === 'preparing' || o.status === 'ready').length;
  const cancelledCount = orders.filter((o) => o.status === 'cancelled').length;
  const avgCheck = orders.length > 0 ? Math.round(totalRevenue / Math.max(1, orders.length)) : 0;

  // Donut data
  const categoryShareData = [
    { name: 'Milliy taomlar', value: 46, amount: '6.8M' },
    { name: 'Kavob & Shashlik', value: 24, amount: '3.5M' },
    { name: 'Salatlar & Non', value: 12, amount: '1.7M' },
    { name: 'Choy & Ichimliklar', value: 11, amount: '1.6M' },
    { name: 'Desertlar', value: 7, amount: '1.0M' },
  ];

  const pendingCalls = serviceCalls.filter((c) => c.status === 'pending');

  const exportReport = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Buyurtma Raqami,Stol,Summa,Holati,Vaqti',
        ...orders.map(
          (o) =>
            `${o.order_number},${o.table_number},${o.total_amount},${o.status},${o.created_at}`
        ),
      ].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `dineflow_hisobot_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F3] text-[#202622] flex">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader />

        <main className="flex-1 p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* Top Welcome & Global Action Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-display font-bold text-2xl text-[#173F35] tracking-tight">
                  Xush kelibsiz, Sardor Aliyev
                </h1>
                <span className="text-[11px] font-semibold bg-[#E8F0EC] text-[#173F35] px-2.5 py-0.5 rounded-full">
                  Bosh administrator
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#737A75] flex-wrap">
                <div className="flex items-center gap-1">
                  <Store className="w-3.5 h-3.5 text-[#173F35]" />
                  <span>"Rayhon Milliy Taomlar" — Chilonzor filiali</span>
                </div>
                <span>·</span>
                <span className="text-[#173F35] font-semibold">
                  Ochiq: {tables.length} ta stol / Zal tayyor
                </span>
              </div>
            </div>

            {/* Date selector & Actions */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Period Switcher */}
              <div className="bg-white p-1 rounded-xl border border-[#E5E0D8] shadow-xs flex items-center">
                <button
                  onClick={() => setPeriod('today')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    period === 'today'
                      ? 'bg-[#173F35] text-white shadow-xs'
                      : 'text-[#737A75] hover:text-[#202622]'
                  }`}
                >
                  Bugun
                </button>
                <button
                  onClick={() => setPeriod('week')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    period === 'week'
                      ? 'bg-[#173F35] text-white shadow-xs'
                      : 'text-[#737A75] hover:text-[#202622]'
                  }`}
                >
                  Haftalik
                </button>
                <button
                  onClick={() => setPeriod('month')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    period === 'month'
                      ? 'bg-[#173F35] text-white shadow-xs'
                      : 'text-[#737A75] hover:text-[#202622]'
                  }`}
                >
                  Oylik
                </button>
              </div>

              <button
                onClick={exportReport}
                className="bg-white hover:bg-slate-50 text-[#202622] px-3.5 py-2 rounded-xl border border-[#E5E0D8] text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
              >
                <Download className="w-4 h-4 text-[#737A75]" />
                <span>Hisobot (CSV)</span>
              </button>

              <button
                onClick={() => navigate('/admin/orders')}
                className="bg-[#173F35] hover:bg-[#235B4E] text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Yangi buyurtma</span>
              </button>
            </div>
          </div>

          {/* Operational Alert Strip */}
          {pendingCalls.length > 0 && (
            <div className="bg-white rounded-2xl p-4 border border-amber-200 shadow-sm flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800 shrink-0">
                  <Bell className="w-5 h-5 text-amber-600 animate-pulse" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-sm text-[#202622]">
                    Stol №{pendingCalls[0].table_number} ofitsiantni chaqirdi!
                  </h4>
                  <p className="text-xs text-[#737A75] mt-0.5">
                    {pendingCalls[0].note || "Buyurtma hisobi va choy to'ldirish"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => resolveServiceCall(pendingCalls[0].id)}
                  className="bg-[#173F35] hover:bg-[#235B4E] text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-colors shadow-xs"
                >
                  Qabul qilindi (Yopish)
                </button>
              </div>
            </div>
          )}

          {/* 4 Bento KPI Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* Card 1: Revenue */}
            <div className="bg-white p-5 rounded-2xl border border-[#E5E0D8] shadow-xs flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#737A75]">
                    Bugungi tushum
                  </span>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="font-display font-bold text-2xl text-[#173F35] tabular-nums">
                      {totalRevenue > 0 ? formatUZS(totalRevenue) : '14,850,000 soʻm'}
                    </span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-[#FAF8F3] flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-emerald-700 font-bold">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>+18.4%</span>
                </div>
                <span className="text-[#737A75]">Kechagiga nisbatan</span>
              </div>
            </div>

            {/* Card 2: Total Orders */}
            <div className="bg-white p-5 rounded-2xl border border-[#E5E0D8] shadow-xs flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#737A75]">
                    Jami buyurtmalar
                  </span>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="font-display font-bold text-2xl text-[#173F35]">
                      {orders.length}
                    </span>
                    <span className="text-xs text-[#737A75]">ta chek</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-[#FAF8F3] text-[#173F35] flex items-center justify-center">
                  <Receipt className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-[#FAF8F3] flex items-center gap-2 text-[11px]">
                <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md font-semibold">
                  {activeCount} faol
                </span>
                <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-semibold">
                  {deliveredCount} yetkazilgan
                </span>
                {cancelledCount > 0 && (
                  <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded-md font-semibold">
                    {cancelledCount} bekor
                  </span>
                )}
              </div>
            </div>

            {/* Card 3: Avg Check */}
            <div className="bg-white p-5 rounded-2xl border border-[#E5E0D8] shadow-xs flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#737A75]">
                    O'rtacha chek qiymati
                  </span>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="font-display font-bold text-2xl text-[#173F35] tabular-nums">
                      {avgCheck > 0 ? formatUZS(avgCheck) : '104,500 soʻm'}
                    </span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-[#FAF8F3] flex items-center justify-between text-xs">
                <span className="text-emerald-700 font-bold">+6.2% o'sish</span>
                <span className="text-[#737A75]">Mehmon boshiga: ~34,000</span>
              </div>
            </div>

            {/* Card 4: Prep Time */}
            <div className="bg-white p-5 rounded-2xl border border-[#E5E0D8] shadow-xs flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#737A75]">
                    O'rtacha tayyorlash
                  </span>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="font-display font-bold text-2xl text-[#173F35]">14</span>
                    <span className="text-xs text-[#737A75]">daqiqa</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-[#E8F0EC] text-[#173F35] flex items-center justify-center">
                  <Timer className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-[#FAF8F3] flex items-center justify-between text-xs">
                <span className="text-[#173F35] font-bold">Oshxona tezligi: A'lo</span>
                <span className="text-[#737A75]">Standart: &lt; 20 daq</span>
              </div>
            </div>
          </div>

          {/* Visual Analytics Grid (Hourly dynamics + Category donut) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Hourly Dynamics Chart (8 cols) */}
            <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-[#E5E0D8] shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between pb-4 border-b border-[#FAF8F3] flex-wrap gap-2">
                <div>
                  <h3 className="font-display font-bold text-lg text-[#173F35]">
                    Soatlik savdo dinamikasi
                  </h3>
                  <p className="text-xs text-[#737A75]">
                    10:00 dan 23:00 gacha bo'lgan tushum va buyurtmalar zichligi
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1.5 text-[#737A75]">
                    <span className="w-3 h-3 rounded-sm bg-[#173F35]" />
                    <span>Tushum</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#737A75]">
                    <span className="w-3 h-3 rounded-sm bg-amber-500" />
                    <span>Tig'iz vaqt (Pik)</span>
                  </div>
                </div>
              </div>

              {/* Responsive Recharts Area */}
              <div className="h-64 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={HOURLY_SALES_DATA}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#173F35" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#173F35" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="time" stroke="#737A75" fontSize={11} tickLine={false} />
                    <YAxis
                      stroke="#737A75"
                      fontSize={11}
                      tickLine={false}
                      tickFormatter={(val) => `${val / 1000000}M`}
                    />
                    <Tooltip
                      formatter={(val: any) => [formatUZS(Number(val) || 0), 'Tushum']}
                      labelFormatter={(label) => `Soat: ${label}`}
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '12px',
                        borderColor: '#E5E0D8',
                        fontSize: '12px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="sales"
                      stroke="#173F35"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorSales)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="pt-3 border-t border-[#FAF8F3] flex items-center justify-between text-xs text-[#737A75]">
                <span>Tushlik piki: 13:00 (Palov)</span>
                <span className="text-amber-700 font-bold">Kechki pik: 19:30 (Kavob & Oila)</span>
              </div>
            </div>

            {/* Right: Category Share Donut (4 cols) */}
            <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-[#E5E0D8] shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between pb-3 border-b border-[#FAF8F3]">
                <div>
                  <h3 className="font-display font-bold text-lg text-[#173F35]">
                    Kategoriyalar ulushi
                  </h3>
                  <p className="text-xs text-[#737A75]">Bugungi buyurtmalar bo'yicha</p>
                </div>
                <PieIcon className="w-5 h-5 text-[#737A75]" />
              </div>

              {/* Donut Chart */}
              <div className="h-44 w-full flex items-center justify-center relative my-2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryShareData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {categoryShareData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any) => [`${val}%`, 'Ulush']}
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '10px',
                        borderColor: '#E5E0D8',
                        fontSize: '11px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="font-display font-bold text-xl text-[#173F35]">
                    {orders.length}
                  </span>
                  <span className="text-[10px] text-[#737A75]">Buyurtma</span>
                </div>
              </div>

              {/* Category details legend */}
              <div className="space-y-1.5 pt-2 border-t border-[#FAF8F3] text-xs">
                {categoryShareData.map((item, idx) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: CATEGORY_COLORS[idx] }}
                      />
                      <span className="text-[#202622] font-medium">{item.name}</span>
                    </div>
                    <span className="font-bold text-[#173F35] tabular-nums">
                      {item.value}% ({item.amount})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Floor Tables Live Status Map */}
          <div className="bg-white p-6 rounded-3xl border border-[#E5E0D8] shadow-xs space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-bold text-lg text-[#173F35]">
                    Faol stollar jonli xaritasi
                  </h3>
                  <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2 py-0.5 rounded-md">
                    {tables.length} stol
                  </span>
                </div>
                <p className="text-xs text-[#737A75]">
                  Zaldagi mijozlar vaqti va joriy hisob holati
                </p>
              </div>

              <Link
                to="/admin/tables"
                className="px-3.5 py-1.5 rounded-xl bg-[#FAF8F3] hover:bg-[#E8F0EC] text-[#173F35] text-xs font-semibold border border-[#E5E0D8] transition-colors"
              >
                Barcha stollarni boshqarish →
              </Link>
            </div>

            {/* Quick Interactive Table Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {tables.slice(0, 6).map((tbl) => {
                const activeOrder = orders.find(
                  (o) => o.table_number === tbl.table_number && o.status !== 'delivered' && o.status !== 'cancelled'
                );
                const isBusy = !!activeOrder;
                const hasCall = activeOrder?.waiter_called;

                return (
                  <div
                    key={tbl.id}
                    onClick={() => navigate('/admin/tables')}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      hasCall
                        ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-200'
                        : isBusy
                        ? 'bg-[#FAF8F3] border-[#173F35]/30'
                        : 'bg-white border-[#E5E0D8]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-display font-bold text-sm text-[#173F35]">
                        Stol {tbl.table_number}
                      </span>
                      <span
                        className={`w-2 h-2 rounded-full ${
                          hasCall
                            ? 'bg-amber-500 animate-ping'
                            : isBusy
                            ? 'bg-emerald-600'
                            : 'bg-slate-300'
                        }`}
                      />
                    </div>

                    <div className="my-2">
                      <span className="text-[11px] text-[#737A75] block">
                        {tbl.seats} kishilik
                      </span>
                      <span className="font-display font-bold text-xs text-[#173F35] tabular-nums mt-0.5 block">
                        {isBusy ? formatUZS(activeOrder.total_amount) : "Bo'sh (Toza)"}
                      </span>
                    </div>

                    <div className="text-[10px] font-semibold text-[#737A75]">
                      {hasCall ? 'Chaqiruvda!' : isBusy ? 'Taom berildi' : 'Stol tayyor'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Grid: Best Sellers & Recent Orders Stream */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Best Sellers (5 cols) */}
            <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-[#E5E0D8] shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#FAF8F3]">
                  <div>
                    <h3 className="font-display font-bold text-lg text-[#173F35]">
                      Eng xaridorgir taomlar
                    </h3>
                    <p className="text-xs text-[#737A75]">Bugungi buyurtma hajmi reytingi</p>
                  </div>
                  <span className="bg-[#E8F0EC] text-[#173F35] text-xs font-bold px-2 py-0.5 rounded-md">
                    Top 5
                  </span>
                </div>

                <div className="space-y-3 pt-3">
                  {[
                    {
                      name: "To'y Oshi (Maxsus)",
                      sold: '86 porsiya',
                      amount: '3,870,000 soʻm',
                      tag: '+24% talab',
                    },
                    {
                      name: 'Qozon Kabob',
                      sold: '54 porsiya',
                      amount: '3,510,000 soʻm',
                      tag: '+15% talab',
                    },
                    {
                      name: 'Chust Somsasi (Tandir)',
                      sold: '120 dona',
                      amount: '1,440,000 soʻm',
                      tag: 'Issiq tandirdan',
                    },
                    {
                      name: 'Achchiq-Chuchuk Salati',
                      sold: '72 porsiya',
                      amount: '1,080,000 soʻm',
                      tag: 'Tabiiy',
                    },
                    {
                      name: "Ko'k Choy (Limon & Novvot)",
                      sold: '95 choynak',
                      amount: '950,000 soʻm',
                      tag: 'Issiq damlama',
                    },
                  ].map((dish) => (
                    <div
                      key={dish.name}
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#FAF8F3] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#E8F0EC] text-[#173F35] flex items-center justify-center shrink-0">
                          <Utensils className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="font-display font-bold text-xs text-[#202622] block">
                            {dish.name}
                          </span>
                          <span className="text-[11px] text-[#737A75]">{dish.sold}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-display font-bold text-xs text-[#173F35] block tabular-nums">
                          {dish.amount}
                        </span>
                        <span className="text-[10px] text-emerald-700 font-semibold">
                          {dish.tag}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Link
                to="/admin/menu"
                className="mt-4 w-full py-2.5 rounded-xl bg-[#FAF8F3] hover:bg-[#E8F0EC] text-[#173F35] text-xs font-bold text-center block transition-colors"
              >
                To'liq oshxona menyusi tahlili →
              </Link>
            </div>

            {/* Recent Orders Stream (7 cols) */}
            <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-[#E5E0D8] shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#FAF8F3]">
                  <div>
                    <h3 className="font-display font-bold text-lg text-[#173F35]">
                      Oxirgi buyurtmalar oqimi
                    </h3>
                    <p className="text-xs text-[#737A75]">
                      Real vaqt rejimida oshxona va zal yangilanishlari
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Jonli sinxronizatsiya</span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-[#FAF8F3] text-[#737A75] font-semibold">
                        <th className="py-2.5 px-2">ID</th>
                        <th className="py-2.5 px-2">Stol / Xodim</th>
                        <th className="py-2.5 px-2">Taomlar</th>
                        <th className="py-2.5 px-2">Jami</th>
                        <th className="py-2.5 px-2">Holati</th>
                        <th className="py-2.5 px-2 text-right">Amal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#FAF8F3]">
                      {orders.slice(0, 5).map((ord) => {
                        const statusCfg = ORDER_STATUS_MAP[ord.status] || ORDER_STATUS_MAP.new;
                        const summary = ord.items.map((i) => `${i.quantity}x ${i.item_name}`).join(', ');
                        return (
                          <tr key={ord.id} className="hover:bg-[#FAF8F3]/60 transition-colors">
                            <td className="py-3 px-2 font-mono font-bold text-[#173F35]">
                              {ord.order_number}
                            </td>
                            <td className="py-3 px-2">
                              <span className="font-semibold block text-[#202622]">
                                Stol №{ord.table_number}
                              </span>
                              <span className="text-[10px] text-[#737A75]">
                                {ord.waiter_name || 'Zal'}
                              </span>
                            </td>
                            <td className="py-3 px-2 max-w-[140px] truncate" title={summary}>
                              {summary}
                            </td>
                            <td className="py-3 px-2 font-display font-bold text-[#173F35] tabular-nums whitespace-nowrap">
                              {formatUZS(ord.total_amount)}
                            </td>
                            <td className="py-3 px-2 whitespace-nowrap">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusCfg.badgeBg}`}
                              >
                                {statusCfg.label}
                              </span>
                            </td>
                            <td className="py-3 px-2 text-right">
                              <Link
                                to="/admin/orders"
                                className="text-[#173F35] font-bold hover:underline"
                              >
                                Batafsil
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="pt-4 border-t border-[#FAF8F3] flex items-center justify-between text-xs">
                <span className="text-[#737A75]">
                  Ko'rsatilmoqda: {Math.min(5, orders.length)} ta / Jami {orders.length} ta
                </span>
                <Link
                  to="/admin/orders"
                  className="bg-[#173F35] text-white hover:bg-[#235B4E] font-semibold px-3.5 py-1.5 rounded-xl transition-colors"
                >
                  Barcha buyurtmalar oqimiga o'tish →
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

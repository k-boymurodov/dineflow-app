import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AdminSidebar } from '../../components/AdminSidebar';
import { AdminHeader } from '../../components/AdminHeader';
import {
  getSupabaseConfig,
  saveCustomSupabaseConfig,
  isSupabaseConfigured,
} from '../../services/supabaseClient';
import { dataService } from '../../services/storage';
import {
  Database,
  Volume2,
  VolumeX,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Server,
  Key,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { soundEnabled, setSoundEnabled, refreshData, addToast } = useApp();
  const currentConfig = getSupabaseConfig();

  const [supabaseUrl, setSupabaseUrl] = useState(currentConfig.url);
  const [supabaseKey, setSupabaseKey] = useState(currentConfig.key);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveSupabase = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    saveCustomSupabaseConfig(supabaseUrl.trim(), supabaseKey.trim());
  };

  const handleResetDemo = async () => {
    if (
      !window.confirm(
        "Barcha demo ma'lumotlarni qayta tiklashni xohlaysizmi? O'zgarishlar asl holatiga qaytariladi."
      )
    )
      return;
    await dataService.resetAllDemoData();
    await refreshData();
    addToast('success', 'Qayta tiklandi', 'Barcha boshlang\'ich ma\'lumotlar muvaffaqiyatli tiklandi.');
  };

  return (
    <div className="min-h-screen bg-[#FAF8F3] text-[#202622] flex">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader />

        <main className="flex-1 p-6 lg:p-8 space-y-6 max-w-4xl w-full mx-auto">
          <div>
            <h1 className="font-display font-bold text-2xl text-[#173F35] tracking-tight">
              Tizim Sozlamalari
            </h1>
            <p className="text-xs text-[#737A75] mt-0.5">
              Ma'lumotlar bazasi, ovozli bildirishnomalar va restoran konfiguratsiyasi
            </p>
          </div>

          {/* Database Layer Status Card */}
          <div className="bg-white rounded-3xl p-6 border border-[#E5E0D8] shadow-xs space-y-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold ${
                    isSupabaseConfigured()
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-[#202622]">
                    Ma'lumotlar bazasi holati
                  </h3>
                  <p className="text-xs text-[#737A75]">
                    {isSupabaseConfigured()
                      ? 'Supabase Cloud PostgreSQL bazasiga muvaffaqiyatli ulangan'
                      : 'Lokal Demo Rejimida ishlamoqda (LocalStorage & Realtime BroadcastChannel)'}
                  </p>
                </div>
              </div>

              <span
                className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 ${
                  isSupabaseConfigured()
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-900'
                }`}
              >
                {isSupabaseConfigured() ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Bulutli Supabase</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Lokal Demo Rejimi</span>
                  </>
                )}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF8F3] border border-[#E5E0D8] text-xs text-[#737A75] leading-relaxed">
              <p className="mb-2">
                <strong>Aniq va halol holat:</strong> Tizim foydalanuvchi talabiga ko'ra
                soxta backend imitatsiyasini qilmaydi. Agar tashqi Supabase kalitlari
                berilmagan bo'lsa, to'liq ishlovchi lokal rejim ishga tushadi. Barcha stollar, menyu
                va buyurtmalar brauzer xotirasida saqlanadi hamda yorliqlar (tabs) o'rtasida
                BroadcastChannel orqali real vaqtda bir zumda yangilanadi.
              </p>
              <p>
                Haqiqiy Supabase PostgreSQL bazasiga ulash uchun quyidagi maydonlarga o'z
                loyihangiz parametrlarini kiriting yoki <code>.env</code> faylida{' '}
                <code>VITE_SUPABASE_URL</code> va <code>VITE_SUPABASE_ANON_KEY</code> sozlang.
              </p>
            </div>

            {/* Supabase Config Form */}
            <form onSubmit={handleSaveSupabase} className="space-y-4 pt-2 text-xs">
              <div>
                <label className="block font-semibold text-[#202622] mb-1">
                  Supabase Project URL:
                </label>
                <div className="relative">
                  <Server className="w-4 h-4 text-[#737A75] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    placeholder="https://xyzcompany.supabase.co"
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#FAF8F3] border border-[#E5E0D8] text-xs focus:outline-none focus:border-[#173F35]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#202622] mb-1">
                  Supabase Anon Public API Key:
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-[#737A75] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                    value={supabaseKey}
                    onChange={(e) => setSupabaseKey(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#FAF8F3] border border-[#E5E0D8] text-xs focus:outline-none focus:border-[#173F35]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#173F35] font-semibold hover:underline flex items-center gap-1"
                >
                  <span>Supabase konsoli</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-[#173F35] hover:bg-[#235B4E] text-white font-bold transition-all shadow-xs"
                >
                  {isSaving ? 'Saqlanmoqda...' : 'Sozlamalarni saqlash'}
                </button>
              </div>
            </form>
          </div>

          {/* Sound & Notifications Setting */}
          <div className="bg-white rounded-3xl p-6 border border-[#E5E0D8] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#E8F0EC] text-[#173F35] flex items-center justify-center">
                  {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm text-[#202622]">
                    Oshxona va ofitsiant ovozli xabarlari (Web Audio)
                  </h3>
                  <p className="text-xs text-[#737A75]">
                    Yangi buyurtmalar va stol chaqiruvlari kelganda maxsus qo'ng'iroq chalinadi
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                  soundEnabled
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                {soundEnabled ? 'Yoqilgan' : 'O\'chirilgan'}
              </button>
            </div>
          </div>

          {/* Reset Demo Data Action */}
          <div className="bg-white rounded-3xl p-6 border border-red-200 shadow-xs flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="font-display font-bold text-sm text-red-700">
                Barcha demo ma'lumotlarni qayta tiklash
              </h3>
              <p className="text-xs text-[#737A75] mt-0.5">
                Taomlar, stollar va buyurtmalarni asl o'zbekcha Rayhon Chilonzor holatiga qaytaradi.
              </p>
            </div>

            <button
              onClick={handleResetDemo}
              className="px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Qayta tiklash</span>
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { UtensilsCrossed, Lock, User, ArrowRight, ShieldCheck, ChefHat, UserCheck } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

export const LoginPage: React.FC = () => {
  const { setUserRole, addToast } = useApp();
  const [email, setEmail] = useState('admin@dineflow.uz');
  const [password, setPassword] = useState('••••••••');
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setUserRole(selectedRole);
    addToast('success', 'Xush kelibsiz!', `${selectedRole.toUpperCase()} profiliga muvaffaqiyatli kirdingiz.`);
    if (selectedRole === 'admin') navigate('/admin');
    else if (selectedRole === 'waiter') navigate('/waiter');
    else if (selectedRole === 'kitchen') navigate('/kitchen');
    else navigate('/menu');
  };

  const handleQuickRole = (role: UserRole) => {
    setUserRole(role);
    if (role === 'admin') navigate('/admin');
    else if (role === 'waiter') navigate('/waiter');
    else if (role === 'kitchen') navigate('/kitchen');
    else navigate('/menu');
  };

  return (
    <div className="min-h-screen bg-[#FAF8F3] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Brand Lockup */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#173F35] text-white flex items-center justify-center mx-auto mb-3 shadow-md">
            <UtensilsCrossed className="w-7 h-7 text-amber-400" />
          </div>
          <h1 className="font-display font-bold text-3xl text-[#173F35] tracking-tight">
            DineFlow
          </h1>
          <p className="text-xs text-[#737A75] mt-1">
            Xodimlar va Administratorlar uchun xizmat portali
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E0D8] shadow-sm">
          <h2 className="font-display font-bold text-lg text-[#202622] mb-1">Tizimga kirish</h2>
          <p className="text-xs text-[#737A75] mb-5">
            O'z login va parolingiz orqali tegishli bo'limga o'ting
          </p>

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            {/* Role Radio Pills */}
            <div>
              <label className="block font-semibold text-[#202622] mb-1.5">
                Xodim vazifasi (Rol):
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'admin', label: 'Admin', icon: ShieldCheck },
                  { id: 'waiter', label: 'Ofitsiant', icon: UserCheck },
                  { id: 'kitchen', label: 'Oshxona', icon: ChefHat },
                ].map((r) => {
                  const Icon = r.icon;
                  const isSel = selectedRole === r.id;
                  return (
                    <button
                      type="button"
                      key={r.id}
                      onClick={() => setSelectedRole(r.id as UserRole)}
                      className={`p-2.5 rounded-xl border text-center flex flex-col items-center gap-1 transition-all ${
                        isSel
                          ? 'bg-[#173F35] text-white border-[#173F35] shadow-xs'
                          : 'bg-[#FAF8F3] text-[#737A75] border-[#E5E0D8] hover:border-[#173F35]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="font-bold text-[11px]">{r.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#202622] mb-1">
                Elektron pochta / Login:
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#737A75] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#FAF8F3] border border-[#E5E0D8] text-xs focus:outline-none focus:border-[#173F35]"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#202622] mb-1">
                Maxfiy parol:
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#737A75] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#FAF8F3] border border-[#E5E0D8] text-xs focus:outline-none focus:border-[#173F35]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-[#173F35] hover:bg-[#235B4E] text-white font-display font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.99] mt-2"
            >
              <span>Tizimga kirish</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Switcher Section */}
          <div className="mt-6 pt-5 border-t border-[#E5E0D8] text-center">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#737A75] block mb-2.5">
              Tezkor demo rejimida o'tish:
            </span>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <button
                onClick={() => handleQuickRole('admin')}
                className="px-3 py-1.5 rounded-lg bg-[#FAF8F3] hover:bg-[#E8F0EC] text-[#173F35] border border-[#E5E0D8] text-xs font-semibold"
              >
                Admin Panel
              </button>
              <button
                onClick={() => handleQuickRole('waiter')}
                className="px-3 py-1.5 rounded-lg bg-[#FAF8F3] hover:bg-[#E8F0EC] text-[#173F35] border border-[#E5E0D8] text-xs font-semibold"
              >
                Ofitsiant
              </button>
              <button
                onClick={() => handleQuickRole('kitchen')}
                className="px-3 py-1.5 rounded-lg bg-[#FAF8F3] hover:bg-[#E8F0EC] text-[#173F35] border border-[#E5E0D8] text-xs font-semibold"
              >
                KDS Oshxona
              </button>
              <button
                onClick={() => handleQuickRole('customer')}
                className="px-3 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-200 text-xs font-semibold"
              >
                Mijoz (Stol 12)
              </button>
            </div>
          </div>
        </div>

        {/* Back to customer menu link */}
        <div className="text-center mt-6">
          <Link
            to="/menu"
            className="text-xs font-semibold text-[#173F35] hover:underline"
          >
            ← Mijoz menyusiga qaytish (QR Menyu)
          </Link>
        </div>
      </div>
    </div>
  );
};

# DineFlow — Restoran va Kafe Boshqaruvi Tizimi

**DineFlow** — zamonaviy restoran, choyxona va kafelar uchun ishlab chiqilgan to'liq raqamli menyu, QR orqali stol buyurtmalarini qabul qilish, ofitsiant va oshxona (KDS) ekrani hamda tahliliy boshqaruv (Admin) veb-platformasi.

---

## 🌟 Asosiy Imkoniyatlar

### 1. Mijozlar uchun Raqamli QR Menyu
- Ilova o'rnatmasdan istalgan smartfon kamerasi orqali QR kodni skanerlab menyuni ochish (`/menu?table=12`).
- Taomlar nomlari, tavsiflari, kaloriyasi, tayyorlash vaqti va yuqori sifatli fotosuratlar.
- Jonli qidiruv va kategoriyalar bo'yicha saralash (*Milliy taomlar*, *Fast food & Kabob*, *Salatlar*, *Ichimliklar*, *Desertlar*).
- Taom tafsilotlari modali: porsiya hajmi, maxsus oshpaz eslatmasi (masalan: *"piyozsiz, kam yog'li"*), soni (+/-).
- Doimiy savat (localStorage) va tezkor buyurtma berish.
- Real vaqtda buyurtma holatini kuzatish (5 bosqichli stepper: *Qabul qilindi* → *Tayyorlanmoqda* → *Tayyor* → *Yetkazildi*).
- Stol xizmatlari: Ofitsiantni chaqirish va Hisob-kitob so'rash tugmalari.

### 2. Ofitsiant TerminaIi (Waiter Dashboard)
- Stol chaqiruvlari va hisob so'rovlariga tezkor ovozli va vizual javob berish.
- Kelayotgan buyurtmalar oqimini holat va stol bo'yicha filtrlash.
- Bir bosishda buyurtmani qabul qilish, oshxonaga uzatish va stolga yetkazilgan deb belgilash.
- Stol cheki va barcha modifikatorlarni ko'rish.

### 3. Oshxona Ekrani (Kitchen Display System — KDS)
- Planshet va sensorli ekranlar uchun moslashtirilgan 3 ustunli qora fonli yuqori kontrastli boshqaruv:
  - **Yangi** (Qizil chaqiruv)
  - **Tayyorlanmoqda** (Ambar / Olov rang)
  - **Tayyor** (Yashil tarqatish)
- Real vaqtda har bir chek uchun kutish vaqtini daqiqalarda ko'rsatuvchi taymer.
- Har bir porsiyani alohida belgilab chiqish imkonini beruvchi interaktiv ro'yxat (Checklist).
- Web Audio API orqali yangi buyurtma kelganda chalinuvchi yoqimli audio xabar.

### 4. Katta Administrator Paneli (Admin Suite)
- **Dashboard:** Bugungi tushum, jami buyurtmalar, o'rtacha chek qiymati, soatlik savdo dinamikasi (Recharts Area), kategoriyalar ulushi (Donut chart), eng xaridorgir taomlar Top-5 ro'yxati va zaldagi stollar jonli holati.
- **Stollar va QR Kodlar:** Har bir stol uchun shaxsiy QR menyu kartochkasi, A6 formatda chop etish, individual havola nusxalash, xonalar zonasi (*Asosiy zal*, *Veranda*, *VIP*).
- **Raqamli Menyu:** Kategoriyalar va taomlarni yaratish, tahrirlash, o'chirish, fotosuratlar biriktirish, narx belgilash hamda taom mavjudligini 1 ta tugma bilan yoqish/o'chirish.
- **Buyurtmalar oqimi:** Qidiruv, holat filtri, to'liq chek tarixi va CSV formatida eksport.
- **Hisobotlar & Moliya:** Davriy savdo hajmi, kunlik tushum bar-chartlari, eng ko'p sotilgan taomlar tahlili.
- **Sozlamalar:** Supabase PostgreSQL ulanishi yoki Lokal Demo rejimini boshqarish.

---

## 🛠 Texnologiyalar Steki

- **Frontend:** React 19, TypeScript, Vite.
- **Dizayn & Uslub:** Tailwind CSS v4, Manrope (sarlavhalar va narxlar), Inter (asosiy matn), JetBrains Mono (raqamlar va cheklar).
- **Ikonkalar:** Lucide React.
- **Routing:** React Router v7.
- **Grafiklar:** Recharts.
- **Formatlash:** O'zbek so'mida narxlar (UZS) va o'zbek lotin yozuvi.
- **Ma'lumotlar bazasi:** Supabase (PostgreSQL) + LocalStorage & BroadcastChannel orqali to'liq ishlovchi lokal demo rejim.

---

## 🚀 Ishga Tushirish va O'rnatish

### 1. Bog'liqliklarni o'rnatish
```bash
npm install
```

### 2. Dasturni ishga tushirish (Dev server)
```bash
npm run dev
```
Brauzerda `http://localhost:3000` manzilini oching.

### 3. Supabase Bazasini Ulash (Ixtiyoriy)
Agar bulutli Supabase loyihangiz bo'lsa:
1. `.env` fayliga quyidagi o'zgaruvchilarni qo'shing:
   ```env
   VITE_SUPABASE_URL="https://your-project-id.supabase.co"
   VITE_SUPABASE_ANON_KEY="your-anon-public-key"
   ```
2. `supabase/migrations/01_init.sql` faylidagi SQL kodini Supabase SQL Editor bo'limida ishga tushiring.
3. `supabase/seed.sql` orqali boshlang'ich o'zbekcha taomlar va stollarni bazaga joylang.

*Eslatma:* Agar Supabase kalitlari kiritilmasa, dastur avtomatik ravishda **Lokal Demo Rejimida** to'liq ishlaydi.

---

## 🧪 Sinovlar (Unit Tests)
Biznes qoidalar, savat hisob-kitoblari va buyurtma holatlari o'tishini tekshirish:
```bash
npm run lint
```

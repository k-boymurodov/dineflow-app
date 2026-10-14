-- ====================================================================
-- DineFlow Seed Data (Uzbek Language)
-- ====================================================================

-- Categories
INSERT INTO public.categories (id, name, icon, sort_order) VALUES
  ('cat-all', 'Barchasi', 'layout-grid', 0),
  ('cat-milliy', 'Milliy taomlar', 'utensils', 1),
  ('cat-fastfood', 'Fast food & Kabob', 'flame', 2),
  ('cat-salatlar', 'Salatlar', 'leaf', 3),
  ('cat-ichimliklar', 'Ichimliklar', 'coffee', 4),
  ('cat-desertlar', 'Desertlar', 'cake', 5)
ON CONFLICT (id) DO NOTHING;

-- Tables
INSERT INTO public.restaurant_tables (id, table_number, label, zone, seats, qr_token, is_active, assigned_waiter_name) VALUES
  ('table-1', 1, 'Stol №1', 'main', 4, 'qr-token-1', true, 'Dilshod Karimiy'),
  ('table-3', 3, 'Stol №3', 'main', 4, 'qr-token-3', true, 'Dilshod Karimiy'),
  ('table-4', 4, 'Stol №4', 'main', 4, 'qr-token-4', true, 'Malika Boboyeva'),
  ('table-5', 5, 'Stol №5', 'main', 2, 'qr-token-5', true, 'Malika Boboyeva'),
  ('table-7', 7, 'Stol №7', 'main', 6, 'qr-token-7', true, 'Dilnoza M.'),
  ('table-8', 8, 'Stol №8', 'terrace', 8, 'qr-token-8', true, 'Malika Boboyeva'),
  ('table-12', 12, 'Stol №12', 'main', 4, 'qr-token-12', true, 'Dilshod Karimiy'),
  ('table-14', 14, 'Stol №14', 'main', 6, 'qr-token-14', true, 'Dilshod Karimiy'),
  ('table-18', 18, 'Stol №18', 'terrace', 4, 'qr-token-18', true, 'Dilshod Karimiy'),
  ('table-vip-1', 20, 'VIP "Samarqand"', 'vip', 10, 'qr-token-vip-1', true, 'Otabek Toirov')
ON CONFLICT (id) DO NOTHING;

-- Menu Items
INSERT INTO public.menu_items (id, category_id, name, description, price, is_available, preparation_time_minutes, weight_or_portion, tags) VALUES
  ('dish-1', 'cat-milliy', 'To''y Oshi (Maxsus)', 'Lagan taxtida tansiq lahm mol go''shti, sarg''ish sabzi, no''xat, mayiz, bedana tuxumi va qazi bo''laklari bilan tayyorlangan shohona palov.', 45000, true, 15, '450 g', ARRAY['Xaridorgir', 'Chef tavsiyasi']),
  ('dish-2', 'cat-milliy', 'Qozon Kabob', 'Qovurilgan yangi qo''zichoq qovurg''asi, tillarang qizargan mayin kartoshkalar va ziravorli qizil piyoz bilan.', 65000, true, 20, '400 g', ARRAY['Yangi taom']),
  ('dish-3', 'cat-milliy', 'Chust Somsasi (Tandir)', 'Varaqi xamir ichida mayin to''g''ralgan barra go''sht va dumba yog''i, tandirda pishirilgan somsa.', 12000, true, 10, '180 g (1 dona)', ARRAY['Issiq tandirdan']),
  ('dish-4', 'cat-fastfood', 'G''ijduvon Shashlik', 'Maxsus retsept asosida marinadlangan mayin qiyma va bo''lak go''sht kabob, ko''mir cho''g''ida pishiriladi.', 24000, true, 18, '150 g (1 six)', ARRAY['Cho''g''da']),
  ('dish-5', 'cat-salatlar', 'Achchiq-Chuchuk Salati', 'Pishgan shirin Samarqand pomidorlari, yupqa archilgan piyoz, qalampir va rayhon barglari bilan.', 15000, true, 5, '200 g', ARRAY['Tabiiy']),
  ('dish-7', 'cat-ichimliklar', 'Ko''k Choy (Limon & Novvot)', 'Maxsus chinni choynakda damlangan tog'' ko''k choyi, yangi limon va Samarqand oq novvoti.', 10000, true, 4, '800 ml', ARRAY['Issiq damlama'])
ON CONFLICT (id) DO NOTHING;

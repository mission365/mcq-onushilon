-- NCTB Bangla Version Science Group Chapters
-- Run: psql -d mcq_onushilon -f scripts/seed-chapters.sql

-- ─── SSC Physics (cafe614a-0f49-43fe-9c81-fe222020a300) ─────────────────────
INSERT INTO chapters (id, subject_id, chapter_number, title, title_bn, created_at)
VALUES
  (gen_random_uuid(), 'cafe614a-0f49-43fe-9c81-fe222020a300',  1, 'Physical Quantities and Their Measurement', 'ভৌত রাশি এবং তাদের পরিমাপ', NOW()),
  (gen_random_uuid(), 'cafe614a-0f49-43fe-9c81-fe222020a300',  2, 'Motion', 'গতি', NOW()),
  (gen_random_uuid(), 'cafe614a-0f49-43fe-9c81-fe222020a300',  3, 'Force', 'বল', NOW()),
  (gen_random_uuid(), 'cafe614a-0f49-43fe-9c81-fe222020a300',  4, 'Work, Power and Energy', 'কাজ, ক্ষমতা ও শক্তি', NOW()),
  (gen_random_uuid(), 'cafe614a-0f49-43fe-9c81-fe222020a300',  5, 'States of Matter and Pressure', 'পদার্থের অবস্থা ও চাপ', NOW()),
  (gen_random_uuid(), 'cafe614a-0f49-43fe-9c81-fe222020a300',  6, 'Effect of Heat on Matter', 'বস্তুর ওপর তাপের প্রভাব', NOW()),
  (gen_random_uuid(), 'cafe614a-0f49-43fe-9c81-fe222020a300',  7, 'Wave and Sound', 'তরঙ্গ ও শব্দ', NOW()),
  (gen_random_uuid(), 'cafe614a-0f49-43fe-9c81-fe222020a300',  8, 'Reflection of Light', 'আলোর প্রতিফলন', NOW()),
  (gen_random_uuid(), 'cafe614a-0f49-43fe-9c81-fe222020a300',  9, 'Refraction of Light', 'আলোর প্রতিসরণ', NOW()),
  (gen_random_uuid(), 'cafe614a-0f49-43fe-9c81-fe222020a300', 10, 'Static Electricity', 'স্থির তড়িৎ', NOW()),
  (gen_random_uuid(), 'cafe614a-0f49-43fe-9c81-fe222020a300', 11, 'Current Electricity', 'চল তড়িৎ', NOW()),
  (gen_random_uuid(), 'cafe614a-0f49-43fe-9c81-fe222020a300', 12, 'Magnetic Effect of Electric Current', 'তড়িতের চৌম্বক ক্রিয়া', NOW()),
  (gen_random_uuid(), 'cafe614a-0f49-43fe-9c81-fe222020a300', 13, 'Modern Physics and Electronics', 'আধুনিক পদার্থবিজ্ঞান ও ইলেকট্রনিক্স', NOW()),
  (gen_random_uuid(), 'cafe614a-0f49-43fe-9c81-fe222020a300', 14, 'Physics in Saving Lives', 'জীবন বাঁচাতে পদার্থবিজ্ঞান', NOW())
ON CONFLICT DO NOTHING;

-- ─── SSC Biology (23897564-4146-4a7e-b67d-f984926d5148) ─────────────────────
INSERT INTO chapters (id, subject_id, chapter_number, title, title_bn, created_at)
VALUES
  (gen_random_uuid(), '23897564-4146-4a7e-b67d-f984926d5148',  1, 'Introduction to Life', 'জীবন পাঠ', NOW()),
  (gen_random_uuid(), '23897564-4146-4a7e-b67d-f984926d5148',  2, 'Cell and Tissue', 'জীব কোষ ও টিস্যু', NOW()),
  (gen_random_uuid(), '23897564-4146-4a7e-b67d-f984926d5148',  3, 'Cell Division', 'কোষ বিভাজন', NOW()),
  (gen_random_uuid(), '23897564-4146-4a7e-b67d-f984926d5148',  4, 'Bioenergetics', 'জীবনীশক্তি', NOW()),
  (gen_random_uuid(), '23897564-4146-4a7e-b67d-f984926d5148',  5, 'Food, Nutrition and Digestion', 'খাদ্য, পুষ্টি এবং পরিপাক', NOW()),
  (gen_random_uuid(), '23897564-4146-4a7e-b67d-f984926d5148',  6, 'Transport in Living Organisms', 'জীবে পরিবহন', NOW()),
  (gen_random_uuid(), '23897564-4146-4a7e-b67d-f984926d5148',  7, 'Gaseous Exchange', 'গ্যাসীয় বিনিময়', NOW()),
  (gen_random_uuid(), '23897564-4146-4a7e-b67d-f984926d5148',  8, 'Excretion', 'রেচন প্রক্রিয়া', NOW()),
  (gen_random_uuid(), '23897564-4146-4a7e-b67d-f984926d5148',  9, 'Support and Movement', 'দৃঢ়তা প্রদান ও চলন', NOW()),
  (gen_random_uuid(), '23897564-4146-4a7e-b67d-f984926d5148', 10, 'Coordination', 'সমন্বয়', NOW()),
  (gen_random_uuid(), '23897564-4146-4a7e-b67d-f984926d5148', 11, 'Reproduction in Organisms', 'জীবের প্রজনন', NOW()),
  (gen_random_uuid(), '23897564-4146-4a7e-b67d-f984926d5148', 12, 'Heredity and Evolution', 'জীবের বংশগতি ও বিবর্তন', NOW()),
  (gen_random_uuid(), '23897564-4146-4a7e-b67d-f984926d5148', 13, 'Environment of Organisms', 'জীবের পরিবেশ', NOW()),
  (gen_random_uuid(), '23897564-4146-4a7e-b67d-f984926d5148', 14, 'Biotechnology', 'জীবপ্রযুক্তি', NOW())
ON CONFLICT DO NOTHING;

-- ─── SSC Higher Mathematics (6c67f146-ff40-4338-bcff-e31dd8680b97) ───────────
INSERT INTO chapters (id, subject_id, chapter_number, title, title_bn, created_at)
VALUES
  (gen_random_uuid(), '6c67f146-ff40-4338-bcff-e31dd8680b97',  1, 'Set and Function', 'সেট ও ফাংশন', NOW()),
  (gen_random_uuid(), '6c67f146-ff40-4338-bcff-e31dd8680b97',  2, 'Algebraic Expression', 'বীজগাণিতিক রাশি', NOW()),
  (gen_random_uuid(), '6c67f146-ff40-4338-bcff-e31dd8680b97',  3, 'Geometry', 'জ্যামিতি', NOW()),
  (gen_random_uuid(), '6c67f146-ff40-4338-bcff-e31dd8680b97',  4, 'Geometric Construction', 'জ্যামিতিক অঙ্কন', NOW()),
  (gen_random_uuid(), '6c67f146-ff40-4338-bcff-e31dd8680b97',  5, 'Equations', 'সমীকরণ', NOW()),
  (gen_random_uuid(), '6c67f146-ff40-4338-bcff-e31dd8680b97',  6, 'Inequality', 'অসমতা', NOW()),
  (gen_random_uuid(), '6c67f146-ff40-4338-bcff-e31dd8680b97',  7, 'Infinite Series', 'অসীম ধারা', NOW()),
  (gen_random_uuid(), '6c67f146-ff40-4338-bcff-e31dd8680b97',  8, 'Trigonometry', 'ত্রিকোণমিতি', NOW()),
  (gen_random_uuid(), '6c67f146-ff40-4338-bcff-e31dd8680b97',  9, 'Exponential and Logarithmic Functions', 'সূচকীয় ও লগারিদমীয় ফাংশন', NOW()),
  (gen_random_uuid(), '6c67f146-ff40-4338-bcff-e31dd8680b97', 10, 'Binomial Expansion', 'দ্বিপদী বিস্তৃতি', NOW()),
  (gen_random_uuid(), '6c67f146-ff40-4338-bcff-e31dd8680b97', 11, 'Coordinate Geometry', 'স্থানাঙ্ক জ্যামিতি', NOW()),
  (gen_random_uuid(), '6c67f146-ff40-4338-bcff-e31dd8680b97', 12, 'Plane Vector', 'সমতলীয় ভেক্টর', NOW()),
  (gen_random_uuid(), '6c67f146-ff40-4338-bcff-e31dd8680b97', 13, 'Solid Geometry', 'ঘন জ্যামিতি', NOW()),
  (gen_random_uuid(), '6c67f146-ff40-4338-bcff-e31dd8680b97', 14, 'Probability', 'সম্ভাবনা', NOW())
ON CONFLICT DO NOTHING;

-- ─── HSC Physics 1st Paper (d498477a-7db0-450b-a86f-7b066b70ed65) ───────────
INSERT INTO chapters (id, subject_id, chapter_number, title, title_bn, created_at)
VALUES
  (gen_random_uuid(), 'd498477a-7db0-450b-a86f-7b066b70ed65',  1, 'Physical World and Measurement', 'ভৌত জগৎ ও পরিমাপ', NOW()),
  (gen_random_uuid(), 'd498477a-7db0-450b-a86f-7b066b70ed65',  2, 'Vector', 'ভেক্টর', NOW()),
  (gen_random_uuid(), 'd498477a-7db0-450b-a86f-7b066b70ed65',  3, 'Dynamics', 'গতিবিদ্যা', NOW()),
  (gen_random_uuid(), 'd498477a-7db0-450b-a86f-7b066b70ed65',  4, 'Newtonian Mechanics', 'নিউটনিয়ান বলবিদ্যা', NOW()),
  (gen_random_uuid(), 'd498477a-7db0-450b-a86f-7b066b70ed65',  5, 'Work, Energy and Power', 'কাজ, শক্তি ও ক্ষমতা', NOW()),
  (gen_random_uuid(), 'd498477a-7db0-450b-a86f-7b066b70ed65',  6, 'Gravitation and Gravity', 'মহাকর্ষ ও অভিকর্ষ', NOW()),
  (gen_random_uuid(), 'd498477a-7db0-450b-a86f-7b066b70ed65',  7, 'Properties of Matter', 'পদার্থের গাঠনিক ধর্ম', NOW()),
  (gen_random_uuid(), 'd498477a-7db0-450b-a86f-7b066b70ed65',  8, 'Periodic Motion', 'পর্যাবৃত্ত গতি', NOW()),
  (gen_random_uuid(), 'd498477a-7db0-450b-a86f-7b066b70ed65',  9, 'Wave', 'তরঙ্গ', NOW()),
  (gen_random_uuid(), 'd498477a-7db0-450b-a86f-7b066b70ed65', 10, 'Ideal Gas and Kinetic Theory of Gases', 'আদর্শ গ্যাস ও গ্যাসের গতিতত্ত্ব', NOW())
ON CONFLICT DO NOTHING;

-- ─── HSC Physics 2nd Paper (ef8fe1ea-ebc0-458f-bfc6-3db4c282f3e3) ───────────
INSERT INTO chapters (id, subject_id, chapter_number, title, title_bn, created_at)
VALUES
  (gen_random_uuid(), 'ef8fe1ea-ebc0-458f-bfc6-3db4c282f3e3',  1, 'Thermodynamics', 'তাপগতিবিদ্যা', NOW()),
  (gen_random_uuid(), 'ef8fe1ea-ebc0-458f-bfc6-3db4c282f3e3',  2, 'Static Electricity', 'স্থির তড়িৎ', NOW()),
  (gen_random_uuid(), 'ef8fe1ea-ebc0-458f-bfc6-3db4c282f3e3',  3, 'Current Electricity', 'চল তড়িৎ', NOW()),
  (gen_random_uuid(), 'ef8fe1ea-ebc0-458f-bfc6-3db4c282f3e3',  4, 'Magnetic Effect of Current and Magnetism', 'তড়িৎ প্রবাহের চৌম্বক ক্রিয়া ও চুম্বকত্ব', NOW()),
  (gen_random_uuid(), 'ef8fe1ea-ebc0-458f-bfc6-3db4c282f3e3',  5, 'Electromagnetic Induction and AC', 'তড়িৎচৌম্বকীয় আবেশ ও পরিবর্তী প্রবাহ', NOW()),
  (gen_random_uuid(), 'ef8fe1ea-ebc0-458f-bfc6-3db4c282f3e3',  6, 'Geometric Optics', 'জ্যামিতিক আলোকবিজ্ঞান', NOW()),
  (gen_random_uuid(), 'ef8fe1ea-ebc0-458f-bfc6-3db4c282f3e3',  7, 'Physical Optics', 'ভৌত আলোকবিজ্ঞান', NOW()),
  (gen_random_uuid(), 'ef8fe1ea-ebc0-458f-bfc6-3db4c282f3e3',  8, 'Introduction to Modern Physics', 'আধুনিক পদার্থবিজ্ঞানের সূচনা', NOW()),
  (gen_random_uuid(), 'ef8fe1ea-ebc0-458f-bfc6-3db4c282f3e3',  9, 'Atomic Models and Nuclear Physics', 'পরমাণুর মডেল এবং নিউক্লিয়ার পদার্থবিজ্ঞান', NOW()),
  (gen_random_uuid(), 'ef8fe1ea-ebc0-458f-bfc6-3db4c282f3e3', 10, 'Semiconductor and Electronics', 'সেমিকন্ডাক্টর ও ইলেকট্রনিক্স', NOW()),
  (gen_random_uuid(), 'ef8fe1ea-ebc0-458f-bfc6-3db4c282f3e3', 11, 'Astronomy', 'জ্যোতির্বিজ্ঞান', NOW())
ON CONFLICT DO NOTHING;

-- ─── HSC Chemistry 1st Paper (bf922935-7235-42f2-8bf6-e7a156a24d8b) ─────────
INSERT INTO chapters (id, subject_id, chapter_number, title, title_bn, created_at)
VALUES
  (gen_random_uuid(), 'bf922935-7235-42f2-8bf6-e7a156a24d8b', 1, 'Safe Use of Laboratory', 'ল্যাবরেটরির নিরাপদ ব্যবহার', NOW()),
  (gen_random_uuid(), 'bf922935-7235-42f2-8bf6-e7a156a24d8b', 2, 'Qualitative Chemistry', 'গুণগত রসায়ন', NOW()),
  (gen_random_uuid(), 'bf922935-7235-42f2-8bf6-e7a156a24d8b', 3, 'Periodic Properties of Elements and Chemical Bond', 'মৌলের পর্যায়বৃত্ত ধর্ম ও রাসায়নিক বন্ধন', NOW()),
  (gen_random_uuid(), 'bf922935-7235-42f2-8bf6-e7a156a24d8b', 4, 'Chemical Change', 'রাসায়নিক পরিবর্তন', NOW()),
  (gen_random_uuid(), 'bf922935-7235-42f2-8bf6-e7a156a24d8b', 5, 'Applied Chemistry', 'কর্মমুখী রসায়ন', NOW())
ON CONFLICT DO NOTHING;

-- ─── HSC Chemistry 2nd Paper (cf451e01-eecb-4dae-bd4e-c97638b51651) ─────────
INSERT INTO chapters (id, subject_id, chapter_number, title, title_bn, created_at)
VALUES
  (gen_random_uuid(), 'cf451e01-eecb-4dae-bd4e-c97638b51651', 1, 'Environmental Chemistry', 'পরিবেশ রসায়ন', NOW()),
  (gen_random_uuid(), 'cf451e01-eecb-4dae-bd4e-c97638b51651', 2, 'Organic Chemistry', 'জৈব রসায়ন', NOW()),
  (gen_random_uuid(), 'cf451e01-eecb-4dae-bd4e-c97638b51651', 3, 'Quantitative Chemistry', 'পরিমাণগত রসায়ন', NOW()),
  (gen_random_uuid(), 'cf451e01-eecb-4dae-bd4e-c97638b51651', 4, 'Electrochemistry', 'তড়িৎ রসায়ন', NOW()),
  (gen_random_uuid(), 'cf451e01-eecb-4dae-bd4e-c97638b51651', 5, 'Economic Chemistry', 'অর্থনৈতিক রসায়ন', NOW())
ON CONFLICT DO NOTHING;

-- ─── HSC Biology 1st Paper / Botany (809aad3f-67f6-4cdc-ad79-76fba28cb270) ──
INSERT INTO chapters (id, subject_id, chapter_number, title, title_bn, created_at)
VALUES
  (gen_random_uuid(), '809aad3f-67f6-4cdc-ad79-76fba28cb270',  1, 'Cell and Its Structure', 'কোষ ও এর গঠন', NOW()),
  (gen_random_uuid(), '809aad3f-67f6-4cdc-ad79-76fba28cb270',  2, 'Cell Division', 'কোষ বিভাজন', NOW()),
  (gen_random_uuid(), '809aad3f-67f6-4cdc-ad79-76fba28cb270',  3, 'Cell Chemistry', 'কোষ রসায়ন', NOW()),
  (gen_random_uuid(), '809aad3f-67f6-4cdc-ad79-76fba28cb270',  4, 'Microorganisms', 'অণুজীব', NOW()),
  (gen_random_uuid(), '809aad3f-67f6-4cdc-ad79-76fba28cb270',  5, 'Algae and Fungi', 'শৈবাল ও ছত্রাক', NOW()),
  (gen_random_uuid(), '809aad3f-67f6-4cdc-ad79-76fba28cb270',  6, 'Bryophyta and Pteridophyta', 'ব্রায়োফাইটা ও টেরিডোফাইটা', NOW()),
  (gen_random_uuid(), '809aad3f-67f6-4cdc-ad79-76fba28cb270',  7, 'Gymnosperm and Angiosperm', 'নগ্নবীজী ও আবৃতবীজী উদ্ভিদ', NOW()),
  (gen_random_uuid(), '809aad3f-67f6-4cdc-ad79-76fba28cb270',  8, 'Tissue and Tissue System', 'টিস্যু ও টিস্যুতন্ত্র', NOW()),
  (gen_random_uuid(), '809aad3f-67f6-4cdc-ad79-76fba28cb270',  9, 'Plant Physiology', 'উদ্ভিদ শারীরতত্ত্ব', NOW()),
  (gen_random_uuid(), '809aad3f-67f6-4cdc-ad79-76fba28cb270', 10, 'Plant Reproduction', 'উদ্ভিদ প্রজনন', NOW()),
  (gen_random_uuid(), '809aad3f-67f6-4cdc-ad79-76fba28cb270', 11, 'Biotechnology', 'জীবপ্রযুক্তি', NOW()),
  (gen_random_uuid(), '809aad3f-67f6-4cdc-ad79-76fba28cb270', 12, 'Environment, Distribution and Conservation of Organisms', 'জীবের পরিবেশ, বিস্তার ও সংরক্ষণ', NOW())
ON CONFLICT DO NOTHING;

-- ─── HSC Biology 2nd Paper / Zoology (70a66766-d775-4ebb-bc79-96e9c8479201) ─
INSERT INTO chapters (id, subject_id, chapter_number, title, title_bn, created_at)
VALUES
  (gen_random_uuid(), '70a66766-d775-4ebb-bc79-96e9c8479201',  1, 'Diversity and Classification of Animals', 'প্রাণীর বিভিন্নতা ও শ্রেণিবিন্যাস', NOW()),
  (gen_random_uuid(), '70a66766-d775-4ebb-bc79-96e9c8479201',  2, 'Introduction to Animals', 'প্রাণীর পরিচিতি', NOW()),
  (gen_random_uuid(), '70a66766-d775-4ebb-bc79-96e9c8479201',  3, 'Human Physiology: Digestion and Absorption', 'মানব শরীরতত্ত্ব: পরিপাক ও শোষণ', NOW()),
  (gen_random_uuid(), '70a66766-d775-4ebb-bc79-96e9c8479201',  4, 'Human Physiology: Blood and Circulation', 'মানব শরীরতত্ত্ব: রক্ত ও সংবহন', NOW()),
  (gen_random_uuid(), '70a66766-d775-4ebb-bc79-96e9c8479201',  5, 'Human Physiology: Respiration', 'মানব শরীরতত্ত্ব: শ্বসন ও শ্বাসক্রিয়া', NOW()),
  (gen_random_uuid(), '70a66766-d775-4ebb-bc79-96e9c8479201',  6, 'Human Physiology: Excretion', 'মানব শরীরতত্ত্ব: বর্জ্য ও নিষ্কাশন', NOW()),
  (gen_random_uuid(), '70a66766-d775-4ebb-bc79-96e9c8479201',  7, 'Human Physiology: Movement', 'মানব শরীরতত্ত্ব: চলন ও অঙ্গচালনা', NOW()),
  (gen_random_uuid(), '70a66766-d775-4ebb-bc79-96e9c8479201',  8, 'Human Physiology: Coordination and Control', 'মানব শরীরতত্ত্ব: সমন্বয় ও নিয়ন্ত্রণ', NOW()),
  (gen_random_uuid(), '70a66766-d775-4ebb-bc79-96e9c8479201',  9, 'Continuity of Human Life', 'মানব জীবনের ধারাবাহিকতা', NOW()),
  (gen_random_uuid(), '70a66766-d775-4ebb-bc79-96e9c8479201', 10, 'Defence of Human Body', 'মানবদেহের প্রতিরক্ষা', NOW()),
  (gen_random_uuid(), '70a66766-d775-4ebb-bc79-96e9c8479201', 11, 'Genetics and Evolution', 'জিনতত্ত্ব ও বিবর্তন', NOW()),
  (gen_random_uuid(), '70a66766-d775-4ebb-bc79-96e9c8479201', 12, 'Animal Behaviour', 'প্রাণীর আচরণ', NOW())
ON CONFLICT DO NOTHING;

-- ─── HSC Higher Mathematics 1st Paper (f8ec16ee-ad65-4258-9765-90b4e5e06fe7) ─
INSERT INTO chapters (id, subject_id, chapter_number, title, title_bn, created_at)
VALUES
  (gen_random_uuid(), 'f8ec16ee-ad65-4258-9765-90b4e5e06fe7',  1, 'Matrix and Determinant', 'ম্যাট্রিক্স ও নির্ণায়ক', NOW()),
  (gen_random_uuid(), 'f8ec16ee-ad65-4258-9765-90b4e5e06fe7',  2, 'Vector', 'ভেক্টর', NOW()),
  (gen_random_uuid(), 'f8ec16ee-ad65-4258-9765-90b4e5e06fe7',  3, 'Straight Line', 'সরলরেখা', NOW()),
  (gen_random_uuid(), 'f8ec16ee-ad65-4258-9765-90b4e5e06fe7',  4, 'Circle', 'বৃত্ত', NOW()),
  (gen_random_uuid(), 'f8ec16ee-ad65-4258-9765-90b4e5e06fe7',  5, 'Permutation and Combination', 'বিন্যাস ও সমাবেশ', NOW()),
  (gen_random_uuid(), 'f8ec16ee-ad65-4258-9765-90b4e5e06fe7',  6, 'Trigonometric Ratios', 'ত্রিকোণমিতিক অনুপাত', NOW()),
  (gen_random_uuid(), 'f8ec16ee-ad65-4258-9765-90b4e5e06fe7',  7, 'Trigonometric Ratios of Compound Angles', 'সংযুক্ত কোণের ত্রিকোণমিতিক অনুপাত', NOW()),
  (gen_random_uuid(), 'f8ec16ee-ad65-4258-9765-90b4e5e06fe7',  8, 'Function and Graph of Function', 'ফাংশন ও ফাংশনের লেখচিত্র', NOW()),
  (gen_random_uuid(), 'f8ec16ee-ad65-4258-9765-90b4e5e06fe7',  9, 'Differentiation', 'অন্তরীকরণ', NOW()),
  (gen_random_uuid(), 'f8ec16ee-ad65-4258-9765-90b4e5e06fe7', 10, 'Integration', 'যোগজীকরণ', NOW())
ON CONFLICT DO NOTHING;

-- ─── HSC Higher Mathematics 2nd Paper (92f6a270-cc96-41e5-8001-3c95fca31c75) ─
INSERT INTO chapters (id, subject_id, chapter_number, title, title_bn, created_at)
VALUES
  (gen_random_uuid(), '92f6a270-cc96-41e5-8001-3c95fca31c75',  1, 'Real Numbers and Inequality', 'বাস্তব সংখ্যা ও অসমতা', NOW()),
  (gen_random_uuid(), '92f6a270-cc96-41e5-8001-3c95fca31c75',  2, 'Linear Programming', 'যোগাশ্রয়ী প্রোগ্রাম', NOW()),
  (gen_random_uuid(), '92f6a270-cc96-41e5-8001-3c95fca31c75',  3, 'Complex Numbers', 'জটিল সংখ্যা', NOW()),
  (gen_random_uuid(), '92f6a270-cc96-41e5-8001-3c95fca31c75',  4, 'Polynomial and Polynomial Equations', 'বহুপদী ও বহুপদী সমীকরণ', NOW()),
  (gen_random_uuid(), '92f6a270-cc96-41e5-8001-3c95fca31c75',  5, 'Binomial Expansion', 'দ্বিপদী বিস্তৃতি', NOW()),
  (gen_random_uuid(), '92f6a270-cc96-41e5-8001-3c95fca31c75',  6, 'Conics', 'কণিক', NOW()),
  (gen_random_uuid(), '92f6a270-cc96-41e5-8001-3c95fca31c75',  7, 'Inverse Trigonometric Functions and Equations', 'বিপরীত ত্রিকোণমিতিক ফাংশন ও ত্রিকোণমিতিক সমীকরণ', NOW()),
  (gen_random_uuid(), '92f6a270-cc96-41e5-8001-3c95fca31c75',  8, 'Statics', 'স্থিতিবিদ্যা', NOW()),
  (gen_random_uuid(), '92f6a270-cc96-41e5-8001-3c95fca31c75',  9, 'Motion of Two Particles in a Plane', 'সমতলে দ্বিকণার গতি', NOW()),
  (gen_random_uuid(), '92f6a270-cc96-41e5-8001-3c95fca31c75', 10, 'Measures of Dispersion and Probability', 'বিস্তারের পরিমাপ ও সম্ভাবনা', NOW())
ON CONFLICT DO NOTHING;

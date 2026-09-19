/**
 * SAFE UPSERT — Batch 3: SSC Humanities + HSC Humanities chapters
 * Rule: NEVER deletes data. Only inserts new rows or updates existing ones.
 * Run: npx tsx scripts/add-chapters-batch3.ts
 */

import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/mcq_onushilon',
});

interface ChapterData {
  chapterNumber: number;
  title: string;
  titleBn: string;
}

async function ensureSubject(
  client: pg.PoolClient,
  name: string,
  nameBn: string,
  curriculumVersion: string,
  academicLevel: string
): Promise<string> {
  const existing = await client.query(
    `SELECT id FROM subjects WHERE name = $1 AND curriculum_version = $2 AND academic_level = $3`,
    [name, curriculumVersion, academicLevel]
  );
  if (existing.rows.length > 0) {
    console.log(`  ✓ Exists: ${nameBn}`);
    return existing.rows[0].id;
  }
  const result = await client.query(
    `INSERT INTO subjects (id, name, name_bn, curriculum_version, academic_level, is_active, created_at)
     VALUES (gen_random_uuid(), $1, $2, $3, $4, true, NOW()) RETURNING id`,
    [name, nameBn, curriculumVersion, academicLevel]
  );
  console.log(`  ✅ Created: ${nameBn}`);
  return result.rows[0].id;
}

async function upsertChapters(
  client: pg.PoolClient,
  subjectId: string,
  chapters: ChapterData[]
): Promise<void> {
  for (const ch of chapters) {
    const existing = await client.query(
      `SELECT id FROM chapters WHERE subject_id = $1 AND chapter_number = $2`,
      [subjectId, ch.chapterNumber]
    );
    if (existing.rows.length > 0) {
      await client.query(
        `UPDATE chapters SET title = $1, title_bn = $2 WHERE subject_id = $3 AND chapter_number = $4`,
        [ch.title, ch.titleBn, subjectId, ch.chapterNumber]
      );
      console.log(`    🔄 ${ch.chapterNumber.toString().padStart(2,'0')}. ${ch.titleBn}`);
    } else {
      await client.query(
        `INSERT INTO chapters (id, subject_id, chapter_number, title, title_bn, created_at)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW())`,
        [subjectId, ch.chapterNumber, ch.title, ch.titleBn]
      );
      console.log(`    ✅ ${ch.chapterNumber.toString().padStart(2,'0')}. ${ch.titleBn}`);
    }
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// KNOWN Subject IDs
// ═════════════════════════════════════════════════════════════════════════════
const IDS = {
  // SSC Humanities
  ssc_history_world:   '78c83c1a-03a7-4473-88b2-c5a1139eee57',
  ssc_geo_env:         '189740d6-5fce-4d39-af5b-d1539bf0444a',
  ssc_economics:       '5abcf888-1c39-4658-b6a9-c83126271823',
  ssc_civics:          'e8c7febd-f741-4807-b8ee-8e8429edb100',
  // HSC Humanities
  hsc_history1:        '3e814b58-96e5-4998-af18-4fabda186319',
  hsc_history2:        'c993d5e0-cc1a-4caf-b422-3f6cdfa3002e',
  hsc_islam_hist1:     '89e4e90a-9812-4954-8873-565857aa4173',
  hsc_islam_hist2:     'dc0f5846-5978-47f0-94c8-4fffc2c5f7cc',
  hsc_civics1:         'a8f31653-b5ff-4702-89d4-8a922ae253cf',
  hsc_civics2:         '5f14b0df-65d4-4a39-8d2a-c8c6dbb06761',
  hsc_economics1:      'f84a3783-e407-40aa-b673-5603acc5b73f',
  hsc_economics2:      '344ea174-a02b-460c-911d-3ce6363369de',
  hsc_sociology1:      '0caa3dfb-6d6d-40a0-815e-a2b77c4941f6',
  hsc_sociology2:      '8a084e9c-8ef2-4ed7-8548-bdc95b9e36c0',
  hsc_logic1:          'f0fafbc8-b332-4b11-a500-7d5d7aba1017',
  hsc_logic2:          '8970fb96-1f90-430f-8071-acc5c2a3aeb5',
  hsc_social_work1:    '69f252d7-8307-4a87-b794-6d5cb4753478',
  hsc_social_work2:    '61b3b6ef-9c94-46f7-9561-b111aefe91d3',
  hsc_geography1:      'ed1e06b0-e185-4204-b0f0-a6e6efc1b08c',
  hsc_geography2:      '3074d8cc-60df-4c73-b400-124ba89fed56',
};

// ═════════════════════════════════════════════════════════════════════════════
// CHAPTER DATA
// ═════════════════════════════════════════════════════════════════════════════

// ── SSC: বাংলাদেশের ইতিহাস ও বিশ্বসভ্যতা ──────────────────────────────────
const SSC_HISTORY_WORLD: ChapterData[] = [
  { chapterNumber:  1, title: 'Introduction to History',                                            titleBn: 'ইতিহাস পরিচিতি' },
  { chapterNumber:  2, title: 'World Civilizations (Egypt, Indus, Greek & Rome)',                   titleBn: 'বিশ্বসভ্যতা (মিশর, সিন্ধু, গ্রিক ও রোম)' },
  { chapterNumber:  3, title: 'Ancient Bengal: Janapad',                                            titleBn: 'প্রাচীন বাংলার জনপদ' },
  { chapterNumber:  4, title: 'Political History of Ancient Bengal (326 BC – 1204 AD)',             titleBn: 'প্রাচীন বাংলার রাজনৈতিক ইতিহাস (খ্রিষ্টপূর্বাব্দ ৩২৬–১২০৪ খ্রিষ্টাব্দ)' },
  { chapterNumber:  5, title: 'Social, Economic & Cultural History of Ancient Bengal',             titleBn: 'প্রাচীন বাংলার সামাজিক, অর্থনৈতিক ও সাংস্কৃতিক ইতিহাস' },
  { chapterNumber:  6, title: 'Political History of Medieval Bengal (1204–1757 AD)',                titleBn: 'মধ্যযুগের বাংলার রাজনৈতিক ইতিহাস (১২০৪–১৭৫৭ খ্রিষ্টাব্দ)' },
  { chapterNumber:  7, title: 'Social, Economic & Cultural History of Medieval Bengal',            titleBn: 'মধ্যযুগের বাংলার সামাজিক, অর্থনৈতিক ও সাংস্কৃতিক ইতিহাস' },
  { chapterNumber:  8, title: 'Beginning of British Rule in Bengal',                               titleBn: 'বাংলায় ইংরেজ শাসনের সূচনাপর্ব' },
  { chapterNumber:  9, title: 'Resistance, Renaissance & Reform Movements in Bengal Under British', titleBn: 'ইংরেজ শাসন আমলে বাংলায় প্রতিরোধ, নবজাগরণ ও সংস্কার আন্দোলন' },
  { chapterNumber: 10, title: 'Autonomy Movement in Bengal Under British Rule',                     titleBn: 'ইংরেজ শাসন আমলে বাংলার স্বাধিকার আন্দোলন' },
  { chapterNumber: 11, title: 'Language Movement and Subsequent Political Events',                  titleBn: 'ভাষা আন্দোলন ও পরবর্তী রাজনৈতিক ঘটনাপ্রবাহ' },
  { chapterNumber: 12, title: 'Military Rule and Autonomy Movement (1958–1969)',                   titleBn: 'সামরিক শাসন ও স্বাধিকার আন্দোলন (১৯৫৮–১৯৬৯)' },
  { chapterNumber: 13, title: 'Election of 1970 and the Liberation War',                           titleBn: 'সত্তরের নির্বাচন এবং মুক্তিযুদ্ধ' },
  { chapterNumber: 14, title: 'Reign of Bangabandhu Sheikh Mujibur Rahman (1972–1975)',            titleBn: 'বঙ্গবন্ধু শেখ মুজিবুর রহমানের শাসনকাল (১৯৭২–১৯৭৫)' },
  { chapterNumber: 15, title: 'Military Rule and Subsequent Events (1975–1990)',                   titleBn: 'সামরিক শাসন ও পরবর্তী ঘটনাপ্রবাহ (১৯৭৫–১৯৯০)' },
];

// ── SSC: ভূগোল ও পরিবেশ ────────────────────────────────────────────────────
const SSC_GEO_ENV: ChapterData[] = [
  { chapterNumber:  1, title: 'Geography and Environment',                     titleBn: 'ভূগোল ও পরিবেশ' },
  { chapterNumber:  2, title: 'Universe and Our Earth',                        titleBn: 'মহাবিশ্ব ও আমাদের পৃথিবী' },
  { chapterNumber:  3, title: 'Map Reading and Use',                           titleBn: 'মানচিত্র পঠন ও ব্যবহার' },
  { chapterNumber:  4, title: 'Internal and External Structure of the Earth',  titleBn: 'পৃথিবীর অভ্যন্তরীণ ও বাহ্যিক গঠন' },
  { chapterNumber:  5, title: 'Atmosphere',                                    titleBn: 'বায়ুমণ্ডল' },
  { chapterNumber:  6, title: 'Hydrosphere',                                   titleBn: 'বারিমণ্ডল' },
  { chapterNumber:  7, title: 'Population',                                    titleBn: 'জনসংখ্যা' },
  { chapterNumber:  8, title: 'Human Settlement',                              titleBn: 'মানব বসতি' },
  { chapterNumber:  9, title: 'Resources and Economic Activities',             titleBn: 'সম্পদ ও অর্থনৈতিক কার্যাবলি' },
  { chapterNumber: 10, title: 'Geographical Description of Bangladesh',        titleBn: 'বাংলাদেশের ভৌগোলিক বিবরণ' },
  { chapterNumber: 11, title: 'Resources and Industries of Bangladesh',        titleBn: 'বাংলাদেশের সম্পদ ও শিল্প' },
  { chapterNumber: 12, title: 'Communication and Trade of Bangladesh',         titleBn: 'বাংলাদেশের যোগাযোগ ব্যবস্থা ও বাণিজ্য' },
  { chapterNumber: 13, title: 'Development Activities and Environmental Balance in Bangladesh', titleBn: 'বাংলাদেশের উন্নয়ন কর্মকাণ্ড ও পরিবেশের ভারসাম্য' },
  { chapterNumber: 14, title: 'Natural Disasters of Bangladesh',               titleBn: 'বাংলাদেশের প্রাকৃতিক দুর্যোগ' },
  { chapterNumber: 15, title: 'Sustainable Development Goals (SDG)',           titleBn: 'টেকসই উন্নয়ন অভীষ্ট (এসডিজি)' },
];

// ── SSC: অর্থনীতি ──────────────────────────────────────────────────────────
const SSC_ECONOMICS: ChapterData[] = [
  { chapterNumber:  1, title: 'Introduction to Economics',                           titleBn: 'অর্থনীতি পরিচয়' },
  { chapterNumber:  2, title: 'Important Concepts of Economics',                     titleBn: 'অর্থনীতির গুরুত্বপূর্ণ ধারণাসমূহ' },
  { chapterNumber:  3, title: 'Utility, Demand, Supply and Equilibrium',             titleBn: 'উপযোগ, চাহিদা, যোগান ও ভারসাম্য' },
  { chapterNumber:  4, title: 'Production and Organization',                         titleBn: 'উৎপাদন ও সংগঠন' },
  { chapterNumber:  5, title: 'Market',                                              titleBn: 'বাজার' },
  { chapterNumber:  6, title: 'National Income and Its Measurement',                 titleBn: 'জাতীয় আয় ও এর পরিমাপ' },
  { chapterNumber:  7, title: 'Money and Banking System',                            titleBn: 'অর্থ ও ব্যাংক ব্যবস্থা' },
  { chapterNumber:  8, title: 'Economy of Bangladesh',                               titleBn: 'বাংলাদেশের অর্থনীতি' },
  { chapterNumber:  9, title: 'Important Economic Issues of Bangladesh',             titleBn: 'বাংলাদেশের গুরুত্বপূর্ণ অর্থনৈতিক প্রসঙ্গ' },
  { chapterNumber: 10, title: 'Financial System of Bangladesh Government',           titleBn: 'বাংলাদেশ সরকারের অর্থব্যবস্থা' },
];

// ── SSC: পৌরনীতি ও নাগরিকতা ────────────────────────────────────────────────
const SSC_CIVICS: ChapterData[] = [
  { chapterNumber:  1, title: 'Civics and Citizenship',                              titleBn: 'পৌরনীতি ও নাগরিকতা' },
  { chapterNumber:  2, title: 'Citizen and Citizenship',                             titleBn: 'নাগরিক ও নাগরিকতা' },
  { chapterNumber:  3, title: 'Law, Liberty and Equality',                           titleBn: 'আইন, স্বাধীনতা ও সাম্য' },
  { chapterNumber:  4, title: 'State and Government System',                         titleBn: 'রাষ্ট্র ও সরকার ব্যবস্থা' },
  { chapterNumber:  5, title: 'Constitution',                                        titleBn: 'সংবিধান' },
  { chapterNumber:  6, title: 'Government System of Bangladesh',                     titleBn: 'বাংলাদেশের সরকার ব্যবস্থা' },
  { chapterNumber:  7, title: 'Political Parties and Elections in Democracy',        titleBn: 'গণতন্ত্রে রাজনৈতিক দল ও নির্বাচন' },
  { chapterNumber:  8, title: 'Local Government System of Bangladesh',               titleBn: 'বাংলাদেশের স্থানীয় সরকার ব্যবস্থা' },
  { chapterNumber:  9, title: 'Civic Problems and Our Responsibilities',             titleBn: 'নাগরিক সমস্যা ও আমাদের করণীয়' },
  { chapterNumber: 10, title: 'Civic Consciousness in the Emergence of Independent Bangladesh', titleBn: 'স্বাধীন বাংলাদেশের অভ্যুদয়ে নাগরিক চেতনা' },
  { chapterNumber: 11, title: 'Bangladesh and International Organizations',          titleBn: 'বাংলাদেশ ও আন্তর্জাতিক সংগঠন' },
];

// ── HSC: ইতিহাস ১ম পত্র ─────────────────────────────────────────────────────
const HSC_HISTORY1: ChapterData[] = [
  { chapterNumber: 1, title: 'Arrival of Europeans in the Indian Subcontinent: Establishment of British Dominance', titleBn: 'ভারতবর্ষে ইউরোপীয়দের আগমন: ইংরেজ আধিপত্য প্রতিষ্ঠা' },
  { chapterNumber: 2, title: 'British Colonial Rule: Company Era',                  titleBn: 'ইংরেজ ঔপনিবেশিক শাসন: কোম্পানি আমল' },
  { chapterNumber: 3, title: 'British Colonial Rule: Crown Era',                    titleBn: 'ইংরেজ ঔপনিবেশিক শাসন: ব্রিটিশ আমল' },
  { chapterNumber: 4, title: 'Bengali Language Movement in Pakistani Era and Its Nature', titleBn: 'পাকিস্তানি আমলে বাংলা ভাষা আন্দোলন ও এর গতি-প্রকৃতি' },
  { chapterNumber: 5, title: 'Autonomy and Rights Movement of East Bengal',         titleBn: 'পূর্ব বাংলার স্বায়ত্তশাসন ও স্বাধিকার আন্দোলন' },
  { chapterNumber: 6, title: 'Declaration of Independence of Bangladesh and the Liberation War', titleBn: 'বাংলাদেশের স্বাধীনতা ঘোষণা ও মুক্তিযুদ্ধ' },
  { chapterNumber: 7, title: 'Activities of Bangladesh Government (Mujibnagar)',     titleBn: 'বাংলাদেশ সরকারের (মুজিবনগর) কার্যক্রম' },
  { chapterNumber: 8, title: 'Expatriate Bengalis and the Outside World',           titleBn: 'প্রবাসী বাঙালি ও বহির্বিশ্ব' },
];

// ── HSC: ইতিহাস ২য় পত্র ─────────────────────────────────────────────────────
const HSC_HISTORY2: ChapterData[] = [
  { chapterNumber: 1, title: 'Industrial Revolution',                               titleBn: 'শিল্প বিপ্লব' },
  { chapterNumber: 2, title: 'French Revolution',                                   titleBn: 'ফরাসি বিপ্লব' },
  { chapterNumber: 3, title: 'World War I, Treaty of Versailles and League of Nations', titleBn: 'প্রথম বিশ্বযুদ্ধ এবং ভার্সাই সন্ধি ও লীগ অব নেশনস' },
  { chapterNumber: 4, title: 'Bolshevik Revolution',                                titleBn: 'বলশেভিক বিপ্লব' },
  { chapterNumber: 5, title: 'Rise of Hitler and Mussolini and World War II',       titleBn: 'হিটলার ও মুসোলিনির উত্থান এবং দ্বিতীয় বিশ্বযুদ্ধ' },
  { chapterNumber: 6, title: 'United Nations and World Peace',                      titleBn: 'জাতিসংঘ এবং বিশ্বশান্তি' },
  { chapterNumber: 7, title: 'Cold War — Conflict Between Capitalist and Socialist World', titleBn: 'স্নায়ুযুদ্ধ—পুঁজিবাদ ও সমাজতান্ত্রিক বিশ্বের দ্বন্দ্ব' },
  { chapterNumber: 8, title: 'Post-Cold War World',                                 titleBn: 'স্নায়ুযুদ্ধ-পরবর্তী বিশ্ব' },
  { chapterNumber: 9, title: 'Anti-Apartheid Movement',                             titleBn: 'বর্ণবাদবিরোধী আন্দোলন' },
];

// ── HSC: ইসলামের ইতিহাস ও সংস্কৃতি ১ম পত্র ────────────────────────────────
const HSC_ISLAM_HIST1: ChapterData[] = [
  { chapterNumber:  1, title: 'Pre-Islamic Arabia',                                 titleBn: 'প্রাক-ইসলামি আরব' },
  { chapterNumber:  2, title: 'Arabia in the Age of Jahiliyya',                     titleBn: 'জাহিলিয়া যুগে আরব' },
  { chapterNumber:  3, title: 'Life of Prophet Muhammad (SAW) in Makkah',           titleBn: 'হযরত মুহাম্মদ (সা.)-এর মক্কা জীবন' },
  { chapterNumber:  4, title: 'Life of Prophet Muhammad (SAW) in Madinah',          titleBn: 'হযরত মুহাম্মদ (সা.)-এর মদিনা জীবন' },
  { chapterNumber:  5, title: 'Character, Achievements and Reforms of Prophet Muhammad (SAW)', titleBn: 'হযরত মুহাম্মদ (সা.)-এর চরিত্র-কৃতিত্ব ও সংস্কারসমূহ' },
  { chapterNumber:  6, title: 'Khulafa-e-Rashedin (632–661 AD)',                    titleBn: 'খুলাফায়ে রাশিদীন (৬৩২–৬৬১ খ্রি.)' },
  { chapterNumber:  7, title: 'Umayyad Caliphate (661–750 AD)',                     titleBn: 'উমাইয়া খিলাফত (৬৬১–৭৫০ খ্রি.)' },
  { chapterNumber:  8, title: 'Abbasid Caliphate (750–1258 AD)',                    titleBn: 'আব্বাসীয় খিলাফত (৭৫০–১২৫৮ খ্রি.)' },
  { chapterNumber:  9, title: 'Muslim Rule in Spain (711–1492 AD)',                 titleBn: 'স্পেনে মুসলিম শাসন (৭১১–১৪৯২ খ্রি.)' },
  { chapterNumber: 10, title: 'Fatimid Caliphate and Ayyubid Dynasty (909–1250 AD)', titleBn: 'ফাতিমি খিলাফত ও আইয়্যুবী বংশ (৯০৯–১২৫০ খ্রি.)' },
];

// ── HSC: ইসলামের ইতিহাস ও সংস্কৃতি ২য় পত্র ───────────────────────────────
const HSC_ISLAM_HIST2: ChapterData[] = [
  { chapterNumber: 1, title: 'Establishment of Muslim Rule in India',               titleBn: 'ভারতে মুসলিম শাসন প্রতিষ্ঠা' },
  { chapterNumber: 2, title: 'Delhi Sultanate Era (1206–1526 AD)',                  titleBn: 'দিল্লি সালতানাত যুগ (১২০৬–১৫২৬ খ্রি.)' },
  { chapterNumber: 3, title: 'Mughal Rule in the Indian Subcontinent (1526–1858 AD)', titleBn: 'ভারত উপমহাদেশে মুঘল শাসন (১৫২৬–১৮৫৮ খ্রি.)' },
  { chapterNumber: 4, title: 'Company and Colonial Rule in Bengal',                 titleBn: 'বাংলায় কোম্পানি ও ঔপনিবেশিক শাসন' },
  { chapterNumber: 5, title: 'History of Bengal (Pakistan Era)',                    titleBn: 'বাংলার ইতিহাস (পাকিস্তান আমল)' },
  { chapterNumber: 6, title: 'Emergence of Independent and Sovereign Bangladesh',   titleBn: 'স্বাধীন ও সার্বভৌম বাংলাদেশের অভ্যুদয়' },
];

// ── HSC: ইসলাম শিক্ষা ১ম পত্র ──────────────────────────────────────────────
const HSC_ISLAM_STUDIES1: ChapterData[] = [
  { chapterNumber: 1, title: 'Islamic Education and Culture',                       titleBn: 'ইসলামি শিক্ষা ও সংস্কৃতি' },
  { chapterNumber: 2, title: 'Islam and Personal Life',                             titleBn: 'ইসলাম ও ব্যক্তিজীবন' },
  { chapterNumber: 3, title: 'Islam and Family Life',                               titleBn: 'ইসলাম ও পারিবারিক জীবন' },
  { chapterNumber: 4, title: 'Islam and Social Life',                               titleBn: 'ইসলাম ও সমাজজীবন' },
  { chapterNumber: 5, title: 'Economic System of Islam',                            titleBn: 'ইসলামের অর্থব্যবস্থা' },
  { chapterNumber: 6, title: 'Islamic State System',                                titleBn: 'ইসলামি রাষ্ট্রব্যবস্থা' },
  { chapterNumber: 7, title: 'International System of Islam',                       titleBn: 'ইসলামের আন্তর্জাতিক ব্যবস্থা' },
];

// ── HSC: ইসলাম শিক্ষা ২য় পত্র ──────────────────────────────────────────────
const HSC_ISLAM_STUDIES2: ChapterData[] = [
  { chapterNumber: 1, title: 'Al-Quran',                                            titleBn: 'আল-কুরআন' },
  { chapterNumber: 2, title: 'Al-Hadith',                                           titleBn: 'আল-হাদিস' },
  { chapterNumber: 3, title: 'Al-Ijma',                                             titleBn: 'আল-ইজমা' },
  { chapterNumber: 4, title: 'Al-Qiyas',                                            titleBn: 'আল-কিয়াস' },
  { chapterNumber: 5, title: 'Fiqh (Islamic Jurisprudence)',                        titleBn: 'ফিকহশাস্ত্র' },
  { chapterNumber: 6, title: 'Fundamental Acts of Worship',                         titleBn: 'মৌলিক ইবাদত' },
  { chapterNumber: 7, title: 'Tasawwuf (Sufism)',                                   titleBn: 'তাসাউফ' },
];

// ── HSC: পৌরনীতি ও সুশাসন ১ম পত্র ─────────────────────────────────────────
const HSC_CIVICS1: ChapterData[] = [
  { chapterNumber:  1, title: 'Introduction to Civics and Good Governance',        titleBn: 'পৌরনীতি ও সুশাসন পরিচিতি' },
  { chapterNumber:  2, title: 'Good Governance',                                   titleBn: 'সুশাসন' },
  { chapterNumber:  3, title: 'Values, Law, Liberty and Equality',                 titleBn: 'মূল্যবোধ, আইন, স্বাধীনতা ও সাম্য' },
  { chapterNumber:  4, title: 'E-Governance and Good Governance',                  titleBn: 'ই-গভর্নেন্স ও সুশাসন' },
  { chapterNumber:  5, title: 'Civic Rights, Duties and Human Rights',             titleBn: 'নাগরিক অধিকার ও কর্তব্য এবং মানবাধিকার' },
  { chapterNumber:  6, title: 'Political Party, Leadership and Good Governance',   titleBn: 'রাজনৈতিক দল, নেতৃত্ব ও সুশাসন' },
  { chapterNumber:  7, title: 'Government Structure',                              titleBn: 'সরকার কাঠামো' },
  { chapterNumber:  8, title: 'Public Opinion and Political Culture',              titleBn: 'জনমত ও রাজনৈতিক সংস্কৃতি' },
  { chapterNumber:  9, title: 'Public Service and Bureaucracy',                   titleBn: 'জনসেবা ও আমলাতন্ত্র' },
  { chapterNumber: 10, title: 'Patriotism and Nationalism',                        titleBn: 'দেশপ্রেম ও জাতীয়তা' },
];

// ── HSC: পৌরনীতি ও সুশাসন ২য় পত্র ─────────────────────────────────────────
const HSC_CIVICS2: ChapterData[] = [
  { chapterNumber:  1, title: 'Development of Representative Government in British India and Partition of India', titleBn: 'ব্রিটিশ ভারতে প্রতিনিধিত্বশীল সরকারের বিকাশ ও ভারত বিভাগ' },
  { chapterNumber:  2, title: 'From Pakistan to Bangladesh (1947–1971)',            titleBn: 'পাকিস্তান থেকে বাংলাদেশ (১৯৪৭–১৯৭১)' },
  { chapterNumber:  3, title: 'Political Personalities: Independence of Bangladesh', titleBn: 'রাজনৈতিক ব্যক্তিত্ব: বাংলাদেশের স্বাধীনতা লাভ' },
  { chapterNumber:  4, title: 'Constitution of Bangladesh',                        titleBn: 'বাংলাদেশের সংবিধান' },
  { chapterNumber:  5, title: 'Government and Administrative Structure of Bangladesh', titleBn: 'বাংলাদেশের সরকার ও প্রশাসনিক কাঠামো' },
  { chapterNumber:  6, title: 'Local Government',                                  titleBn: 'স্থানীয় শাসন' },
  { chapterNumber:  7, title: 'Constitutional Institutions',                       titleBn: 'সাংবিধানিক প্রতিষ্ঠান' },
  { chapterNumber:  8, title: 'Electoral System of Bangladesh',                    titleBn: 'বাংলাদেশের নির্বাচন ব্যবস্থা' },
  { chapterNumber:  9, title: 'Foreign Policy of Bangladesh',                      titleBn: 'বাংলাদেশের বৈদেশিক নীতি' },
  { chapterNumber: 10, title: 'Civic Problems and Our Responsibilities',            titleBn: 'নাগরিক সমস্যা ও আমাদের করণীয়' },
];

// ── HSC: অর্থনীতি ১ম পত্র ───────────────────────────────────────────────────
const HSC_ECONOMICS1: ChapterData[] = [
  { chapterNumber:  1, title: 'Fundamental Economic Problems and Their Solutions', titleBn: 'মৌলিক অর্থনৈতিক সমস্যা এবং এর সমাধান' },
  { chapterNumber:  2, title: 'Behavior of Consumer and Producer',                titleBn: 'ভোক্তা ও উৎপাদকের আচরণ' },
  { chapterNumber:  3, title: 'Production, Cost of Production and Revenue',       titleBn: 'উৎপাদন, উৎপাদন ব্যয় ও আয়' },
  { chapterNumber:  4, title: 'Market',                                           titleBn: 'বাজার' },
  { chapterNumber:  5, title: 'Labor Market',                                     titleBn: 'শ্রমবাজার' },
  { chapterNumber:  6, title: 'Capital',                                          titleBn: 'মূলধন' },
  { chapterNumber:  7, title: 'Organization',                                     titleBn: 'সংগঠন' },
  { chapterNumber:  8, title: 'Rent',                                             titleBn: 'খাজনা' },
  { chapterNumber:  9, title: 'Aggregate Income and Expenditure',                 titleBn: 'সামগ্রিক আয় ও ব্যয়' },
  { chapterNumber: 10, title: 'Money and Bank',                                   titleBn: 'মুদ্রা ও ব্যাংক' },
];

// ── HSC: অর্থনীতি ২য় পত্র ───────────────────────────────────────────────────
const HSC_ECONOMICS2: ChapterData[] = [
  { chapterNumber:  1, title: 'Introduction to Bangladesh Economy',               titleBn: 'বাংলাদেশের অর্থনীতি পরিচয়' },
  { chapterNumber:  2, title: 'Agriculture of Bangladesh',                        titleBn: 'বাংলাদেশের কৃষি' },
  { chapterNumber:  3, title: 'Industry of Bangladesh',                           titleBn: 'বাংলাদেশের শিল্প' },
  { chapterNumber:  4, title: 'Population, Human Resources and Self-Employment',  titleBn: 'জনসংখ্যা, মানবসম্পদ এবং আত্মকর্মসংস্থান' },
  { chapterNumber:  5, title: 'Food Security',                                    titleBn: 'খাদ্য নিরাপত্তা' },
  { chapterNumber:  6, title: 'Financing',                                        titleBn: 'অর্থায়ন' },
  { chapterNumber:  7, title: 'Inflation',                                        titleBn: 'মুদ্রাস্ফীতি' },
  { chapterNumber:  8, title: 'International Trade',                              titleBn: 'আন্তর্জাতিক বাণিজ্য' },
  { chapterNumber:  9, title: 'Government Finance',                               titleBn: 'সরকারি অর্থব্যবস্থা' },
  { chapterNumber: 10, title: 'Development Planning',                             titleBn: 'উন্নয়ন পরিকল্পনা' },
];

// ── HSC: সমাজবিজ্ঞান ১ম পত্র ────────────────────────────────────────────────
const HSC_SOCIOLOGY1: ChapterData[] = [
  { chapterNumber:  1, title: 'Origin and Development of Sociology',              titleBn: 'সমাজবিজ্ঞানের উৎপত্তি ও বিকাশ' },
  { chapterNumber:  2, title: 'Scientific Status of Sociology',                   titleBn: 'সমাজবিজ্ঞানের বৈজ্ঞানিক মর্যাদা' },
  { chapterNumber:  3, title: 'Doctrines and Contributions of Sociologists',      titleBn: 'সমাজবিজ্ঞানীদের মতবাদ ও অবদান' },
  { chapterNumber:  4, title: 'Basic Concepts of Sociology',                      titleBn: 'সমাজবিজ্ঞানের মৌল প্রত্যয়' },
  { chapterNumber:  5, title: 'Social Institutions',                              titleBn: 'সামাজিক প্রতিষ্ঠান' },
  { chapterNumber:  6, title: 'Factors Influencing Social Life',                  titleBn: 'সমাজজীবনে প্রভাব বিস্তারকারী উপাদান' },
  { chapterNumber:  7, title: 'Process of Socialization',                         titleBn: 'সামাজিকীকরণ প্রক্রিয়া' },
  { chapterNumber:  8, title: 'Social Stratification and Inequality',             titleBn: 'সামাজিক স্তরবিন্যাস ও অসমতা' },
  { chapterNumber:  9, title: 'Social System',                                    titleBn: 'সামাজিক ব্যবস্থা' },
  { chapterNumber: 10, title: 'Deviant Behavior and Crime',                       titleBn: 'বিচ্যুতিমূলক আচরণ এবং অপরাধ' },
  { chapterNumber: 11, title: 'Social Change',                                    titleBn: 'সামাজিক পরিবর্তন' },
];

// ── HSC: সমাজবিজ্ঞান ২য় পত্র ────────────────────────────────────────────────
const HSC_SOCIOLOGY2: ChapterData[] = [
  { chapterNumber:  1, title: 'Development of Sociology in Bangladesh',                  titleBn: 'বাংলাদেশে সমাজবিজ্ঞান চর্চার বিকাশ' },
  { chapterNumber:  2, title: 'Society and Culture of Bangladesh',                       titleBn: 'বাংলাদেশের সমাজ ও সংস্কৃতি' },
  { chapterNumber:  3, title: 'Society and Civilization of Bangladesh Based on Archaeology', titleBn: 'প্রত্নতত্ত্বের ভিত্তিতে বাংলাদেশের সমাজ ও সভ্যতা' },
  { chapterNumber:  4, title: 'Lifestyle of Ethnic Groups in Bangladesh',                titleBn: 'বাংলাদেশের নৃগোষ্ঠীর জীবনধারা' },
  { chapterNumber:  5, title: 'Socio-Economic and Political Background of the Emergence of Bangladesh', titleBn: 'বাংলাদেশের অভ্যুদয়ের আর্থ-সামাজিক ও রাজনৈতিক পটভূমি' },
  { chapterNumber:  6, title: 'Rural and Urban Society of Bangladesh',                   titleBn: 'বাংলাদেশের গ্রামীণ ও শহুরে সমাজ' },
  { chapterNumber:  7, title: 'Marriage, Family and Kinship in Bangladesh',              titleBn: 'বাংলাদেশে বিবাহ, পরিবার ও জ্ঞাতি সম্পর্ক' },
  { chapterNumber:  8, title: 'Social Change in Bangladesh',                             titleBn: 'বাংলাদেশের সামাজিক পরিবর্তন' },
  { chapterNumber:  9, title: 'Social Problems and Remedies in Bangladesh',              titleBn: 'বাংলাদেশের সামাজিক সমস্যা ও প্রতিকারের উপায়' },
  { chapterNumber: 10, title: 'Social Development of Bangladesh',                        titleBn: 'বাংলাদেশের সামাজিক উন্নয়ন' },
];

// ── HSC: যুক্তিবিদ্যা ১ম পত্র ───────────────────────────────────────────────
const HSC_LOGIC1: ChapterData[] = [
  { chapterNumber: 1, title: 'Introduction to Logic',                             titleBn: 'যুক্তিবিদ্যা পরিচিতি' },
  { chapterNumber: 2, title: 'Practical Aspects of Logic',                        titleBn: 'যুক্তিবিদ্যার প্রায়োগিক দিক' },
  { chapterNumber: 3, title: 'Elements of Argument',                              titleBn: 'যুক্তির উপাদান' },
  { chapterNumber: 4, title: 'Predicable',                                        titleBn: 'বিধেয়ক' },
  { chapterNumber: 5, title: 'Inference',                                         titleBn: 'অনুমান' },
  { chapterNumber: 6, title: 'Deductive Inference',                               titleBn: 'অবরোহ অনুমান' },
  { chapterNumber: 7, title: 'Inductive Inference and Its Basis',                 titleBn: 'আরোহ অনুমান ও আরোহ অনুমানের ভিত্তি' },
  { chapterNumber: 8, title: 'Symbolic Logic',                                    titleBn: 'প্রতীকী যুক্তিবিদ্যা' },
];

// ── HSC: যুক্তিবিদ্যা ২য় পত্র ───────────────────────────────────────────────
const HSC_LOGIC2: ChapterData[] = [
  { chapterNumber: 1, title: 'Logical Definition',                                titleBn: 'যৌক্তিক সংজ্ঞা' },
  { chapterNumber: 2, title: 'Logical Division',                                  titleBn: 'যৌক্তিক বিভাগ' },
  { chapterNumber: 3, title: 'Types of Induction',                                titleBn: 'আরোহের প্রকারভেদ' },
  { chapterNumber: 4, title: 'Hypothesis',                                        titleBn: 'প্রকল্প' },
  { chapterNumber: 5, title: 'Methods of Proving Causation',                      titleBn: 'কার্যকারণ সম্পর্ক প্রমাণ পদ্ধতি' },
  { chapterNumber: 6, title: 'Explanation',                                       titleBn: 'ব্যাখ্যা' },
  { chapterNumber: 7, title: 'Classification',                                    titleBn: 'শ্রেণীকরণ' },
  { chapterNumber: 8, title: 'Probability',                                       titleBn: 'সম্ভাবনা' },
];

// ── HSC: সমাজকর্ম ১ম পত্র ───────────────────────────────────────────────────
const HSC_SOCIAL_WORK1: ChapterData[] = [
  { chapterNumber: 1, title: 'Social Work: Nature and Scope',                     titleBn: 'সমাজকর্ম: প্রকৃতি ও পরিধি' },
  { chapterNumber: 2, title: 'Historical Background of Social Work Profession',   titleBn: 'সমাজকর্ম পেশার ঐতিহাসিক প্রেক্ষাপট' },
  { chapterNumber: 3, title: 'Values and Principles of Social Work',              titleBn: 'সমাজকর্মের মূল্যবোধ ও নীতিমালা' },
  { chapterNumber: 4, title: 'Concepts Related to Social Work',                   titleBn: 'সমাজকর্ম সম্পর্কিত প্রত্যয়' },
  { chapterNumber: 5, title: 'Relationship of Social Work with Other Disciplines and Professions', titleBn: 'সমাজকর্মের সাথে জ্ঞানের বিভিন্ন শাখা এবং পেশার সম্পর্ক' },
  { chapterNumber: 6, title: 'Methods of Social Work',                            titleBn: 'সমাজকর্মের পদ্ধতি' },
  { chapterNumber: 7, title: 'Social Policy, Planning and Social Work',           titleBn: 'সামাজিক নীতি ও পরিকল্পনা এবং সমাজকর্ম' },
  { chapterNumber: 8, title: 'Problems and Prospects of Social Work Profession',  titleBn: 'সমাজকর্ম পেশার সমস্যা ও সম্ভাবনা' },
];

// ── HSC: সমাজকর্ম ২য় পত্র ───────────────────────────────────────────────────
const HSC_SOCIAL_WORK2: ChapterData[] = [
  { chapterNumber: 1, title: 'Basic Human Needs in Bangladesh',                   titleBn: 'বাংলাদেশে মৌলিক মানবিক চাহিদা' },
  { chapterNumber: 2, title: 'Branches of Social Work',                           titleBn: 'সমাজকর্মের শাখা' },
  { chapterNumber: 3, title: 'Practice of Social Work in Solving Social Problems', titleBn: 'সামাজিক সমস্যা সমাধানে সমাজকর্মের অনুশীলন' },
  { chapterNumber: 4, title: 'Prevention of Social Problems and Social Institutions', titleBn: 'সামাজিক সমস্যা প্রতিরোধ এবং সামাজিক প্রতিষ্ঠান ও সংস্থা' },
  { chapterNumber: 5, title: 'Social Law and Social Work',                        titleBn: 'সামাজিক আইন এবং সমাজকর্ম' },
  { chapterNumber: 6, title: 'Government Social Development Programs in Bangladesh', titleBn: 'বাংলাদেশে সরকারি সমাজ উন্নয়ন কার্যক্রম' },
  { chapterNumber: 7, title: 'NGO Social Development Programs in Bangladesh',     titleBn: 'বাংলাদেশের বেসরকারি সমাজ উন্নয়ন কার্যক্রম' },
  { chapterNumber: 8, title: 'International Organizations\' Social Development Programs in Bangladesh', titleBn: 'বাংলাদেশে আন্তর্জাতিক সংস্থার সমাজ উন্নয়ন কার্যক্রম' },
  { chapterNumber: 9, title: 'Fieldwork and Practice in Social Work Education',   titleBn: 'সমাজকর্ম শিক্ষায় মাঠকর্ম ও অনুশীলন' },
];

// ── HSC: ভূগোল ১ম পত্র ──────────────────────────────────────────────────────
const HSC_GEOGRAPHY1: ChapterData[] = [
  { chapterNumber:  1, title: 'Physical Geography',                               titleBn: 'প্রাকৃতিক ভূগোল' },
  { chapterNumber:  2, title: 'Structure of the Earth',                           titleBn: 'পৃথিবীর গঠন' },
  { chapterNumber:  3, title: 'Landforms of the Earth',                           titleBn: 'পৃথিবীর ভূমিরূপ' },
  { chapterNumber:  4, title: 'Changes in Landforms',                             titleBn: 'ভূমিরূপ পরিবর্তন' },
  { chapterNumber:  5, title: 'Weathering and Denudation',                        titleBn: 'বিচূর্ণীভবন ও নগ্নীভবন' },
  { chapterNumber:  6, title: 'River and Erosion',                                titleBn: 'নদী ও ভূমিক্ষয়' },
  { chapterNumber:  7, title: 'Atmosphere and Environmental Pollution',           titleBn: 'বায়ুমণ্ডল এবং প্রাকৃতিক পরিবেশ দূষণ' },
  { chapterNumber:  8, title: 'Weather and Climate',                              titleBn: 'আবহাওয়া ও জলবায়ু' },
  { chapterNumber:  9, title: 'Climate Zones and Climate Change',                 titleBn: 'জলবায়ু অঞ্চলসমূহ ও জলবায়ু পরিবর্তন' },
  { chapterNumber: 10, title: 'Hydrosphere',                                      titleBn: 'বারিমণ্ডল' },
  { chapterNumber: 11, title: 'Ocean Currents',                                   titleBn: 'সমুদ্রস্রোত' },
  { chapterNumber: 12, title: 'Tides',                                            titleBn: 'জোয়ার-ভাটা' },
  { chapterNumber: 13, title: 'Biosphere',                                        titleBn: 'জীবমণ্ডল' },
  { chapterNumber: 14, title: 'GIS and Remote Sensing',                           titleBn: 'জিআইএস ও দূর অনুধাবন' },
];

// ── HSC: ভূগোল ২য় পত্র ──────────────────────────────────────────────────────
const HSC_GEOGRAPHY2: ChapterData[] = [
  { chapterNumber:  1, title: 'Human Geography',                                  titleBn: 'মানব ভূগোল' },
  { chapterNumber:  2, title: 'Regional Geography',                               titleBn: 'আঞ্চলিক ভূগোল' },
  { chapterNumber:  3, title: 'Population',                                       titleBn: 'জনসংখ্যা' },
  { chapterNumber:  4, title: 'Settlement',                                       titleBn: 'বসতি' },
  { chapterNumber:  5, title: 'Agriculture',                                      titleBn: 'কৃষি' },
  { chapterNumber:  6, title: 'Agriculture of Bangladesh',                        titleBn: 'বাংলাদেশের কৃষি' },
  { chapterNumber:  7, title: 'Mineral and Energy Resources',                     titleBn: 'খনিজ ও শক্তি সম্পদ' },
  { chapterNumber:  8, title: 'Mineral and Energy Resources of Bangladesh',       titleBn: 'বাংলাদেশের খনিজ ও শক্তি সম্পদ' },
  { chapterNumber:  9, title: 'Industry',                                         titleBn: 'শিল্প' },
  { chapterNumber: 10, title: 'Transport and Communication of Bangladesh',        titleBn: 'বাংলাদেশের পরিবহন ও যোগাযোগ' },
  { chapterNumber: 11, title: 'Trade of Bangladesh',                              titleBn: 'বাংলাদেশের বাণিজ্য' },
  { chapterNumber: 12, title: 'Disaster and Pollution',                           titleBn: 'দুর্যোগ ও দূষণ' },
  { chapterNumber: 13, title: 'Practical Geography',                              titleBn: 'ব্যবহারিক ভূগোল' },
];

// ═════════════════════════════════════════════════════════════════════════════
// MAIN
// ═════════════════════════════════════════════════════════════════════════════
async function main() {
  const client = await pool.connect();
  try {
    // Create missing HSC Islamic Studies subjects
    console.log('\n🔧 Ensuring HSC Islamic Studies subjects...');
    const islamStudies1Id = await ensureSubject(client,
      'Islamic Studies 1st Paper', 'ইসলাম শিক্ষা ১ম পত্র', 'bangla', 'hsc');
    const islamStudies2Id = await ensureSubject(client,
      'Islamic Studies 2nd Paper', 'ইসলাম শিক্ষা ২য় পত্র', 'bangla', 'hsc');

    const subjects = [
      // SSC Humanities
      { id: IDS.ssc_history_world,  name: 'SSC বাংলাদেশের ইতিহাস ও বিশ্বসভ্যতা (15)',  data: SSC_HISTORY_WORLD },
      { id: IDS.ssc_geo_env,        name: 'SSC ভূগোল ও পরিবেশ (15)',                    data: SSC_GEO_ENV },
      { id: IDS.ssc_economics,      name: 'SSC অর্থনীতি (10)',                          data: SSC_ECONOMICS },
      { id: IDS.ssc_civics,         name: 'SSC পৌরনীতি ও নাগরিকতা (11)',               data: SSC_CIVICS },
      // HSC Humanities
      { id: IDS.hsc_history1,       name: 'HSC ইতিহাস ১ম পত্র (8)',                    data: HSC_HISTORY1 },
      { id: IDS.hsc_history2,       name: 'HSC ইতিহাস ২য় পত্র (9)',                    data: HSC_HISTORY2 },
      { id: IDS.hsc_islam_hist1,    name: 'HSC ইসলামের ইতিহাস ও সংস্কৃতি ১ম পত্র (10)', data: HSC_ISLAM_HIST1 },
      { id: IDS.hsc_islam_hist2,    name: 'HSC ইসলামের ইতিহাস ও সংস্কৃতি ২য় পত্র (6)', data: HSC_ISLAM_HIST2 },
      { id: islamStudies1Id,        name: 'HSC ইসলাম শিক্ষা ১ম পত্র (7)',              data: HSC_ISLAM_STUDIES1 },
      { id: islamStudies2Id,        name: 'HSC ইসলাম শিক্ষা ২য় পত্র (7)',              data: HSC_ISLAM_STUDIES2 },
      { id: IDS.hsc_civics1,        name: 'HSC পৌরনীতি ও সুশাসন ১ম পত্র (10)',         data: HSC_CIVICS1 },
      { id: IDS.hsc_civics2,        name: 'HSC পৌরনীতি ও সুশাসন ২য় পত্র (10)',         data: HSC_CIVICS2 },
      { id: IDS.hsc_economics1,     name: 'HSC অর্থনীতি ১ম পত্র (10)',                 data: HSC_ECONOMICS1 },
      { id: IDS.hsc_economics2,     name: 'HSC অর্থনীতি ২য় পত্র (10)',                 data: HSC_ECONOMICS2 },
      { id: IDS.hsc_sociology1,     name: 'HSC সমাজবিজ্ঞান ১ম পত্র (11)',              data: HSC_SOCIOLOGY1 },
      { id: IDS.hsc_sociology2,     name: 'HSC সমাজবিজ্ঞান ২য় পত্র (10)',              data: HSC_SOCIOLOGY2 },
      { id: IDS.hsc_logic1,         name: 'HSC যুক্তিবিদ্যা ১ম পত্র (8)',              data: HSC_LOGIC1 },
      { id: IDS.hsc_logic2,         name: 'HSC যুক্তিবিদ্যা ২য় পত্র (8)',              data: HSC_LOGIC2 },
      { id: IDS.hsc_social_work1,   name: 'HSC সমাজকর্ম ১ম পত্র (8)',                  data: HSC_SOCIAL_WORK1 },
      { id: IDS.hsc_social_work2,   name: 'HSC সমাজকর্ম ২য় পত্র (9)',                  data: HSC_SOCIAL_WORK2 },
      { id: IDS.hsc_geography1,     name: 'HSC ভূগোল ১ম পত্র (14)',                    data: HSC_GEOGRAPHY1 },
      { id: IDS.hsc_geography2,     name: 'HSC ভূগোল ২য় পত্র (13)',                    data: HSC_GEOGRAPHY2 },
    ];

    for (const s of subjects) {
      console.log(`\n📚 ${s.name}`);
      await upsertChapters(client, s.id, s.data);
    }

    console.log('\n✅ Batch 3 complete! No data deleted.');
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(console.error);

/**
 * SAFE UPSERT script — NCTB Bangla Version Full Chapters (Batch 2)
 * Rule: NEVER deletes data. Inserts new rows or updates existing ones.
 * Also creates missing subjects (Hindu, Buddhist, Christian religion).
 * Run: npx tsx scripts/add-chapters-batch2.ts
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

interface SubjectChapters {
  subjectId: string;
  subjectName: string;
  chapters: ChapterData[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 1: Ensure missing subjects exist, return their IDs
// ─────────────────────────────────────────────────────────────────────────────
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
    console.log(`  ✓ Subject exists: ${nameBn}`);
    return existing.rows[0].id;
  }
  const result = await client.query(
    `INSERT INTO subjects (id, name, name_bn, curriculum_version, academic_level, is_active, created_at)
     VALUES (gen_random_uuid(), $1, $2, $3, $4, true, NOW())
     RETURNING id`,
    [name, nameBn, curriculumVersion, academicLevel]
  );
  console.log(`  ✅ Created subject: ${nameBn}`);
  return result.rows[0].id;
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 2: Upsert chapters (never delete)
// ─────────────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
// KNOWN Subject IDs (from DB)
// ─────────────────────────────────────────────────────────────────────────────
const KNOWN_IDS = {
  // SSC
  ssc_accounting:         '9f2f7dd5-9ab4-4430-94c8-0e8da95e3cf1',
  ssc_finance_banking:    '9794637f-7fed-4e15-9e83-78f5a9046f9a',
  ssc_business:           '2774cd4f-9c13-4acc-ba0f-607853dde895',
  ssc_general_sci_comm:   '55d79d1f-7076-4bc6-98ad-14f5082591c3',
  ssc_general_sci_hum:    '18f8ab73-3b6d-4155-b020-7b52f61c8aa1',
  ssc_general_math:       'ad2c1692-c084-42f0-95cb-a67ffbfd1cd0',
  ssc_ict:                '774adad8-f4f8-42ca-a208-cd0af01c7368',
  ssc_islam:              'c9995c5e-5439-44be-8f32-41c7df6c7f1c',
  ssc_bangla1:            'ef63922b-fcbd-4c70-8b4f-ef400a51f3d3',
  ssc_bangla2:            '22ab478b-b60c-48aa-b2f3-def874dd36c8',
  ssc_english1:           '993e8cb3-d00c-4cbb-bca3-34072aabe88e',
  ssc_english2:           '86b413ec-8da0-4a21-8553-3cba6ab1cc2b',
  // HSC
  hsc_accounting1:        'f827253a-9d1f-4d49-bfb2-9a8500f73a2a',
  hsc_accounting2:        'b14dda61-2f31-4b02-994e-513bf1056c61',
  hsc_bom1:               '5000ed3e-0602-4648-a37d-ef31f1eb20ad',
  hsc_bom2:               'dbfc1c19-6b37-4660-92b8-8011a057c159',
  hsc_finance1:           '7b568b2f-b322-45c4-8131-f5ee9c6581ac',
  hsc_finance2:           'b52e08ce-9cb1-4f0a-a139-8139c32c8fc5',
  hsc_production1:        'cf38840a-5350-43df-a831-92b4a45cb0d0',
  hsc_production2:        '8fadb31a-3b27-4c8c-9bd2-0bee45e1934e',
  hsc_ict:                'eb422110-51f8-4616-82ad-8809a231444d',
  hsc_bangla1:            '42b384f6-cfc1-4154-bdf3-cafc9d193d22',
  hsc_bangla2:            '13f6d566-2dd9-44e5-939f-57bbfa4c33b3',
  hsc_english1:           'a877beaf-860a-4580-8aa4-a3c8db436c41',
  hsc_english2:           '23c4bfb5-c9b3-4f31-ba32-acd6207a9a75',
};

// ─────────────────────────────────────────────────────────────────────────────
// CHAPTER DATA
// ─────────────────────────────────────────────────────────────────────────────

const SSC_ACCOUNTING: ChapterData[] = [
  { chapterNumber:  1, title: 'Introduction to Accounting',                       titleBn: 'হিসাববিজ্ঞান পরিচিতি' },
  { chapterNumber:  2, title: 'Transaction',                                       titleBn: 'লেনদেন' },
  { chapterNumber:  3, title: 'Double Entry System',                               titleBn: 'দুতরফা দাখিলা পদ্ধতি' },
  { chapterNumber:  4, title: 'Capital and Revenue Transactions',                  titleBn: 'মূলধন ও মুনাফা জাতীয় লেনদেন' },
  { chapterNumber:  5, title: 'Account',                                           titleBn: 'হিসাব' },
  { chapterNumber:  6, title: 'Journal',                                           titleBn: 'জাবেদা' },
  { chapterNumber:  7, title: 'Ledger',                                            titleBn: 'খতিয়ান' },
  { chapterNumber:  8, title: 'Cash Book',                                         titleBn: 'নগদান বই' },
  { chapterNumber:  9, title: 'Trial Balance',                                     titleBn: 'রেওয়ামিল' },
  { chapterNumber: 10, title: 'Financial Statements',                              titleBn: 'আর্থিক বিবরণী' },
  { chapterNumber: 11, title: 'Cost of Goods, Production Cost and Selling Price',  titleBn: 'পণ্যের ক্রয়মূল্য, উৎপাদন ব্যয় ও বিক্রয়মূল্য' },
  { chapterNumber: 12, title: 'Family and Self-Employment Accounting',             titleBn: 'পারিবারিক ও আত্মকর্মসংস্থানমূলক উদ্যোগের হিসাব' },
];

const SSC_FINANCE_BANKING: ChapterData[] = [
  { chapterNumber:  1, title: 'Finance and Business Finance',       titleBn: 'অর্থায়ন ও ব্যবসায় অর্থায়ন' },
  { chapterNumber:  2, title: 'Sources of Finance',                 titleBn: 'অর্থায়নের উৎস' },
  { chapterNumber:  3, title: 'Share, Bond and Debenture',         titleBn: 'শেয়ার, বন্ড ও ডিবেঞ্চার' },
  { chapterNumber:  4, title: 'Time Value of Money',                titleBn: 'অর্থের সময়মূল্য' },
  { chapterNumber:  5, title: 'Risk and Uncertainty',               titleBn: 'ঝুঁকি ও অনিশ্চয়তা' },
  { chapterNumber:  6, title: 'Capital Budgeting',                  titleBn: 'মূলধনি আয়-ব্যয় প্রাক্কলন' },
  { chapterNumber:  7, title: 'Cost of Capital',                    titleBn: 'মূলধন ব্যয়' },
  { chapterNumber:  8, title: 'Currency, Bank and Banking',         titleBn: 'মুদ্রা, ব্যাংক ও ব্যাংকিং' },
  { chapterNumber:  9, title: 'Banking Business and Its Types',     titleBn: 'ব্যাংকিং ব্যবসায় ও তার ধরন' },
  { chapterNumber: 10, title: 'Commercial Bank',                    titleBn: 'বাণিজ্যিক ব্যাংক' },
  { chapterNumber: 11, title: 'Bank Deposits',                      titleBn: 'ব্যাংকের আমানত' },
  { chapterNumber: 12, title: 'Bank and Customer',                  titleBn: 'ব্যাংক ও গ্রাহক' },
  { chapterNumber: 13, title: 'Central Bank',                       titleBn: 'কেন্দ্রীয় ব্যাংক' },
];

const SSC_BUSINESS: ChapterData[] = [
  { chapterNumber:  1, title: 'Introduction to Business',                       titleBn: 'ব্যবসায় পরিচিতি' },
  { chapterNumber:  2, title: 'Business Entrepreneurship and Entrepreneur',     titleBn: 'ব্যবসায় উদ্যোগ ও উদ্যোক্তা' },
  { chapterNumber:  3, title: 'Self-Employment',                                titleBn: 'আত্মকর্মসংস্থান' },
  { chapterNumber:  4, title: 'Business Based on Ownership',                    titleBn: 'মালিকানার ভিত্তিতে ব্যবসায়' },
  { chapterNumber:  5, title: 'Legal Aspects of Business',                      titleBn: 'ব্যবসায়ের আইনগত দিক' },
  { chapterNumber:  6, title: 'Business Plan',                                  titleBn: 'ব্যবসায় পরিকল্পনা' },
  { chapterNumber:  7, title: 'Industries of Bangladesh',                       titleBn: 'বাংলাদেশের শিল্প' },
  { chapterNumber:  8, title: 'Management of Business',                         titleBn: 'ব্যবসায় প্রতিষ্ঠানের ব্যবস্থাপনা' },
  { chapterNumber:  9, title: 'Marketing',                                      titleBn: 'বিপণন' },
  { chapterNumber: 10, title: 'Support Services for Business Entrepreneurship', titleBn: 'ব্যবসায় উদ্যোগ উন্নয়নে সহায়ক সেবা' },
  { chapterNumber: 11, title: 'Business Ethics and Social Responsibility',      titleBn: 'ব্যবসায় নৈতিকতা ও সামাজিক দায়িত্ব' },
  { chapterNumber: 12, title: 'Lessons from Successful Entrepreneurs',          titleBn: 'সফল উদ্যোক্তাদের জীবনী থেকে শিক্ষণীয়' },
];

// SSC General Science — shared by Commerce & Humanities
const SSC_GENERAL_SCIENCE: ChapterData[] = [
  { chapterNumber:  1, title: 'Better Lifestyle',                       titleBn: 'উন্নততর জীবনধারা' },
  { chapterNumber:  2, title: 'Water for Life',                         titleBn: 'জীবনের জন্য পানি' },
  { chapterNumber:  3, title: 'All About the Heart',                    titleBn: 'হৃদযন্ত্রের যত কথা' },
  { chapterNumber:  4, title: 'Beginning of New Life',                  titleBn: 'নবজীবনের সূচনা' },
  { chapterNumber:  5, title: 'We Need Light to See',                   titleBn: 'দেখতে হলে আলো চাই' },
  { chapterNumber:  6, title: 'Polymer',                                titleBn: 'পলিমার' },
  { chapterNumber:  7, title: 'Uses of Acid, Base and Salt',            titleBn: 'অম্ল, ক্ষারক ও লবণের ব্যবহার' },
  { chapterNumber:  8, title: 'Our Resources',                          titleBn: 'আমাদের সম্পদ' },
  { chapterNumber:  9, title: 'Living with Disaster',                   titleBn: 'দুর্যোগের সাথে বসবাস' },
  { chapterNumber: 10, title: 'Let Us Know About Force',                titleBn: 'এসো বলকে জানি' },
  { chapterNumber: 11, title: 'Biotechnology',                          titleBn: 'জীবপ্রযুক্তি' },
  { chapterNumber: 12, title: 'Electricity in Daily Life',              titleBn: 'প্রাত্যহিক জীবনে তড়িৎ' },
  { chapterNumber: 13, title: 'Everyone Is Close',                      titleBn: 'সবাই কাছাকাছি' },
  { chapterNumber: 14, title: 'Science to Save Life',                   titleBn: 'জীবন বাঁচাতে বিজ্ঞান' },
];

const SSC_GENERAL_MATH: ChapterData[] = [
  { chapterNumber:  1, title: 'Real Numbers',                          titleBn: 'বাস্তব সংখ্যা' },
  { chapterNumber:  2, title: 'Set and Function',                      titleBn: 'সেট ও ফাংশন' },
  { chapterNumber:  3, title: 'Algebraic Expression',                  titleBn: 'বীজগাণিতিক রাশি' },
  { chapterNumber:  4, title: 'Indices and Logarithm',                 titleBn: 'সূচক ও লগারিদম' },
  { chapterNumber:  5, title: 'Linear Equation in One Variable',       titleBn: 'এক চলকবিশিষ্ট সমীকরণ' },
  { chapterNumber:  6, title: 'Lines, Angles and Triangles',           titleBn: 'রেখা, কোণ ও ত্রিভুজ' },
  { chapterNumber:  7, title: 'Practical Geometry',                    titleBn: 'ব্যবহারিক জ্যামিতি' },
  { chapterNumber:  8, title: 'Circle',                                titleBn: 'বৃত্ত' },
  { chapterNumber:  9, title: 'Trigonometric Ratio',                   titleBn: 'ত্রিকোণমিতিক অনুপাত' },
  { chapterNumber: 10, title: 'Distance and Height',                   titleBn: 'দূরত্ব ও উচ্চতা' },
  { chapterNumber: 11, title: 'Algebraic Ratio and Proportion',        titleBn: 'বীজগাণিতিক অনুপাত ও সমানুপাত' },
  { chapterNumber: 12, title: 'Linear Equations in Two Variables',     titleBn: 'দুই চলকবিশিষ্ট সরল সহসমীকরণ' },
  { chapterNumber: 13, title: 'Finite Series',                         titleBn: 'সসীম ধারা' },
  { chapterNumber: 14, title: 'Ratio, Similarity and Symmetry',        titleBn: 'অনুপাত, সদৃশতা ও প্রতিসমতা' },
  { chapterNumber: 15, title: 'Theorems and Problems Related to Area', titleBn: 'ক্ষেত্রফল সম্পর্কিত উপপাদ্য ও সম্পাদ্য' },
  { chapterNumber: 16, title: 'Mensuration',                           titleBn: 'পরিমিতি' },
  { chapterNumber: 17, title: 'Statistics',                            titleBn: 'পরিসংখ্যান' },
];

const SSC_ICT: ChapterData[] = [
  { chapterNumber: 1, title: 'ICT and Our Bangladesh',              titleBn: 'তথ্য ও যোগাযোগ প্রযুক্তি এবং আমাদের বাংলাদেশ' },
  { chapterNumber: 2, title: 'Computer and User Security',          titleBn: 'কম্পিউটার ও কম্পিউটার ব্যবহারকারীর নিরাপত্তা' },
  { chapterNumber: 3, title: 'Internet in My Education',            titleBn: 'আমার শিক্ষায় ইন্টারনেট' },
  { chapterNumber: 4, title: 'My Writing and Calculation',          titleBn: 'আমার লেখালেখি ও হিসাব' },
  { chapterNumber: 5, title: 'Multimedia and Graphics',             titleBn: 'মাল্টিমিডিয়া ও গ্রাফিক্স' },
  { chapterNumber: 6, title: 'Use of Database',                     titleBn: 'ডেটাবেজের ব্যবহার' },
];

const SSC_ISLAM: ChapterData[] = [
  { chapterNumber: 1, title: 'Aqeedah and Moral Life',           titleBn: 'আকাইদ ও নৈতিক জীবন' },
  { chapterNumber: 2, title: 'Sources of Sharia',                titleBn: 'শরিয়তের উৎস' },
  { chapterNumber: 3, title: 'Ibadah',                           titleBn: 'ইবাদত' },
  { chapterNumber: 4, title: 'Akhlaq',                           titleBn: 'আখলাক' },
  { chapterNumber: 5, title: 'Ideal Life History',               titleBn: 'আদর্শ জীবনচরিত' },
];

const SSC_HINDU: ChapterData[] = [
  { chapterNumber:  1, title: 'Creator and Creation',                          titleBn: 'স্রষ্টা ও সৃষ্টি' },
  { chapterNumber:  2, title: 'Beliefs, Origin and Development of Hinduism',   titleBn: 'হিন্দুধর্মের বিশ্বাস, উৎপত্তি ও বিকাশ' },
  { chapterNumber:  3, title: 'Religious Rituals and Ceremonies',               titleBn: 'ধর্মীয় আচার-অনুষ্ঠান' },
  { chapterNumber:  4, title: 'Reform in Hinduism',                             titleBn: 'হিন্দুধর্মে সংস্কার' },
  { chapterNumber:  5, title: 'Gods/Goddesses and Worship',                     titleBn: 'দেব-দেবী ও পূজা' },
  { chapterNumber:  6, title: 'Yoga',                                           titleBn: 'যোগসাধনা' },
  { chapterNumber:  7, title: 'Moral Education in Scriptures',                  titleBn: 'ধর্মগ্রন্থে নৈতিক শিক্ষা' },
  { chapterNumber:  8, title: 'Religious Stories and Moral Education',          titleBn: 'ধর্মীয় উপাখ্যান ও নৈতিক শিক্ষা' },
  { chapterNumber:  9, title: 'Path of Religion and Ideal Life',               titleBn: 'ধর্মপথ ও আদর্শ জীবন' },
  { chapterNumber: 10, title: 'Avatars and Ideal Life History',                 titleBn: 'অবতার ও আদর্শ জীবনচরিত' },
];

const SSC_BUDDHIST: ChapterData[] = [
  { chapterNumber:  1, title: 'Life and Teachings of Gautama Buddha',    titleBn: 'গৌতম বুদ্ধের জীবন ও শিক্ষা' },
  { chapterNumber:  2, title: 'Buddha and Bodhisattva',                  titleBn: 'বুদ্ধ ও বোধিসত্ত্ব' },
  { chapterNumber:  3, title: 'Tripitaka',                               titleBn: 'ত্রিপিটক' },
  { chapterNumber:  4, title: 'Sutta and Ethical Verses',                titleBn: 'সূত্র ও নীতিগাথা' },
  { chapterNumber:  5, title: 'Buddhist Karma Theory',                   titleBn: 'বৌদ্ধ কর্মবাদ' },
  { chapterNumber:  6, title: 'Atthakatha',                              titleBn: 'অট্ঠকথা' },
  { chapterNumber:  7, title: 'Nirvana',                                 titleBn: 'নির্বাণ' },
  { chapterNumber:  8, title: 'Sangiti',                                 titleBn: 'সঙ্গীতি' },
  { chapterNumber:  9, title: 'Jataka',                                  titleBn: 'জাতক' },
  { chapterNumber: 10, title: 'Biographies',                             titleBn: 'চরিতমালা' },
  { chapterNumber: 11, title: 'History of Buddhism',                     titleBn: 'বৌদ্ধধর্মের ইতিহাস' },
  { chapterNumber: 12, title: 'Daily Duties and Disciplines of Monks and Lay Buddhists', titleBn: 'বৌদ্ধ ভিক্ষু ও গৃহীদের নিত্যকর্ম ও অনুশাসন' },
];

const SSC_CHRISTIAN: ChapterData[] = [
  { chapterNumber:  1, title: 'Call to the Path of Liberation',   titleBn: 'মুক্তির পথে আহ্বান' },
  { chapterNumber:  2, title: 'Freedom and I',                    titleBn: 'স্বাধীনতা ও আমি' },
  { chapterNumber:  3, title: 'My Freedom and Society',           titleBn: 'আমার স্বাধীনতা ও সমাজ' },
  { chapterNumber:  4, title: 'Growing Up in Freedom',            titleBn: 'স্বাধীনতায় বেড়ে ওঠা' },
  { chapterNumber:  5, title: 'Freedom and Obligation',           titleBn: 'স্বাধীনতা ও বাধ্যতা' },
  { chapterNumber:  6, title: 'Faithful Friend',                  titleBn: 'বিশ্বস্ত বন্ধু' },
  { chapterNumber:  7, title: 'Man and Woman',                    titleBn: 'পুরুষ ও নারী' },
  { chapterNumber:  8, title: 'Freedom and Calling',              titleBn: 'স্বাধীনতা ও আহ্বানলাভ' },
  { chapterNumber:  9, title: 'Before the Father',                titleBn: 'পিতার সম্মুখে' },
  { chapterNumber: 10, title: 'Healing a Sick World',             titleBn: 'অসুস্থ বিশ্বের আরোগ্য' },
  { chapterNumber: 11, title: 'Silent Voice of Conscience',       titleBn: 'বিবেকের নীরব কণ্ঠস্বর' },
  { chapterNumber: 12, title: 'Intense Pain of Heart',            titleBn: 'হৃদয়ের তীব্র যন্ত্রণা' },
  { chapterNumber: 13, title: 'Violence and Peace',               titleBn: 'সহিংসতা ও শান্তি' },
  { chapterNumber: 14, title: 'Want a Changed World',             titleBn: 'পরিবর্তিত বিশ্ব চাই' },
  { chapterNumber: 15, title: 'Our Path to Liberation',           titleBn: 'আমাদের মুক্তির পথ' },
];

// SSC English 1st Paper — Units (using chapterNumber as unit number)
const SSC_ENGLISH1: ChapterData[] = [
  { chapterNumber:  1, title: 'Sense of Self',                         titleBn: 'Unit 01: Sense of Self' },
  { chapterNumber:  2, title: 'Climate Change',                        titleBn: 'Unit 02: Climate Change' },
  { chapterNumber:  3, title: 'Pastimes',                              titleBn: 'Unit 03: Pastimes' },
  { chapterNumber:  4, title: 'Events and Festivals',                  titleBn: 'Unit 04: Events and Festivals' },
  { chapterNumber:  5, title: 'Problems Around Us',                    titleBn: 'Unit 05: Problems Around Us' },
  { chapterNumber:  6, title: 'Our Neighbours',                        titleBn: 'Unit 06: Our Neighbours' },
  { chapterNumber:  7, title: 'People Who Stand Out',                  titleBn: 'Unit 07: People Who Stand Out' },
  { chapterNumber:  8, title: 'World Heritage',                        titleBn: 'Unit 08: World Heritage' },
  { chapterNumber:  9, title: 'Unconventional Jobs',                   titleBn: 'Unit 09: Unconventional Jobs' },
  { chapterNumber: 10, title: 'Dreams',                                titleBn: 'Unit 10: Dreams' },
  { chapterNumber: 11, title: 'Reading from English Literature',       titleBn: 'Unit 11: Reading from English Literature' },
  { chapterNumber: 12, title: 'Roots',                                 titleBn: 'Unit 12: Roots' },
  { chapterNumber: 13, title: 'Loneliness',                            titleBn: 'Unit 13: Loneliness' },
  { chapterNumber: 14, title: 'Renewable Energy',                      titleBn: 'Unit 14: Renewable Energy' },
  { chapterNumber: 15, title: 'Media and Modes of E-communication',    titleBn: 'Unit 15: Media and Modes of E-communication' },
  { chapterNumber: 16, title: 'Graffiti',                              titleBn: 'Unit 16: Graffiti' },
];

// SSC Bangla 1st Paper — sections
const SSC_BANGLA1: ChapterData[] = [
  { chapterNumber: 1, title: 'Prose (গদ্য)',    titleBn: 'গদ্য' },
  { chapterNumber: 2, title: 'Poetry (পদ্য)',   titleBn: 'পদ্য' },
  { chapterNumber: 3, title: 'Supplementary Reading (সহপাঠ)', titleBn: 'সহপাঠ' },
];

// SSC Bangla 2nd Paper — sections
const SSC_BANGLA2: ChapterData[] = [
  { chapterNumber: 1, title: 'Grammar (ব্যাকরণ)',              titleBn: 'ব্যাকরণ' },
  { chapterNumber: 2, title: 'Construction / Writing (নির্মিতি)', titleBn: 'নির্মিতি' },
];

// SSC English 2nd Paper — sections
const SSC_ENGLISH2: ChapterData[] = [
  { chapterNumber: 1, title: 'Grammar',  titleBn: 'Grammar' },
  { chapterNumber: 2, title: 'Writing',  titleBn: 'Writing' },
];

// ─── HSC Accounting ──────────────────────────────────────────────────────────
const HSC_ACCOUNTING1: ChapterData[] = [
  { chapterNumber:  1, title: 'Introduction to Accounting',                    titleBn: 'হিসাববিজ্ঞান পরিচিতি' },
  { chapterNumber:  2, title: 'Books of Accounts',                             titleBn: 'হিসাবের বইসমূহ' },
  { chapterNumber:  3, title: 'Bank Reconciliation Statement',                 titleBn: 'ব্যাংক সমন্বয় বিবরণী' },
  { chapterNumber:  4, title: 'Trial Balance',                                 titleBn: 'রেওয়ামিল' },
  { chapterNumber:  5, title: 'Principles of Accounting',                      titleBn: 'হিসাববিজ্ঞানের নীতিমালা' },
  { chapterNumber:  6, title: 'Accounting for Receivables',                    titleBn: 'প্রাপ্য হিসাবসমূহের হিসাবরক্ষণ' },
  { chapterNumber:  7, title: 'Worksheet',                                     titleBn: 'কার্যপত্র' },
  { chapterNumber:  8, title: 'Accounting for Tangible and Intangible Assets', titleBn: 'দৃশ্যমান ও অদৃশ্যমান সম্পদের হিসাবরক্ষণ' },
  { chapterNumber:  9, title: 'Financial Statements',                          titleBn: 'আর্থিক বিবরণী' },
  { chapterNumber: 10, title: 'Single Entry System',                           titleBn: 'একতরফা দাখিলা পদ্ধতি' },
];

const HSC_ACCOUNTING2: ChapterData[] = [
  { chapterNumber:  1, title: 'Accounting for Non-Profit Organizations',       titleBn: 'অব্যবসায়ী প্রতিষ্ঠানের হিসাব' },
  { chapterNumber:  2, title: 'Partnership Business Accounting',               titleBn: 'অংশীদারি ব্যবসায়ের হিসাব' },
  { chapterNumber:  3, title: 'Cash Flow Statement',                           titleBn: 'নগদ প্রবাহ বিবরণী' },
  { chapterNumber:  4, title: 'Capital of Joint Stock Company',                titleBn: 'যৌথমূলধনী কোম্পানির মূলধন' },
  { chapterNumber:  5, title: 'Financial Statements of Joint Stock Company',   titleBn: 'যৌথমূলধনী কোম্পানির আর্থিক বিবরণী' },
  { chapterNumber:  6, title: 'Analysis of Financial Statements',              titleBn: 'আর্থিক বিবরণী বিশ্লেষণ' },
  { chapterNumber:  7, title: 'Manufacturing Cost and Wages/Salary Statement', titleBn: 'উৎপাদন ব্যয় হিসাব ও মজুরি ও বেতন বিবরণী' },
  { chapterNumber:  8, title: 'Inventory Accounting Methods',                  titleBn: 'মজুদপণ্যের হিসাবরক্ষণ পদ্ধতি' },
  { chapterNumber:  9, title: 'Cost and Classification of Cost',               titleBn: 'ব্যয় ও ব্যয়ের শ্রেণিবিভাগ' },
  { chapterNumber: 10, title: 'Introduction to Management Accounting',         titleBn: 'ব্যবস্থাপনা হিসাববিজ্ঞান পরিচিতি' },
];

// ─── HSC Business Organization & Management ───────────────────────────────────
const HSC_BOM1: ChapterData[] = [
  { chapterNumber:  1, title: 'Basic Concept of Business',                           titleBn: 'ব্যবসায়ের মৌলিক ধারণা' },
  { chapterNumber:  2, title: 'Business Environment',                                titleBn: 'ব্যবসায় পরিবেশ' },
  { chapterNumber:  3, title: 'Sole Proprietorship',                                 titleBn: 'একমালিকানা ব্যবসায়' },
  { chapterNumber:  4, title: 'Partnership Business',                                titleBn: 'অংশীদারি ব্যবসায়' },
  { chapterNumber:  5, title: 'Joint Stock Company',                                 titleBn: 'যৌথ মূলধনী ব্যবসায়' },
  { chapterNumber:  6, title: 'Cooperative Society',                                 titleBn: 'সমবায় সমিতি' },
  { chapterNumber:  7, title: 'State Business',                                      titleBn: 'রাষ্ট্রীয় ব্যবসায়' },
  { chapterNumber:  8, title: 'Legal Aspects of Business',                           titleBn: 'ব্যবসায়ের আইনগত দিক' },
  { chapterNumber:  9, title: 'Support Services for Business Entrepreneurship',      titleBn: 'ব্যবসায় উদ্যোগ গ্রহণে সহায়ক সেবা' },
  { chapterNumber: 10, title: 'Business Entrepreneurship',                           titleBn: 'ব্যবসায় উদ্যোগ' },
  { chapterNumber: 11, title: 'Use of ICT in Business',                              titleBn: 'ব্যবসায়ে তথ্য ও যোগাযোগ প্রযুক্তির ব্যবহার' },
  { chapterNumber: 12, title: 'Business Ethics and Social Accountability',           titleBn: 'ব্যবসায়ের নৈতিকতা ও সামাজিক দায়বদ্ধতা' },
];

const HSC_BOM2: ChapterData[] = [
  { chapterNumber:  1, title: 'Concept of Management',             titleBn: 'ব্যবস্থাপনার ধারণা' },
  { chapterNumber:  2, title: 'Principles of Management',          titleBn: 'ব্যবস্থাপনা নীতি' },
  { chapterNumber:  3, title: 'Planning and Decision Making',      titleBn: 'পরিকল্পনা প্রণয়ন ও সিদ্ধান্ত গ্রহণ' },
  { chapterNumber:  4, title: 'Organizing',                        titleBn: 'সংগঠিতকরণ' },
  { chapterNumber:  5, title: 'Staffing',                          titleBn: 'কর্মীসংস্থান' },
  { chapterNumber:  6, title: 'Leadership',                        titleBn: 'নেতৃত্ব' },
  { chapterNumber:  7, title: 'Motivation',                        titleBn: 'প্রেষণা' },
  { chapterNumber:  8, title: 'Communication',                     titleBn: 'যোগাযোগ' },
  { chapterNumber:  9, title: 'Coordination',                      titleBn: 'সমন্বয়সাধন' },
  { chapterNumber: 10, title: 'Controlling',                       titleBn: 'নিয়ন্ত্রণ' },
];

// ─── HSC Finance, Banking & Insurance ────────────────────────────────────────
const HSC_FINANCE1: ChapterData[] = [
  { chapterNumber: 1, title: 'Introduction to Finance',                       titleBn: 'অর্থায়নের সূচনা' },
  { chapterNumber: 2, title: 'Legal Aspects of Financial Market',             titleBn: 'আর্থিক বাজারের আইনগত দিকসমূহ' },
  { chapterNumber: 3, title: 'Time Value of Money',                           titleBn: 'অর্থের সময় মূল্য' },
  { chapterNumber: 4, title: 'Financial Analysis',                            titleBn: 'আর্থিক বিশ্লেষণ' },
  { chapterNumber: 5, title: 'Short and Medium Term Financing',               titleBn: 'স্বল্প ও মধ্যমেয়াদি অর্থায়ন' },
  { chapterNumber: 6, title: 'Long Term Financing',                           titleBn: 'দীর্ঘমেয়াদি অর্থায়ন' },
  { chapterNumber: 7, title: 'Cost of Capital',                               titleBn: 'মূলধন ব্যয়' },
  { chapterNumber: 8, title: 'Capital Budgeting and Investment Decision',     titleBn: 'মূলধন বাজেটিং ও বিনিয়োগ সিদ্ধান্ত' },
  { chapterNumber: 9, title: 'Risk and Rate of Return',                       titleBn: 'ঝুঁকি এবং মুনাফার হার' },
];

const HSC_FINANCE2: ChapterData[] = [
  { chapterNumber:  1, title: 'Basic Concept of Banking System',              titleBn: 'ব্যাংক ব্যবস্থার প্রাথমিক ধারণা' },
  { chapterNumber:  2, title: 'Central Bank',                                 titleBn: 'কেন্দ্রীয় ব্যাংক' },
  { chapterNumber:  3, title: 'Commercial Bank',                              titleBn: 'বাণিজ্যিক ব্যাংক' },
  { chapterNumber:  4, title: 'Bank Account',                                 titleBn: 'ব্যাংক হিসাব' },
  { chapterNumber:  5, title: 'Negotiable Instrument',                        titleBn: 'হস্তান্তরযোগ্য ঋণের দলিল' },
  { chapterNumber:  6, title: 'Cheque, Bill of Exchange and Promissory Note', titleBn: 'চেক, বিল অব এক্সচেঞ্জ ও প্রমিসরি নোট' },
  { chapterNumber:  7, title: 'Sources and Uses of Bank Funds',               titleBn: 'ব্যাংক তহবিলের উৎস ও ব্যবহার' },
  { chapterNumber:  8, title: 'Foreign Exchange and Foreign Currency',        titleBn: 'বৈদেশিক বিনিময় ও বৈদেশিক মুদ্রা' },
  { chapterNumber:  9, title: 'Electronic and Modern Banking',                titleBn: 'ইলেকট্রনিক ও আধুনিক ব্যাংকিং' },
  { chapterNumber: 10, title: 'Basic Concept of Insurance',                   titleBn: 'বিমা সম্পর্কে মৌলিক ধারণা' },
  { chapterNumber: 11, title: 'Life Insurance',                               titleBn: 'জীবন বিমা' },
  { chapterNumber: 12, title: 'Marine Insurance',                             titleBn: 'নৌ বিমা' },
  { chapterNumber: 13, title: 'Fire Insurance',                               titleBn: 'অগ্নিবিমা' },
  { chapterNumber: 14, title: 'Miscellaneous Insurance',                      titleBn: 'বিবিধ বিমা' },
];

// ─── HSC Production Management & Marketing ────────────────────────────────────
const HSC_PRODUCTION1: ChapterData[] = [
  { chapterNumber:  1, title: 'Production',                       titleBn: 'উৎপাদন' },
  { chapterNumber:  2, title: 'Factors of Production',            titleBn: 'উৎপাদনের উপকরণ' },
  { chapterNumber:  3, title: 'Scale of Production',              titleBn: 'উৎপাদনের মাত্রা' },
  { chapterNumber:  4, title: 'Production at Macro Level',        titleBn: 'সামষ্টিক পর্যায়ে উৎপাদন' },
  { chapterNumber:  5, title: 'Production Management',            titleBn: 'উৎপাদন ব্যবস্থাপনা' },
  { chapterNumber:  6, title: 'Product Design',                   titleBn: 'পণ্য ডিজাইন' },
  { chapterNumber:  7, title: 'Quality Management',               titleBn: 'মান ব্যবস্থাপনা' },
  { chapterNumber:  8, title: 'Production Capacity',              titleBn: 'উৎপাদন ক্ষমতা' },
  { chapterNumber:  9, title: 'Business Location',                titleBn: 'ব্যবসায়ের অবস্থান' },
  { chapterNumber: 10, title: 'Layout',                           titleBn: 'লে-আউট / বিন্যাস' },
];

const HSC_PRODUCTION2: ChapterData[] = [
  { chapterNumber:  1, title: 'Introduction to Marketing',                            titleBn: 'বিপণন পরিচিতি' },
  { chapterNumber:  2, title: 'Marketing Environment',                                titleBn: 'বিপণন পরিবেশ' },
  { chapterNumber:  3, title: 'Marketing Functions',                                  titleBn: 'বিপণন কার্যাবলি' },
  { chapterNumber:  4, title: 'Market Segmentation and Marketing Mix',               titleBn: 'বাজার বিভক্তিকরণ ও বিপণন মিশ্রণ' },
  { chapterNumber:  5, title: 'Product and Pricing',                                  titleBn: 'পণ্য ও পণ্যের মূল্য নির্ধারণ' },
  { chapterNumber:  6, title: 'Distribution Channel',                                 titleBn: 'পণ্য বণ্টন প্রণালি' },
  { chapterNumber:  7, title: 'Wholesale and Retail Business',                        titleBn: 'পাইকারি ব্যবসা ও খুচরা ব্যবসা' },
  { chapterNumber:  8, title: 'Sales Promotion and Advertising',                      titleBn: 'বিক্রয় প্রসার ও বিজ্ঞাপন' },
  { chapterNumber:  9, title: 'Personal Selling and Salesmanship',                    titleBn: 'ব্যক্তিক বিক্রয় ও বিক্রয়িকতা' },
  { chapterNumber: 10, title: 'Contemporary Issues in Marketing',                     titleBn: 'বিপণনের সমসাময়িক বিষয়াবলি' },
];

// ─── HSC ICT ──────────────────────────────────────────────────────────────────
const HSC_ICT: ChapterData[] = [
  { chapterNumber: 1, title: 'ICT: Global and Bangladesh Perspective',  titleBn: 'তথ্য ও যোগাযোগ প্রযুক্তি: বিশ্ব ও বাংলাদেশ প্রেক্ষিত' },
  { chapterNumber: 2, title: 'Communication Systems and Networking',    titleBn: 'কমিউনিকেশন সিস্টেমস ও নেটওয়ার্কিং' },
  { chapterNumber: 3, title: 'Number System and Digital Devices',       titleBn: 'সংখ্যা পদ্ধতি ও ডিজিটাল ডিভাইস' },
  { chapterNumber: 4, title: 'Introduction to Web Design and HTML',     titleBn: 'ওয়েব ডিজাইন পরিচিতি এবং HTML' },
  { chapterNumber: 5, title: 'Programming Language',                    titleBn: 'প্রোগ্রামিং ভাষা' },
  { chapterNumber: 6, title: 'Database Management System',              titleBn: 'ডেটাবেজ ম্যানেজমেন্ট সিস্টেম' },
];

// ─── HSC English 1st Paper — Units ────────────────────────────────────────────
const HSC_ENGLISH1: ChapterData[] = [
  { chapterNumber:  1, title: 'People or Institutions Making History', titleBn: 'Unit 01: People or Institutions Making History' },
  { chapterNumber:  2, title: 'Dreams',                               titleBn: 'Unit 02: Dreams' },
  { chapterNumber:  3, title: 'Lifestyle',                            titleBn: 'Unit 03: Lifestyle' },
  { chapterNumber:  4, title: 'Adolescence',                          titleBn: 'Unit 04: Adolescence' },
  { chapterNumber:  5, title: 'Youthful Achievers',                   titleBn: 'Unit 05: Youthful Achievers' },
  { chapterNumber:  6, title: 'Relationships',                        titleBn: 'Unit 06: Relationships' },
  { chapterNumber:  7, title: 'Human Rights',                         titleBn: 'Unit 07: Human Rights' },
  { chapterNumber:  8, title: 'Peace and Conflict',                   titleBn: 'Unit 08: Peace and Conflict' },
  { chapterNumber:  9, title: 'Tours and Travels',                    titleBn: 'Unit 09: Tours and Travels' },
  { chapterNumber: 10, title: 'Environment and Nature',               titleBn: 'Unit 10: Environment and Nature' },
  { chapterNumber: 11, title: 'Art and Craft',                        titleBn: 'Unit 11: Art and Craft' },
  { chapterNumber: 12, title: 'Education and Life',                   titleBn: 'Unit 12: Education and Life' },
  { chapterNumber: 13, title: 'Myths and Literature',                 titleBn: 'Unit 13: Myths and Literature' },
];

// ─── HSC Bangla 1st Paper ─────────────────────────────────────────────────────
const HSC_BANGLA1: ChapterData[] = [
  { chapterNumber: 1, title: 'Prose (গদ্য)',                       titleBn: 'গদ্য' },
  { chapterNumber: 2, title: 'Poetry (পদ্য)',                      titleBn: 'পদ্য' },
  { chapterNumber: 3, title: 'Novel — Lalsalu (সহপাঠ: উপন্যাস)',  titleBn: 'সহপাঠ: উপন্যাস (লালসালু)' },
  { chapterNumber: 4, title: 'Drama — Sirajuddaula (সহপাঠ: নাটক)', titleBn: 'সহপাঠ: নাটক (সিরাজউদ্দৌলা)' },
];

// ─── HSC Bangla 2nd Paper ─────────────────────────────────────────────────────
const HSC_BANGLA2: ChapterData[] = [
  { chapterNumber: 1, title: 'Grammar (ব্যাকরণ)',               titleBn: 'ব্যাকরণ' },
  { chapterNumber: 2, title: 'Construction / Writing (নির্মিতি)', titleBn: 'নির্মিতি' },
];

// ─── HSC English 2nd Paper ────────────────────────────────────────────────────
const HSC_ENGLISH2: ChapterData[] = [
  { chapterNumber: 1, title: 'Grammar',  titleBn: 'Grammar' },
  { chapterNumber: 2, title: 'Writing',  titleBn: 'Writing' },
];

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  const client = await pool.connect();
  try {
    // ── Ensure missing religion subjects exist ─────────────────────────────
    console.log('\n🔧 Ensuring religion subjects exist...');
    const hinduId    = await ensureSubject(client, 'SSC Hindu Religion & Moral Education',    'হিন্দুধর্ম ও নৈতিক শিক্ষা (SSC)',    'bangla', 'ssc');
    const buddhistId = await ensureSubject(client, 'SSC Buddhist Religion & Moral Education', 'বৌদ্ধধর্ম ও নৈতিক শিক্ষা (SSC)',    'bangla', 'ssc');
    const christianId= await ensureSubject(client, 'SSC Christian Religion & Moral Education','খ্রিষ্টধর্ম ও নৈতিক শিক্ষা (SSC)',   'bangla', 'ssc');

    // ── Build subject list ─────────────────────────────────────────────────
    const subjects: SubjectChapters[] = [
      // SSC
      { subjectId: KNOWN_IDS.ssc_accounting,       subjectName: 'SSC হিসাববিজ্ঞান',          chapters: SSC_ACCOUNTING },
      { subjectId: KNOWN_IDS.ssc_finance_banking,   subjectName: 'SSC ফিন্যান্স ও ব্যাংকিং',   chapters: SSC_FINANCE_BANKING },
      { subjectId: KNOWN_IDS.ssc_business,          subjectName: 'SSC ব্যবসায় উদ্যোগ',         chapters: SSC_BUSINESS },
      { subjectId: KNOWN_IDS.ssc_general_sci_comm,  subjectName: 'SSC সাধারণ বিজ্ঞান (Commerce)',chapters: SSC_GENERAL_SCIENCE },
      { subjectId: KNOWN_IDS.ssc_general_sci_hum,   subjectName: 'SSC সাধারণ বিজ্ঞান (Humanities)',chapters: SSC_GENERAL_SCIENCE },
      { subjectId: KNOWN_IDS.ssc_general_math,      subjectName: 'SSC সাধারণ গণিত',            chapters: SSC_GENERAL_MATH },
      { subjectId: KNOWN_IDS.ssc_ict,               subjectName: 'SSC ICT',                    chapters: SSC_ICT },
      { subjectId: KNOWN_IDS.ssc_islam,             subjectName: 'SSC ইসলাম ও নৈতিক শিক্ষা',  chapters: SSC_ISLAM },
      { subjectId: hinduId,                          subjectName: 'SSC হিন্দুধর্ম ও নৈতিক শিক্ষা', chapters: SSC_HINDU },
      { subjectId: buddhistId,                       subjectName: 'SSC বৌদ্ধধর্ম ও নৈতিক শিক্ষা',  chapters: SSC_BUDDHIST },
      { subjectId: christianId,                      subjectName: 'SSC খ্রিষ্টধর্ম ও নৈতিক শিক্ষা', chapters: SSC_CHRISTIAN },
      { subjectId: KNOWN_IDS.ssc_english1,           subjectName: 'SSC English 1st Paper (Units)',   chapters: SSC_ENGLISH1 },
      { subjectId: KNOWN_IDS.ssc_bangla1,            subjectName: 'SSC বাংলা ১ম পত্র',         chapters: SSC_BANGLA1 },
      { subjectId: KNOWN_IDS.ssc_bangla2,            subjectName: 'SSC বাংলা ২য় পত্র',         chapters: SSC_BANGLA2 },
      { subjectId: KNOWN_IDS.ssc_english2,           subjectName: 'SSC English 2nd Paper',     chapters: SSC_ENGLISH2 },
      // HSC
      { subjectId: KNOWN_IDS.hsc_accounting1,       subjectName: 'HSC হিসাববিজ্ঞান ১ম পত্র',  chapters: HSC_ACCOUNTING1 },
      { subjectId: KNOWN_IDS.hsc_accounting2,       subjectName: 'HSC হিসাববিজ্ঞান ২য় পত্র',  chapters: HSC_ACCOUNTING2 },
      { subjectId: KNOWN_IDS.hsc_bom1,              subjectName: 'HSC ব্যবসায় সংগঠন ও ব্যবস্থাপনা ১ম', chapters: HSC_BOM1 },
      { subjectId: KNOWN_IDS.hsc_bom2,              subjectName: 'HSC ব্যবসায় সংগঠন ও ব্যবস্থাপনা ২য়', chapters: HSC_BOM2 },
      { subjectId: KNOWN_IDS.hsc_finance1,          subjectName: 'HSC ফিন্যান্স, ব্যাংকিং ও বীমা ১ম', chapters: HSC_FINANCE1 },
      { subjectId: KNOWN_IDS.hsc_finance2,          subjectName: 'HSC ফিন্যান্স, ব্যাংকিং ও বীমা ২য়', chapters: HSC_FINANCE2 },
      { subjectId: KNOWN_IDS.hsc_production1,       subjectName: 'HSC উৎপাদন ব্যবস্থাপনা ও বিপণন ১ম', chapters: HSC_PRODUCTION1 },
      { subjectId: KNOWN_IDS.hsc_production2,       subjectName: 'HSC উৎপাদন ব্যবস্থাপনা ও বিপণন ২য়', chapters: HSC_PRODUCTION2 },
      { subjectId: KNOWN_IDS.hsc_ict,               subjectName: 'HSC ICT',                   chapters: HSC_ICT },
      { subjectId: KNOWN_IDS.hsc_english1,          subjectName: 'HSC English 1st Paper (Units)', chapters: HSC_ENGLISH1 },
      { subjectId: KNOWN_IDS.hsc_bangla1,           subjectName: 'HSC বাংলা ১ম পত্র',          chapters: HSC_BANGLA1 },
      { subjectId: KNOWN_IDS.hsc_bangla2,           subjectName: 'HSC বাংলা ২য় পত্র',          chapters: HSC_BANGLA2 },
      { subjectId: KNOWN_IDS.hsc_english2,          subjectName: 'HSC English 2nd Paper',      chapters: HSC_ENGLISH2 },
    ];

    // ── Upsert chapters ───────────────────────────────────────────────────
    for (const s of subjects) {
      console.log(`\n📚 ${s.subjectName} (${s.chapters.length} chapters)`);
      await upsertChapters(client, s.subjectId, s.chapters);
    }

    console.log('\n✅ All done! No existing data was deleted.');
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(console.error);

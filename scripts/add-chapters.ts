/**
 * SAFE UPSERT script for NCTB chapters.
 * Rule: NEVER deletes data. Only inserts new rows or updates existing ones.
 * Run: npx tsx scripts/add-chapters.ts
 */

import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/mcq_onushilon',
});

const API_BASE = 'http://localhost:8787/api'; // kept for reference

interface ChapterData {
  chapterNumber: number;
  title: string;       // English/transliterated
  titleBn: string;     // Bangla
}

interface SubjectChapters {
  subjectId: string;
  subjectName: string;
  chapters: ChapterData[];
}

const subjectsToAdd: SubjectChapters[] = [
  // ─── SSC Physics ───────────────────────────────────────────────────────────
  {
    subjectId: 'cafe614a-0f49-43fe-9c81-fe222020a300',
    subjectName: 'SSC Physics (পদার্থবিজ্ঞান SSC)',
    chapters: [
      { chapterNumber: 1,  title: 'Physical Quantities and Their Measurement', titleBn: 'ভৌত রাশি এবং তাদের পরিমাপ' },
      { chapterNumber: 2,  title: 'Motion',                                    titleBn: 'গতি' },
      { chapterNumber: 3,  title: 'Force',                                     titleBn: 'বল' },
      { chapterNumber: 4,  title: 'Work, Power and Energy',                    titleBn: 'কাজ, ক্ষমতা ও শক্তি' },
      { chapterNumber: 5,  title: 'States of Matter and Pressure',             titleBn: 'পদার্থের অবস্থা ও চাপ' },
      { chapterNumber: 6,  title: 'Effect of Heat on Matter',                  titleBn: 'বস্তুর ওপর তাপের প্রভাব' },
      { chapterNumber: 7,  title: 'Wave and Sound',                            titleBn: 'তরঙ্গ ও শব্দ' },
      { chapterNumber: 8,  title: 'Reflection of Light',                       titleBn: 'আলোর প্রতিফলন' },
      { chapterNumber: 9,  title: 'Refraction of Light',                       titleBn: 'আলোর প্রতিসরণ' },
      { chapterNumber: 10, title: 'Static Electricity',                        titleBn: 'স্থির তড়িৎ' },
      { chapterNumber: 11, title: 'Current Electricity',                       titleBn: 'চল তড়িৎ' },
      { chapterNumber: 12, title: 'Magnetic Effect of Electric Current',       titleBn: 'তড়িতের চৌম্বক ক্রিয়া' },
      { chapterNumber: 13, title: 'Modern Physics and Electronics',            titleBn: 'আধুনিক পদার্থবিজ্ঞান ও ইলেকট্রনিক্স' },
      { chapterNumber: 14, title: 'Physics in Saving Lives',                   titleBn: 'জীবন বাঁচাতে পদার্থবিজ্ঞান' },
    ],
  },

  // ─── SSC Biology ───────────────────────────────────────────────────────────
  {
    subjectId: '23897564-4146-4a7e-b67d-f984926d5148',
    subjectName: 'SSC Biology (জীববিজ্ঞান SSC)',
    chapters: [
      { chapterNumber: 1,  title: 'Introduction to Life',                      titleBn: 'জীবন পাঠ' },
      { chapterNumber: 2,  title: 'Cell and Tissue',                           titleBn: 'জীব কোষ ও টিস্যু' },
      { chapterNumber: 3,  title: 'Cell Division',                             titleBn: 'কোষ বিভাজন' },
      { chapterNumber: 4,  title: 'Bioenergetics',                             titleBn: 'জীবনীশক্তি' },
      { chapterNumber: 5,  title: 'Food, Nutrition and Digestion',             titleBn: 'খাদ্য, পুষ্টি এবং পরিপাক' },
      { chapterNumber: 6,  title: 'Transport in Living Organisms',             titleBn: 'জীবে পরিবহন' },
      { chapterNumber: 7,  title: 'Gaseous Exchange',                          titleBn: 'গ্যাসীয় বিনিময়' },
      { chapterNumber: 8,  title: 'Excretion',                                 titleBn: 'রেচন প্রক্রিয়া' },
      { chapterNumber: 9,  title: 'Support and Movement',                      titleBn: 'দৃঢ়তা প্রদান ও চলন' },
      { chapterNumber: 10, title: 'Coordination',                              titleBn: 'সমন্বয়' },
      { chapterNumber: 11, title: 'Reproduction in Organisms',                 titleBn: 'জীবের প্রজনন' },
      { chapterNumber: 12, title: 'Heredity and Evolution',                    titleBn: 'জীবের বংশগতি ও বিবর্তন' },
      { chapterNumber: 13, title: 'Environment of Organisms',                  titleBn: 'জীবের পরিবেশ' },
      { chapterNumber: 14, title: 'Biotechnology',                             titleBn: 'জীবপ্রযুক্তি' },
    ],
  },

  // ─── SSC Higher Mathematics ─────────────────────────────────────────────────
  {
    subjectId: '6c67f146-ff40-4338-bcff-e31dd8680b97',
    subjectName: 'SSC Higher Mathematics (উচ্চতর গণিত SSC)',
    chapters: [
      { chapterNumber: 1,  title: 'Set and Function',                          titleBn: 'সেট ও ফাংশন' },
      { chapterNumber: 2,  title: 'Algebraic Expression',                      titleBn: 'বীজগাণিতিক রাশি' },
      { chapterNumber: 3,  title: 'Geometry',                                  titleBn: 'জ্যামিতি' },
      { chapterNumber: 4,  title: 'Geometric Construction',                    titleBn: 'জ্যামিতিক অঙ্কন' },
      { chapterNumber: 5,  title: 'Equations',                                 titleBn: 'সমীকরণ' },
      { chapterNumber: 6,  title: 'Inequality',                                titleBn: 'অসমতা' },
      { chapterNumber: 7,  title: 'Infinite Series',                           titleBn: 'অসীম ধারা' },
      { chapterNumber: 8,  title: 'Trigonometry',                              titleBn: 'ত্রিকোণমিতি' },
      { chapterNumber: 9,  title: 'Exponential and Logarithmic Functions',     titleBn: 'সূচকীয় ও লগারিদমীয় ফাংশন' },
      { chapterNumber: 10, title: 'Binomial Expansion',                        titleBn: 'দ্বিপদী বিস্তৃতি' },
      { chapterNumber: 11, title: 'Coordinate Geometry',                       titleBn: 'স্থানাঙ্ক জ্যামিতি' },
      { chapterNumber: 12, title: 'Plane Vector',                              titleBn: 'সমতলীয় ভেক্টর' },
      { chapterNumber: 13, title: 'Solid Geometry',                            titleBn: 'ঘন জ্যামিতি' },
      { chapterNumber: 14, title: 'Probability',                               titleBn: 'সম্ভাবনা' },
    ],
  },

  // ─── HSC Physics 1st Paper ──────────────────────────────────────────────────
  {
    subjectId: 'd498477a-7db0-450b-a86f-7b066b70ed65',
    subjectName: 'HSC Physics 1st Paper (পদার্থবিজ্ঞান ১ম পত্র)',
    chapters: [
      { chapterNumber: 1,  title: 'Physical World and Measurement',            titleBn: 'ভৌত জগৎ ও পরিমাপ' },
      { chapterNumber: 2,  title: 'Vector',                                    titleBn: 'ভেক্টর' },
      { chapterNumber: 3,  title: 'Dynamics',                                  titleBn: 'গতিবিদ্যা' },
      { chapterNumber: 4,  title: 'Newtonian Mechanics',                       titleBn: 'নিউটনিয়ান বলবিদ্যা' },
      { chapterNumber: 5,  title: 'Work, Energy and Power',                    titleBn: 'কাজ, শক্তি ও ক্ষমতা' },
      { chapterNumber: 6,  title: 'Gravitation and Gravity',                   titleBn: 'মহাকর্ষ ও অভিকর্ষ' },
      { chapterNumber: 7,  title: 'Properties of Matter',                      titleBn: 'পদার্থের গাঠনিক ধর্ম' },
      { chapterNumber: 8,  title: 'Periodic Motion',                           titleBn: 'পর্যাবৃত্ত গতি' },
      { chapterNumber: 9,  title: 'Wave',                                      titleBn: 'তরঙ্গ' },
      { chapterNumber: 10, title: 'Ideal Gas and Kinetic Theory of Gases',     titleBn: 'আদর্শ গ্যাস ও গ্যাসের গতিতত্ত্ব' },
    ],
  },

  // ─── HSC Physics 2nd Paper ──────────────────────────────────────────────────
  {
    subjectId: 'ef8fe1ea-ebc0-458f-bfc6-3db4c282f3e3',
    subjectName: 'HSC Physics 2nd Paper (পদার্থবিজ্ঞান ২য় পত্র)',
    chapters: [
      { chapterNumber: 1,  title: 'Thermodynamics',                            titleBn: 'তাপগতিবিদ্যা' },
      { chapterNumber: 2,  title: 'Static Electricity',                        titleBn: 'স্থির তড়িৎ' },
      { chapterNumber: 3,  title: 'Current Electricity',                       titleBn: 'চল তড়িৎ' },
      { chapterNumber: 4,  title: 'Magnetic Effect of Current and Magnetism',  titleBn: 'তড়িৎ প্রবাহের চৌম্বক ক্রিয়া ও চুম্বকত্ব' },
      { chapterNumber: 5,  title: 'Electromagnetic Induction and AC',          titleBn: 'তড়িৎচৌম্বকীয় আবেশ ও পরিবর্তী প্রবাহ' },
      { chapterNumber: 6,  title: 'Geometric Optics',                          titleBn: 'জ্যামিতিক আলোকবিজ্ঞান' },
      { chapterNumber: 7,  title: 'Physical Optics',                           titleBn: 'ভৌত আলোকবিজ্ঞান' },
      { chapterNumber: 8,  title: 'Introduction to Modern Physics',            titleBn: 'আধুনিক পদার্থবিজ্ঞানের সূচনা' },
      { chapterNumber: 9,  title: 'Atomic Models and Nuclear Physics',         titleBn: 'পরমাণুর মডেল এবং নিউক্লিয়ার পদার্থবিজ্ঞান' },
      { chapterNumber: 10, title: 'Semiconductor and Electronics',             titleBn: 'সেমিকন্ডাক্টর ও ইলেকট্রনিক্স' },
      { chapterNumber: 11, title: 'Astronomy',                                 titleBn: 'জ্যোতির্বিজ্ঞান' },
    ],
  },

  // ─── HSC Chemistry 1st Paper ────────────────────────────────────────────────
  {
    subjectId: 'bf922935-7235-42f2-8bf6-e7a156a24d8b',
    subjectName: 'HSC Chemistry 1st Paper (রসায়ন ১ম পত্র)',
    chapters: [
      { chapterNumber: 1, title: 'Safe Use of Laboratory',                     titleBn: 'ল্যাবরেটরির নিরাপদ ব্যবহার' },
      { chapterNumber: 2, title: 'Qualitative Chemistry',                      titleBn: 'গুণগত রসায়ন' },
      { chapterNumber: 3, title: 'Periodic Properties of Elements and Chemical Bond', titleBn: 'মৌলের পর্যায়বৃত্ত ধর্ম ও রাসায়নিক বন্ধন' },
      { chapterNumber: 4, title: 'Chemical Change',                            titleBn: 'রাসায়নিক পরিবর্তন' },
      { chapterNumber: 5, title: 'Applied Chemistry',                          titleBn: 'কর্মমুখী রসায়ন' },
    ],
  },

  // ─── HSC Chemistry 2nd Paper ────────────────────────────────────────────────
  {
    subjectId: 'cf451e01-eecb-4dae-bd4e-c97638b51651',
    subjectName: 'HSC Chemistry 2nd Paper (রসায়ন ২য় পত্র)',
    chapters: [
      { chapterNumber: 1, title: 'Environmental Chemistry',                    titleBn: 'পরিবেশ রসায়ন' },
      { chapterNumber: 2, title: 'Organic Chemistry',                          titleBn: 'জৈব রসায়ন' },
      { chapterNumber: 3, title: 'Quantitative Chemistry',                     titleBn: 'পরিমাণগত রসায়ন' },
      { chapterNumber: 4, title: 'Electrochemistry',                           titleBn: 'তড়িৎ রসায়ন' },
      { chapterNumber: 5, title: 'Economic Chemistry',                         titleBn: 'অর্থনৈতিক রসায়ন' },
    ],
  },

  // ─── HSC Biology 1st Paper (Botany) ─────────────────────────────────────────
  {
    subjectId: '809aad3f-67f6-4cdc-ad79-76fba28cb270',
    subjectName: 'HSC Biology 1st Paper / Botany (জীববিজ্ঞান ১ম পত্র)',
    chapters: [
      { chapterNumber: 1,  title: 'Cell and Its Structure',                    titleBn: 'কোষ ও এর গঠন' },
      { chapterNumber: 2,  title: 'Cell Division',                             titleBn: 'কোষ বিভাজন' },
      { chapterNumber: 3,  title: 'Cell Chemistry',                            titleBn: 'কোষ রসায়ন' },
      { chapterNumber: 4,  title: 'Microorganisms',                            titleBn: 'অণুজীব' },
      { chapterNumber: 5,  title: 'Algae and Fungi',                           titleBn: 'শৈবাল ও ছত্রাক' },
      { chapterNumber: 6,  title: 'Bryophyta and Pteridophyta',                titleBn: 'ব্রায়োফাইটা ও টেরিডোফাইটা' },
      { chapterNumber: 7,  title: 'Gymnosperm and Angiosperm',                 titleBn: 'নগ্নবীজী ও আবৃতবীজী উদ্ভিদ' },
      { chapterNumber: 8,  title: 'Tissue and Tissue System',                  titleBn: 'টিস্যু ও টিস্যুতন্ত্র' },
      { chapterNumber: 9,  title: 'Plant Physiology',                          titleBn: 'উদ্ভিদ শারীরতত্ত্ব' },
      { chapterNumber: 10, title: 'Plant Reproduction',                        titleBn: 'উদ্ভিদ প্রজনন' },
      { chapterNumber: 11, title: 'Biotechnology',                             titleBn: 'জীবপ্রযুক্তি' },
      { chapterNumber: 12, title: 'Environment, Distribution and Conservation of Organisms', titleBn: 'জীবের পরিবেশ, বিস্তার ও সংরক্ষণ' },
    ],
  },

  // ─── HSC Biology 2nd Paper (Zoology) ────────────────────────────────────────
  {
    subjectId: '70a66766-d775-4ebb-bc79-96e9c8479201',
    subjectName: 'HSC Biology 2nd Paper / Zoology (জীববিজ্ঞান ২য় পত্র)',
    chapters: [
      { chapterNumber: 1,  title: 'Diversity and Classification of Animals',   titleBn: 'প্রাণীর বিভিন্নতা ও শ্রেণিবিন্যাস' },
      { chapterNumber: 2,  title: 'Introduction to Animals',                   titleBn: 'প্রাণীর পরিচিতি' },
      { chapterNumber: 3,  title: 'Human Physiology: Digestion and Absorption',titleBn: 'মানব শরীরতত্ত্ব: পরিপাক ও শোষণ' },
      { chapterNumber: 4,  title: 'Human Physiology: Blood and Circulation',   titleBn: 'মানব শরীরতত্ত্ব: রক্ত ও সংবহন' },
      { chapterNumber: 5,  title: 'Human Physiology: Respiration',             titleBn: 'মানব শরীরতত্ত্ব: শ্বসন ও শ্বাসক্রিয়া' },
      { chapterNumber: 6,  title: 'Human Physiology: Excretion',               titleBn: 'মানব শরীরতত্ত্ব: বর্জ্য ও নিষ্কাশন' },
      { chapterNumber: 7,  title: 'Human Physiology: Movement',                titleBn: 'মানব শরীরতত্ত্ব: চলন ও অঙ্গচালনা' },
      { chapterNumber: 8,  title: 'Human Physiology: Coordination and Control',titleBn: 'মানব শরীরতত্ত্ব: সমন্বয় ও নিয়ন্ত্রণ' },
      { chapterNumber: 9,  title: 'Continuity of Human Life',                  titleBn: 'মানব জীবনের ধারাবাহিকতা' },
      { chapterNumber: 10, title: 'Defence of Human Body',                     titleBn: 'মানবদেহের প্রতিরক্ষা' },
      { chapterNumber: 11, title: 'Genetics and Evolution',                    titleBn: 'জিনতত্ত্ব ও বিবর্তন' },
      { chapterNumber: 12, title: 'Animal Behaviour',                          titleBn: 'প্রাণীর আচরণ' },
    ],
  },

  // ─── HSC Higher Mathematics 1st Paper ───────────────────────────────────────
  {
    subjectId: 'f8ec16ee-ad65-4258-9765-90b4e5e06fe7',
    subjectName: 'HSC Higher Mathematics 1st Paper (উচ্চতর গণিত ১ম পত্র)',
    chapters: [
      { chapterNumber: 1,  title: 'Matrix and Determinant',                    titleBn: 'ম্যাট্রিক্স ও নির্ণায়ক' },
      { chapterNumber: 2,  title: 'Vector',                                    titleBn: 'ভেক্টর' },
      { chapterNumber: 3,  title: 'Straight Line',                             titleBn: 'সরলরেখা' },
      { chapterNumber: 4,  title: 'Circle',                                    titleBn: 'বৃত্ত' },
      { chapterNumber: 5,  title: 'Permutation and Combination',               titleBn: 'বিন্যাস ও সমাবেশ' },
      { chapterNumber: 6,  title: 'Trigonometric Ratios',                      titleBn: 'ত্রিকোণমিতিক অনুপাত' },
      { chapterNumber: 7,  title: 'Trigonometric Ratios of Compound Angles',   titleBn: 'সংযুক্ত কোণের ত্রিকোণমিতিক অনুপাত' },
      { chapterNumber: 8,  title: 'Function and Graph of Function',            titleBn: 'ফাংশন ও ফাংশনের লেখচিত্র' },
      { chapterNumber: 9,  title: 'Differentiation',                           titleBn: 'অন্তরীকরণ' },
      { chapterNumber: 10, title: 'Integration',                               titleBn: 'যোগজীকরণ' },
    ],
  },

  // ─── HSC Higher Mathematics 2nd Paper ───────────────────────────────────────
  {
    subjectId: '92f6a270-cc96-41e5-8001-3c95fca31c75',
    subjectName: 'HSC Higher Mathematics 2nd Paper (উচ্চতর গণিত ২য় পত্র)',
    chapters: [
      { chapterNumber: 1,  title: 'Real Numbers and Inequality',               titleBn: 'বাস্তব সংখ্যা ও অসমতা' },
      { chapterNumber: 2,  title: 'Linear Programming',                        titleBn: 'যোগাশ্রয়ী প্রোগ্রাম' },
      { chapterNumber: 3,  title: 'Complex Numbers',                           titleBn: 'জটিল সংখ্যা' },
      { chapterNumber: 4,  title: 'Polynomial and Polynomial Equations',       titleBn: 'বহুপদী ও বহুপদী সমীকরণ' },
      { chapterNumber: 5,  title: 'Binomial Expansion',                        titleBn: 'দ্বিপদী বিস্তৃতি' },
      { chapterNumber: 6,  title: 'Conics',                                    titleBn: 'কণিক' },
      { chapterNumber: 7,  title: 'Inverse Trigonometric Functions and Equations', titleBn: 'বিপরীত ত্রিকোণমিতিক ফাংশন ও ত্রিকোণমিতিক সমীকরণ' },
      { chapterNumber: 8,  title: 'Statics',                                   titleBn: 'স্থিতিবিদ্যা' },
      { chapterNumber: 9,  title: 'Motion of Two Particles in a Plane',        titleBn: 'সমতলে দ্বিকণার গতি' },
      { chapterNumber: 10, title: 'Measures of Dispersion and Probability',    titleBn: 'বিস্তারের পরিমাপ ও সম্ভাবনা' },
    ],
  },
];

async function upsertChapters(subjectId: string, chapters: ChapterData[]): Promise<void> {
  const client = await pool.connect();
  try {
    for (const ch of chapters) {
      // Check if this chapter_number already exists for this subject
      const existing = await client.query(
        `SELECT id FROM chapters WHERE subject_id = $1 AND chapter_number = $2`,
        [subjectId, ch.chapterNumber]
      );

      if (existing.rows.length > 0) {
        // UPDATE existing row — never delete
        await client.query(
          `UPDATE chapters SET title = $1, title_bn = $2 WHERE subject_id = $3 AND chapter_number = $4`,
          [ch.title, ch.titleBn, subjectId, ch.chapterNumber]
        );
        console.log(`  🔄 Updated ${ch.chapterNumber.toString().padStart(2,'0')}. ${ch.titleBn}`);
      } else {
        // INSERT new row
        await client.query(
          `INSERT INTO chapters (id, subject_id, chapter_number, title, title_bn, created_at)
           VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW())`,
          [subjectId, ch.chapterNumber, ch.title, ch.titleBn]
        );
        console.log(`  ✅ Added   ${ch.chapterNumber.toString().padStart(2,'0')}. ${ch.titleBn}`);
      }
    }
  } finally {
    client.release();
  }
}

async function main() {
  for (const subject of subjectsToAdd) {
    console.log(`\n📚 ${subject.subjectName}`);
    await upsertChapters(subject.subjectId, subject.chapters);
  }
  console.log('\n✨ Done! No data was deleted.');
  await pool.end();
}

main().catch(console.error);


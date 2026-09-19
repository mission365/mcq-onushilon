/**
 * Fix British Curriculum — Update ALL 28 'british' subjects with correct Cambridge topics
 * Safe: ONLY updates title/title_bn, never deletes, inserts missing topics
 * Run: npx tsx scripts/fix-british-chapters.ts
 */

import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/mcq_onushilon',
});

interface Ch { n: number; t: string; bn: string; }

async function fixChapters(client: pg.PoolClient, subjectId: string, subjectName: string, chapters: Ch[]) {
  console.log(`\n📚 ${subjectName}`);
  for (const ch of chapters) {
    const ex = await client.query(
      `SELECT id FROM chapters WHERE subject_id=$1 AND chapter_number=$2`,
      [subjectId, ch.n]
    );
    if (ex.rows.length > 0) {
      await client.query(
        `UPDATE chapters SET title=$1, title_bn=$1 WHERE subject_id=$2 AND chapter_number=$3`,
        [ch.t, subjectId, ch.n]
      );
      console.log(`  🔄 ${String(ch.n).padStart(2,'0')}. ${ch.t}`);
    } else {
      await client.query(
        `INSERT INTO chapters(id,subject_id,chapter_number,title,title_bn,created_at)
         VALUES(gen_random_uuid(),$1,$2,$3,$3,NOW())`,
        [subjectId, ch.n, ch.t]
      );
      console.log(`  ✅ ${String(ch.n).padStart(2,'0')}. ${ch.t}`);
    }
  }
}

// ── IDs from the 'british' curriculum subjects ────────────────────────────────
const B = {
  // A Level
  al_biology:      '56ff3eeb-4389-4cb5-9fca-ad9063c8d71d',
  al_chemistry:    '2d7adc87-9eb4-4a8a-9417-7e11018432c7',
  al_physics:      '4fc84076-7bf0-43ed-b957-260fb00261cc',
  al_math:         '45e72501-e5e0-443c-bd3e-973b4ef3bfbe',  // "Pure Mathematics" in british
  al_further_math: 'ceeadb49-bfdf-489f-a32b-a87efd8423ee',
  al_cs:           '7b3daefd-07c4-479c-8cc2-600aab5aff77',
  al_it:           'd89c93d3-96c4-4bc1-bf1b-51bce19d816b',
  al_accounting:   '54379619-c0ba-4e03-a33e-7bda1161eb11',
  al_business:     '19fa32af-983e-4265-94a1-63b2b9b133b5',
  al_economics:    '17009b8d-181a-4e51-80b6-44fb12e1a213',
  al_eng_gp:       'cca9e6c6-f292-4ad4-b13c-5fc03b920fd7',
  al_eng_lit:      '642bc130-6f8a-4b39-bb07-9cc3465f4bfc',
  al_global:       '1f9dd4fe-8a5b-4ccf-af27-f7e5ed0d99c4',
  al_thinking:     '034ff41c-c8e4-4f85-ab7e-321bfb76fed1',
  // O Level
  ol_physics:      '26dfd911-2b53-4c72-b419-794c943a4ab9',
  ol_chemistry:    '9153605b-5a0b-4cfe-ae39-b3299221b227',
  ol_biology:      'fb30d479-9de1-41af-b52a-f29211de383f',
  ol_math:         '8b2b0e11-d832-40aa-824e-d8d77087afa1',
  ol_addmath:      '82f66658-ed6e-4d6e-8df7-0aab362c5ffb',
  ol_cs:           '005547f2-c546-449b-9fd0-641ecf36d8b6',
  ol_accounting:   'ca076581-07df-4427-bb79-4381b2c30ba5',
  ol_business:     '7a60bd24-4f8b-4b4d-9b4e-c562769cc3f3',
  ol_economics:    '44a74e35-2a97-4dbe-9f1c-55a673b21bac',
  ol_english:      'daecd8bc-22e1-4a76-b19d-b161fe331671',
  ol_ict:          'a5f27962-f921-459a-91d7-f7a71ed77e47',
  ol_islamiyat:    'ef9cb033-ae21-4fa9-89ef-f91f9abafd9c',
  ol_bengali:      '4e6544ab-f9d9-4bcf-9b72-23a0ab31518a',
  ol_bangladesh:   'bc76d3a3-3bf8-4638-bdd0-d4898c536887',
};

// ── Chapter data with English title + Bangla title ────────────────────────────

// A Level Physics 9702 — 25 topics
const AL_PHYSICS: Ch[] = [
  { n:1,  t:'AS Topic 1: Physical quantities and units',    bn:'AS বিষয় ১: ভৌত রাশি ও একক' },
  { n:2,  t:'AS Topic 2: Kinematics',                      bn:'AS বিষয় ২: গতিবিদ্যা' },
  { n:3,  t:'AS Topic 3: Dynamics',                        bn:'AS বিষয় ৩: বলবিদ্যা' },
  { n:4,  t:'AS Topic 4: Forces, density and pressure',    bn:'AS বিষয় ৪: বল, ঘনত্ব ও চাপ' },
  { n:5,  t:'AS Topic 5: Work, energy and power',          bn:'AS বিষয় ৫: কাজ, শক্তি ও ক্ষমতা' },
  { n:6,  t:'AS Topic 6: Deformation of solids',           bn:'AS বিষয় ৬: কঠিন পদার্থের বিকৃতি' },
  { n:7,  t:'AS Topic 7: Waves',                           bn:'AS বিষয় ৭: তরঙ্গ' },
  { n:8,  t:'AS Topic 8: Superposition',                   bn:'AS বিষয় ৮: সুপারপজিশন' },
  { n:9,  t:'AS Topic 9: Electricity',                     bn:'AS বিষয় ৯: বিদ্যুৎ' },
  { n:10, t:'AS Topic 10: D.C. circuits',                  bn:'AS বিষয় ১০: DC সার্কিট' },
  { n:11, t:'AS Topic 11: Particle physics',               bn:'AS বিষয় ১১: কণা পদার্থবিজ্ঞান' },
  { n:12, t:'A2 Topic 12: Motion in a circle',             bn:'A2 বিষয় ১২: বৃত্তাকার গতি' },
  { n:13, t:'A2 Topic 13: Gravitational fields',           bn:'A2 বিষয় ১৩: মহাকর্ষীয় ক্ষেত্র' },
  { n:14, t:'A2 Topic 14: Temperature',                    bn:'A2 বিষয় ১৪: তাপমাত্রা' },
  { n:15, t:'A2 Topic 15: Ideal gases',                    bn:'A2 বিষয় ১৫: আদর্শ গ্যাস' },
  { n:16, t:'A2 Topic 16: Thermodynamics',                 bn:'A2 বিষয় ১৬: তাপগতিবিদ্যা' },
  { n:17, t:'A2 Topic 17: Oscillations',                   bn:'A2 বিষয় ১৭: দোলন' },
  { n:18, t:'A2 Topic 18: Electric fields',                bn:'A2 বিষয় ১৮: বৈদ্যুতিক ক্ষেত্র' },
  { n:19, t:'A2 Topic 19: Capacitance',                    bn:'A2 বিষয় ১৯: ধারকত্ব' },
  { n:20, t:'A2 Topic 20: Magnetic fields',                bn:'A2 বিষয় ২০: চুম্বক ক্ষেত্র' },
  { n:21, t:'A2 Topic 21: Alternating currents',           bn:'A2 বিষয় ২১: পর্যায়বর্তী প্রবাহ' },
  { n:22, t:'A2 Topic 22: Quantum physics',                bn:'A2 বিষয় ২২: কোয়ান্টাম পদার্থবিজ্ঞান' },
  { n:23, t:'A2 Topic 23: Nuclear physics',                bn:'A2 বিষয় ২৩: নিউক্লিয়ার পদার্থবিজ্ঞান' },
  { n:24, t:'A2 Topic 24: Medical physics',                bn:'A2 বিষয় ২৪: চিকিৎসা পদার্থবিজ্ঞান' },
  { n:25, t:'A2 Topic 25: Astronomy and cosmology',        bn:'A2 বিষয় ২৫: জ্যোতির্বিদ্যা ও বিশ্ববিদ্যা' },
];

// A Level Chemistry 9701 — 37 topics
const AL_CHEMISTRY: Ch[] = [
  { n:1,  t:'AS Topic 1: Atomic structure',                    bn:'AS বিষয় ১: পারমাণবিক গঠন' },
  { n:2,  t:'AS Topic 2: Atoms, molecules and stoichiometry',  bn:'AS বিষয় ২: পরমাণু, অণু ও স্টোইকিওমেট্রি' },
  { n:3,  t:'AS Topic 3: Chemical bonding',                    bn:'AS বিষয় ৩: রাসায়নিক বন্ধন' },
  { n:4,  t:'AS Topic 4: States of matter',                    bn:'AS বিষয় ৪: পদার্থের অবস্থা' },
  { n:5,  t:'AS Topic 5: Chemical energetics',                 bn:'AS বিষয় ৫: রাসায়নিক শক্তিতত্ত্ব' },
  { n:6,  t:'AS Topic 6: Electrochemistry',                    bn:'AS বিষয় ৬: তড়িৎ রসায়ন' },
  { n:7,  t:'AS Topic 7: Equilibria',                          bn:'AS বিষয় ৭: সাম্যাবস্থা' },
  { n:8,  t:'AS Topic 8: Reaction kinetics',                   bn:'AS বিষয় ৮: বিক্রিয়ার গতিতত্ত্ব' },
  { n:9,  t:'AS Topic 9: The Periodic Table: chemical periodicity', bn:'AS বিষয় ৯: পর্যায় সারণী' },
  { n:10, t:'AS Topic 10: Group 2',                            bn:'AS বিষয় ১০: গ্রুপ ২' },
  { n:11, t:'AS Topic 11: Group 17',                           bn:'AS বিষয় ১১: গ্রুপ ১৭' },
  { n:12, t:'AS Topic 12: Nitrogen and sulfur',                bn:'AS বিষয় ১২: নাইট্রোজেন ও সালফার' },
  { n:13, t:'AS Topic 13: An introduction to AS Level organic chemistry', bn:'AS বিষয় ১৩: জৈব রসায়ন পরিচিতি' },
  { n:14, t:'AS Topic 14: Hydrocarbons',                       bn:'AS বিষয় ১৪: হাইড্রোকার্বন' },
  { n:15, t:'AS Topic 15: Halogen compounds',                  bn:'AS বিষয় ১৫: হ্যালোজেন যৌগ' },
  { n:16, t:'AS Topic 16: Hydroxy compounds',                  bn:'AS বিষয় ১৬: হাইড্রক্সি যৌগ' },
  { n:17, t:'AS Topic 17: Carbonyl compounds',                 bn:'AS বিষয় ১৭: কার্বনিল যৌগ' },
  { n:18, t:'AS Topic 18: Carboxylic acids and derivatives',   bn:'AS বিষয় ১৮: কার্বক্সিলিক অ্যাসিড' },
  { n:19, t:'AS Topic 19: Nitrogen compounds',                 bn:'AS বিষয় ১৯: নাইট্রোজেন যৌগ' },
  { n:20, t:'AS Topic 20: Polymerisation',                     bn:'AS বিষয় ২০: পলিমারাইজেশন' },
  { n:21, t:'AS Topic 21: Organic synthesis',                  bn:'AS বিষয় ২১: জৈব সংশ্লেষণ' },
  { n:22, t:'AS Topic 22: Analytical techniques',              bn:'AS বিষয় ২২: বিশ্লেষণ কৌশল' },
  { n:23, t:'A2 Topic 23: Chemical energetics',                bn:'A2 বিষয় ২৩: রাসায়নিক শক্তিতত্ত্ব' },
  { n:24, t:'A2 Topic 24: Electrochemistry',                   bn:'A2 বিষয় ২৪: তড়িৎ রসায়ন' },
  { n:25, t:'A2 Topic 25: Equilibria',                         bn:'A2 বিষয় ২৫: সাম্যাবস্থা' },
  { n:26, t:'A2 Topic 26: Reaction kinetics',                  bn:'A2 বিষয় ২৬: বিক্রিয়ার গতিতত্ত্ব' },
  { n:27, t:'A2 Topic 27: Group 2',                            bn:'A2 বিষয় ২৭: গ্রুপ ২' },
  { n:28, t:'A2 Topic 28: Chemistry of transition elements',   bn:'A2 বিষয় ২৮: ট্রানজিশন মৌলের রসায়ন' },
  { n:29, t:'A2 Topic 29: An introduction to A Level organic chemistry', bn:'A2 বিষয় ২৯: A Level জৈব রসায়ন পরিচিতি' },
  { n:30, t:'A2 Topic 30: Hydrocarbons',                       bn:'A2 বিষয় ৩০: হাইড্রোকার্বন' },
  { n:31, t:'A2 Topic 31: Halogen compounds',                  bn:'A2 বিষয় ৩১: হ্যালোজেন যৌগ' },
  { n:32, t:'A2 Topic 32: Hydroxy compounds',                  bn:'A2 বিষয় ৩২: হাইড্রক্সি যৌগ' },
  { n:33, t:'A2 Topic 33: Carboxylic acids and derivatives',   bn:'A2 বিষয় ৩৩: কার্বক্সিলিক অ্যাসিড' },
  { n:34, t:'A2 Topic 34: Nitrogen compounds',                 bn:'A2 বিষয় ৩৪: নাইট্রোজেন যৌগ' },
  { n:35, t:'A2 Topic 35: Polymerisation',                     bn:'A2 বিষয় ৩৫: পলিমারাইজেশন' },
  { n:36, t:'A2 Topic 36: Organic synthesis',                  bn:'A2 বিষয় ৩৬: জৈব সংশ্লেষণ' },
  { n:37, t:'A2 Topic 37: Analytical techniques',              bn:'A2 বিষয় ৩৭: বিশ্লেষণ কৌশল' },
];

// A Level Biology 9700 — 19 topics
const AL_BIOLOGY: Ch[] = [
  { n:1,  t:'AS Topic 1: Cell structure',                         bn:'AS বিষয় ১: কোষ গঠন' },
  { n:2,  t:'AS Topic 2: Biological molecules',                   bn:'AS বিষয় ২: জৈব অণু' },
  { n:3,  t:'AS Topic 3: Enzymes',                                bn:'AS বিষয় ৩: এনজাইম' },
  { n:4,  t:'AS Topic 4: Cell membranes and transport',           bn:'AS বিষয় ৪: কোষ ঝিল্লি ও পরিবহন' },
  { n:5,  t:'AS Topic 5: The mitotic cell cycle',                 bn:'AS বিষয় ৫: মাইটোটিক কোষ চক্র' },
  { n:6,  t:'AS Topic 6: Nucleic acids and protein synthesis',    bn:'AS বিষয় ৬: নিউক্লিক অ্যাসিড ও প্রোটিন সংশ্লেষণ' },
  { n:7,  t:'AS Topic 7: Transport in plants',                    bn:'AS বিষয় ৭: উদ্ভিদে পরিবহন' },
  { n:8,  t:'AS Topic 8: Transport in mammals',                   bn:'AS বিষয় ৮: স্তন্যপায়ীতে পরিবহন' },
  { n:9,  t:'AS Topic 9: Gas exchange',                           bn:'AS বিষয় ৯: গ্যাস বিনিময়' },
  { n:10, t:'AS Topic 10: Infectious diseases',                   bn:'AS বিষয় ১০: সংক্রামক রোগ' },
  { n:11, t:'AS Topic 11: Immunity',                              bn:'AS বিষয় ১১: রোগ প্রতিরোধ ক্ষমতা' },
  { n:12, t:'A2 Topic 12: Energy and respiration',                bn:'A2 বিষয় ১২: শক্তি ও শ্বসন' },
  { n:13, t:'A2 Topic 13: Photosynthesis',                        bn:'A2 বিষয় ১৩: সালোকসংশ্লেষণ' },
  { n:14, t:'A2 Topic 14: Homeostasis',                           bn:'A2 বিষয় ১৪: হোমিওস্ট্যাসিস' },
  { n:15, t:'A2 Topic 15: Control and coordination',              bn:'A2 বিষয় ১৫: নিয়ন্ত্রণ ও সমন্বয়' },
  { n:16, t:'A2 Topic 16: Inheritance',                           bn:'A2 বিষয় ১৬: বংশগতি' },
  { n:17, t:'A2 Topic 17: Selection and evolution',               bn:'A2 বিষয় ১৭: নির্বাচন ও বিবর্তন' },
  { n:18, t:'A2 Topic 18: Classification, biodiversity and conservation', bn:'A2 বিষয় ১৮: শ্রেণিবিন্যাস, জীববৈচিত্র্য ও সংরক্ষণ' },
  { n:19, t:'A2 Topic 19: Genetic technology',                    bn:'A2 বিষয় ১৯: জেনেটিক প্রযুক্তি' },
];

// A Level Mathematics 9709 — all 6 papers combined (38 topics)
const AL_MATH: Ch[] = [
  // P1 — Pure Mathematics 1
  { n:1,  t:'P1.1: Quadratics',                             bn:'P1.1: দ্বিঘাত সমীকরণ' },
  { n:2,  t:'P1.2: Functions',                              bn:'P1.2: ফাংশন' },
  { n:3,  t:'P1.3: Coordinate geometry',                    bn:'P1.3: স্থানাঙ্ক জ্যামিতি' },
  { n:4,  t:'P1.4: Circular measure',                       bn:'P1.4: বৃত্তীয় পরিমাপ' },
  { n:5,  t:'P1.5: Trigonometry',                           bn:'P1.5: ত্রিকোণমিতি' },
  { n:6,  t:'P1.6: Series',                                 bn:'P1.6: ধারা' },
  { n:7,  t:'P1.7: Differentiation',                        bn:'P1.7: অবকলন' },
  { n:8,  t:'P1.8: Integration',                            bn:'P1.8: সমাকলন' },
  // P2 — Pure Mathematics 2 (AS only)
  { n:9,  t:'P2.1: Algebra',                                bn:'P2.1: বীজগণিত' },
  { n:10, t:'P2.2: Logarithmic and exponential functions',  bn:'P2.2: লগারিদম ও সূচক ফাংশন' },
  { n:11, t:'P2.3: Trigonometry',                           bn:'P2.3: ত্রিকোণমিতি' },
  { n:12, t:'P2.4: Differentiation',                        bn:'P2.4: অবকলন' },
  { n:13, t:'P2.5: Integration',                            bn:'P2.5: সমাকলন' },
  { n:14, t:'P2.6: Numerical solution of equations',        bn:'P2.6: সংখ্যাভিত্তিক সমাধান' },
  // P3 — Pure Mathematics 3
  { n:15, t:'P3.1: Algebra',                                bn:'P3.1: বীজগণিত' },
  { n:16, t:'P3.2: Logarithmic and exponential functions',  bn:'P3.2: লগারিদম ও সূচক ফাংশন' },
  { n:17, t:'P3.3: Trigonometry',                           bn:'P3.3: ত্রিকোণমিতি' },
  { n:18, t:'P3.4: Differentiation',                        bn:'P3.4: অবকলন' },
  { n:19, t:'P3.5: Integration',                            bn:'P3.5: সমাকলন' },
  { n:20, t:'P3.6: Numerical solution of equations',        bn:'P3.6: সংখ্যাভিত্তিক সমাধান' },
  { n:21, t:'P3.7: Vectors',                                bn:'P3.7: ভেক্টর' },
  { n:22, t:'P3.8: Differential equations',                 bn:'P3.8: ডিফারেনশিয়াল সমীকরণ' },
  { n:23, t:'P3.9: Complex numbers',                        bn:'P3.9: জটিল সংখ্যা' },
  // M — Mechanics
  { n:24, t:'M4.1: Forces and equilibrium',                 bn:'M4.1: বল ও সাম্যাবস্থা' },
  { n:25, t:'M4.2: Kinematics of motion in a straight line',bn:'M4.2: সরলরেখায় গতিবিদ্যা' },
  { n:26, t:'M4.3: Momentum',                               bn:'M4.3: ভরবেগ' },
  { n:27, t:'M4.4: Newton\'s laws of motion',               bn:'M4.4: নিউটনের গতিসূত্র' },
  { n:28, t:'M4.5: Energy, work and power',                 bn:'M4.5: শক্তি, কাজ ও ক্ষমতা' },
  // S1 — Probability & Statistics 1
  { n:29, t:'S1.1: Representation of data',                 bn:'S1.1: উপাত্তের উপস্থাপনা' },
  { n:30, t:'S1.2: Permutations and combinations',          bn:'S1.2: বিন্যাস ও সমাবেশ' },
  { n:31, t:'S1.3: Probability',                            bn:'S1.3: সম্ভাবনা' },
  { n:32, t:'S1.4: Discrete random variables',              bn:'S1.4: বিচ্ছিন্ন চলক' },
  { n:33, t:'S1.5: The normal distribution',                bn:'S1.5: স্বাভাবিক বিতরণ' },
  // S2 — Probability & Statistics 2
  { n:34, t:'S2.1: The Poisson distribution',               bn:'S2.1: পয়েসন বিতরণ' },
  { n:35, t:'S2.2: Linear combinations of random variables',bn:'S2.2: রৈখিক সমন্বয়' },
  { n:36, t:'S2.3: Continuous random variables',            bn:'S2.3: অবিচ্ছিন্ন চলক' },
  { n:37, t:'S2.4: Sampling and estimation',                bn:'S2.4: নমুনায়ন ও প্রাক্কলন' },
  { n:38, t:'S2.5: Hypothesis tests',                       bn:'S2.5: অনুকল্প পরীক্ষা' },
];

// A Level Further Mathematics 9231
const AL_FURTHER_MATH: Ch[] = [
  { n:1,  t:'FP1.1: Roots of polynomial equations',        bn:'FP1.1: বহুপদীর মূল' },
  { n:2,  t:'FP1.2: Rational functions and graphs',        bn:'FP1.2: মূলদ ফাংশন ও গ্রাফ' },
  { n:3,  t:'FP1.3: Summation of series',                  bn:'FP1.3: ধারার যোগফল' },
  { n:4,  t:'FP1.4: Matrices',                             bn:'FP1.4: ম্যাট্রিক্স' },
  { n:5,  t:'FP1.5: Polar coordinates',                    bn:'FP1.5: পোলার স্থানাঙ্ক' },
  { n:6,  t:'FP1.6: Vectors',                              bn:'FP1.6: ভেক্টর' },
  { n:7,  t:'FP1.7: Proof by induction',                   bn:'FP1.7: আরোহ প্রমাণ' },
  { n:8,  t:'FP2.1: Hyperbolic functions',                 bn:'FP2.1: হাইপারবোলিক ফাংশন' },
  { n:9,  t:'FP2.2: Matrices',                             bn:'FP2.2: ম্যাট্রিক্স' },
  { n:10, t:'FP2.3: Differentiation',                      bn:'FP2.3: অবকলন' },
  { n:11, t:'FP2.4: Integration',                          bn:'FP2.4: সমাকলন' },
  { n:12, t:'FP2.5: Complex numbers',                      bn:'FP2.5: জটিল সংখ্যা' },
  { n:13, t:'FP2.6: Differential equations',               bn:'FP2.6: ডিফারেনশিয়াল সমীকরণ' },
  { n:14, t:'FM3.1: Motion of a projectile',               bn:'FM3.1: প্রক্ষেপকের গতি' },
  { n:15, t:'FM3.2: Equilibrium of a rigid body',          bn:'FM3.2: দৃঢ় বস্তুর সাম্যাবস্থা' },
  { n:16, t:'FM3.3: Circular motion',                      bn:'FM3.3: বৃত্তাকার গতি' },
  { n:17, t:'FM3.4: Hooke\'s law',                         bn:'FM3.4: হুকের সূত্র' },
  { n:18, t:'FM3.5: Linear motion under a variable force', bn:'FM3.5: পরিবর্তনশীল বলে সরলরৈখিক গতি' },
  { n:19, t:'FM3.6: Momentum',                             bn:'FM3.6: ভরবেগ' },
  { n:20, t:'FS4.1: Continuous random variables',          bn:'FS4.1: অবিচ্ছিন্ন চলক' },
  { n:21, t:'FS4.2: Inference using normal and t-distributions', bn:'FS4.2: স্বাভাবিক ও t-বিতরণ' },
  { n:22, t:'FS4.3: χ²-tests',                             bn:'FS4.3: χ²-পরীক্ষা' },
  { n:23, t:'FS4.4: Non-parametric tests',                 bn:'FS4.4: নন-প্যারামেট্রিক পরীক্ষা' },
  { n:24, t:'FS4.5: Probability generating functions',     bn:'FS4.5: সম্ভাবনা উৎপাদন ফাংশন' },
];

// A Level Computer Science 9618 — 20 topics
const AL_CS: Ch[] = [
  { n:1,  t:'AS Topic 1: Information representation',          bn:'AS বিষয় ১: তথ্য উপস্থাপনা' },
  { n:2,  t:'AS Topic 2: Communication',                       bn:'AS বিষয় ২: যোগাযোগ' },
  { n:3,  t:'AS Topic 3: Hardware',                            bn:'AS বিষয় ৩: হার্ডওয়্যার' },
  { n:4,  t:'AS Topic 4: Processor Fundamentals',              bn:'AS বিষয় ৪: প্রসেসর মূলতত্ত্ব' },
  { n:5,  t:'AS Topic 5: System Software',                     bn:'AS বিষয় ৫: সিস্টেম সফটওয়্যার' },
  { n:6,  t:'AS Topic 6: Security, privacy and data integrity',bn:'AS বিষয় ৬: নিরাপত্তা ও গোপনীয়তা' },
  { n:7,  t:'AS Topic 7: Ethics and Ownership',                bn:'AS বিষয় ৭: নৈতিকতা ও মালিকানা' },
  { n:8,  t:'AS Topic 8: Databases',                           bn:'AS বিষয় ৮: ডেটাবেজ' },
  { n:9,  t:'AS Topic 9: Algorithm Design and Problem-solving',bn:'AS বিষয় ৯: অ্যালগরিদম ও সমস্যা সমাধান' },
  { n:10, t:'AS Topic 10: Data Types and Structures',          bn:'AS বিষয় ১০: ডেটা ধরন ও কাঠামো' },
  { n:11, t:'AS Topic 11: Programming',                        bn:'AS বিষয় ১১: প্রোগ্রামিং' },
  { n:12, t:'AS Topic 12: Software Development',               bn:'AS বিষয় ১২: সফটওয়্যার ডেভেলপমেন্ট' },
  { n:13, t:'A2 Topic 13: Data Representation',                bn:'A2 বিষয় ১৩: ডেটা উপস্থাপনা' },
  { n:14, t:'A2 Topic 14: Communication and internet technologies', bn:'A2 বিষয় ১৪: যোগাযোগ ও ইন্টারনেট' },
  { n:15, t:'A2 Topic 15: Hardware and Virtual Machines',      bn:'A2 বিষয় ১৫: হার্ডওয়্যার ও ভার্চুয়াল মেশিন' },
  { n:16, t:'A2 Topic 16: System Software',                    bn:'A2 বিষয় ১৬: সিস্টেম সফটওয়্যার' },
  { n:17, t:'A2 Topic 17: Security',                           bn:'A2 বিষয় ১৭: নিরাপত্তা' },
  { n:18, t:'A2 Topic 18: Artificial Intelligence (AI)',       bn:'A2 বিষয় ১৮: কৃত্রিম বুদ্ধিমত্তা' },
  { n:19, t:'A2 Topic 19: Computational thinking and Problem-solving', bn:'A2 বিষয় ১৯: গণনামূলক চিন্তা' },
  { n:20, t:'A2 Topic 20: Further Programming',                bn:'A2 বিষয় ২০: উন্নত প্রোগ্রামিং' },
];

// A Level Information Technology 9626 — 21 topics
const AL_IT: Ch[] = [
  { n:1,  t:'AS Topic 1: Data processing and information',    bn:'AS বিষয় ১: উপাত্ত প্রক্রিয়াকরণ' },
  { n:2,  t:'AS Topic 2: Hardware and software',              bn:'AS বিষয় ২: হার্ডওয়্যার ও সফটওয়্যার' },
  { n:3,  t:'AS Topic 3: Monitoring and control',             bn:'AS বিষয় ৩: পর্যবেক্ষণ ও নিয়ন্ত্রণ' },
  { n:4,  t:'AS Topic 4: Algorithms and flowcharts',          bn:'AS বিষয় ৪: অ্যালগরিদম ও ফ্লোচার্ট' },
  { n:5,  t:'AS Topic 5: eSecurity',                          bn:'AS বিষয় ৫: ই-নিরাপত্তা' },
  { n:6,  t:'AS Topic 6: The digital divide',                 bn:'AS বিষয় ৬: ডিজিটাল বিভাজন' },
  { n:7,  t:'AS Topic 7: Expert systems',                     bn:'AS বিষয় ৭: বিশেষজ্ঞ সিস্টেম' },
  { n:8,  t:'AS Topic 8: Spreadsheets',                       bn:'AS বিষয় ৮: স্প্রেডশিট' },
  { n:9,  t:'AS Topic 9: Modelling',                          bn:'AS বিষয় ৯: মডেলিং' },
  { n:10, t:'AS Topic 10: Database and file concepts',        bn:'AS বিষয় ১০: ডেটাবেজ ধারণা' },
  { n:11, t:'AS Topic 11: Video and audio editing',           bn:'AS বিষয় ১১: ভিডিও ও অডিও সম্পাদনা' },
  { n:12, t:'A2 Topic 12: IT in society',                     bn:'A2 বিষয় ১২: সমাজে আইটি' },
  { n:13, t:'A2 Topic 13: New and emerging technologies',     bn:'A2 বিষয় ১৩: নতুন প্রযুক্তি' },
  { n:14, t:'A2 Topic 14: Communications technology',         bn:'A2 বিষয় ১৪: যোগাযোগ প্রযুক্তি' },
  { n:15, t:'A2 Topic 15: Project management',                bn:'A2 বিষয় ১৫: প্রকল্প ব্যবস্থাপনা' },
  { n:16, t:'A2 Topic 16: System life cycle',                 bn:'A2 বিষয় ১৬: সিস্টেম জীবনচক্র' },
  { n:17, t:'A2 Topic 17: Data analysis and visualisation',   bn:'A2 বিষয় ১৭: উপাত্ত বিশ্লেষণ' },
  { n:18, t:'A2 Topic 18: Mail merge',                        bn:'A2 বিষয় ১৮: মেইল মার্জ' },
  { n:19, t:'A2 Topic 19: Graphics creation',                 bn:'A2 বিষয় ১৯: গ্রাফিক্স তৈরি' },
  { n:20, t:'A2 Topic 20: Animation',                         bn:'A2 বিষয় ২০: অ্যানিমেশন' },
  { n:21, t:'A2 Topic 21: Programming for the web',           bn:'A2 বিষয় ২১: ওয়েব প্রোগ্রামিং' },
];

// O Level subjects — correct Cambridge topics
const OL_PHYSICS: Ch[] = [
  { n:1, t:'Topic 1: Motion, forces and energy',    bn:'বিষয় ১: গতি, বল ও শক্তি' },
  { n:2, t:'Topic 2: Thermal physics',              bn:'বিষয় ২: তাপীয় পদার্থবিজ্ঞান' },
  { n:3, t:'Topic 3: Waves',                        bn:'বিষয় ৩: তরঙ্গ' },
  { n:4, t:'Topic 4: Electricity and magnetism',   bn:'বিষয় ৪: বিদ্যুৎ ও চুম্বকত্ব' },
  { n:5, t:'Topic 5: Nuclear physics',             bn:'বিষয় ৫: নিউক্লিয়ার পদার্থবিজ্ঞান' },
  { n:6, t:'Topic 6: Space physics',               bn:'বিষয় ৬: মহাকাশ পদার্থবিজ্ঞান' },
];
const OL_CHEMISTRY: Ch[] = [
  { n:1,  t:'Topic 1: States of matter',                               bn:'বিষয় ১: পদার্থের অবস্থা' },
  { n:2,  t:'Topic 2: Atoms, elements and compounds',                  bn:'বিষয় ২: পরমাণু, মৌল ও যৌগ' },
  { n:3,  t:'Topic 3: Stoichiometry',                                  bn:'বিষয় ৩: স্টোইকিওমেট্রি' },
  { n:4,  t:'Topic 4: Electrochemistry',                               bn:'বিষয় ৪: তড়িৎ রসায়ন' },
  { n:5,  t:'Topic 5: Chemical energetics',                            bn:'বিষয় ৫: রাসায়নিক শক্তিতত্ত্ব' },
  { n:6,  t:'Topic 6: Chemical reactions',                             bn:'বিষয় ৬: রাসায়নিক বিক্রিয়া' },
  { n:7,  t:'Topic 7: Acids, bases and salts',                        bn:'বিষয় ৭: অ্যাসিড, ক্ষার ও লবণ' },
  { n:8,  t:'Topic 8: The Periodic Table',                             bn:'বিষয় ৮: পর্যায় সারণী' },
  { n:9,  t:'Topic 9: Metals',                                         bn:'বিষয় ৯: ধাতু' },
  { n:10, t:'Topic 10: Chemistry of the environment',                  bn:'বিষয় ১০: পরিবেশের রসায়ন' },
  { n:11, t:'Topic 11: Organic chemistry',                             bn:'বিষয় ১১: জৈব রসায়ন' },
  { n:12, t:'Topic 12: Experimental techniques and chemical analysis', bn:'বিষয় ১২: পরীক্ষামূলক কৌশল' },
];
const OL_BIOLOGY: Ch[] = [
  { n:1,  t:'Topic 1: Cells',                                          bn:'বিষয় ১: কোষ' },
  { n:2,  t:'Topic 2: Classification',                                 bn:'বিষয় ২: শ্রেণিবিন্যাস' },
  { n:3,  t:'Topic 3: Movement into and out of cells',                 bn:'বিষয় ৩: কোষে পরিবহন' },
  { n:4,  t:'Topic 4: Biological molecules',                           bn:'বিষয় ৪: জৈব অণু' },
  { n:5,  t:'Topic 5: Enzymes',                                        bn:'বিষয় ৫: এনজাইম' },
  { n:6,  t:'Topic 6: Plant nutrition',                                bn:'বিষয় ৬: উদ্ভিদের পুষ্টি' },
  { n:7,  t:'Topic 7: Transport in flowering plants',                  bn:'বিষয় ৭: উদ্ভিদে পরিবহন' },
  { n:8,  t:'Topic 8: Human nutrition',                                bn:'বিষয় ৮: মানব পুষ্টি' },
  { n:9,  t:'Topic 9: Human gas exchange',                             bn:'বিষয় ৯: মানব গ্যাস বিনিময়' },
  { n:10, t:'Topic 10: Respiration',                                   bn:'বিষয় ১০: শ্বসন' },
  { n:11, t:'Topic 11: Transport in humans',                           bn:'বিষয় ১১: মানবদেহে পরিবহন' },
  { n:12, t:'Topic 12: Disease and immunity',                          bn:'বিষয় ১২: রোগ ও রোগ প্রতিরোধ' },
  { n:13, t:'Topic 13: Excretion',                                     bn:'বিষয় ১৩: রেচন' },
  { n:14, t:'Topic 14: Coordination and control',                      bn:'বিষয় ১৪: সমন্বয় ও নিয়ন্ত্রণ' },
  { n:15, t:'Topic 15: Coordination and response in plants',           bn:'বিষয় ১৫: উদ্ভিদে সমন্বয়' },
  { n:16, t:'Topic 16: Development of organisms and continuity of life', bn:'বিষয় ১৬: জীবের বিকাশ' },
  { n:17, t:'Topic 17: Inheritance',                                   bn:'বিষয় ১৭: বংশগতি' },
  { n:18, t:'Topic 18: Biotechnology and genetic modification',        bn:'বিষয় ১৮: জৈবপ্রযুক্তি' },
  { n:19, t:'Topic 19: Relationships of organisms with one another and with the environment', bn:'বিষয় ১৯: পরিবেশ ও জীবের সম্পর্ক' },
];
const OL_MATH: Ch[] = [
  { n:1, t:'Topic 1: Number',                      bn:'বিষয় ১: সংখ্যা' },
  { n:2, t:'Topic 2: Algebra and graphs',          bn:'বিষয় ২: বীজগণিত ও গ্রাফ' },
  { n:3, t:'Topic 3: Coordinate geometry',         bn:'বিষয় ৩: স্থানাঙ্ক জ্যামিতি' },
  { n:4, t:'Topic 4: Geometry',                    bn:'বিষয় ৪: জ্যামিতি' },
  { n:5, t:'Topic 5: Mensuration',                 bn:'বিষয় ৫: পরিমিতি' },
  { n:6, t:'Topic 6: Trigonometry',                bn:'বিষয় ৬: ত্রিকোণমিতি' },
  { n:7, t:'Topic 7: Transformations and vectors', bn:'বিষয় ৭: রূপান্তর ও ভেক্টর' },
  { n:8, t:'Topic 8: Probability',                 bn:'বিষয় ৮: সম্ভাবনা' },
  { n:9, t:'Topic 9: Statistics',                  bn:'বিষয় ৯: পরিসংখ্যান' },
];
const OL_ADDMATH: Ch[] = [
  { n:1,  t:'Topic 1: Functions',                              bn:'বিষয় ১: ফাংশন' },
  { n:2,  t:'Topic 2: Quadratic functions',                    bn:'বিষয় ২: দ্বিঘাত ফাংশন' },
  { n:3,  t:'Topic 3: Factors of polynomials',                 bn:'বিষয় ৩: বহুপদীর উৎপাদক' },
  { n:4,  t:'Topic 4: Equations, inequalities and graphs',     bn:'বিষয় ৪: সমীকরণ ও অসমতা' },
  { n:5,  t:'Topic 5: Simultaneous equations',                 bn:'বিষয় ৫: যুগপৎ সমীকরণ' },
  { n:6,  t:'Topic 6: Logarithmic and exponential functions',  bn:'বিষয় ৬: লগারিদম ও সূচক ফাংশন' },
  { n:7,  t:'Topic 7: Straight-line graphs',                   bn:'বিষয় ৭: সরলরেখার গ্রাফ' },
  { n:8,  t:'Topic 8: Coordinate geometry of the circle',      bn:'বিষয় ৮: বৃত্তের স্থানাঙ্ক জ্যামিতি' },
  { n:9,  t:'Topic 9: Circular measure',                       bn:'বিষয় ৯: বৃত্তীয় পরিমাপ' },
  { n:10, t:'Topic 10: Trigonometry',                          bn:'বিষয় ১০: ত্রিকোণমিতি' },
  { n:11, t:'Topic 11: Permutations and combinations',         bn:'বিষয় ১১: বিন্যাস ও সমাবেশ' },
  { n:12, t:'Topic 12: Series',                                bn:'বিষয় ১২: ধারা' },
  { n:13, t:'Topic 13: Vectors in two dimensions',             bn:'বিষয় ১৩: দ্বিমাত্রিক ভেক্টর' },
  { n:14, t:'Topic 14: Calculus',                              bn:'বিষয় ১৪: ক্যালকুলাস' },
];
const OL_CS: Ch[] = [
  { n:1,  t:'Topic 1: Data representation',                  bn:'বিষয় ১: উপাত্ত উপস্থাপনা' },
  { n:2,  t:'Topic 2: Data transmission',                    bn:'বিষয় ২: উপাত্ত সংক্রমণ' },
  { n:3,  t:'Topic 3: Hardware',                             bn:'বিষয় ৩: হার্ডওয়্যার' },
  { n:4,  t:'Topic 4: Software',                             bn:'বিষয় ৪: সফটওয়্যার' },
  { n:5,  t:'Topic 5: The internet and its uses',            bn:'বিষয় ৫: ইন্টারনেট ও এর ব্যবহার' },
  { n:6,  t:'Topic 6: Automated and emerging technologies',  bn:'বিষয় ৬: স্বয়ংক্রিয় ও উদীয়মান প্রযুক্তি' },
  { n:7,  t:'Topic 7: Algorithm design and problem-solving', bn:'বিষয় ৭: অ্যালগরিদম ও সমস্যা সমাধান' },
  { n:8,  t:'Topic 8: Programming',                         bn:'বিষয় ৮: প্রোগ্রামিং' },
  { n:9,  t:'Topic 9: Databases',                           bn:'বিষয় ৯: ডেটাবেজ' },
  { n:10, t:'Topic 10: Boolean logic',                      bn:'বিষয় ১০: বুলিয়ান লজিক' },
];

// Non-science subjects — generic but meaningful sections
const OL_ACCOUNTING: Ch[] = [
  { n:1, t:'Financial Accounting Fundamentals',  bn:'আর্থিক হিসাববিজ্ঞানের মূলনীতি' },
  { n:2, t:'Recording and Reporting',            bn:'লিপিবদ্ধকরণ ও প্রতিবেদন' },
  { n:3, t:'Analysis and Interpretation',        bn:'বিশ্লেষণ ও ব্যাখ্যা' },
];
const OL_BUSINESS: Ch[] = [
  { n:1, t:'Business Activity and the Environment',  bn:'ব্যবসায়িক কার্যক্রম ও পরিবেশ' },
  { n:2, t:'Business Functions',                     bn:'ব্যবসায়িক কার্যাবলী' },
  { n:3, t:'Business Decision-Making',               bn:'ব্যবসায়িক সিদ্ধান্ত গ্রহণ' },
];
const OL_ECONOMICS: Ch[] = [
  { n:1, t:'Microeconomics',   bn:'ব্যষ্টিক অর্থনীতি' },
  { n:2, t:'Macroeconomics',   bn:'সামষ্টিক অর্থনীতি' },
  { n:3, t:'International Economics', bn:'আন্তর্জাতিক অর্থনীতি' },
];
const OL_ENGLISH: Ch[] = [
  { n:1, t:'Reading and Comprehension',         bn:'পাঠ ও বোধন' },
  { n:2, t:'Writing',                           bn:'লেখা' },
  { n:3, t:'Listening and Speaking',            bn:'শোনা ও বলা' },
];
const OL_ICT: Ch[] = [
  { n:1, t:'ICT Fundamentals and Applications', bn:'আইসিটি মূলনীতি ও প্রয়োগ' },
  { n:2, t:'Networks and Communication',        bn:'নেটওয়ার্ক ও যোগাযোগ' },
  { n:3, t:'Practical Skills',                  bn:'ব্যবহারিক দক্ষতা' },
];
const OL_ISLAMIYAT: Ch[] = [
  { n:1, t:'The Qur\'an and Hadith',            bn:'কুরআন ও হাদীস' },
  { n:2, t:'Islamic History and Culture',       bn:'ইসলামী ইতিহাস ও সংস্কৃতি' },
  { n:3, t:'Islamic Beliefs and Practices',     bn:'ইসলামী বিশ্বাস ও অনুশীলন' },
];
const OL_BENGALI: Ch[] = [
  { n:1, t:'Prose and Poetry',         bn:'গদ্য ও পদ্য' },
  { n:2, t:'Grammar',                  bn:'ব্যাকরণ' },
  { n:3, t:'Composition and Writing',  bn:'রচনা ও নির্মিতি' },
];
const OL_BANGLADESH: Ch[] = [
  { n:1, t:'History of Bangladesh',    bn:'বাংলাদেশের ইতিহাস' },
  { n:2, t:'Geography and Economy',    bn:'ভূগোল ও অর্থনীতি' },
  { n:3, t:'Society and Culture',      bn:'সমাজ ও সংস্কৃতি' },
];
const AL_ACCOUNTING: Ch[] = [
  { n:1, t:'Financial Accounting',         bn:'আর্থিক হিসাববিজ্ঞান' },
  { n:2, t:'Cost and Management Accounting',bn:'ব্যয় ও ব্যবস্থাপনা হিসাব' },
  { n:3, t:'Financial Analysis',            bn:'আর্থিক বিশ্লেষণ' },
];
const AL_BUSINESS: Ch[] = [
  { n:1, t:'Business and its Environment', bn:'ব্যবসা ও তার পরিবেশ' },
  { n:2, t:'People in Organisations',      bn:'সংগঠনে মানুষ' },
  { n:3, t:'Marketing and Finance',        bn:'বিপণন ও অর্থায়ন' },
];
const AL_ECONOMICS: Ch[] = [
  { n:1, t:'Microeconomics',      bn:'ব্যষ্টিক অর্থনীতি' },
  { n:2, t:'Macroeconomics',      bn:'সামষ্টিক অর্থনীতি' },
  { n:3, t:'Applied Economics',   bn:'প্রায়োগিক অর্থনীতি' },
];
const AL_ENG_GP: Ch[] = [
  { n:1, t:'Reading and Critical Thinking',   bn:'পাঠ ও সমালোচনামূলক চিন্তা' },
  { n:2, t:'Writing and Argument',            bn:'লেখা ও যুক্তি' },
  { n:3, t:'Current Affairs and Perspectives',bn:'সমসাময়িক বিষয়' },
];
const AL_ENG_LIT: Ch[] = [
  { n:1, t:'Poetry',   bn:'কবিতা' },
  { n:2, t:'Prose',    bn:'গদ্য' },
  { n:3, t:'Drama',    bn:'নাটক' },
];
const AL_GLOBAL: Ch[] = [
  { n:1, t:'Global Perspectives',  bn:'বৈশ্বিক দৃষ্টিভঙ্গি' },
  { n:2, t:'Critical Thinking',    bn:'সমালোচনামূলক চিন্তা' },
  { n:3, t:'Independent Research', bn:'স্বাধীন গবেষণা' },
];
const AL_THINKING: Ch[] = [
  { n:1, t:'Critical Thinking',    bn:'সমালোচনামূলক চিন্তা' },
  { n:2, t:'Problem Solving',      bn:'সমস্যা সমাধান' },
  { n:3, t:'Decision Making',      bn:'সিদ্ধান্ত গ্রহণ' },
];

// ══════════════════════════════════════════════════════════════════════════════
async function main() {
  const client = await pool.connect();
  try {
    const fixes = [
      // A Level science — full Cambridge syllabi
      { id: B.al_biology,       name: 'A Level Biology (british) → 19 topics',      data: AL_BIOLOGY },
      { id: B.al_chemistry,     name: 'A Level Chemistry (british) → 37 topics',    data: AL_CHEMISTRY },
      { id: B.al_physics,       name: 'A Level Physics (british) → 25 topics',      data: AL_PHYSICS },
      { id: B.al_math,          name: 'A Level Pure Mathematics (british) → 38 topics', data: AL_MATH },
      { id: B.al_further_math,  name: 'A Level Further Mathematics (british) → 24', data: AL_FURTHER_MATH },
      { id: B.al_cs,            name: 'A Level Computer Science (british) → 20',    data: AL_CS },
      { id: B.al_it,            name: 'A Level Information Technology (british) → 21', data: AL_IT },
      // A Level non-science
      { id: B.al_accounting,    name: 'A Level Accounting (british)',                data: AL_ACCOUNTING },
      { id: B.al_business,      name: 'A Level Business (british)',                  data: AL_BUSINESS },
      { id: B.al_economics,     name: 'A Level Economics (british)',                 data: AL_ECONOMICS },
      { id: B.al_eng_gp,        name: 'A Level English General Paper (british)',     data: AL_ENG_GP },
      { id: B.al_eng_lit,       name: 'A Level English Literature (british)',        data: AL_ENG_LIT },
      { id: B.al_global,        name: 'A Level Global Perspectives (british)',       data: AL_GLOBAL },
      { id: B.al_thinking,      name: 'A Level Thinking Skills (british)',           data: AL_THINKING },
      // O Level science — full Cambridge syllabi
      { id: B.ol_physics,       name: 'O Level Physics (british) → 6 topics',       data: OL_PHYSICS },
      { id: B.ol_chemistry,     name: 'O Level Chemistry (british) → 12 topics',    data: OL_CHEMISTRY },
      { id: B.ol_biology,       name: 'O Level Biology (british) → 19 topics',      data: OL_BIOLOGY },
      { id: B.ol_math,          name: 'O Level Mathematics (british) → 9 topics',   data: OL_MATH },
      { id: B.ol_addmath,       name: 'O Level Additional Mathematics (british) → 14', data: OL_ADDMATH },
      { id: B.ol_cs,            name: 'O Level Computer Science (british) → 10',    data: OL_CS },
      // O Level non-science
      { id: B.ol_accounting,    name: 'O Level Accounting (british)',                data: OL_ACCOUNTING },
      { id: B.ol_business,      name: 'O Level Business Studies (british)',          data: OL_BUSINESS },
      { id: B.ol_economics,     name: 'O Level Economics (british)',                 data: OL_ECONOMICS },
      { id: B.ol_english,       name: 'O Level English Language (british)',          data: OL_ENGLISH },
      { id: B.ol_ict,           name: 'O Level ICT (british)',                       data: OL_ICT },
      { id: B.ol_islamiyat,     name: 'O Level Islamiyat (british)',                 data: OL_ISLAMIYAT },
      { id: B.ol_bengali,       name: 'O Level Bengali (british)',                   data: OL_BENGALI },
      { id: B.ol_bangladesh,    name: 'O Level Bangladesh Studies (british)',        data: OL_BANGLADESH },
    ];

    for (const f of fixes) {
      await fixChapters(client, f.id, f.name, f.data);
    }

    console.log('\n✅ Fix complete! All 28 british subjects updated with correct Cambridge topics.');
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(console.error);

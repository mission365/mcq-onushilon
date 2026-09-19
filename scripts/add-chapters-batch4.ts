/**
 * SAFE UPSERT — Batch 4: NCTB English Version (EV) — SSC + HSC All Chapters
 * Rule: NEVER deletes data. Inserts new or updates existing.
 * Run: npx tsx scripts/add-chapters-batch4.ts
 */

import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/mcq_onushilon',
});

interface Ch { n: number; t: string; }

async function ensureSubject(client: pg.PoolClient, name: string, nameBn: string, level: string): Promise<string> {
  const r = await client.query(
    `SELECT id FROM subjects WHERE name=$1 AND curriculum_version='english' AND academic_level=$2`,
    [name, level]
  );
  if (r.rows.length > 0) { console.log(`  ✓ ${name}`); return r.rows[0].id; }
  const ins = await client.query(
    `INSERT INTO subjects(id,name,name_bn,curriculum_version,academic_level,is_active,created_at)
     VALUES(gen_random_uuid(),$1,$2,'english',$3,true,NOW()) RETURNING id`,
    [name, nameBn, level]
  );
  console.log(`  ✅ Created: ${name}`); return ins.rows[0].id;
}

async function upsert(client: pg.PoolClient, sid: string, chapters: Ch[]) {
  for (const ch of chapters) {
    const ex = await client.query(`SELECT id FROM chapters WHERE subject_id=$1 AND chapter_number=$2`, [sid, ch.n]);
    if (ex.rows.length > 0) {
      await client.query(`UPDATE chapters SET title=$1, title_bn=$1 WHERE subject_id=$2 AND chapter_number=$3`, [ch.t, sid, ch.n]);
      console.log(`    🔄 ${String(ch.n).padStart(2,'0')}. ${ch.t}`);
    } else {
      await client.query(`INSERT INTO chapters(id,subject_id,chapter_number,title,title_bn,created_at) VALUES(gen_random_uuid(),$1,$2,$3,$3,NOW())`, [sid, ch.n, ch.t]);
      console.log(`    ✅ ${String(ch.n).padStart(2,'0')}. ${ch.t}`);
    }
  }
}

// ─── KNOWN IDs ───────────────────────────────────────────────────────────────
const ID = {
  // SSC EV existing
  ssc_bangla1:        '98aaffa9-3b5b-4ff1-a373-ad690bb47cf2',
  ssc_bangla2:        '5d71d120-c8f3-4257-b234-598442ba8eba',
  ssc_english1:       '72ca9032-e4f1-43f0-9fb8-2f1009fde2a8',
  ssc_english2:       'a2b10907-5c55-495e-bd89-5fc83ed5c016',
  ssc_math:           'e6ca7c39-1b09-43b9-82a8-1c8503d3d3df',
  ssc_ict:            'e23e855c-d1b5-4b17-b7fa-c420b28af452',
  ssc_islam:          '740e34d6-4711-4835-8453-33a2a9dd818f',
  ssc_physics:        'cb557427-409d-4e44-bcdd-0df11b352c98',
  ssc_chemistry:      'f24590e8-4010-4f82-86c7-98702b492848',
  ssc_biology:        'a074ecac-2e9b-4454-bb15-d6957e08d6fb',
  ssc_higher_math:    '21dc6676-c847-4575-9f2e-2e04aa7a9d54',
  ssc_bgs:            '10032d2a-6e23-48ba-b0c9-8782112ef083',
  ssc_accounting:     '30e47492-9a1e-4d45-9023-fe92f6887798',
  ssc_finance:        '8d6e6014-c4da-480a-aaff-816b49fc06f4',
  ssc_business:       'df64965c-00e6-4282-bf77-c99cee841b74',
  ssc_gen_science:    '821bd66e-334c-4c3d-9cf7-86ca11eeda58',
  ssc_agriculture:    '8ef68fac-d52f-483b-93f0-2e1c84c8aba8',
  // HSC EV existing
  hsc_accounting1:    '6683296c-254d-4685-890f-cbdbb585275f',
  hsc_bangla1:        'f9ce0914-bc2a-47b9-a09e-62cc726bd5aa',
  hsc_bangla2:        '47b850fd-f508-4704-b417-b083e7789571',
  hsc_bio1:           'bb54a804-b7e8-4b0f-a710-994e03e5ad30',
  hsc_bio2:           '82758525-b83e-41bf-b155-947f0be52e43',
  hsc_bom1:           '2c5e6f03-a1d8-43b3-8d30-9e49dda213c1',
  hsc_chem1:          'c6614b5f-bb23-4150-90f8-42d95cc27ebe',
  hsc_chem2:          'f63b57db-6d6e-41b0-a0e4-42e98a2255ae',
  hsc_civics1:        '204db293-dda5-434e-88d7-172360099e9a',
  hsc_economics1:     'daef2aad-0b35-4c4d-b95e-6b75a2ee8231',
  hsc_english1:       'df57a893-edea-409d-a7a3-71ee2340c564',
  hsc_english2:       '8f36bc97-4a96-43eb-9d6d-62a7a9e6b61a',
  hsc_finance1:       'b11a65c5-2bf2-4649-ab1b-fd8cd2d19a07',
  hsc_higher_math1:   '887cb33c-44e6-47d6-8de9-82fc2ec49591',
  hsc_higher_math2:   '330a7a2b-9732-4622-82f7-64265f3e9f51',
  hsc_ict:            'ba936848-eab8-4306-84d6-250e484e51a4',
  hsc_logic1:         '7c8c5093-471e-41c2-8c45-e3c30e867bbd',
  hsc_physics1:       '1455ac69-b0ff-4d3a-b156-e3766dbb63e5',
  hsc_physics2:       'd192acc8-a289-472c-b3b1-021d5fa44426',
};

// ─── CHAPTER DATA ─────────────────────────────────────────────────────────────

// SSC Common
const SSC_BANGLA1_SECTIONS: Ch[] = [
  { n:1, t:'Prose / গদ্য' }, { n:2, t:'Poetry / পদ্য' }, { n:3, t:'Supplementary Reader / সহপাঠ' },
];
const SSC_BANGLA2_SECTIONS: Ch[] = [
  { n:1, t:'Grammar / ব্যাকরণ' }, { n:2, t:'Composition / নির্মিতি' },
];
const SSC_ENGLISH1_UNITS: Ch[] = [
  { n:1,  t:'Unit 01: Sense of Self' },
  { n:2,  t:'Unit 02: Climate Change' },
  { n:3,  t:'Unit 03: Pastimes' },
  { n:4,  t:'Unit 04: Events and Festivals' },
  { n:5,  t:'Unit 05: Problems Around Us' },
  { n:6,  t:'Unit 06: Our Neighbours' },
  { n:7,  t:'Unit 07: People Who Stand Out' },
  { n:8,  t:'Unit 08: World Heritage' },
  { n:9,  t:'Unit 09: Unconventional Jobs' },
  { n:10, t:'Unit 10: Dreams' },
  { n:11, t:'Unit 11: Reading from English Literature' },
  { n:12, t:'Unit 12: Roots' },
  { n:13, t:'Unit 13: Loneliness' },
  { n:14, t:'Unit 14: Renewable Energy' },
  { n:15, t:'Unit 15: Media and Modes of E-communication' },
  { n:16, t:'Unit 16: Graffiti' },
];
const SSC_ENGLISH2_TOPICS: Ch[] = [
  { n:1, t:'Grammar' }, { n:2, t:'Writing' },
];
const SSC_MATH: Ch[] = [
  { n:1,  t:'Real Numbers' },
  { n:2,  t:'Sets and Functions' },
  { n:3,  t:'Algebraic Expressions' },
  { n:4,  t:'Exponents and Logarithms' },
  { n:5,  t:'Equations in One Variable' },
  { n:6,  t:'Lines, Angles and Triangles' },
  { n:7,  t:'Practical Geometry' },
  { n:8,  t:'Circle' },
  { n:9,  t:'Trigonometric Ratio' },
  { n:10, t:'Distance and Height' },
  { n:11, t:'Algebraic Ratio and Proportion' },
  { n:12, t:'Simultaneous Linear Equations in Two Variables' },
  { n:13, t:'Finite Series' },
  { n:14, t:'Ratio, Similarity and Symmetry' },
  { n:15, t:'Area-related Theorems and Constructions' },
  { n:16, t:'Mensuration' },
  { n:17, t:'Statistics' },
];
const SSC_ICT: Ch[] = [
  { n:1, t:'Information and Communication Technology and Our Bangladesh' },
  { n:2, t:'Computer Maintenance and Cyber Security' },
  { n:3, t:'Internet and Introduction to Web' },
  { n:4, t:'My Writings and Accounts' },
  { n:5, t:'Multimedia and Graphics' },
  { n:6, t:'Problem Solving through Programming' },
];
const SSC_ISLAM: Ch[] = [
  { n:1, t:'Aqaid and Moral Life' },
  { n:2, t:'Sources of Shariat' },
  { n:3, t:'Ibadat' },
  { n:4, t:'Akhlaq' },
  { n:5, t:'Model Lives' },
];
const SSC_HINDU: Ch[] = [
  { n:1,  t:'Creator, Creation and His Worship' },
  { n:2,  t:'Origin and Evolution of Hinduism' },
  { n:3,  t:'Characteristics of Hindu Religion' },
  { n:4,  t:'Religious Customs and Ceremonies' },
  { n:5,  t:'Rituals in Hindu Religion' },
  { n:6,  t:'Deities and Puja' },
  { n:7,  t:'Yogasadhana' },
  { n:8,  t:'Moral Education in Hindu Religious Book' },
  { n:9,  t:'Religious Stories and Moral Education' },
  { n:10, t:'The Ways of Religion and Ideal Life' },
  { n:11, t:'Avatar and Stories of Ideal Characters' },
];
const SSC_BUDDHIST: Ch[] = [
  { n:1,  t:'Life and Education of Gautama Buddha' },
  { n:2,  t:'Buddha and Bodhisatta' },
  { n:3,  t:'Tripitaka' },
  { n:4,  t:'Sutta and Moral Verses' },
  { n:5,  t:'Buddhist Kammavada' },
  { n:6,  t:'Atthakatha' },
  { n:7,  t:'Nibbana' },
  { n:8,  t:'The Councils' },
  { n:9,  t:'Jataka' },
  { n:10, t:'Biographies' },
];
const SSC_CHRISTIAN: Ch[] = [
  { n:1,  t:'Call to Freedom' },
  { n:2,  t:'Freedom and Me' },
  { n:3,  t:'My Freedom and My Society' },
  { n:4,  t:'Growing in Freedom' },
  { n:5,  t:'Freedom and Obedience' },
  { n:6,  t:'Trusted Friend' },
  { n:7,  t:'Man and Woman' },
  { n:8,  t:'Freedom and Vocation' },
  { n:9,  t:'In Front of the Father' },
  { n:10, t:'Healing the Sick World' },
  { n:11, t:'The Silent Voice of Conscience' },
  { n:12, t:'Severe Pain of the Heart' },
  { n:13, t:'Violence and Peace' },
  { n:14, t:'We Want a Changed World' },
  { n:15, t:'Our Way of Freedom' },
];

// SSC Science
const SSC_PHYSICS: Ch[] = [
  { n:1,  t:'Physical Quantities and Their Measurement' },
  { n:2,  t:'Motion' },
  { n:3,  t:'Force' },
  { n:4,  t:'Work, Power and Energy' },
  { n:5,  t:'State of Matter and Pressure' },
  { n:6,  t:'Effect of Heat on Matter' },
  { n:7,  t:'Waves and Sound' },
  { n:8,  t:'Reflection of Light' },
  { n:9,  t:'Refraction of Light' },
  { n:10, t:'Static Electricity' },
  { n:11, t:'Current Electricity' },
  { n:12, t:'Magnetic Effect of Current' },
  { n:13, t:'Modern Physics and Electronics' },
  { n:14, t:'Physics to Save Life' },
];
const SSC_CHEMISTRY: Ch[] = [
  { n:1,  t:'Concept of Chemistry' },
  { n:2,  t:'States of Matter' },
  { n:3,  t:'Structure of Matter' },
  { n:4,  t:'Periodic Table' },
  { n:5,  t:'Chemical Bonds' },
  { n:6,  t:'Concept of Mole and Chemical Calculations' },
  { n:7,  t:'Chemical Reactions' },
  { n:8,  t:'Chemistry and Energy' },
  { n:9,  t:'Acid-Base Balance' },
  { n:10, t:'Mineral Resources: Metal-Nonmetal' },
  { n:11, t:'Mineral Resources: Fossil' },
  { n:12, t:'Chemistry in Our Life' },
];
const SSC_BIOLOGY: Ch[] = [
  { n:1,  t:'Lesson on Life' },
  { n:2,  t:'Cells and Tissues of Organisms' },
  { n:3,  t:'Cell Division' },
  { n:4,  t:'Bioenergetics' },
  { n:5,  t:'Food, Nutrition and Digestion' },
  { n:6,  t:'Transport in Organisms' },
  { n:7,  t:'Exchange of Gases' },
  { n:8,  t:'Human Excretion' },
  { n:9,  t:'Firmness and Locomotion' },
  { n:10, t:'Co-ordination Process in Animal' },
  { n:11, t:'Reproduction in Organisms' },
  { n:12, t:'Heredity in Organisms and Evolution' },
  { n:13, t:'Environment of Life' },
  { n:14, t:'Biotechnology' },
];
const SSC_HIGHER_MATH: Ch[] = [
  { n:1,  t:'Set and Function' },
  { n:2,  t:'Algebraic Expression' },
  { n:3,  t:'Geometry' },
  { n:4,  t:'Geometric Constructions' },
  { n:5,  t:'Equation' },
  { n:6,  t:'Inequality' },
  { n:7,  t:'Infinite Series' },
  { n:8,  t:'Trigonometry' },
  { n:9,  t:'Exponential and Logarithmic Function' },
  { n:10, t:'Binomial Expansion' },
  { n:11, t:'Coordinate Geometry' },
  { n:12, t:'Planar Vector' },
  { n:13, t:'Solid Geometry' },
  { n:14, t:'Probability' },
];
const SSC_BGS: Ch[] = [
  { n:1,  t:'Political Movement in East Bengal and Rise of Nationalism (1947–1970)' },
  { n:2,  t:'Independent Bangladesh' },
  { n:3,  t:'The Solar System and the Earth' },
  { n:4,  t:'The Configuration of Land and Climate of Bangladesh' },
  { n:5,  t:'Rivers of Bangladesh and Natural Resources' },
  { n:6,  t:'State, Citizenship and Law' },
  { n:7,  t:'Organs of Bangladesh Government and Administrative System' },
  { n:8,  t:'Democracy of Bangladesh and Election' },
  { n:9,  t:'The United Nations and Bangladesh' },
  { n:10, t:'Sustainable Development Goals (SDG)' },
  { n:11, t:'National Resources and Economic Systems' },
  { n:12, t:'Economic Indicators and Nature of Economy of Bangladesh' },
  { n:13, t:'Financial and Banking Systems of Government of Bangladesh' },
  { n:14, t:'Family Structure of Bangladesh and Socialization' },
  { n:15, t:'Social Change of Bangladesh' },
  { n:16, t:'Social Problems of Bangladesh and Their Remedies' },
];

// SSC Business
const SSC_ACCOUNTING: Ch[] = [
  { n:1,  t:'Introduction to Accounting' },
  { n:2,  t:'Transaction' },
  { n:3,  t:'Double Entry System' },
  { n:4,  t:'Capital and Revenue Transactions' },
  { n:5,  t:'Accounts' },
  { n:6,  t:'Journal' },
  { n:7,  t:'Ledger' },
  { n:8,  t:'Cash Book' },
  { n:9,  t:'Trial Balance' },
  { n:10, t:'Financial Statements' },
  { n:11, t:'Cost Price, Cost of Production and Selling Price' },
  { n:12, t:'Accounting for Family and Self-employment Enterprise' },
];
const SSC_FINANCE: Ch[] = [
  { n:1,  t:'Finance and Business Finance' },
  { n:2,  t:'Sources of Finance' },
  { n:3,  t:'Shares, Bonds and Debentures' },
  { n:4,  t:'Time Value of Money' },
  { n:5,  t:'Risk and Uncertainty' },
  { n:6,  t:'Capital Budgeting' },
  { n:7,  t:'Cost of Capital' },
  { n:8,  t:'Currency, Bank and Banking' },
  { n:9,  t:'Banking Business and Types' },
  { n:10, t:'An Introduction to Commercial Banks' },
  { n:11, t:'Bank Deposit' },
  { n:12, t:'Bank and Customer' },
  { n:13, t:'Central Bank' },
];
const SSC_BUSINESS: Ch[] = [
  { n:1,  t:'Introduction to Business' },
  { n:2,  t:'Business Entrepreneurship and Entrepreneur' },
  { n:3,  t:'Self-Employment' },
  { n:4,  t:'Business Based on Ownership' },
  { n:5,  t:'Legal Aspects of Business' },
  { n:6,  t:'Business Plan' },
  { n:7,  t:'Industries of Bangladesh' },
  { n:8,  t:'Management of Business Organization' },
  { n:9,  t:'Marketing' },
  { n:10, t:'Assistance for Entrepreneurship' },
];
const SSC_GEN_SCIENCE: Ch[] = [
  { n:1,  t:'Healthy Life, Better Living' },
  { n:2,  t:'Water for Life' },
  { n:3,  t:'All about the Heart' },
  { n:4,  t:'Starting a New Life' },
  { n:5,  t:'Light for Sight' },
  { n:6,  t:'Polymer' },
  { n:7,  t:'Use of Acid, Base and Salt' },
  { n:8,  t:'Our Resources' },
  { n:9,  t:'Living with Disaster' },
  { n:10, t:'Let Us Know the Force' },
  { n:11, t:'Biotechnology' },
  { n:12, t:'Electricity in Daily Life' },
  { n:13, t:'Everybody is Near' },
  { n:14, t:'Science to Save Life' },
];

// SSC Humanities
const SSC_HISTORY: Ch[] = [
  { n:1,  t:'Introduction to History' },
  { n:2,  t:'World Civilization' },
  { n:3,  t:'Janapadas of Ancient Bengal' },
  { n:4,  t:'Political History of Ancient Bengal (326 B.C.–1204 A.D.)' },
  { n:5,  t:'Social, Economic and Cultural History of Ancient Bengal' },
  { n:6,  t:'Political History of Bengal in the Middle Age (1204–1757 A.D.)' },
  { n:7,  t:'Social, Economic and Cultural History of Medieval Bengal' },
  { n:8,  t:'The Beginning of British Rule in Bengal' },
  { n:9,  t:'Resistance, Renaissance and Reform Movements in Bengal during British Rule' },
  { n:10, t:'Movements for Right to Self-determination in Bengal during British Period' },
  { n:11, t:'The Language Movement and Subsequent Political Events' },
  { n:12, t:'Military Rule and the Movements for Right of Self-determination (1958–1969)' },
  { n:13, t:'The Election of 1970 and the Liberation War' },
  { n:14, t:'Rule of Bangabandhu Sheikh Mujibur Rahman (1972–1975)' },
  { n:15, t:'Military Rule and Subsequent Events (1975–1990)' },
];
const SSC_GEO: Ch[] = [
  { n:1,  t:'Geography and Environment' },
  { n:2,  t:'The Universe and Our Earth' },
  { n:3,  t:'Map Reading and Use' },
  { n:4,  t:'Internal and External Structure of the Earth' },
  { n:5,  t:'Atmosphere' },
  { n:6,  t:'Hydrosphere' },
  { n:7,  t:'Population' },
  { n:8,  t:'Human Settlement' },
  { n:9,  t:'Resources and Economic Activities' },
  { n:10, t:'Geographical Description of Bangladesh' },
  { n:11, t:'Resources and Industries of Bangladesh' },
  { n:12, t:'Communication System and Trade of Bangladesh' },
  { n:13, t:'Development Activities of Bangladesh and Environmental Balance' },
  { n:14, t:'Natural Disasters of Bangladesh' },
  { n:15, t:'Sustainable Development Goals (SDGs)' },
];
const SSC_ECONOMICS: Ch[] = [
  { n:1,  t:'Introduction to Economics' },
  { n:2,  t:'Important Concepts of Economics' },
  { n:3,  t:'Utility, Demand, Supply and Equilibrium' },
  { n:4,  t:'Production and Organization' },
  { n:5,  t:'Market' },
  { n:6,  t:'National Income and Its Measurement' },
  { n:7,  t:'Money and Banking System' },
  { n:8,  t:'Economy of Bangladesh' },
  { n:9,  t:'Important Economic Issues of Bangladesh' },
  { n:10, t:'Public Finance of Bangladesh Government' },
];
const SSC_CIVICS: Ch[] = [
  { n:1,  t:'Civics and Citizenship' },
  { n:2,  t:'Citizen and Citizenship' },
  { n:3,  t:'Law, Liberty and Equality' },
  { n:4,  t:'State and Government System' },
  { n:5,  t:'Constitution' },
  { n:6,  t:'Government System of Bangladesh' },
  { n:7,  t:'Political Parties and Elections in Democracy' },
  { n:8,  t:'Local Government System of Bangladesh' },
  { n:9,  t:'Civic Problems and Our Duties' },
  { n:10, t:'Civic Consciousness in the Emergence of Independent Bangladesh' },
  { n:11, t:'Bangladesh and International Organizations' },
];
const SSC_AGRICULTURE: Ch[] = [
  { n:1, t:'Agricultural Technology' },
  { n:2, t:'Agricultural Inputs' },
  { n:3, t:'Agriculture and Climate' },
  { n:4, t:'Agricultural Production' },
  { n:5, t:'Afforestation' },
  { n:6, t:'Agricultural Co-operatives' },
  { n:7, t:'Household Farming' },
];
const SSC_HOME_SCI: Ch[] = [
  { n:1,  t:'Home Management' },
  { n:2,  t:'Home Manager' },
  { n:3,  t:'Home Resource' },
  { n:4,  t:'Home Resource Management' },
  { n:5,  t:'Interior Decoration of Home' },
  { n:6,  t:'Growth and Development of Child' },
  { n:7,  t:'Child Development & Family Environment' },
  { n:8,  t:'Psycho-Social Problems of Adolescence – Remedies and Prevention' },
  { n:9,  t:'Retarded Child' },
  { n:10, t:'Functions of Food and Nutrients' },
  { n:11, t:'Digestion of Foods and Planning of Meals' },
  { n:12, t:'Disciplined Lifestyle and Meal Planning' },
  { n:13, t:'Preparing and Serving of Food' },
  { n:14, t:'Textile Fibres' },
  { n:15, t:'Art Elements and Art Principles of Textile' },
  { n:16, t:'Printing and Colouring in Clothing' },
  { n:17, t:'Drafting' },
  { n:18, t:'Clothing Care & Tidiness in Clothing' },
];

// ─── HSC Common
const HSC_BANGLA1: Ch[] = [
  { n:1, t:'Prose / গদ্য' },
  { n:2, t:'Poetry / পদ্য' },
  { n:3, t:'Supplementary Novel / সহপাঠ উপন্যাস' },
  { n:4, t:'Supplementary Drama / সহপাঠ নাটক' },
];
const HSC_BANGLA2: Ch[] = [
  { n:1, t:'Grammar / ব্যাকরণ' }, { n:2, t:'Composition / নির্মিতি' },
];
const HSC_ENGLISH1_UNITS: Ch[] = [
  { n:1,  t:'Unit 01: People or Institutions Making History' },
  { n:2,  t:'Unit 02: Dreams' },
  { n:3,  t:'Unit 03: Lifestyle' },
  { n:4,  t:'Unit 04: Adolescence' },
  { n:5,  t:'Unit 05: Youthful Achievers' },
  { n:6,  t:'Unit 06: Relationships' },
  { n:7,  t:'Unit 07: Human Rights' },
  { n:8,  t:'Unit 08: Peace and Conflict' },
  { n:9,  t:'Unit 09: Tours and Travels' },
  { n:10, t:'Unit 10: Environment and Nature' },
  { n:11, t:'Unit 11: Art and Craft' },
  { n:12, t:'Unit 12: Education and Life' },
  { n:13, t:'Unit 13: Myths and Literature' },
];
const HSC_ENGLISH2_TOPICS: Ch[] = [
  { n:1, t:'Grammar' }, { n:2, t:'Writing' },
];
const HSC_ICT: Ch[] = [
  { n:1, t:'Information and Communication Technology: World and Bangladesh Perspective' },
  { n:2, t:'Communication Systems and Networking' },
  { n:3, t:'Number Systems and Digital Devices' },
  { n:4, t:'Introduction to Web Design and HTML' },
  { n:5, t:'Programming Language' },
  { n:6, t:'Database Management System' },
];

// HSC Science
const HSC_PHYSICS1: Ch[] = [
  { n:1,  t:'Physical World and Measurement' },
  { n:2,  t:'Vector' },
  { n:3,  t:'Dynamics' },
  { n:4,  t:'Newtonian Mechanics' },
  { n:5,  t:'Work, Energy and Power' },
  { n:6,  t:'Gravitation and Gravity' },
  { n:7,  t:'Structural Properties of Matter' },
  { n:8,  t:'Periodic Motion' },
  { n:9,  t:'Wave' },
  { n:10, t:'Ideal Gas and Kinetic Theory of Gases' },
];
const HSC_PHYSICS2: Ch[] = [
  { n:1,  t:'Thermodynamics' },
  { n:2,  t:'Static Electricity' },
  { n:3,  t:'Current Electricity' },
  { n:4,  t:'Magnetic Effect of Current and Magnetism' },
  { n:5,  t:'Electromagnetic Induction and Alternating Current' },
  { n:6,  t:'Geometrical Optics' },
  { n:7,  t:'Physical Optics' },
  { n:8,  t:'Introduction to Modern Physics' },
  { n:9,  t:'Atomic Model and Nuclear Physics' },
  { n:10, t:'Semiconductor and Electronics' },
  { n:11, t:'Astronomy' },
];
const HSC_CHEM1: Ch[] = [
  { n:1, t:'Safe Use of Laboratory' },
  { n:2, t:'Qualitative Chemistry' },
  { n:3, t:'Periodic Properties and Chemical Bonding of Elements' },
  { n:4, t:'Chemical Changes' },
  { n:5, t:'Vocational Chemistry' },
];
const HSC_CHEM2: Ch[] = [
  { n:1, t:'Environmental Chemistry' },
  { n:2, t:'Organic Chemistry' },
  { n:3, t:'Quantitative Chemistry' },
  { n:4, t:'Electrochemistry' },
  { n:5, t:'Economic Chemistry' },
];
const HSC_BIO1: Ch[] = [
  { n:1,  t:'Cell and Its Structure' },
  { n:2,  t:'Cell Division' },
  { n:3,  t:'Cell Chemistry' },
  { n:4,  t:'Microorganisms' },
  { n:5,  t:'Algae and Fungi' },
  { n:6,  t:'Bryophyta and Pteridophyta' },
  { n:7,  t:'Gymnosperms and Angiosperms' },
  { n:8,  t:'Tissue and Tissue System' },
  { n:9,  t:'Plant Physiology' },
  { n:10, t:'Reproduction of Plants' },
  { n:11, t:'Biotechnology' },
  { n:12, t:'Environment, Distribution and Conservation of Organisms' },
];
const HSC_BIO2: Ch[] = [
  { n:1,  t:'Animal Diversity and Classification' },
  { n:2,  t:'Animal Identity' },
  { n:3,  t:'Human Physiology: Digestion and Absorption' },
  { n:4,  t:'Human Physiology: Blood and Circulation' },
  { n:5,  t:'Human Physiology: Respiratory Process and Respiration' },
  { n:6,  t:'Human Physiology: Excretory Products and Excretion' },
  { n:7,  t:'Human Physiology: Locomotion and Movement' },
  { n:8,  t:'Human Physiology: Coordination and Control' },
  { n:9,  t:'Continuance of Human Life' },
  { n:10, t:'Immunity of Human Body' },
  { n:11, t:'Genetics and Evolution' },
  { n:12, t:'Animal Behavior' },
];
const HSC_HIGHER_MATH1: Ch[] = [
  { n:1,  t:'Matrices and Determinants' },
  { n:2,  t:'Vector' },
  { n:3,  t:'Straight Line' },
  { n:4,  t:'Circle' },
  { n:5,  t:'Permutation and Combination' },
  { n:6,  t:'Trigonometric Ratios' },
  { n:7,  t:'Trigonometric Ratios of Associated Angles' },
  { n:8,  t:'Functions and Graphs of Functions' },
  { n:9,  t:'Differentiation' },
  { n:10, t:'Integration' },
];
const HSC_HIGHER_MATH2: Ch[] = [
  { n:1,  t:'Real Numbers and Inequalities' },
  { n:2,  t:'Linear Programming' },
  { n:3,  t:'Complex Numbers' },
  { n:4,  t:'Polynomials and Polynomial Equations' },
  { n:5,  t:'Binomial Expansion' },
  { n:6,  t:'Conics' },
  { n:7,  t:'Inverse Trigonometric Functions and Trigonometric Equations' },
  { n:8,  t:'Statics' },
  { n:9,  t:'Motion of a Particle in a Plane' },
  { n:10, t:'Measures of Dispersion and Probability' },
];

// HSC Business
const HSC_ACCOUNTING1: Ch[] = [
  { n:1,  t:'Introduction to Accounting' },
  { n:2,  t:'Books of Accounts' },
  { n:3,  t:'Bank Reconciliation Statement' },
  { n:4,  t:'Trial Balance' },
  { n:5,  t:'Accounting Principles' },
  { n:6,  t:'Accounting for Receivables' },
  { n:7,  t:'Worksheet' },
  { n:8,  t:'Accounting for Tangible and Intangible Assets' },
  { n:9,  t:'Financial Statements' },
  { n:10, t:'Single Entry System' },
];
const HSC_ACCOUNTING2: Ch[] = [
  { n:1,  t:'Accounts of Non-trading Concerns' },
  { n:2,  t:'Partnership Accounts' },
  { n:3,  t:'Cash Flow Statement' },
  { n:4,  t:'Capital of Joint Stock Company' },
  { n:5,  t:'Financial Statements of Joint Stock Company' },
  { n:6,  t:'Analysis of Financial Statements' },
  { n:7,  t:'Manufacturing Cost Accounting and Wages & Salaries Statement' },
  { n:8,  t:'Inventory Accounting Methods' },
  { n:9,  t:'Cost and Classification of Costs' },
  { n:10, t:'Introduction to Management Accounting' },
];
const HSC_BOM1: Ch[] = [
  { n:1,  t:'The Concept of Business' },
  { n:2,  t:'Business Environment' },
  { n:3,  t:'Sole Proprietorship Business' },
  { n:4,  t:'Partnership Business' },
  { n:5,  t:'Joint Stock Company' },
  { n:6,  t:'Co-operative Society' },
  { n:7,  t:'State Enterprise' },
  { n:8,  t:'Legal Aspects of Business' },
  { n:9,  t:'Assistance for Furtherance of Business' },
  { n:10, t:'Business Entrepreneurship' },
  { n:11, t:'Use of Information & Communication Technology in Business' },
  { n:12, t:'Business Ethics & Social Responsibilities' },
];
const HSC_BOM2: Ch[] = [
  { n:1,  t:'The Concept of Management' },
  { n:2,  t:'Principles of Management' },
  { n:3,  t:'Planning & Decision Making' },
  { n:4,  t:'Organizing' },
  { n:5,  t:'Staffing' },
  { n:6,  t:'Leadership' },
  { n:7,  t:'Motivation' },
  { n:8,  t:'Communication' },
  { n:9,  t:'Co-ordination' },
  { n:10, t:'Controlling' },
];
const HSC_FINANCE1: Ch[] = [
  { n:1, t:'Introduction to Finance' },
  { n:2, t:'Legal Aspects of Financial Market' },
  { n:3, t:'Time Value of Money' },
  { n:4, t:'Financial Analysis' },
  { n:5, t:'Short-term and Mid-term Finance' },
  { n:6, t:'Long-term Finance' },
  { n:7, t:'Cost of Capital' },
  { n:8, t:'Capital Budgeting and Investment Decisions' },
  { n:9, t:'Risk and Rate of Return' },
];
const HSC_FINANCE2: Ch[] = [
  { n:1,  t:'Primary Concept of Banking' },
  { n:2,  t:'Central Bank' },
  { n:3,  t:'Commercial Bank' },
  { n:4,  t:'Bank Account' },
  { n:5,  t:'Negotiable Instruments' },
  { n:6,  t:'Cheque, Bill of Exchange and Promissory Note' },
  { n:7,  t:'Sources and Use of Bank Funds' },
  { n:8,  t:'Foreign Exchange and Foreign Currency' },
  { n:9,  t:'Electronic and Modern Banking' },
  { n:10, t:'Basic Concept of Insurance' },
  { n:11, t:'Life Insurance' },
  { n:12, t:'Marine Insurance' },
  { n:13, t:'Fire Insurance' },
  { n:14, t:'Miscellaneous Insurance' },
];
const HSC_PRODUCTION1: Ch[] = [
  { n:1,  t:'Production' },
  { n:2,  t:'Factors of Production' },
  { n:3,  t:'Scale of Production' },
  { n:4,  t:'Production at Macro Level' },
  { n:5,  t:'Production Management' },
  { n:6,  t:'Product Design' },
  { n:7,  t:'Quality Management' },
  { n:8,  t:'Production Capacity' },
  { n:9,  t:'Business Location' },
  { n:10, t:'Layout' },
];
const HSC_PRODUCTION2: Ch[] = [
  { n:1,  t:'Introduction to Marketing' },
  { n:2,  t:'Marketing Environment' },
  { n:3,  t:'Marketing Functions' },
  { n:4,  t:'Market Segmentation and Marketing Mix' },
  { n:5,  t:'Product and Product Pricing' },
  { n:6,  t:'Product Distribution Channel' },
  { n:7,  t:'Wholesaling and Retailing' },
  { n:8,  t:'Sales Promotion and Advertising' },
  { n:9,  t:'Personal Selling and Salesmanship' },
  { n:10, t:'Contemporary Aspects in Marketing' },
];

// HSC Humanities
const HSC_HISTORY1: Ch[] = [
  { n:1, t:'Arrival of Europeans in India: Establishment of British Dominance' },
  { n:2, t:'British Colonial Rule: Company Period' },
  { n:3, t:'British Colonial Rule: British Period' },
  { n:4, t:'Bengali Language Movement in the Pakistan Period and Its Nature' },
  { n:5, t:'Autonomy and Self-determination Movement of East Bengal' },
  { n:6, t:'Declaration of Independence of Bangladesh and the Liberation War' },
  { n:7, t:'Activities of the Government of Bangladesh (Mujibnagar)' },
  { n:8, t:'Expatriate Bengalis and the Outside World' },
];
const HSC_HISTORY2: Ch[] = [
  { n:1, t:'Industrial Revolution' },
  { n:2, t:'French Revolution' },
  { n:3, t:'First World War, Treaty of Versailles and League of Nations' },
  { n:4, t:'Bolshevik Revolution' },
  { n:5, t:'Rise of Hitler and Mussolini and the Second World War' },
  { n:6, t:'United Nations and World Peace' },
  { n:7, t:'Cold War: Conflict between Capitalist and Socialist Worlds' },
  { n:8, t:'Post-Cold War World' },
  { n:9, t:'Anti-Apartheid Movement' },
];
const HSC_ISLAMIC_HIST1: Ch[] = [
  { n:1,  t:'Pre-Islamic Arabia' },
  { n:2,  t:'Arabia in the Age of Jahiliyyah' },
  { n:3,  t:"Prophet Muhammad's (PBUH) Life in Makkah" },
  { n:4,  t:"Prophet Muhammad's (PBUH) Life in Madinah" },
  { n:5,  t:'Character, Achievements and Reforms of Prophet Muhammad (PBUH)' },
  { n:6,  t:'Khulafa-e-Rashidun (632–661 CE)' },
  { n:7,  t:'Umayyad Caliphate (661–750 CE)' },
  { n:8,  t:'Abbasid Caliphate (750–1258 CE)' },
  { n:9,  t:'Muslim Rule in Spain (711–1492 CE)' },
  { n:10, t:'Fatimid Caliphate and Ayyubid Dynasty (909–1250 CE)' },
];
const HSC_ISLAMIC_HIST2: Ch[] = [
  { n:1, t:'Establishment of Muslim Rule in India' },
  { n:2, t:'Delhi Sultanate (1206–1526 CE)' },
  { n:3, t:'Mughal Rule in the Indian Subcontinent (1526–1858 CE)' },
  { n:4, t:'Company and Colonial Rule in Bengal' },
  { n:5, t:'History of Bengal: Pakistan Period' },
  { n:6, t:'Emergence of Independent and Sovereign Bangladesh' },
];
const HSC_ISLAMIC_STUDIES1: Ch[] = [
  { n:1, t:'Islamic Education and Culture' },
  { n:2, t:'Islam and Individual Life' },
  { n:3, t:'Islam and Family Life' },
  { n:4, t:'Islam and Social Life' },
  { n:5, t:'Islamic Economic System' },
  { n:6, t:'Islamic State System' },
  { n:7, t:'International System in Islam' },
];
const HSC_ISLAMIC_STUDIES2: Ch[] = [
  { n:1, t:'Al-Qur\'an' },
  { n:2, t:'Al-Hadith' },
  { n:3, t:'Al-Ijma' },
  { n:4, t:'Al-Qiyas' },
  { n:5, t:'Fiqh' },
  { n:6, t:'Fundamental Acts of Worship' },
  { n:7, t:'Tasawwuf' },
];
const HSC_CIVICS1: Ch[] = [
  { n:1,  t:'Introduction to Civics and Good Governance' },
  { n:2,  t:'Good Governance' },
  { n:3,  t:'Values, Law, Liberty and Equality' },
  { n:4,  t:'E-Governance and Good Governance' },
  { n:5,  t:'Rights and Duties of Citizens and Human Rights' },
  { n:6,  t:'Political Parties, Leadership and Good Governance' },
  { n:7,  t:'Structure of Government' },
  { n:8,  t:'Public Opinion and Political Culture' },
  { n:9,  t:'Public Service and Bureaucracy' },
  { n:10, t:'Patriotism and Nationalism' },
];
const HSC_CIVICS2: Ch[] = [
  { n:1,  t:'Development of Representative Government in British India and Partition of India' },
  { n:2,  t:'Pakistan to Bangladesh (1947–1971)' },
  { n:3,  t:'Political Personalities and the Independence of Bangladesh' },
  { n:4,  t:'Constitution of Bangladesh' },
  { n:5,  t:'Government and Administrative Structure of Bangladesh' },
  { n:6,  t:'Local Government' },
  { n:7,  t:'Constitutional Institutions' },
  { n:8,  t:'Electoral System of Bangladesh' },
  { n:9,  t:'Foreign Policy of Bangladesh' },
  { n:10, t:'Civic Problems and Our Duties' },
];
const HSC_ECONOMICS1: Ch[] = [
  { n:1,  t:'Basic Economic Problems and Their Solutions' },
  { n:2,  t:'Consumer and Producer Behaviour' },
  { n:3,  t:'Production, Cost of Production and Revenue' },
  { n:4,  t:'Market' },
  { n:5,  t:'Labour Market' },
  { n:6,  t:'Capital' },
  { n:7,  t:'Organization' },
  { n:8,  t:'Rent' },
  { n:9,  t:'Aggregate Income and Expenditure' },
  { n:10, t:'Money and Banking' },
];
const HSC_ECONOMICS2: Ch[] = [
  { n:1,  t:'Introduction to Bangladesh Economy' },
  { n:2,  t:'Agriculture of Bangladesh' },
  { n:3,  t:'Industries of Bangladesh' },
  { n:4,  t:'Population, Human Resources and Self-employment' },
  { n:5,  t:'Food Security' },
  { n:6,  t:'Financing' },
  { n:7,  t:'Inflation' },
  { n:8,  t:'International Trade' },
  { n:9,  t:'Public Finance' },
  { n:10, t:'Development Planning' },
];
const HSC_SOCIOLOGY1: Ch[] = [
  { n:1,  t:'Origin and Development of Sociology' },
  { n:2,  t:'Scientific Status of Sociology' },
  { n:3,  t:'Theories and Contributions of Sociologists' },
  { n:4,  t:'Basic Concepts of Sociology' },
  { n:5,  t:'Social Institutions' },
  { n:6,  t:'Factors Influencing Social Life' },
  { n:7,  t:'Socialization Process' },
  { n:8,  t:'Social Stratification and Inequality' },
  { n:9,  t:'Social System' },
  { n:10, t:'Deviant Behaviour and Crime' },
  { n:11, t:'Social Change' },
];
const HSC_SOCIOLOGY2: Ch[] = [
  { n:1,  t:'Development of Sociological Practice in Bangladesh' },
  { n:2,  t:'Society and Culture of Bangladesh' },
  { n:3,  t:'Society and Civilization of Bangladesh in the Light of Archaeology' },
  { n:4,  t:'Lifestyle of Ethnic Groups in Bangladesh' },
  { n:5,  t:'Socio-economic and Political Background of the Emergence of Bangladesh' },
  { n:6,  t:'Rural and Urban Society of Bangladesh' },
  { n:7,  t:'Marriage, Family and Kinship in Bangladesh' },
  { n:8,  t:'Social Change in Bangladesh' },
  { n:9,  t:'Social Problems of Bangladesh and Their Remedies' },
  { n:10, t:'Social Development of Bangladesh' },
];
const HSC_LOGIC1: Ch[] = [
  { n:1, t:'Introduction to Logic' },
  { n:2, t:'Practical Aspects of Logic' },
  { n:3, t:'Elements of Argument' },
  { n:4, t:'Predicables' },
  { n:5, t:'Inference' },
  { n:6, t:'Deductive Inference' },
  { n:7, t:'Inductive Inference and the Grounds of Induction' },
  { n:8, t:'Symbolic Logic' },
];
const HSC_LOGIC2: Ch[] = [
  { n:1, t:'Logical Definition' },
  { n:2, t:'Logical Division' },
  { n:3, t:'Types of Induction' },
  { n:4, t:'Hypothesis' },
  { n:5, t:'Methods of Proving Causal Relation' },
  { n:6, t:'Explanation' },
  { n:7, t:'Classification' },
  { n:8, t:'Probability' },
];
const HSC_SOCIAL_WORK1: Ch[] = [
  { n:1, t:'Social Work: Nature and Scope' },
  { n:2, t:'Historical Background of the Social Work Profession' },
  { n:3, t:'Values and Principles of Social Work' },
  { n:4, t:'Concepts Related to Social Work' },
  { n:5, t:'Relationship of Social Work with Different Branches of Knowledge and Professions' },
  { n:6, t:'Methods of Social Work' },
  { n:7, t:'Social Policy and Planning and Social Work' },
  { n:8, t:'Problems and Prospects of the Social Work Profession' },
];
const HSC_SOCIAL_WORK2: Ch[] = [
  { n:1, t:'Basic Human Needs in Bangladesh' },
  { n:2, t:'Branches of Social Work' },
  { n:3, t:'Practice of Social Work in Solving Social Problems' },
  { n:4, t:'Prevention of Social Problems and Social Institutions and Organizations' },
  { n:5, t:'Social Laws and Social Work' },
  { n:6, t:'Government Social Development Programmes in Bangladesh' },
  { n:7, t:'Non-government Social Development Programmes in Bangladesh' },
  { n:8, t:'Social Development Activities of International Organizations in Bangladesh' },
  { n:9, t:'Field Work and Practice in Social Work Education' },
];
const HSC_GEO1: Ch[] = [
  { n:1,  t:'Physical Geography' },
  { n:2,  t:'Structure of the Earth' },
  { n:3,  t:'Landforms of the Earth' },
  { n:4,  t:'Modification of Landforms' },
  { n:5,  t:'Weathering and Denudation' },
  { n:6,  t:'River and Erosion' },
  { n:7,  t:'Atmosphere and Natural Environmental Pollution' },
  { n:8,  t:'Weather and Climate' },
  { n:9,  t:'Climatic Regions and Climate Change' },
  { n:10, t:'Hydrosphere' },
  { n:11, t:'Ocean Currents' },
  { n:12, t:'Tides' },
  { n:13, t:'Biosphere' },
  { n:14, t:'GIS and Remote Sensing' },
];
const HSC_GEO2: Ch[] = [
  { n:1,  t:'Human Geography' },
  { n:2,  t:'Regional Geography' },
  { n:3,  t:'Population' },
  { n:4,  t:'Settlement' },
  { n:5,  t:'Agriculture' },
  { n:6,  t:'Agriculture of Bangladesh' },
  { n:7,  t:'Mineral and Energy Resources' },
  { n:8,  t:'Mineral and Energy Resources of Bangladesh' },
  { n:9,  t:'Industry' },
  { n:10, t:'Transport and Communication of Bangladesh' },
  { n:11, t:'Trade of Bangladesh' },
  { n:12, t:'Disaster and Pollution' },
  { n:13, t:'Practical Geography' },
];

// ═════════════════════════════════════════════════════════════════════════════
async function main() {
  const client = await pool.connect();
  try {
    // ── Create missing SSC EV subjects ────────────────────────────────────
    console.log('\n🔧 Creating missing SSC EV subjects...');
    const ssc_hindu_id    = await ensureSubject(client,'SSC Hindu Religion Studies (English Version)','Hindu Religion Studies (SSC EV)','ssc');
    const ssc_buddhist_id = await ensureSubject(client,'SSC Buddhist Religion Studies (English Version)','Buddhist Religion Studies (SSC EV)','ssc');
    const ssc_christian_id= await ensureSubject(client,'SSC Christian Religion Studies (English Version)','Christian Religion Studies (SSC EV)','ssc');
    const ssc_history_id  = await ensureSubject(client,'SSC History of Bangladesh and World Civilization (English Version)','History of Bangladesh & World Civilization (SSC EV)','ssc');
    const ssc_geo_id      = await ensureSubject(client,'SSC Geography and Environment (English Version)','Geography and Environment (SSC EV)','ssc');
    const ssc_econ_id     = await ensureSubject(client,'SSC Economics (English Version)','Economics (SSC EV)','ssc');
    const ssc_civics_id   = await ensureSubject(client,'SSC Civics and Citizenship (English Version)','Civics and Citizenship (SSC EV)','ssc');
    const ssc_home_id     = await ensureSubject(client,'SSC Home Science (English Version)','Home Science (SSC EV)','ssc');

    // ── Create missing HSC EV subjects ────────────────────────────────────
    console.log('\n🔧 Creating missing HSC EV subjects...');
    const hsc_accounting2_id   = await ensureSubject(client,'Accounting 2nd Paper (English Version)','হিসাববিজ্ঞান ২য় পত্র (EV)','hsc');
    const hsc_bom2_id          = await ensureSubject(client,'Business Organization & Management 2nd Paper (English Version)','Business Org & Mgmt 2nd (EV)','hsc');
    const hsc_finance2_id      = await ensureSubject(client,'Finance, Banking & Insurance 2nd Paper (English Version)','Finance, Banking & Insurance 2nd (EV)','hsc');
    const hsc_production1_id   = await ensureSubject(client,'Production Management & Marketing 1st Paper (English Version)','Production Mgmt & Marketing 1st (EV)','hsc');
    const hsc_production2_id   = await ensureSubject(client,'Production Management & Marketing 2nd Paper (English Version)','Production Mgmt & Marketing 2nd (EV)','hsc');
    const hsc_history1_id      = await ensureSubject(client,'History 1st Paper (English Version)','History 1st Paper (EV)','hsc');
    const hsc_history2_id      = await ensureSubject(client,'History 2nd Paper (English Version)','History 2nd Paper (EV)','hsc');
    const hsc_isl_hist1_id     = await ensureSubject(client,'Islamic History & Culture 1st Paper (English Version)','Islamic History & Culture 1st (EV)','hsc');
    const hsc_isl_hist2_id     = await ensureSubject(client,'Islamic History & Culture 2nd Paper (English Version)','Islamic History & Culture 2nd (EV)','hsc');
    const hsc_isl_studies1_id  = await ensureSubject(client,'Islamic Studies 1st Paper (English Version)','Islamic Studies 1st (EV)','hsc');
    const hsc_isl_studies2_id  = await ensureSubject(client,'Islamic Studies 2nd Paper (English Version)','Islamic Studies 2nd (EV)','hsc');
    const hsc_civics2_id       = await ensureSubject(client,'Civics & Good Governance 2nd Paper (English Version)','Civics & Good Governance 2nd (EV)','hsc');
    const hsc_econ2_id         = await ensureSubject(client,'Economics 2nd Paper (English Version)','Economics 2nd (EV)','hsc');
    const hsc_sociology1_id    = await ensureSubject(client,'Sociology 1st Paper (English Version)','Sociology 1st (EV)','hsc');
    const hsc_sociology2_id    = await ensureSubject(client,'Sociology 2nd Paper (English Version)','Sociology 2nd (EV)','hsc');
    const hsc_logic2_id        = await ensureSubject(client,'Logic 2nd Paper (English Version)','Logic 2nd (EV)','hsc');
    const hsc_social_work1_id  = await ensureSubject(client,'Social Work 1st Paper (English Version)','Social Work 1st (EV)','hsc');
    const hsc_social_work2_id  = await ensureSubject(client,'Social Work 2nd Paper (English Version)','Social Work 2nd (EV)','hsc');
    const hsc_geo1_id          = await ensureSubject(client,'Geography 1st Paper (English Version)','Geography 1st (EV)','hsc');
    const hsc_geo2_id          = await ensureSubject(client,'Geography 2nd Paper (English Version)','Geography 2nd (EV)','hsc');

    // ── Upsert all chapters ───────────────────────────────────────────────
    const subjects = [
      // SSC Common
      { id: ID.ssc_bangla1,    name: 'SSC EV Bangla 1st Paper (sections)',       data: SSC_BANGLA1_SECTIONS },
      { id: ID.ssc_bangla2,    name: 'SSC EV Bangla 2nd Paper (sections)',       data: SSC_BANGLA2_SECTIONS },
      { id: ID.ssc_english1,   name: 'SSC EV English 1st Paper (16 units)',      data: SSC_ENGLISH1_UNITS },
      { id: ID.ssc_english2,   name: 'SSC EV English 2nd Paper (topics)',        data: SSC_ENGLISH2_TOPICS },
      { id: ID.ssc_math,       name: 'SSC EV Mathematics (17)',                  data: SSC_MATH },
      { id: ID.ssc_ict,        name: 'SSC EV ICT (6)',                           data: SSC_ICT },
      { id: ID.ssc_islam,      name: 'SSC EV Islamic Studies (5)',               data: SSC_ISLAM },
      { id: ssc_hindu_id,      name: 'SSC EV Hindu Religion Studies (11)',        data: SSC_HINDU },
      { id: ssc_buddhist_id,   name: 'SSC EV Buddhist Religion Studies (10)',     data: SSC_BUDDHIST },
      { id: ssc_christian_id,  name: 'SSC EV Christian Religion Studies (15)',    data: SSC_CHRISTIAN },
      // SSC Science
      { id: ID.ssc_physics,    name: 'SSC EV Physics (14)',                      data: SSC_PHYSICS },
      { id: ID.ssc_chemistry,  name: 'SSC EV Chemistry (12)',                    data: SSC_CHEMISTRY },
      { id: ID.ssc_biology,    name: 'SSC EV Biology (14)',                      data: SSC_BIOLOGY },
      { id: ID.ssc_higher_math,name: 'SSC EV Higher Mathematics (14)',           data: SSC_HIGHER_MATH },
      { id: ID.ssc_bgs,        name: 'SSC EV Bangladesh & Global Studies (16)',   data: SSC_BGS },
      // SSC Business
      { id: ID.ssc_accounting, name: 'SSC EV Accounting (12)',                   data: SSC_ACCOUNTING },
      { id: ID.ssc_finance,    name: 'SSC EV Finance & Banking (13)',             data: SSC_FINANCE },
      { id: ID.ssc_business,   name: 'SSC EV Business Entrepreneurship (10)',     data: SSC_BUSINESS },
      { id: ID.ssc_gen_science,name: 'SSC EV General Science (14)',              data: SSC_GEN_SCIENCE },
      // SSC Humanities
      { id: ssc_history_id,    name: 'SSC EV History of BD & World Civ (15)',    data: SSC_HISTORY },
      { id: ssc_geo_id,        name: 'SSC EV Geography & Environment (15)',       data: SSC_GEO },
      { id: ssc_econ_id,       name: 'SSC EV Economics (10)',                    data: SSC_ECONOMICS },
      { id: ssc_civics_id,     name: 'SSC EV Civics & Citizenship (11)',          data: SSC_CIVICS },
      // SSC Optional
      { id: ID.ssc_agriculture,name: 'SSC EV Agriculture Studies (7)',           data: SSC_AGRICULTURE },
      { id: ssc_home_id,       name: 'SSC EV Home Science (18)',                  data: SSC_HOME_SCI },

      // HSC Common
      { id: ID.hsc_bangla1,    name: 'HSC EV Bangla 1st Paper (sections)',       data: HSC_BANGLA1 },
      { id: ID.hsc_bangla2,    name: 'HSC EV Bangla 2nd Paper (sections)',       data: HSC_BANGLA2 },
      { id: ID.hsc_english1,   name: 'HSC EV English 1st Paper (13 units)',      data: HSC_ENGLISH1_UNITS },
      { id: ID.hsc_english2,   name: 'HSC EV English 2nd Paper (topics)',        data: HSC_ENGLISH2_TOPICS },
      { id: ID.hsc_ict,        name: 'HSC EV ICT (6)',                           data: HSC_ICT },
      // HSC Science
      { id: ID.hsc_physics1,   name: 'HSC EV Physics 1st Paper (10)',            data: HSC_PHYSICS1 },
      { id: ID.hsc_physics2,   name: 'HSC EV Physics 2nd Paper (11)',            data: HSC_PHYSICS2 },
      { id: ID.hsc_chem1,      name: 'HSC EV Chemistry 1st Paper (5)',           data: HSC_CHEM1 },
      { id: ID.hsc_chem2,      name: 'HSC EV Chemistry 2nd Paper (5)',           data: HSC_CHEM2 },
      { id: ID.hsc_bio1,       name: 'HSC EV Biology 1st Paper (12)',            data: HSC_BIO1 },
      { id: ID.hsc_bio2,       name: 'HSC EV Biology 2nd Paper (12)',            data: HSC_BIO2 },
      { id: ID.hsc_higher_math1, name:'HSC EV Higher Math 1st Paper (10)',       data: HSC_HIGHER_MATH1 },
      { id: ID.hsc_higher_math2, name:'HSC EV Higher Math 2nd Paper (10)',       data: HSC_HIGHER_MATH2 },
      // HSC Business
      { id: ID.hsc_accounting1,    name: 'HSC EV Accounting 1st Paper (10)',     data: HSC_ACCOUNTING1 },
      { id: hsc_accounting2_id,    name: 'HSC EV Accounting 2nd Paper (10)',     data: HSC_ACCOUNTING2 },
      { id: ID.hsc_bom1,           name: 'HSC EV BOM 1st Paper (12)',            data: HSC_BOM1 },
      { id: hsc_bom2_id,           name: 'HSC EV BOM 2nd Paper (10)',            data: HSC_BOM2 },
      { id: ID.hsc_finance1,       name: 'HSC EV Finance 1st Paper (9)',         data: HSC_FINANCE1 },
      { id: hsc_finance2_id,       name: 'HSC EV Finance 2nd Paper (14)',        data: HSC_FINANCE2 },
      { id: hsc_production1_id,    name: 'HSC EV Production Mgmt 1st Paper (10)',data: HSC_PRODUCTION1 },
      { id: hsc_production2_id,    name: 'HSC EV Production Mgmt 2nd Paper (10)',data: HSC_PRODUCTION2 },
      // HSC Humanities
      { id: hsc_history1_id,       name: 'HSC EV History 1st Paper (8)',         data: HSC_HISTORY1 },
      { id: hsc_history2_id,       name: 'HSC EV History 2nd Paper (9)',         data: HSC_HISTORY2 },
      { id: hsc_isl_hist1_id,      name: 'HSC EV Islamic History 1st Paper (10)',data: HSC_ISLAMIC_HIST1 },
      { id: hsc_isl_hist2_id,      name: 'HSC EV Islamic History 2nd Paper (6)', data: HSC_ISLAMIC_HIST2 },
      { id: hsc_isl_studies1_id,   name: 'HSC EV Islamic Studies 1st Paper (7)', data: HSC_ISLAMIC_STUDIES1 },
      { id: hsc_isl_studies2_id,   name: 'HSC EV Islamic Studies 2nd Paper (7)', data: HSC_ISLAMIC_STUDIES2 },
      { id: ID.hsc_civics1,        name: 'HSC EV Civics 1st Paper (10)',         data: HSC_CIVICS1 },
      { id: hsc_civics2_id,        name: 'HSC EV Civics 2nd Paper (10)',         data: HSC_CIVICS2 },
      { id: ID.hsc_economics1,     name: 'HSC EV Economics 1st Paper (10)',      data: HSC_ECONOMICS1 },
      { id: hsc_econ2_id,          name: 'HSC EV Economics 2nd Paper (10)',      data: HSC_ECONOMICS2 },
      { id: hsc_sociology1_id,     name: 'HSC EV Sociology 1st Paper (11)',      data: HSC_SOCIOLOGY1 },
      { id: hsc_sociology2_id,     name: 'HSC EV Sociology 2nd Paper (10)',      data: HSC_SOCIOLOGY2 },
      { id: ID.hsc_logic1,         name: 'HSC EV Logic 1st Paper (8)',           data: HSC_LOGIC1 },
      { id: hsc_logic2_id,         name: 'HSC EV Logic 2nd Paper (8)',           data: HSC_LOGIC2 },
      { id: hsc_social_work1_id,   name: 'HSC EV Social Work 1st Paper (8)',     data: HSC_SOCIAL_WORK1 },
      { id: hsc_social_work2_id,   name: 'HSC EV Social Work 2nd Paper (9)',     data: HSC_SOCIAL_WORK2 },
      { id: hsc_geo1_id,           name: 'HSC EV Geography 1st Paper (14)',      data: HSC_GEO1 },
      { id: hsc_geo2_id,           name: 'HSC EV Geography 2nd Paper (13)',      data: HSC_GEO2 },
    ];

    for (const s of subjects) {
      console.log(`\n📚 ${s.name}`);
      await upsert(client, s.id, s.data);
    }

    console.log('\n✅ Batch 4 complete! All EV chapters added. No data deleted.');
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(console.error);

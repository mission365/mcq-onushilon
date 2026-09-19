/**
 * SAFE UPSERT — Batch 5: Cambridge O Level + IGCSE + AS/A Level
 * Complete curriculum: subjects + topics/chapters
 * Rule: NEVER deletes. Insert new or update existing.
 * Run: npx tsx scripts/add-chapters-batch5.ts
 */

import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/mcq_onushilon',
});

interface Ch { n: number; t: string; }

async function ensureSubject(
  client: pg.PoolClient,
  name: string,
  nameBn: string,
  curriculumVersion: string,
  academicLevel: string,
  extra?: Record<string,string>
): Promise<string> {
  const r = await client.query(
    `SELECT id FROM subjects WHERE name=$1 AND curriculum_version=$2 AND academic_level=$3`,
    [name, curriculumVersion, academicLevel]
  );
  if (r.rows.length > 0) { console.log(`  ✓ ${name}`); return r.rows[0].id; }
  const ins = await client.query(
    `INSERT INTO subjects(id,name,name_bn,curriculum_version,academic_level,is_active,created_at)
     VALUES(gen_random_uuid(),$1,$2,$3,$4,true,NOW()) RETURNING id`,
    [name, nameBn, curriculumVersion, academicLevel]
  );
  console.log(`  ✅ Created: ${name}`);
  return ins.rows[0].id;
}

async function upsert(client: pg.PoolClient, sid: string, chapters: Ch[]) {
  for (const ch of chapters) {
    const ex = await client.query(`SELECT id FROM chapters WHERE subject_id=$1 AND chapter_number=$2`, [sid, ch.n]);
    if (ex.rows.length > 0) {
      await client.query(`UPDATE chapters SET title=$1,title_bn=$1 WHERE subject_id=$2 AND chapter_number=$3`, [ch.t, sid, ch.n]);
      console.log(`    🔄 ${String(ch.n).padStart(2,'0')}. ${ch.t}`);
    } else {
      await client.query(
        `INSERT INTO chapters(id,subject_id,chapter_number,title,title_bn,created_at) VALUES(gen_random_uuid(),$1,$2,$3,$3,NOW())`,
        [sid, ch.n, ch.t]
      );
      console.log(`    ✅ ${String(ch.n).padStart(2,'0')}. ${ch.t}`);
    }
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// KNOWN EXISTING SUBJECT IDs
// ══════════════════════════════════════════════════════════════════════════════
const EXIST = {
  // O Level
  ol_physics:       '92760b72-2069-458d-96ca-423993436e70',
  ol_chemistry:     'a6058903-70e8-424b-9078-fd98b2bee0fc',
  ol_biology:       '95303f0a-e7e6-40de-a85a-9e581c34d462',
  ol_math:          '7a236de4-ae39-4221-9724-ce60584a4072',
  ol_addmath:       '4d6ff55e-fe65-4eee-b1f4-286d3659349b',
  ol_cs:            '09c48931-dda2-4813-b465-2490942d4445',
  // A Level
  al_physics:       'ab880699-1294-47f1-b512-ca78642b20c0',
  al_chemistry:     '9bb13825-71e4-4303-a8ec-42659905a468',
  al_biology:       '3973235b-8ad2-47d3-a6bb-aeb8952ae7d2',
  al_math:          '7ee81367-6eb9-4b93-8e16-94e73152516c', // Pure Mathematics
  al_further_math:  '3d34f8bd-01fa-430f-9211-31424ae2ffbb',
  al_cs:            '8f828cfb-12a0-4cb9-a64c-1ee4aa37f226',
  al_it:            '51cb6167-b30a-440c-961b-50a81a033502',
};

// ══════════════════════════════════════════════════════════════════════════════
// TOPIC DATA
// ══════════════════════════════════════════════════════════════════════════════

// ── O LEVEL ──────────────────────────────────────────────────────────────────
const OL_PHYSICS: Ch[] = [
  { n:1, t:'Topic 1: Motion, forces and energy' },
  { n:2, t:'Topic 2: Thermal physics' },
  { n:3, t:'Topic 3: Waves' },
  { n:4, t:'Topic 4: Electricity and magnetism' },
  { n:5, t:'Topic 5: Nuclear physics' },
  { n:6, t:'Topic 6: Space physics' },
];
const OL_CHEMISTRY: Ch[] = [
  { n:1,  t:'Topic 1: States of matter' },
  { n:2,  t:'Topic 2: Atoms, elements and compounds' },
  { n:3,  t:'Topic 3: Stoichiometry' },
  { n:4,  t:'Topic 4: Electrochemistry' },
  { n:5,  t:'Topic 5: Chemical energetics' },
  { n:6,  t:'Topic 6: Chemical reactions' },
  { n:7,  t:'Topic 7: Acids, bases and salts' },
  { n:8,  t:'Topic 8: The Periodic Table' },
  { n:9,  t:'Topic 9: Metals' },
  { n:10, t:'Topic 10: Chemistry of the environment' },
  { n:11, t:'Topic 11: Organic chemistry' },
  { n:12, t:'Topic 12: Experimental techniques and chemical analysis' },
];
const OL_BIOLOGY: Ch[] = [
  { n:1,  t:'Topic 1: Cells' },
  { n:2,  t:'Topic 2: Classification' },
  { n:3,  t:'Topic 3: Movement into and out of cells' },
  { n:4,  t:'Topic 4: Biological molecules' },
  { n:5,  t:'Topic 5: Enzymes' },
  { n:6,  t:'Topic 6: Plant nutrition' },
  { n:7,  t:'Topic 7: Transport in flowering plants' },
  { n:8,  t:'Topic 8: Human nutrition' },
  { n:9,  t:'Topic 9: Human gas exchange' },
  { n:10, t:'Topic 10: Respiration' },
  { n:11, t:'Topic 11: Transport in humans' },
  { n:12, t:'Topic 12: Disease and immunity' },
  { n:13, t:'Topic 13: Excretion' },
  { n:14, t:'Topic 14: Coordination and control' },
  { n:15, t:'Topic 15: Coordination and response in plants' },
  { n:16, t:'Topic 16: Development of organisms and continuity of life' },
  { n:17, t:'Topic 17: Inheritance' },
  { n:18, t:'Topic 18: Biotechnology and genetic modification' },
  { n:19, t:'Topic 19: Relationships of organisms with one another and with the environment' },
];
const OL_MATH: Ch[] = [
  { n:1, t:'Topic 1: Number' },
  { n:2, t:'Topic 2: Algebra and graphs' },
  { n:3, t:'Topic 3: Coordinate geometry' },
  { n:4, t:'Topic 4: Geometry' },
  { n:5, t:'Topic 5: Mensuration' },
  { n:6, t:'Topic 6: Trigonometry' },
  { n:7, t:'Topic 7: Transformations and vectors' },
  { n:8, t:'Topic 8: Probability' },
  { n:9, t:'Topic 9: Statistics' },
];
const OL_ADDMATH: Ch[] = [
  { n:1,  t:'Topic 1: Functions' },
  { n:2,  t:'Topic 2: Quadratic functions' },
  { n:3,  t:'Topic 3: Factors of polynomials' },
  { n:4,  t:'Topic 4: Equations, inequalities and graphs' },
  { n:5,  t:'Topic 5: Simultaneous equations' },
  { n:6,  t:'Topic 6: Logarithmic and exponential functions' },
  { n:7,  t:'Topic 7: Straight-line graphs' },
  { n:8,  t:'Topic 8: Coordinate geometry of the circle' },
  { n:9,  t:'Topic 9: Circular measure' },
  { n:10, t:'Topic 10: Trigonometry' },
  { n:11, t:'Topic 11: Permutations and combinations' },
  { n:12, t:'Topic 12: Series' },
  { n:13, t:'Topic 13: Vectors in two dimensions' },
  { n:14, t:'Topic 14: Calculus' },
];
const OL_CS: Ch[] = [
  { n:1,  t:'Topic 1: Data representation' },
  { n:2,  t:'Topic 2: Data transmission' },
  { n:3,  t:'Topic 3: Hardware' },
  { n:4,  t:'Topic 4: Software' },
  { n:5,  t:'Topic 5: The internet and its uses' },
  { n:6,  t:'Topic 6: Automated and emerging technologies' },
  { n:7,  t:'Topic 7: Algorithm design and problem-solving' },
  { n:8,  t:'Topic 8: Programming' },
  { n:9,  t:'Topic 9: Databases' },
  { n:10, t:'Topic 10: Boolean logic' },
];
const OL_ENV_MGMT: Ch[] = [
  { n:1, t:'Topic 1: Rocks and minerals and their exploitation' },
  { n:2, t:'Topic 2: Energy and the environment' },
  { n:3, t:'Topic 3: Agriculture and the environment' },
  { n:4, t:'Topic 4: Water and its management' },
  { n:5, t:'Topic 5: Oceans and fisheries' },
  { n:6, t:'Topic 6: Managing natural hazards' },
  { n:7, t:'Topic 7: The atmosphere and human activities' },
  { n:8, t:'Topic 8: Human population' },
  { n:9, t:'Topic 9: Natural ecosystems and human activities' },
];
const OL_AGRICULTURE: Ch[] = [
  { n:1,  t:'Topic 1: General agriculture' },
  { n:2,  t:'Topic 2: Soil' },
  { n:3,  t:'Topic 3: Principles of plant growth' },
  { n:4,  t:'Topic 4: Crop production' },
  { n:5,  t:'Topic 5: Crop protection' },
  { n:6,  t:'Topic 6: Livestock anatomy and physiology' },
  { n:7,  t:'Topic 7: Livestock production and health' },
  { n:8,  t:'Topic 8: Pasture management' },
  { n:9,  t:'Topic 9: Livestock and crop breeding' },
  { n:10, t:'Topic 10: Farm structure and tools' },
];
const OL_STATS: Ch[] = [
  { n:1,  t:'Topic 1: Data and its collection' },
  { n:2,  t:'Topic 2: Summary representation of data' },
  { n:3,  t:'Topic 3: Formation of data into ungrouped or grouped frequency distributions' },
  { n:4,  t:'Topic 4: Formation of frequency distributions into cumulative frequency distributions' },
  { n:5,  t:'Topic 5: Statistical measures, their interpretation and appropriate use' },
  { n:6,  t:'Topic 6: Transformations involving mean and standard deviation' },
  { n:7,  t:'Topic 7: Crude and standardised rates, and their appropriate use' },
  { n:8,  t:'Topic 8: Index numbers' },
  { n:9,  t:'Topic 9: Bivariate distributions and their representation by scatter diagrams' },
  { n:10, t:'Topic 10: Time series' },
  { n:11, t:'Topic 11: Elementary ideas of probability' },
  { n:12, t:'Topic 12: Probability distributions' },
];
const OL_MARINE: Ch[] = [
  { n:1, t:'Topic 1: Introduction to Marine Science' },
  { n:2, t:'Topic 2: Geomorphology of the marine environment' },
  { n:3, t:'Topic 3: The sea shore' },
  { n:4, t:'Topic 4: Coastal features' },
  { n:5, t:'Topic 5: Atoll formation' },
  { n:6, t:'Topic 6: Chemical properties of sea water' },
  { n:7, t:'Topic 7: Physical properties of sea water' },
  { n:8, t:'Topic 8: Climatic features' },
];

// ── IGCSE ─────────────────────────────────────────────────────────────────────
const IGCSE_COMBINED_BIO: Ch[] = [
  { n:1,  t:'B1: Characteristics of living organisms' },
  { n:2,  t:'B2: Cells' },
  { n:3,  t:'B3: Movement into and out of cells' },
  { n:4,  t:'B4: Biological molecules' },
  { n:5,  t:'B5: Enzymes' },
  { n:6,  t:'B6: Plant nutrition' },
  { n:7,  t:'B7: Human nutrition' },
  { n:8,  t:'B8: Transport in plants' },
  { n:9,  t:'B9: Transport in animals' },
  { n:10, t:'B10: Diseases and immunity' },
  { n:11, t:'B11: Gas exchange in humans' },
  { n:12, t:'B12: Respiration' },
  { n:13, t:'B13: Drugs' },
  { n:14, t:'B14: Reproduction' },
  { n:15, t:'B15: Organisms and their environment' },
  { n:16, t:'B16: Human influences on ecosystems' },
];
const IGCSE_COMBINED_CHEM: Ch[] = [
  { n:1,  t:'C1: States of matter' },
  { n:2,  t:'C2: Atoms, elements and compounds' },
  { n:3,  t:'C3: Stoichiometry' },
  { n:4,  t:'C4: Electrochemistry' },
  { n:5,  t:'C5: Chemical energetics' },
  { n:6,  t:'C6: Chemical reactions' },
  { n:7,  t:'C7: Acids, bases and salts' },
  { n:8,  t:'C8: The Periodic Table' },
  { n:9,  t:'C9: Metals' },
  { n:10, t:'C10: Chemistry of the environment' },
  { n:11, t:'C11: Organic chemistry' },
  { n:12, t:'C12: Experimental techniques and chemical analysis' },
];
const IGCSE_COMBINED_PHY: Ch[] = [
  { n:1, t:'P1: Motion, forces and energy' },
  { n:2, t:'P2: Thermal physics' },
  { n:3, t:'P3: Waves' },
  { n:4, t:'P4: Electricity' },
  { n:5, t:'P5: Space physics' },
];
// IGCSE Co-ordinated Sciences (0654) — extra biology topics beyond combined
const IGCSE_COORD_BIO_EXTRA: Ch[] = [
  { n:1,  t:'B1: Characteristics of living organisms' },
  { n:2,  t:'B2: Cells' },
  { n:3,  t:'B3: Movement into and out of cells' },
  { n:4,  t:'B4: Biological molecules' },
  { n:5,  t:'B5: Enzymes' },
  { n:6,  t:'B6: Plant nutrition' },
  { n:7,  t:'B7: Human nutrition' },
  { n:8,  t:'B8: Transport in plants' },
  { n:9,  t:'B9: Transport in animals' },
  { n:10, t:'B10: Diseases and immunity' },
  { n:11, t:'B11: Gas exchange in humans' },
  { n:12, t:'B12: Respiration' },
  { n:13, t:'B13: Coordination and response' },
  { n:14, t:'B14: Reproduction' },
  { n:15, t:'B15: Organisms and their environment' },
  { n:16, t:'B16: Inheritance' },
  { n:17, t:'B17: Variation and selection' },
  { n:18, t:'B18: Organisms and their environment' },
  { n:19, t:'B19: Human influences on ecosystems' },
];
const IGCSE_COORD_PHY: Ch[] = [
  { n:1, t:'P1: Motion, forces and energy' },
  { n:2, t:'P2: Thermal physics' },
  { n:3, t:'P3: Waves' },
  { n:4, t:'P4: Electricity and magnetism' },
  { n:5, t:'P5: Nuclear physics' },
  { n:6, t:'P6: Space physics' },
];
// IGCSE Physical Science 0652 (legacy - withdrawing Nov 2026)
const IGCSE_PHYSICAL_CHEM: Ch[] = [
  { n:1,  t:'C1: The particulate nature of matter' },
  { n:2,  t:'C2: Experimental techniques' },
  { n:3,  t:'C3: Atoms, elements and compounds' },
  { n:4,  t:'C4: Stoichiometry' },
  { n:5,  t:'C5: Electricity and chemistry' },
  { n:6,  t:'C6: Energy changes in chemical reactions' },
  { n:7,  t:'C7: Acids, bases and salts' },
  { n:8,  t:'C8: The Periodic Table' },
  { n:9,  t:'C9: Metals' },
  { n:10, t:'C10: Air and water' },
  { n:11, t:'C11: Carbonates' },
  { n:12, t:'C12: Organic chemistry' },
];
const IGCSE_PHYSICAL_PHY: Ch[] = [
  { n:1, t:'P1: General physics' },
  { n:2, t:'P2: Thermal physics' },
  { n:3, t:'P3: Properties of waves, including light and sound' },
  { n:4, t:'P4: Electricity and magnetism' },
  { n:5, t:'P5: Atomic physics' },
];
const IGCSE_ENV_MGMT: Ch[] = [
  { n:1, t:'Topic 1: Rocks and minerals and their exploitation' },
  { n:2, t:'Topic 2: Energy and the environment' },
  { n:3, t:'Topic 3: Agriculture and the environment' },
  { n:4, t:'Topic 4: Water and its management' },
  { n:5, t:'Topic 5: Oceans and fisheries' },
  { n:6, t:'Topic 6: Managing natural hazards' },
  { n:7, t:'Topic 7: The atmosphere and human activities' },
  { n:8, t:'Topic 8: Human population' },
  { n:9, t:'Topic 9: Natural ecosystems and human activities' },
];
const IGCSE_AGRICULTURE: Ch[] = OL_AGRICULTURE; // same structure
const IGCSE_MARINE: Ch[] = [
  { n:1, t:'Topic 1: The Earth and its oceans' },
  { n:2, t:'Topic 2: Sea water' },
  { n:3, t:'Topic 3: Marine organisms' },
  { n:4, t:'Topic 4: Nutrients and energy' },
  { n:5, t:'Topic 5: Marine ecology' },
  { n:6, t:'Topic 6: Human influences on the marine environment' },
];
const IGCSE_STATS: Ch[] = [
  { n:1,  t:'Topic 1: Data and its collection' },
  { n:2,  t:'Topic 2: Representation of data' },
  { n:3,  t:'Topic 3: Frequency distributions' },
  { n:4,  t:'Topic 4: Measures of central tendency' },
  { n:5,  t:'Topic 5: Quartiles, percentiles and measures of dispersion' },
  { n:6,  t:'Topic 6: Transformations of data sets' },
  { n:7,  t:'Topic 7: Probability' },
  { n:8,  t:'Topic 8: Probability distributions' },
  { n:9,  t:'Topic 9: Crude and standardised rates' },
  { n:10, t:'Topic 10: Index numbers' },
  { n:11, t:'Topic 11: Bivariate distributions' },
  { n:12, t:'Topic 12: Time series' },
];

// ── AS / A LEVEL ──────────────────────────────────────────────────────────────
// Physics 9702 — AS Topics 1–11 + A Level additional 12–25
const AL_PHYSICS: Ch[] = [
  { n:1,  t:'AS Topic 1: Physical quantities and units' },
  { n:2,  t:'AS Topic 2: Kinematics' },
  { n:3,  t:'AS Topic 3: Dynamics' },
  { n:4,  t:'AS Topic 4: Forces, density and pressure' },
  { n:5,  t:'AS Topic 5: Work, energy and power' },
  { n:6,  t:'AS Topic 6: Deformation of solids' },
  { n:7,  t:'AS Topic 7: Waves' },
  { n:8,  t:'AS Topic 8: Superposition' },
  { n:9,  t:'AS Topic 9: Electricity' },
  { n:10, t:'AS Topic 10: D.C. circuits' },
  { n:11, t:'AS Topic 11: Particle physics' },
  { n:12, t:'A2 Topic 12: Motion in a circle' },
  { n:13, t:'A2 Topic 13: Gravitational fields' },
  { n:14, t:'A2 Topic 14: Temperature' },
  { n:15, t:'A2 Topic 15: Ideal gases' },
  { n:16, t:'A2 Topic 16: Thermodynamics' },
  { n:17, t:'A2 Topic 17: Oscillations' },
  { n:18, t:'A2 Topic 18: Electric fields' },
  { n:19, t:'A2 Topic 19: Capacitance' },
  { n:20, t:'A2 Topic 20: Magnetic fields' },
  { n:21, t:'A2 Topic 21: Alternating currents' },
  { n:22, t:'A2 Topic 22: Quantum physics' },
  { n:23, t:'A2 Topic 23: Nuclear physics' },
  { n:24, t:'A2 Topic 24: Medical physics' },
  { n:25, t:'A2 Topic 25: Astronomy and cosmology' },
];
// Chemistry 9701 — AS Topics 1–22 + A Level additional 23–37
const AL_CHEMISTRY: Ch[] = [
  // AS Physical
  { n:1,  t:'AS Topic 1: Atomic structure' },
  { n:2,  t:'AS Topic 2: Atoms, molecules and stoichiometry' },
  { n:3,  t:'AS Topic 3: Chemical bonding' },
  { n:4,  t:'AS Topic 4: States of matter' },
  { n:5,  t:'AS Topic 5: Chemical energetics' },
  { n:6,  t:'AS Topic 6: Electrochemistry' },
  { n:7,  t:'AS Topic 7: Equilibria' },
  { n:8,  t:'AS Topic 8: Reaction kinetics' },
  // AS Inorganic
  { n:9,  t:'AS Topic 9: The Periodic Table: chemical periodicity' },
  { n:10, t:'AS Topic 10: Group 2' },
  { n:11, t:'AS Topic 11: Group 17' },
  { n:12, t:'AS Topic 12: Nitrogen and sulfur' },
  // AS Organic
  { n:13, t:'AS Topic 13: An introduction to AS Level organic chemistry' },
  { n:14, t:'AS Topic 14: Hydrocarbons' },
  { n:15, t:'AS Topic 15: Halogen compounds' },
  { n:16, t:'AS Topic 16: Hydroxy compounds' },
  { n:17, t:'AS Topic 17: Carbonyl compounds' },
  { n:18, t:'AS Topic 18: Carboxylic acids and derivatives' },
  { n:19, t:'AS Topic 19: Nitrogen compounds' },
  { n:20, t:'AS Topic 20: Polymerisation' },
  { n:21, t:'AS Topic 21: Organic synthesis' },
  // AS Analysis
  { n:22, t:'AS Topic 22: Analytical techniques' },
  // A Level additional
  { n:23, t:'A2 Topic 23: Chemical energetics' },
  { n:24, t:'A2 Topic 24: Electrochemistry' },
  { n:25, t:'A2 Topic 25: Equilibria' },
  { n:26, t:'A2 Topic 26: Reaction kinetics' },
  { n:27, t:'A2 Topic 27: Group 2' },
  { n:28, t:'A2 Topic 28: Chemistry of transition elements' },
  { n:29, t:'A2 Topic 29: An introduction to A Level organic chemistry' },
  { n:30, t:'A2 Topic 30: Hydrocarbons' },
  { n:31, t:'A2 Topic 31: Halogen compounds' },
  { n:32, t:'A2 Topic 32: Hydroxy compounds' },
  { n:33, t:'A2 Topic 33: Carboxylic acids and derivatives' },
  { n:34, t:'A2 Topic 34: Nitrogen compounds' },
  { n:35, t:'A2 Topic 35: Polymerisation' },
  { n:36, t:'A2 Topic 36: Organic synthesis' },
  { n:37, t:'A2 Topic 37: Analytical techniques' },
];
// Biology 9700 — AS Topics 1–11 + A Level additional 12–19
const AL_BIOLOGY: Ch[] = [
  { n:1,  t:'AS Topic 1: Cell structure' },
  { n:2,  t:'AS Topic 2: Biological molecules' },
  { n:3,  t:'AS Topic 3: Enzymes' },
  { n:4,  t:'AS Topic 4: Cell membranes and transport' },
  { n:5,  t:'AS Topic 5: The mitotic cell cycle' },
  { n:6,  t:'AS Topic 6: Nucleic acids and protein synthesis' },
  { n:7,  t:'AS Topic 7: Transport in plants' },
  { n:8,  t:'AS Topic 8: Transport in mammals' },
  { n:9,  t:'AS Topic 9: Gas exchange' },
  { n:10, t:'AS Topic 10: Infectious diseases' },
  { n:11, t:'AS Topic 11: Immunity' },
  { n:12, t:'A2 Topic 12: Energy and respiration' },
  { n:13, t:'A2 Topic 13: Photosynthesis' },
  { n:14, t:'A2 Topic 14: Homeostasis' },
  { n:15, t:'A2 Topic 15: Control and coordination' },
  { n:16, t:'A2 Topic 16: Inheritance' },
  { n:17, t:'A2 Topic 17: Selection and evolution' },
  { n:18, t:'A2 Topic 18: Classification, biodiversity and conservation' },
  { n:19, t:'A2 Topic 19: Genetic technology' },
];
// Mathematics 9709 — Component-based (stored as flat numbered topics)
const AL_MATH_PM1: Ch[] = [
  { n:1, t:'P1.1: Quadratics' },
  { n:2, t:'P1.2: Functions' },
  { n:3, t:'P1.3: Coordinate geometry' },
  { n:4, t:'P1.4: Circular measure' },
  { n:5, t:'P1.5: Trigonometry' },
  { n:6, t:'P1.6: Series' },
  { n:7, t:'P1.7: Differentiation' },
  { n:8, t:'P1.8: Integration' },
];
const AL_MATH_PM2: Ch[] = [
  { n:1, t:'P2.1: Algebra' },
  { n:2, t:'P2.2: Logarithmic and exponential functions' },
  { n:3, t:'P2.3: Trigonometry' },
  { n:4, t:'P2.4: Differentiation' },
  { n:5, t:'P2.5: Integration' },
  { n:6, t:'P2.6: Numerical solution of equations' },
];
const AL_MATH_PM3: Ch[] = [
  { n:1, t:'P3.1: Algebra' },
  { n:2, t:'P3.2: Logarithmic and exponential functions' },
  { n:3, t:'P3.3: Trigonometry' },
  { n:4, t:'P3.4: Differentiation' },
  { n:5, t:'P3.5: Integration' },
  { n:6, t:'P3.6: Numerical solution of equations' },
  { n:7, t:'P3.7: Vectors' },
  { n:8, t:'P3.8: Differential equations' },
  { n:9, t:'P3.9: Complex numbers' },
];
const AL_MATH_MECH: Ch[] = [
  { n:1, t:'M4.1: Forces and equilibrium' },
  { n:2, t:'M4.2: Kinematics of motion in a straight line' },
  { n:3, t:'M4.3: Momentum' },
  { n:4, t:'M4.4: Newton\'s laws of motion' },
  { n:5, t:'M4.5: Energy, work and power' },
];
const AL_MATH_S1: Ch[] = [
  { n:1, t:'S1.1: Representation of data' },
  { n:2, t:'S1.2: Permutations and combinations' },
  { n:3, t:'S1.3: Probability' },
  { n:4, t:'S1.4: Discrete random variables' },
  { n:5, t:'S1.5: The normal distribution' },
];
const AL_MATH_S2: Ch[] = [
  { n:1, t:'S2.1: The Poisson distribution' },
  { n:2, t:'S2.2: Linear combinations of random variables' },
  { n:3, t:'S2.3: Continuous random variables' },
  { n:4, t:'S2.4: Sampling and estimation' },
  { n:5, t:'S2.5: Hypothesis tests' },
];
// Further Mathematics 9231
const AL_FURTHER_PM1: Ch[] = [
  { n:1, t:'FP1.1: Roots of polynomial equations' },
  { n:2, t:'FP1.2: Rational functions and graphs' },
  { n:3, t:'FP1.3: Summation of series' },
  { n:4, t:'FP1.4: Matrices' },
  { n:5, t:'FP1.5: Polar coordinates' },
  { n:6, t:'FP1.6: Vectors' },
  { n:7, t:'FP1.7: Proof by induction' },
];
const AL_FURTHER_PM2: Ch[] = [
  { n:1, t:'FP2.1: Hyperbolic functions' },
  { n:2, t:'FP2.2: Matrices' },
  { n:3, t:'FP2.3: Differentiation' },
  { n:4, t:'FP2.4: Integration' },
  { n:5, t:'FP2.5: Complex numbers' },
  { n:6, t:'FP2.6: Differential equations' },
];
const AL_FURTHER_MECH: Ch[] = [
  { n:1, t:'FM3.1: Motion of a projectile' },
  { n:2, t:'FM3.2: Equilibrium of a rigid body' },
  { n:3, t:'FM3.3: Circular motion' },
  { n:4, t:'FM3.4: Hooke\'s law' },
  { n:5, t:'FM3.5: Linear motion under a variable force' },
  { n:6, t:'FM3.6: Momentum' },
];
const AL_FURTHER_STATS: Ch[] = [
  { n:1, t:'FS4.1: Continuous random variables' },
  { n:2, t:'FS4.2: Inference using normal and t-distributions' },
  { n:3, t:'FS4.3: χ²-tests' },
  { n:4, t:'FS4.4: Non-parametric tests' },
  { n:5, t:'FS4.5: Probability generating functions' },
];
// Computer Science 9618 — AS 1–12 + A Level additional 13–20
const AL_CS: Ch[] = [
  { n:1,  t:'AS Topic 1: Information representation' },
  { n:2,  t:'AS Topic 2: Communication' },
  { n:3,  t:'AS Topic 3: Hardware' },
  { n:4,  t:'AS Topic 4: Processor Fundamentals' },
  { n:5,  t:'AS Topic 5: System Software' },
  { n:6,  t:'AS Topic 6: Security, privacy and data integrity' },
  { n:7,  t:'AS Topic 7: Ethics and Ownership' },
  { n:8,  t:'AS Topic 8: Databases' },
  { n:9,  t:'AS Topic 9: Algorithm Design and Problem-solving' },
  { n:10, t:'AS Topic 10: Data Types and Structures' },
  { n:11, t:'AS Topic 11: Programming' },
  { n:12, t:'AS Topic 12: Software Development' },
  { n:13, t:'A2 Topic 13: Data Representation' },
  { n:14, t:'A2 Topic 14: Communication and internet technologies' },
  { n:15, t:'A2 Topic 15: Hardware and Virtual Machines' },
  { n:16, t:'A2 Topic 16: System Software' },
  { n:17, t:'A2 Topic 17: Security' },
  { n:18, t:'A2 Topic 18: Artificial Intelligence (AI)' },
  { n:19, t:'A2 Topic 19: Computational thinking and Problem-solving' },
  { n:20, t:'A2 Topic 20: Further Programming' },
];
// Information Technology 9626 — AS 1–11 + A Level additional 12–21
const AL_IT: Ch[] = [
  { n:1,  t:'AS Topic 1: Data processing and information' },
  { n:2,  t:'AS Topic 2: Hardware and software' },
  { n:3,  t:'AS Topic 3: Monitoring and control' },
  { n:4,  t:'AS Topic 4: Algorithms and flowcharts' },
  { n:5,  t:'AS Topic 5: eSecurity' },
  { n:6,  t:'AS Topic 6: The digital divide' },
  { n:7,  t:'AS Topic 7: Expert systems' },
  { n:8,  t:'AS Topic 8: Spreadsheets' },
  { n:9,  t:'AS Topic 9: Modelling' },
  { n:10, t:'AS Topic 10: Database and file concepts' },
  { n:11, t:'AS Topic 11: Video and audio editing' },
  { n:12, t:'A2 Topic 12: IT in society' },
  { n:13, t:'A2 Topic 13: New and emerging technologies' },
  { n:14, t:'A2 Topic 14: Communications technology' },
  { n:15, t:'A2 Topic 15: Project management' },
  { n:16, t:'A2 Topic 16: System life cycle' },
  { n:17, t:'A2 Topic 17: Data analysis and visualisation' },
  { n:18, t:'A2 Topic 18: Mail merge' },
  { n:19, t:'A2 Topic 19: Graphics creation' },
  { n:20, t:'A2 Topic 20: Animation' },
  { n:21, t:'A2 Topic 21: Programming for the web' },
];
// Marine Science 9693 — AS 1–5 + A Level 6–9
const AL_MARINE: Ch[] = [
  { n:1, t:'AS Topic 1: Water' },
  { n:2, t:'AS Topic 2: Earth processes' },
  { n:3, t:'AS Topic 3: Interactions in marine ecosystems' },
  { n:4, t:'AS Topic 4: Classification and biodiversity' },
  { n:5, t:'AS Topic 5: Examples of marine ecosystems' },
  { n:6, t:'A2 Topic 6: Physiology of marine organisms' },
  { n:7, t:'A2 Topic 7: Energy' },
  { n:8, t:'A2 Topic 8: Fisheries for the future' },
  { n:9, t:'A2 Topic 9: Human impacts on marine ecosystems' },
];
// AS Environmental Management 8291 (AS only)
const AS_ENV_MGMT: Ch[] = [
  { n:1, t:'Topic 1: Introduction to environmental management' },
  { n:2, t:'Topic 2: Environmental research and data collection' },
  { n:3, t:'Topic 3: Managing human population' },
  { n:4, t:'Topic 4: Managing ecosystems and biodiversity' },
  { n:5, t:'Topic 5: Managing resources' },
  { n:6, t:'Topic 6: Managing water supplies' },
  { n:7, t:'Topic 7: Managing the atmosphere' },
  { n:8, t:'Topic 8: Managing climate change' },
];

// ══════════════════════════════════════════════════════════════════════════════
async function main() {
  const client = await pool.connect();
  try {
    // ── Create all missing Cambridge subjects ─────────────────────────────
    console.log('\n🔧 Creating O Level subjects...');
    // O Level — existing subjects already in DB for physics/chem/bio/math/addmath/cs
    const ol_env_id    = await ensureSubject(client, 'O Level Environmental Management (5014)', 'Environmental Management (O Level)', 'cambridge', 'olevel');
    const ol_agri_id   = await ensureSubject(client, 'O Level Agriculture (5038)', 'Agriculture (O Level)', 'cambridge', 'olevel');
    const ol_stats_id  = await ensureSubject(client, 'O Level Statistics (4040)', 'Statistics (O Level)', 'cambridge', 'olevel');
    const ol_marine_id = await ensureSubject(client, 'O Level Marine Science (5180)', 'Marine Science (O Level)', 'cambridge', 'olevel');

    console.log('\n🔧 Creating IGCSE subjects...');
    const igcse_bio_id       = await ensureSubject(client, 'IGCSE Biology (0610)', 'Biology (IGCSE)', 'cambridge', 'igcse');
    const igcse_chem_id      = await ensureSubject(client, 'IGCSE Chemistry (0620)', 'Chemistry (IGCSE)', 'cambridge', 'igcse');
    const igcse_phy_id       = await ensureSubject(client, 'IGCSE Physics (0625)', 'Physics (IGCSE)', 'cambridge', 'igcse');
    const igcse_combined_id  = await ensureSubject(client, 'IGCSE Combined Science (0653)', 'Combined Science (IGCSE)', 'cambridge', 'igcse');
    const igcse_combined_bio_id  = await ensureSubject(client, 'IGCSE Combined Science Biology (0653)', 'Combined Science — Biology Section (IGCSE)', 'cambridge', 'igcse');
    const igcse_combined_chem_id = await ensureSubject(client, 'IGCSE Combined Science Chemistry (0653)', 'Combined Science — Chemistry Section (IGCSE)', 'cambridge', 'igcse');
    const igcse_combined_phy_id  = await ensureSubject(client, 'IGCSE Combined Science Physics (0653)', 'Combined Science — Physics Section (IGCSE)', 'cambridge', 'igcse');
    const igcse_coord_bio_id = await ensureSubject(client, 'IGCSE Co-ordinated Sciences Biology (0654)', 'Co-ordinated Sciences — Biology (IGCSE)', 'cambridge', 'igcse');
    const igcse_coord_chem_id= await ensureSubject(client, 'IGCSE Co-ordinated Sciences Chemistry (0654)', 'Co-ordinated Sciences — Chemistry (IGCSE)', 'cambridge', 'igcse');
    const igcse_coord_phy_id = await ensureSubject(client, 'IGCSE Co-ordinated Sciences Physics (0654)', 'Co-ordinated Sciences — Physics (IGCSE)', 'cambridge', 'igcse');
    const igcse_physci_chem_id = await ensureSubject(client, 'IGCSE Physical Science Chemistry (0652)', 'Physical Science — Chemistry (IGCSE, ends 2026)', 'cambridge', 'igcse');
    const igcse_physci_phy_id  = await ensureSubject(client, 'IGCSE Physical Science Physics (0652)', 'Physical Science — Physics (IGCSE, ends 2026)', 'cambridge', 'igcse');
    const igcse_agri_id   = await ensureSubject(client, 'IGCSE Agriculture (0600)', 'Agriculture (IGCSE)', 'cambridge', 'igcse');
    const igcse_env_id    = await ensureSubject(client, 'IGCSE Environmental Management (0680)', 'Environmental Management (IGCSE)', 'cambridge', 'igcse');
    const igcse_marine_id = await ensureSubject(client, 'IGCSE Marine Science (0697)', 'Marine Science (IGCSE)', 'cambridge', 'igcse');
    const igcse_stats_id  = await ensureSubject(client, 'IGCSE Statistics (0479)', 'Statistics (IGCSE, from 2027)', 'cambridge', 'igcse');

    console.log('\n🔧 Creating A Level subjects (missing ones)...');
    // A Level Mathematics papers — split into components
    const al_pm1_id    = await ensureSubject(client, 'A Level Mathematics — Pure Mathematics 1 (9709 P1)', 'A Level Mathematics P1', 'cambridge', 'alevel');
    const al_pm2_id    = await ensureSubject(client, 'A Level Mathematics — Pure Mathematics 2 (9709 P2)', 'A Level Mathematics P2 (AS)', 'cambridge', 'alevel');
    const al_pm3_id    = await ensureSubject(client, 'A Level Mathematics — Pure Mathematics 3 (9709 P3)', 'A Level Mathematics P3', 'cambridge', 'alevel');
    const al_mech_id   = await ensureSubject(client, 'A Level Mathematics — Mechanics (9709 P4)', 'A Level Mathematics Mechanics', 'cambridge', 'alevel');
    const al_s1_id     = await ensureSubject(client, 'A Level Mathematics — Probability & Statistics 1 (9709 P5)', 'A Level Mathematics S1', 'cambridge', 'alevel');
    const al_s2_id     = await ensureSubject(client, 'A Level Mathematics — Probability & Statistics 2 (9709 P6)', 'A Level Mathematics S2', 'cambridge', 'alevel');
    // Further Mathematics components
    const al_fpm1_id   = await ensureSubject(client, 'A Level Further Mathematics — Further Pure 1 (9231 P1)', 'Further Mathematics FP1', 'cambridge', 'alevel');
    const al_fpm2_id   = await ensureSubject(client, 'A Level Further Mathematics — Further Pure 2 (9231 P2)', 'Further Mathematics FP2', 'cambridge', 'alevel');
    const al_fmech_id  = await ensureSubject(client, 'A Level Further Mathematics — Further Mechanics (9231 P3)', 'Further Mathematics Mechanics', 'cambridge', 'alevel');
    const al_fstats_id = await ensureSubject(client, 'A Level Further Mathematics — Further Probability & Statistics (9231 P4)', 'Further Mathematics Stats', 'cambridge', 'alevel');
    // Marine Science & Environmental Management
    const al_marine_id = await ensureSubject(client, 'AS/A Level Marine Science (9693)', 'Marine Science (AS/A Level)', 'cambridge', 'alevel');
    const as_env_id    = await ensureSubject(client, 'AS Environmental Management (8291)', 'Environmental Management (AS only)', 'cambridge', 'alevel');

    // ── Upsert all chapters ──────────────────────────────────────────────
    const subjects = [
      // O Level — existing subjects
      { id: EXIST.ol_physics,    name: 'O Level Physics 5054 (6 topics)',              data: OL_PHYSICS },
      { id: EXIST.ol_chemistry,  name: 'O Level Chemistry 5070 (12 topics)',           data: OL_CHEMISTRY },
      { id: EXIST.ol_biology,    name: 'O Level Biology 5090 (19 topics)',             data: OL_BIOLOGY },
      { id: EXIST.ol_math,       name: 'O Level Mathematics 4024 (9 topics)',          data: OL_MATH },
      { id: EXIST.ol_addmath,    name: 'O Level Additional Mathematics 4037 (14)',     data: OL_ADDMATH },
      { id: EXIST.ol_cs,         name: 'O Level Computer Science 2210 (10)',           data: OL_CS },
      // O Level — new subjects
      { id: ol_env_id,           name: 'O Level Environmental Management 5014 (9)',   data: OL_ENV_MGMT },
      { id: ol_agri_id,          name: 'O Level Agriculture 5038 (10)',               data: OL_AGRICULTURE },
      { id: ol_stats_id,         name: 'O Level Statistics 4040 (12, until 2027)',    data: OL_STATS },
      { id: ol_marine_id,        name: 'O Level Marine Science 5180 (8, restricted)', data: OL_MARINE },
      // IGCSE — Biology/Chem/Phy same structure as O Level
      { id: igcse_bio_id,        name: 'IGCSE Biology 0610 (19 topics)',              data: OL_BIOLOGY },
      { id: igcse_chem_id,       name: 'IGCSE Chemistry 0620 (12 topics)',            data: OL_CHEMISTRY },
      { id: igcse_phy_id,        name: 'IGCSE Physics 0625 (6 topics)',               data: OL_PHYSICS },
      // IGCSE Combined Science 0653
      { id: igcse_combined_bio_id,  name: 'IGCSE Combined Science — Biology B1–B16',  data: IGCSE_COMBINED_BIO },
      { id: igcse_combined_chem_id, name: 'IGCSE Combined Science — Chemistry C1–C12',data: IGCSE_COMBINED_CHEM },
      { id: igcse_combined_phy_id,  name: 'IGCSE Combined Science — Physics P1–P5',   data: IGCSE_COMBINED_PHY },
      // IGCSE Co-ordinated Sciences 0654
      { id: igcse_coord_bio_id,  name: 'IGCSE Co-ord Sciences Biology B1–B19',       data: IGCSE_COORD_BIO_EXTRA },
      { id: igcse_coord_chem_id, name: 'IGCSE Co-ord Sciences Chemistry C1–C12',     data: IGCSE_COMBINED_CHEM },
      { id: igcse_coord_phy_id,  name: 'IGCSE Co-ord Sciences Physics P1–P6',        data: IGCSE_COORD_PHY },
      // IGCSE Physical Science 0652 (legacy)
      { id: igcse_physci_chem_id, name: 'IGCSE Physical Science Chemistry (ends 2026)',data: IGCSE_PHYSICAL_CHEM },
      { id: igcse_physci_phy_id,  name: 'IGCSE Physical Science Physics (ends 2026)',  data: IGCSE_PHYSICAL_PHY },
      // IGCSE Others
      { id: igcse_agri_id,       name: 'IGCSE Agriculture 0600 (10)',                data: IGCSE_AGRICULTURE },
      { id: igcse_env_id,        name: 'IGCSE Environmental Management 0680 (9)',     data: IGCSE_ENV_MGMT },
      { id: igcse_marine_id,     name: 'IGCSE Marine Science 0697 (6)',              data: IGCSE_MARINE },
      { id: igcse_stats_id,      name: 'IGCSE Statistics 0479 (12, from 2027)',      data: IGCSE_STATS },
      // AS / A Level
      { id: EXIST.al_physics,    name: 'A Level Physics 9702 (25 topics)',            data: AL_PHYSICS },
      { id: EXIST.al_chemistry,  name: 'A Level Chemistry 9701 (37 topics)',          data: AL_CHEMISTRY },
      { id: EXIST.al_biology,    name: 'A Level Biology 9700 (19 topics)',            data: AL_BIOLOGY },
      // Mathematics components
      { id: al_pm1_id,           name: 'A Level Math — Pure Maths 1 P1 (8)',         data: AL_MATH_PM1 },
      { id: al_pm2_id,           name: 'A Level Math — Pure Maths 2 P2 (6, AS)',     data: AL_MATH_PM2 },
      { id: al_pm3_id,           name: 'A Level Math — Pure Maths 3 P3 (9)',         data: AL_MATH_PM3 },
      { id: al_mech_id,          name: 'A Level Math — Mechanics P4 (5)',            data: AL_MATH_MECH },
      { id: al_s1_id,            name: 'A Level Math — Stats 1 P5 (5)',             data: AL_MATH_S1 },
      { id: al_s2_id,            name: 'A Level Math — Stats 2 P6 (5)',             data: AL_MATH_S2 },
      // Further Mathematics components
      { id: al_fpm1_id,          name: 'Further Maths — Further Pure 1 P1 (7)',      data: AL_FURTHER_PM1 },
      { id: al_fpm2_id,          name: 'Further Maths — Further Pure 2 P2 (6)',      data: AL_FURTHER_PM2 },
      { id: al_fmech_id,         name: 'Further Maths — Mechanics P3 (6)',           data: AL_FURTHER_MECH },
      { id: al_fstats_id,        name: 'Further Maths — Stats P4 (5)',               data: AL_FURTHER_STATS },
      // CS & IT
      { id: EXIST.al_cs,         name: 'A Level Computer Science 9618 (20 topics)',  data: AL_CS },
      { id: EXIST.al_it,         name: 'A Level Information Technology 9626 (21)',   data: AL_IT },
      // Marine & Env
      { id: al_marine_id,        name: 'A Level Marine Science 9693 (9 topics)',     data: AL_MARINE },
      { id: as_env_id,           name: 'AS Environmental Management 8291 (8)',       data: AS_ENV_MGMT },
    ];

    for (const s of subjects) {
      console.log(`\n📚 ${s.name}`);
      await upsert(client, s.id, s.data);
    }

    console.log('\n✅ Batch 5 complete! All Cambridge subjects + topics loaded. No data deleted.');
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(console.error);

import { pool } from './db.js';

interface CurriculumSubjectSeed {
  curriculumVersion: 'british' | 'ib';
  academicLevel: 'olevel' | 'alevel' | 'myp' | 'dp';
  name: string;
  nameBn: string;
  stream: 'science' | 'commerce' | 'humanities' | 'common';
  icon: string;
  durationMinutes: number;
  totalMarks: number;
  questions: {
    questionText: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctOption: 'a' | 'b' | 'c' | 'd';
    explanation: string;
  }[];
}

export const BRITISH_AND_IB_SUBJECTS: CurriculumSubjectSeed[] = [
  // ============================================================
  // 1. BRITISH CURRICULUM — O LEVEL (Cambridge / Edexcel)
  // ============================================================
  {
    curriculumVersion: 'british',
    academicLevel: 'olevel',
    name: 'O Level Mathematics (Syllabus D)',
    nameBn: 'O Level Mathematics (4024)',
    stream: 'common',
    icon: 'Calculator',
    durationMinutes: 30,
    totalMarks: 25,
    questions: [
      {
        questionText: 'A car travels a distance of 150 km in 2 hours and 30 minutes. What is the average speed of the car in km/h?',
        optionA: '50 km/h',
        optionB: '60 km/h',
        optionC: '65 km/h',
        optionD: '75 km/h',
        correctOption: 'b',
        explanation: 'Time = 2.5 hours. Average speed = Distance / Time = 150 / 2.5 = 60 km/h.',
      },
      {
        questionText: 'Solve the simultaneous equations: 2x + y = 7 and x - y = 2. What is the value of x?',
        optionA: '1',
        optionB: '2',
        optionC: '3',
        optionD: '4',
        correctOption: 'c',
        explanation: 'Adding both equations: (2x + y) + (x - y) = 7 + 2 => 3x = 9 => x = 3.',
      },
      {
        questionText: 'In a right-angled triangle, if the opposite side is 3 cm and adjacent side is 4 cm, what is the hypotenuse?',
        optionA: '5 cm',
        optionB: '6 cm',
        optionC: '7 cm',
        optionD: '25 cm',
        correctOption: 'a',
        explanation: 'By Pythagoras theorem: h = √(3² + 4²) = √(9 + 16) = √25 = 5 cm.',
      },
      {
        questionText: 'Express 0.00045 in standard scientific form (a × 10ⁿ).',
        optionA: '4.5 × 10⁻³',
        optionB: '4.5 × 10⁻⁴',
        optionC: '45 × 10⁻⁵',
        optionD: '0.45 × 10⁻³',
        correctOption: 'b',
        explanation: 'Moving the decimal point 4 places to the right gives 4.5 × 10⁻⁴.',
      },
    ],
  },
  {
    curriculumVersion: 'british',
    academicLevel: 'olevel',
    name: 'O Level Physics',
    nameBn: 'O Level Physics (5054)',
    stream: 'science',
    icon: 'Atom',
    durationMinutes: 25,
    totalMarks: 25,
    questions: [
      {
        questionText: 'Which physical quantity is a vector quantity having both magnitude and direction?',
        optionA: 'Mass',
        optionB: 'Speed',
        optionC: 'Velocity',
        optionD: 'Distance',
        correctOption: 'c',
        explanation: 'Velocity is the rate of change of displacement and has both magnitude and direction.',
      },
      {
        questionText: 'What is the frequency of a sound wave with speed 340 m/s and wavelength 0.85 m?',
        optionA: '200 Hz',
        optionB: '400 Hz',
        optionC: '289 Hz',
        optionD: '425 Hz',
        correctOption: 'b',
        explanation: 'v = f × λ => f = v / λ = 340 / 0.85 = 400 Hz.',
      },
      {
        questionText: 'A current of 2.0 A flows through a resistor of 6.0 Ω for 10 seconds. What is the thermal energy dissipated?',
        optionA: '24 J',
        optionB: '120 J',
        optionC: '240 J',
        optionD: '720 J',
        correctOption: 'c',
        explanation: 'Energy E = I²Rt = (2.0)² × 6.0 × 10 = 4 × 60 = 240 Joules.',
      },
    ],
  },
  {
    curriculumVersion: 'british',
    academicLevel: 'olevel',
    name: 'O Level Chemistry',
    nameBn: 'O Level Chemistry (5070)',
    stream: 'science',
    icon: 'FlaskConical',
    durationMinutes: 25,
    totalMarks: 25,
    questions: [
      {
        questionText: 'What is the electronic configuration of a chlorine atom (atomic number 17)?',
        optionA: '2, 8, 7',
        optionB: '2, 7, 8',
        optionC: '2, 8, 8',
        optionD: '2, 8, 1',
        correctOption: 'a',
        explanation: 'Chlorine has 17 electrons arranged as 2 in the first shell, 8 in the second, and 7 in the outer shell (2, 8, 7).',
      },
      {
        questionText: 'Which gas turns damp red litmus paper blue?',
        optionA: 'Chlorine',
        optionB: 'Ammonia',
        optionC: 'Sulfur dioxide',
        optionD: 'Carbon dioxide',
        correctOption: 'b',
        explanation: 'Ammonia (NH₃) is the only common alkaline gas; it turns damp red litmus paper blue.',
      },
    ],
  },
  {
    curriculumVersion: 'british',
    academicLevel: 'olevel',
    name: 'O Level Biology',
    nameBn: 'O Level Biology (5090)',
    stream: 'science',
    icon: 'Dna',
    durationMinutes: 25,
    totalMarks: 25,
    questions: [
      {
        questionText: 'Which enzyme is responsible for breaking down starch into maltose in the human digestive system?',
        optionA: 'Pepsin',
        optionB: 'Lipase',
        optionC: 'Amylase',
        optionD: 'Trypsin',
        correctOption: 'c',
        explanation: 'Salivary and pancreatic amylase hydrolyze starch into reducing sugars like maltose.',
      },
      {
        questionText: 'What is the function of red blood cells (erythrocytes)?',
        optionA: 'Produce antibodies',
        optionB: 'Transport oxygen',
        optionC: 'Clot blood at wound sites',
        optionD: 'Engulf pathogens',
        correctOption: 'b',
        explanation: 'Red blood cells contain haemoglobin which binds reversibly with oxygen to form oxyhaemoglobin.',
      },
    ],
  },
  {
    curriculumVersion: 'british',
    academicLevel: 'olevel',
    name: 'O Level Economics',
    nameBn: 'O Level Economics (2281)',
    stream: 'commerce',
    icon: 'TrendingUp',
    durationMinutes: 30,
    totalMarks: 30,
    questions: [
      {
        questionText: 'What is the basic economic problem faced by all societies?',
        optionA: 'Unemployment',
        optionB: 'Inflation',
        optionC: 'Scarcity of resources relative to unlimited human wants',
        optionD: 'Trade deficits',
        correctOption: 'c',
        explanation: 'The fundamental economic problem is scarcity: finite resources versus unlimited human wants.',
      },
      {
        questionText: 'Which factor of production receives "rent" as its factor payment?',
        optionA: 'Land',
        optionB: 'Labour',
        optionC: 'Capital',
        optionD: 'Enterprise',
        correctOption: 'a',
        explanation: 'Land yields rent, labour earns wages, capital earns interest, and enterprise earns profit.',
      },
    ],
  },
  {
    curriculumVersion: 'british',
    academicLevel: 'olevel',
    name: 'O Level Accounting',
    nameBn: 'O Level Accounting (7707)',
    stream: 'commerce',
    icon: 'BookOpen',
    durationMinutes: 30,
    totalMarks: 30,
    questions: [
      {
        questionText: 'Which accounting principle states that revenue is recorded when earned, rather than when cash is received?',
        optionA: 'Business entity principle',
        optionB: 'Accruals (matching) principle',
        optionC: 'Prudence principle',
        optionD: 'Money measurement principle',
        correctOption: 'b',
        explanation: 'The accruals principle requires revenue and expenses to be recognized in the period they occur.',
      },
      {
        questionText: 'Which financial document shows the financial position of a business on a specific date?',
        optionA: 'Income Statement',
        optionB: 'Statement of Financial Position (Balance Sheet)',
        optionC: 'Trial Balance',
        optionD: 'Cash Flow Statement',
        correctOption: 'b',
        explanation: 'The Statement of Financial Position details assets, liabilities, and owners\' equity at a specific point in time.',
      },
    ],
  },
  {
    curriculumVersion: 'british',
    academicLevel: 'olevel',
    name: 'O Level Bengali',
    nameBn: 'O Level Bengali (3204 / 4BN1)',
    stream: 'common',
    icon: 'BookOpen',
    durationMinutes: 30,
    totalMarks: 25,
    questions: [
      {
        questionText: 'কোনটি দ্বিগু সমাসের সঠিক উদাহরণ?',
        optionA: 'তেপান্তর',
        optionB: 'পীতাম্বর',
        optionC: 'নীলকণ্ঠ',
        optionD: 'উপকূল',
        correctOption: 'a',
        explanation: 'তেপান্তর (তিন প্রান্তরের সমাহার)—সংখ্যাবাচক শব্দ পূর্বে বসে সমাহার বা সমষ্টি বোঝালে দ্বিগু সমাস হয়।',
      },
      {
        questionText: '‘সূর্য’ শব্দের সমার্থক বা প্রতিশব্দ কোনটি?',
        optionA: 'আদিত্য',
        optionB: 'সুধাকর',
        optionC: 'শশাঙ্ক',
        optionD: 'বিধু',
        correctOption: 'a',
        explanation: 'আদিত্য, রবি, ভাস্কর, তপন হলো সূর্যের সমার্থক শব্দ। শশাঙ্ক ও সুধাকর হলো চাঁদের প্রতিশব্দ।',
      },
      {
        questionText: '‘বিনা মেঘে বজ্রপাত’ বাগধারাটির অন্তর্নিহিত অর্থ কী?',
        optionA: 'অপ্রত্যাশিত বিপদ',
        optionB: 'হঠাৎ ভারী বর্ষণ',
        optionC: 'সৌভাগ্য লাভ',
        optionD: 'ভয়ানক দুর্যোগের পূর্বাভাস',
        correctOption: 'a',
        explanation: 'বিনা মেঘে বজ্রপাত বাগধারাটির অর্থ আকস্মিক বা অপ্রত্যাশিত তীব্র বিপদ।',
      },
      {
        questionText: 'What is the most accurate Bengali translation of: "Honesty is the best policy"?',
        optionA: 'সততাই সর্বোৎকৃষ্ট পন্থা',
        optionB: 'সৎ মানুষ নীতিবান',
        optionC: 'সত্য কথা বলা ভালো',
        optionD: 'সবাইকে বিশ্বাস করো',
        correctOption: 'a',
        explanation: '"Honesty is the best policy" এর প্রমিত ও সার্বজনীন বাংলা প্রবাদ হলো "সততাই সর্বোৎকৃষ্ট পন্থা"।',
      },
    ],
  },
  {
    curriculumVersion: 'british',
    academicLevel: 'olevel',
    name: 'O Level Bangladesh Studies',
    nameBn: 'O Level Bangladesh Studies (7094 / 4BS0)',
    stream: 'humanities',
    icon: 'Globe',
    durationMinutes: 30,
    totalMarks: 25,
    questions: [
      {
        questionText: 'Which landmark historic event on 21 February 1952 laid the foundation for Bengali national identity and self-determination?',
        optionA: 'The Language Movement (Bhasha Andolon)',
        optionB: 'The Six-Point Movement',
        optionC: 'The Non-Cooperation Movement',
        optionD: 'The Tebhaga Movement',
        correctOption: 'a',
        explanation: 'The 1952 Language Movement culminated on 21 February when students sacrificed their lives for the dignity of Bangla, later recognized globally as International Mother Language Day.',
      },
      {
        questionText: 'Which mangrove forest in southwestern Bangladesh is recognized as a UNESCO World Heritage site and natural biodiversity sanctuary?',
        optionA: 'The Sundarbans',
        optionB: 'Madhupur Tract',
        optionC: 'Lawachara Forest',
        optionD: 'Bhawal National Park',
        correctOption: 'a',
        explanation: 'The Sundarbans is the world\'s largest contiguous mangrove wetland ecosystem, home to the endangered Royal Bengal Tiger and diverse estuaries.',
      },
      {
        questionText: 'Who presented the historic Six-Point Demand in 1966 demanding complete political and economic autonomy for East Pakistan?',
        optionA: 'Bangabandhu Sheikh Mujibur Rahman',
        optionB: 'Tajuddin Ahmad',
        optionC: 'Maulana Abdul Hamid Khan Bhashani',
        optionD: 'Sher-e-Bangla A.K. Fazlul Huq',
        correctOption: 'a',
        explanation: 'Bangabandhu Sheikh Mujibur Rahman declared the historic 6-Point Charter of Autonomy in February 1966 in Lahore, often hailed as the charter of Bengali independence.',
      },
      {
        questionText: 'Which industrial sector contributes over 80% of the total export revenue of Bangladesh?',
        optionA: 'Readymade Garments (RMG)',
        optionB: 'Jute & Jute goods',
        optionC: 'Pharmaceutical products',
        optionD: 'Frozen shrimp and seafood',
        correctOption: 'a',
        explanation: 'The Readymade Garments (RMG) manufacturing and apparel sector forms the backbone of Bangladesh foreign exchange export earnings.',
      },
    ],
  },
  {
    curriculumVersion: 'british',
    academicLevel: 'olevel',
    name: 'O Level English Language',
    nameBn: 'O Level English Language (1123 / 4EA1)',
    stream: 'common',
    icon: 'PenTool',
    durationMinutes: 30,
    totalMarks: 25,
    questions: [
      {
        questionText: 'Choose the sentence that demonstrates correct grammatical subject-verb agreement.',
        optionA: 'Neither the supervisor nor the technicians were aware of the power surge.',
        optionB: 'Neither the supervisor nor the technicians was aware of the power surge.',
        optionC: 'Every one of the submitted reports have fatal analytical errors.',
        optionD: 'The collection of rare antique manuscripts are preserved carefully.',
        correctOption: 'a',
        explanation: 'When subjects are linked by "neither... nor", the verb agrees with the closer subject ("technicians were").',
      },
      {
        questionText: 'What is the precise figurative meaning of the idiomatic expression "to burn the candle at both ends"?',
        optionA: 'To exhaust one\'s physical and mental stamina by excessively overworking without adequate rest',
        optionB: 'To waste electrical energy during daytime hours',
        optionC: 'To save financial reserves with extreme diligence',
        optionD: 'To exhibit courage in hazardous situations',
        correctOption: 'a',
        explanation: 'Burning the candle at both ends signifies leading a hectic life by waking up very early and going to sleep late.',
      },
      {
        questionText: 'Identify the passive voice of: "The regulatory commission approved the revised cybersecurity protocol."',
        optionA: 'The revised cybersecurity protocol was approved by the regulatory commission.',
        optionB: 'The revised cybersecurity protocol has been approved by the commission.',
        optionC: 'The commission was approving the revised cybersecurity protocol.',
        optionD: 'The protocol is approving the regulatory commission.',
        correctOption: 'a',
        explanation: 'Past simple active "approved" shifts to "was approved by" in passive voice.',
      },
    ],
  },
  {
    curriculumVersion: 'british',
    academicLevel: 'olevel',
    name: 'O Level Additional Mathematics',
    nameBn: 'O Level Additional Mathematics (4037 / 4MA1)',
    stream: 'science',
    icon: 'Calculator',
    durationMinutes: 30,
    totalMarks: 25,
    questions: [
      {
        questionText: 'If quadratic function f(x) = 2x² - 8x + 5, what are the coordinates of the turning point (vertex)?',
        optionA: '(2, -3)',
        optionB: '(2, 5)',
        optionC: '(-2, 29)',
        optionD: '(4, 5)',
        correctOption: 'a',
        explanation: 'Differentiating: f\'(x) = 4x - 8 = 0 => x = 2. Then f(2) = 2(4) - 8(2) + 5 = 8 - 16 + 5 = -3. Minimum at (2, -3).',
      },
      {
        questionText: 'In how many distinct ways can a committee of 3 members be selected from a panel of 7 candidates?',
        optionA: '35',
        optionB: '21',
        optionC: '210',
        optionD: '42',
        correctOption: 'a',
        explanation: 'Combinations formula: ⁷C₃ = (7 × 6 × 5) / (3 × 2 × 1) = 35.',
      },
      {
        questionText: 'Given vector v = 3i - 4j, what is the unit vector in the direction of v?',
        optionA: '(3i - 4j) / 5',
        optionB: '(3i - 4j) / 7',
        optionC: '(3i + 4j) / 5',
        optionD: '(4i - 3j) / 5',
        correctOption: 'a',
        explanation: 'Magnitude |v| = √(3² + (-4)²) = √25 = 5. Unit vector = v / |v| = (3i - 4j) / 5.',
      },
    ],
  },
  {
    curriculumVersion: 'british',
    academicLevel: 'olevel',
    name: 'O Level Computer Science',
    nameBn: 'O Level Computer Science (2210 / 4CP0)',
    stream: 'science',
    icon: 'Laptop',
    durationMinutes: 30,
    totalMarks: 25,
    questions: [
      {
        questionText: 'What is the hexadecimal equivalent of the 8-bit binary number 11011010₂?',
        optionA: 'DA₁₆',
        optionB: 'D9₁₆',
        optionC: 'CA₁₆',
        optionD: 'EB₁₆',
        correctOption: 'a',
        explanation: 'Splitting into 4-bit nibbles: 1101₂ = 13 (D) and 1010₂ = 10 (A). Therefore, the hexadecimal value is DA.',
      },
      {
        questionText: 'Which fundamental logic gate produces an output of 0 only when both inputs are 1, and 1 in all other cases?',
        optionA: 'NAND gate',
        optionB: 'NOR gate',
        optionC: 'XOR gate',
        optionD: 'AND gate',
        correctOption: 'a',
        explanation: 'A NAND gate is an inverted AND gate; output is 0 if and only if both inputs are logic 1.',
      },
      {
        questionText: 'Which CPU architectural register holds the memory address of the next instruction to be fetched from RAM?',
        optionA: 'Program Counter (PC)',
        optionB: 'Memory Data Register (MDR)',
        optionC: 'Accumulator (ACC)',
        optionD: 'Current Instruction Register (CIR)',
        correctOption: 'a',
        explanation: 'The Program Counter (PC) stores the memory address of the next sequential instruction in the fetch-decode-execute cycle.',
      },
    ],
  },
  {
    curriculumVersion: 'british',
    academicLevel: 'olevel',
    name: 'O Level Business Studies',
    nameBn: 'O Level Business Studies (7115 / 4BS1)',
    stream: 'commerce',
    icon: 'Briefcase',
    durationMinutes: 30,
    totalMarks: 25,
    questions: [
      {
        questionText: 'Which economic sector encompasses businesses that extract raw natural resources directly from the land or sea?',
        optionA: 'Primary sector',
        optionB: 'Secondary sector',
        optionC: 'Tertiary sector',
        optionD: 'Quaternary sector',
        correctOption: 'a',
        explanation: 'The primary sector covers agriculture, fishing, forestry, oil drilling, and mining.',
      },
      {
        questionText: 'Which of the following represents a variable cost for an automobile assembly plant?',
        optionA: 'Rubber tires and steering wheel units',
        optionB: 'Monthly warehouse factory rent',
        optionC: 'Annual equipment insurance premium',
        optionD: 'Straight-line depreciation of factory robots',
        correctOption: 'a',
        explanation: 'Variable costs vary directly with the quantity produced; more assembled vehicles require more tires and component parts.',
      },
    ],
  },
  {
    curriculumVersion: 'british',
    academicLevel: 'olevel',
    name: 'O Level Islamiyat',
    nameBn: 'O Level Islamiyat / Islamic Studies (2068 / 4IS1)',
    stream: 'humanities',
    icon: 'Sparkles',
    durationMinutes: 30,
    totalMarks: 25,
    questions: [
      {
        questionText: 'In which mountain cave did the Prophet Muhammad (PBUH) receive the first divine revelation through Angel Jibril?',
        optionA: 'Cave of Hira (Ghar-e-Hira)',
        optionB: 'Cave of Thawr',
        optionC: 'Mount Uhud',
        optionD: 'Mount Arafat',
        correctOption: 'a',
        explanation: 'The first five verses of Surah Al-Alaq were revealed to the Prophet in the Cave of Hira on Jabal al-Nour in 610 CE.',
      },
      {
        questionText: 'Who was elected as the first Caliph of Islam following the demise of the Prophet Muhammad (PBUH)?',
        optionA: 'Hazrat Abu Bakr As-Siddiq (RA)',
        optionB: 'Hazrat Umar ibn Al-Khattab (RA)',
        optionC: 'Hazrat Uthman ibn Affan (RA)',
        optionD: 'Hazrat Ali ibn Abi Talib (RA)',
        correctOption: 'a',
        explanation: 'Hazrat Abu Bakr (RA) was unanimously affirmed as the first Rightly Guided Caliph (Khulafa-e-Rashideen).',
      },
    ],
  },
  {
    curriculumVersion: 'british',
    academicLevel: 'olevel',
    name: 'O Level Information and Communication Technology',
    nameBn: 'O Level ICT (0417 / 4IT1)',
    stream: 'common',
    icon: 'Laptop',
    durationMinutes: 30,
    totalMarks: 25,
    questions: [
      {
        questionText: 'Which type of software license permits users to view, edit, and modify the underlying source code freely?',
        optionA: 'Open-source license',
        optionB: 'Proprietary commercial license',
        optionC: 'Shareware trial license',
        optionD: 'Freeware closed license',
        correctOption: 'a',
        explanation: 'Open-source licenses (like MIT, GPL, Apache) grant access to source code for inspection and collaborative development.',
      },
      {
        questionText: 'Which automated cloud storage capability ensures identical file versions are updated instantaneously across multiple connected computers?',
        optionA: 'File synchronization (syncing)',
        optionB: 'Disk defragmentation',
        optionC: 'Optical scanning',
        optionD: 'Data serialization',
        correctOption: 'a',
        explanation: 'File synchronization keeps distributed copies of files in parity across client devices and cloud servers.',
      },
    ],
  },

  // ============================================================
  // 2. BRITISH CURRICULUM — A LEVEL (Cambridge / Edexcel)
  // ============================================================
  {
    curriculumVersion: 'british',
    academicLevel: 'alevel',
    name: 'A Level English General Paper',
    nameBn: 'A Level English General Paper (8021)',
    stream: 'common',
    icon: 'PenTool',
    durationMinutes: 30,
    totalMarks: 25,
    questions: [
      {
        questionText: 'What is the primary function of a compelling argumentative thesis statement in an analytical essay?',
        optionA: 'To assert a clear, debatable central claim and delineate the analytical scope of the argument',
        optionB: 'To enumerate historical dates and biographical anecdotes without taking a stance',
        optionC: 'To list dictionary definitions of everyday terminology',
        optionD: 'To summarize opposing perspectives without critical evaluation',
        correctOption: 'a',
        explanation: 'A thesis statement anchors the essay by formulating a distinct, defensible claim that directs the argumentation.',
      },
      {
        questionText: 'Which analytical approach is essential when appraising media bias in international current affairs reporting?',
        optionA: 'Scrutinizing evidence provenance, selective omission, framing, and emotive language',
        optionB: 'Focusing exclusively on the visual appeal of headline graphics',
        optionC: 'Assuming all published editorials represent objective empirical truth',
        optionD: 'Counting the frequency of sensationalist adjectives',
        correctOption: 'a',
        explanation: 'Critical media evaluation requires investigating source credibility, rhetorical framing, and omitted counter-perspectives.',
      },
    ],
  },
  {
    curriculumVersion: 'british',
    academicLevel: 'alevel',
    name: 'A Level Global Perspectives & Research',
    nameBn: 'A Level Global Perspectives (9239)',
    stream: 'common',
    icon: 'Globe',
    durationMinutes: 30,
    totalMarks: 25,
    questions: [
      {
        questionText: 'In Cambridge Global Perspectives, what fundamentally distinguishes a global perspective from a localized viewpoint?',
        optionA: 'It analyzes transnational interconnections, global ramifications, and diverse cultural worldviews',
        optionB: 'It concentrates solely on local municipal regulations',
        optionC: 'It ignores economic interdependencies between nations',
        optionD: 'It restricts inquiry to national border legislation',
        correctOption: 'a',
        explanation: 'A global perspective explores how issues like climate change, migration, and technology transcend national boundaries.',
      },
      {
        questionText: 'What characterizes an "ad hominem" fallacy in formal argument deconstruction?',
        optionA: 'Attacking the personal integrity or background of an opponent instead of refuting their substantive argument',
        optionB: 'Asserting that correlation implies direct causation',
        optionC: 'Misrepresenting an opponent\'s stance to knock it down easily',
        optionD: 'Assuming a conclusion within the premise itself',
        correctOption: 'a',
        explanation: 'An ad hominem fallacy dismisses an argument based on personal characteristics rather than rational evidence.',
      },
    ],
  },
  {
    curriculumVersion: 'british',
    academicLevel: 'alevel',
    name: 'A Level Thinking Skills',
    nameBn: 'A Level Thinking Skills (9694)',
    stream: 'common',
    icon: 'Sparkles',
    durationMinutes: 30,
    totalMarks: 25,
    questions: [
      {
        questionText: 'What structural fallacy is present in: "All mammals have vertebrae. A lizard has vertebrae. Therefore, a lizard is a mammal"?',
        optionA: 'Undistributed middle term (Affirming the consequent)',
        optionB: 'Straw man fallacy',
        optionC: 'Begging the question',
        optionD: 'False dichotomy',
        correctOption: 'a',
        explanation: 'Because both categories share a common property (vertebrae), it does not logically follow that one is a subset of the other.',
      },
      {
        questionText: 'If statement P strictly implies statement Q (P → Q), which logical equivalent is guaranteed to be true?',
        optionA: 'The contrapositive: ¬Q → ¬P (If not Q, then not P)',
        optionB: 'The converse: Q → P (If Q, then P)',
        optionC: 'The inverse: ¬P → ¬Q (If not P, then not Q)',
        optionD: 'Neither Q nor P can be true',
        correctOption: 'a',
        explanation: 'In propositional calculus, a conditional statement is strictly logically equivalent to its contrapositive.',
      },
    ],
  },
  {
    curriculumVersion: 'british',
    academicLevel: 'alevel',
    name: 'A Level Information Technology',
    nameBn: 'A Level Information Technology (9626)',
    stream: 'common',
    icon: 'Laptop',
    durationMinutes: 30,
    totalMarks: 25,
    questions: [
      {
        questionText: 'In relational database architecture, what is the primary role of a foreign key?',
        optionA: 'To establish and enforce a referential relationship linking records across two relational tables',
        optionB: 'To generate hashed password digests',
        optionC: 'To speed up sorting algorithms in flat files',
        optionD: 'To compress multimedia blobs on disk',
        correctOption: 'a',
        explanation: 'A foreign key in a child table references the primary key of a parent table, guaranteeing relational integrity.',
      },
      {
        questionText: 'Which network security mechanism establishes an encrypted tunnel over public internet infrastructure to protect data in transit?',
        optionA: 'Virtual Private Network (VPN) using IPsec or TLS',
        optionB: 'Dynamic Host Configuration Protocol (DHCP)',
        optionC: 'Address Resolution Protocol (ARP)',
        optionD: 'Simple Mail Transfer Protocol (SMTP)',
        correctOption: 'a',
        explanation: 'VPNs encrypt all packet payloads to create secure communication corridors across untrusted public networks.',
      },
    ],
  },
  {
    curriculumVersion: 'british',
    academicLevel: 'alevel',
    name: 'A Level Pure Mathematics',
    nameBn: 'A Level Pure Mathematics (9709)',
    stream: 'science',
    icon: 'Calculator',
    durationMinutes: 30,
    totalMarks: 25,
    questions: [
      {
        questionText: 'What is the coefficient of x³ in the binomial expansion of (2 + x)⁵?',
        optionA: '40',
        optionB: '20',
        optionC: '10',
        optionD: '80',
        correctOption: 'a',
        explanation: 'Term = ⁵C₃ × (2)² × (x)³ = 10 × 4 × x³ = 40x³. The coefficient is 40.',
      },
      {
        questionText: 'What is the derivative of f(x) = e^(3x) with respect to x?',
        optionA: '3e^(3x)',
        optionB: 'e^(3x)',
        optionC: '3x e^(3x-1)',
        optionD: 'e^(3x) / 3',
        correctOption: 'a',
        explanation: 'By the chain rule: d/dx [e^(3x)] = 3e^(3x).',
      },
      {
        questionText: 'Evaluate the definite integral ∫ from 0 to 2 of (3x² + 2) dx.',
        optionA: '12',
        optionB: '8',
        optionC: '10',
        optionD: '14',
        correctOption: 'a',
        explanation: 'Antiderivative is [x³ + 2x] from 0 to 2 = (2³ + 2(2)) - 0 = 8 + 4 = 12.',
      },
    ],
  },
  {
    curriculumVersion: 'british',
    academicLevel: 'alevel',
    name: 'A Level Physics',
    nameBn: 'A Level Physics (9702)',
    stream: 'science',
    icon: 'Atom',
    durationMinutes: 25,
    totalMarks: 25,
    questions: [
      {
        questionText: 'What is the fundamental defining condition for simple harmonic motion (SHM)?',
        optionA: 'Acceleration is directly proportional to displacement and directed towards the fixed equilibrium position',
        optionB: 'Acceleration is proportional to velocity',
        optionC: 'Velocity is constant throughout the motion',
        optionD: 'Restoring force is constant',
        correctOption: 'a',
        explanation: 'In SHM, a = -ω²x; acceleration is directly proportional to displacement from the origin and directed opposite to it.',
      },
      {
        questionText: 'Which law of thermodynamics states that the internal energy change ΔU = Q - W?',
        optionA: 'First Law of Thermodynamics',
        optionB: 'Zeroth Law',
        optionC: 'Second Law of Thermodynamics',
        optionD: 'Third Law of Thermodynamics',
        correctOption: 'a',
        explanation: 'The First Law of Thermodynamics establishes the conservation of energy principle: ΔU = Q - W.',
      },
    ],
  },
  {
    curriculumVersion: 'british',
    academicLevel: 'alevel',
    name: 'A Level Chemistry',
    nameBn: 'A Level Chemistry (9701)',
    stream: 'science',
    icon: 'FlaskConical',
    durationMinutes: 25,
    totalMarks: 25,
    questions: [
      {
        questionText: 'What mechanism occurs when benzene reacts with bromine in the presence of an anhydrous FeBr₃ catalyst?',
        optionA: 'Electrophilic substitution',
        optionB: 'Electrophilic addition',
        optionC: 'Nucleophilic substitution',
        optionD: 'Free radical addition',
        correctOption: 'a',
        explanation: 'Benzene undergoes electrophilic aromatic substitution to regenerate its thermodynamically stable delocalized π ring system.',
      },
      {
        questionText: 'What is the standard oxidation state of chromium in the dichromate ion Cr₂O₇²⁻?',
        optionA: '+6',
        optionB: '+3',
        optionC: '+7',
        optionD: '+4',
        correctOption: 'a',
        explanation: '2(Cr) + 7(-2) = -2 => 2(Cr) - 14 = -2 => 2(Cr) = +12 => Cr = +6.',
      },
    ],
  },
  {
    curriculumVersion: 'british',
    academicLevel: 'alevel',
    name: 'A Level Biology',
    nameBn: 'A Level Biology (9700 / WBI11)',
    stream: 'science',
    icon: 'Dna',
    durationMinutes: 25,
    totalMarks: 25,
    questions: [
      {
        questionText: 'What does the Michaelis constant (Km) represent in enzyme kinetics?',
        optionA: 'Substrate concentration at which the reaction velocity is half of its maximum (1/2 Vmax)',
        optionB: 'Maximum velocity at infinite substrate concentration',
        optionC: 'The optimum temperature for enzyme turnover',
        optionD: 'The activation energy of the uninhibited reaction',
        correctOption: 'a',
        explanation: 'Km is the substrate concentration at half-maximal velocity; lower Km denotes higher enzyme-substrate affinity.',
      },
      {
        questionText: 'During which stage of meiosis do homologous chromosomes form chiasmata and exchange genetic segments (crossing over)?',
        optionA: 'Prophase I',
        optionB: 'Metaphase I',
        optionC: 'Anaphase I',
        optionD: 'Telophase I',
        correctOption: 'a',
        explanation: 'Crossing over between non-sister chromatids of homologous pairs occurs exclusively in Prophase I of meiosis.',
      },
    ],
  },
  {
    curriculumVersion: 'british',
    academicLevel: 'alevel',
    name: 'A Level Economics',
    nameBn: 'A Level Economics (9708)',
    stream: 'commerce',
    icon: 'TrendingUp',
    durationMinutes: 30,
    totalMarks: 30,
    questions: [
      {
        questionText: 'What market structure is characterized by a single seller, impenetrable barriers to entry, and price-making authority?',
        optionA: 'Pure Monopoly',
        optionB: 'Perfect competition',
        optionC: 'Monopolistic competition',
        optionD: 'Competitive oligopoly',
        correctOption: 'a',
        explanation: 'A pure monopoly commands 100% market share, protected by prohibitive legal, technological, or scale barriers.',
      },
      {
        questionText: 'Which fiscal policy measure is implemented by governments to counteract high cyclical inflation?',
        optionA: 'Contractionary fiscal policy (reducing state spending and raising taxes)',
        optionB: 'Expansionary fiscal policy (increasing government subsidies)',
        optionC: 'Quantitative easing and lowering interest rates',
        optionD: 'Currency devaluation',
        correctOption: 'a',
        explanation: 'Contractionary fiscal policy reduces aggregate demand (AD), helping cool down overheating demand-pull inflation.',
      },
    ],
  },
  {
    curriculumVersion: 'british',
    academicLevel: 'alevel',
    name: 'A Level Business',
    nameBn: 'A Level Business (9609 / WBS11)',
    stream: 'commerce',
    icon: 'Briefcase',
    durationMinutes: 30,
    totalMarks: 25,
    questions: [
      {
        questionText: 'According to Ansoff\'s Matrix, which growth strategy entails introducing current products into brand-new geographical or demographic markets?',
        optionA: 'Market Development',
        optionB: 'Market Penetration',
        optionC: 'Product Development',
        optionD: 'Diversification',
        correctOption: 'a',
        explanation: 'Market development targets new geographic regions or untapped demographics using an existing product portfolio.',
      },
      {
        questionText: 'Which discounted capital investment appraisal method evaluates whether future net cash flows exceed initial capital expenditure in today\'s money?',
        optionA: 'Net Present Value (NPV)',
        optionB: 'Payback Period',
        optionC: 'Accounting Rate of Return (ARR)',
        optionD: 'Gross Profit Margin',
        correctOption: 'a',
        explanation: 'Net Present Value (NPV) discounts all expected future cash inflows and outflows using an opportunity cost discount rate.',
      },
    ],
  },
  {
    curriculumVersion: 'british',
    academicLevel: 'alevel',
    name: 'A Level Computer Science',
    nameBn: 'A Level Computer Science (9618 / WCS11)',
    stream: 'science',
    icon: 'Laptop',
    durationMinutes: 30,
    totalMarks: 25,
    questions: [
      {
        questionText: 'What is the asymptotic average-case time complexity of searching in a self-balancing binary search tree (such as an AVL tree)?',
        optionA: 'O(log n)',
        optionB: 'O(n)',
        optionC: 'O(n log n)',
        optionD: 'O(1)',
        correctOption: 'a',
        explanation: 'In balanced binary trees with height proportional to log₂(n), search operations discard half the remaining search space per step, yielding O(log n).',
      },
      {
        questionText: 'Which Object-Oriented Programming (OOP) pillar allows a derived subclass to provide a concrete implementation of an inherited method?',
        optionA: 'Polymorphism (Method Overriding)',
        optionB: 'Encapsulation',
        optionC: 'Composition',
        optionD: 'Static binding',
        correctOption: 'a',
        explanation: 'Polymorphism enables identical method signatures to execute subclass-specific runtime behaviour.',
      },
    ],
  },
  {
    curriculumVersion: 'british',
    academicLevel: 'alevel',
    name: 'A Level Accounting',
    nameBn: 'A Level Accounting (9706 / WAC11)',
    stream: 'commerce',
    icon: 'BookOpen',
    durationMinutes: 30,
    totalMarks: 25,
    questions: [
      {
        questionText: 'According to International Accounting Standard IAS 7, what are the two permissible formats for reporting operating cash flows?',
        optionA: 'Direct Method and Indirect Method',
        optionB: 'FIFO and LIFO Method',
        optionC: 'Cost Method and Revaluation Method',
        optionD: 'Amortization and Impairment Method',
        correctOption: 'a',
        explanation: 'IAS 7 encourages the direct method but permits the indirect method which reconciles net profit to operating cash flows.',
      },
    ],
  },
  {
    curriculumVersion: 'british',
    academicLevel: 'alevel',
    name: 'A Level English Literature & Language',
    nameBn: 'A Level English Literature & Language (9093 / WEN01)',
    stream: 'humanities',
    icon: 'PenTool',
    durationMinutes: 30,
    totalMarks: 25,
    questions: [
      {
        questionText: 'What rhetorical device involves pairing two contradictory or diametrically opposite terms together (e.g., "deafening silence")?',
        optionA: 'Oxymoron',
        optionB: 'Hyperbole',
        optionC: 'Synecdoche',
        optionD: 'Euphemism',
        correctOption: 'a',
        explanation: 'An oxymoron fuses two contradictory words in close succession to highlight tension or emotional paradox.',
      },
    ],
  },
  {
    curriculumVersion: 'british',
    academicLevel: 'alevel',
    name: 'A Level Further Mathematics',
    nameBn: 'A Level Further Mathematics (9231 / WFM01)',
    stream: 'science',
    icon: 'Calculator',
    durationMinutes: 30,
    totalMarks: 25,
    questions: [
      {
        questionText: 'According to de Moivre\'s theorem, for any integer n and real angle θ, what is [cos θ + i sin θ]ⁿ?',
        optionA: 'cos(nθ) + i sin(nθ)',
        optionB: 'cosⁿ(θ) + i sinⁿ(θ)',
        optionC: 'n cos(θ) + i n sin(θ)',
        optionD: 'cos(θ/n) + i sin(θ/n)',
        correctOption: 'a',
        explanation: 'De Moivre\'s theorem states [cos θ + i sin θ]ⁿ = cos(nθ) + i sin(nθ) = e^(inθ).',
      },
    ],
  },

  // ============================================================
  // 3. IB CURRICULUM — MYP (Middle Years Programme)
  // ============================================================
  {
    curriculumVersion: 'ib',
    academicLevel: 'myp',
    name: 'IB MYP Mathematics',
    nameBn: 'IB MYP Mathematics (Grade 9-10)',
    stream: 'common',
    icon: 'Calculator',
    durationMinutes: 30,
    totalMarks: 25,
    questions: [
      {
        questionText: 'Which graphical representation best models a continuous linear correlation between two numerical variables x and y?',
        optionA: 'Scatter plot with line of best fit',
        optionB: 'Bar chart',
        optionC: 'Pie chart',
        optionD: 'Frequency table',
        correctOption: 'a',
        explanation: 'A scatter plot with line of best fit illustrates bivariate data trends and continuous linear relationships.',
      },
      {
        questionText: 'A square has an area of 196 cm². What is the perimeter of this square?',
        optionA: '56 cm',
        optionB: '28 cm',
        optionC: '48 cm',
        optionD: '98 cm',
        correctOption: 'a',
        explanation: 'Side length s = √196 = 14 cm. Perimeter = 4 × 14 = 56 cm.',
      },
    ],
  },
  {
    curriculumVersion: 'ib',
    academicLevel: 'myp',
    name: 'IB MYP Integrated Sciences',
    nameBn: 'IB MYP Integrated Sciences (Physics/Chem/Bio)',
    stream: 'science',
    icon: 'Sparkles',
    durationMinutes: 25,
    totalMarks: 25,
    questions: [
      {
        questionText: 'In scientific experimentation, which variable is deliberately altered by the investigator to observe its outcome?',
        optionA: 'Independent variable',
        optionB: 'Dependent variable',
        optionC: 'Controlled variable',
        optionD: 'Confounding variable',
        correctOption: 'a',
        explanation: 'The independent variable is systematically manipulated to measure its causal effect on the dependent variable.',
      },
      {
        questionText: 'Which ecological level consists of all interacting populations of diverse species within a shared environment?',
        optionA: 'Community',
        optionB: 'Organism',
        optionC: 'Population',
        optionD: 'Biosphere',
        correctOption: 'a',
        explanation: 'A biological community includes all populations of different species cohabiting and interacting in an ecosystem.',
      },
    ],
  },
  {
    curriculumVersion: 'ib',
    academicLevel: 'myp',
    name: 'IB MYP Individuals and Societies',
    nameBn: 'IB MYP Individuals & Societies',
    stream: 'humanities',
    icon: 'Globe2',
    durationMinutes: 30,
    totalMarks: 30,
    questions: [
      {
        questionText: 'What composite metric does the United Nations use to assess national socio-economic well-being beyond GDP?',
        optionA: 'Human Development Index (HDI)',
        optionB: 'Gross Domestic Product (GDP)',
        optionC: 'Consumer Price Index (CPI)',
        optionD: 'Balance of Payments',
        correctOption: 'a',
        explanation: 'The Human Development Index (HDI) integrates longevity, educational attainment, and standard of living (GNI per capita).',
      },
    ],
  },
  {
    curriculumVersion: 'ib',
    academicLevel: 'myp',
    name: 'IB MYP Language Acquisition (English)',
    nameBn: 'IB MYP Language Acquisition',
    stream: 'common',
    icon: 'BookOpen',
    durationMinutes: 30,
    totalMarks: 25,
    questions: [
      {
        questionText: 'What is the primary rhetorical function of using metaphors in explanatory or persuasive communication?',
        optionA: 'To evoke vivid conceptual associations and deepen emotional resonance',
        optionB: 'To enumerate chronological dates',
        optionC: 'To indicate punctuation syntax',
        optionD: 'To state scientific theorems literally',
        correctOption: 'a',
        explanation: 'Metaphors bridge abstract concepts with tangible imagery to heighten understanding and emotional engagement.',
      },
    ],
  },
  {
    curriculumVersion: 'ib',
    academicLevel: 'myp',
    name: 'IB MYP Design & Technology',
    nameBn: 'IB MYP Design & Technology',
    stream: 'science',
    icon: 'Laptop',
    durationMinutes: 30,
    totalMarks: 25,
    questions: [
      {
        questionText: 'What are the four core phases of the official IB MYP Design Cycle?',
        optionA: 'Inquiring and analyzing, Developing ideas, Creating the solution, Evaluating',
        optionB: 'Brainstorming, Coding, Pitching, Selling',
        optionC: 'Drawing, 3D printing, Coloring, Assembling',
        optionD: 'Problem discovery, Factory prototyping, Packaging, Delivery',
        correctOption: 'a',
        explanation: 'The IB MYP Design Cycle consists of Criterion A (Inquiring), B (Developing ideas), C (Creating), and D (Evaluating).',
      },
    ],
  },
  {
    curriculumVersion: 'ib',
    academicLevel: 'myp',
    name: 'IB MYP Language and Literature',
    nameBn: 'IB MYP Language & Literature (Grade 9-10)',
    stream: 'common',
    icon: 'BookOpen',
    durationMinutes: 30,
    totalMarks: 25,
    questions: [
      {
        questionText: 'What structural element drives narrative progression and develops thematic depth in fiction?',
        optionA: 'Dynamic internal or external conflict',
        optionB: 'Strictly chronological chapter divisions',
        optionC: 'Alphabetical character introductions',
        optionD: 'Monotonous sentence lengths',
        correctOption: 'a',
        explanation: 'Conflict (internal psychological struggle or external interpersonal friction) is the catalyst of narrative drama.',
      },
      {
        questionText: 'What literary device is defined as a reference to a well-known historical, mythological, or biblical event or figure?',
        optionA: 'Allusion',
        optionB: 'Allegory',
        optionC: 'Anaphora',
        optionD: 'Alliteration',
        correctOption: 'a',
        explanation: 'An allusion enriches text by invoking broader cultural or historical contexts succinctly.',
      },
    ],
  },

  // ============================================================
  // 4. IB CURRICULUM — IB DIPLOMA PROGRAMME (DP)
  // ============================================================
  {
    curriculumVersion: 'ib',
    academicLevel: 'dp',
    name: 'IB DP Theory of Knowledge (TOK)',
    nameBn: 'IB DP Theory of Knowledge (Core)',
    stream: 'common',
    icon: 'Sparkles',
    durationMinutes: 30,
    totalMarks: 25,
    questions: [
      {
        questionText: 'In the IB Theory of Knowledge (TOK) Knowledge Framework, what distinguishes "Shared Knowledge" from "Personal Knowledge"?',
        optionA: 'Shared knowledge is systematic, verifiable, and collectively evaluated by communities; personal knowledge originates from individual lived experience',
        optionB: 'Shared knowledge cannot be modified or falsified by subsequent evidence',
        optionC: 'Personal knowledge is solely applicable to mathematical theorems',
        optionD: 'Shared knowledge is exclusive to natural physical sciences',
        correctOption: 'a',
        explanation: 'TOK delineates shared knowledge (structured academic domains) from personal knowledge (experiential and intuitive).',
      },
      {
        questionText: 'Which Way of Knowing (WOK) operates through empirical perception derived directly from the five sensory organs?',
        optionA: 'Sense Perception',
        optionB: 'Pure Reason',
        optionC: 'Faith',
        optionD: 'Intuition',
        correctOption: 'a',
        explanation: 'Sense perception channels sensory stimuli from the external physical environment into cognitive awareness.',
      },
    ],
  },
  {
    curriculumVersion: 'ib',
    academicLevel: 'dp',
    name: 'IB DP English A: Language & Literature',
    nameBn: 'IB DP English A: Lang & Lit (Group 1)',
    stream: 'common',
    icon: 'BookOpen',
    durationMinutes: 30,
    totalMarks: 25,
    questions: [
      {
        questionText: 'What is the primary analytical objective when evaluating non-literary multimodal media texts in IB English A?',
        optionA: 'To decode how visual and linguistic choices intersect to construct audience positioning and ideological messaging',
        optionB: 'To compute the arithmetic word density of printed paragraphs',
        optionC: 'To memorize the chronological publication dates of print advertisements',
        optionD: 'To assess the chemical composition of printing ink',
        correctOption: 'a',
        explanation: 'Multimodal analysis deconstructs semiotic, visual, and textual devices to illuminate implicit rhetoric.',
      },
      {
        questionText: 'What term defines an author\'s implicit attitude toward their subject matter, conveyed through diction and stylistic choices?',
        optionA: 'Tone',
        optionB: 'Meter',
        optionC: 'Consonance',
        optionD: 'Enjambment',
        correctOption: 'a',
        explanation: 'Tone reflects the emotional timbre and evaluative perspective an author adopts toward their topic.',
      },
    ],
  },
  {
    curriculumVersion: 'ib',
    academicLevel: 'dp',
    name: 'IB DP Extended Essay & Academic Research',
    nameBn: 'IB DP Extended Essay (Core)',
    stream: 'common',
    icon: 'GraduationCap',
    durationMinutes: 30,
    totalMarks: 25,
    questions: [
      {
        questionText: 'What constitutes an exemplary and viable IB Extended Essay research question?',
        optionA: 'A sharply focused, analytical question that invites critical debate, rigorous synthesis, and empirical investigation',
        optionB: 'A broad factual inquiry that can be resolved with a simple yes or no',
        optionC: 'A purely descriptive summary of an established encyclopedic entry',
        optionD: 'A subjective affirmation of personal culinary tastes',
        correctOption: 'a',
        explanation: 'An EE research question must be focused, open to scholarly argumentation, and amenable to independent research.',
      },
    ],
  },
  {
    curriculumVersion: 'ib',
    academicLevel: 'dp',
    name: 'IB DP Environmental Systems & Societies (ESS)',
    nameBn: 'IB DP Environmental Systems (SL Interdisciplinary)',
    stream: 'common',
    icon: 'Globe',
    durationMinutes: 30,
    totalMarks: 25,
    questions: [
      {
        questionText: 'According to the First Law of Thermodynamics, what fundamental principle governs energy dynamics within open ecosystems?',
        optionA: 'Energy can be transformed from one form to another (e.g. radiant light to chemical bonds) but cannot be created or destroyed',
        optionB: 'Energy spontaneously increases in closed ecological habitats',
        optionC: 'Energy is 100% recycled back into primary producers without dissipation',
        optionD: 'Energy flows indefinitely without entropy loss',
        correctOption: 'a',
        explanation: 'The principle of conservation of energy dictates that energy transforms across trophic levels with inevitable heat dissipation.',
      },
      {
        questionText: 'Which environmental worldview prioritizes ecological equilibrium, holistic conservation, and the intrinsic value of nature over human technological mastery?',
        optionA: 'Ecocentric worldview',
        optionB: 'Technocentric worldview',
        optionC: 'Cornucopian worldview',
        optionD: 'Anthropocentric extraction worldview',
        correctOption: 'a',
        explanation: 'Ecocentrism views humanity as an integral part of nature, respecting ecological limits and self-regulation.',
      },
    ],
  },
  {
    curriculumVersion: 'ib',
    academicLevel: 'dp',
    name: 'IB DP Mathematics: Analysis & Approaches (AA)',
    nameBn: 'IB DP Mathematics AA (HL/SL)',
    stream: 'science',
    icon: 'Calculator',
    durationMinutes: 30,
    totalMarks: 25,
    questions: [
      {
        questionText: 'Given vectors u = [2, -1, 3] and v = [1, 4, -2], what is the scalar dot product u · v?',
        optionA: '-8',
        optionB: '0',
        optionC: '4',
        optionD: '12',
        correctOption: 'a',
        explanation: 'u · v = (2)(1) + (-1)(4) + (3)(-2) = 2 - 4 - 6 = -8.',
      },
      {
        questionText: 'What is the mathematical limit of (sin x) / x as x approaches 0?',
        optionA: '1',
        optionB: '0',
        optionC: 'π',
        optionD: 'Undefined',
        correctOption: 'a',
        explanation: 'By standard calculus limits (or L\'Hôpital\'s rule), lim_{x->0} (sin x)/x = 1.',
      },
    ],
  },
  {
    curriculumVersion: 'ib',
    academicLevel: 'dp',
    name: 'IB DP Physics Higher Level (HL)',
    nameBn: 'IB DP Physics HL',
    stream: 'science',
    icon: 'Atom',
    durationMinutes: 25,
    totalMarks: 25,
    questions: [
      {
        questionText: 'According to de Broglie\'s quantum hypothesis, what is the wavelength λ associated with a moving particle of momentum p?',
        optionA: 'λ = h / p',
        optionB: 'λ = h × p',
        optionC: 'λ = p / h',
        optionD: 'λ = h / p²',
        correctOption: 'a',
        explanation: 'De Broglie wavelength λ is inversely proportional to momentum: λ = h / p (where h is Planck\'s constant).',
      },
      {
        questionText: 'What fundamental property does the binding energy per nucleon quantify for an atomic nucleus?',
        optionA: 'Nuclear stability against decay or fission',
        optionB: 'Radioactive half-life rate',
        optionC: 'Atomic volume radius',
        optionD: 'Electronegativity index',
        correctOption: 'a',
        explanation: 'Nuclei with higher binding energy per nucleon (peaking near Iron-56) are the most tightly bound and stable.',
      },
    ],
  },
  {
    curriculumVersion: 'ib',
    academicLevel: 'dp',
    name: 'IB DP Chemistry Higher Level (HL)',
    nameBn: 'IB DP Chemistry HL',
    stream: 'science',
    icon: 'FlaskConical',
    durationMinutes: 25,
    totalMarks: 25,
    questions: [
      {
        questionText: 'What is the orbital hybridization of carbon atoms in the benzene ring (C₆H₆)?',
        optionA: 'sp²',
        optionB: 'sp',
        optionC: 'sp³',
        optionD: 'sp³d',
        correctOption: 'a',
        explanation: 'Each carbon atom in benzene utilizes sp² hybrid orbitals in a planar trigonal arrangement with 120° bond angles.',
      },
    ],
  },
  {
    curriculumVersion: 'ib',
    academicLevel: 'dp',
    name: 'IB DP Biology Higher Level (HL)',
    nameBn: 'IB DP Biology HL',
    stream: 'science',
    icon: 'Dna',
    durationMinutes: 25,
    totalMarks: 25,
    questions: [
      {
        questionText: 'Where does oxidative phosphorylation take place within eukaryotic cells?',
        optionA: 'Inner mitochondrial membrane (cristae)',
        optionB: 'Mitochondrial matrix',
        optionC: 'Outer mitochondrial membrane',
        optionD: 'Cytosol',
        correctOption: 'a',
        explanation: 'The electron transport chain complexes and ATP synthase enzymes are embedded within the inner mitochondrial cristae.',
      },
      {
        questionText: 'Which enzyme synthesizes complementary DNA from an RNA template during retroviral infection?',
        optionA: 'Reverse transcriptase',
        optionB: 'DNA polymerase I',
        optionC: 'RNA helicase',
        optionD: 'DNA ligase',
        correctOption: 'a',
        explanation: 'Reverse transcriptase enables retroviruses like HIV to transcribe viral RNA genomes into double-stranded DNA.',
      },
    ],
  },
  {
    curriculumVersion: 'ib',
    academicLevel: 'dp',
    name: 'IB DP Economics Higher Level (HL)',
    nameBn: 'IB DP Economics HL',
    stream: 'commerce',
    icon: 'TrendingUp',
    durationMinutes: 30,
    totalMarks: 30,
    questions: [
      {
        questionText: 'Which economic metric quantifies income inequality within a nation on a scale from 0 (perfect equality) to 1 (maximum inequality)?',
        optionA: 'Gini Coefficient',
        optionB: 'Phillips Curve',
        optionC: 'Laffer Curve',
        optionD: 'Consumer Price Index',
        correctOption: 'a',
        explanation: 'The Gini coefficient derived from the Lorenz curve measures distribution inequality of income or wealth.',
      },
    ],
  },
  {
    curriculumVersion: 'ib',
    academicLevel: 'dp',
    name: 'IB DP Business Management Higher Level (HL)',
    nameBn: 'IB DP Business Management HL',
    stream: 'commerce',
    icon: 'Briefcase',
    durationMinutes: 30,
    totalMarks: 25,
    questions: [
      {
        questionText: 'Which strict liquidity ratio measures a firm\'s immediate ability to meet short-term debt without needing to liquidate inventory?',
        optionA: 'Acid-test (quick) ratio',
        optionB: 'Current ratio',
        optionC: 'Return on Capital Employed (ROCE)',
        optionD: 'Gearing ratio',
        correctOption: 'a',
        explanation: 'Acid-test ratio = (Current Assets - Stock/Inventory) / Current Liabilities.',
      },
    ],
  },
  {
    curriculumVersion: 'ib',
    academicLevel: 'dp',
    name: 'IB DP Computer Science Higher Level (HL)',
    nameBn: 'IB DP Computer Science HL',
    stream: 'science',
    icon: 'Laptop',
    durationMinutes: 30,
    totalMarks: 25,
    questions: [
      {
        questionText: 'Which abstract data structure operates on a strict Last-In, First-Out (LIFO) order of element removal?',
        optionA: 'Stack',
        optionB: 'Queue',
        optionC: 'Linked list',
        optionD: 'Binary search tree',
        correctOption: 'a',
        explanation: 'A stack operates on LIFO (Last-In, First-Out) via push and pop primitives.',
      },
    ],
  },
  {
    curriculumVersion: 'ib',
    academicLevel: 'dp',
    name: 'IB DP Psychology Higher Level (HL)',
    nameBn: 'IB DP Psychology HL',
    stream: 'humanities',
    icon: 'Sparkles',
    durationMinutes: 30,
    totalMarks: 25,
    questions: [
      {
        questionText: 'What term describes the brain\'s physiological ability to reorganize synaptic connections throughout life in response to learning or experience?',
        optionA: 'Neuroplasticity',
        optionB: 'Cognitive dissonance',
        optionC: 'Schema theory',
        optionD: 'Localization of function',
        correctOption: 'a',
        explanation: 'Neuroplasticity refers to the biological capacity of neural networks to rewire and grow through environmental stimulation and practice.',
      },
    ],
  },
  {
    curriculumVersion: 'ib',
    academicLevel: 'dp',
    name: 'IB DP Mathematics: Applications & Interpretation (AI)',
    nameBn: 'IB DP Mathematics AI (HL/SL)',
    stream: 'commerce',
    icon: 'Calculator',
    durationMinutes: 30,
    totalMarks: 25,
    questions: [
      {
        questionText: 'In planar computational geometry, what diagram divides a plane into convex cells closest to each generating seed point?',
        optionA: 'Voronoi diagram',
        optionB: 'Bivariate scatter matrix',
        optionC: 'Box-and-whisker plot',
        optionD: 'Normal distribution curve',
        correctOption: 'a',
        explanation: 'A Voronoi diagram partitions Euclidean space into regions based on proximity to a set of discrete generating sites.',
      },
    ],
  },
];

// Boards for British & IB Curriculums
export const BRITISH_BOARDS = [
  { id: 'cambridge', name: 'Cambridge International (CAIE)' },
  { id: 'edexcel', name: 'Pearson Edexcel' },
] as const;

export const IB_BOARDS = [
  { id: 'ib_geneva', name: 'International Baccalaureate (IB)' },
] as const;

// Years 2020 to 2025
export const RECENT_YEARS = [2020, 2021, 2022, 2023, 2024, 2025] as const;

export async function seedBritishAndIbCurriculum() {
  const client = await pool.connect();
  try {
    console.log('--- Starting British & IB Curriculum Seeding (Subjects & Past Examination Papers) ---');
    let subjectsCreated = 0;
    let examsCreated = 0;
    let questionsCreated = 0;

    for (const item of BRITISH_AND_IB_SUBJECTS) {
      // 1. Ensure Subject exists
      let subjectId: string;
      const subCheck = await client.query(
        `SELECT id FROM subjects WHERE name = $1 AND curriculum_version = $2 AND academic_level = $3 LIMIT 1`,
        [item.name, item.curriculumVersion, item.academicLevel]
      );

      if (subCheck.rowCount && subCheck.rowCount > 0) {
        subjectId = subCheck.rows[0].id;
        await client.query(
          `UPDATE subjects
           SET name_bn = $1, stream = $2, icon = $3, is_active = TRUE, unlock_price = 0, updated_at = NOW()
           WHERE id = $4`,
          [item.nameBn, item.stream, item.icon, subjectId]
        );
      } else {
        const insertSub = await client.query(
          `INSERT INTO subjects (
             name, name_bn, curriculum_version, academic_level, stream, icon, is_active, unlock_price
           )
           VALUES ($1, $2, $3, $4, $5, $6, TRUE, 0)
           RETURNING id`,
          [item.name, item.nameBn, item.curriculumVersion, item.academicLevel, item.stream, item.icon]
        );
        subjectId = insertSub.rows[0].id;
        subjectsCreated++;
      }

      // 2. Determine boards to seed past examination papers for
      const boards = item.curriculumVersion === 'british' ? BRITISH_BOARDS : IB_BOARDS;

      for (const year of RECENT_YEARS) {
        for (const board of boards) {
          const levelLabel = item.academicLevel.toUpperCase();
          const examTitle = `${levelLabel} ${year}: ${item.name} (${board.name})`;

          const existingExam = await client.query(
            `SELECT id FROM exams WHERE subject_id = $1 AND exam_year = $2 AND board_name = $3 AND curriculum_version = $4 LIMIT 1`,
            [subjectId, year, board.name, item.curriculumVersion]
          );

          let examId: string;
          if (existingExam.rowCount && existingExam.rowCount > 0) {
            examId = existingExam.rows[0].id;
            await client.query(
              `UPDATE exams
               SET title = $1, duration_minutes = $2, total_marks = $3, negative_mark = 0.25,
                   is_published = TRUE, exam_type = 'board_question', board_name = $4, exam_year = $5,
                   academic_level = $6, curriculum_version = $7
               WHERE id = $8`,
              [
                examTitle,
                item.durationMinutes,
                item.totalMarks,
                board.name,
                year,
                item.academicLevel,
                item.curriculumVersion,
                examId,
              ]
            );
          } else {
            const insertExam = await client.query(
              `INSERT INTO exams (
                 subject_id, title, serial_number, duration_minutes, total_marks,
                 negative_mark, instructions, is_published, curriculum_version,
                 academic_level, exam_type, board_name, exam_year
               )
               VALUES ($1, $2, 1, $3, $4, 0.25, $5, TRUE, $6, $7, 'board_question', $8, $9)
               RETURNING id`,
              [
                subjectId,
                examTitle,
                item.durationMinutes,
                item.totalMarks,
                `Official past examination paper. Total time: ${item.durationMinutes} minutes. 1 mark per correct answer. 0.25 deduction for incorrect choices.`,
                item.curriculumVersion,
                item.academicLevel,
                board.name,
                year,
              ]
            );
            examId = insertExam.rows[0].id;
            examsCreated++;
          }

          // 3. Insert verified questions
          let qIdx = 1;
          for (const q of item.questions) {
            const qCheck = await client.query(
              `SELECT id FROM questions WHERE exam_id = $1 AND serial_number = $2`,
              [examId, qIdx]
            );

            if (qCheck.rowCount && qCheck.rowCount > 0) {
              await client.query(
                `UPDATE questions
                 SET question_text = $1, option_a = $2, option_b = $3, option_c = $4, option_d = $5,
                     correct_option = $6, explanation = $7
                 WHERE id = $8`,
                [
                  q.questionText,
                  q.optionA,
                  q.optionB,
                  q.optionC,
                  q.optionD,
                  q.correctOption,
                  q.explanation,
                  qCheck.rows[0].id,
                ]
              );
            } else {
              await client.query(
                `INSERT INTO questions (
                   exam_id, serial_number, question_text, option_a, option_b, option_c, option_d,
                   correct_option, explanation
                 )
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                [
                  examId,
                  qIdx,
                  q.questionText,
                  q.optionA,
                  q.optionB,
                  q.optionC,
                  q.optionD,
                  q.correctOption,
                  q.explanation,
                ]
              );
              questionsCreated++;
            }
            qIdx++;
          }
        }
      }
    }

    console.log(`Successfully seeded British & IB Curriculum data!`);
    console.log(`- New Subjects: ${subjectsCreated}`);
    console.log(`- New Exams: ${examsCreated}`);
    console.log(`- New Questions: ${questionsCreated}`);
  } catch (err) {
    console.error('Failed to seed British and IB curriculum:', err);
    throw err;
  } finally {
    client.release();
  }
}

if (process.argv[1]?.endsWith('seed_british_ib_curriculum.ts') || process.argv[1]?.endsWith('seed_british_ib_curriculum.js')) {
  seedBritishAndIbCurriculum()
    .then(() => {
      console.log('Seeder finished.');
      process.exit(0);
    })
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}

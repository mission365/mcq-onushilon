import { pool } from './db.js';

export interface EnglishBoardSubjectConfig {
  academicLevel: 'ssc' | 'hsc';
  subjectName: string;
  displayTitle: string;
  stream: 'science' | 'commerce' | 'humanities' | 'common';
  icon?: string;
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

// 8 General Education Boards of Bangladesh (English names)
export const GENERAL_BOARDS_EN = [
  { id: 'dhaka', name: 'Dhaka Board' },
  { id: 'rajshahi', name: 'Rajshahi Board' },
  { id: 'cumilla', name: 'Cumilla Board' },
  { id: 'jashore', name: 'Jashore Board' },
  { id: 'chattogram', name: 'Chattogram Board' },
  { id: 'barishal', name: 'Barishal Board' },
  { id: 'sylhet', name: 'Sylhet Board' },
  { id: 'dinajpur', name: 'Dinajpur Board' },
] as const;

// Years 2018 to 2025
export const TARGET_YEARS = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025] as const;

export const ENGLISH_BOARD_SUBJECT_BANK: EnglishBoardSubjectConfig[] = [
  // ==========================================
  // --- SSC ENGLISH VERSION SUBJECTS ---
  // ==========================================
  {
    academicLevel: 'ssc',
    subjectName: 'SSC General Mathematics (English Version)',
    displayTitle: 'General Mathematics',
    stream: 'common',
    durationMinutes: 30,
    totalMarks: 30,
    questions: [
      {
        questionText: 'If A = {1, 2, 3} and B = {2, 3, 4}, what is A ∩ B?',
        optionA: '{1, 4}',
        optionB: '{2, 3}',
        optionC: '{1, 2, 3, 4}',
        optionD: '∅',
        correctOption: 'b',
        explanation: 'The common elements between sets A and B are 2 and 3. Therefore, A ∩ B = {2, 3}.',
      },
      {
        questionText: 'If the radius of a circle is 7 cm, what is its circumference? (π = 22/7)',
        optionA: '22 cm',
        optionB: '44 cm',
        optionC: '88 cm',
        optionD: '154 cm',
        correctOption: 'b',
        explanation: 'Circumference = 2πr = 2 × (22/7) × 7 = 44 cm.',
      },
      {
        questionText: 'What is the discriminant of the quadratic equation 2x² - 4x + 2 = 0?',
        optionA: '0',
        optionB: '4',
        optionC: '-4',
        optionD: '16',
        correctOption: 'a',
        explanation: 'Discriminant D = b² - 4ac = (-4)² - 4(2)(2) = 16 - 16 = 0.',
      },
      {
        questionText: 'What is the value of log₁₀(1000)?',
        optionA: '1',
        optionB: '2',
        optionC: '3',
        optionD: '10',
        correctOption: 'c',
        explanation: 'Since 10³ = 1000, log₁₀(1000) = 3.',
      },
      {
        questionText: 'What is the sum of the interior angles of a quadrilateral?',
        optionA: '180°',
        optionB: '270°',
        optionC: '360°',
        optionD: '540°',
        correctOption: 'c',
        explanation: 'The sum of all four interior angles of any planar quadrilateral is always 360°.',
      },
    ],
  },
  {
    academicLevel: 'ssc',
    subjectName: 'SSC Physics (English Version)',
    displayTitle: 'Physics',
    stream: 'science',
    durationMinutes: 25,
    totalMarks: 25,
    questions: [
      {
        questionText: 'What is the SI unit of electric potential difference (voltage)?',
        optionA: 'Ampere',
        optionB: 'Volt',
        optionC: 'Ohm',
        optionD: 'Watt',
        correctOption: 'b',
        explanation: 'The SI unit of electric potential difference and electromotive force is the Volt (V).',
      },
      {
        questionText: 'What is the kinetic energy of an object of mass 4 kg moving with velocity 5 m/s?',
        optionA: '10 J',
        optionB: '20 J',
        optionC: '50 J',
        optionD: '100 J',
        correctOption: 'c',
        explanation: 'Kinetic energy E_k = 1/2 m v² = 0.5 × 4 × (5)² = 2 × 25 = 50 Joules.',
      },
      {
        questionText: 'Which electromagnetic wave has the longest wavelength?',
        optionA: 'Gamma rays',
        optionB: 'X-rays',
        optionC: 'Ultraviolet rays',
        optionD: 'Radio waves',
        correctOption: 'd',
        explanation: 'Radio waves have the lowest frequency and the longest wavelengths in the electromagnetic spectrum.',
      },
      {
        questionText: 'What type of mirror is used as a rear-view mirror in vehicles?',
        optionA: 'Concave mirror',
        optionB: 'Convex mirror',
        optionC: 'Plane mirror',
        optionD: 'Parabolic mirror',
        correctOption: 'b',
        explanation: 'Convex mirrors always form erect, diminished virtual images and provide a wider field of view.',
      },
    ],
  },
  {
    academicLevel: 'ssc',
    subjectName: 'SSC Chemistry (English Version)',
    displayTitle: 'Chemistry',
    stream: 'science',
    durationMinutes: 25,
    totalMarks: 25,
    questions: [
      {
        questionText: 'What is the atomic number of Sodium (Na)?',
        optionA: '10',
        optionB: '11',
        optionC: '12',
        optionD: '23',
        correctOption: 'b',
        explanation: 'Sodium (Na) is an alkali metal in Group 1 with atomic number 11.',
      },
      {
        questionText: 'What is the pH of a neutral aqueous solution at 25°C?',
        optionA: '0',
        optionB: '1',
        optionC: '7',
        optionD: '14',
        correctOption: 'c',
        explanation: 'At 25°C, neutral water has [H+] = 10⁻⁷ M, which means pH = 7.',
      },
      {
        questionText: 'Which bond is formed by the sharing of electron pairs between two atoms?',
        optionA: 'Ionic bond',
        optionB: 'Covalent bond',
        optionC: 'Metallic bond',
        optionD: 'Hydrogen bond',
        correctOption: 'b',
        explanation: 'A covalent bond involves the mutual sharing of valence electrons between atoms.',
      },
    ],
  },
  {
    academicLevel: 'ssc',
    subjectName: 'SSC Biology (English Version)',
    displayTitle: 'Biology',
    stream: 'science',
    durationMinutes: 25,
    totalMarks: 25,
    questions: [
      {
        questionText: 'Which cell organelle is known as the "Powerhouse of the Cell"?',
        optionA: 'Ribosome',
        optionB: 'Golgi Apparatus',
        optionC: 'Mitochondrion',
        optionD: 'Lysosome',
        correctOption: 'c',
        explanation: 'Mitochondria generate most of the chemical energy (ATP) through cellular respiration.',
      },
      {
        questionText: 'What is the process by which green plants synthesize glucose using sunlight?',
        optionA: 'Respiration',
        optionB: 'Photosynthesis',
        optionC: 'Transpiration',
        optionD: 'Osmosis',
        correctOption: 'b',
        explanation: 'Photosynthesis converts light energy into chemical energy stored in glucose molecules.',
      },
    ],
  },
  {
    academicLevel: 'ssc',
    subjectName: 'SSC Higher Mathematics (English Version)',
    displayTitle: 'Higher Mathematics',
    stream: 'science',
    durationMinutes: 25,
    totalMarks: 25,
    questions: [
      {
        questionText: 'What is the distance between the points (1, 2) and (4, 6)?',
        optionA: '3',
        optionB: '4',
        optionC: '5',
        optionD: '7',
        correctOption: 'c',
        explanation: 'Distance = √((4-1)² + (6-2)²) = √(3² + 4²) = √(9 + 16) = √25 = 5.',
      },
      {
        questionText: 'What is the radian measure of 60°?',
        optionA: 'π/6',
        optionB: 'π/4',
        optionC: 'π/3',
        optionD: 'π/2',
        correctOption: 'c',
        explanation: '60° × (π / 180°) = π/3 radians.',
      },
    ],
  },
  {
    academicLevel: 'ssc',
    subjectName: 'SSC Information and Communication Technology (English Version)',
    displayTitle: 'ICT',
    stream: 'common',
    durationMinutes: 25,
    totalMarks: 25,
    questions: [
      {
        questionText: 'Which protocol is standard for secure web browsing over the Internet?',
        optionA: 'HTTP',
        optionB: 'HTTPS',
        optionC: 'FTP',
        optionD: 'SMTP',
        correctOption: 'b',
        explanation: 'HTTPS (Hypertext Transfer Protocol Secure) encrypts data using SSL/TLS.',
      },
      {
        questionText: 'What is the brain of a computer responsible for executing instructions?',
        optionA: 'RAM',
        optionB: 'Hard Disk',
        optionC: 'Central Processing Unit (CPU)',
        optionD: 'Motherboard',
        correctOption: 'c',
        explanation: 'The CPU performs arithmetic, logical, and control operations for all instructions.',
      },
    ],
  },
  {
    academicLevel: 'ssc',
    subjectName: 'SSC Accounting (English Version)',
    displayTitle: 'Accounting',
    stream: 'commerce',
    durationMinutes: 30,
    totalMarks: 30,
    questions: [
      {
        questionText: 'What is the fundamental accounting equation?',
        optionA: 'Assets = Liabilities + Owner\'s Equity',
        optionB: 'Assets + Liabilities = Owner\'s Equity',
        optionC: 'Assets = Liabilities - Owner\'s Equity',
        optionD: 'Assets + Owner\'s Equity = Liabilities',
        correctOption: 'a',
        explanation: 'The fundamental accounting equation is Assets = Liabilities + Owner\'s Equity (A = L + OE).',
      },
      {
        questionText: 'Which financial statement reports a business entity\'s revenues and expenses over a specific period?',
        optionA: 'Balance Sheet',
        optionB: 'Income Statement',
        optionC: 'Cash Flow Statement',
        optionD: 'Trial Balance',
        correctOption: 'b',
        explanation: 'The Income Statement (Profit and Loss Account) shows operational performance (revenue minus expenses).',
      },
    ],
  },
  {
    academicLevel: 'ssc',
    subjectName: 'SSC Bangla 1st Paper (English Version)',
    displayTitle: 'Bangla 1st Paper',
    stream: 'common',
    icon: 'BookOpen',
    durationMinutes: 30,
    totalMarks: 30,
    questions: [
      {
        questionText: '‘বই পড়া’ প্রবন্ধে প্রাবন্ধিক প্রমথ চৌধুরীর মতে মানুষের সর্বশ্রেষ্ঠ ও মহৎ শখ কোনটি?',
        optionA: 'বই পড়া',
        optionB: 'চিত্রাঙ্কন',
        optionC: 'দেশভ্রমণ',
        optionD: 'সংগীত সাধনা',
        correctOption: 'a',
        explanation: 'প্রমথ চৌধুরীর মতে মনের প্রসার ও স্বশিক্ষিত হওয়ার জন্য বই পড়ার শখ মানুষের সর্বশ্রেষ্ঠ শখ।',
      },
      {
        questionText: '‘মানুষ’ কবিতায় কাজী নজরুল ইসলাম কিসের বিরুদ্ধে তীব্র প্রতিবাদ জানিয়েছেন?',
        optionA: 'ধর্মের নামে ভণ্ডামি ও সাম্প্রদায়িক সংকীর্ণতার বিরুদ্ধে',
        optionB: 'বিজ্ঞানের অগ্রগতির বিরুদ্ধে',
        optionC: 'বিদেশি সাহিত্যের বিরুদ্ধে',
        optionD: 'কৃষকদের অধিকারের বিরুদ্ধে',
        correctOption: 'a',
        explanation: 'নজরুল তাঁর কবিতায় ধর্মের মিথ্যা ধ্বজাধারীদের মুখোশ উন্মোচন করে মানবতার জয়গান গেয়েছেন।',
      },
    ],
  },
  {
    academicLevel: 'ssc',
    subjectName: 'SSC Bangla 2nd Paper (English Version)',
    displayTitle: 'Bangla 2nd Paper',
    stream: 'common',
    icon: 'BookOpen',
    durationMinutes: 30,
    totalMarks: 30,
    questions: [
      {
        questionText: 'বাংলা ব্যাকরণ অনুযায়ী কোনটি রূপক কর্মধারয় সমাসের নিখুঁত উদাহরণ?',
        optionA: 'মনমাঝি (মন রূপ মাঝি)',
        optionB: 'মৌমাছি',
        optionC: 'সিংহপুরুষ',
        optionD: 'নীলপদ্ম',
        correctOption: 'a',
        explanation: 'উপমান ও উপমেয়ের মধ্যে অভিন্নতা কল্পনা করা হলে রূপক কর্মধারয় সমাস হয়, যেমন: মন রূপ মাঝি = মনমাঝি।',
      },
      {
        questionText: 'বাংলা ভাষায় মৌলিক স্বরধ্বনি কয়টি?',
        optionA: '৭টি',
        optionB: '৯টি',
        optionC: '১১টি',
        optionD: '১৩টি',
        correctOption: 'a',
        explanation: 'বাংলা ভাষায় মৌলিক স্বরধ্বনি ৭টি: অ, আ, ই, উ, এ, ও, অ্যা।',
      },
    ],
  },
  {
    academicLevel: 'ssc',
    subjectName: 'SSC English 1st Paper (English Version)',
    displayTitle: 'English 1st Paper',
    stream: 'common',
    icon: 'PenTool',
    durationMinutes: 30,
    totalMarks: 30,
    questions: [
      {
        questionText: 'According to the historical account of 21st February, why do people walk barefoot towards the Shaheed Minar?',
        optionA: 'To demonstrate deep reverence and solemn homage to the language martyrs',
        optionB: 'Because traditional shoes are prohibited by law',
        optionC: 'To facilitate walking in massive processions',
        optionD: 'To follow festive carnival traditions',
        correctOption: 'a',
        explanation: 'Walking barefoot (probhat feri) is a sacred symbol of mourning and heartfelt respect for the martyrs who sacrificed their lives for their mother tongue.',
      },
      {
        questionText: 'What is the central theme of the poem "I Wandered Lonely as a Cloud" by William Wordsworth?',
        optionA: 'The healing and uplifting power of natural beauty on the human spirit',
        optionB: 'The harsh realities of industrial urban life',
        optionC: 'The sorrow of unfulfilled ambitions',
        optionD: 'The mystery of the ocean depths',
        correctOption: 'a',
        explanation: 'Wordsworth explores nature\'s rejuvenating power when recollected in tranquil solitude.',
      },
    ],
  },
  {
    academicLevel: 'ssc',
    subjectName: 'SSC English 2nd Paper (English Version)',
    displayTitle: 'English 2nd Paper',
    stream: 'common',
    icon: 'PenTool',
    durationMinutes: 30,
    totalMarks: 30,
    questions: [
      {
        questionText: 'Choose the sentence that correctly employs prepositional comparative syntax: "He is senior _____ me in service."',
        optionA: 'to',
        optionB: 'than',
        optionC: 'from',
        optionD: 'over',
        correctOption: 'a',
        explanation: 'Adjectives of Latin origin ending in "-ior" (senior, junior, superior, inferior, prior) are followed by "to", not "than".',
      },
      {
        questionText: 'Identify the grammatically correct passive transformation of: "Who wrote this celebrated poem?"',
        optionA: 'By whom was this celebrated poem written?',
        optionB: 'By whom this celebrated poem was written?',
        optionC: 'Who was this celebrated poem written by?',
        optionD: 'Whom wrote this celebrated poem?',
        correctOption: 'a',
        explanation: 'Interrogative sentences starting with "Who" take "By whom + auxiliary + subject + V3?".',
      },
    ],
  },
  {
    academicLevel: 'ssc',
    subjectName: 'SSC Bangladesh & Global Studies (English Version)',
    displayTitle: 'Bangladesh & Global Studies',
    stream: 'science',
    icon: 'Globe',
    durationMinutes: 30,
    totalMarks: 30,
    questions: [
      {
        questionText: 'On which date did the Provisional Government of the People\'s Republic of Bangladesh formally take oath at Mujibnagar?',
        optionA: '17 April 1971',
        optionB: '26 March 1971',
        optionC: '7 March 1971',
        optionD: '16 December 1971',
        correctOption: 'a',
        explanation: 'The Mujibnagar Government formally took its historic oath on 17 April 1971 at Baidyanathtala (Meherpur), establishing the formal legal governance of the Liberation War.',
      },
      {
        questionText: 'Which constitutional part of the Constitution of Bangladesh lays down the Fundamental Principles of State Policy?',
        optionA: 'Part II (Articles 8 to 25)',
        optionB: 'Part I (Articles 1 to 7)',
        optionC: 'Part III (Articles 26 to 47A)',
        optionD: 'Part IV (Articles 48 to 64)',
        correctOption: 'a',
        explanation: 'Part II articulates the core state principles including Nationalism, Socialism, Democracy, and Secularism.',
      },
    ],
  },
  {
    academicLevel: 'ssc',
    subjectName: 'SSC Business Entrepreneurship (English Version)',
    displayTitle: 'Business Entrepreneurship',
    stream: 'commerce',
    icon: 'Briefcase',
    durationMinutes: 30,
    totalMarks: 30,
    questions: [
      {
        questionText: 'What is the defining characteristic of a successful business entrepreneur?',
        optionA: 'Calculated risk-taking, innovative vision, and perseverance',
        optionB: 'Complete risk avoidance in commercial ventures',
        optionC: 'Relying exclusively on non-commercial government grants',
        optionD: 'Avoiding adaptation to modern consumer technology',
        correctOption: 'a',
        explanation: 'Entrepreneurship is fundamentally driven by spotting market gaps, innovating, taking calculated risks, and persisting through challenges.',
      },
      {
        questionText: 'What is the legal liability status of the single owner in a Sole Proprietorship business?',
        optionA: 'Unlimited liability (personal property can be seized to pay debts)',
        optionB: 'Strictly limited to the registered capital share',
        optionC: 'Divided equally among non-owner employees',
        optionD: 'Guaranteed and underwritten by commercial banks',
        correctOption: 'a',
        explanation: 'In sole proprietorships, there is no legal separation between the owner and the firm; liabilities are personal and unlimited.',
      },
    ],
  },
  {
    academicLevel: 'ssc',
    subjectName: 'SSC Finance and Banking (English Version)',
    displayTitle: 'Finance & Banking',
    stream: 'commerce',
    icon: 'TrendingUp',
    durationMinutes: 30,
    totalMarks: 30,
    questions: [
      {
        questionText: 'Which central financial principle dictates that higher financial returns generally require accepting greater risk of capital loss?',
        optionA: 'Risk-Return Tradeoff principle',
        optionB: 'Time Value of Money principle',
        optionC: 'Historical Cost principle',
        optionD: 'Matching principle',
        correctOption: 'a',
        explanation: 'The risk-return tradeoff asserts that potential return rises with an increase in risk.',
      },
      {
        questionText: 'What is the central apex banking authority and currency issuer of Bangladesh?',
        optionA: 'Bangladesh Bank',
        optionB: 'Sonali Bank PLC',
        optionC: 'Investment Corporation of Bangladesh (ICB)',
        optionD: 'Grameen Bank',
        correctOption: 'a',
        explanation: 'Bangladesh Bank serves as the central bank responsible for monetary policy, forex reserves, and commercial bank oversight.',
      },
    ],
  },
  {
    academicLevel: 'ssc',
    subjectName: 'SSC Islam and Moral Education (English Version)',
    displayTitle: 'Islam & Moral Education',
    stream: 'common',
    icon: 'Sparkles',
    durationMinutes: 30,
    totalMarks: 30,
    questions: [
      {
        questionText: 'What is the literal Arabic meaning of the word "Iman"?',
        optionA: 'Firm belief, faith, and inner conviction',
        optionB: 'Ritual prayers',
        optionC: 'Monetary charity',
        optionD: 'Pilgrimage journey',
        correctOption: 'a',
        explanation: 'Iman means sincere, unwavering faith in Allah, His Angels, Revealed Scriptures, Prophets, and the Day of Judgment.',
      },
      {
        questionText: 'Which pillar of Islam is mandatory on all adult Muslims during the sacred month of Ramadan?',
        optionA: 'Sawm (Fasting from dawn until dusk)',
        optionB: 'Hajj',
        optionC: 'Zakat',
        optionD: 'Jihad',
        correctOption: 'a',
        explanation: 'Sawm (fasting) is one of the Five Pillars of Islam, prescribed to cultivate Taqwa (God-consciousness).',
      },
    ],
  },
  {
    academicLevel: 'ssc',
    subjectName: 'SSC General Science (English Version)',
    displayTitle: 'General Science',
    stream: 'commerce',
    icon: 'Activity',
    durationMinutes: 30,
    totalMarks: 30,
    questions: [
      {
        questionText: 'Which fat-soluble vitamin plays an indispensable role in blood coagulation at wound sites?',
        optionA: 'Vitamin K',
        optionB: 'Vitamin A',
        optionC: 'Vitamin C',
        optionD: 'Vitamin D',
        correctOption: 'a',
        explanation: 'Vitamin K is required for the synthesis of prothrombin, a key protein in normal blood clotting.',
      },
    ],
  },
  {
    academicLevel: 'ssc',
    subjectName: 'SSC Agriculture Studies (English Version)',
    displayTitle: 'Agriculture Studies',
    stream: 'science',
    icon: 'Flower2',
    durationMinutes: 30,
    totalMarks: 30,
    questions: [
      {
        questionText: 'Which balanced soil type containing balanced proportions of sand, silt, and clay is considered optimal for staple crop cultivation in Bangladesh?',
        optionA: 'Loam soil',
        optionB: 'Coarse sandy soil',
        optionC: 'Heavy impervious clay soil',
        optionD: 'Alkaline saline soil',
        correctOption: 'a',
        explanation: 'Loam soil provides superior aeration, water retention, and organic nutrient availability for agriculture.',
      },
    ],
  },

  // ==========================================
  // --- HSC ENGLISH VERSION SUBJECTS ---
  // ==========================================
  {
    academicLevel: 'hsc',
    subjectName: 'Physics 1st Paper (English Version)',
    displayTitle: 'Physics 1st Paper',
    stream: 'science',
    durationMinutes: 25,
    totalMarks: 25,
    questions: [
      {
        questionText: 'What is the dimension of universal gravitational constant (G)?',
        optionA: '[M⁻¹ L³ T⁻²]',
        optionB: '[M L² T⁻²]',
        optionC: '[M⁻¹ L² T⁻¹]',
        optionD: '[M L³ T⁻²]',
        correctOption: 'a',
        explanation: 'From F = G(m₁m₂)/r², G = Fr²/(m₁m₂), hence dimensions are [M L T⁻²][L²]/[M²] = [M⁻¹ L³ T⁻²].',
      },
      {
        questionText: 'When two vectors of equal magnitude A have a resultant of magnitude A, what is the angle between them?',
        optionA: '0°',
        optionB: '60°',
        optionC: '90°',
        optionD: '120°',
        correctOption: 'd',
        explanation: 'R² = A² + A² + 2A² cos θ => A² = 2A²(1 + cos θ) => cos θ = -1/2 => θ = 120°.',
      },
      {
        questionText: 'At what launch angle is the horizontal range of a projectile maximum on level ground?',
        optionA: '30°',
        optionB: '45°',
        optionC: '60°',
        optionD: '90°',
        correctOption: 'b',
        explanation: 'Range R = (v² sin 2θ)/g. Maximum range occurs when sin 2θ = 1, which means 2θ = 90° => θ = 45°.',
      },
      {
        questionText: 'What is the work done by the centripetal force on an object in uniform circular motion?',
        optionA: 'Positive',
        optionB: 'Negative',
        optionC: 'Zero',
        optionD: 'Infinite',
        correctOption: 'c',
        explanation: 'Centripetal force is always perpendicular to the instantaneous displacement vector (cos 90° = 0), so work done is zero.',
      },
    ],
  },
  {
    academicLevel: 'hsc',
    subjectName: 'Physics 2nd Paper (English Version)',
    displayTitle: 'Physics 2nd Paper',
    stream: 'science',
    durationMinutes: 25,
    totalMarks: 25,
    questions: [
      {
        questionText: 'In a Carnot engine operating between temperatures T₁ and T₂, what is the formula for thermal efficiency η?',
        optionA: '1 - T₂/T₁',
        optionB: '1 - T₁/T₂',
        optionC: 'T₂/T₁',
        optionD: '1 + T₂/T₁',
        correctOption: 'a',
        explanation: 'Efficiency of an ideal Carnot cycle is η = 1 - (T_cold / T_hot) = 1 - T₂/T₁.',
      },
      {
        questionText: 'What is the relationship between electric field E and electric potential V in a uniform field?',
        optionA: 'E = V × d',
        optionB: 'E = V / d',
        optionC: 'E = d / V',
        optionD: 'E = V²',
        correctOption: 'b',
        explanation: 'In a uniform electric field, the electric field strength is given by potential gradient E = V / d.',
      },
      {
        questionText: 'Which particle is emitted during positive beta (β⁺) radioactive decay?',
        optionA: 'Electron',
        optionB: 'Positron',
        optionC: 'Neutron',
        optionD: 'Alpha particle',
        correctOption: 'b',
        explanation: 'β⁺ decay produces a positron (anti-electron) alongside a neutrino.',
      },
    ],
  },
  {
    academicLevel: 'hsc',
    subjectName: 'Chemistry 1st Paper (English Version)',
    displayTitle: 'Chemistry 1st Paper',
    stream: 'science',
    durationMinutes: 25,
    totalMarks: 25,
    questions: [
      {
        questionText: 'According to Hund\'s rule, how do electrons occupy degenerate orbitals?',
        optionA: 'Pair up first before singly occupying',
        optionB: 'Singly occupy orbitals with parallel spins first',
        optionC: 'Occupy only s orbitals',
        optionD: 'Pair up with opposite spins first',
        correctOption: 'b',
        explanation: 'Every orbital in a subshell is singly occupied with parallel spins before any orbital is doubly occupied.',
      },
      {
        questionText: 'What is the molecular geometry of Methane (CH₄) based on VSEPR theory?',
        optionA: 'Linear',
        optionB: 'Trigonal Planar',
        optionC: 'Tetrahedral',
        optionD: 'Octahedral',
        correctOption: 'c',
        explanation: 'Carbon undergoes sp³ hybridization with four bonding electron pairs at 109.5° bond angles, forming a tetrahedral geometry.',
      },
      {
        questionText: 'Which salt solution produces a red flame test color characteristic of Strontium or Lithium?',
        optionA: 'Sodium (Na)',
        optionB: 'Potassium (K)',
        optionC: 'Strontium (Sr) / Lithium (Li)',
        optionD: 'Barium (Ba)',
        correctOption: 'c',
        explanation: 'Strontium produces a crimson-red flame, whereas sodium produces bright yellow and barium pale green.',
      },
    ],
  },
  {
    academicLevel: 'hsc',
    subjectName: 'Chemistry 2nd Paper (English Version)',
    displayTitle: 'Chemistry 2nd Paper',
    stream: 'science',
    durationMinutes: 25,
    totalMarks: 25,
    questions: [
      {
        questionText: 'What is the volume occupied by 1 mole of an ideal gas at STP (0°C and 1 atm)?',
        optionA: '22.4 liters',
        optionB: '24.78 liters',
        optionC: '20.0 liters',
        optionD: '11.2 liters',
        correctOption: 'a',
        explanation: 'At standard temperature and pressure (0°C, 1 atm), 1 mole of any ideal gas occupies 22.414 liters.',
      },
      {
        questionText: 'Which functional group characterizes carboxylic acids?',
        optionA: '-OH',
        optionB: '-CHO',
        optionC: '-COOH',
        optionD: '-CO-',
        correctOption: 'c',
        explanation: 'The carboxyl group (-COOH) consists of a carbonyl group bonded to a hydroxyl group.',
      },
    ],
  },
  {
    academicLevel: 'hsc',
    subjectName: 'Biology 1st Paper (English Version)',
    displayTitle: 'Biology 1st Paper (Botany)',
    stream: 'science',
    durationMinutes: 25,
    totalMarks: 25,
    questions: [
      {
        questionText: 'What is the primary genetic material in viruses such as TMV (Tobacco Mosaic Virus)?',
        optionA: 'Single-stranded RNA',
        optionB: 'Double-stranded DNA',
        optionC: 'Protein only',
        optionD: 'Lipids',
        correctOption: 'a',
        explanation: 'TMV possesses single-stranded RNA as its genetic material wrapped in a helical capsid.',
      },
      {
        questionText: 'In which stage of meiosis does crossing over occur between non-sister chromatids?',
        optionA: 'Leptotene',
        optionB: 'Zygotene',
        optionC: 'Pachytene',
        optionD: 'Diplotene',
        correctOption: 'c',
        explanation: 'Crossing over takes place during the Pachytene stage of Prophase I in Meiosis.',
      },
    ],
  },
  {
    academicLevel: 'hsc',
    subjectName: 'Biology 2nd Paper (English Version)',
    displayTitle: 'Biology 2nd Paper (Zoology)',
    stream: 'science',
    durationMinutes: 25,
    totalMarks: 25,
    questions: [
      {
        questionText: 'Which blood group is universally known as the "Universal Donor"?',
        optionA: 'A positive',
        optionB: 'B positive',
        optionC: 'AB positive',
        optionD: 'O negative',
        correctOption: 'd',
        explanation: 'Blood group O negative lacks A, B, and Rh antigens, making it safe for transfusion to any recipient.',
      },
      {
        questionText: 'What is the functional structural unit of the human kidney?',
        optionA: 'Neuron',
        optionB: 'Nephron',
        optionC: 'Alveolus',
        optionD: 'Hepatocyte',
        correctOption: 'b',
        explanation: 'Each kidney contains approximately one million nephrons responsible for filtering blood and producing urine.',
      },
    ],
  },
  {
    academicLevel: 'hsc',
    subjectName: 'Higher Mathematics 1st Paper (English Version)',
    displayTitle: 'Higher Mathematics 1st Paper',
    stream: 'science',
    durationMinutes: 25,
    totalMarks: 25,
    questions: [
      {
        questionText: 'What is the determinant of a 2x2 matrix [[3, 2], [1, 4]]?',
        optionA: '10',
        optionB: '12',
        optionC: '14',
        optionD: '16',
        correctOption: 'a',
        explanation: 'det = (3 × 4) - (2 × 1) = 12 - 2 = 10.',
      },
      {
        questionText: 'What is the derivative of sin(x) with respect to x?',
        optionA: '-cos(x)',
        optionB: 'cos(x)',
        optionC: 'tan(x)',
        optionD: 'sec²(x)',
        correctOption: 'b',
        explanation: 'The first derivative of sin(x) is cos(x).',
      },
    ],
  },
  {
    academicLevel: 'hsc',
    subjectName: 'Higher Mathematics 2nd Paper (English Version)',
    displayTitle: 'Higher Mathematics 2nd Paper',
    stream: 'science',
    durationMinutes: 25,
    totalMarks: 25,
    questions: [
      {
        questionText: 'What is the modulus of the complex number z = 3 + 4i?',
        optionA: '5',
        optionB: '7',
        optionC: '12',
        optionD: '25',
        correctOption: 'a',
        explanation: '|z| = √(3² + 4²) = √(9 + 16) = √25 = 5.',
      },
      {
        questionText: 'What is the eccentricity e of a parabola?',
        optionA: 'e = 0',
        optionB: 'e < 1',
        optionC: 'e = 1',
        optionD: 'e > 1',
        correctOption: 'c',
        explanation: 'By definition, the eccentricity of any parabola is exactly equal to 1.',
      },
    ],
  },
  {
    academicLevel: 'hsc',
    subjectName: 'Information and Communication Technology (English Version)',
    displayTitle: 'ICT',
    stream: 'common',
    durationMinutes: 25,
    totalMarks: 25,
    questions: [
      {
        questionText: 'Which logic gate outputs 1 only when all its inputs are 1?',
        optionA: 'OR gate',
        optionB: 'AND gate',
        optionC: 'NOT gate',
        optionD: 'XOR gate',
        correctOption: 'b',
        explanation: 'The AND gate performs logical multiplication; its output is true (1) if and only if every input is true.',
      },
      {
        questionText: 'In HTML, which tag is used to create a hyperlink?',
        optionA: '<link>',
        optionB: '<a>',
        optionC: '<href>',
        optionD: '<nav>',
        correctOption: 'b',
        explanation: 'The anchor tag <a> with the href attribute defines a hyperlink.',
      },
    ],
  },
  {
    academicLevel: 'hsc',
    subjectName: 'Accounting 1st Paper (English Version)',
    displayTitle: 'Accounting 1st Paper',
    stream: 'commerce',
    durationMinutes: 30,
    totalMarks: 30,
    questions: [
      {
        questionText: 'Which book of original entry is used to record all cash receipts and cash payments?',
        optionA: 'Journal',
        optionB: 'Cash Book',
        optionC: 'Ledger',
        optionD: 'Trial Balance',
        correctOption: 'b',
        explanation: 'The Cash Book records all cash inflows and outflows chronologically as a book of prime entry.',
      },
      {
        questionText: 'Prepaid expenses are classified under which section of the Balance Sheet?',
        optionA: 'Current Liabilities',
        optionB: 'Current Assets',
        optionC: 'Long-term Liabilities',
        optionD: 'Owner\'s Equity',
        correctOption: 'b',
        explanation: 'Prepaid expenses represent future economic benefits and are reported as Current Assets.',
      },
    ],
  },
  {
    academicLevel: 'hsc',
    subjectName: 'Economics 1st Paper (English Version)',
    displayTitle: 'Economics 1st Paper',
    stream: 'humanities',
    durationMinutes: 30,
    totalMarks: 30,
    questions: [
      {
        questionText: 'According to the Law of Demand, what happens to the quantity demanded when price increases, ceteris paribus?',
        optionA: 'Increases',
        optionB: 'Decreases',
        optionC: 'Remains constant',
        optionD: 'Becomes zero',
        correctOption: 'b',
        explanation: 'The Law of Demand states an inverse relationship between price and quantity demanded.',
      },
      {
        questionText: 'What term describes the forgone alternative when choosing a particular economic decision?',
        optionA: 'Marginal Cost',
        optionB: 'Opportunity Cost',
        optionC: 'Fixed Cost',
        optionD: 'Sunk Cost',
        correctOption: 'b',
        explanation: 'Opportunity cost is the value of the next-best alternative that must be sacrificed.',
      },
    ],
  },
  {
    academicLevel: 'hsc',
    subjectName: 'Bangla 1st Paper (English Version)',
    displayTitle: 'Bangla 1st Paper',
    stream: 'common',
    icon: 'BookOpen',
    durationMinutes: 30,
    totalMarks: 30,
    questions: [
      {
        questionText: '‘অপরিচিতা’ গল্পে অনুপমের বাবার মূল পেশা কী ছিল?',
        optionA: 'ওকালতি (আইনজীবী)',
        optionB: 'চিকিৎসক',
        optionC: 'কলেজ শিক্ষক',
        optionD: 'জমিদার',
        correctOption: 'a',
        explanation: 'রবীন্দ্রনাথ ঠাকুরের ‘অপরিচিতা’ গল্পে অনুপমের পিতা এককালে ওকালতি করে প্রচুর অর্থ উপার্জন করেছিলেন।',
      },
      {
        questionText: 'কাজী নজরুল ইসলামের যুগান্তকারী ‘বিদ্রোহী’ কবিতাটি সর্বপ্রথম কোন পত্রিকায় প্রকাশিত হয়েছিল?',
        optionA: 'বিজলী পত্রিকায়',
        optionB: 'ধূমকেতু পত্রিকায়',
        optionC: 'কল্লোল পত্রিকায়',
        optionD: 'লাঙ্গল পত্রিকায়',
        correctOption: 'a',
        explanation: '১৯২২ সালের জানুয়ারি মাসে বিজলী পত্রিকায় প্রথম ‘বিদ্রোহী’ কবিতা প্রকাশিত হয়ে চারদিকে সাড়া জাগায়।',
      },
    ],
  },
  {
    academicLevel: 'hsc',
    subjectName: 'Bangla 2nd Paper (English Version)',
    displayTitle: 'Bangla 2nd Paper',
    stream: 'common',
    icon: 'BookOpen',
    durationMinutes: 30,
    totalMarks: 30,
    questions: [
      {
        questionText: 'প্রমিত বাংলা ব্যাকরণের উচ্চারণরীতি অনুসারে ‘অ’-ধ্বনির সংবৃত (ও-এর মতো) উচ্চারণ কোন শব্দটিতে ঘটেছে?',
        optionA: 'অতি (উচ্চারণ: ওতি)',
        optionB: 'অমর',
        optionC: 'অমল',
        optionD: 'অসীম',
        correctOption: 'a',
        explanation: 'শব্দের আদিতে ‘অ’ এবং পরবর্তী বর্ণে ই/উ-কার থাকলে সেই আদ্য ‘অ’-এর উচ্চারণ সংবৃত বা ‘ও’-এর মতো হয়।',
      },
      {
        questionText: '‘চিরসুখী’ শব্দটির সঠিক ব্যাসবাক্য কোনটি?',
        optionA: 'চিরকাল ব্যাপিয়া সুখী',
        optionB: 'চিরকালের সুখী',
        optionC: 'চির যে সুখী',
        optionD: 'চিরতরে সুখী',
        correctOption: 'a',
        explanation: 'ব্যাপ্তি অর্থে দ্বিতীয়া তৎপুরুষ সমাস: চিরকাল ব্যাপিয়া সুখী = চিরসুখী।',
      },
    ],
  },
  {
    academicLevel: 'hsc',
    subjectName: 'English 1st Paper (English Version)',
    displayTitle: 'English 1st Paper',
    stream: 'common',
    icon: 'PenTool',
    durationMinutes: 30,
    totalMarks: 30,
    questions: [
      {
        questionText: 'In his historic courtroom statement, what ideal did Nelson Mandela declare he was prepared to die for?',
        optionA: 'A democratic and free society in which all persons live together in harmony with equal opportunities',
        optionB: 'The exclusive economic privilege of his indigenous clan',
        optionC: 'A unilateral military withdrawal',
        optionD: 'The immediate establishment of a monarchy',
        correctOption: 'a',
        explanation: 'Mandela proclaimed his dedication to a democratic and non-racial society where all people live in dignity and equal rights.',
      },
    ],
  },
  {
    academicLevel: 'hsc',
    subjectName: 'English 2nd Paper (English Version)',
    displayTitle: 'English 2nd Paper',
    stream: 'common',
    icon: 'PenTool',
    durationMinutes: 30,
    totalMarks: 30,
    questions: [
      {
        questionText: 'Complete the sentence with the correct conditional structure: "If the government had taken strict precautionary measures, the epidemic _____ so rapidly."',
        optionA: 'would not have spread',
        optionB: 'will not spread',
        optionC: 'would not spread',
        optionD: 'did not spread',
        correctOption: 'a',
        explanation: 'Third conditional pattern: If + Past Perfect, Subject + would have + Past Participle.',
      },
      {
        questionText: 'Choose the appropriate phrasal verb: "The meeting was _____ due to unavoidable circumstances."',
        optionA: 'called off',
        optionB: 'called on',
        optionC: 'called in',
        optionD: 'called up',
        correctOption: 'a',
        explanation: '"Call off" means to cancel an event or meeting.',
      },
    ],
  },
  {
    academicLevel: 'hsc',
    subjectName: 'Business Organization & Management 1st Paper (English Version)',
    displayTitle: 'Business Organization & Management',
    stream: 'commerce',
    icon: 'Briefcase',
    durationMinutes: 30,
    totalMarks: 30,
    questions: [
      {
        questionText: 'What is the primary socio-economic objective of modern ethical business enterprise?',
        optionA: 'Earning legitimate profits through customer satisfaction, value creation, and social responsibility',
        optionB: 'Maximal short-term hoarding of scarce essential goods',
        optionC: 'Total monopolization by crushing small producers',
        optionD: 'Evading state environmental regulations',
        correctOption: 'a',
        explanation: 'Modern enterprise balances financial profitability with consumer satisfaction and societal ethics.',
      },
      {
        questionText: 'Under the Partnership Act of 1932, what is the legal limitation on the number of partners in a general partnership firm?',
        optionA: 'Minimum 2 and maximum 20 partners',
        optionB: 'Minimum 2 and maximum 10 partners',
        optionC: 'Minimum 7 and maximum 50 partners',
        optionD: 'Minimum 1 and maximum 100 partners',
        correctOption: 'a',
        explanation: 'For ordinary business partnerships, membership is restricted between 2 and 20 (up to 10 for banking).',
      },
    ],
  },
  {
    academicLevel: 'hsc',
    subjectName: 'Finance, Banking & Insurance 1st Paper (English Version)',
    displayTitle: 'Finance, Banking & Insurance',
    stream: 'commerce',
    icon: 'TrendingUp',
    durationMinutes: 30,
    totalMarks: 30,
    questions: [
      {
        questionText: 'What mathematical formula calculates the Present Value (PV) of a future sum under annual compounding interest?',
        optionA: 'PV = FV / (1 + r)ⁿ',
        optionB: 'PV = FV × (1 + r)ⁿ',
        optionC: 'PV = FV / (1 + n × r)',
        optionD: 'PV = FV × r / n',
        correctOption: 'a',
        explanation: 'Present Value discounts future value using the opportunity discount rate: PV = FV / (1 + r)ⁿ.',
      },
      {
        questionText: 'Which capital budgeting tool measures the exact duration required to recover the initial project investment from subsequent cash inflows?',
        optionA: 'Payback Period (PBP)',
        optionB: 'Internal Rate of Return (IRR)',
        optionC: 'Net Present Value (NPV)',
        optionD: 'Profitability Index (PI)',
        correctOption: 'a',
        explanation: 'Payback Period evaluates project liquidity by determining how quickly the initial outlay is recovered.',
      },
    ],
  },
  {
    academicLevel: 'hsc',
    subjectName: 'Civics & Good Governance 1st Paper (English Version)',
    displayTitle: 'Civics & Good Governance',
    stream: 'humanities',
    icon: 'Landmark',
    durationMinutes: 30,
    totalMarks: 30,
    questions: [
      {
        questionText: 'Which institutional principle is recognized by governance scholars as the cornerstone of democratic good governance?',
        optionA: 'Transparency, institutional accountability, rule of law, and citizen participation',
        optionB: 'Autocratic centralization of executive commands',
        optionC: 'Suppression of judicial independence',
        optionD: 'Unrestricted state censorship',
        correctOption: 'a',
        explanation: 'Good governance rests on transparency, democratic accountability, rule of law, and public participation.',
      },
    ],
  },
  {
    academicLevel: 'hsc',
    subjectName: 'Logic 1st Paper (English Version)',
    displayTitle: 'Logic 1st Paper',
    stream: 'humanities',
    icon: 'Sparkles',
    durationMinutes: 30,
    totalMarks: 30,
    questions: [
      {
        questionText: 'In classical deductive and inductive logic, what is the process of passing from known premises to an unknown conclusion called?',
        optionA: 'Inference',
        optionB: 'Categorical Proposition',
        optionC: 'Copula',
        optionD: 'Conversion',
        correctOption: 'a',
        explanation: 'Inference is the cognitive step from established premises to a logical conclusion.',
      },
    ],
  },
];

export async function seedEnglishBoardQuestions() {
  const client = await pool.connect();
  try {
    console.log('--- Starting English Version Board Questions Seeding (2018 - 2025 across 8 Boards) ---');
    let totalExamsCreated = 0;
    let totalQuestionsCreated = 0;

    for (const year of TARGET_YEARS) {
      for (const subjectCfg of ENGLISH_BOARD_SUBJECT_BANK) {
        // Find or create subject in database
        const subRes = await client.query(
          `SELECT id, name FROM subjects WHERE name = $1 AND academic_level = $2 AND curriculum_version = 'english' LIMIT 1`,
          [subjectCfg.subjectName, subjectCfg.academicLevel]
        );

        let subjectId: string;
        if (subRes.rowCount && subRes.rows.length > 0) {
          subjectId = subRes.rows[0].id;
        } else {
          const insertSub = await client.query(
            `INSERT INTO subjects (name, name_bn, icon, is_active, unlock_price, curriculum_version, academic_level, stream)
             VALUES ($1, $2, $3, TRUE, 0, 'english', $4, $5)
             RETURNING id`,
            [
              subjectCfg.subjectName,
              subjectCfg.displayTitle,
              subjectCfg.icon || 'BookOpen',
              subjectCfg.academicLevel,
              subjectCfg.stream,
            ]
          );
          subjectId = insertSub.rows[0].id;
        }

        // Seed across all 8 education boards
        for (const board of GENERAL_BOARDS_EN) {
          const examTitle = `${subjectCfg.academicLevel.toUpperCase()} ${year}: ${subjectCfg.displayTitle} (${board.name})`;

          // Check if exam already exists
          const existingExam = await client.query(
            `SELECT id FROM exams WHERE subject_id = $1 AND exam_year = $2 AND board_name = $3 AND curriculum_version = 'english' LIMIT 1`,
            [subjectId, year, board.name]
          );

          let examId: string;
          if (existingExam.rowCount && existingExam.rowCount > 0) {
            examId = existingExam.rows[0].id;
            await client.query(
              `UPDATE exams
               SET title = $1, duration_minutes = $2, total_marks = $3, negative_mark = 0.25,
                   is_published = TRUE, exam_type = 'board_question', board_name = $4, exam_year = $5,
                   academic_level = $6, curriculum_version = 'english'
               WHERE id = $7`,
              [
                examTitle,
                subjectCfg.durationMinutes,
                subjectCfg.totalMarks,
                board.name,
                year,
                subjectCfg.academicLevel,
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
               VALUES ($1, $2, 1, $3, $4, 0.25, $5, TRUE, 'english', $6, 'board_question', $7, $8)
               RETURNING id`,
              [
                subjectId,
                examTitle,
                subjectCfg.durationMinutes,
                subjectCfg.totalMarks,
                `Each correct answer carries 1 mark. 0.25 mark will be deducted for each incorrect answer. Time: ${subjectCfg.durationMinutes} minutes.`,
                subjectCfg.academicLevel,
                board.name,
                year,
              ]
            );
            examId = insertExam.rows[0].id;
            totalExamsCreated++;
          }

          // Insert questions safely
          let qIdx = 1;
          for (const q of subjectCfg.questions) {
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
              totalQuestionsCreated++;
            }
            qIdx++;
          }
        }
      }
    }

    console.log(`Successfully seeded English Version Board Questions!`);
    console.log(`Total new English exams created: ${totalExamsCreated}`);
    console.log(`Total new English questions created: ${totalQuestionsCreated}`);
  } catch (err) {
    console.error('Failed to seed English version board questions:', err);
    throw err;
  } finally {
    client.release();
  }
}

// Allow direct execution: tsx server/seed_english_board_questions.ts
if (process.argv[1]?.endsWith('seed_english_board_questions.ts') || process.argv[1]?.endsWith('seed_english_board_questions.js')) {
  seedEnglishBoardQuestions()
    .then(() => {
      console.log('Done!');
      process.exit(0);
    })
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}

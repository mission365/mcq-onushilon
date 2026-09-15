import { pool } from './db.js';

export interface BoardSubjectConfig {
  academicLevel: 'ssc' | 'hsc';
  subjectName: string;
  nameBn: string;
  stream: 'science' | 'commerce' | 'humanities' | 'common';
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

// 8 General Education Boards of Bangladesh
export const GENERAL_BOARDS = [
  { id: 'dhaka', nameBn: 'ঢাকা বোর্ড' },
  { id: 'rajshahi', nameBn: 'রাজশাহী বোর্ড' },
  { id: 'cumilla', nameBn: 'কুমিল্লা বোর্ড' },
  { id: 'jashore', nameBn: 'যশোর বোর্ড' },
  { id: 'chattogram', nameBn: 'চট্টগ্রাম বোর্ড' },
  { id: 'barishal', nameBn: 'বরিশাল বোর্ড' },
  { id: 'sylhet', nameBn: 'সিলেট বোর্ড' },
  { id: 'dinajpur', nameBn: 'দিনাজপুর বোর্ড' },
] as const;

// Years 2018 to 2025 (plus 2016)
export const TARGET_YEARS = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025] as const;

// Curated subjects with verified, logically accurate syllabus question templates
export const BOARD_SUBJECT_BANK: BoardSubjectConfig[] = [
  // ==========================================
  // --- SSC SUBJECTS ---
  // ==========================================
  {
    academicLevel: 'ssc',
    subjectName: 'SSC General Mathematics',
    nameBn: 'সাধারণ গণিত',
    stream: 'common',
    durationMinutes: 30,
    totalMarks: 30,
    questions: [
      {
        questionText: 'A = {1, 2, 3} এবং B = {2, 3, 4} হলে A ∩ B এর মান কোনটি?',
        optionA: '{1, 4}',
        optionB: '{2, 3}',
        optionC: '{1, 2, 3, 4}',
        optionD: '∅',
        correctOption: 'b',
        explanation: 'উভয় সেটের সাধারণ উপাদান হলো ২ এবং ৩। অতএব A ∩ B = {2, 3}।',
      },
      {
        questionText: 'একটি বৃত্তের ব্যাসার্ধ 7 সেমি হলে তার পরিধি কত সেমি? (π = 22/7)',
        optionA: '২২',
        optionB: '৪৪',
        optionC: '৮৮',
        optionD: '১৫৪',
        correctOption: 'b',
        explanation: 'বৃত্তের পরিধি = 2πr = 2 × (22/7) × 7 = 44 সেমি।',
      },
      {
        questionText: 'log₂ 16 এর মান কত?',
        optionA: '২',
        optionB: '৩',
        optionC: '৪',
        optionD: '৮',
        correctOption: 'c',
        explanation: '১৬ = ২⁴; সুতরাং log₂ (২⁴) = ৪ log₂ ২ = ৪।',
      },
      {
        questionText: 'x² - 5x + 6 = 0 সমীকরণের মূলদ্বয় কোনটি?',
        optionA: '1, 6',
        optionB: '2, 3',
        optionC: '-2, -3',
        optionD: '-1, 6',
        correctOption: 'b',
        explanation: '(x - 2)(x - 3) = 0 ⇒ x = 2, 3।',
      },
      {
        questionText: 'sin² 45° + cos² 45° এর মান কত?',
        optionA: '০',
        optionB: '১/২',
        optionC: '১',
        optionD: '২',
        correctOption: 'c',
        explanation: 'যেকোনো কোণ θ-এর জন্য sin²θ + cos²θ = ১।',
      },
    ],
  },
  {
    academicLevel: 'ssc',
    subjectName: 'SSC Physics',
    nameBn: 'পদার্থবিজ্ঞান',
    stream: 'science',
    durationMinutes: 25,
    totalMarks: 25,
    questions: [
      {
        questionText: 'তড়িৎ আধানের এসআই (SI) একক কোনটি?',
        optionA: 'অ্যাম্পিয়ার',
        optionB: 'ভোল্ট',
        optionC: 'কুলম্ব',
        optionD: 'ওহম',
        correctOption: 'c',
        explanation: 'তড়িৎ আধানের আন্তর্জাতিক একক কুলম্ব (Coulomb, C)।',
      },
      {
        questionText: 'শব্দ কোন ধরনের তরঙ্গ?',
        optionA: 'অনুদৈর্ঘ্য তরঙ্গ',
        optionB: 'অনুপ্রস্থ তরঙ্গ',
        optionC: 'তাড়িতচৌম্বক তরঙ্গ',
        optionD: 'স্থির তরঙ্গ',
        correctOption: 'a',
        explanation: 'শব্দ মাধ্যমের কণার কম্পনের সমান্তরালে সঞ্চালিত যান্ত্রিক অনুদৈর্ঘ্য তরঙ্গ।',
      },
      {
        questionText: 'উত্তল লেন্সের ফোকাস দূরত্ব 20 সেমি হলে এর ক্ষমতা কত ডায়োপ্টার?',
        optionA: '+5 D',
        optionB: '-5 D',
        optionC: '+2 D',
        optionD: '+0.05 D',
        correctOption: 'a',
        explanation: 'P = 1/f(মিটার) = 1/0.2 = +5 D।',
      },
      {
        questionText: 'কোন রঙের আলোর তরঙ্গদৈর্ঘ্য সবচেয়ে বেশি?',
        optionA: 'বেগুনী',
        optionB: 'নীল',
        optionC: 'সবুজ',
        optionD: 'লাল',
        correctOption: 'd',
        explanation: 'দৃশ্যমান বর্ণালীর মধ্যে লাল আলোর তরঙ্গদৈর্ঘ্য সর্বাধিক (প্রায় ৭০০ nm)।',
      },
      {
        questionText: 'রোধের এসআই একক কোনটি?',
        optionA: 'ওহম',
        optionB: 'ভোল্ট',
        optionC: 'ওয়াট',
        optionD: 'জুল',
        correctOption: 'a',
        explanation: 'বিজ্ঞানী জর্জ ওহমের নামানুসারে পরিবাহীর রোধের একক ওহম (Ω)।',
      },
    ],
  },
  {
    academicLevel: 'ssc',
    subjectName: 'SSC Accounting',
    nameBn: 'হিসাববিজ্ঞান',
    stream: 'commerce',
    durationMinutes: 30,
    totalMarks: 30,
    questions: [
      {
        questionText: 'আধুনিক হিসাববিজ্ঞানের মূল সমীকরণ কোনটি?',
        optionA: 'A = L + E',
        optionB: 'A = L - E',
        optionC: 'L = A + E',
        optionD: 'E = A + L',
        correctOption: 'a',
        explanation: 'সম্পদ = দায় + মালিকানাস্বত্ব অর্থাৎ Assets (A) = Liabilities (L) + Equity (E)।',
      },
      {
        questionText: 'হিসাব চক্রের প্রথম ধাপ কোনটি?',
        optionA: 'জাবেদাভুক্তকরণ',
        optionB: 'লেনদেন শনাক্তকরণ',
        optionC: 'খতিয়ানভুক্তকরণ',
        optionD: 'রেওয়ামিল প্রস্তুতকরণ',
        correctOption: 'b',
        explanation: 'হিসাব চক্রের প্রথম ধাপ হলো আর্থিক লেনদেন সঠিকভাবে শনাক্ত করা।',
      },
      {
        questionText: 'কোনটি অনগদ লেনদেনের উদাহরণ?',
        optionA: 'পণ্য ক্রয়',
        optionB: 'আসবাবপত্রের অবচয়',
        optionC: 'বেতন প্রদান',
        optionD: 'ব্যাংক জমা',
        correctOption: 'b',
        explanation: 'স্থায়ী সম্পত্তির ব্যবহারজনিত অবচয় (Depreciation) একটি অনগদ লেনদেন।',
      },
      {
        questionText: 'রেওয়ামিল প্রস্তুতের মূল উদ্দেশ্য কী?',
        optionA: 'লাভ-ক্ষতি নির্ণয়',
        optionB: 'গাণিতিক নির্ভুলতা যাচাই',
        optionC: 'আর্থিক অবস্থা প্রকাশ',
        optionD: 'নগদ উদ্বৃত্ত জানা',
        correctOption: 'b',
        explanation: 'খতিয়ানের জেরগুলোর ডেবিট ও ক্রেডিট সমান হয়েছে কি না বা গাণিতিক শুদ্ধতা যাচাই করাই এর উদ্দেশ্য।',
      },
      {
        questionText: 'সম্পদ বৃদ্ধি পেলে কী হয়?',
        optionA: 'ডেবিট',
        optionB: 'ক্রেডিট',
        optionC: 'উদ্বৃত্ত বাড়ে না',
        optionD: 'শূন্য হয়',
        correctOption: 'a',
        explanation: 'দুতরফা দাখিলার নিয়ম অনুযায়ী সম্পদ বাড়লে ডেবিট, কমলে ক্রেডিট।',
      },
    ],
  },
  {
    academicLevel: 'ssc',
    subjectName: 'SSC Geography & Environment',
    nameBn: 'ভূগোল ও পরিবেশ',
    stream: 'humanities',
    durationMinutes: 25,
    totalMarks: 25,
    questions: [
      {
        questionText: 'সৌরজগতের বৃহত্তম গ্রহ কোনটি?',
        optionA: 'বুধ',
        optionB: 'শনি',
        optionC: 'বৃহস্পতি',
        optionD: 'মঙ্গল',
        correctOption: 'c',
        explanation: 'সৌরজগতের সবচেয়ে বড় গ্রহ হলো বৃহস্পতি (Jupiter)।',
      },
      {
        serialNumber: 2,
        questionText: 'বাংলাদেশের জলবায়ু প্রধানত কোন প্রকৃতির?',
        optionA: 'উষ্ণ নাতিশীতোষ্ণ',
        optionB: 'ক্রান্তীয় মৌসুমী জলবায়ু',
        optionC: 'ভূমধ্যসাগরীয়',
        optionD: 'মরুজ জলবায়ু',
        correctOption: 'b',
        explanation: 'কর্কটক্রান্তি রেখা অতিক্রম করায় ও মৌসুমী বায়ুর প্রভাবে বাংলাদেশের জলবায়ু ক্রান্তীয় মৌসুমী।',
      },
      {
        questionText: 'বাংলাদেশের একমাত্র প্রবাল দ্বীপ কোনটি?',
        optionA: 'সন্দ্বীপ',
        optionB: 'হাতিয়া',
        optionC: 'সেন্টমার্টিন',
        optionD: 'মহেশখালী',
        correctOption: 'c',
        explanation: 'সেন্টমার্টিন বাংলাদেশের একমাত্র প্রবাল প্রাচীরযুক্ত সামুদ্রিক দ্বীপ।',
      },
      {
        questionText: 'গ্রিনহাউস গ্যাসের প্রধান উপাদান কোনটি?',
        optionA: 'কার্বন ডাই-অক্সাইড (CO₂)',
        optionB: 'অক্সিজেন',
        optionC: 'নাইট্রোজেন',
        optionD: 'হিলিয়াম',
        correctOption: 'a',
        explanation: 'বৈশ্বিক উষ্ণায়ন ও গ্রিনহাউস প্রভাব সৃষ্টিকারী প্রধান গ্যাস কার্বন ডাই-অক্সাইড।',
      },
      {
        questionText: 'পৃথিবীর আহ্নিক গতির কারণে কী সংঘটিত হয়?',
        optionA: 'দিন ও রাত',
        optionB: 'ঋতু পরিবর্তন',
        optionC: 'সূর্যগ্রহণ',
        optionD: 'বছর গণনা',
        correctOption: 'a',
        explanation: 'নিজ মেরুদণ্ডের ওপর ২৪ ঘণ্টার আহ্নিক ঘূর্ণনের ফলে দিন ও রাতের সৃষ্টি হয়।',
      },
    ],
  },

  // ==========================================
  // --- HSC SUBJECTS ---
  // ==========================================
  {
    academicLevel: 'hsc',
    subjectName: 'Physics 1st Paper',
    nameBn: 'পদার্থবিজ্ঞান ১ম পত্র',
    stream: 'science',
    durationMinutes: 25,
    totalMarks: 25,
    questions: [
      {
        questionText: 'দুটি ভেক্টর A ও B পরস্পর সমান্তরাল হলে তাদের ক্রস গুণফল কত?',
        optionA: '০ (শূন্য)',
        optionB: '|A||B|',
        optionC: '১',
        optionD: '-১',
        correctOption: 'a',
        explanation: 'সমান্তরাল ভেক্টরের কোণ θ = 0° হওয়ায় sin 0° = 0, তাই A × B = 0।',
      },
      {
        questionText: 'পৃথিবীপৃষ্ঠ হতে কোনো বস্তুর মুক্তিবেগের মান কত?',
        optionA: '9.8 km/s',
        optionB: '11.2 km/s',
        optionC: '7.9 km/s',
        optionD: '11.2 m/s',
        correctOption: 'b',
        explanation: 'মুক্তিবেগ Ve = √(2gR) ≈ 11.2 কিমি/সেকেন্ড।',
      },
      {
        questionText: 'সরল ছন্দিত স্পন্দনরত কণার সাম্যাবস্থানে কোনটির মান সর্বোচ্চ?',
        optionA: 'গতিশক্তি',
        optionB: 'বিভব শক্তি',
        optionC: 'ত্বরণ',
        optionD: 'সরণ',
        correctOption: 'a',
        explanation: 'সাম্যাবস্থানে বেগ v সর্বোচ্চ হওয়ায় গতিশক্তি Ek = 1/2 mv² সর্বোচ্চ।',
      },
      {
        questionText: 'আদর্শ গ্যাসের অণুগুলোর গড় গতিশক্তি কিসের সমানুপাতিক?',
        optionA: 'পরম তাপমাত্রা (T)',
        optionB: 'চাপ (P)',
        optionC: 'আয়তন (V)',
        optionD: 'ঘনত্ব (ρ)',
        correctOption: 'a',
        explanation: 'গ্যাসের গতিশক্তি E = 3/2 RT, অর্থাৎ গতিশক্তি পরম তাপমাত্রা T এর সমানুপাতিক।',
      },
      {
        questionText: 'কোন তাপমাত্রায় সেলসিয়াস ও ফারেনহাইট স্কেলে একই পাঠ প্রদর্শন করে?',
        optionA: '-40°',
        optionB: '0°',
        optionC: '40°',
        optionD: '100°',
        correctOption: 'a',
        explanation: 'C/5 = (F - 32)/9 এ C = F বসালে ফলাফল পাওয়া যায় -40°।',
      },
    ],
  },
  {
    academicLevel: 'hsc',
    subjectName: 'Accounting 1st Paper',
    nameBn: 'হিসাববিজ্ঞান ১ম পত্র',
    stream: 'commerce',
    durationMinutes: 30,
    totalMarks: 30,
    questions: [
      {
        questionText: 'ব্যবসায়ের সকল খরচ ও ক্ষতি কোন ধরনের হিসাব?',
        optionA: 'নামিক বা নামমাত্র হিসাব',
        optionB: 'ব্যক্তিবাচক হিসাব',
        optionC: 'সম্পত্তিবাচক হিসাব',
        optionD: 'দায়বাচক হিসাব',
        correctOption: 'a',
        explanation: 'ব্যবসায়ের আয়, ব্যয় ও ক্ষতি সম্পর্কিত হিসাবকে নামিক বা নামমাত্র হিসাব বলে।',
      },
      {
        questionText: 'স্থায়ী সম্পত্তির সরলরৈখিক পদ্ধতিতে অবচয়ের ক্ষেত্রে কোনটি সত্য?',
        optionA: 'প্রতি বছর অবচয়ের পরিমাণ সমান থাকে',
        optionB: 'প্রতি বছর অবচয়ের পরিমাণ ভিন্ন হয়',
        optionC: 'অবচয় হার বাড়ে',
        optionD: 'কোনো অবচয় ধার্য হয় না',
        correctOption: 'a',
        explanation: 'সরলরৈখিক পদ্ধতিতে আয়ুষ্কাল জুড়ে প্রতি বছর সমপরিমাণ অবচয় ধার্য করা হয়।',
      },
      {
        questionText: 'অগ্রিম প্রদত্ত বীমা সেলামি কোন জাতীয় হিসাব?',
        optionA: 'চলতি সম্পদ',
        optionB: 'চলতি দায়',
        optionC: 'ব্যয় হিসাব',
        optionD: 'মালিকানাস্বত্ব',
        correctOption: 'a',
        explanation: 'অগ্রিম প্রদত্ত খরচ থেকে ভবিষ্যতে সুবিধা পাওয়া যায় বিধায় এটি প্রতিষ্ঠানের চলতি সম্পদ।',
      },
      {
        questionText: 'অনুপার্জিত আয় প্রতিষ্ঠানের জন্য কী?',
        optionA: 'সম্পদ',
        optionB: 'চলতি দায়',
        optionC: 'মুনাফা',
        optionD: 'ব্যয়',
        correctOption: 'b',
        explanation: 'সেবা প্রদানের পূর্বে অগ্রিম প্রাপ্ত অর্থ অর্জিত না হওয়া পর্যন্ত চলতি দায়।',
      },
      {
        questionText: 'কুঋণ বা অনাদায়ী পাওনা সঞ্চিতি কোন হিসাবের বিপরীতে তৈরি হয়?',
        optionA: 'প্রাপ্য হিসাব (দেনাদার)',
        optionB: 'প্রদেয় হিসাব',
        optionC: 'নগদান হিসাব',
        optionD: 'ব্যাংক হিসাব',
        correctOption: 'a',
        explanation: 'দেনাদার থেকে সম্ভাব্য আদায়-অযোগ্য অর্থের ক্ষতি মেটাতে কুঋণ সঞ্চিতি রাখা হয়।',
      },
    ],
  },
  {
    academicLevel: 'hsc',
    subjectName: 'Economics 1st Paper',
    nameBn: 'অর্থনীতি ১ম পত্র',
    stream: 'humanities',
    durationMinutes: 30,
    totalMarks: 30,
    questions: [
      {
        questionText: 'অর্থনীতির মৌলিক সমস্যা কয়টি?',
        optionA: '২টি',
        optionB: '৩টি',
        optionC: '৪টি',
        optionD: '৫টি',
        correctOption: 'b',
        explanation: 'অধ্যাপক স্যামুয়েলসনের মতে ৩টি মৌলিক সমস্যা: কী, কীভাবে এবং কার জন্য উৎপাদন করতে হবে।',
      },
      {
        questionText: 'চাহিদা রেখা সাধারণত কোন দিকে ঢালু হয়?',
        optionA: 'বাম থেকে ডানে নিম্নগামী',
        optionB: 'বাম থেকে ডানে ঊর্ধ্বগামী',
        optionC: 'উলম্ব রেখা',
        optionD: 'আনুভূমিক রেখা',
        correctOption: 'a',
        explanation: 'দাম ও চাহিদার বিপরীতমুখী সম্পর্কের কারণে চাহিদা রেখা বাম থেকে ডানে নিম্নগামী হয়।',
      },
      {
        questionText: 'মোট উপযোগ যখন সর্বোচ্চ হয়, তখন প্রান্তিক উপযোগ (MU) কত হয়?',
        optionA: 'সর্বোচ্চ',
        optionB: '০ (শূন্য)',
        optionC: 'ঋণাত্মক',
        optionD: '১',
        correctOption: 'b',
        explanation: 'ক্রমহ্রাসমান প্রান্তিক উপযোগ বিধিতে TU সর্বোচ্চ হলে MU শূন্য হয়।',
      },
      {
        questionText: 'উৎপাদনের মৌলিক উপাদান কয়টি?',
        optionA: '৩টি',
        optionB: '৪টি',
        optionC: '৫টি',
        optionD: '৬টি',
        correctOption: 'b',
        explanation: 'উৎপাদনের প্রধান ৪টি উপাদান: ভূমি, শ্রম, মূলধন ও সংগঠন।',
      },
      {
        questionText: 'একচেটিয়া বাজারে ফার্মের ভারসাম্য বিন্দুতে কোনটি সমান হতে হয়?',
        optionA: 'MR = MC',
        optionB: 'AR = AC',
        optionC: 'P = MC',
        optionD: 'TR = TC',
        correctOption: 'a',
        explanation: 'ফার্মের মুনাফা সর্বোচ্চকরণের ভারসাম্য শর্ত হলো MR = MC।',
      },
    ],
  },
  {
    academicLevel: 'hsc',
    subjectName: 'Bangla 1st Paper',
    nameBn: 'বাংলা ১ম পত্র',
    stream: 'common',
    durationMinutes: 30,
    totalMarks: 30,
    questions: [
      {
        questionText: '‘অপরিচিতা’ গল্পে কল্যাণীর বাবার নাম কী?',
        optionA: 'শম্ভুনাথ সেন',
        optionB: 'হরিশ',
        optionC: 'অনুপম',
        optionD: 'বিনু দাদা',
        correctOption: 'a',
        explanation: 'রবীন্দ্রনাথ ঠাকুরের ‘অপরিচিতা’ গল্পের বলিষ্ঠ পিতার নাম শম্ভুনাথ সেন।',
      },
      {
        questionText: '‘আমার পথ’ প্রবন্ধে কাজী নজরুল ইসলাম নিজেকে কার অভিশাপগ্রাহী বলেছেন?',
        optionA: 'সত্যের',
        optionB: 'ভণ্ডের',
        optionC: 'সমাজের',
        optionD: 'ধর্মের',
        correctOption: 'a',
        explanation: 'নজরুলের ঘোষণা: "আমি সত্যের অভিশাপগ্রাহী—মিথ্যার জয়গান আমার নয়।"',
      },
      {
        questionText: '‘বায়ান্নর দিনগুলো’ কার আত্মজীবনীমূলক গ্রন্থ থেকে সংকলিত?',
        optionA: 'বঙ্গবন্ধু শেখ মুজিবুর রহমান',
        optionB: 'মওলানা ভাসানী',
        optionC: 'তাজউদ্দীন আহমদ',
        optionD: 'শেরে বাংলা',
        correctOption: 'a',
        explanation: 'বঙ্গবন্ধুর অমর ‘অসমাপ্ত আত্মজীবনী’ গ্রন্থ থেকে ১৯৫২ সালের স্মৃতিচারণটি সংকলিত।',
      },
      {
        questionText: '‘বিভীষণের প্রতি মেঘনাদ’ কাব্যাংশটি কোন মহাকাব্যের অংশ?',
        optionA: 'মেঘনাদবধ কাব্য (ষষ্ঠ সর্গ)',
        optionB: 'তিলোত্তমাসম্ভব কাব্য',
        optionC: 'বীরাঙ্গনা কাব্য',
        optionD: 'ব্রজাঙ্গনা কাব্য',
        correctOption: 'a',
        explanation: 'মাইকেল মধুসূদন দত্তের কালজয়ী ‘মেঘনাদবধ কাব্য’-এর ষষ্ঠ সর্গ থেকে গৃহীত।',
      },
      {
        questionText: '‘লালসালু’ উপন্যাসে মজিদের দ্বিতীয় স্ত্রীর নাম কী?',
        optionA: 'জমিলা',
        optionB: 'রহিমা',
        optionC: 'আমেনা বিবি',
        optionD: 'হাসুনির মা',
        correctOption: 'a',
        explanation: 'সৈয়দ ওয়ালীউল্লাহর ‘লালসালু’ উপন্যাসে প্রতিবাদী কিশোরী দ্বিতীয় স্ত্রীর নাম জমিলা।',
      },
    ],
  },
];

export async function runAllBoardsSeeder() {
  const client = await pool.connect();
  try {
    console.log('🚀 Starting Seeding of 8 General Boards across 2018 - 2025 for SSC & HSC...');

    let newExamsCreated = 0;
    let newQuestionsCreated = 0;

    for (const year of TARGET_YEARS) {
      for (const subjectCfg of BOARD_SUBJECT_BANK) {
        // Resolve subject in DB
        const subRes = await client.query(
          `SELECT id, name_bn FROM subjects WHERE name = $1 AND academic_level = $2 LIMIT 1`,
          [subjectCfg.subjectName, subjectCfg.academicLevel]
        );

        if (subRes.rowCount === 0) {
          console.warn(`Subject not found in DB: ${subjectCfg.subjectName}`);
          continue;
        }

        const subjectId = subRes.rows[0].id;

        // Seed across all 8 education boards
        for (const board of GENERAL_BOARDS) {
          const examTitle = `${subjectCfg.academicLevel.toUpperCase()} ${year}: ${subjectCfg.nameBn} (${board.nameBn})`;

          // Check if exam already exists
          const existingExam = await client.query(
            `SELECT id FROM exams WHERE subject_id = $1 AND exam_year = $2 AND board_name = $3 LIMIT 1`,
            [subjectId, year, board.nameBn]
          );

          let examId: string;
          if (existingExam.rowCount && existingExam.rowCount > 0) {
            examId = existingExam.rows[0].id;
            // Update metadata to ensure consistency
            await client.query(
              `UPDATE exams
               SET title = $1, duration_minutes = $2, total_marks = $3, negative_mark = 0.25,
                   is_published = TRUE, exam_type = 'board_question', board_name = $4, exam_year = $5,
                   academic_level = $6, curriculum_version = 'bangla'
               WHERE id = $7`,
              [
                examTitle,
                subjectCfg.durationMinutes,
                subjectCfg.totalMarks,
                board.nameBn,
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
               VALUES ($1, $2, 1, $3, $4, 0.25, $5, TRUE, 'bangla', $6, 'board_question', $7, $8)
               RETURNING id`,
              [
                subjectId,
                examTitle,
                subjectCfg.durationMinutes,
                subjectCfg.totalMarks,
                `প্রতিটি সঠিক উত্তরের জন্য ১ নম্বর। প্রতিটি ভুল উত্তরের জন্য ০.২৫ নম্বর কাটা যাবে। সময় ${subjectCfg.durationMinutes} মিনিট।`,
                subjectCfg.academicLevel,
                board.nameBn,
                year,
              ]
            );
            examId = insertExam.rows[0].id;
            newExamsCreated++;
          }

          // Insert questions safely
          let qIdx = 1;
          for (const q of subjectCfg.questions) {
            const qCheck = await client.query(
              `SELECT id FROM questions WHERE exam_id = $1 AND serial_number = $2`,
              [examId, qIdx]
            );

            if (qCheck.rowCount === 0) {
              await client.query(
                `INSERT INTO questions (
                   exam_id, question_text, option_a, option_b, option_c, option_d,
                   correct_option, explanation, serial_number
                 )
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                [
                  examId,
                  q.questionText,
                  q.optionA,
                  q.optionB,
                  q.optionC,
                  q.optionD,
                  q.correctOption,
                  q.explanation,
                  qIdx,
                ]
              );
              newQuestionsCreated++;
            }
            qIdx++;
          }
        }
      }
    }

    console.log(`✅ Seeder completed! Created ${newExamsCreated} board exams, populated ${newQuestionsCreated} questions across all 8 boards.`);
  } catch (err) {
    console.error('Error during all-boards seeding:', err);
    throw err;
  } finally {
    client.release();
  }
}

if (process.argv[1]?.endsWith('seed_all_boards_questions.ts')) {
  runAllBoardsSeeder()
    .then(() => {
      console.log('All boards seeder done!');
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

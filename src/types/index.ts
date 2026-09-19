export type CurriculumVersion = 'bangla' | 'english' | 'british' | 'cambridge' | 'ib';
export type AcademicLevel = 'hsc' | 'ssc' | 'olevel' | 'alevel' | 'igcse' | 'myp' | 'dp';

export interface Profile {
  id: string;
  fullName: string;
  email: string;
  role: 'student' | 'admin';
  isVerified?: boolean;
  curriculumVersion?: CurriculumVersion | null;
  academicLevel?: AcademicLevel | null;
  stream?: 'science' | 'commerce' | 'humanities' | 'common' | 'optional' | null;
  phone?: string | null;
  institution?: string | null;
  isSubscribed?: boolean;
  subscriptionStatus?: string;
  subscriptionCurriculum?: string;
  createdAt: any;
}

export interface Subject {
  id: string;
  name: string;
  nameBn: string;
  icon: string;
  isActive: boolean;
  unlockPrice?: number;
  curriculumVersion?: CurriculumVersion | 'both' | string;
  academicLevel?: AcademicLevel | string;
  stream?: 'science' | 'commerce' | 'humanities' | 'common' | 'optional' | string;
  chapterCount?: number;
  examCount?: number;
  createdAt: any;
}

export interface PaymentSettings {
  id: string;
  bkashNumber: string;
  bkashAccountName?: string;
  nagadNumber: string;
  nagadAccountName?: string;
  priceBangla: number;
  priceEnglish: number;
  priceBritish: number;
  priceIb: number;
  originalPriceBangla?: number;
  originalPriceEnglish?: number;
  originalPriceBritish?: number;
  originalPriceIb?: number;
  discountTitle?: string;
  discountExpiresAt?: string | null;
  discountActive?: boolean;
  paymentInstructions?: string;
  updatedAt?: any;
}

export interface UserSubscriptionStatus {
  isSubscribed: boolean;
  subscriptionStatus: 'free' | 'pending' | 'active' | 'expired';
  subscriptionCurriculum: CurriculumVersion;
  curriculumVersion: CurriculumVersion;
  examsTakenCount: number;
  totalAttempts: number;
  freeLimit: number;
  freeTestsUsed: number;
  freeTestsRemaining: number;
  canTakeExam: boolean;
  pendingPayment?: {
    id: string;
    amount: number;
    currency: string;
    gateway: string;
    senderNumber: string;
    transactionId: string;
    status: string;
    createdAt: string;
  } | null;
}

export interface Chapter {
  id: string;
  subjectId: string;
  chapterNumber: number;
  title: string;
  titleBn: string;
  description?: string;
  serialNumber?: number;
  examCount?: number;
}

export interface Exam {
  id: string;
  subjectId: string;
  chapterId?: string;
  title: string;
  serialNumber: number;
  durationMinutes: number;
  totalMarks: number;
  negativeMark: number;
  instructions: string;
  isPublished: boolean;
  curriculumVersion?: CurriculumVersion | 'both';
  academicLevel?: AcademicLevel;
  examType?: 'model_test' | 'board_question' | 'chapter_test';
  boardName?: string;
  examYear?: number;
  subjectNameBn?: string;
  subjectName?: string;
  subjectStream?: string;
  chapterTitle?: string;
  chapterTitleBn?: string;
  chapterNumber?: number;
  createdAt: any;
}

export interface Question {
  id: string;
  examId: string;
  stimulus?: string;
  uddipok?: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: 'a' | 'b' | 'c' | 'd';
  explanation: string;
  serialNumber: number;
  createdAt: any;
}

export interface Attempt {
  id: string;
  studentId: string;
  examId: string;
  startedAt: any;
  submittedAt?: any;
  score?: number;
  totalAttempted?: number;
  correctCount?: number;
  wrongCount?: number;
  status: 'ongoing' | 'completed';
}

export interface AttemptAnswer {
  id: string;
  attemptId: string;
  questionId: string;
  studentId: string;
  selectedOption: 'a' | 'b' | 'c' | 'd' | null;
  isCorrect?: boolean;
}

export interface SubjectAccess {
  id: string;
  subjectId: string;
  gateway: 'bkash';
  status: 'active';
  amount: number;
  currency: 'BDT';
  paymentID: string;
  trxID?: string;
  merchantInvoiceNumber: string;
  paymentMethod?: 'gateway' | 'manual';
  unlockedAt: any;
  updatedAt?: any;
}

export interface PaymentSession {
  id: string;
  userId: string;
  subjectId: string;
  subjectName: string;
  gateway: 'bkash';
  amount: number;
  currency: 'BDT';
  merchantInvoiceNumber: string;
  status: 'creating' | 'pending' | 'completed' | 'failed' | 'cancelled';
  bkashPaymentID?: string;
  bkashURL?: string;
  callbackURL?: string;
  callbackStatus?: 'success' | 'failure' | 'cancel';
  transactionStatus?: string;
  trxID?: string;
  createdAt: any;
  updatedAt?: any;
  finalizedAt?: any;
}

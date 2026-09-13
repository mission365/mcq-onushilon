export interface Profile {
  id: string;
  fullName: string;
  email: string;
  role: 'student' | 'admin';
  createdAt: any;
}

export interface Subject {
  id: string;
  name: string;
  nameBn: string;
  icon: string;
  isActive: boolean;
  unlockPrice?: number;
  createdAt: any;
}

export interface PaymentSettings {
  id: string;
  bkashNumber: string;
  bkashAccountName?: string;
  paymentInstructions?: string;
  updatedAt?: any;
}

export interface Exam {
  id: string;
  subjectId: string;
  title: string;
  serialNumber: number;
  durationMinutes: number;
  totalMarks: number;
  negativeMark: number;
  instructions: string;
  isPublished: boolean;
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

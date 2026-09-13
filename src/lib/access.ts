import { Exam, Subject } from '../types';

export const FREE_MODEL_TEST_LIMIT = 3;
export const DEFAULT_SUBJECT_UNLOCK_PRICE = 299;

export const isFreeExam = (exam: Pick<Exam, 'serialNumber'>) => exam.serialNumber <= FREE_MODEL_TEST_LIMIT;

export const getSubjectUnlockPrice = (subject?: Pick<Subject, 'unlockPrice'> | null) => {
  if (typeof subject?.unlockPrice === 'number' && subject.unlockPrice > 0) {
    return subject.unlockPrice;
  }

  return DEFAULT_SUBJECT_UNLOCK_PRICE;
};

export const canAccessExam = (
  exam: Pick<Exam, 'serialNumber' | 'subjectId'>,
  hasSubjectAccess: boolean,
) => isFreeExam(exam) || hasSubjectAccess;

export const formatBdt = (amount: number) =>
  new Intl.NumberFormat('en-BD', {
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);

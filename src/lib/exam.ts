import { Exam } from '../types';

type LooseExamRecord = Partial<Exam>;

const toBoolean = (value: unknown) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    return normalized === 'true' || normalized === 'published' || normalized === 'active';
  }

  return false;
};

const toNumber = (value: unknown, fallback = 0) => {
  if (typeof value === 'number' && !Number.isNaN(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (!Number.isNaN(parsed)) return parsed;
  }

  return fallback;
};

export const getExamSubjectId = (exam: LooseExamRecord) => {
  const record = exam as Partial<Exam> & Record<string, unknown>;
  const subjectId = record.subjectId ?? record.subject_id ?? record.subject;
  return typeof subjectId === 'string' ? subjectId : '';
};

export const isExamPublished = (exam: LooseExamRecord) =>
  toBoolean(
    (exam as Partial<Exam> & Record<string, unknown>).isPublished ??
      (exam as Partial<Exam> & Record<string, unknown>).is_published ??
      (exam as Partial<Exam> & Record<string, unknown>).published ??
      (exam as Partial<Exam> & Record<string, unknown>).active,
  );

export const normalizeExam = (exam: LooseExamRecord): Exam => ({
  id: typeof exam.id === 'string' ? exam.id : '',
  subjectId: getExamSubjectId(exam),
  title: typeof exam.title === 'string' ? exam.title : 'Untitled Exam',
  serialNumber: toNumber(
    exam.serialNumber ??
      (exam as Partial<Exam> & Record<string, unknown>).serial_number ??
      (exam as Partial<Exam> & Record<string, unknown>).serial ??
      (exam as Partial<Exam> & Record<string, unknown>).examNo,
    0,
  ),
  durationMinutes: toNumber(
    exam.durationMinutes ??
      (exam as Partial<Exam> & Record<string, unknown>).duration_minutes ??
      (exam as Partial<Exam> & Record<string, unknown>).duration ??
      (exam as Partial<Exam> & Record<string, unknown>).timeLimit,
    0,
  ),
  totalMarks: toNumber(
    exam.totalMarks ??
      (exam as Partial<Exam> & Record<string, unknown>).total_marks ??
      (exam as Partial<Exam> & Record<string, unknown>).marks ??
      (exam as Partial<Exam> & Record<string, unknown>).total,
    0,
  ),
  negativeMark: toNumber(
    exam.negativeMark ??
      (exam as Partial<Exam> & Record<string, unknown>).negative_mark ??
      (exam as Partial<Exam> & Record<string, unknown>).negative ??
      0.25,
    0.25,
  ),
  instructions: typeof exam.instructions === 'string' ? exam.instructions : '',
  isPublished: isExamPublished(exam),
  createdAt: exam.createdAt ?? (exam as Partial<Exam> & Record<string, unknown>).created_at ?? null,
});

import { Question } from '../types';

export type AnswerOption = 'a' | 'b' | 'c' | 'd';
export type QuestionLookup = Question & Record<string, unknown>;

const findValueByAliases = (
  source: Record<string, unknown>,
  aliases: string[],
) => {
  const entry = Object.entries(source).find(([key]) =>
    aliases.some((alias) => alias.toLowerCase() === key.toLowerCase()),
  );

  return entry ? entry[1] : undefined;
};

const toTrimmedString = (value: unknown) => (
  typeof value === 'string' ? value.trim() : ''
);

export const getQuestionStimulus = (question: QuestionLookup) => {
  const value = findValueByAliases(question, [
    'stimulus',
    'uddipok',
    'udipok',
    'উদ্দীপক',
    'passage',
    'context',
    'stem',
    'questionStem',
  ]);

  return toTrimmedString(value);
};

export const getOptionText = (question: QuestionLookup, option: AnswerOption) => {
  const directOptions: Record<AnswerOption, string | undefined> = {
    a: question.optionA,
    b: question.optionB,
    c: question.optionC,
    d: question.optionD,
  };

  const directValue = directOptions[option];
  if (typeof directValue === 'string' && directValue.trim() !== '') {
    return directValue;
  }

  const upper = option.toUpperCase();
  const lower = option.toLowerCase();
  const num = option === 'a' ? '1' : option === 'b' ? '2' : option === 'c' ? '3' : '4';

  const patterns = [
    `option${upper}`,
    `option${lower}`,
    `option_${lower}`,
    `option_${upper}`,
    `opt${upper}`,
    `opt${lower}`,
    `opt_${lower}`,
    `opt_${upper}`,
    `option${num}`,
    `option_${num}`,
    `opt${num}`,
    `opt_${num}`,
    lower,
    upper,
    `choice${upper}`,
    `choice${lower}`,
  ];

  for (const pattern of patterns) {
    const value = question[pattern];
    if (typeof value === 'string' && value.trim() !== '') {
      return value;
    }
  }

  const foundKey = Object.keys(question).find((key) => {
    const keyLower = key.toLowerCase();
    return keyLower === `option${lower}` ||
      keyLower === `option${num}` ||
      keyLower === `opt${lower}` ||
      keyLower === `opt${num}` ||
      keyLower.endsWith(`option${lower}`) ||
      keyLower.endsWith(`option${num}`);
  });

  const fallbackValue = foundKey ? question[foundKey] : '';
  return typeof fallbackValue === 'string' ? fallbackValue : '';
};

export { findValueByAliases };

import type {
  DailyLessonQuizQuestion,
  DailyLessonSentence,
  DailyLessonWord,
  EnglishLesson,
  LessonCategory,
  LessonGrammar,
  UserLevel,
} from '@/types';

export type LessonValidationIssue = {
  lessonId: string;
  field: string;
  message: string;
};

export type LessonValidationResult = {
  validLessons: EnglishLesson[];
  issues: LessonValidationIssue[];
};

export const validLessonCategories: readonly LessonCategory[] = [
  'daily_work',
  'work_dialogue',
  'business_english',
];

export const validLessonLevels: readonly UserLevel[] = [
  'basic_review',
  'work_communication',
  'listening_speaking',
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isPositiveNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

function isLessonCategory(value: unknown): value is LessonCategory {
  return validLessonCategories.includes(value as LessonCategory);
}

function isUserLevel(value: unknown): value is UserLevel {
  return validLessonLevels.includes(value as UserLevel);
}

function countValues(values: string[]) {
  return values.reduce<Record<string, number>>((counts, value) => {
    counts[value] = (counts[value] ?? 0) + 1;
    return counts;
  }, {});
}

function createIssue(lessonId: string, field: string, message: string): LessonValidationIssue {
  return {
    lessonId,
    field,
    message,
  };
}

function warnIssues(issues: LessonValidationIssue[]) {
  issues.forEach((issue) => {
    console.warn(
      `[lessons.json] lesson "${issue.lessonId}" field "${issue.field}": ${issue.message}`
    );
  });
}

function validateStringArray(
  value: unknown,
  lessonId: string,
  field: string,
  issues: LessonValidationIssue[]
): string[] | null {
  if (!Array.isArray(value)) {
    issues.push(createIssue(lessonId, field, 'must be an array of strings'));
    return null;
  }

  const strings = value.filter(isNonEmptyString);

  if (strings.length !== value.length) {
    issues.push(createIssue(lessonId, field, 'contains empty or non-string values'));
    return null;
  }

  return strings;
}

function validateWords(
  value: unknown,
  lessonId: string,
  duplicateWordIds: Record<string, number>,
  issues: LessonValidationIssue[]
): DailyLessonWord[] | null {
  if (!Array.isArray(value)) {
    issues.push(createIssue(lessonId, 'words', 'must be an array'));
    return null;
  }

  if (value.length === 0) {
    issues.push(createIssue(lessonId, 'words', 'lesson must have at least one word'));
    return null;
  }

  const words: DailyLessonWord[] = [];

  value.forEach((item, index) => {
    const fieldPrefix = `words[${index}]`;

    if (!isRecord(item)) {
      issues.push(createIssue(lessonId, fieldPrefix, 'must be an object'));
      return;
    }

    const requiredFields = ['id', 'english', 'pronunciation', 'meaningVi', 'example'] as const;
    const missingField = requiredFields.find((field) => !isNonEmptyString(item[field]));

    if (missingField) {
      issues.push(createIssue(lessonId, `${fieldPrefix}.${missingField}`, 'is required'));
      return;
    }

    const id = item.id as string;
    const english = item.english as string;
    const pronunciation = item.pronunciation as string;
    const meaningVi = item.meaningVi as string;
    const example = item.example as string;

    if (duplicateWordIds[id] > 1) {
      issues.push(createIssue(lessonId, `${fieldPrefix}.id`, `duplicate word id "${id}"`));
      return;
    }

    words.push({
      id,
      english,
      pronunciation,
      meaningVi,
      example,
    });
  });

  return words.length === value.length ? words : null;
}

function validateSentences(
  value: unknown,
  lessonId: string,
  issues: LessonValidationIssue[]
): DailyLessonSentence[] | null {
  if (!Array.isArray(value)) {
    issues.push(createIssue(lessonId, 'sentences', 'must be an array'));
    return null;
  }

  const sentences: DailyLessonSentence[] = [];

  value.forEach((item, index) => {
    const fieldPrefix = `sentences[${index}]`;

    if (!isRecord(item)) {
      issues.push(createIssue(lessonId, fieldPrefix, 'must be an object'));
      return;
    }

    if (!isNonEmptyString(item.english)) {
      issues.push(createIssue(lessonId, `${fieldPrefix}.english`, 'is required'));
      return;
    }

    if (!isNonEmptyString(item.meaningVi)) {
      issues.push(createIssue(lessonId, `${fieldPrefix}.meaningVi`, 'is required'));
      return;
    }

    sentences.push({
      id: isNonEmptyString(item.id) ? item.id : undefined,
      english: item.english,
      meaningVi: item.meaningVi,
    });
  });

  return sentences.length === value.length ? sentences : null;
}

function validateGrammar(
  value: unknown,
  lessonId: string,
  issues: LessonValidationIssue[]
): LessonGrammar | null {
  if (!isRecord(value)) {
    issues.push(createIssue(lessonId, 'grammar', 'must be an object'));
    return null;
  }

  if (!isNonEmptyString(value.title)) {
    issues.push(createIssue(lessonId, 'grammar.title', 'is required'));
    return null;
  }

  if (!isNonEmptyString(value.explanationVi)) {
    issues.push(createIssue(lessonId, 'grammar.explanationVi', 'is required'));
    return null;
  }

  const examples = validateStringArray(value.examples, lessonId, 'grammar.examples', issues);

  if (!examples) {
    return null;
  }

  return {
    title: value.title as string,
    explanationVi: value.explanationVi as string,
    examples,
  };
}

function validateQuiz(
  value: unknown,
  lessonId: string,
  issues: LessonValidationIssue[]
): DailyLessonQuizQuestion[] | null {
  if (!Array.isArray(value)) {
    issues.push(createIssue(lessonId, 'quiz', 'must be an array'));
    return null;
  }

  if (value.length === 0) {
    issues.push(createIssue(lessonId, 'quiz', 'lesson must have at least one quiz question'));
    return null;
  }

  const quiz: DailyLessonQuizQuestion[] = [];
  const quizIds = value
    .filter(isRecord)
    .map((item) => item.id)
    .filter(isNonEmptyString);
  const quizIdCounts = countValues(quizIds);

  value.forEach((item, index) => {
    const fieldPrefix = `quiz[${index}]`;

    if (!isRecord(item)) {
      issues.push(createIssue(lessonId, fieldPrefix, 'must be an object'));
      return;
    }

    const requiredFields = ['id', 'question', 'correctAnswer', 'explanationVi'] as const;
    const missingField = requiredFields.find((field) => !isNonEmptyString(item[field]));

    if (missingField) {
      issues.push(createIssue(lessonId, `${fieldPrefix}.${missingField}`, 'is required'));
      return;
    }

    const id = item.id as string;
    const question = item.question as string;
    const correctAnswer = item.correctAnswer as string;
    const explanationVi = item.explanationVi as string;

    if (quizIdCounts[id] > 1) {
      issues.push(createIssue(lessonId, `${fieldPrefix}.id`, `duplicate quiz id "${id}"`));
      return;
    }

    const options = validateStringArray(item.options, lessonId, `${fieldPrefix}.options`, issues);

    if (!options) {
      return;
    }

    if (!options.includes(correctAnswer)) {
      issues.push(
        createIssue(lessonId, `${fieldPrefix}.correctAnswer`, 'must match one of the options')
      );
      return;
    }

    quiz.push({
      id,
      question,
      options,
      correctAnswer,
      explanationVi,
    });
  });

  return quiz.length === value.length ? quiz : null;
}

export function validateLessons(rawLessons: unknown, logWarnings = true): LessonValidationResult {
  const issues: LessonValidationIssue[] = [];

  if (!Array.isArray(rawLessons)) {
    issues.push(createIssue('root', 'lessons', 'assets/data/lessons.json must be an array'));

    if (logWarnings) {
      warnIssues(issues);
    }

    return {
      validLessons: [],
      issues,
    };
  }

  const lessonRecords = rawLessons.filter(isRecord);
  const lessonIds = lessonRecords.map((lesson) => lesson.id).filter(isNonEmptyString);
  const lessonIdCounts = countValues(lessonIds);
  const dayNumbers = lessonRecords
    .map((lesson) => lesson.dayNumber)
    .filter((dayNumber): dayNumber is number => typeof dayNumber === 'number');
  const dayNumberCounts = countValues(dayNumbers.map(String));
  const wordIds = lessonRecords
    .flatMap((lesson) => (Array.isArray(lesson.words) ? lesson.words : []))
    .filter(isRecord)
    .map((word) => word.id)
    .filter(isNonEmptyString);
  const wordIdCounts = countValues(wordIds);
  const validLessons: EnglishLesson[] = [];

  rawLessons.forEach((item, index) => {
    const fallbackLessonId = `index-${index}`;
    const lessonIssuesStart = issues.length;

    if (!isRecord(item)) {
      issues.push(createIssue(fallbackLessonId, 'lesson', 'must be an object'));
      return;
    }

    const lessonId = isNonEmptyString(item.id) ? item.id : fallbackLessonId;

    if (!isNonEmptyString(item.id)) {
      issues.push(createIssue(lessonId, 'id', 'is required'));
    } else if (lessonIdCounts[item.id] > 1) {
      issues.push(createIssue(lessonId, 'id', `duplicate lesson id "${item.id}"`));
    }

    if (!isPositiveNumber(item.dayNumber)) {
      issues.push(createIssue(lessonId, 'dayNumber', 'must be a positive number'));
    } else if (dayNumberCounts[String(item.dayNumber)] > 1) {
      issues.push(createIssue(lessonId, 'dayNumber', `duplicate dayNumber ${item.dayNumber}`));
    }

    if (!isLessonCategory(item.category)) {
      issues.push(
        createIssue(
          lessonId,
          'category',
          `invalid category "${String(item.category)}"; expected ${validLessonCategories.join(', ')}`
        )
      );
    }

    if (!isUserLevel(item.level)) {
      issues.push(
        createIssue(
          lessonId,
          'level',
          `invalid level "${String(item.level)}"; expected ${validLessonLevels.join(', ')}`
        )
      );
    }

    const requiredTextFields = ['title', 'description'] as const;
    requiredTextFields.forEach((field) => {
      if (!isNonEmptyString(item[field])) {
        issues.push(createIssue(lessonId, field, 'is required'));
      }
    });

    if (!isPositiveNumber(item.estimatedMinutes)) {
      issues.push(createIssue(lessonId, 'estimatedMinutes', 'must be a positive number'));
    }

    const objectives = validateStringArray(item.objectives, lessonId, 'objectives', issues);
    const words = validateWords(item.words, lessonId, wordIdCounts, issues);
    const sentences = validateSentences(item.sentences, lessonId, issues);
    const grammar = validateGrammar(item.grammar, lessonId, issues);
    const quiz = validateQuiz(item.quiz, lessonId, issues);

    if (issues.length > lessonIssuesStart) {
      return;
    }

    const id = item.id as string;
    const dayNumber = item.dayNumber as number;
    const category = item.category as EnglishLesson['category'];
    const level = item.level as EnglishLesson['level'];
    const title = item.title as string;
    const description = item.description as string;
    const estimatedMinutes = item.estimatedMinutes as number;

    validLessons.push({
      id,
      dayNumber,
      category,
      level,
      title,
      description,
      estimatedMinutes,
      objectives: objectives ?? [],
      words: words ?? [],
      sentences: sentences ?? [],
      grammar: grammar ?? {
        title: '',
        explanationVi: '',
        examples: [],
      },
      grammarTip: isNonEmptyString(item.grammarTip) ? item.grammarTip : grammar?.explanationVi ?? '',
      quiz: quiz ?? [],
    });
  });

  if (logWarnings) {
    warnIssues(issues);
  }

  return {
    validLessons: validLessons.sort((firstLesson, secondLesson) => {
      return firstLesson.dayNumber - secondLesson.dayNumber;
    }),
    issues,
  };
}

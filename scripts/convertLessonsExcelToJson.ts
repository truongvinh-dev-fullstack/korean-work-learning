import fs from 'node:fs';
import path from 'node:path';

import * as XLSX from 'xlsx';

import type { EnglishLesson, LessonCategory, LessonGrammar, UserLevel } from '@/types';
import { validateLessons } from '@/utils/validateLessons';

type ExcelRow = Record<string, unknown>;

const workbookPath = path.resolve(process.cwd(), process.argv[2] ?? 'lessons.xlsx');
const outputPath = path.resolve(process.cwd(), 'assets/data/lessons.json');

const requiredSheets = ['Lessons', 'Words', 'Sentences', 'Grammar', 'Quiz'] as const;

const categoryAliases: Record<string, LessonCategory> = {
  'business-english': 'business_english',
  business_english: 'business_english',
  'daily-work': 'daily_work',
  daily_work: 'daily_work',
  'work-dialogue': 'work_dialogue',
  work_dialogue: 'work_dialogue',
  'work-english': 'business_english',
};

function asString(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  return String(value).trim();
}

function asNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  const parsedValue = Number(asString(value));
  return Number.isFinite(parsedValue) ? parsedValue : 0;
}

function splitList(value: unknown): string[] {
  return asString(value)
    .split('|')
    .map((item) => item.trim())
    .filter(Boolean);
}

function getRows(workbook: XLSX.WorkBook, sheetName: string): ExcelRow[] {
  const sheet = workbook.Sheets[sheetName];

  if (!sheet) {
    console.warn(`[convert-lessons] Missing sheet "${sheetName}".`);
    return [];
  }

  return XLSX.utils.sheet_to_json<ExcelRow>(sheet, {
    defval: '',
  });
}

function groupByLessonId(rows: ExcelRow[]) {
  return rows.reduce<Record<string, ExcelRow[]>>((groups, row) => {
    const lessonId = asString(row.lessonId);

    if (!lessonId) {
      console.warn('[convert-lessons] Skipping row without lessonId.', row);
      return groups;
    }

    groups[lessonId] = [...(groups[lessonId] ?? []), row];
    return groups;
  }, {});
}

function normalizeCorrectAnswer(row: ExcelRow, options: string[]) {
  const correctAnswer = asString(row.correctAnswer);
  const optionNumber = Number(correctAnswer);

  if (Number.isInteger(optionNumber) && optionNumber >= 1 && optionNumber <= options.length) {
    return options[optionNumber - 1];
  }

  return correctAnswer;
}

function normalizeCategory(value: unknown): LessonCategory {
  const rawCategory = asString(value);
  return categoryAliases[rawCategory] ?? (rawCategory as LessonCategory);
}

function buildScopedId(lessonId: string, value: unknown, fallbackPrefix: string, index: number) {
  const rawId = asString(value) || `${fallbackPrefix}${index + 1}`;

  if (rawId.startsWith(`${lessonId}_`)) {
    return rawId;
  }

  return `${lessonId}_${rawId}`;
}

function buildGrammar(row: ExcelRow | undefined): LessonGrammar {
  return {
    title: asString(row?.title),
    explanationVi: asString(row?.explanationVi),
    examples: splitList(row?.examples),
  };
}

function buildLessons(workbook: XLSX.WorkBook): EnglishLesson[] {
  requiredSheets.forEach((sheetName) => {
    if (!workbook.SheetNames.includes(sheetName)) {
      console.warn(`[convert-lessons] Workbook does not contain required sheet "${sheetName}".`);
    }
  });

  const lessonRows = getRows(workbook, 'Lessons');
  const wordsByLessonId = groupByLessonId(getRows(workbook, 'Words'));
  const sentencesByLessonId = groupByLessonId(getRows(workbook, 'Sentences'));
  const grammarByLessonId = groupByLessonId(getRows(workbook, 'Grammar'));
  const quizByLessonId = groupByLessonId(getRows(workbook, 'Quiz'));

  return lessonRows.map((lessonRow) => {
    const lessonId = asString(lessonRow.id);
    const grammar = buildGrammar(grammarByLessonId[lessonId]?.[0]);

    return {
      id: lessonId,
      dayNumber: asNumber(lessonRow.dayNumber),
      category: normalizeCategory(lessonRow.category),
      level: asString(lessonRow.level) as UserLevel,
      title: asString(lessonRow.title),
      description: asString(lessonRow.description),
      estimatedMinutes: asNumber(lessonRow.estimatedMinutes),
      objectives: splitList(lessonRow.objectives),
      words: (wordsByLessonId[lessonId] ?? []).map((wordRow, index) => ({
        id: buildScopedId(lessonId, wordRow.id, 'W', index),
        english: asString(wordRow.english || wordRow.korean),
        pronunciation: asString(wordRow.pronunciation),
        meaningVi: asString(wordRow.meaningVi),
        example: asString(wordRow.example),
      })),
      sentences: (sentencesByLessonId[lessonId] ?? []).map((sentenceRow) => ({
        id: asString(sentenceRow.id),
        english: asString(sentenceRow.english || sentenceRow.korean),
        meaningVi: asString(sentenceRow.meaningVi),
      })),
      grammar,
      grammarTip: grammar.explanationVi,
      quiz: (quizByLessonId[lessonId] ?? []).map((quizRow) => {
        const options = [
          asString(quizRow.option1),
          asString(quizRow.option2),
          asString(quizRow.option3),
          asString(quizRow.option4),
        ].filter(Boolean);

        return {
          id: asString(quizRow.id),
          question: asString(quizRow.question),
          options,
          correctAnswer: normalizeCorrectAnswer(quizRow, options),
          explanationVi: asString(quizRow.explanationVi),
        };
      }),
    };
  });
}

function convertLessonsExcelToJson() {
  if (!fs.existsSync(workbookPath)) {
    console.warn(`[convert-lessons] File not found: ${workbookPath}`);
    process.exitCode = 1;
    return;
  }

  const workbook = XLSX.readFile(workbookPath);
  const lessons = buildLessons(workbook);
  const result = validateLessons(lessons, true);

  if (result.issues.length > 0) {
    console.warn(
      `[convert-lessons] Found ${result.issues.length} validation issue(s). Exporting ${result.validLessons.length}/${lessons.length} valid lesson(s).`
    );
  }

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(result.validLessons, null, 2)}\n`, 'utf8');
  console.log(`[convert-lessons] Wrote ${result.validLessons.length} lesson(s) to ${outputPath}`);
}

convertLessonsExcelToJson();

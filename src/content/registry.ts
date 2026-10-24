/**
 * Content registry (Vite build). Discovers grades, topics and subtopic modules from the
 * folder structure — adding a grade only needs new files:
 *   src/content/grades.json          (add { "grade": 6, "label": "6. osztály" })
 *   src/content/grade-6/topics.json
 *   src/content/grade-6/daily.json
 *   src/content/grade-6/<topic folder>/<NN-subtopic>.ts
 */
import type { DailyConfig, GradeInfo, GradeTopics, SubtopicModule } from '../engine/types';
import gradesJson from './grades.json';
import { findSubtopic } from './catalog';

const topicFiles = import.meta.glob<GradeTopics>('./grade-*/topics.json', { eager: true, import: 'default' });
const dailyFiles = import.meta.glob<DailyConfig>('./grade-*/daily.json', { eager: true, import: 'default' });
const moduleFiles = import.meta.glob<{ default: SubtopicModule }>('./grade-*/*/*.ts');

export const GRADES: GradeInfo[] = (gradesJson as GradeInfo[]).filter((g) => topicFiles[`./grade-${g.grade}/topics.json`]);

export function getGradeTopics(grade: number): GradeTopics | undefined {
  return topicFiles[`./grade-${grade}/topics.json`];
}

export function getDailyConfig(grade: number): DailyConfig {
  return dailyFiles[`./grade-${grade}/daily.json`] ?? { subtopics: [] };
}

/** Path of a subtopic module, e.g. './grade-7/pitagorasz/01-bizonyitas-alapok.ts'. */
export function modulePath(grade: number, subtopicId: string): string | undefined {
  const g = getGradeTopics(grade);
  const f = g && findSubtopic(g, subtopicId);
  return f ? `./grade-${grade}/${f.topic.folder}/${f.sub.file}.ts` : undefined;
}

export function hasModule(grade: number, subtopicId: string): boolean {
  const p = modulePath(grade, subtopicId);
  return !!p && p in moduleFiles;
}

const loaded = new Map<string, Promise<SubtopicModule>>();

/** Lazily loads a subtopic module (code-split per lesson). */
export function loadSubtopic(grade: number, subtopicId: string): Promise<SubtopicModule> {
  const p = modulePath(grade, subtopicId);
  if (!p || !(p in moduleFiles)) return Promise.reject(new Error(`No module for ${subtopicId}`));
  let promise = loaded.get(p);
  if (!promise) {
    promise = moduleFiles[p]().then((m) => {
      if (m.default.id !== subtopicId) throw new Error(`Module ${p} exports id "${m.default.id}", expected "${subtopicId}"`);
      return m.default;
    });
    promise.catch(() => loaded.delete(p));
    loaded.set(p, promise);
  }
  return promise;
}

/** Grade number of a subtopic id like 'g7-pitagorasz-01'. */
export function gradeOfSubtopic(subtopicId: string): number | undefined {
  const m = /^g(\d+)-/.exec(subtopicId);
  return m ? Number(m[1]) : undefined;
}

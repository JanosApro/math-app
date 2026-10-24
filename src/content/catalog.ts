/**
 * Pure helpers over the catalog data (grades.json / topics.json). No Vite, no React —
 * also used by `npm run check`.
 */
import type { GradeTopics, SubtopicMeta, TopicMeta } from '../engine/types';

export interface FlatSubtopic {
  sub: SubtopicMeta;
  topic: TopicMeta;
  /** Position in the whole grade (0-based). */
  index: number;
  /** Position inside the topic (0-based). */
  indexInTopic: number;
}

export function flatten(grade: GradeTopics): FlatSubtopic[] {
  const out: FlatSubtopic[] = [];
  for (const topic of grade.topics) {
    topic.subtopics.forEach((sub, indexInTopic) => out.push({ sub, topic, index: out.length, indexInTopic }));
  }
  return out;
}

export function findSubtopic(grade: GradeTopics, id: string): FlatSubtopic | undefined {
  return flatten(grade).find((f) => f.sub.id === id);
}

/** A subtopic can be opened if it has content (status draft or done). */
export function isOpenable(sub: SubtopicMeta): boolean {
  return sub.status !== 'todo';
}

/**
 * Prerequisite subtopic ids of a subtopic:
 * - its own `prerequisites` if given;
 * - otherwise every earlier subtopic in its topic, plus every subtopic of the prerequisite
 *   topics (the topic's `prerequisites`, default: all earlier topics).
 * Subtopics without content (todo) are never prerequisites — they cannot be completed.
 */
export function prerequisitesOf(grade: GradeTopics, id: string): string[] {
  const flat = flatten(grade);
  const me = flat.find((f) => f.sub.id === id);
  if (!me) return [];
  const byId = new Map(flat.map((f) => [f.sub.id, f]));
  let ids: string[];
  if (me.sub.prerequisites) {
    ids = me.sub.prerequisites;
  } else {
    const topicIndex = grade.topics.indexOf(me.topic);
    const prereqTopics = me.topic.prerequisites
      ? grade.topics.filter((t) => me.topic.prerequisites!.includes(t.id))
      : grade.topics.slice(0, topicIndex);
    ids = [
      ...prereqTopics.flatMap((t) => t.subtopics.map((s) => s.id)),
      ...me.topic.subtopics.slice(0, me.indexInTopic).map((s) => s.id),
    ];
  }
  return ids.filter((pid) => {
    const f = byId.get(pid);
    return f !== undefined && isOpenable(f.sub) && pid !== id;
  });
}

/** Prerequisites that are not completed yet, in grade order. */
export function unmetPrerequisites(grade: GradeTopics, id: string, completed: (id: string) => boolean): FlatSubtopic[] {
  const pre = new Set(prerequisitesOf(grade, id));
  return flatten(grade).filter((f) => pre.has(f.sub.id) && !completed(f.sub.id));
}

/** The recommended next subtopic: the first openable, not completed one in order. */
export function recommendedNext(grade: GradeTopics, completed: (id: string) => boolean): FlatSubtopic | undefined {
  return flatten(grade).find((f) => isOpenable(f.sub) && !completed(f.sub.id));
}

export type NodeState = 'done' | 'recommended' | 'available' | 'softLocked' | 'soon';

/**
 * How a subtopic node looks on the map:
 * - done: completed
 * - recommended: the next one to do
 * - available: prerequisites met (or explicitly acknowledged)
 * - softLocked: unmet prerequisites — still tappable, shows the warning dialog first
 * - soon: no content yet ("Hamarosan…")
 */
export function nodeState(
  grade: GradeTopics,
  id: string,
  completed: (id: string) => boolean,
  acknowledged: (id: string) => boolean,
): NodeState {
  const f = findSubtopic(grade, id);
  if (!f) return 'soon';
  if (!isOpenable(f.sub)) return 'soon';
  if (completed(id)) return 'done';
  if (recommendedNext(grade, completed)?.sub.id === id) return 'recommended';
  if (acknowledged(id)) return 'available';
  return unmetPrerequisites(grade, id, completed).length > 0 ? 'softLocked' : 'available';
}

/**
 * True if EVERY subtopic of the topic is completed. Topics that still have lessons without
 * content (todo) cannot be completed yet, so chapter badges are never handed out early.
 */
export function topicCompleted(topic: TopicMeta, completed: (id: string) => boolean): boolean {
  return topic.subtopics.length > 0 && topic.subtopics.every((s) => completed(s.id));
}

/** Default topic colors, used when topics.json has no `color`. */
export const TOPIC_PALETTE = ['#3b6fe0', '#f0750f', '#2f9e44', '#d6336c', '#7950f2', '#1098ad', '#c92a2a', '#8c6d1f'];

export function topicColor(grade: GradeTopics, topic: TopicMeta): string {
  return topic.color ?? TOPIC_PALETTE[grade.topics.indexOf(topic) % TOPIC_PALETTE.length];
}

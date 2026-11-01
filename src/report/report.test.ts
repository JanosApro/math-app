import assert from 'node:assert/strict';
import test from 'node:test';
import type { Question } from '../engine/types';
import { addPending, buildReportContext, canSend, newReportId, PENDING_LIMIT, removePending, type PendingReport } from './report';

const question: Question = {
  prompt: 'Mennyi $2 + 3$?',
  answer: { type: 'number', value: 5 },
  hint: '',
  solution: [],
};

const base = {
  page: '#/lesson/g5-termeszetes-szamok-1-01',
  grade: 5,
  appVersion: '1.0.0',
  device: { userAgent: 'test', viewport: '375×740', pixelRatio: 2, language: 'hu', online: true, theme: 'light' },
  errors: [],
  now: new Date('2026-11-01T10:00:00Z'),
};

test('report ids match the server format', () => {
  for (let i = 0; i < 20; i++) assert.match(newReportId(), /^[a-z0-9-]{8,64}$/);
});

test('the context carries the question, its origin and both answers', () => {
  const ctx = buildReportContext({
    ...base,
    question: { question, seed: 42, mode: 'lesson', origin: { subtopic: 'g5-x', generator: 'add', level: 2 }, student: { type: 'text', text: '6' }, correct: false },
  });
  const q = ctx.question as Record<string, unknown>;
  assert.equal(q.origin, 'g5-x · add · L2');
  assert.equal(q.seed, 42);
  assert.deepEqual([q.subtopic, q.generator, q.level], ['g5-x', 'add', 2]);
  assert.equal(q.prompt, 'Mennyi $2 + 3$?');
  assert.equal(q.correct, '$5$');
  assert.equal(q.student, '{"type":"text","text":"6"}');
  assert.equal(q.studentCorrect, false);
  assert.equal(ctx.grade, 5);
});

test('a fixed check question is identified by part and step', () => {
  const ctx = buildReportContext({ ...base, question: { question, seed: 1, mode: 'lesson', origin: { subtopic: 'g5-x', part: 1, step: 2 } } });
  assert.equal((ctx.question as Record<string, unknown>).origin, 'g5-x · 2. rész · 3. lépés');
});

test('without a question or errors those fields are left out', () => {
  const ctx = buildReportContext({ ...base, question: null });
  assert.equal('question' in ctx, false);
  assert.equal('errors' in ctx, false);
});

test('a huge context is cut below the server limit', () => {
  const long: Question = { ...question, prompt: 'x'.repeat(50_000) };
  const errors = Array.from({ length: 5 }, () => ({ message: 'e'.repeat(300), at: 'now' }));
  const ctx = buildReportContext({ ...base, question: { question: long, seed: 1, mode: 'test' }, errors });
  assert.ok(JSON.stringify(ctx).length < 16_000);
});

test('the outbox keeps the newest reports and drops duplicates', () => {
  const r = (key: string): PendingReport => ({ key, kind: 'bug', message: 'x', context: {}, createdAt: '', tries: 0 });
  let list: PendingReport[] = [];
  for (let i = 0; i < PENDING_LIMIT + 3; i++) list = addPending(list, r(`report-${i}`));
  assert.equal(list.length, PENDING_LIMIT);
  assert.equal(list[0].key, 'report-3');
  list = addPending(list, r('report-5'));
  assert.equal(list.filter((x) => x.key === 'report-5').length, 1);
  assert.equal(removePending(list, 'report-5').length, PENDING_LIMIT - 1);
});

test('only a wrong-answer report may be sent without text', () => {
  assert.equal(canSend('wrong_answer', ''), true);
  assert.equal(canSend('bug', ''), false);
  assert.equal(canSend('bug', '  ab '), false);
  assert.equal(canSend('other', 'nem megy a hang'), true);
});

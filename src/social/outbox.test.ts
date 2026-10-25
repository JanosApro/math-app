import assert from 'node:assert/strict';
import test from 'node:test';
import { formatFriendCode, formatRecoveryCode, isValidFriendCode, isValidRecoveryCode, normalizeCode } from './codes';
import { answerEventKey, chapterEventKey, dailyAnswerEventKey, dailyEventKey, isValidEventKey, lessonEventKey, partEventKey } from './eventKeys';
import { enqueueEvent, OUTBOX_LIMIT, removeEvent, takeBatch } from './outbox';
import type { XpEvent } from './types';

const MODULE = 'g5-termeszetes-szamok-1-01';

test('event keys have the prefixes the SQL function accepts', () => {
  const keys = [
    answerEventKey(MODULE, 3, 'p1', '00000000-0000-4000-8000-000000000000'),
    partEventKey(MODULE, 2),
    lessonEventKey(MODULE),
    dailyEventKey('2026-10-25'),
    dailyAnswerEventKey('2026-10-25', 2),
    chapterEventKey('g5-termeszetes-szamok-1'),
  ];
  for (const key of keys) {
    assert.equal(isValidEventKey(key), true, key);
  }
  assert.equal(isValidEventKey('answer:UPPER'), false);
  assert.equal(isValidEventKey('something-else'), false);
});

test('the outbox deduplicates by type + key', () => {
  const first = enqueueEvent([], 'answer', answerEventKey(MODULE, 1, 'p1', 'abc'), 1000);
  assert.equal(first.length, 1);
  const second = enqueueEvent(first, 'answer', answerEventKey(MODULE, 1, 'p1', 'abc'), 2000);
  assert.equal(second.length, 1);
  const differentType = enqueueEvent(second, 'answer_hint', answerEventKey(MODULE, 1, 'p1', 'abc'), 3000);
  assert.equal(differentType.length, 2);
});

test('the outbox is capped and keeps the newest events', () => {
  let list: XpEvent[] = [];
  for (let i = 0; i < OUTBOX_LIMIT + 7; i++) {
    list = enqueueEvent(list, 'answer', answerEventKey(MODULE, i, 'p1', 'abc'), i);
  }
  assert.equal(list.length, OUTBOX_LIMIT);
  assert.match(list[0].key, /:7:/);
});

test('batch and remove helpers do not mutate the input', () => {
  const list = enqueueEvent(enqueueEvent([], 'part', partEventKey(MODULE, 1), 1), 'lesson', lessonEventKey(MODULE), 2);
  const batch = takeBatch(list, 1);
  assert.equal(batch.length, 1);
  assert.equal(list.length, 2);
  const after = removeEvent(list, batch[0].id);
  assert.equal(after.length, 1);
  assert.equal(list.length, 2);
});

test('codes are normalized and validated', () => {
  assert.equal(normalizeCode(' abcd-2345 '), 'ABCD2345');
  assert.equal(formatFriendCode('abcd2345'), 'ABCD 2345');
  assert.equal(isValidFriendCode('ABCD2345'), true);
  assert.equal(isValidFriendCode('ABCD234'), false);
  assert.equal(isValidFriendCode('ABCDO234'), false);

  const recovery = 'ABCD2345EFGH6789JKLM';
  assert.equal(formatRecoveryCode(recovery), 'ABCD-2345-EFGH-6789-JKLM');
  assert.equal(isValidRecoveryCode(formatRecoveryCode(recovery)), true);
  assert.equal(isValidRecoveryCode('ABCD'), false);
});

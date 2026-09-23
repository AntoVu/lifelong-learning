// Run with: node --test tests/
const test = require('node:test');
const assert = require('node:assert/strict');
const P = require('../assets/progress.js');

test('solve awards XP once per problem, by attempt type', () => {
  const s = P.fresh();
  assert.equal(P.solve(s, 'a', 'first', '2026-09-21'), 10);
  assert.equal(P.solve(s, 'a', 'first', '2026-09-21'), 0); // already solved
  assert.equal(P.solve(s, 'b', 'retry', '2026-09-21'), 5);
  assert.equal(P.solve(s, 'c', 'reveal', '2026-09-21'), 0);
  assert.equal(s.xp, 15);
  assert.equal(P.dayXp(s, '2026-09-21'), 15);
});

test('completeLesson awards bonus once', () => {
  const s = P.fresh();
  assert.equal(P.completeLesson(s, 'l1', true, '2026-09-21'), P.LESSON_XP);
  assert.equal(P.completeLesson(s, 'l1', true, '2026-09-21'), 0);
  assert.equal(s.lessons.l1.perfect, true);
});

test('streak counts consecutive active days', () => {
  const s = P.fresh();
  assert.equal(P.streak(s, '2026-09-21'), 0);
  ['2026-02-27', '2026-02-28', '2026-03-01'].forEach((d, i) => P.solve(s, 'p' + i, 'first', d));
  assert.equal(P.streak(s, '2026-03-01'), 3); // crosses a month boundary
  assert.equal(P.streak(s, '2026-03-02'), 3); // today not started yet: streak still alive
  assert.equal(P.streak(s, '2026-03-03'), 0); // missed a full day
});

test('streak survives a DST change', () => {
  const s = P.fresh();
  ['2026-11-01', '2026-11-02'].forEach((d, i) => P.solve(s, 'p' + i, 'first', d));
  assert.equal(P.streak(s, '2026-11-02'), 2);
});

test('achievements unlock once and report only new ones', () => {
  const s = P.fresh();
  assert.deepEqual(P.checkAchievements(s, '2026-09-21'), []);
  s.flags.flipped = true;
  P.solve(s, 'a', 'first', '2026-09-21');
  const got = P.checkAchievements(s, '2026-09-21');
  assert.ok(got.includes('first-flip') && got.includes('first-solve'));
  assert.deepEqual(P.checkAchievements(s, '2026-09-21'), []);
});

test('dayKey uses local calendar date', () => {
  assert.equal(P.dayKey(new Date(2026, 8, 21, 23, 59)), '2026-09-21');
});

test('stage-1 achievement needs every stage 1 lesson finished', () => {
  const s = P.fresh();
  ['bits', 'gates', 'fetch', 'first-programs'].forEach(id => P.completeLesson(s, id, false, '2026-09-23'));
  assert.ok(!P.checkAchievements(s, '2026-09-23').includes('stage-1'));
  P.completeLesson(s, 'functions', false, '2026-09-23');
  assert.deepEqual(P.checkAchievements(s, '2026-09-23'), ['stage-1']);
});

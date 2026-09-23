// Progress state: XP, daily activity, streaks, achievements. Saved in localStorage.
// Pure functions take the state object so they can be tested in Node.
(function (root) {
  const KEY = 'lifelong.v1';
  const XP = { first: 10, retry: 5, reveal: 0 };
  const LESSON_XP = 50;
  const DAILY_GOAL = 30;

  const STAGE_1 = ['bits', 'gates', 'fetch', 'first-programs', 'functions'];

  const ACHIEVEMENTS = [
    { id: 'first-flip', name: 'Flipped a bit', desc: 'Toggle your first switch.', test: s => s.flags.flipped },
    { id: 'first-solve', name: 'First answer', desc: 'Solve a practice problem.', test: s => Object.keys(s.solved).length > 0 },
    { id: 'goal', name: 'Daily goal', desc: `Earn ${DAILY_GOAL} XP in one day.`, test: (s, d) => dayXp(s, d) >= DAILY_GOAL },
    { id: 'lesson-1', name: 'First lesson done', desc: 'Finish a lesson.', test: s => Object.keys(s.lessons).length > 0 },
    { id: 'perfect', name: 'Clean sheet', desc: 'Finish a lesson with every problem right on the first try.', test: s => Object.values(s.lessons).some(l => l.perfect) },
    { id: 'curious', name: 'Went to the source', desc: 'Open a reference link.', test: s => s.flags.openedReference },
    { id: 'stage-1', name: 'How computers work', desc: 'Finish every lesson in stage 1.', test: s => STAGE_1.every(id => s.lessons[id]) },
    { id: 'streak-3', name: 'Three in a row', desc: 'Keep a 3-day streak.', test: (s, d) => streak(s, d) >= 3 },
    { id: 'streak-7', name: 'A full week', desc: 'Keep a 7-day streak.', test: (s, d) => streak(s, d) >= 7 },
    { id: 'xp-500', name: 'Five hundred', desc: 'Earn 500 XP in total.', test: s => s.xp >= 500 },
  ];

  const fresh = () => ({ xp: 0, days: {}, solved: {}, lessons: {}, achievements: {}, flags: {} });

  const pad = n => String(n).padStart(2, '0');
  const dayKey = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  // Shift a YYYY-MM-DD key by whole days (UTC math, so DST never skips a day).
  function shift(key, delta) {
    const d = new Date(key + 'T00:00:00Z');
    d.setUTCDate(d.getUTCDate() + delta);
    return d.toISOString().slice(0, 10);
  }

  function award(s, xp, day) {
    s.xp += xp;
    s.days[day] = (s.days[day] || 0) + xp;
  }

  const dayXp = (s, day) => s.days[day] || 0;

  // Returns XP gained; 0 if already solved. Revealing still marks it solved (and counts as activity).
  function solve(s, id, mode, day) {
    if (s.solved[id]) return 0;
    s.solved[id] = mode;
    award(s, XP[mode], day);
    return XP[mode];
  }

  function completeLesson(s, id, perfect, day) {
    if (s.lessons[id]) return 0;
    s.lessons[id] = { done: day, perfect };
    award(s, LESSON_XP, day);
    return LESSON_XP;
  }

  // Consecutive active days ending today, or yesterday if today has no activity yet.
  function streak(s, today) {
    let d = today in s.days ? today : shift(today, -1);
    let n = 0;
    while (d in s.days) { n++; d = shift(d, -1); }
    return n;
  }

  function checkAchievements(s, today) {
    const fresh = ACHIEVEMENTS.filter(a => !s.achievements[a.id] && a.test(s, today));
    fresh.forEach(a => { s.achievements[a.id] = today; });
    return fresh.map(a => a.id);
  }

  function load() {
    try { return Object.assign(fresh(), JSON.parse(localStorage.getItem(KEY))); }
    catch { return fresh(); }
  }
  const save = s => localStorage.setItem(KEY, JSON.stringify(s));

  const api = { KEY, XP, LESSON_XP, DAILY_GOAL, ACHIEVEMENTS, fresh, dayKey, dayXp, solve, completeLesson, streak, checkAchievements, load, save };
  if (typeof module !== 'undefined') module.exports = api;
  else root.Progress = api;
})(this);

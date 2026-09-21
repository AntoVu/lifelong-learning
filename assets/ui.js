// Shared page behavior: stats bar, practice problems, multiple-choice checks, toasts, lesson finish.
// Markup contracts are documented in CLAUDE.md.
(function () {
  const P = window.Progress;
  const state = P.load();
  const today = () => P.dayKey();
  const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];

  const FLAME = '<svg width="16" height="18" viewBox="0 0 16 18" aria-hidden="true"><path d="M8 1c1 3 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5 0 1.5.8 2.5 1.8 2.8C6 6 7 3.5 8 1z" fill="#e8743b" stroke="currentColor" stroke-width="1.2"/></svg>';
  const STAR = '<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1l2.1 4.6 5 .5-3.8 3.4 1.1 4.9L8 11.9 3.6 14.4l1.1-4.9L.9 6.1l5-.5z" fill="var(--hl)" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/></svg>';

  function renderStats() {
    const el = document.getElementById('stats');
    if (!el) return;
    const d = today(), xpToday = P.dayXp(state, d), pct = Math.min(100, Math.round(xpToday / P.DAILY_GOAL * 100));
    const s = P.streak(state, d);
    el.innerHTML = `
      <span class="stat" title="Days in a row with at least one answer">${FLAME}<b>${s}</b><span class="label">day streak</span></span>
      <span class="stat" title="Today's goal: ${P.DAILY_GOAL} XP"><span class="ring" style="--p:${pct}"></span><b>${xpToday}/${P.DAILY_GOAL}</b><span class="label">today</span></span>
      <span class="stat" title="Total experience">${STAR}<b>${state.xp}</b><span class="label">XP</span></span>`;
    document.dispatchEvent(new CustomEvent('progress', { detail: state }));
  }

  function toast(html, cls = '') {
    let box = document.querySelector('.toasts');
    if (!box) { box = document.createElement('div'); box.className = 'toasts'; box.setAttribute('aria-live', 'polite'); document.body.append(box); }
    const t = document.createElement('div');
    t.className = 'toast ' + cls;
    t.innerHTML = html;
    box.append(t);
    setTimeout(() => t.remove(), 4000);
  }

  // Save, announce XP and any newly unlocked achievements, refresh the bar.
  function commit(gained) {
    const goalBefore = state.achievements.goal;
    const unlocked = P.checkAchievements(state, today());
    P.save(state);
    if (gained) toast(`+${gained} XP`);
    unlocked.forEach(id => {
      const a = P.ACHIEVEMENTS.find(x => x.id === id);
      toast(`Achievement: ${a.name}<small>${a.desc}</small>`, 'badge');
    });
    if (!goalBefore && state.achievements.goal) toast('Daily goal reached. Your streak is safe today.');
    renderStats();
    updateFinish();
  }

  const norm = s => s.toLowerCase().replace(/[\s_,]/g, '');

  function markSolved(box, mode) {
    box.classList.add('solved');
    $$('input, .answer-row button, .choices button', box).forEach(b => { b.disabled = true; });
    box.querySelector('.reveal')?.remove();
    const sol = box.querySelector('.solution');
    if (sol) sol.hidden = false;
    const fb = box.querySelector('.feedback');
    fb.className = 'feedback good';
    fb.textContent = mode === 'reveal' ? 'Answer shown. Read the working below, then try the next one.' : 'Correct.';
  }

  function addReveal(box) {
    if (box.querySelector('.reveal')) return;
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'linkish reveal'; b.textContent = 'Show answer';
    b.onclick = () => { P.solve(state, box.dataset.id, 'reveal', today()); markSolved(box, 'reveal'); commit(0); };
    box.querySelector('.feedback').after(b);
  }

  // Free-response: <div class="problem" data-id data-answer="a|b"> with a form, .feedback, .solution
  $$('.problem').forEach(box => {
    let attempts = 0;
    const answers = box.dataset.answer.split('|').map(norm);
    const fb = box.querySelector('.feedback');
    if (state.solved[box.dataset.id]) return markSolved(box, state.solved[box.dataset.id]);
    box.querySelector('form').addEventListener('submit', e => {
      e.preventDefault();
      const input = box.querySelector('input');
      if (!input.value.trim()) return;
      if (answers.includes(norm(input.value))) {
        const mode = attempts ? 'retry' : 'first';
        const xp = P.solve(state, box.dataset.id, mode, today());
        markSolved(box, mode);
        commit(xp);
      } else {
        attempts++;
        fb.className = 'feedback bad';
        fb.textContent = `Not quite. ${attempts === 1 ? 'Try again, or open the hint.' : 'Check your working, or show the answer.'}`;
        if (attempts >= 2) addReveal(box);
        input.select();
      }
    });
  });

  // Multiple choice: <div class="mcq" data-id data-correct="index"> with .choices buttons
  $$('.mcq').forEach(box => {
    let attempts = 0;
    const buttons = $$('.choices button', box);
    const correct = +box.dataset.correct;
    const fb = box.querySelector('.feedback');
    if (state.solved[box.dataset.id]) { buttons[correct].classList.add('right'); return markSolved(box, state.solved[box.dataset.id]); }
    buttons.forEach((b, i) => b.addEventListener('click', () => {
      if (i === correct) {
        b.classList.add('right');
        const mode = attempts ? 'retry' : 'first';
        const xp = P.solve(state, box.dataset.id, mode, today());
        markSolved(box, mode);
        commit(xp);
      } else {
        attempts++;
        b.classList.add('wrong'); b.disabled = true;
        fb.className = 'feedback bad';
        fb.textContent = b.dataset.why || 'Not that one. Try another.';
      }
    }));
  });

  // Lesson finish button: enabled once every check on the page is solved.
  function updateFinish() {
    const btn = document.querySelector('[data-finish]');
    if (!btn) return;
    const ids = $$('.problem, .mcq').map(b => b.dataset.id);
    const left = ids.filter(id => !state.solved[id]).length;
    const done = state.lessons[btn.dataset.finish];
    const note = document.querySelector('.finish-note');
    btn.disabled = !!done || left > 0;
    btn.textContent = done ? 'Lesson finished' : 'Finish lesson';
    note.textContent = done ? 'Nice work. The next lesson is on the course map.'
      : left ? `${left} practice ${left === 1 ? 'check' : 'checks'} left on this page.` : `All checks done. Finish for +${P.LESSON_XP} XP.`;
  }
  document.querySelector('[data-finish]')?.addEventListener('click', e => {
    const ids = $$('.problem, .mcq').map(b => b.dataset.id);
    const perfect = ids.every(id => state.solved[id] === 'first');
    commit(P.completeLesson(state, e.target.dataset.finish, perfect, today()));
  });

  // Reference links count toward the "went to the source" achievement.
  $$('.refs a').forEach(a => a.addEventListener('click', () => { state.flags.openedReference = true; commit(0); }));

  // Reading progress line under the top bar.
  const bar = document.querySelector('.readbar');
  if (bar) addEventListener('scroll', () => {
    const h = document.documentElement;
    bar.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight) * 100) + '%';
  }, { passive: true });

  renderStats();
  updateFinish();
  window.UI = { state, commit, toast, flag: name => { if (!state.flags[name]) { state.flags[name] = true; commit(0); } } };
})();

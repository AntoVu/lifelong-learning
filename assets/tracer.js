// Step-through code tracer used by lessons 4 and 5.
// Traces are recorded ahead of time by running the real Python program under sys.settrace.
// Each step: { line (0 = finished), frames: [{ fn, vars: [[name, value, tag]] }], out, ret? }.
// A tag (like "list #1") marks a mutable object, so two names sharing one object show the same tag.
(function () {
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

  function mount(host, programs, { initial } = {}) {
    let name = initial || Object.keys(programs)[0], i = 0;
    host.classList.add('tracer');
    host.innerHTML = `
      <div class="seg" role="group" aria-label="Program"></div>
      <div class="tr-body">
        <ol class="tr-code"></ol>
        <div class="tr-state">
          <div class="tr-cap tr-stackcap"></div>
          <div class="tr-frames"></div>
          <div class="tr-cap">Output</div>
          <pre class="tr-out"></pre>
        </div>
      </div>
      <p class="tr-msg" aria-live="polite"></p>
      <div class="tr-controls">
        <button class="btn quiet" type="button" data-act="back">Back</button>
        <button class="btn" type="button" data-act="next">Next step</button>
        <input type="range" min="0" value="0" aria-label="Step">
        <span class="tr-count"></span>
      </div>`;
    const $ = s => host.querySelector(s);
    const seg = $('.seg'), range = $('input[type=range]');

    Object.keys(programs).forEach(k => {
      const b = document.createElement('button');
      b.type = 'button'; b.textContent = k; b.setAttribute('aria-pressed', k === name);
      b.onclick = () => { name = k; i = 0; [...seg.children].forEach(c => c.setAttribute('aria-pressed', c === b)); load(); };
      seg.append(b);
    });
    $('[data-act=back]').onclick = () => go(i - 1);
    $('[data-act=next]').onclick = () => go(i + 1);
    range.oninput = () => go(+range.value);

    function load() {
      const p = programs[name];
      $('.tr-code').innerHTML = p.code.split('\n').map(l => `<li><code>${esc(l) || ' '}</code></li>`).join('');
      range.max = p.steps.length - 1;
      go(0);
    }

    function go(n) {
      const steps = programs[name].steps;
      i = Math.max(0, Math.min(steps.length - 1, n));
      const s = steps[i], prev = steps[i - 1];
      [...$('.tr-code').children].forEach((li, k) => li.classList.toggle('now', k + 1 === s.line));

      // A value is "changed" if the same frame (by depth) didn't have it, or had a different value, one step ago.
      const before = (depth, v) => prev && prev.frames[depth] && prev.frames[depth].fn === s.frames[depth].fn
        && prev.frames[depth].vars.find(x => x[0] === v[0]);
      $('.tr-frames').innerHTML = s.frames.map((f, d) => `
        <div class="tr-frame${d === s.frames.length - 1 ? ' top' : ''}">
          <div class="tr-fn">${f.fn === 'global' ? 'Global variables' : esc(f.fn) + '()'}</div>
          ${f.vars.length ? `<dl>${f.vars.map(v => {
            const old = before(d, v), changed = prev && (!old || old[1] !== v[1]);
            return `<dt>${esc(v[0])}</dt><dd class="${changed ? 'changed' : ''}"><code>${esc(v[1])}</code>${v[2] ? `<span class="tr-tag">${esc(v[2])}</span>` : ''}</dd>`;
          }).join('')}</dl>` : '<p class="tr-empty">No variables yet</p>'}
          ${s.ret !== undefined && d === s.frames.length - 1 ? `<p class="tr-ret">returns <code>${esc(s.ret)}</code></p>` : ''}
        </div>`).reverse().join(''); // newest call on top
      $('.tr-stackcap').textContent = s.frames.length > 1 ? 'Call stack (newest call on top)' : 'Variables';
      $('.tr-out').textContent = s.out || ' ';
      const top = s.frames[s.frames.length - 1];
      $('.tr-msg').textContent = s.line === 0 ? 'The program has finished.'
        : s.ret !== undefined ? `${top.fn}() is returning ${s.ret} to whoever called it.`
        : `About to run line ${s.line}${top.fn === 'global' ? '' : `, inside ${top.fn}()`}.`;
      range.value = i;
      $('.tr-count').textContent = `Step ${i + 1} of ${steps.length}`;
      $('[data-act=back]').disabled = i === 0;
      $('[data-act=next]').disabled = i === steps.length - 1;
    }
    load();
  }

  window.Tracer = { mount };
})();

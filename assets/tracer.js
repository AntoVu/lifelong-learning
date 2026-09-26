// Step-through code tracer used by lessons 4 and 5, in the style of Python Tutor.
// Traces are recorded ahead of time by running the real Python program under sys.settrace
// (ai_resources/gentrace.py). Each step:
//   { line (0 = finished), frames: [{ fn, vars: [[name, value, tag]] }],
//     heap: { tag: { type, kind: 'seq' | 'map', items: [[label, value, tag]] } }, out, ret? }
// Numbers and strings are drawn inline. A tagged value (a list, dict, set, or object) is drawn once under
// "Objects", with an arrow from every name or field that points at it, so sharing is visible.
(function () {
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const SVGNS = 'http://www.w3.org/2000/svg';

  function mount(host, programs, { initial } = {}) {
    let name = initial || Object.keys(programs)[0], i = 0, timer = null;
    host.classList.add('tracer');
    host.innerHTML = `
      <div class="seg" role="group" aria-label="Program"></div>
      <div class="tr-body">
        <ol class="tr-code"></ol>
        <div class="tr-state">
          <div class="tr-cap tr-stackcap"></div>
          <div class="tr-frames"></div>
          <div class="tr-heapwrap"><div class="tr-cap">Objects</div><div class="tr-heap"></div></div>
          <svg class="tr-arrows" aria-hidden="true"></svg>
        </div>
      </div>
      <div class="tr-cap">Output</div>
      <pre class="tr-out"></pre>
      <p class="tr-msg" aria-live="polite"></p>
      <div class="tr-controls">
        <button class="btn quiet" type="button" data-act="back">Back</button>
        <button class="btn" type="button" data-act="next">Next step</button>
        <button class="btn quiet" type="button" data-act="play">Play</button>
        <input type="range" min="0" value="0" aria-label="Step">
        <span class="tr-count"></span>
      </div>`;
    const $ = s => host.querySelector(s);
    const seg = $('.seg'), range = $('input[type=range]'), state = $('.tr-state'), svg = $('.tr-arrows');

    Object.keys(programs).forEach(k => {
      const b = document.createElement('button');
      b.type = 'button'; b.textContent = k; b.setAttribute('aria-pressed', k === name);
      b.onclick = () => { name = k; i = 0; [...seg.children].forEach(c => c.setAttribute('aria-pressed', c === b)); load(); };
      seg.append(b);
    });
    $('[data-act=back]').onclick = () => { stop(); go(i - 1); };
    $('[data-act=next]').onclick = () => { stop(); go(i + 1); };
    $('[data-act=play]').onclick = () => (timer ? stop() : play());
    range.oninput = () => { stop(); go(+range.value); };
    // Left and right arrow keys step while focus is anywhere in the tracer (except the slider, which has its own).
    host.addEventListener('keydown', e => {
      if (e.target === range) return;
      if (e.key === 'ArrowRight') { stop(); go(i + 1); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { stop(); go(i - 1); e.preventDefault(); }
    });
    new ResizeObserver(drawArrows).observe(state);

    function play() {
      if (i === programs[name].steps.length - 1) go(0);
      $('[data-act=play]').textContent = 'Pause';
      timer = setInterval(() => { go(i + 1); if (i === programs[name].steps.length - 1) stop(); }, 800);
    }
    function stop() { clearInterval(timer); timer = null; $('[data-act=play]').textContent = 'Play'; }

    function load() {
      stop();
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

      const val = v => (v[2] ? `<span class="tr-ptr" data-to="${esc(v[2])}" title="points to ${esc(v[2])}"></span>` : `<code>${esc(v[1])}</code>`);
      // A name is "changed" if its frame (same depth) didn't have it one step ago, or it now holds something else.
      const before = (d, v) => prev && prev.frames[d] && prev.frames[d].fn === s.frames[d].fn && prev.frames[d].vars.find(x => x[0] === v[0]);
      $('.tr-frames').innerHTML = s.frames.map((f, d) => `
        <div class="tr-frame${d === s.frames.length - 1 ? ' top' : ''}">
          <div class="tr-fn">${f.fn === 'global' ? 'Global variables' : esc(f.fn)}</div>
          ${f.vars.length ? `<dl>${f.vars.map(v => {
            const old = before(d, v);
            const changed = prev && (!old || (v[2] ? old[2] !== v[2] : old[1] !== v[1]));
            return `<dt>${esc(v[0])}</dt><dd class="${changed ? 'changed' : ''}">${val(v)}</dd>`;
          }).join('')}</dl>` : '<p class="tr-empty">No variables yet</p>'}
          ${s.ret !== undefined && d === s.frames.length - 1 ? `<p class="tr-ret">returns <code>${esc(s.ret)}</code></p>` : ''}
        </div>`).reverse().join(''); // newest call on top

      const heap = Object.entries(s.heap || {});
      $('.tr-heapwrap').hidden = !heap.length;
      $('.tr-heap').innerHTML = heap.map(([tag, o]) => {
        const old = prev && prev.heap && prev.heap[tag];
        const was = item => old && old.items.find(x => x[0] === item[0]);
        const changed = item => old && (!was(item) || (item[2] ? was(item)[2] !== item[2] : was(item)[1] !== item[1]));
        // Lists and sets: a row of cells labeled by index. Dicts and objects: rows of field and value.
        const body = o.kind === 'seq'
          ? o.items.map(x => `<span class="tr-item${changed(x) ? ' changed' : ''}"><small>${esc(x[0])}</small>${val(x)}</span>`).join('') || '<span class="tr-item"><code>empty</code></span>'
          : `<dl>${o.items.map(x => `<dt>${esc(x[0])}</dt><dd class="${changed(x) ? 'changed' : ''}">${val(x)}</dd>`).join('') || '<dt>empty</dt><dd></dd>'}</dl>`;
        return `<div class="tr-obj ${o.kind}" data-tag="${esc(tag)}"><span class="tr-type">${esc(tag)}</span>${body}</div>`;
      }).join('');

      $('.tr-stackcap').textContent = s.frames.length > 1 ? 'Call stack (newest call on top)' : 'Variables';
      $('.tr-out').textContent = s.out || ' ';
      const top = s.frames[s.frames.length - 1];
      $('.tr-msg').textContent = s.line === 0 ? 'The program has finished.'
        : s.ret !== undefined ? (top.fn.startsWith('class ') ? `${top.fn} is defined.` : `${top.fn} is returning ${s.ret} to whoever called it.`)
        : `About to run line ${s.line}${top.fn === 'global' ? '' : `, inside ${top.fn}`}.`;
      range.value = i;
      $('.tr-count').textContent = `Step ${i + 1} of ${steps.length}`;
      $('[data-act=back]').disabled = i === 0;
      $('[data-act=next]').disabled = i === steps.length - 1;
      drawArrows();
    }

    // Arrows drawn like wires: from each pointer dot, right to a gutter past the frames and objects, down,
    // then left into the object's right edge. Each arrow gets its own gutter lane so they don't overlap.
    function drawArrows() {
      const box = state.getBoundingClientRect();
      svg.setAttribute('width', box.width); svg.setAttribute('height', box.height);
      svg.innerHTML = '';
      const objs = [...host.querySelectorAll('.tr-obj')];
      const right = Math.max($('.tr-frames').getBoundingClientRect().right, ...objs.map(o => o.getBoundingClientRect().right)) - box.left;
      [...host.querySelectorAll('.tr-ptr')].forEach((p, k) => {
        const obj = objs.find(o => o.dataset.tag === p.dataset.to);
        if (!obj) return;
        const a = p.getBoundingClientRect(), b = obj.getBoundingClientRect();
        const x1 = a.right - box.left, y1 = a.top + a.height / 2 - box.top;
        const x2 = b.right - box.left + 2, y2 = b.top + b.height / 2 - box.top;
        const gx = right + 8 + k * 5;
        const path = document.createElementNS(SVGNS, 'path');
        path.setAttribute('d', `M${x1},${y1} H${gx} V${y2} H${x2 + 8}`);
        const head = document.createElementNS(SVGNS, 'path');
        head.setAttribute('d', `M${x2 + 9},${y2 - 5} L${x2},${y2} L${x2 + 9},${y2 + 5} Z`);
        head.setAttribute('class', 'tr-head');
        svg.append(path, head);
      });
    }
    load();
  }

  window.Tracer = { mount };
})();

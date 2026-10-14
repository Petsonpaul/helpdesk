/*
 * Qelvoro - cursor.js
 * Lightweight animated cursor: a small dot plus a trailing ring.
 * - The native cursor is NOT hidden, so no existing UI or usability changes.
 * - Disabled on touch devices and when the user prefers reduced motion.
 * - Self-contained: injects its own styles, no changes to app CSS.
 */
(function () {
  'use strict';
  if (window.__hdpCursor) return;

  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!fine || reduce) return;
  window.__hdpCursor = true;

  var style = document.createElement('style');
  style.textContent =
    '.hdp-cursor-dot,.hdp-cursor-ring{position:fixed;top:0;left:0;pointer-events:none;' +
    'z-index:2147483647;border-radius:9999px;opacity:0;will-change:transform;' +
    'transition:opacity .2s ease,width .2s ease,height .2s ease,background-color .2s ease,border-color .2s ease}' +
    '.hdp-cursor-dot{width:6px;height:6px;margin:-3px 0 0 -3px;background:#5d87ff}' +
    '.hdp-cursor-ring{width:30px;height:30px;margin:-15px 0 0 -15px;border:1.5px solid #5d87ff}' +
    '.hdp-cursor-ring.is-hover{width:44px;height:44px;margin:-22px 0 0 -22px;background:rgba(93,135,255,.12)}' +
    '.hdp-cursor-ring.is-down{width:22px;height:22px;margin:-11px 0 0 -11px}' +
    '.hdp-cursor-on{opacity:1}';
  document.head.appendChild(style);

  var dot = document.createElement('div');
  var ring = document.createElement('div');
  dot.className = 'hdp-cursor-dot';
  ring.className = 'hdp-cursor-ring';
  dot.setAttribute('aria-hidden', 'true');
  ring.setAttribute('aria-hidden', 'true');
  document.body.appendChild(dot);
  document.body.appendChild(ring);

  var mx = 0, my = 0, rx = 0, ry = 0, visible = false, raf = null;
  var INTERACTIVE = 'a,button,[role="button"],input,select,textarea,label,summary,[data-cursor="hover"]';

  function show(v) {
    visible = v;
    dot.classList.toggle('hdp-cursor-on', v);
    ring.classList.toggle('hdp-cursor-on', v);
  }

  function loop() {
    rx += (mx - rx) * 0.18;
    ry += (my - ry) * 0.18;
    dot.style.transform = 'translate3d(' + mx + 'px,' + my + 'px,0)';
    ring.style.transform = 'translate3d(' + rx + 'px,' + ry + 'px,0)';
    raf = requestAnimationFrame(loop);
  }

  document.addEventListener('mousemove', function (e) {
    mx = e.clientX; my = e.clientY;
    if (!visible) { rx = mx; ry = my; show(true); }
    ring.classList.toggle('is-hover', !!(e.target.closest && e.target.closest(INTERACTIVE)));
  }, { passive: true });
  document.addEventListener('mousedown', function () { ring.classList.add('is-down'); });
  document.addEventListener('mouseup', function () { ring.classList.remove('is-down'); });
  document.documentElement.addEventListener('mouseleave', function () { show(false); });
  document.documentElement.addEventListener('mouseenter', function () { show(true); });
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { cancelAnimationFrame(raf); raf = null; }
    else if (!raf) { raf = requestAnimationFrame(loop); }
  });

  raf = requestAnimationFrame(loop);
})();

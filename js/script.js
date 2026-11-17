/* ==========================================================================
   A Letter for V — reveal behaviour
   --------------------------------------------------------------------------
   1. On load, every word is cached and the sheet is emptied, so the letter
      is never visible before the button is pressed.
   2. The button writes the letter out. The quill glides between characters
      rather than jumping, swings on its nib as it strokes, slows at commas
      and full stops, and lifts off the page at the end of each paragraph.
   ========================================================================== */

(function () {
  'use strict';

  var startButton = document.getElementById('start');
  var hint        = document.getElementById('hint');
  var paper       = document.getElementById('paper');
  var quill       = document.getElementById('quill');
  var letter      = document.getElementById('letter');

  var paragraphs = [].slice.call(letter.querySelectorAll('.line'));

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var state = 'idle';            // idle -> writing -> done

  /* ---- Tuning ------------------------------------------------------- */

  var STROKE_PERIOD = 0.63;      // radians of swing per character
  var TILT_BASE     = -7;        // degrees the quill leans while writing
  var TILT_SWING    = 4.5;       // degrees either side of that lean
  var BOB           = 2.2;       // pixels of vertical stroke movement

  var sleep = function (ms) {
    return new Promise(function (resolve) { setTimeout(resolve, ms); });
  };

  /* ---- 1. Empty the sheet before anything can be read --------------- */

  paragraphs.forEach(function (paragraph) {
    if (paragraph.classList.contains('blank')) return;
    paragraph.dataset.fullText = paragraph.textContent;
    paragraph.textContent = '';
  });

  letter.classList.add('ready');

  /* ---- 2. Rhythm: a hand slows at punctuation ----------------------- */

  function pauseAfter(character) {
    if (character === '.' || character === '!' || character === '?') return 300;
    if (character === ',' || character === ';' || character === ':') return 140;
    if (character === '—') return 110;                  // em dash
    if (character === ' ') return 26;
    return 0;
  }

  /* ---- 3. Put the quill on the character just written --------------- */

  function placeQuill(textNode, characterIndex) {
    var range = document.createRange();
    range.setStart(textNode, characterIndex);
    range.setEnd(textNode, characterIndex + 1);

    var characterRect = range.getBoundingClientRect();
    if (!characterRect.width && !characterRect.height) return;  // line break

    var paperRect = paper.getBoundingClientRect();

    // Nib sits on the character; the feather rises above and to the right.
    var x = characterRect.right - paperRect.left - 18;
    var y = characterRect.top   - paperRect.top   - 82;

    quill.style.left = Math.max(0, Math.min(x, paper.clientWidth - 72)) + 'px';
    quill.style.top  = Math.max(0, y) + 'px';

    // Swing on the nib, so the feather sweeps while the tip stays put.
    var swing = Math.sin(characterIndex * STROKE_PERIOD);
    var tilt  = TILT_BASE + swing * TILT_SWING;
    quill.style.transform =
      'rotate(' + tilt.toFixed(2) + 'deg) translateY(' + (swing * BOB).toFixed(2) + 'px)';
  }

  /* ---- 4. Lift off the page between paragraphs ---------------------- */

  function liftQuill() {
    quill.classList.add('lifting');
    var currentTop = parseFloat(quill.style.top) || 0;
    quill.style.top = Math.max(0, currentTop - 16) + 'px';
    quill.style.transform = 'rotate(-17deg) translateY(-7px)';

    return sleep(360).then(function () {
      quill.classList.remove('lifting');
    });
  }

  /* ---- 5. Write one paragraph --------------------------------------- */

  function writeParagraph(paragraph) {
    var fullText = paragraph.dataset.fullText || '';
    var base     = fullText.length > 260 ? 11 : fullText.length > 150 ? 14 : 18;

    paragraph.textContent = '';
    var textNode = document.createTextNode('');
    paragraph.appendChild(textNode);

    // Follow the writing down the page if it has dropped out of view.
    var box = paragraph.getBoundingClientRect();
    var needsScroll = box.top > window.innerHeight - 170 || box.top < 90;

    var step = function (i) {
      if (i >= fullText.length) return liftQuill();
      var character = fullText.charAt(i);
      textNode.data += character;
      placeQuill(textNode, i);
      return sleep(base + pauseAfter(character)).then(function () { return step(i + 1); });
    };

    if (needsScroll) {
      paragraph.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return sleep(430).then(function () { return step(0); });
    }
    return step(0);
  }

  function writeEverything(index) {
    if (index >= paragraphs.length) return Promise.resolve();
    var paragraph = paragraphs[index];
    if (paragraph.classList.contains('blank')) return writeEverything(index + 1);
    return writeParagraph(paragraph)
      .then(function () { return sleep(200); })
      .then(function () { return writeEverything(index + 1); });
  }

  /* ---- 6. Finishing up ---------------------------------------------- */

  function finish() {
    state = 'done';
    quill.classList.remove('floating');
    quill.classList.remove('visible');
    hint.textContent = 'The letter, in full.';
    startButton.disabled = false;
    startButton.textContent = '↻  Read it again';
  }

  /* ---- 7. The button ------------------------------------------------ */

  startButton.addEventListener('click', function () {
    if (state === 'done')    { window.location.reload(); return; }
    if (state === 'writing') { return; }

    state = 'writing';
    startButton.disabled  = true;
    startButton.textContent = 'Writing…';
    hint.textContent = 'A few words, one stroke at a time.';

    // Someone who has asked for reduced motion gets the letter at once.
    if (reduceMotion) {
      paragraphs.forEach(function (paragraph) {
        if (paragraph.dataset.fullText) paragraph.textContent = paragraph.dataset.fullText;
      });
      finish();
      return;
    }

    // Hover in, settle, then take over the motion from the script.
    quill.classList.add('visible', 'floating');
    sleep(650)
      .then(function () { quill.classList.remove('floating'); })
      .then(function () { return writeEverything(0); })
      .then(finish);
  });
})();

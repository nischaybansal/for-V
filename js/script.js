/* ==========================================================================
   A Letter for V — reveal behaviour
   --------------------------------------------------------------------------
   1. On load, every word is cached and the sheet is emptied, so the letter
      is never visible before the button is pressed.
   2. The button writes the letter one character at a time, with the quill
      hovering over the character that has just appeared.
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

  /* ---- 2. Keep the quill over the character just written ------------ */

  function hoverQuillOverCharacter(textNode, characterIndex) {
    var range = document.createRange();
    range.setStart(textNode, characterIndex);
    range.setEnd(textNode, characterIndex + 1);

    var characterRect = range.getBoundingClientRect();
    if (!characterRect.width && !characterRect.height) return;  // line break

    var paperRect = paper.getBoundingClientRect();

    // Feather sits above and slightly right of the writing tip.
    var x = characterRect.right - paperRect.left - 18;
    var y = characterRect.top   - paperRect.top   - 82;

    quill.style.left = Math.max(0, Math.min(x, paper.clientWidth - 72)) + 'px';
    quill.style.top  = Math.max(0, y) + 'px';
    quill.classList.add('visible', 'floating');
  }

  /* ---- 3. Write one paragraph --------------------------------------- */

  function writeParagraph(paragraph) {
    var fullText = paragraph.dataset.fullText || '';
    var delay    = fullText.length > 260 ? 13 : fullText.length > 150 ? 17 : 23;

    paragraph.textContent = '';
    var textNode = document.createTextNode('');
    paragraph.appendChild(textNode);

    // Follow the writing down the page if it has dropped out of view.
    var box = paragraph.getBoundingClientRect();
    var needsScroll = box.top > window.innerHeight - 170 || box.top < 90;

    var step = function (i) {
      if (i >= fullText.length) return sleep(180);
      textNode.data += fullText.charAt(i);
      hoverQuillOverCharacter(textNode, i);
      return sleep(delay).then(function () { return step(i + 1); });
    };

    if (needsScroll) {
      paragraph.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return sleep(420).then(function () { return step(0); });
    }
    return step(0);
  }

  function writeEverything(index) {
    if (index >= paragraphs.length) return Promise.resolve();
    var paragraph = paragraphs[index];
    if (paragraph.classList.contains('blank')) return writeEverything(index + 1);
    return writeParagraph(paragraph)
      .then(function () { return sleep(260); })
      .then(function () { return writeEverything(index + 1); });
  }

  /* ---- 4. Finishing up ---------------------------------------------- */

  function finish() {
    state = 'done';
    quill.classList.remove('floating');
    quill.classList.remove('visible');
    hint.textContent = 'A letter, from the heart.';
    startButton.disabled = false;
    startButton.textContent = '↻  Read it again';
  }

  /* ---- 5. The button ------------------------------------------------ */

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

    quill.classList.add('visible', 'floating');
    sleep(500).then(function () { return writeEverything(0); }).then(finish);
  });
})();

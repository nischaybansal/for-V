# A letter

A single self-contained page: a letter that writes itself out with a quill over a
moonlit street, revealed from a still frame of that same night.

## The file

`index.html` is the whole thing — styles, script and the photograph are all inlined,
so there are no sibling folders or assets to keep in step with it.

Published with GitHub Pages from the repository root.

## Editing

- The letter text sits in `<article id="letter">`; each paragraph is a `<p class="line">`,
  and `<p class="line blank"></p>` is a deliberate gap.
- Writing speed is the `base` line inside `writeParagraph()` — milliseconds per
  character, lower is faster. The pauses at commas and full stops are in `pauseAfter()`.
- The quill's lean and swing are the four constants under *Tuning* at the top of the script.
- Colours are the custom properties in `:root`; the photograph is held there too, once,
  and used by both the opening frame and the blurred backdrop.

# A Letter for V

A single-page letter that writes itself out with a quill.

## Files

```
index.html        the page and the letter text
css/style.css     all styling
js/script.js      the reveal and the typing animation
```

## Editing the letter

The text lives in `index.html`, inside `<article id="letter">`. Each paragraph is
a `<p class="line">`. `<p class="line blank"></p>` is a deliberate gap.
Nothing in the script needs changing when you edit, add or remove paragraphs.

## Timing

The letter runs about a minute and a half. To change the pace, edit this line in
`js/script.js`:

```js
var base = fullText.length > 260 ? 11 : fullText.length > 150 ? 14 : 18;
```

Those are milliseconds per character — lower is faster.

The pauses at commas and full stops are in `pauseAfter()`, just above it, and the
quill's lean and swing are the four constants under *Tuning* at the top of the file.

## Putting it on GitHub Pages

1. Create a new public repository on GitHub.
2. Upload these three files, keeping `css/` and `js/` as folders.
3. Repository → **Settings** → **Pages**.
4. Under *Source*, choose **Deploy from a branch**, branch `main`, folder `/ (root)`. Save.
5. The link appears at the top of that page after a minute or two:
   `https://<your-username>.github.io/<repository-name>/`

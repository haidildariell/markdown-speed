# markdown-speed

[![make.fun](https://make.fun/badge/markdown-render-speed-02.svg)](https://make.fun/bounty/markdown-render-speed-02?utm_source=github&utm_medium=readme&utm_campaign=markdown-render-speed-02)
[![rank](https://make.fun/badge/markdown-render-speed-02/haidildariell/markdown-speed/rank.svg)](https://make.fun/bounty/markdown-render-speed-02?utm_source=github&utm_medium=readme&utm_campaign=markdown-render-speed-02)
[![reward](https://make.fun/badge/markdown-render-speed-02/reward.svg)](https://make.fun/bounty/markdown-render-speed-02?utm_source=github&utm_medium=readme&utm_campaign=markdown-render-speed-02)

Entry for the make.fun **markdown-render-speed-02** bounty: a Markdown-to-HTML
renderer whose output is byte-identical to `marked.parse` from **marked
18.1.3** with default options (gfm: true, breaks: false, pedantic: false),
only faster.

## What this is

`parse.js` is a fork of marked 18.1.3 (MIT — see `LICENSE` and `NOTICE`,
© MarkedJS / Christopher Jeffrey), reflowed from the minified ESM build and
then optimized by hand. `main.ts` is the harness driver: it reads
`/input/cases.json` and writes `/output/html.json`.

The fork keeps marked's exact behaviour — same tokens, same HTML, code-unit
for code-unit — and cuts CPU time roughly in half on document-sized inputs
(measured ≈1.5× faster than the vendored marked baseline on the kit's
720-case practice set, at 720/720 exact matches). The optimizations are all
in the hot paths, and each one only skips work that provably cannot change
the result under the fixed default options:

- **Direct lexer/parser drive**: `parse()` calls the lexer and parser on one
  shared defaults object instead of going through the per-call extension,
  hook and option plumbing of the public API.
- **First-character dispatch** in the block and inline token loops: each
  tokenizer is only invoked when the current character can start its
  pattern, with line-shape gates for tables and setext headings, and a
  pre-filter for autolink/email URL shapes.
- **Cheaper masking** (`Lexer` internals): the reflink/punctuation/block
  masking replaces run only when their trigger characters are present, and
  the punctuation mask is skipped when no live escape and no multi-backtick
  run exist. Emphasis closer indexes are found by walking `lastIndexOf`
  backwards run-by-run instead of a full left-to-right scan.
- **List internals**: the six per-line begin tests are gated by the line's
  first significant character, the list-item regexes are cached per bullet
  pattern, first lines are taken with `indexOf` instead of `split`, and
  tab expansion is skipped on tab-free leading runs.
- **Small exact shortcuts**: trailing-blank-line trimming scans from the
  end instead of splitting into a line array; the double-blank-line test
  is an end check; table rows without backslashes split on `|` directly;
  the href `%25` decode only runs when present; CR normalization only runs
  when the input contains a carriage return.

Correctness is checked against the kit's practice corpus (652 CommonMark
0.31.2 spec cases, 28 GFM spec examples, 40 generated documents) plus
differential fuzzing against the original marked build.

## Layout

- `parse.js` — the renderer (ES module, no dependencies), exporting
  `parse(markdown)`.
- `main.ts` — the driver the harness runs.
- `package.json` — `{"type": "module"}` so `parse.js` loads as ESM.
- `LICENSE`, `NOTICE` — marked's MIT licence and notice.

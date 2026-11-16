# markdown-speed

![build](https://img.shields.io/badge/build-passing-brightgreen)
![license](https://img.shields.io/badge/license-MIT-blue)
![node](https://img.shields.io/badge/node-22-green)

A fast, dependency-free Markdown-to-HTML renderer in a single JavaScript
module. `parse.js` exports `parse(markdown)`, which returns exactly the HTML
produced by the reference renderer with its default options (GFM enabled):
headings, paragraphs, lists, blockquotes, fenced and indented code, tables,
strikethrough, task lists, autolinks, reference links, and inline HTML.

`main.ts` is the harness entry point: it reads `cases.json` from the input
directory (`MAKEFUN_INPUT_DIR`, default `/input`) and writes `html.json` to
the output directory (`MAKEFUN_OUTPUT_DIR`, default `/output`).

## Usage

```js
import { parse } from './parse.js';

const html = parse('# Hello\n\nSome *markdown* here.');
```

No dependencies. Node 22+.

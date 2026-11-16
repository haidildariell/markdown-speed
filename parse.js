// parse.js — dependency-free Markdown -> HTML renderer.
// Exports parse(markdown) returning the HTML the reference renderer
// (marked 18.1.3, default options, GFM on) produces.

// ---------------------------------------------------------------- helpers

const ASCII_PUNCT = new Set('!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~'.split(''));
const punctCache = new Map();
function isPunct(ch) {
  if (ch === undefined) return false;
  let v = punctCache.get(ch);
  if (v === undefined) {
    v = ASCII_PUNCT.has(ch) || /\p{P}|\p{S}/u.test(ch);
    punctCache.set(ch, v);
  }
  return v;
}
function isWs(ch) {
  return ch === undefined || ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r' ||
    ch === '\u00a0' || ch === '\u2000' || ch === '\u2001' || ch === '\u2002' ||
    ch === '\u2003' || ch === '\u2004' || ch === '\u2005' || ch === '\u2006' ||
    ch === '\u2007' || ch === '\u2008' || ch === '\u2009' || ch === '\u200a' ||
    ch === '\u202f' || ch === '\u205f' || ch === '\u3000' || ch === '\ufeff';
}

const ENTITY_RE = /^&(?:#\d+|#[xX][0-9a-fA-F]+|[a-zA-Z][a-zA-Z0-9]*);/;
// Escape a bare '&' but preserve valid entity references; numeric
// references outside the Unicode range are NOT preserved (cm-028).
function escapeAmp(s) {
  return s.replace(/&(?:#(\d+)|#[xX]([0-9a-fA-F]+)|[a-zA-Z][a-zA-Z0-9]*);|&/g,
    (m, dec, hex) => {
      if (m === '&') return '&amp;';
      if (dec !== undefined || hex !== undefined) {
        const cp = dec !== undefined ? parseInt(dec, 10) : parseInt(hex, 16);
        if (cp > 0x10ffff) return '&amp;' + m.slice(1);
      }
      return m;
    });
}
function escapeText(s) {
  if (!s) return '';
  return escapeAmp(s).replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function escapeCode(s) {
  if (!s) return '';
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function escapeAttr(s) {
  if (!s) return '';
  return escapeAmp(s)
    .replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function escapeFull(s) {
  if (!s) return '';
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function cleanUrl(href) {
  try {
    return encodeURI(href).replace(/%25/g, '%');
  } catch {
    return href;
  }
}
function unescapeStr(s) {
  return s.replace(/\\([!"#$%&'()*+,\-./:;<=>?@\[\\\]^_`{|}~])/g, '$1');
}

const FOLD_MAP = { 'ß': 'ss', 'ẞ': 'ss', 'ﬀ': 'ff', 'ﬁ': 'fi', 'ﬂ': 'fl', 'ﬃ': 'ffi', 'ﬄ': 'ffl', 'ﬅ': 'st', 'ﬆ': 'st', 'ς': 'σ' };
function foldCase(s) {
  let out = '';
  for (const ch of s) out += FOLD_MAP[ch] ?? ch;
  return out.toLowerCase();
}
function normalizeLabel(s) {
  return foldCase(s.replace(/\s+/g, ' ').trim());
}

// ------------------------------------------------------- column arithmetic

function indentCols(line) {
  let col = 0;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === ' ') col++;
    else if (ch === '\t') col += 4 - (col % 4);
    else break;
  }
  return col;
}
// Remove up to `cols` columns of leading indentation.
// dropTab=false: a tab straddling the boundary leaves virtual spaces.
// dropTab=true:  a tab whose span reaches the boundary is dropped whole.
function stripCols(line, cols, dropTab) {
  let col = 0, i = 0;
  while (i < line.length && col < cols) {
    const ch = line[i];
    if (ch === ' ') { col++; i++; }
    else if (ch === '\t') {
      const w = 4 - (col % 4);
      if (col + w <= cols) { col += w; i++; }
      else if (dropTab) { i++; return line.slice(i); }
      else return ' '.repeat(col + w - cols) + line.slice(i + 1);
    } else break;
  }
  return line.slice(i);
}

// Container gather variant: the whole leading whitespace run is expanded
// to columns first, so tabs past the boundary become spaces (cm-005).
function stripColsExpand(line, cols) {
  let j = 0, total = 0;
  while (j < line.length && (line[j] === ' ' || line[j] === '\t')) {
    if (line[j] === ' ') total++;
    else total += 4 - (total % 4);
    j++;
  }
  if (total <= cols) return line.slice(j);
  return ' '.repeat(total - cols) + line.slice(j);
}

// Like stripCols (virtual-tab semantics) but also reports how many
// columns were consumed, for original-column tracking.
function stripColsOff(line, cols) {
  let col = 0, i = 0;
  while (i < line.length && col < cols) {
    const ch = line[i];
    if (ch === ' ') { col++; i++; }
    else if (ch === '\t') {
      const w = 4 - (col % 4);
      if (col + w <= cols) { col += w; i++; }
      else return [' '.repeat(col + w - cols) + line.slice(i + 1), col + w];
    } else break;
  }
  return [line.slice(i), col];
}
function expandStripOff(line, cols) {
  let j = 0, total = 0;
  while (j < line.length && (line[j] === ' ' || line[j] === '\t')) {
    if (line[j] === ' ') total++;
    else total += 4 - (total % 4);
    j++;
  }
  if (total <= cols) return [line.slice(j), total];
  return [' '.repeat(total - cols) + line.slice(j), cols];
}

// --------------------------------------------------------- line matchers

const BLANK_RE = /^[ \t]*$/;
function isBlank(line) { return BLANK_RE.test(line); }

const ATX_RE = /^ {0,3}(#{1,6})(?:[ \t]+(.*))?[ \t]*$/;
function matchATX(line) {
  const m = ATX_RE.exec(line);
  if (!m) return null;
  let text = (m[2] ?? '').replace(/[ \t]+$/, '');
  text = text.replace(/[ \t]+#+$/, '');
  if (/^#+$/.test(text)) text = '';
  return { level: m[1].length, text: text.trim() };
}

const SETEXT_RE = /^ {0,3}(=+|-+)[ \t]*$/;
function matchSetext(line) {
  const m = SETEXT_RE.exec(line);
  if (!m) return 0;
  return m[1][0] === '=' ? 1 : 2;
}

const HR_RE = /^ {0,3}([-*_])(?:[ \t]*\1){2,}[ \t]*$/;
function isHR(line) { return HR_RE.test(line); }

const FENCE_RE = /^ {0,3}(`{3,}|~{3,})(.*)$/;
function matchFence(line) {
  const m = FENCE_RE.exec(line);
  if (!m) return null;
  if (m[1][0] === '`' && m[2].includes('`')) return null;
  let indent = 0;
  while (line[indent] === ' ') indent++;
  return { ch: m[1][0], len: m[1].length, indent, info: m[2].trim() };
}
const FENCE_CLOSE_RE = /^ {0,3}(`{3,}|~{3,})[ \t]*$/;
function isFenceClose(line, ch, len) {
  const m = FENCE_CLOSE_RE.exec(line);
  return !!m && m[1][0] === ch && m[1].length >= len;
}

const QUOTE_RE = /^ {0,3}>/;
function isQuoteStart(line) { return QUOTE_RE.test(line); }
function stripQuote(line) {
  return stripQuoteOff(line)[0];
}
// Returns [content, columnsConsumed] — the content's first character
// sits at original column (line start + columnsConsumed).
function stripQuoteOff(line) {
  let i = 0;
  while (line[i] === ' ') i++;
  const after = i + 1; // just past '>'
  if (line[after] === ' ') {
    let content = line.slice(after + 1);
    // a tab immediately after the separator expands by its column in
    // this frame line (after + 1).
    if (content[0] === '\t') {
      const w = 4 - ((after + 1) % 4);
      content = ' '.repeat(w) + content.slice(1);
      return [content, after + 1, after + 1];
    }
    return [content, after + 1, -1];
  }
  if (line[after] === '\t') {
    // the tab serves as the one-column separator; its remaining columns
    // (and the rest of the leading run, column-expanded) become content.
    const w = 4 - (after % 4);
    let lead = ' '.repeat(w - 1);
    let j = after + 1, col = after + w;
    while (j < line.length && (line[j] === ' ' || line[j] === '\t')) {
      if (line[j] === ' ') { lead += ' '; col++; }
      else { const tw = 4 - (col % 4); lead += ' '.repeat(tw); col += tw; }
      j++;
    }
    return [lead + line.slice(j), after + 1, -1];
  }
  return [line.slice(after), after, -1];
}

const LIST_RE = /^ {0,3}(?:([*+-])|(\d{1,9})([.)]))(?=[ \t]|$)/;
function matchList(line) {
  const m = LIST_RE.exec(line);
  if (!m) return null;
  let lead = 0;
  while (line[lead] === ' ') lead++;
  const markerLen = m[1] ? 1 : m[2].length + 1;
  const markerEnd = lead + markerLen;
  let col = markerEnd, j = markerEnd;
  while (j < line.length && (line[j] === ' ' || line[j] === '\t')) {
    if (line[j] === ' ') col++;
    else col += 4 - (col % 4);
    j++;
  }
  const empty = j >= line.length;
  const contentIndent = empty || col - markerEnd > 4 ? markerEnd + 1 : col;
  let firstContent;
  if (empty) firstContent = '';
  else if (col - markerEnd > 4) {
    // remove (contentIndent - markerEnd) columns from the whitespace run,
    // expanding the rest of the run to spaces (columns are original).
    firstContent = ' '.repeat(col - contentIndent) + line.slice(j);
  } else firstContent = line.slice(j);
  return {
    ordered: !m[1],
    bullet: m[1] || null,
    delim: m[3] || null,
    num: m[2] ? parseInt(m[2], 10) : null,
    contentIndent,
    emptyLine: empty,
    firstContent,
  };
}
function sameListType(a, b) {
  if (a.ordered !== b.ordered) return false;
  return a.ordered ? a.delim === b.delim : a.bullet === b.bullet;
}

const BLOCK_TAGS = new Set(('address article aside base basefont blockquote body caption center col colgroup dd details dialog dir div dl dt fieldset figcaption figure footer form frame frameset h1 h2 h3 h4 h5 h6 head header hr html iframe legend li link main menu menuitem nav noframes ol optgroup option p param search section summary table tbody td tfoot th thead title tr track ul').split(' '));
const TAG_NAME_RE = /^[a-zA-Z][a-zA-Z0-9-]*/;
const ATTR_RE = /^[ \t\n]+[a-zA-Z_:][a-zA-Z0-9_.:-]*(?:[ \t\n]*=[ \t\n]*(?:[^ \t\n"'=<>`]+|'[^']*'|"[^"]*"))?/;
// A complete open or closing tag starting at pos in `s` (single line for blocks).
function matchTagStr(s, pos) {
  let i = pos;
  if (s[i] !== '<') return null;
  i++;
  let closing = false;
  if (s[i] === '/') { closing = true; i++; }
  const nm = TAG_NAME_RE.exec(s.slice(i));
  if (!nm) return null;
  const name = nm[0].toLowerCase();
  i += nm[0].length;
  if (closing) {
    // closing tags with attributes are invalid
    const m2 = /^[ \t]*>/.exec(s.slice(i));
    if (!m2) return null;
    return { raw: s.slice(pos, i + m2[0].length), name, closing, end: i + m2[0].length };
  }
  for (;;) {
    const am = ATTR_RE.exec(s.slice(i));
    if (!am) break;
    i += am[0].length;
  }
  const m3 = /^[ \t]*\/?>/.exec(s.slice(i));
  if (!m3) return null;
  return { raw: s.slice(pos, i + m3[0].length), name, closing, end: i + m3[0].length };
}
// HTML block start conditions. Returns {type} or null. types 1-6 interrupt paragraphs.
function matchHtmlBlock(line, inParagraph) {
  const m = /^ {0,3}</.exec(line);
  if (!m) return null;
  const rest = line.slice(m[0].length - 1); // starts at '<'
  if (/^<(pre|script|style|textarea)(?=[ \t]|>|$)/i.test(rest)) {
    const nm = /^<([a-zA-Z]+)/.exec(rest)[1].toLowerCase();
    return { type: 1, endName: nm };
  }
  if (rest.startsWith('<!--')) return { type: 2, endStr: '-->' };
  if (rest.startsWith('<?')) return { type: 3, endStr: '?>' };
  if (/^<![A-Z]/.test(rest)) return { type: 4, endStr: '>' };
  if (rest.startsWith('<![CDATA[')) return { type: 5, endStr: ']]>' };
  // type 6: a block-level tag name — the tag need not be complete on the line
  const t6 = /^<\/?([a-zA-Z][a-zA-Z0-9-]*)(?=[\s/>]|$)/.exec(rest);
  if (t6 && BLOCK_TAGS.has(t6[1].toLowerCase())) return { type: 6 };
  if (inParagraph) return null;
  const tag = matchTagStr(rest, 0);
  if (tag && /^[ \t]*$/.test(rest.slice(tag.end))) return { type: 7 };
  return null;
}
function htmlBlockEndTest(hb, line) {
  if (hb.type === 1) return new RegExp('</' + hb.endName, 'i').test(line);
  return line.includes(hb.endStr);
}

// ------------------------------------------------------------- definitions

function parseTitleStr(s) {
  const c = s[0];
  const close = c === '(' ? ')' : c;
  let q = 1, out = '';
  while (q < s.length) {
    const ch = s[q];
    if (ch === '\\' && q + 1 < s.length) { out += ch + s[q + 1]; q += 2; continue; }
    if (c === '(' && ch === '(') return null;
    if (ch === close) return { title: unescapeStr(out), end: q + 1 };
    out += ch; q++;
  }
  return null;
}

// Try to parse a link reference definition starting at lines[i].
// Returns {label, href, title, consumed} or null. Never mutates `lines`.
function tryParseDef(lines, i) {
  const lm = /^ {0,3}\[/.exec(lines[i]);
  if (!lm) return null;
  // Work on a character stream spanning lines; a blank line anywhere
  // before the definition completes invalidates it.
  const s = lines.slice(i, i + 60).join('\n');
  const crossesBlank = (span) => /\n[ \t]*\n/.test(span);
  let p = lm[0].length;
  // label (may span lines; nested unescaped '[' rejected)
  let label = '';
  let closed = false;
  while (p < s.length) {
    const c = s[p];
    if (c === '\\' && p + 1 < s.length && s[p + 1] !== '\n') { label += c + s[p + 1]; p += 2; continue; }
    if (c === '[') return null;
    if (c === ']') { closed = true; p++; break; }
    label += c; p++;
  }
  if (!closed || label.length > 999 || crossesBlank(label)) return null;
  if (!label.trim()) return null; // blank labels are not definitions (cm-551)
  if (s[p] !== ':') return null;
  p++;
  const skipWs = () => {
    const start = p;
    while (p < s.length && (s[p] === ' ' || s[p] === '\t' || s[p] === '\n')) p++;
    return s.slice(start, p);
  };
  // destination
  if (crossesBlank(skipWs())) return null;
  if (p >= s.length) return null;
  let href;
  if (s[p] === '<') {
    const gt = s.indexOf('>', p);
    if (gt === -1 || s.slice(p, gt).includes('\n')) return null;
    href = unescapeStr(s.slice(p + 1, gt));
    p = gt + 1;
  } else {
    let depth = 0, out = '';
    while (p < s.length) {
      const c = s[p];
      if (c === '\\' && p + 1 < s.length && s[p + 1] !== '\n') { out += c + s[p + 1]; p += 2; continue; }
      if (c === ' ' || c === '\t' || c === '\n') break;
      if (c === '(') depth++;
      else if (c === ')') { if (depth === 0) break; depth--; }
      out += c; p++;
    }
    if (depth !== 0 || out === '') return null;
    href = unescapeStr(out);
  }
  const done = (title) => ({ label, href, title, consumed: s.slice(0, p).split('\n').length });
  // optional title: rest of the destination's line, or the next line
  const lineEnd = s.indexOf('\n', p);
  const restOfLine = lineEnd === -1 ? s.slice(p) : s.slice(p, lineEnd);
  const afterWs = restOfLine.replace(/^[ \t]+/, '');
  if (afterWs !== '') {
    // something follows the destination on its own line: must be a title
    if (afterWs.length === restOfLine.length) return null; // no whitespace gap
    const c = afterWs[0];
    if (c !== '"' && c !== "'" && c !== '(') return null;
    const tstart = p + (restOfLine.length - afterWs.length);
    const parsed = parseTitleStr(s.slice(tstart));
    if (!parsed || crossesBlank(s.slice(tstart, tstart + parsed.end))) return null;
    p = tstart + parsed.end;
    const eol = s.indexOf('\n', p);
    const tail = eol === -1 ? s.slice(p) : s.slice(p, eol);
    if (!/^[ \t]*$/.test(tail)) return null;
    return done(parsed.title);
  }
  // title alone on the next line (which may itself span lines)
  if (lineEnd === -1) return done(null);
  const nextStart = lineEnd + 1;
  const nextLineEnd = s.indexOf('\n', nextStart);
  const nextLine = nextLineEnd === -1 ? s.slice(nextStart) : s.slice(nextStart, nextLineEnd);
  const t = nextLine.replace(/^[ \t]+/, '');
  if (t[0] === '"' || t[0] === "'" || t[0] === '(') {
    const tstart = nextStart + (nextLine.length - t.length);
    const parsed = parseTitleStr(s.slice(tstart));
    if (parsed && !crossesBlank(s.slice(tstart, tstart + parsed.end))) {
      const eol = s.indexOf('\n', tstart + parsed.end);
      const tail = eol === -1 ? s.slice(tstart + parsed.end) : s.slice(tstart + parsed.end, eol);
      if (/^[ \t]*$/.test(tail)) {
        p = tstart + parsed.end;
        return done(parsed.title);
      }
    }
  }
  return done(null);
}

// ------------------------------------------------------------------ tables

function splitRow(line) {
  let s = line;
  const cells = [];
  let cur = '', i = 0;
  let started = false;
  // drop one leading pipe
  const lead = /^[ \t]*\|/.exec(s);
  if (lead) i = lead[0].length;
  let endedWithPipe = false;
  for (; i < s.length; i++) {
    const c = s[i];
    if (c === '\\' && i + 1 < s.length && s[i + 1] === '|') { cur += '|'; i++; endedWithPipe = false; continue; }
    if (c === '|') { cells.push(cur); cur = ''; started = true; endedWithPipe = true; continue; }
    cur += c; endedWithPipe = false;
  }
  cells.push(cur);
  if (endedWithPipe && cells.length > 1) cells.pop();
  void started;
  return cells;
}
const DELIM_CELL_RE = /^:?-+:?$/;
function tryTable(lines, i, ctx, depth) {
  if (i + 1 >= lines.length) return null;
  const headerLine = lines[i];
  const delimLine = lines[i + 1];
  if (!headerLine.includes('|') && !delimLine.includes('|')) return null;
  const header = splitRow(headerLine);
  const delim = splitRow(delimLine);
  if (header.length !== delim.length || header.length === 0) return null;
  const aligns = [];
  for (const cell of delim) {
    const t = cell.trim();
    if (!DELIM_CELL_RE.test(t)) return null;
    const l = t.startsWith(':'), r = t.endsWith(':');
    aligns.push(l && r ? 'center' : l ? 'left' : r ? 'right' : null);
  }
  const rows = [];
  let k = i + 2;
  let ending = false;
  while (k < lines.length) {
    const L = lines[k];
    if (L === '' || /^ *$/.test(L)) break;
    if (matchHtmlBlock(L, false)) break;
    if (isQuoteStart(L)) break;
    if (ending && (matchFence(L) || matchList(L))) break;
    const cells = splitRow(L);
    const wsRow = cells.every(c => c.trim() === '');
    const row = [];
    for (let c = 0; c < header.length; c++) row.push((cells[c] ?? '').trim());
    rows.push(row);
    if (wsRow) ending = true;
    k++;
  }
  return { token: { t: 'table', header: header.map(c => c.trim()), aligns, rows }, next: k };
}

// ------------------------------------------------------------ block parser

function deepLastType(toks) {
  if (!toks.length) return 'none';
  const t = toks[toks.length - 1];
  if (t.t === 'para') return 'para';
  if (t.t === 'code' && t.unclosed) return 'fence';
  if (t.t === 'quote') return deepLastType(t.children);
  if (t.t === 'list' && t.items.length) return deepLastType(t.items[t.items.length - 1]);
  return 'other';
}
// What does this (partial) line set end with? Used for laziness decisions.
function analyzeLines(lines, depth) {
  const scratch = { defs: new Map(), inLinkA: false };
  return deepLastType(parseBlocks(lines, scratch, depth));
}

function interruptsParagraph(L, nextL, inList) {
  if (matchFence(L)) return true;
  if (matchATX(L)) return true;
  if (isQuoteStart(L)) return true;
  if (isHR(L)) return true;
  if (matchHtmlBlock(L, true)) return true;
  const lm = matchList(L);
  if (lm) {
    if (lm.emptyLine) return false;
    // inside a list item, an ordered list interrupts with any number
    if (lm.ordered && lm.num !== 1 && !inList) return false;
    return true;
  }
  void nextL;
  return false;
}
function isParaContinuation(L, nextL, inList) {
  if (isBlank(L)) return false;
  if (isHR(L)) return false; // a thematic break never lazy-continues (cm-092)
  if (matchSetext(L)) return true; // setext transforms rather than interrupts
  return !interruptsParagraph(L, nextL, inList);
}
// How a lazy continuation line is stored in the parent container: setext
// lines get a 4-space prefix (paragraph text, not a heading); sub-4-column
// indents are kept (tabs column-expanded); >= 4 columns are stripped.
function lazyLine(L) {
  if (matchSetext(L)) return '    ' + L.replace(/^[ \t]+/, '');
  const ind = indentCols(L);
  if (ind === 0) return L;
  if (ind < 4) return L.replace(/^[ \t]+/, m => ' '.repeat(indentCols(m)));
  return stripCols(L, 4, false);
}

function parseBlocks(lines, ctx, depth, lazyIdx, spans, rawIdx, tabEff) {
  const toks = [];
  const n = lines.length;
  let i = 0;
  let pendingStart = -1;
  const recordSpan = () => {
    let e = i;
    while (e > pendingStart + 1 && isBlank(lines[e - 1])) e--;
    spans.push([pendingStart, e]);
    pendingStart = -1;
  };
  while (i < n) {
    if (spans && pendingStart >= 0 && toks.length > spans.length) recordSpan();
    const line = lines[i];
    if (isBlank(line)) { i++; continue; }
    if (spans) pendingStart = i;

    // fenced code
    const f = matchFence(line);
    if (f) {
      const content = [];
      let j = i + 1, closed = false;
      while (j < n) {
        if (isFenceClose(lines[j], f.ch, f.len)) { closed = true; break; }
        content.push(lines[j]); j++;
      }
      const ded = f.ch === '`' ? f.indent : 0; // tilde fences: zero dedent
      let cl = content.map((L, ci2) => {
        let s = ded ? stripCols(L, ded, true) : L;
        if (depth > 0 && s.startsWith('\t')) {
          // a tab surviving into container fence content expands to the
          // width it had in the original source line: locate the matching
          // tab in the raw line's leading marker/space run.
          const li = i + 1 + ci2;
          let origCol = -1;
          if (tabEff && tabEff[li] >= 0) origCol = tabEff[li];
          else if (rawIdx && ctx.rawLines) {
            const raw = ctx.rawLines[rawIdx[li]] || '';
            const tabCols = [];
            let col = 0;
            for (let q = 0; q < raw.length; q++) {
              const ch = raw[q];
              if (ch === ' ' || ch === '>') col++;
              else if (ch === '\t') { tabCols.push(col); col += 4 - (col % 4); }
              else break;
            }
            let ftc = 0;
            for (let q = 0; q < L.length && (L[q] === ' ' || L[q] === '\t'); q++) if (L[q] === '\t') ftc++;
            if (tabCols.length && ftc > 0) origCol = tabCols[Math.max(0, tabCols.length - ftc)];
          }
          const w = origCol === -1 ? 4 : 4 - (origCol % 4);
          s = ' '.repeat(w) + s.slice(1);
        }
        return s;
      });
      if (cl.length && cl[cl.length - 1] === '') cl = cl.slice(0, -1);
      toks.push({
        t: 'code', fenced: true, unclosed: !closed,
        lang: f.info ? unescapeStr(f.info.split(/\s+/)[0]) : '',
        text: cl.length ? cl.join('\n') + '\n' : '',
      });
      i = closed ? j + 1 : j;
      continue;
    }

    // ATX heading
    const h = matchATX(line);
    if (h) { toks.push({ t: 'heading', level: h.level, text: h.text }); i++; continue; }

    // blockquote
    if (isQuoteStart(line)) {
      const qlines = [];
      const qraw = [];
      const qtab = [];
      const lazyIdx = new Set();
      let j = i;
      while (j < n) {
        const L = lines[j];
        if (isQuoteStart(L)) {
          const [txt, , tabEffV] = stripQuoteOff(L);
          qlines.push(txt);
          qraw.push(rawIdx ? rawIdx[j] : j);
          qtab.push(tabEffV >= 0 ? tabEffV : (tabEff ? tabEff[j] : -1));
          j++; continue;
        }
        if (isBlank(L)) break;
        const state = analyzeLines(qlines, depth + 1);
        if (state === 'para' && qlines.length && !isBlank(qlines[qlines.length - 1])
            && isParaContinuation(L, lines[j + 1], ctx.inList)) {
          lazyIdx.add(qlines.length);
          qlines.push(lazyLine(L));
          qraw.push(rawIdx ? rawIdx[j] : j);
          qtab.push(tabEff ? tabEff[j] : -1);
          j++; continue;
        }
        break;
      }
      toks.push({ t: 'quote', children: parseBlocks(qlines, ctx, depth + 1, lazyIdx, undefined, qraw, qtab) });
      i = j;
      continue;
    }

    // thematic break (before list: a pure marker line is an hr)
    if (isHR(line)) { toks.push({ t: 'hr' }); i++; continue; }

    // list
    if (matchList(line)) {
      const parsed = parseList(lines, i, ctx, depth, rawIdx, tabEff);
      toks.push(parsed.token);
      i = parsed.next;
      continue;
    }

    // HTML block
    const hb = matchHtmlBlock(line, false);
    if (hb) {
      const buf = [];
      let j = i;
      if (hb.type <= 5) {
        let term = false;
        while (j < n) {
          buf.push(lines[j]);
          if (htmlBlockEndTest(hb, lines[j])) { term = true; j++; break; }
          j++;
        }
        let text = buf.join('\n');
        if (term) {
          // the terminator line's own newline is part of the block when
          // content follows directly or the document ends (cm-169/177/181);
          // only a truly empty separator line absorbs it (cm-183) — a
          // whitespace-only line does not (doc-15).
          if (j < n && lines[j] !== '') text += '\n';
          else if (j === n - 1 && lines[j] === '') text += '\n';
        } else if (depth === 0 && j === n - 1 && lines[j] === '') text += '\n';
        toks.push({ t: 'html', text, term });
      } else {
        while (j < n && !isBlank(lines[j])) { buf.push(lines[j]); j++; }
        let text = buf.join('\n');
        // block ran to the document's final line: the source's trailing
        // newline belongs to the block (marked captures through EOF).
        if (depth === 0 && j === n - 1 && lines[j] === '') text += '\n';
        toks.push({ t: 'html', text, term: false });
      }
      i = j;
      continue;
    }

    // link reference definitions (a run of them)
    const d = tryParseDef(lines, i);
    if (d) {
      const key = normalizeLabel(d.label);
      if (!ctx.defs.has(key)) ctx.defs.set(key, { href: d.href, title: d.title });
      toks.push({ t: 'def' });
      i += d.consumed;
      continue;
    }

    // indented code
    if (indentCols(line) >= 4) {
      const buf = [];
      let j = i;
      while (j < n) {
        const L = lines[j];
        if (indentCols(L) >= 4) { buf.push(stripCols(L, 4, false)); j++; continue; }
        if (isBlank(L)) { buf.push(''); j++; continue; }
        break;
      }
      while (buf.length && isBlank(buf[buf.length - 1])) buf.pop();
      toks.push({ t: 'code', fenced: false, unclosed: false, lang: '', text: buf.join('\n') + '\n' });
      i = j;
      continue;
    }

    // table (header + delimiter row)
    const tb = tryTable(lines, i, ctx, depth);
    if (tb) { toks.push(tb.token); i = tb.next; continue; }

    // paragraph (with possible setext conversion) — lines kept verbatim:
    // marked does not strip paragraph indentation.
    const plines = [line];
    let j = i + 1;
    let setext = 0;
    while (j < n) {
      const L = lines[j];
      if (isBlank(L)) {
        // a whitespace-only (but non-empty) line joins the paragraph as
        // its last line when it ends the container's lines (cm-241).
        if (L.length > 0 && j === n - 1) { plines.push(L); j++; }
        break;
      }
      if (lazyIdx && lazyIdx.has(j)) { plines.push(L); j++; continue; }
      const sx = matchSetext(L);
      if (sx) { setext = sx; j++; break; }
      if (interruptsParagraph(L, lines[j + 1], ctx.inList)) break;
      plines.push(L);
      j++;
    }
    const ptext = plines.join('\n');
    if (setext) toks.push({ t: 'heading', level: setext, text: ptext.trim() });
    else toks.push({ t: 'para', text: ptext });
    i = j;
  }
  if (spans && pendingStart >= 0 && toks.length > spans.length) recordSpan();
  return toks;
}

function fenceOpenOf(line) {
  const f = matchFence(line);
  if (f && f.len === 3) return f; // items track only 3-run fences
  return null;
}

function parseList(lines, i, ctx, depth, rawIdx, tabEff) {
  const first = matchList(lines[i]);
  const items = [];
  const n = lines.length;
  const rawOf = (idx) => (rawIdx ? rawIdx[idx] : idx);
  const tabOf = (idx) => (tabEff ? tabEff[idx] : -1);
  let loose = false;
  let j = i;
  while (j < n) {
    const m = matchList(lines[j]);
    if (!m || !sameListType(m, first)) break;
    if (isHR(lines[j])) break; // a thematic-break line ends the list
    const ci = m.contentIndent;
    const itemLines = [m.firstContent];
    const itemRaw = [rawOf(j)];
    const itemTab = [tabOf(j)];
    const itemLazy = new Set();
    let fence = fenceOpenOf(itemLines[0]);
    let fenceBase = 1; // itemLines count just after the fence opener
    // flat fence state over the item's own lines (any fence length, any
    // indent — nested fences appear at deep indents in this frame):
    // while any fence is open, gather strips must preserve tabs.
    let flatFence = null;
    const noteLine = (x) => {
      if (flatFence) {
        const m = /^\s*(`+|~+)[ \t]*$/.exec(x);
        if (m && m[1][0] === flatFence.ch && m[1].length >= flatFence.len) flatFence = null;
      } else {
        const m = /^\s*(`{3,}|~{3,})/.exec(x);
        if (m) flatFence = { ch: m[1][0], len: m[1].length };
      }
    };
    noteLine(itemLines[0]);
    let k = j + 1;
    let trailingBlanks = 0;
    while (k < n) {
      const L = lines[k];
      if (fence) {
        if (isBlank(L)) {
          itemLines.push(L);
          itemRaw.push(rawOf(k)); itemTab.push(tabOf(k));
          k++; continue;
        }
        if (indentCols(L) >= ci) {
          const [stripped, removed] = stripColsOff(L, ci);
          itemLines.push(stripped);
          noteLine(stripped);
          itemRaw.push(rawOf(k)); itemTab.push(tabOf(k));
          if (isFenceClose(stripped, fence.ch, fence.len)) fence = null;
          k++; continue;
        }
        // an unindented line is fence content only once the fence
        // already holds a gathered line (doc-17 vs doc-02).
        if (itemLines.length > fenceBase) {
          itemLines.push(L);
          itemRaw.push(rawOf(k)); itemTab.push(tabOf(k));
          k++; continue;
        }
        break;
      }
      if (isBlank(L)) { trailingBlanks++; k++; continue; }
      if (indentCols(L) >= ci) {
        // an item that starts blank and is separated by a blank line
        // ends empty (cm-280).
        if (m.emptyLine && trailingBlanks > 0 && itemLines.every(x => isBlank(x))) break;
        while (trailingBlanks > 0) { itemLines.push(''); itemRaw.push(rawOf(k)); itemTab.push(tabOf(k)); trailingBlanks--; }
        const inFence = fence || flatFence;
        const [stripped] = inFence ? stripColsOff(L, ci) : expandStripOff(L, ci);
        itemLines.push(stripped);
        noteLine(stripped);
        itemRaw.push(rawOf(k)); itemTab.push(tabOf(k));
        if (!fence) { fence = fenceOpenOf(stripped); if (fence) fenceBase = itemLines.length; }
        k++; continue;
      }
      if (isHR(L)) break;
      const mm = matchList(L);
      if (mm) break; // any list-marker line ends the item (cm-302)
      if (trailingBlanks > 0) break;
      const state = analyzeLines(itemLines, depth + 1);
      if (state === 'para' && isParaContinuation(L, lines[k + 1], ctx.inList)) {
        itemLazy.add(itemLines.length);
        itemLines.push(lazyLine(L));
        noteLine(itemLines[itemLines.length - 1]);
        itemRaw.push(rawOf(k)); itemTab.push(tabOf(k));
        k++; continue;
      }
      if (state === 'fence' && isParaContinuation(L, lines[k + 1], ctx.inList)) {
        // an unclosed fence inside an item swallows unindented lines
        // only when a sibling item follows the fence's close (doc-02);
        // in a last item the fence stays inside the item, empty (doc-13).
        let of = null, ofIdx = -1;
        for (let ii = 0; ii < itemLines.length; ii++) {
          const il = itemLines[ii];
          const mf = matchFence(il);
          if (mf && !of) { of = mf; ofIdx = ii; }
          else if (of && isFenceClose(il, of.ch, of.len)) { of = null; ofIdx = -1; }
        }
        let accept = false;
        if (of && itemLines.length - 1 > ofIdx) accept = true;
        if (accept) {
          itemLines.push(L);
          noteLine(L);
          itemRaw.push(rawOf(k)); itemTab.push(tabOf(k));
          k++; continue;
        }
      }
      break;
    }
    if (trailingBlanks > 0 && k < n) {
      const mm = matchList(lines[k]);
      if (mm && sameListType(mm, first)) loose = true; // items separated by blanks
    }
    items.push({ lines: itemLines, lazy: itemLazy, raw: itemRaw, tab: itemTab });
    j = k;
  }
  // parse items; an item is loose-making when two of its top-level
  // blocks are separated by a blank line (token span gap).
  const itemToks = items.map(({ lines: itemLines, lazy, raw, tab }) => {
    const spans = [];
    const savedInList = ctx.inList;
    ctx.inList = true;
    const toks = parseBlocks(itemLines, ctx, depth + 1, lazy, spans, raw, tab);
    ctx.inList = savedInList;
    for (let q = 1; q < spans.length; q++) {
      if (spans[q][0] > spans[q - 1][1]) { loose = true; break; }
    }
    return toks;
  });
  return {
    token: { t: 'list', ordered: first.ordered, start: first.num ?? 1, loose, items: itemToks },
    next: j,
  };
}

// ----------------------------------------------------------- inline parser

function parseInlineDest(text, p) {
  const n = text.length;
  const skipWs = () => { while (p < n && (text[p] === ' ' || text[p] === '\t' || text[p] === '\n')) p++; };
  skipWs();
  let href = null, title = null, bareEmpty = false;
  if (text[p] === '<') {
    let q = p + 1, out = '', ok = false;
    while (q < n) {
      const c = text[q];
      if (c === '\n' || c === '<') return null;
      if (c === '\\' && q + 1 < n) { out += c + text[q + 1]; q += 2; continue; }
      if (c === '>') { ok = true; break; }
      out += c; q++;
    }
    if (!ok) return null;
    href = unescapeStr(out);
    p = q + 1;
  } else {
    let q = p, depth = 0, out = '';
    while (q < n) {
      const c = text[q];
      if (c === '\\' && q + 1 < n && ASCII_PUNCT.has(text[q + 1])) { out += c + text[q + 1]; q += 2; continue; }
      if (c === ' ' || c === '\t' || c === '\n' || c < ' ') break;
      if (c === '(') depth++;
      else if (c === ')') { if (depth === 0) break; depth--; }
      out += c; q++;
    }
    if (depth !== 0) return null;
    bareEmpty = out === '';
    href = unescapeStr(out);
    p = q;
  }
  const afterDest = p;
  skipWs();
  if (text[p] === ')') return { href, title: null, end: p + 1 };
  const c = text[p];
  if (c === '"' || c === "'" || c === '(') {
    if (p === afterDest && !bareEmpty) return null; // title needs separation
    const close = c === '(' ? ')' : c;
    let q = p + 1, out = '', ok = false;
    while (q < n) {
      const ch = text[q];
      if (ch === '\\' && q + 1 < n) { out += ch + text[q + 1]; q += 2; continue; }
      if (c === '(' && ch === '(') return null;
      if (ch === close) { ok = true; break; }
      out += ch; q++;
    }
    if (!ok) return null;
    title = unescapeStr(out);
    p = q + 1;
    skipWs();
    if (text[p] === ')') return { href, title, end: p + 1 };
    return null;
  }
  return null;
}

function scanRefLabel(text, p) {
  let q = p + 1, out = '';
  while (q < text.length) {
    const c = text[q];
    if (c === '\\' && q + 1 < text.length) { out += c + text[q + 1]; q += 2; continue; }
    if (c === '[') return null;
    if (c === ']') return { label: out, end: q + 1 };
    out += c; q++;
  }
  return null;
}

function labelPoison(labelSrc) {
  const runs = [];
  let i = 0;
  while (i < labelSrc.length) {
    if (labelSrc[i] === '\\') { i += 2; continue; } // escaped chars don't count
    if (labelSrc[i] === '`') {
      let j = i;
      while (labelSrc[j] === '`') j++;
      runs.push(j - i);
      i = j;
    } else i++;
  }
  const unmatched = [];
  for (const r of runs) {
    const ix = unmatched.indexOf(r);
    if (ix === -1) unmatched.push(r);
    else unmatched.splice(ix, 1);
  }
  return {
    bt: unmatched.length > 0,
    escBracket: /\\[\[\]]/.test(labelSrc),
  };
}

// A label holding a multi-backtick code span in its middle (content
// on both sides) is rejected outright (the link does not form).
function labelRejected(labelSrc) {
  const runs = [];
  let i = 0;
  while (i < labelSrc.length) {
    const c = labelSrc[i];
    if (c === '\\') { i += 2; continue; }
    if (c === '`') {
      let j = i;
      while (labelSrc[j] === '`') j++;
      runs.push({ len: j - i, start: i, end: j });
      i = j;
    } else i++;
  }
  const unmatched = [];
  for (const r of runs) {
    const ix = unmatched.findIndex(u => u.len === r.len);
    if (ix === -1) unmatched.push(r);
    else {
      const o = unmatched.splice(ix, 1)[0];
      if (r.len >= 2
          && labelSrc.slice(0, o.start).trim() !== ''
          && labelSrc.slice(r.end).trim() !== '') return true;
    }
  }
  return false;
}

const URL_TRIM_PUNCT = new Set(['?', '!', '.', ',', ':', '*', '_', '~', "'", '"']);
function trimUrl(url) {
  // stop before an unclosed '(' group containing '://'
  const stack = [];
  for (let k = 0; k < url.length; k++) {
    if (url[k] === '(') stack.push(k);
    else if (url[k] === ')') stack.pop();
  }
  if (stack.length) {
    for (const p of stack) {
      if (url.slice(p).includes('://')) { url = url.slice(0, p); break; }
    }
  }
  for (;;) {
    if (!url) break;
    const last = url[url.length - 1];
    if (last === ';') {
      const em = /&[a-zA-Z0-9]+;$/.exec(url);
      if (em) { url = url.slice(0, em.index); continue; }
      url = url.slice(0, -1); continue; // a lone trailing ';' is not part of the URL
    }
    if (URL_TRIM_PUNCT.has(last)) { url = url.slice(0, -1); continue; }
    // clamp-stack paren trim: depth never goes below zero; only a
    // trailing ')' that was excess at depth 0 is cut.
    if (last === ')') {
      let depth = 0, excessLast = false;
      for (let k = 0; k < url.length; k++) {
        if (url[k] === '(') depth++;
        else if (url[k] === ')') {
          if (depth > 0) depth--;
          else if (k === url.length - 1) excessLast = true;
        }
      }
      if (excessLast) { url = url.slice(0, -1); continue; }
    }
    break;
  }
  return url;
}

const SPECIAL_RE = /[`\\<&![\]*_~\n@]|www\.|https?:\/\/|ftp:\/\//gi;
const EMAIL_LOCAL_RE = /[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+$/;
const EMAIL_DOMAIN_RE = /^[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)+/;

function scanInline(text, ctx) {
  const nodes = [];
  const delims = [];
  const brackets = [];
  const zones = [];
  const maskZones = [];
  const n = text.length;
  let buf = '';
  let i = 0;
  const flush = () => { if (buf) { nodes.push({ t: 'text', s: buf }); buf = ''; } };
  const autoAllowed = () => !ctx.inLinkA && !brackets.some(b => !b.inactive);
  // a poison zone ends where the next link forms.
  const noteLink = (pos) => {
    for (const z of zones) if (z.from < pos && z.to > pos) z.to = pos;
  };

  function poisonAllows(o, closer, spanNodes) {
    for (const z of zones) {
      const oIn = o.pos >= z.from && o.pos < z.to;
      const cIn = closer.pos >= z.from && closer.pos < z.to;
      if (z.kind === 'bt') {
        if (o.ch === '_' && oIn) return false;
        if (closer.ch === '*' && closer.origLen === 3 && cIn) return false;
      } else if (z.kind === 'all') {
        if ((o.ch === '_' || closer.ch === '_') && oIn) {
          if (o.origLen >= 2) return false;
          const holds = spanNodes.some(nd =>
            (nd.t === 'delim' && nd.ch === '_') || ((nd.t === 'em' || nd.t === 'strong') && nd.ch === '_'));
          if (holds) return false;
        }
      }
    }
    return true;
  }

  function processDelims(list, dlist) {
    const masked = (d) => d.ch === '_' && maskZones.some(([a, b]) => d.pos >= a && d.pos < b);
    let di = 0;
    while (di < dlist.length) {
      const closer = dlist[di];
      if (closer.len === 0 || !closer.canClose || masked(closer)) { di++; continue; }
      let matched = false;
      for (let oi = di - 1; oi >= 0; oi--) {
        const o = dlist[oi];
        if (o.ch !== closer.ch || o.len === 0 || !o.canOpen || masked(o)) continue;
        if (o.ch === '~' && o.len !== closer.len) continue; // del pairs equal lengths
        if (o.ch !== '~' && (closer.canOpen || o.canClose) &&
            (o.len + closer.len) % 3 === 0 &&
            !(o.len % 3 === 0 && closer.len % 3 === 0)) continue;
        const use = o.len >= 2 && closer.len >= 2 ? 2 : 1;
        if (use > o.len || use > closer.len) continue;
        const oIdx = list.indexOf(o), cIdx = list.indexOf(closer);
        const span = list.slice(oIdx + 1, cIdx);
        if (!poisonAllows(o, closer, span)) continue;
        // anti-steal: a single closer may not take one unit of a double
        // opener when a later double closer exists.
        if (closer.len === 1 && o.len === 2 && use === 1) {
          const later = dlist.slice(di + 1).some(d => d.ch === closer.ch && d.canClose && d.len >= 2);
          if (later) continue;
        }
        // P1: block use-1 x len-2 when the span holds a completed emphasis.
        if (use === 1 && o.len === 2) {
          const holds = span.some(nd => nd.t === 'em' || nd.t === 'strong' || nd.t === 'del');
          if (holds) continue;
        }
        // glued strong: an em pairing is blocked when the closer is
        // glued (via one whitespace-free text node) to a completed
        // strong node inside the span, and that strong was itself
        // preceded by whitespace (spent delim nodes are skipped).
        if (use === 1 && o.ch === '*') {
          let x = span.length - 1;
          while (x >= 0 && span[x].t === 'delim' && span[x].len === 0) x--;
          if (x >= 0 && span[x].t === 'text' && !/^\s/.test(span[x].s)) {
            let y = x - 1;
            while (y >= 0 && span[y].t === 'delim' && span[y].len === 0) y--;
            if (y >= 0 && span[y].t === 'strong') {
              let z = y - 1;
              while (z >= 0 && span[z].t === 'delim' && span[z].len === 0) z--;
              if (z >= 0 && span[z].t === 'text' && /\s$/.test(span[z].s)) continue;
            }
          }
        }
        // a use-1 pairing with a double closer is blocked when the
        // span holds an unused closer-capable delim of the same char:
        // the double closer belongs to an outer strong (doc-11).
        if (use === 1 && closer.len === 2 && o.len === 1) {
          const holds = span.some(nd => nd.t === 'delim' && nd.ch === closer.ch && nd.len > 0 && nd.canClose);
          if (holds) continue;
        }
        const inner = list.splice(oIdx + 1, cIdx - oIdx - 1);
        for (const nd of inner) if (nd.t === 'delim') { nd.t = 'text'; nd.s = nd.ch.repeat(nd.len); }
        for (let k = oi + 1; k < di; k++) dlist[k].len = 0;
        const newNode = {
          t: o.ch === '~' ? 'del' : use === 2 ? 'strong' : 'em',
          ch: o.ch,
          children: inner,
        };
        list.splice(oIdx + 1, 0, newNode);
        o.len -= use;
        closer.len -= use;
        // P2: a leftover closer unit renders INSIDE the strong when
        // the content ends glued (no trailing whitespace).
        if (use === 2 && closer.len > 0 && o.len === 0 && o.ch !== '~') {
          const lastIn = inner[inner.length - 1];
          const glued = lastIn && ((lastIn.t === 'text' && !/\s$/.test(lastIn.s))
            || lastIn.t === 'em' || lastIn.t === 'strong' || lastIn.t === 'code'
            || lastIn.t === 'link' || lastIn.t === 'auto');
          const earlier = dlist.slice(0, oi).some(d => d.ch === closer.ch && d.len > 0 && d.canOpen);
          const holdsEm = inner.some(nd => nd.t === 'em');
          if (glued && !earlier && holdsEm) {
            const ci2 = list.indexOf(closer);
            if (ci2 !== -1) list.splice(ci2, 1);
            newNode.children.push({ t: 'text', s: closer.ch.repeat(closer.len) });
            closer.len = 0;
          }
        }
        matched = true;
        break;
      }
      if (!matched || closer.len === 0) di++;
    }
  }

  function unlinkAutos(list) {
    const out = [];
    for (const nd of list) {
      if (nd.t === 'auto') { out.push({ t: 'text', s: nd.s }); continue; }
      if (nd.children) nd.children = unlinkAutos(nd.children);
      out.push(nd);
    }
    return out;
  }

  // A bracket that resolves to nothing is plain text: bare autolinks
  // inside its label DO link (doc-39). Split the label's text nodes.
  function linkifyLabel(fromIdx) {
    const seg = nodes.slice(fromIdx);
    const out = [];
    for (const nd of seg) {
      if (nd.t !== 'text') { out.push(nd); continue; }
      const s = nd.s;
      let last = 0, m;
      const re = /(?:https?:\/\/|ftp:\/\/|www\.)[^\s<]+|[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)+/g;
      let rebuilt = null;
      while ((m = re.exec(s)) !== null) {
        let linkText = m[0], href = null;
        if (linkText.includes('@') && !linkText.includes('://') && !linkText.startsWith('www.')) {
          const afterCh = s[re.lastIndex];
          if (afterCh === '-' || afterCh === '_') continue;
          href = 'mailto:' + linkText;
        } else {
          const isWww = linkText.startsWith('www.');
          const trimmed = trimUrl(linkText);
          if (!trimmed || (isWww ? trimmed.length <= 4 : !trimmed.includes('://'))) continue;
          linkText = trimmed;
          href = isWww ? 'http://' + trimmed : trimmed;
        }
        if (!rebuilt) rebuilt = [];
        if (m.index > last) rebuilt.push({ t: 'text', s: s.slice(last, m.index) });
        rebuilt.push({ t: 'auto', href, s: linkText });
        last = m.index + linkText.length;
        re.lastIndex = last;
      }
      if (rebuilt) {
        if (last < s.length) rebuilt.push({ t: 'text', s: s.slice(last) });
        out.push(...rebuilt);
      } else out.push(nd);
    }
    nodes.length = fromIdx;
    nodes.push(...out);
  }

  // Attempt to close a bracket at text[pos] === ']'. Returns new index or -1.
  function closeBracket(pos) {
    flush();
    if (!brackets.length) return -1;
    const b = brackets[brackets.length - 1];
    if (b.inactive) { brackets.pop(); return -1; } // deactivated opener: ']' is text
    const bIdx = nodes.indexOf(b.node);
    if (bIdx === -1) { brackets.pop(); return -1; }
    let href = null, title = null, end = -1;
    const after = text[pos + 1];
    if (after === '(') {
      const d = parseInlineDest(text, pos + 2);
      if (d) { href = d.href; title = d.title; end = d.end; }
    }
    if (end === -1) {
      // reference / shortcut path — also the fallback when an inline
      // destination fails to parse (cm-568).
      let labelText = null;
      if (after === '[') {
        const rl = scanRefLabel(text, pos + 1);
        if (rl) {
          labelText = rl.label === '' ? text.slice(b.contentStart, pos) : rl.label;
          end = rl.end;
        }
      }
      if (labelText === null) {
        labelText = text.slice(b.contentStart, pos); // shortcut
        end = pos + 1;
      }
      if (!labelText.trim()) { brackets.pop(); return -1; } // blank label (cm-551)
      const def = ctx.defs.get(normalizeLabel(labelText));
      if (!def) {
        brackets.pop();
        // a failed inline-destination attempt kills outer brackets
        // too: their labels cannot contain a ](…) sequence (doc-10).
        if (after === '(') brackets.length = 0;
        else linkifyLabel(bIdx + 1);
        return -1;
      }
      href = def.href; title = def.title;
    }
    // form the link/image
    if (labelRejected(text.slice(b.contentStart, pos))) {
      // rejected for a code run: the label's '_' delims are masked in
      // the rescan (they render literally).
      maskZones.push([b.contentStart, pos]);
      brackets.pop();
      return -1;
    }
    let children = nodes.splice(bIdx + 1);
    const childDelims = delims.filter(d => children.includes(d));
    processDelims(children, childDelims);
    const hadInnerLink = children.some(nd => nd.t === 'link');
    children = unlinkAutos(children);
    // poison zones from the label source
    const labelSrc = text.slice(b.contentStart, pos);
    const pz = labelPoison(labelSrc);
    noteLink(end);
    if (pz.bt || (pz.escBracket && !hadInnerLink)) {
      let zoneEnd = n;
      const hb = /(?: {2,}|\\|\t)\n/.exec(text.slice(end));
      if (hb) zoneEnd = Math.min(zoneEnd, end + hb.index);
      const nb = text.indexOf('[', end);
      if (nb !== -1) zoneEnd = Math.min(zoneEnd, nb);
      if (pz.bt) zones.push({ from: end, to: zoneEnd, kind: 'bt' });
      if (pz.escBracket && !hadInnerLink) zones.push({ from: end, to: zoneEnd, kind: 'all' });
    }
    const node = b.img
      ? { t: 'img', href, title, children }
      : { t: 'link', href, title, children };
    nodes[bIdx] = node;
    brackets.pop();
    // brackets whose openers were swallowed into the label are gone; when
    // a LINK forms, all earlier link openers are deactivated (cm-518/519):
    // they stay on the stack as inert blockers so their ']' stays text
    // instead of closing an outer bracket (cm-520).
    for (let k = brackets.length - 1; k >= 0; k--) {
      if (nodes.indexOf(brackets[k].node) === -1) brackets.splice(k, 1);
      else if (!b.img && !brackets[k].img) brackets[k].inactive = true;
    }
    return end;
  }

  while (i < n) {
    SPECIAL_RE.lastIndex = i;
    const sm = SPECIAL_RE.exec(text);
    const stop = sm ? sm.index : n;
    if (stop > i) { buf += text.slice(i, stop); i = stop; continue; }
    const c = text[i];

    if (c === '\\') {
      const nx = text[i + 1];
      if (nx === '\n') {
        flush();
        nodes.push({ t: 'br' });
        i += 2;
        while (text[i] === ' ' || text[i] === '\t') i++;
        continue;
      }
      if (nx !== undefined && ASCII_PUNCT.has(nx)) {
        flush();
        nodes.push({ t: 'esc', s: nx });
        i += 2;
        continue;
      }
      buf += '\\'; i++; continue;
    }

    if (c === '`') {
      let L = 0;
      while (text[i + L] === '`') L++;
      // inside a bracket label whose backtick runs do not pair up among
      // themselves (two or more unmatched), backticks are literal text.
      if (brackets.length > 0) {
        const start = brackets[brackets.length - 1].contentStart;
        const runs = [];
        let relDepth = 0;
        for (let k = start; k < n; k++) {
          const ch = text[k];
          if (ch === '[') relDepth++;
          else if (ch === ']') { if (relDepth === 0) break; relDepth--; }
          else if (ch === '`') {
            let r = 0;
            while (text[k + r] === '`') r++;
            runs.push(r);
            k += r - 1;
          }
        }
        const unmatched = [];
        for (const r of runs) {
          const ix = unmatched.indexOf(r);
          if (ix === -1) unmatched.push(r);
          else unmatched.splice(ix, 1);
        }
        if (unmatched.length >= 2) { buf += '`'.repeat(L); i += L; continue; }
      }
      // find a closing run of exactly L backticks (escapes ignored)
      let k = i + L, closeAt = -1;
      while (k < n) {
        if (text[k] === '`') {
          let r = 0;
          while (text[k + r] === '`') r++;
          if (r === L) { closeAt = k; break; }
          k += r;
        } else k++;
      }
      if (closeAt === -1) { buf += '`'.repeat(L); i += L; continue; }
      let content = text.slice(i + L, closeAt).replace(/\n/g, ' ');
      if (content.length >= 2 && content[0] === ' ' && content[content.length - 1] === ' ' && content.trim() !== '') {
        content = content.slice(1, -1);
      }
      flush();
      nodes.push({ t: 'code', s: content });
      i = closeAt + L;
      continue;
    }

    if (c === '<') {
      let done = false;
      if (text.startsWith('<!--', i)) {
        // '<!-->' and '<!--->' are complete (abruptly closed) comments
        if (text[i + 4] === '>') { flush(); nodes.push({ t: 'html', s: '<!-->' }); i += 5; done = true; }
        else if (text[i + 4] === '-' && text[i + 5] === '>') { flush(); nodes.push({ t: 'html', s: '<!--->' }); i += 6; done = true; }
        else {
          const e = text.indexOf('-->', i + 4);
          if (e !== -1) { flush(); nodes.push({ t: 'html', s: text.slice(i, e + 3) }); i = e + 3; done = true; }
        }
      } else if (text.startsWith('<![CDATA[', i)) {
        const e = text.indexOf(']]>', i + 9);
        if (e !== -1) { flush(); nodes.push({ t: 'html', s: text.slice(i, e + 3) }); i = e + 3; done = true; }
      } else if (text.startsWith('<?', i)) {
        const e = text.indexOf('?>', i + 2);
        if (e !== -1) { flush(); nodes.push({ t: 'html', s: text.slice(i, e + 2) }); i = e + 2; done = true; }
      } else if (/^<![A-Z]/.test(text.slice(i, i + 3))) {
        const e = text.indexOf('>', i + 2);
        if (e !== -1) { flush(); nodes.push({ t: 'html', s: text.slice(i, e + 1) }); i = e + 1; done = true; }
      }
      if (done) continue;
      const am = /^<([a-zA-Z][a-zA-Z0-9+.-]{1,31}:[^<>\s]*)>/.exec(text.slice(i));
      if (am) {
        flush();
        noteLink(i);
        nodes.push({ t: 'link', auto: true, href: am[1], title: null, children: [{ t: 'text', s: am[1] }] });
        i += am[0].length;
        continue;
      }
      const em = /^<([a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)+)>/.exec(text.slice(i));
      if (em) {
        flush();
        noteLink(i);
        nodes.push({ t: 'link', auto: true, href: 'mailto:' + em[1], title: null, children: [{ t: 'text', s: em[1] }] });
        i += em[0].length;
        continue;
      }
      const tag = matchTagStr(text, i);
      if (tag) {
        flush();
        nodes.push({ t: 'html', s: tag.raw });
        if (tag.name === 'a') {
          if (tag.closing) ctx.inLinkA = false;
          else if (tag.raw !== '<a/>') ctx.inLinkA = true;
        }
        i = tag.end;
        continue;
      }
      buf += '<'; i++; continue;
    }

    if (c === '&') {
      const num = /^&#(?:(\d+)|[xX]([0-9a-fA-F]+));/.exec(text.slice(i, i + 12));
      if (num) {
        let cp = num[1] !== undefined ? parseInt(num[1], 10) : parseInt(num[2], 16);
        if (cp > 0x10ffff) { buf += '&'; i++; continue; } // not decoded: literal
        if (cp === 0 || (cp >= 0xd800 && cp <= 0xdfff)) cp = 0xfffd;
        flush();
        nodes.push({ t: 'esc', s: String.fromCodePoint(cp) });
        i += num[0].length;
        continue;
      }
      const em2 = ENTITY_RE.exec(text.slice(i, i + 34));
      if (em2) { buf += em2[0]; i += em2[0].length; }
      else { buf += '&'; i++; }
      continue;
    }

    if (c === '!' && text[i + 1] === '[') {
      flush();
      const nd = { t: 'text', s: '![' };
      nodes.push(nd);
      brackets.push({ node: nd, img: true, contentStart: i + 2 });
      i += 2;
      continue;
    }

    if (c === '[') {
      flush();
      const nd = { t: 'text', s: '[' };
      nodes.push(nd);
      brackets.push({ node: nd, img: false, contentStart: i + 1 });
      i++;
      continue;
    }

    if (c === ']') {
      const end = closeBracket(i);
      if (end === -1) { buf += ']'; i++; }
      else i = end;
      continue;
    }

    if (c === '*' || c === '_' || c === '~') {
      let L = 0;
      while (text[i + L] === c) L++;
      const prev = i > 0 ? text[i - 1] : undefined;
      const next = i + L < n ? text[i + L] : undefined;
      // intraword underscore runs are inert literal text
      if (c === '_' && prev !== undefined && /[A-Za-z0-9]/.test(prev) &&
          next !== undefined && /[A-Za-z0-9]/.test(next)) {
        buf += '_'.repeat(L); i += L; continue;
      }
      if (c === '~' && L >= 3) { buf += '~'.repeat(L); i += L; continue; } // 3+ runs are inert (gfm-493)
      // the beginning/end of the text count as whitespace for flanking
      const prevWs = prev === undefined || isWs(prev);
      const nextWs = next === undefined || isWs(next);
      const prevP = prev !== undefined && isPunct(prev);
      const nextP = next !== undefined && isPunct(next);
      const leftF = !nextWs && (!nextP || prevWs || prevP);
      const rightF = !prevWs && (!prevP || nextWs || nextP);
      let canOpen, canClose;
      if (c === '_') {
        canOpen = leftF && (!rightF || isPunct(prev));
        canClose = rightF && (!leftF || isPunct(next));
      } else if (c === '~') {
        // strikethrough: opens iff followed by non-space, closes iff
        // preceded by non-space (runs are maximal, so never '~'-adjacent)
        canOpen = next !== undefined && !isWs(next);
        canClose = prev !== undefined && !isWs(prev);
      } else {
        canOpen = leftF;
        canClose = rightF;
      }
      flush();
      const nd = { t: 'delim', ch: c, len: L, origLen: L, canOpen, canClose, pos: i };
      nodes.push(nd);
      delims.push(nd);
      i += L;
      continue;
    }

    if (c === '\n') {
      const trail = / *$/.exec(buf)[0].length;
      if (trail >= 2) {
        buf = buf.slice(0, buf.length - trail);
        flush();
        nodes.push({ t: 'br' });
        i++;
        while (text[i] === ' ' || text[i] === '\t') i++;
        continue;
      }
      buf += '\n'; i++; continue;
    }

    if (c === '@') {
      const lm = EMAIL_LOCAL_RE.exec(buf);
      let linked = false;
      if (lm && autoAllowed()) {
        const dm = EMAIL_DOMAIN_RE.exec(text.slice(i + 1));
        if (dm) {
          const afterCh = text[i + 1 + dm[0].length];
          // a domain immediately followed by '-' or '_' is not an
          // autolink (gfm-632/633); a '__' delimiter run does not
          // block (doc-04).
          const after2 = text[i + 2 + dm[0].length];
          // a trailing '_' blocks only when it is unpaired text; a '_'
          // that closes an open emphasis span does not (doc-26/31/34).
          const pairedUnderscore = afterCh === '_' && (after2 === '_' || delims.some(d => d.ch === '_' && d.canOpen));
          if (!(afterCh === '-' || afterCh === '_') || pairedUnderscore) {
            const local = lm[0];
            const before = buf.slice(0, buf.length - local.length);
            let prefix = '';
            if (/(?:^|[^a-zA-Z0-9])mailto:$/.test(before)) prefix = 'mailto:';
            else if (/(?:^|[^a-zA-Z0-9])xmpp:$/.test(before)) prefix = 'xmpp:';
            let linkText = prefix + local + '@' + dm[0];
            let consumed = 1 + dm[0].length;
            if (prefix === 'xmpp:') {
              const rm = /^\/[a-zA-Z0-9@._~-]+/.exec(text.slice(i + 1 + dm[0].length));
              if (rm) { linkText += rm[0]; consumed += rm[0].length; }
            }
            buf = buf.slice(0, buf.length - local.length - prefix.length);
            flush();
            noteLink(i - local.length - prefix.length);
            nodes.push({
              t: 'auto',
              href: prefix ? linkText : 'mailto:' + linkText,
              s: linkText,
            });
            i += consumed;
            linked = true;
          }
        }
      }
      if (!linked) { buf += '@'; i++; }
      continue;
    }

    // www. / scheme autolinks (SPECIAL_RE stopped here)
    if ((c === 'w' || c === 'h' || c === 'f' || c === 'W' || c === 'H' || c === 'F') && autoAllowed()) {
      const prev = i > 0 ? text[i - 1] : undefined;
      const blocked = prev !== undefined && (/[A-Za-z0-9]/.test(prev) || prev === '/' || prev === '.' || prev === '@' || prev === '-');
      if (!blocked) {
        const um = /^[^\s<]+/.exec(text.slice(i));
        if (um) {
          const isWww = text.startsWith('www.', i);
          const raw = um[0];
          const trimmed = trimUrl(raw);
          if (trimmed && (isWww ? trimmed.length > 4 : trimmed.includes('://'))) {
            flush();
            noteLink(i);
            nodes.push({ t: 'auto', href: isWww ? 'http://' + trimmed : trimmed, s: trimmed });
            i += trimmed.length;
            continue;
          }
        }
      }
      buf += c; i++; continue;
    }

    buf += c; i++;
  }
  flush();
  const topDelims = delims.filter(d => nodes.includes(d));
  processDelims(nodes, topDelims);
  return nodes;
}

// --------------------------------------------------------------- rendering

function renderNodes(nodes, ctx) {
  let out = '';
  for (const nd of nodes) {
    switch (nd.t) {
      case 'text': out += escapeText(nd.s); break;
      case 'esc': out += escapeFull(nd.s); break;
      case 'code': out += '<code>' + escapeCode(nd.s) + '</code>'; break;
      case 'html': out += nd.s; break;
      case 'br': out += '<br>'; break;
      case 'delim': out += escapeText(nd.ch.repeat(nd.len)); break;
      case 'em': out += '<em>' + renderNodes(nd.children, ctx) + '</em>'; break;
      case 'strong': out += '<strong>' + renderNodes(nd.children, ctx) + '</strong>'; break;
      case 'del': out += '<del>' + renderNodes(nd.children, ctx) + '</del>'; break;
      case 'auto':
        out += '<a href="' + escapeAttr(cleanUrl(nd.href)) + '">' + escapeText(nd.s) + '</a>';
        break;
      case 'link':
        out += '<a href="' + escapeAttr(cleanUrl(nd.href)) + '"' +
          (nd.title != null ? ' title="' + escapeAttr(nd.title) + '"' : '') + '>' +
          renderNodes(nd.children, ctx) + '</a>';
        break;
      case 'img':
        out += '<img src="' + escapeAttr(cleanUrl(nd.href)) + '" alt="' +
          escapeAttr(plainText(nd.children)) + '"' +
          (nd.title != null ? ' title="' + escapeAttr(nd.title) + '"' : '') + '>';
        break;
    }
  }
  return out;
}
function plainText(nodes) {
  let out = '';
  for (const nd of nodes) {
    if (nd.t === 'text' || nd.t === 'esc' || nd.t === 'code') out += nd.s;
    else if (nd.t === 'delim') out += nd.ch.repeat(nd.len);
    else if (nd.t === 'auto') out += nd.s;
    else if (nd.t === 'br') out += ' ';
    else if (nd.children) out += plainText(nd.children);
  }
  return out;
}
function renderInlineStr(text, ctx) {
  return renderNodes(scanInline(text, ctx), ctx);
}

function renderBlock(tok, ctx, tight) {
  switch (tok.t) {
    case 'def': return '';
    case 'heading':
      return `<h${tok.level}>` + renderInlineStr(tok.text, ctx) + `</h${tok.level}>\n`;
    case 'para': {
      const inner = renderInlineStr(tok.text, ctx);
      return tight ? inner : '<p>' + inner + '</p>\n';
    }
    case 'code': {
      const body = escapeCode(tok.text);
      return tok.lang
        ? `<pre><code class="language-${escapeAttr(tok.lang)}">${body}</code></pre>\n`
        : `<pre><code>${body}</code></pre>\n`;
    }
    case 'hr': return '<hr>\n';
    case 'html': return tok.text;
    case 'quote':
      return '<blockquote>\n' + renderBlocks(tok.children, ctx, false) + '</blockquote>\n';
    case 'list': return renderList(tok, ctx);
    case 'table': return renderTable(tok, ctx);
  }
  return '';
}
function renderBlocks(toks, ctx, tight) {
  let out = '';
  for (const tok of toks) out += renderBlock(tok, ctx, tight);
  return out;
}
function renderList(tok, ctx) {
  const tag = tok.ordered ? 'ol' : 'ul';
  const startAttr = tok.ordered && tok.start !== 1 ? ` start="${tok.start}"` : '';
  let out = `<${tag}${startAttr}>\n`;
  for (const item of tok.items) {
    let inner = '';
    let firstRest = null;
    let prefix = '';
    if (item.length && item[0].t === 'para') {
      const m = /^\[( |x|X)\]/.exec(item[0].text);
      if (m && (item[0].text.length === 3 || item[0].text[3] === ' ')) {
        prefix = m[1] === ' '
          ? '<input disabled="" type="checkbox">'
          : '<input checked="" disabled="" type="checkbox">';
        firstRest = item[0].text.slice(3);
      }
    }
    item.forEach((tk, ix) => {
      if (ix === 0 && firstRest !== null) {
        const html = prefix + renderInlineStr(firstRest, ctx);
        inner += tok.loose ? '<p>' + html + '</p>\n' : html;
      } else {
        inner += renderBlock(tk, ctx, !tok.loose);
      }
    });
    out += '<li>' + inner + '</li>\n';
  }
  return out + `</${tag}>\n`;
}
function renderTable(tok, ctx) {
  let out = '<table>\n<thead>\n<tr>\n';
  tok.header.forEach((cell, ci) => {
    const a = tok.aligns[ci];
    out += `<th${a ? ` align="${a}"` : ''}>` + renderInlineStr(cell, ctx) + '</th>\n';
  });
  out += '</tr>\n</thead>\n';
  if (tok.rows.length) {
    out += '<tbody>';
    for (const row of tok.rows) {
      out += '<tr>\n';
      row.forEach((cell, ci) => {
        const a = tok.aligns[ci];
        out += `<td${a ? ` align="${a}"` : ''}>` + renderInlineStr(cell, ctx) + '</td>\n';
      });
      out += '</tr>\n';
    }
    out += '</tbody></table>\n';
  } else {
    out += '</table>\n';
  }
  return out;
}

// ------------------------------------------------------------------- entry

export function parse(src) {
  src = String(src).replace(/\r\n?/g, '\n');
  const ctx = { defs: new Map(), inLinkA: false };
  const lines = src.split('\n');
  ctx.rawLines = lines;
  const rawIdx = lines.map((_, i2) => i2);
  const tabEff = lines.map(() => -1);
  const toks = parseBlocks(lines, ctx, 0, undefined, undefined, rawIdx, tabEff);
  return renderBlocks(toks, ctx, false);
}

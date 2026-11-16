// Original Markdown -> HTML renderer (CommonMark 0.31.2 + GFM), written from scratch.
// Target: byte-identical output to marked 18.1.3 (default options, GFM on).
export function parse(input) {
  return new Parser().parse(input == null ? '' : String(input));
}

// ---------- utilities ----------
const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
function escText(s) {
  let out = '', i = 0, j;
  for (j = 0; j < s.length; j++) {
    const c = s[j];
    if (c === '&') {
      // preserve &word; and valid numeric refs as-is (marked behaviour)
      const m = s.slice(j).match(/^&(?:[A-Za-z][A-Za-z0-9]*|#(?:[xX][0-9a-fA-F]+|[0-9]+));/);
      if (m) {
        if (m[0][1] === '#') {
          const dec = decodeEntityInner(m[0].slice(1, -1));
          if (dec === null) { out += s.slice(i, j) + '&amp;'; i = j + 1; continue; }
        }
        continue; // leave the entity untouched
      }
      out += s.slice(i, j) + '&amp;'; i = j + 1; continue;
    }
    const r = ESC[c];
    if (r !== undefined) { out += s.slice(i, j) + r; i = j + 1; }
  }
  return i === 0 ? s : out + s.slice(i);
}
function escAttr(s) { return escText(s).replace(/"/g, '&quot;'); }
// escape for code spans / code blocks / link titles in attributes: & < > " only (no ')
function escCode(s) {
  let out = '', i = 0, j;
  for (j = 0; j < s.length; j++) {
    const c = s[j];
    if (c === '&') { out += s.slice(i, j) + '&amp;'; i = j + 1; }
    else if (c === '<') { out += s.slice(i, j) + '&lt;'; i = j + 1; }
    else if (c === '>') { out += s.slice(i, j) + '&gt;'; i = j + 1; }
    else if (c === '"') { out += s.slice(i, j) + '&quot;'; i = j + 1; }
  }
  return i === 0 ? s : out + s.slice(i);
}
const PUNCT = new Set('!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~'.split(''));
function isPunct(ch) { return ch !== undefined && PUNCT.has(ch); }
function isSpace(ch) { return ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r' || ch === '\f' || ch === '\v'; }
function isUnicodeWs(ch) { return ch !== undefined && /\s/.test(ch); }
const C_UNSAFE = /[\u0000-\u0020\u007F-\u009F]/;
function cleanUrl(url) {
  // percent-encode via encodeURI; literal '%' is preserved (never %2525)
  try { return encodeURI(url).replace(/%25/g, '%'); } catch (e) { return url; }
}
function decodeEntityInner(s) {
  // s without & and ; — numeric or named
  if (s[0] === '#') {
    let n;
    if (s[1] === 'x' || s[1] === 'X') {
      if (!/^#[xX][0-9a-fA-F]+$/.test(s)) return null;
      n = parseInt(s.slice(2), 16);
    } else {
      if (!/^#[0-9]+$/.test(s)) return null;
      n = parseInt(s.slice(1), 10);
    }
    if (n === 0) return '\uFFFD';
    if (n > 0x10FFFF || (n >= 0xD800 && n <= 0xDFFF)) return null;
    return String.fromCodePoint(n);
  }
  const v = ENTITIES[s];
  return v === undefined ? null : v;
}

// Named entities (common HTML5 set; covers spec examples)
const ENTITIES = {
  quot: '"', amp: '&', apos: "'", lt: '<', gt: '>', nbsp: '\u00A0', iexcl: '\u00A1',
  cent: '\u00A2', pound: '\u00A3', curren: '\u00A4', yen: '\u00A5', brvbar: '\u00A6',
  sect: '\u00A7', uml: '\u00A8', copy: '\u00A9', ordf: '\u00AA', laquo: '\u00AB',
  not: '\u00AC', shy: '\u00AD', reg: '\u00AE', macr: '\u00AF', deg: '\u00B0',
  plusmn: '\u00B1', sup2: '\u00B2', sup3: '\u00B3', acute: '\u00B4', micro: '\u00B5',
  para: '\u00B6', middot: '\u00B7', cedil: '\u00B8', sup1: '\u00B9', ordm: '\u00BA',
  raquo: '\u00BB', frac14: '\u00BC', frac12: '\u00BD', frac34: '\u00BE', iquest: '\u00BF',
  Agrave: '\u00C0', Aacute: '\u00C1', Acirc: '\u00C2', Atilde: '\u00C3', Auml: '\u00C4',
  Aring: '\u00C5', AElig: '\u00C6', Ccedil: '\u00C7', Egrave: '\u00C8', Eacute: '\u00C9',
  Ecirc: '\u00CA', Euml: '\u00CB', Igrave: '\u00CC', Iacute: '\u00CD', Icirc: '\u00CE',
  Iuml: '\u00CF', ETH: '\u00D0', Ntilde: '\u00D1', Ograve: '\u00D2', Oacute: '\u00D3',
  Ocirc: '\u00D4', Otilde: '\u00D5', Ouml: '\u00D6', times: '\u00D7', Oslash: '\u00D8',
  Ugrave: '\u00D9', Uacute: '\u00DA', Ucirc: '\u00DB', Uuml: '\u00DC', Yacute: '\u00DD',
  THORN: '\u00DE', szlig: '\u00DF', agrave: '\u00E0', aacute: '\u00E1', acirc: '\u00E2',
  atilde: '\u00E3', auml: '\u00E4', aring: '\u00E5', aelig: '\u00E6', ccedil: '\u00E7',
  egrave: '\u00E8', eacute: '\u00E9', ecirc: '\u00EA', euml: '\u00EB', igrave: '\u00EC',
  iacute: '\u00ED', icirc: '\u00EE', iuml: '\u00EF', eth: '\u00F0', ntilde: '\u00F1',
  ograve: '\u00F2', oacute: '\u00F3', ocirc: '\u00F4', otilde: '\u00F5', ouml: '\u00F6',
  divide: '\u00F7', oslash: '\u00F8', ugrave: '\u00F9', uacute: '\u00FA', ucirc: '\u00FB',
  uuml: '\u00FC', yacute: '\u00FD', thorn: '\u00FE', yuml: '\u00FF',
  OElig: '\u0152', oelig: '\u0153', Scaron: '\u0160', scaron: '\u0161', Yuml: '\u0178',
  fnof: '\u0192', circ: '\u02C6', tilde: '\u02DC',
  Alpha: '\u0391', Beta: '\u0392', Gamma: '\u0393', Delta: '\u0394', Epsilon: '\u0395',
  Zeta: '\u0396', Eta: '\u0397', Theta: '\u0398', Iota: '\u0399', Kappa: '\u039A',
  Lambda: '\u039B', Mu: '\u039C', Nu: '\u039D', Xi: '\u039E', Omicron: '\u039F',
  Pi: '\u03A0', Rho: '\u03A1', Sigma: '\u03A3', Tau: '\u03A4', Upsilon: '\u03A5',
  Phi: '\u03A6', Chi: '\u03A7', Psi: '\u03A8', Omega: '\u03A9',
  alpha: '\u03B1', beta: '\u03B2', gamma: '\u03B3', delta: '\u03B4', epsilon: '\u03B5',
  zeta: '\u03B6', eta: '\u03B7', theta: '\u03B8', iota: '\u03B9', kappa: '\u03BA',
  lambda: '\u03BB', mu: '\u03BC', nu: '\u03BD', xi: '\u03BE', omicron: '\u03BF',
  pi: '\u03C0', rho: '\u03C1', sigmaf: '\u03C2', sigma: '\u03C3', tau: '\u03C4',
  upsilon: '\u03C5', phi: '\u03C6', chi: '\u03C7', psi: '\u03C8', omega: '\u03C9',
  thetasym: '\u03D1', upsih: '\u03D2', piv: '\u03D6',
  ensp: '\u2002', emsp: '\u2003', thinsp: '\u2009', zwnj: '\u200C', zwj: '\u200D',
  lrm: '\u200E', rlm: '\u200F', ndash: '\u2013', mdash: '\u2014', lsquo: '\u2018',
  rsquo: '\u2019', sbquo: '\u201A', ldquo: '\u201C', rdquo: '\u201D', bdquo: '\u201E',
  dagger: '\u2020', Dagger: '\u2021', bull: '\u2022', hellip: '\u2026', permil: '\u2030',
  prime: '\u2032', Prime: '\u2033', lsaquo: '\u2039', rsaquo: '\u203A', oline: '\u203E',
  frasl: '\u2044', euro: '\u20AC',
  image: '\u2111', weierp: '\u2118', real: '\u211C', trade: '\u2122', alefsym: '\u2135',
  larr: '\u2190', uarr: '\u2191', rarr: '\u2192', darr: '\u2193', harr: '\u2194',
  crarr: '\u21B5', lArr: '\u21D0', uArr: '\u21D1', rArr: '\u21D2', dArr: '\u21D3',
  hArr: '\u21D4', forall: '\u2200', part: '\u2202', exist: '\u2203', empty: '\u2205',
  nabla: '\u2207', isin: '\u2208', notin: '\u2209', ni: '\u220B', prod: '\u220F',
  sum: '\u2211', minus: '\u2212', lowast: '\u2217', radic: '\u221A', prop: '\u221D',
  infin: '\u221E', ang: '\u2220', and: '\u2227', or: '\u2228', cap: '\u2229',
  cup: '\u222A', int: '\u222B', there4: '\u2234', sim: '\u223C', cong: '\u2245',
  asymp: '\u2248', ne: '\u2260', equiv: '\u2261', le: '\u2264', ge: '\u2265',
  sub: '\u2282', sup: '\u2283', nsub: '\u2284', sube: '\u2286', supe: '\u2287',
  oplus: '\u2295', otimes: '\u2297', perp: '\u22A5', sdot: '\u22C5',
  lceil: '\u2308', rceil: '\u2309', lfloor: '\u230A', rfloor: '\u230B', lang: '\u2329',
  rang: '\u232A', loz: '\u25CA', spades: '\u2660', clubs: '\u2663', hearts: '\u2665',
  diams: '\u2666', Tab: '\u0009', NewLine: '\n', colon: ':', sol: '/', bsol: '\\',
  equals: '=', comma: ',', period: '.', quest: '?', excl: '!', semi: ';',
  lpar: '(', rpar: ')', lbrack: '[', rbrack: ']', lbrace: '{', rbrace: '}',
  Hat: '^', check: '\u2713', cross: '\u2717', star: '\u2605', phone: '\u260E',
  female: '\u2640', male: '\u2642', sext: '\u2736', VerticalLine: '|', UnderBar: '_',
  Grave: '`', apos2: "'",
};

// ---------- inline nodes (linked list) ----------
let NODE_ID = 0;
function INode(t) {
  return { t, literal: null, children: null, dest: null, title: null, level: 0,
    info: null, align: null, ordered: false, start: 0, tight: false,
    next: null, prev: null, parent: null, firstChild: null, lastChild: null,
    _delim: null, _src: null, _id: NODE_ID++ };
}
function appendChild(parent, child) {
  child.parent = parent;
  child.prev = parent.lastChild;
  child.next = null;
  if (parent.lastChild) parent.lastChild.next = child; else parent.firstChild = child;
  parent.lastChild = child;
}
function insertBefore(node, child) { // insert child before node (same parent list)
  const p = node.parent;
  child.parent = p;
  child.next = node;
  child.prev = node.prev;
  if (node.prev) node.prev.next = child; else if (p) p.firstChild = child;
  node.prev = child;
}
function unlink(node) {
  const p = node.parent;
  if (node.prev) node.prev.next = node.next; else if (p) p.firstChild = node.next;
  if (node.next) node.next.prev = node.prev; else if (p) p.lastChild = node.prev;
  node.prev = node.next = node.parent = null;
}
function prependChildren(parent, first, last) {
  // move range [first..last] into parent as children
  let n = first;
  while (n) {
    const nx = n.next;
    n.parent = parent;
    if (n === last) break;
    n = nx;
  }
  parent.firstChild = first; parent.lastChild = last;
  first.prev = null; last.next = null;
}

// ---------- inline parsing ----------
const SCHEME_RE = /^[A-Za-z][A-Za-z0-9+.-]{1,31}:/;
const TAG_OPEN_RE = /^<[A-Za-z][A-Za-z0-9-]*(?:\s+[A-Za-z_:][A-Za-z0-9_.:-]*(?:\s*=\s*(?:[^ \t\n\r"'=<>`]+|'[^'\n\r]*'|"[^"\n\r]*"))?)*\s*\/?>/;
const TAG_CLOSE_RE = /^<\/[A-Za-z][A-Za-z0-9-]*\s*>/;
const COMMENT_RE = /^<!--(?:(?!-->)[\s\S])*?-->/;
const PI_RE = /^<\?[\s\S]*?\?>/;
const DECL_RE = /^<![A-Z][\s\S]*?>/;
const CDATA_RE = /^<!\[CDATA\[[\s\S]*?\]\]>/;

function foldLabel(s) {
  return s.replace(/\s+/g, ' ').trim().toLowerCase();
}

class InlineParser {
  constructor(doc) {
    this.refs = doc.refs;          // Map folded label -> {dest, title}
    this.doc = doc;                // shared doc state (inLink)
    this.delims = [];              // delimiter stack (array, ordered)
    this.brackets = [];            // bracket stack
    this.poisons = [];             // {after: node, kind: 'bt'|'all'}
    this.root = INode('document');
  }

  parse(text) {
    const root = this.root;
    let i = 0, n = text.length;
    let cur = null; // current text node
    const newText = () => { const t = INode('text'); t.literal = ''; appendChild(root, t); return t; };
    const addText = (s) => { if (!s) return; if (!cur || cur.t !== 'text' || cur.parent !== root) cur = newText(); cur.literal += s; };
    const addNode = (nd) => { appendChild(root, nd); cur = null; return nd; };

    const scanCodeSpan = (start) => {
      // returns {node, end} or null
      let j = start, run = 0;
      while (text[j] === '`') { j++; run++; }
      let k = j, content = '';
      while (k < n) {
        if (text[k] === '`') {
          let r2 = 0, k2 = k;
          while (text[k2] === '`') { k2++; r2++; }
          if (r2 === run) {
            let c = text.slice(j, k);
            c = c.replace(/\n/g, ' ');
            if (c.length >= 2 && c[0] === ' ' && c[c.length - 1] === ' ' && !/^ +$/.test(c)) c = c.slice(1, -1);
            const nd = INode('code'); nd.literal = c;
            return { node: nd, end: k2 };
          }
          k = k2; continue;
        }
        k++;
      }
      return null;
    };

    while (i < n) {
      const ch = text[i];
      // newline: soft/hard break
      if (ch === '\n') {
        // hard break if previous char is backslash handled at backslash; two-space rule:
        const prev = root.lastChild;
        if (prev && prev.t === 'text' && / {2,}$/.test(prev.literal)) {
          prev.literal = prev.literal.replace(/ +$/, '');
          const br = INode('hardbreak'); addNode(br);
        } else {
          const sb = INode('softbreak'); addNode(sb);
        }
        i++; continue;
      }
      // backslash
      if (ch === '\\') {
        const nx = text[i + 1];
        if (nx === '\n') { const br = INode('hardbreak'); addNode(br); i += 2; continue; }
        if (nx === '&') { const t = INode('text'); t.literal = '&'; t._amp = true; appendChild(root, t); cur = null; i += 2; continue; }
        if (nx !== undefined && isPunct(nx)) { addText(nx); i += 2; continue; }
        addText('\\'); i++; continue;
      }
      // code span
      if (ch === '`') {
        const r = scanCodeSpan(i);
        if (r) { addNode(r.node); i = r.end; continue; }
        // unclosed: literal run
        let j = i; while (text[j] === '`') j++;
        addText(text.slice(i, j)); i = j; continue;
      }
      // emphasis delimiters
      if (ch === '*' || ch === '_') {
        let j = i; while (text[j] === ch) j++;
        const run = j - i;
        const before = i === 0 ? '\n' : text[i - 1];
        const after = j >= n ? '\n' : text[j];
        const beforeWs = isUnicodeWs(before) || before === '\n';
        const afterWs = isUnicodeWs(after) || after === '\n';
        const beforePunct = isPunct(before);
        const afterPunct = isPunct(after);
        const leftFlank = !afterWs && (!afterPunct || beforeWs || beforePunct);
        const rightFlank = !beforeWs && (!beforePunct || afterWs || afterPunct);
        let canOpen, canClose;
        if (ch === '*') { canOpen = leftFlank; canClose = rightFlank; }
        else { canOpen = leftFlank && (!rightFlank || beforePunct); canClose = rightFlank && (!leftFlank || afterPunct); }
        const t = INode('text'); t.literal = text.slice(i, j); appendChild(root, t); cur = null;
        const d = { cc: ch, numDelims: run, origDelims: run, canOpen, canClose, node: t, active: true };
        t._delim = d;
        this.delims.push(d);
        i = j; continue;
      }
      // strikethrough
      if (ch === '~') {
        let j = i; while (text[j] === '~') j++;
        const run = j - i;
        if (run >= 1) {
          const before = i === 0 ? '\n' : text[i - 1];
          const after = j >= n ? '\n' : text[j];
          const beforeWs = isUnicodeWs(before);
          const afterWs = isUnicodeWs(after);
          const leftFlank = !afterWs && (!isPunct(after) || beforeWs || isPunct(before));
          const rightFlank = !beforeWs && (!isPunct(before) || afterWs || isPunct(after));
          const t = INode('text'); t.literal = text.slice(i, j); appendChild(root, t); cur = null;
          const d = { cc: '~', numDelims: run, origDelims: run, canOpen: leftFlank, canClose: rightFlank, node: t, active: true };
          t._delim = d;
          this.delims.push(d);
          i = j; continue;
        }
        addText('~'); i++; continue;
      }
      // image / link bracket
      if (ch === '[' || (ch === '!' && text[i + 1] === '[')) {
        const isImg = ch === '!';
        const pos = isImg ? i + 1 : i;
        const t = INode('text'); t.literal = isImg ? '![' : '['; appendChild(root, t); cur = null;
        this.brackets.push({ node: t, image: isImg, active: true, pos });
        i = pos + 1; continue;
      }
      // close bracket -> try link
      if (ch === ']') {
        const bt = INode('text'); bt.literal = ']'; appendChild(root, bt); cur = null;
        const res = this.tryLink(text, i, root);
        if (res) { i = res.end; continue; }
        i++; continue;
      }
      // angle autolink / html tag
      if (ch === '<') {
        const rest = text.slice(i);
        let m = rest.match(/^<([A-Za-z][A-Za-z0-9+.-]{1,31}:[^ \t\n<>]*)>/);
        if (m) {
          const dest = m[1];
          const a = INode('link'); a.dest = dest; a.title = null;
          const tx = INode('text'); tx.literal = dest; appendChild(a, tx);
          addNode(a); i += m[0].length; continue;
        }
        m = rest.match(/^<([A-Za-z0-9.!#$%&'*+\/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)+)>/);
        if (m) {
          const dest = 'mailto:' + m[1];
          const a = INode('link'); a.dest = dest; a.title = null;
          const tx = INode('text'); tx.literal = m[1]; appendChild(a, tx);
          addNode(a); i += m[0].length; continue;
        }
        m = rest.match(COMMENT_RE) || rest.match(PI_RE) || rest.match(DECL_RE) || rest.match(CDATA_RE) || rest.match(TAG_CLOSE_RE) || rest.match(TAG_OPEN_RE);
        if (m) {
          const h = INode('html'); h.literal = m[0]; addNode(h);
          this.trackHtmlTag(m[0]);
          i += m[0].length; continue;
        }
        addText('<'); i++; continue;
      }
      // entity: valid numeric refs decode; &word; stays raw; else literal &
      if (ch === '&') {
        const m = text.slice(i).match(/^&#([xX][0-9a-fA-F]+|[0-9]+);/);
        if (m) {
          const dec = decodeEntityInner('#' + m[1]);
          if (dec !== null) { addText(dec); i += m[0].length; continue; }
          addText('&'); i++; continue;
        }
        const w = text.slice(i).match(/^&[A-Za-z][A-Za-z0-9]*;/);
        if (w) { addText(w[0]); i += w[0].length; continue; }
        addText('&'); i++; continue;
      }
      // bare autolinks (GFM) — only at word start
      if ((ch === 'w' || ch === 'h' || ch === 'f') && this.atAutolinkStart(text, i)) {
        const r = this.scanBareAutolink(text, i, root);
        if (r) { cur = null; i = r.end; continue; }
      }
      if (this.isEmailStart(text, i) && this.atAutolinkStart(text, i)) {
        const r = this.scanBareEmail(text, i, root);
        if (r) { cur = null; i = r.end; continue; }
      }
      // plain text fast-forward
      let j = i;
      while (j < n) {
        const c = text[j];
        if (c === '\n' || c === '\\' || c === '`' || c === '*' || c === '_' || c === '~' ||
            c === '[' || c === ']' || c === '<' || c === '&' || (c === '!' && text[j + 1] === '[')) break;
        if ((c === 'w' || c === 'h' || c === 'f') && this.atAutolinkStart(text, j)) break;
        if (this.isEmailStart(text, j) && this.atAutolinkStart(text, j)) break;
        j++;
      }
      if (j === i) { addText(ch); i++; }
      else { addText(text.slice(i, j)); i = j; }
    }
    this.processEmphasis();
    return root;
  }

  atAutolinkStart(text, i) {
    if (i === 0) return true;
    const p = text[i - 1];
    if (isUnicodeWs(p)) return true;
    if (p === '(' || p === '[' || p === '{') return true;
    // inside a link label, bare autolinks are suppressed (handled via bracket check in scan)
    return false;
  }
  isEmailStart(text, i) {
    // email local part must start at i; check char class and that a '@' follows
    const c = text[i];
    if (!/[A-Za-z0-9.!#$%&'*+\/=?^_`{|}~-]/.test(c)) return false;
    let j = i;
    while (j < text.length && /[A-Za-z0-9.!#$%&'*+\/=?^_`{|}~-]/.test(text[j])) j++;
    return text[j] === '@';
  }

  scanBareAutolink(text, i, root) {
    if (this.brackets.length && this.brackets[this.brackets.length - 1].active) return null;
    if (this.doc.inLink) return null;
    const rest = text.slice(i);
    let m = rest.match(/^(?:https?:\/\/|ftp:\/\/|www\.)[^\s<>]*/);
    if (!m) return null;
    let url = m[0];
    // stop before an unclosed '(' group containing '://'
    url = this.cutUnclosedSchemeGroup(url);
    url = trimBareUrl(url);
    if (!url) return null;
    if (url.startsWith('www.')) {
      // need a dot after www. with valid domain part
      if (!/^www\.[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/.test(url) && !/^www\.[^\s]*\.[A-Za-z]/.test(url)) {
        // marked requires www. followed by domain with a dot; keep if it has a dot somewhere later
        if (!/\./.test(url.slice(4))) return null;
      }
    }
    const dest = url.startsWith('www.') ? 'http://' + url : url;
    const a = INode('link'); a.dest = dest; a.title = null;
    const tx = INode('text'); tx.literal = url; appendChild(a, tx);
    appendChild(root, a);
    return { end: i + url.length };
  }

  cutUnclosedSchemeGroup(url) {
    // if url contains '(' whose group is unclosed and contains '://', cut before that '('
    let depth = 0;
    for (let k = 0; k < url.length; k++) {
      if (url[k] === '(') {
        // find matching ')'
        let d = 1, q = k + 1;
        while (q < url.length && d > 0) { if (url[q] === '(') d++; else if (url[q] === ')') d--; q++; }
        if (d > 0) {
          if (url.slice(k).includes('://')) return url.slice(0, k);
        }
        depth++;
      } else if (url[k] === ')') depth--;
    }
    return url;
  }

  scanBareEmail(text, i, root) {
    if (this.brackets.length && this.brackets[this.brackets.length - 1].active) return null;
    if (this.doc.inLink) return null;
    const rest = text.slice(i);
    const m = rest.match(/^[A-Za-z0-9.!#$%&'*+\/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)*\.[A-Za-z]{2,}/);
    if (!m) return null;
    let email = m[0];
    // trailing '_' blocks only when unpaired: check for earlier canOpen '_' opener
    if (email.endsWith('_')) {
      const hasPair = this.delims.some(d => d.cc === '_' && d.canOpen && d.active);
      const doubleEnd = email.endsWith('__');
      if (!hasPair && !doubleEnd) return null;
      // if unpaired, trim the trailing underscore(s)? marked: email not formed; keep as text
      if (!hasPair) return null;
    }
    const a = INode('link'); a.dest = 'mailto:' + email; a.title = null;
    const tx = INode('text'); tx.literal = email; appendChild(a, tx);
    appendChild(root, a);
    return { end: i + email.length };
  }

  trackHtmlTag(tag) {
    // document-level inLink: unclosed <a> suppresses bare autolinks until </a>
    const m = tag.match(/^<\/?([A-Za-z][A-Za-z0-9-]*)/);
    if (!m) return;
    const name = m[1].toLowerCase();
    if (name !== 'a') return;
    if (tag.startsWith('</')) { this.doc.inLink = false; return; }
    if (/^<a\/>$/.test(tag)) return; // exact <a/> exempt
    this.doc.inLink = true;
  }

  // ---- link attempt on ']' ----
  tryLink(text, closeIdx, root) {
    // find nearest active bracket
    let bi = this.brackets.length - 1;
    while (bi >= 0 && !this.brackets[bi].active) bi--;
    if (bi < 0) return null;
    const br = this.brackets[bi];
    const openNode = br.node;
    // label nodes: siblings after openNode up to last text node (the ']' just added)
    // collect label text + check for poison conditions
    let labelNodes = [];
    let nd = openNode.next;
    while (nd && nd !== root.lastChild) { labelNodes.push(nd); nd = nd.next; }
    // the ']' text node is root.lastChild; label = nodes before it
    const labelText = plainTextOf(labelNodes);
    // label rejection: mid-label multi-backtick spans / unclosed backtick handled via poison
    let j = closeIdx + 1;
    let dest = null, title = null, end = -1;
    // inline link?
    if (text[j] === '(') {
      const r = parseLinkDestination(text, j + 1);
      if (r) {
        let k = r.end;
        let t = null;
        // skip whitespace (incl newlines)
        let k2 = k;
        while (k2 < text.length && isSpace(text[k2])) k2++;
        if (k2 < text.length && (text[k2] === '"' || text[k2] === "'" || text[k2] === '(')) {
          const tr = parseLinkTitle(text, k2);
          if (tr) { t = tr.title; k2 = tr.end; while (k2 < text.length && isSpace(text[k2])) k2++; }
        }
        if (k2 < text.length && text[k2] === ')') {
          dest = r.dest; title = t; end = k2 + 1;
        }
      }
    }
    if (end < 0) {
      // reference link: [label] or [] collapsed or shortcut
      let refLabel = null, kend = j;
      if (text[j] === '[') {
        // parse bracket label (no nested brackets)
        let k = j + 1, depth = 0, ok = true, content = '';
        while (k < text.length && text[k] !== ']') {
          if (text[k] === '[') { ok = false; break; }
          if (text[k] === '\n') content += ' ';
          else content += text[k];
          k++;
        }
        if (ok && k < text.length) {
          refLabel = content === '' ? labelText : content;
          kend = k + 1;
        }
      }
      if (end < 0 && refLabel !== null) {
        const ref = this.refs.get(foldLabel(refLabel));
        if (ref) { dest = ref.dest; title = ref.title; end = kend; }
      }
      if (end < 0) {
        // shortcut reference
        const ref = this.refs.get(foldLabel(labelText));
        if (ref) { dest = ref.dest; title = ref.title; end = j; }
      }
    }
    if (end < 0) {
      // failed: deactivate bracket; failure-time linkification of bare autolinks in label
      br.active = false;
      this.linkifyLabelAutolinks(labelNodes);
      return null;
    }
    // success: build link/image node
    // label rejection checks (multi-backtick spans) — apply before forming
    if (!br.image && this.labelRejected(labelNodes, labelText)) {
      br.active = false;
      this.linkifyLabelAutolinks(labelNodes);
      return null;
    }
    const linkNode = INode(br.image ? 'image' : 'link');
    linkNode.dest = dest; linkNode.title = title;
    // move label nodes into link node (they stay as-is; delimiters inside remain active)
    // unlink openNode and ']' node, move label nodes
    const closeNode = root.lastChild;
    // remove closeNode
    unlink(closeNode);
    // move label nodes
    let mv = openNode.next;
    const moved = [];
    while (mv) { const nx = mv.next; moved.push(mv); mv = nx; }
    for (const mnd of moved) { unlink(mnd); appendChild(linkNode, mnd); }
    // insert link node where openNode was
    insertBefore(openNode, linkNode);
    unlink(openNode);
    // remove brackets after this one (nested) — they were consumed as part of label
    this.brackets.length = bi;
    // delimiters: remove those that were the '[' ? none. Keep inner delimiters.
    // poison zones
    this.recordPoison(linkNode, labelNodes, labelText);
    // image alt text: plain text of children (used at render)
    return { end };
  }

  labelRejected(labelNodes, labelText) {
    // a link label may not contain another link (images are allowed)
    const hasLink = (nodes) => {
      for (const nd of nodes) {
        if (nd.t === 'link') return true;
        if (nd.firstChild) {
          let c = nd.firstChild;
          while (c) { if (hasLink([c])) return true; c = c.next; }
        }
      }
      return false;
    };
    if (hasLink(labelNodes)) return true;
    // mid-label multi-backtick span rejection: label contains a '`' run of length>=2
    // that is part of a code span? Code spans already became code nodes; remaining
    // literal backticks in text nodes of length>=2 runs reject the label.
    for (const nd of labelNodes) {
      if (nd.t === 'text' && /``/.test(nd.literal)) return true;
    }
    return false;
  }

  recordPoison(linkNode, labelNodes, labelText) {
    let hasBt = false, hasEscBracket = false, hasInnerLink = false;
    for (const nd of labelNodes) {
      if (nd.t === 'link' || nd.t === 'image') hasInnerLink = true;
      if (nd.t === 'text') {
        if (nd.literal.includes('`')) hasBt = true;
        if (nd.literal.includes('[')) hasEscBracket = true;
      }
      // recurse into children for inner links
      if (nd.children || nd.firstChild) {
        let c = nd.firstChild;
        while (c) { if (c.t === 'link' || c.t === 'image') hasInnerLink = true; c = c.next; }
      }
    }
    if (hasBt) this.poisons.push({ after: linkNode, kind: 'bt' });
    else if (hasEscBracket && !hasInnerLink) this.poisons.push({ after: linkNode, kind: 'all' });
  }

  linkifyLabelAutolinks(labelNodes) {
    // doc-39: an unresolved bracket's label DOES link its bare autolinks.
    for (const nd of labelNodes) {
      if (nd.t !== 'text' || !nd.literal) continue;
      const s = nd.literal;
      const m = s.match(/(?:^|[\s(])((?:https?:\/\/|ftp:\/\/|www\.)[^\s<>]*)/);
      if (!m) continue;
      const urlRaw = m[1];
      const url = trimBareUrl(this.cutUnclosedSchemeGroup(urlRaw));
      if (!url) continue;
      const start = s.indexOf(urlRaw);
      const before = s.slice(0, start);
      const after = s.slice(start + url.length);
      const a = INode('link');
      a.dest = url.startsWith('www.') ? 'http://' + url : url;
      const tx = INode('text'); tx.literal = url; appendChild(a, tx);
      const afterNode = INode('text'); afterNode.literal = after;
      const parent = nd.parent;
      nd.literal = before;
      // insert link + after text right after nd
      const nxt = nd.next;
      if (nxt) insertBefore(nxt, a); else appendChild(parent, a);
      const nxt2 = a.next;
      if (nxt2) insertBefore(nxt2, afterNode); else appendChild(parent, afterNode);
      if (!after) unlink(afterNode);
      if (!before) unlink(nd);
      break;
    }
  }

  // ---- emphasis processing ----
  processEmphasis() {
    // strikethrough first (~~ pairs), then * and _
    this.processDelimFamily('~', 'del');
    this.processDelimFamily('*', 'emph');
    this.processDelimFamily('_', 'emph');
  }

  processDelimFamily(cc, tag) {
    const delims = this.delims;
    let closerIdx = 0;
    while (closerIdx < delims.length) {
      const closer = delims[closerIdx];
      if (closer.cc !== cc || !closer.canClose || !closer.active) { closerIdx++; continue; }
      // find opener
      let openerIdx = closerIdx - 1;
      let opener = null, found = false, oddMatch = false;
      let useDelims = 1;
      while (openerIdx >= 0) {
        const o = delims[openerIdx];
        if (o.cc === cc && o.canOpen && o.active) {
          if (o.node.parent !== closer.node.parent) { openerIdx--; continue; }
          oddMatch = (o.numDelims + closer.numDelims) % 3 === 0 &&
            (o.numDelims % 3 !== 0 || closer.numDelims % 3 !== 0);
          if (cc === '~') {
            // marked: a single '~' also delimits (unlike GFM spec which needs ~~)
            if (o.numDelims >= 2 && closer.numDelims >= 2) useDelims = 2;
            else useDelims = 1;
            opener = o; found = true; break;
          } else {
            // rule of 3: if either delimiter can both open and close and the
            // sum is a multiple of 3 (and not both multiples of 3), no pairing
            if (oddMatch && ((o.canOpen && o.canClose) || (closer.canOpen && closer.canClose))) { openerIdx--; continue; }
            if (o.numDelims >= 2 && closer.numDelims >= 2) useDelims = 2;
            else useDelims = 1;
            // anti-steal: single closer may not take one unit of a double opener
            // when a later double closer exists
            if (useDelims === 1 && o.numDelims >= 2 && closer.numDelims === 1) {
              let laterDouble = false;
              for (let q = closerIdx + 1; q < delims.length; q++) {
                if (delims[q].cc === cc && delims[q].canClose && delims[q].active && delims[q].numDelims >= 2) { laterDouble = true; break; }
              }
              if (laterDouble) { openerIdx--; continue; }
            }
            // poison checks
            if (this.poisonBlocks(o, closer, cc)) { openerIdx--; continue; }
            opener = o; found = true; break;
          }
        }
        openerIdx--;
      }
      if (!found) { closerIdx++; continue; }
      const emphNode = INode(cc === '~' ? 'del' : (useDelims === 2 ? 'strong' : tag));
      emphNode._src = cc;
      // move nodes strictly between opener.node and closer.node into emph,
      // THEN insert emph before the closer
      let n = opener.node.next;
      while (n && n !== closer.node) {
        const nx = n.next;
        unlink(n); appendChild(emphNode, n);
        n = nx;
      }
      insertBefore(closer.node, emphNode);
      // P2: leftover closer renders INSIDE the strong when content ends glued
      // (handled implicitly: remaining closer text stays after emphNode; the
      //  specific glued case is covered by the span check above)
      // trim delimiter text
      opener.numDelims -= useDelims;
      closer.numDelims -= useDelims;
      opener.node.literal = opener.node.literal.slice(0, opener.node.literal.length - useDelims);
      closer.node.literal = closer.node.literal.slice(useDelims);
      if (opener.numDelims === 0) { opener.active = false; }
      if (closer.numDelims === 0) { closer.active = false; closerIdx++; }
      // if opener exhausted, remove from consideration (keep in array, inactive)
      // loop: same closer may pair again if it still has delims
    }
  }

  spanHoldsEmphasis(opener, closer) {
    let n = opener.node.next;
    while (n && n !== closer.node) {
      if (n.t === 'emph' || n.t === 'strong') return true;
      if (n.firstChild) {
        let c = n.firstChild;
        while (c) { if (c.t === 'emph' || c.t === 'strong') return true; c = c.next; }
      }
      n = n.next;
    }
    return false;
  }

  poisonBlocks(opener, closer, cc) {
    for (const p of this.poisons) {
      // opener must be after p.after and before a hard/soft break
      if (!this.nodeAfter(opener.node, p.after)) continue;
      if (this.breakBetween(p.after, opener.node)) continue;
      if (p.kind === 'bt') {
        if (cc === '_') return true;
        if (cc === '*' && closer.origDelims === 3) return true;
      } else if (p.kind === 'all') {
        if (cc === '_') {
          const openerDouble = opener.numDelims >= 2;
          const holds = this.spanHoldsUnderscoreEmphasis(opener, closer);
          if (openerDouble || holds) return true;
        }
      }
    }
    return false;
  }

  spanHoldsUnderscoreEmphasis(opener, closer) {
    let n = opener.node.next;
    while (n && n !== closer.node) {
      if ((n.t === 'emph' || n.t === 'strong') && n._src === '_') return true;
      if (n.firstChild) {
        let c = n.firstChild;
        while (c) { if ((c.t === 'emph' || c.t === 'strong') && c._src === '_') return true; c = c.next; }
      }
      n = n.next;
    }
    return false;
  }

  nodeAfter(node, afterNode) {
    // is node strictly after afterNode in document order (flat walk)?
    let cur = afterNode;
    // walk forward through siblings then up
    let n = afterNode.next;
    while (n) { if (n === node) return true; n = n.next; }
    return false;
  }

  breakBetween(from, to) {
    let n = from.next;
    while (n && n !== to) {
      if (n.t === 'softbreak' || n.t === 'hardbreak') return true;
      n = n.next;
    }
    return false;
  }
}

function plainTextOf(nodes) {
  let s = '';
  for (const nd of nodes) {
    if (nd.t === 'text') s += nd.literal;
    else if (nd.t === 'code') s += nd.literal;
    else if (nd.t === 'softbreak' || nd.t === 'hardbreak') s += '\n';
    else if (nd.t === 'html') s += nd.literal;
    else if (nd.firstChild) s += plainTextOf(childrenOf(nd));
  }
  return s;
}
function childrenOf(nd) {
  const out = [];
  let c = nd.firstChild;
  while (c) { out.push(c); c = c.next; }
  return out;
}

function trimBareUrl(url) {
  // trim trailing punctuation ?!.,:*_~ and balanced ')'
  let end = url.length;
  while (end > 0) {
    const c = url[end - 1];
    if (c === ')') {
      // count parens in url[0..end)
      let depth = 0;
      for (let k = 0; k < end; k++) { if (url[k] === '(') depth++; else if (url[k] === ')') depth--; }
      if (depth < 0) { end--; continue; }
      break;
    }
    if ('?!.,:*_~'.includes(c)) { end--; continue; }
    if (c === "'") { end--; continue; }
    break;
  }
  return url.slice(0, end);
}

// parse link destination starting at index i (after '('); returns {dest, end} or null
function parseLinkDestination(text, i) {
  const n = text.length;
  let j = i;
  while (j < n && isSpace(text[j])) j++;
  if (j >= n) return null;
  if (text[j] === '<') {
    let k = j + 1, dest = '';
    while (k < n && text[k] !== '>' && text[k] !== '\n') {
      if (text[k] === '\\' && k + 1 < n && isPunct(text[k + 1])) { dest += text[k + 1]; k += 2; continue; }
      if (text[k] === '<') return null;
      dest += text[k]; k++;
    }
    if (k >= n || text[k] !== '>') return null;
    return { dest, end: k + 1 };
  }
  // bare destination: balanced parens, no spaces/control
  let depth = 0, dest = '', k = j;
  while (k < n) {
    const c = text[k];
    if (isSpace(c) || c.charCodeAt(0) < 32) break;
    if (c === '\\' && k + 1 < n && isPunct(text[k + 1])) { dest += text[k + 1]; k += 2; continue; }
    if (c === '(') { depth++; dest += c; k++; continue; }
    if (c === ')') {
      if (depth === 0) break;
      depth--; dest += c; k++; continue;
    }
    dest += c; k++;
  }
  if (k === j) return { dest: '', end: j };
  return { dest, end: k };
}

function parseLinkTitle(text, i) {
  const n = text.length;
  const q = text[i];
  if (q === '"' || q === "'") {
    let k = i + 1, t = '';
    while (k < n && text[k] !== q) {
      if (text[k] === '\\' && k + 1 < n && isPunct(text[k + 1])) { t += text[k + 1]; k += 2; continue; }
      t += text[k]; k++;
    }
    if (k >= n) return null;
    return { title: t, end: k + 1 };
  }
  if (q === '(') {
    let k = i + 1, t = '', depth = 1;
    while (k < n && depth > 0) {
      if (text[k] === '\\' && k + 1 < n && isPunct(text[k + 1])) { t += text[k + 1]; k += 2; continue; }
      if (text[k] === '(') { depth++; t += '('; k++; continue; }
      if (text[k] === ')') { depth--; if (depth === 0) break; t += ')'; k++; continue; }
      t += text[k]; k++;
    }
    if (depth !== 0) return null;
    return { title: t, end: k + 1 };
  }
  return null;
}

// ---------- rendering ----------
function renderInline(text, doc) {
  const p = new InlineParser(doc);
  const root = p.parse(text);
  return renderInlineNodes(root, doc);
}
function renderInlineNodes(node, doc) {
  let out = '';
  let c = node.firstChild;
  while (c) {
    switch (c.t) {
      case 'text': out += c._amp ? '&amp;' : escText(c.literal); break;
      case 'code': out += '<code>' + escCode(c.literal) + '</code>'; break;
      case 'emph': out += '<em>' + renderInlineNodes(c, doc) + '</em>'; break;
      case 'strong': out += '<strong>' + renderInlineNodes(c, doc) + '</strong>'; break;
      case 'del': out += '<del>' + renderInlineNodes(c, doc) + '</del>'; break;
      case 'softbreak': out += '\n'; break;
      case 'hardbreak': out += '<br>'; break;
      case 'html': out += c.literal; break;
      case 'link': {
        out += '<a href="' + escAttr(cleanUrl(c.dest)) + '"';
        if (c.title != null) out += ' title="' + escAttr(c.title) + '"';
        out += '>' + renderInlineNodes(c, doc) + '</a>';
        break;
      }
      case 'image': {
        out += '<img src="' + escAttr(cleanUrl(c.dest)) + '" alt="' + escAttr(plainTextAlt(c)) + '"';
        if (c.title != null) out += ' title="' + escAttr(c.title) + '"';
        out += '>';
        break;
      }
    }
    c = c.next;
  }
  return out;
}
function plainTextAlt(node) {
  // alt text: plain text of children, with images -> their alt, code -> literal
  let out = '';
  let c = node.firstChild;
  while (c) {
    if (c.t === 'text') out += c.literal;
    else if (c.t === 'code') out += c.literal;
    else if (c.t === 'softbreak' || c.t === 'hardbreak') out += '\n';
    else if (c.t === 'image') out += plainTextAlt(c);
    else if (c.firstChild) out += plainTextAlt(c);
    c = c.next;
  }
  return out;
}

const BLOCK_TAGS = new Set(('address article aside base basefont blockquote body caption center col colgroup dd details dialog dir div dl dt fieldset figcaption figure footer form frame frameset h1 h2 h3 h4 h5 h6 head header hr html iframe legend li link main menu menuitem nav noframes ol optgroup option p param section source summary table tbody td tfoot th thead title tr track ul').split(' '));

// ---------- line cursor (tab-aware) ----------
class Line {
  constructor(raw) {
    this.raw = raw; this.offset = 0; this.column = 0; this.partial = 0; // partial tab spaces remaining
  }
  clone() { const l = new Line(this.raw); l.offset = this.offset; l.column = this.column; l.partial = this.partial; return l; }
  get indent() { // columns of leading whitespace from current position
    let col = 0, i = this.offset;
    if (this.partial > 0) col += this.partial;
    while (i < this.raw.length) {
      const c = this.raw[i];
      if (c === ' ') { col += 1; i++; }
      else if (c === '\t') { col += 4 - ((this.column + col) % 4); i++; }
      else break;
    }
    return col;
  }
  get blank() {
    let i = this.offset;
    if (this.partial > 0) return false; // partial tab = spaces = blank-ish? treat as blank content
    while (i < this.raw.length) {
      const c = this.raw[i];
      if (c !== ' ' && c !== '\t') return false;
      i++;
    }
    return true;
  }
  peek() {
    if (this.partial > 0) return ' ';
    return this.offset < this.raw.length ? this.raw[this.offset] : '';
  }
  peekAt(n) {
    if (this.partial > 0) { if (n < this.partial) return ' '; return this.raw[this.offset + 1 + (n - this.partial)] || ''; }
    return this.raw[this.offset + n] || '';
  }
  rest() {
    if (this.partial > 0) return ' '.repeat(this.partial) + this.raw.slice(this.offset + 1);
    return this.raw.slice(this.offset);
  }
  advance(n) { // consume n columns
    while (n > 0) {
      if (this.partial > 0) {
        if (n >= this.partial) { n -= this.partial; this.column += this.partial; this.offset++; this.partial = 0; }
        else { this.partial -= n; this.column += n; n = 0; }
        continue;
      }
      if (this.offset >= this.raw.length) break;
      const c = this.raw[this.offset];
      if (c === '\t') {
        const w = 4 - (this.column % 4);
        if (n >= w) { this.offset++; this.column += w; n -= w; }
        else { this.partial = w - n; this.column += n; n = 0; }
      } else if (c === ' ') { this.offset++; this.column++; n--; }
      else break;
    }
  }
  advanceChars(k) { // consume k raw chars (no tabs assumed)
    for (let q = 0; q < k && this.offset < this.raw.length; q++) {
      const c = this.raw[this.offset];
      if (c === '\t') this.column += 4 - (this.column % 4); else this.column++;
      this.offset++;
    }
  }
  matchPrefix(s) {
    if (this.partial > 0) return false;
    return this.raw.startsWith(s, this.offset);
  }
}

// ---------- link reference definitions ----------
function parseDef(text, pos, refs) {
  // try to parse one link ref def at pos in text; returns end index or -1
  const n = text.length;
  let i = pos;
  // up to 3 spaces at line start
  let sp = 0;
  while (i < n && text[i] === ' ' && sp < 3) { i++; sp++; }
  if (text[i] !== '[') return -1;
  // label: no unescaped nested '['; may contain escapes
  let j = i + 1, label = '';
  while (j < n && text[j] !== ']') {
    if (text[j] === '[') return -1;
    if (text[j] === '\\' && j + 1 < n && isPunct(text[j + 1])) { label += text[j + 1]; j += 2; continue; }
    label += text[j]; j++;
  }
  if (j >= n || text[j] !== ']') return -1;
  if (label.length === 0 || label.length > 999) return -1;
  j++;
  if (text[j] !== ':') return -1;
  j++;
  // skip whitespace incl newlines
  while (j < n && isSpace(text[j])) j++;
  if (j >= n) return -1;
  // destination
  let dest = '';
  if (text[j] === '<') {
    let k = j + 1;
    while (k < n && text[k] !== '>' && text[k] !== '\n') {
      if (text[k] === '\\' && k + 1 < n && isPunct(text[k + 1])) { dest += text[k + 1]; k += 2; continue; }
      if (text[k] === '<') return -1;
      dest += text[k]; k++;
    }
    if (k >= n || text[k] !== '>') return -1;
    j = k + 1;
  } else {
    let depth = 0, k = j;
    while (k < n) {
      const c = text[k];
      if (isSpace(c) || c.charCodeAt(0) < 32) break;
      if (c === '\\' && k + 1 < n && isPunct(text[k + 1])) { dest += text[k + 1]; k += 2; continue; }
      if (c === '(') { depth++; dest += c; k++; continue; }
      if (c === ')') { if (depth === 0) break; depth--; dest += c; k++; continue; }
      dest += c; k++;
    }
    if (k === j) return -1; // empty destination not allowed in defs
    j = k;
  }
  // After the destination: optional title (same line, or following line).
  // A title followed by junk on its line is ignored (def keeps no title).
  let title = null, endPos = null;
  // same-line title?
  let k = j;
  while (k < n && (text[k] === ' ' || text[k] === '\t')) k++;
  if (k < n && (text[k] === '"' || text[k] === "'" || text[k] === '(')) {
    const tr = parseLinkTitle(text, k);
    if (tr) {
      let m2 = tr.end;
      while (m2 < n && (text[m2] === ' ' || text[m2] === '\t')) m2++;
      if (m2 >= n || text[m2] === '\n') { title = tr.title; endPos = m2 < n ? m2 + 1 : m2; }
      else endPos = j; // title followed by junk: def without title, ends after dest
    }
  }
  if (endPos === null) {
    // no valid same-line title: dest line must end (spaces then newline/end)
    let m = j;
    while (m < n && (text[m] === ' ' || text[m] === '\t')) m++;
    if (m < n && text[m] !== '\n') return -1;
    endPos = m < n ? m + 1 : m;
    // title on a following line?
    let k3 = j;
    while (k3 < n && isSpace(text[k3])) k3++;
    if (k3 < n && (text[k3] === '"' || text[k3] === "'" || text[k3] === '(')) {
      const tr = parseLinkTitle(text, k3);
      if (tr) {
        let m2 = tr.end;
        while (m2 < n && (text[m2] === ' ' || text[m2] === '\t')) m2++;
        if (m2 >= n || text[m2] === '\n') { title = tr.title; endPos = m2 < n ? m2 + 1 : m2; }
      }
    }
  }
  const folded = foldLabel(label);
  if (!refs.has(folded)) refs.set(folded, { dest, title });
  return endPos;
}

// ---------- block parsing ----------
function BNode(type) { const n = INode(type); n.type = type; n.open = true; return n; }
function lastChildOf(n) { return n.lastChild; }

class Parser {
  constructor() {
    this.refs = new Map();
    this.inLink = false;
    this.stack = [];
    this.lineNo = 0;
    this.srcEndsWithNL = true;
  }
  get root() { return this.stack[0]; }
  get tip() { return this.stack[this.stack.length - 1]; }

  parse(src) {
    src = src.replace(/\r\n?/g, '\n');
    this.srcEndsWithNL = src.endsWith('\n');
    const rawLines = src.split('\n');
    // drop the artificial last empty line if source ends with newline
    if (this.srcEndsWithNL) rawLines.pop();
    const root = BNode('document');
    this.stack = [root];
    this.lineNo = 0;
    for (const raw of rawLines) {
      this.lineNo++;
      this.incorporateLine(raw);
    }
    // finalize all
    while (this.stack.length > 1) { const b = this.tip; b._endedAtEof = true; this.finalizeBlock(b); }
    this.finalizeBlock(root);
    return renderBlocks(root, this);
  }

  incorporateLine(rawLine) {
    const rawBlank = /^\s*$/.test(rawLine);
    if (rawBlank && this._termHtml) {
      if (this._termHtml.literal.endsWith('\n')) this._termHtml.literal = this._termHtml.literal.slice(0, -1);
      this._termHtml = null;
    } else if (!rawBlank) {
      this._termHtml = null;
    }
    const line = new Line(rawLine);
    let container = this.root;
    let allMatched = true;
    let idx = 1;
    while (idx < this.stack.length) {
      const blk = this.stack[idx];
      if (!this.matchContainer(blk, line)) { allMatched = false; break; }
      container = blk;
      idx++;
    }
    if (!allMatched) {
      if (this.tip.type === 'paragraph' && !line.blank && !this.lineStartsInterruptingBlock(line, container)) {
        // lazy continuation of the open paragraph; indent >= 4 is stripped
        if (line.indent >= 4) line.advance(4);
        let prefix = '';
        if (/^ {0,3}(=+|-+)[ \t]*$/.test(line.rest())) {
          // lazy setext-looking line inside a blockquote gets a 4-space prefix
          for (const b of this.stack) { if (b.type === 'block_quote') { prefix = '    '; break; } }
        }
        this.addLineToParagraph(this.tip, line, prefix);
        return;
      }
      this.finalizeTo(container);
    }
    const isLast = this.lineNo === this.totalLines;
    // empty content after container stripping (e.g. a bare '>' line) acts as
    // a blank line for the open content, but only if a container consumed input
    if (!rawBlank && line.rest() === '' && (line.offset !== 0 || line.column !== 0) &&
        this.tip.type !== 'code_block' && this.tip.type !== 'html_block' && this.tip.type !== 'table') {
      if (this.tip.type === 'paragraph') this.finalizeBlock(this.tip);
      for (const b of this.stack) {
        b._lastLineBlank = true;
        if (b.type === 'item') b._blankPending = true;
      }
      return;
    }
    // blank line handling
    if (rawBlank) {
      let tip = this.tip;
      if (tip.type === 'code_block') { this.addLineToCode(tip, line, true); return; }
      if (tip.type === 'html_block' && (tip._htmlType <= 5)) { this.addLineToHtml(tip, line); return; }
      if (tip.type === 'html_block') { this.finalizeBlock(tip); tip = this.tip; }
      if (tip.type === 'paragraph') this.finalizeBlock(tip);
      // mark blank on open blocks; track loose-list flags
      for (const b of this.stack) {
        b._lastLineBlank = true;
        if (b.type === 'item') b._blankPending = true;
      }
      return;
    }
    // new-block loop
    while (true) {
      if (this.tip.type === 'code_block') { this.addLineToCode(this.tip, line, false); return; }
      if (this.tip.type === 'html_block') { this.addLineToHtml(this.tip, line); return; }
      if (this.tip.type === 'table') { this.addTableRowLine(line); return; }
      const started = this.tryBlockStart(line);
      if (!started) break;
      // if tryBlockStart consumed the line (setext etc.), it returns 'consumed'
      if (started === 'consumed') return;
    }
    // phase 3: add to tip
    const tip = this.tip;
    if (tip.type === 'paragraph') this.addLineToParagraph(tip, line);
    else {
      if (line.rest().trim() === '') return; // empty content after containers: no paragraph
      this.noteContentAfterBlank();
      const p = BNode('paragraph'); p.literal = '';
      appendChild(this.effectiveParent(), p);
      this.stack.push(p);
      this.addLineToParagraph(p, line);
    }
  }

  get totalLines() { return this._totalLines || 0; }

  matchContainer(blk, line) {
    switch (blk.type) {
      case 'block_quote': {
        const ind = line.indent;
        if (ind > 3) return false;
        line.advance(ind);
        if (line.peek() !== '>') return false;
        line.advanceChars(1);
        if (line.peek() === ' ' || line.peek() === '\t') line.advance(1);
        return true;
      }
      case 'item': {
        if (line.blank) return true;
        const ind = line.indent;
        const need = blk._markerOffset + blk._padding;
        if (line.column + ind < need) return false;
        line.advance(need - line.column);
        return true;
      }
      case 'code_block': {
        if (blk._fenced) return true;
        return line.blank || line.indent >= 4;
      }
      case 'html_block': return true;
      case 'table': {
        // table matches only row lines
        if (line.blank) return false;
        const s = line.rest();
        if (this.isFenceStart(s) || this.isListStart(s) || this.isHtmlBlockStart(s, true)) return false;
        if (!s.includes('|') && blk._align.length > 1) return false;
        return true;
      }
      default: return true; // document, list, paragraph
    }
  }

  finalizeTo(container) {
    while (this.tip !== container) this.finalizeBlock(this.tip);
  }

  effectiveParent() {
    // a list can only hold items; any other block finalizes a trailing list
    while (this.tip.type === 'list') this.finalizeBlock(this.tip);
    return this.tip;
  }

  noteContentAfterBlank() {
    for (const b of this.stack) {
      if (b.type === 'item' && b._blankPending) { b._looseFlag = true; b._blankPending = false; }
    }
  }

  finalizeBlock(blk) {
    const idx = this.stack.indexOf(blk);
    if (idx >= 0) this.stack.splice(idx, 1);
    blk.open = false;
    switch (blk.type) {
      case 'paragraph': {
        const before = blk.literal;
        blk.literal = this.stripDefs(blk.literal);
        if (blk.literal !== before && blk.literal.trim() === '') { unlink(blk); return; }
        break;
      }
      case 'code_block': {
        let lit = blk.literal || '';
        if (lit.trim() === '') { blk.literal = ''; break; }
        if (blk._fenced) {
          if (lit.endsWith('\n\n')) lit = lit.slice(0, -1); // drop exactly one trailing blank line
        } else {
          while (lit.endsWith('\n\n')) lit = lit.slice(0, -1);
        }
        blk.literal = lit;
        break;
      }
      case 'html_block': {
        // keep trailing newline when terminator-ended (types 1-5) or EOF-ended;
        // a following blank line strips it (handled in incorporateLine via _termHtml)
        const keep = (blk._htmlType >= 1 && blk._htmlType <= 5 && blk._endedByTerminator) || blk._endedAtEof;
        if (keep) {
          if (blk._htmlType >= 1 && blk._htmlType <= 5 && blk._endedByTerminator && !blk._endedAtEof) this._termHtml = blk;
        } else if (blk.literal.endsWith('\n')) {
          blk.literal = blk.literal.slice(0, -1);
        }
        break;
      }
      case 'list': {
        let tight = true;
        let c = blk.firstChild;
        while (c) {
          if (c._looseFlag) tight = false;
          c = c.next;
        }
        if (blk._blankBetweenItems) tight = false;
        blk.tight = tight;
        break;
      }
    }
  }

  stripDefs(literal) {
    // defs are only consumed at the START of a paragraph (cm-213: a def
    // after non-def text in the same paragraph is literal text)
    let pos = 0;
    while (true) {
      const end = parseDef(literal, pos, this.refs);
      if (end < 0) break;
      pos = end;
    }
    if (pos === 0) return literal;
    return literal.slice(pos).replace(/^\n+/, '');
  }

  // ----- line adding -----
  addLineToParagraph(p, line, prefix = '') {
    // table conversion: delimiter row?
    const s = prefix + line.rest();
    const delim = line.indent < 4 ? parseTableDelimiter(line.rest()) : null;
    if (delim && p.literal.length > 0) {
      const lines = p.literal.split('\n');
      const headerLine = lines[lines.length - 1];
      if (headerLine.includes('|') || delim.length === 1) {
        // convert: earlier lines stay a paragraph; last line is the header
        const earlier = lines.slice(0, -1).join('\n');
        const table = BNode('table');
        table._align = delim;
        table._header = splitRow(headerLine);
        table._rows = [];
        // replace paragraph with table in parent
        const parent = p.parent;
        if (earlier.trim() !== '') {
          p.literal = earlier;
          // insert table after p
          const nx = p.next;
          if (nx) insertBefore(nx, table); else appendChild(parent, table);
          this.finalizeBlock(p);
        } else {
          insertBefore(p, table);
          unlink(p);
          // remove paragraph from stack
          const pi = this.stack.indexOf(p);
          if (pi >= 0) this.stack.splice(pi, 1);
        }
        this.stack.push(table);
        return;
      }
    }
    if (p.literal.length > 0) p.literal += '\n';
    p.literal += s;
  }

  addTableRowLine(line) {
    const table = this.tip;
    const s = line.rest();
    const cells = splitRow(s);
    const allWs = cells.every(c => c.trim() === '');
    table._rows.push(cells);
    if (allWs) {
      // whitespace-only row is the last row
      this.finalizeBlock(table);
      // reprocess this line? No — the line was consumed as the row.
    }
  }

  addLineToCode(blk, line, isBlank) {
    if (blk._fenced && !isBlank) {
      // closing fence?
      const s = line.rest();
      const m = s.match(/^ {0,3}(`{3,}|~{3,}) *$/);
      if (m && m[1][0] === blk._fenceChar && m[1].length >= blk._fenceLen) {
        this.finalizeBlock(blk);
        return;
      }
    }
    let content;
    if (isBlank) {
      if (blk._fenced) content = '';
      else {
        // whitespace-only line in indented code keeps (wsCols - 4) spaces
        let cols = 0, i = line.offset, col = line.column;
        if (line.partial > 0) cols += line.partial;
        while (i < line.raw.length) {
          const c = line.raw[i];
          if (c === ' ') { cols += 1; i++; }
          else if (c === '\t') { cols += 4 - ((col + cols) % 4); i++; }
          else break;
        }
        content = ' '.repeat(Math.max(0, cols - 4));
      }
    }
    else if (blk._fenced) {
      // dedent by opener indent (backtick) / zero (tilde); leading tab in
      // container fence content expands to 4 spaces
      let rest = line.rest();
      if (blk._fenceChar === '`' && blk._fenceIndent > 0) {
        let cols = blk._fenceIndent;
        let k = 0;
        while (cols > 0 && k < rest.length) {
          if (rest[k] === ' ') { cols--; k++; }
          else if (rest[k] === '\t') { const w = 4 - ((line.column + k) % 4); if (cols >= w) { cols -= w; k++; } else { rest = ' '.repeat(w - cols) + rest.slice(k + 1); cols = 0; } }
          else break;
        }
        rest = rest.slice(k);
      }
      if (rest.startsWith('\t') && this.stack.length > 2) {
        const w = 4 - (line.column % 4);
        rest = ' '.repeat(w) + rest.slice(1);
      }
      content = rest;
    } else {
      // indented code: strip 4 columns
      const ind = Math.min(4, line.indent);
      line.advance(ind);
      content = line.rest();
    }
    blk.literal = (blk.literal || '') + content + '\n';
  }

  htmlTerminatorHit(blk, text) {
    const t = blk._htmlType;
    if (t === 1) return /<\/\s*(pre|script|style|textarea)\s*>/i.test(text);
    if (t === 2) return text.includes('-->');
    if (t === 3) return text.includes('?>');
    if (t === 4) return text.includes('>');
    if (t === 5) return text.includes(']]>');
    return false;
  }

  addLineToHtml(blk, line) {
    blk.literal = (blk.literal || '') + line.rest() + '\n';
    if (blk._htmlType <= 5 && this.htmlTerminatorHit(blk, line.rest())) {
      blk._endedByTerminator = true; this.finalizeBlock(blk);
    }
  }

  interruptParagraph() {
    if (this.tip.type === 'paragraph') this.finalizeBlock(this.tip);
  }

  lineStartsInterruptingBlock(line, container) {
    const ind = line.indent;
    if (ind >= 4) return false;
    let probe = line, s = line.rest();
    if (ind > 0) { probe = line.clone(); probe.advance(ind); s = probe.rest(); }
    if (/^(\*[ \t]*){3,}$/.test(s) || /^(-[ \t]*){3,}$/.test(s) || /^(_[ \t]*){3,}$/.test(s)) return true;
    if (/^#{1,6}(?:[ \t]+|[ \t]*$)/.test(s)) return true;
    const fence = s.match(/^(`{3,}|~{3,})/);
    if (fence && !(fence[1][0] === '`' && s.slice(fence[1].length).includes('`'))) return true;
    if (this.htmlBlockType(s, true) > 0) return true;
    if (s.startsWith('>')) return true;
    const li = this.matchListItem(probe, s);
    if (li) {
      // a marker matching the last matched list starts a new item of that
      // list regardless of its number (it is not a NEW list interrupting)
      if (container && container.type === 'list') {
        const sameType = li.bullet ? (!container.ordered && container._bullet === li.marker)
          : (container.ordered && container._delim === li.delim);
        if (sameType && li.nonEmpty) return true;
      }
      if ((li.bullet && li.nonEmpty) || (!li.bullet && li.start === 1 && li.nonEmpty)) return true;
    }
    return false;
  }

  // ----- block starts -----
  tryBlockStart(line) {
    this.noteContentAfterBlank();
    const tip = this.tip;
    const ind = line.indent;
    let s = line.rest();
    let probe = line;
    if (ind > 0 && ind < 4) {
      probe = line.clone();
      probe.advance(ind);
      s = probe.rest();
    }
    const commit = () => { if (probe !== line) { line.offset = probe.offset; line.column = probe.column; line.partial = probe.partial; } };
    // setext heading (paragraph open)
    if (tip.type === 'paragraph') {
      const m = s.match(/^ {0,3}(=+|-+)[ \t]*$/);
      if (m) {
        const rest = this.stripDefs(tip.literal || '');
        if (rest.trim() === '') {
          // paragraph was only link ref defs: no heading; '===' is text
          this.finalizeBlock(tip);
          return false;
        }
        tip.literal = rest.replace(/^[ \t]+/, '').replace(/[ \t]+$/, '');
        tip.type = 'heading'; tip.t = 'heading';
        tip.level = m[1][0] === '=' ? 1 : 2;
        this.finalizeBlock(tip);
        return 'consumed';
      }
    }
    if (ind >= 4) {
      // indented code (not if paragraph open)
      if (tip.type !== 'paragraph') {
        const cb = BNode('code_block');
        cb._fenced = false; cb.literal = '';
        appendChild(this.effectiveParent(), cb);
        this.stack.push(cb);
        this.addLineToCode(cb, line, line.blank);
        return 'consumed';
      }
      return false;
    }
    // fenced code
    const fence = s.match(/^(`{3,}|~{3,})(.*)$/);
    if (fence) {
      const info = fence[2].trim().replace(/\\([!"#$%&'()*+,\-./:;<=>?@\[\\\]^_`{|}~])/g, '$1');
      if (!(fence[1][0] === '`' && info.includes('`'))) {
        this.interruptParagraph();
        const cb = BNode('code_block');
        cb._fenced = true; cb._fenceChar = fence[1][0]; cb._fenceLen = fence[1].length;
        cb._fenceIndent = ind; cb.info = info; cb.literal = '';
        appendChild(this.effectiveParent(), cb);
        this.stack.push(cb);
        return 'consumed';
      }
    }
    // html block
    const htmlType = this.htmlBlockType(s, tip.type === 'paragraph');
    if (htmlType > 0) {
      this.interruptParagraph();
      const hb = BNode('html_block');
      hb._htmlType = htmlType; hb.literal = line.rest() + '\n';
      appendChild(this.effectiveParent(), hb);
      this.stack.push(hb);
      if (htmlType <= 5 && this.htmlTerminatorHit(hb, line.rest())) {
        hb._endedByTerminator = true; this.finalizeBlock(hb);
      }
      return 'consumed';
    }
    // thematic break
    if (/^(\*[ \t]*){3,}$/.test(s) || /^(-[ \t]*){3,}$/.test(s) || /^(_[ \t]*){3,}$/.test(s)) {
      this.interruptParagraph();
      const hr = BNode('thematic_break');
      appendChild(this.effectiveParent(), hr);
      return 'consumed';
    }
    // atx heading
    const atx = s.match(/^(#{1,6})(?:[ \t]+(.*?)|[ \t]*)$/);
    if (atx) {
      this.interruptParagraph();
      let content = atx[2] || '';
      if (/^#+$/.test(content)) content = '';
      else content = content.replace(/[ \t]+$/, '').replace(/[ \t]+#+$/, '').replace(/[ \t]+$/, '');
      const h = BNode('heading');
      h.level = atx[1].length; h.literal = content;
      appendChild(this.effectiveParent(), h);
      return 'consumed';
    }
    // blockquote
    if (s.startsWith('>')) {
      commit();
      this.interruptParagraph();
      const bq = BNode('block_quote');
      appendChild(this.effectiveParent(), bq);
      this.stack.push(bq);
      line.advanceChars(1);
      if (line.peek() === ' ' || line.peek() === '\t') line.advance(1);
      return true;
    }
    // list item
    const li = this.matchListItem(probe, s);
    if (li) {
      const canInterrupt = tip.type !== 'paragraph' ||
        (li.bullet && li.nonEmpty) || (!li.bullet && li.start === 1 && li.nonEmpty);
      if (canInterrupt) {
        if (tip.type === 'paragraph') this.finalizeBlock(tip);
        commit();
        this.addListItem(li, line);
        return true;
      }
      return false;
    }
    return false;
  }

  matchListItem(line, s) {
    if (line.indent >= 4) return null;
    let m = s.match(/^([*+-])(?=$|[ \t])/);
    let bullet = true, markerLen, delim = null, start = 0, marker;
    if (m) { markerLen = 1; marker = m[1]; }
    else {
      m = s.match(/^(\d{1,9})([.)])(?=$|[ \t])/);
      if (!m) return null;
      bullet = false; markerLen = m[1].length + 1; delim = m[2];
      start = parseInt(m[1], 10); marker = m[1] + delim;
    }
    // whitespace columns after the marker (tab-aware, absolute columns)
    const markerCol = line.column;
    let k = markerLen, cols = 0, col = markerCol + markerLen;
    while (k < s.length && (s[k] === ' ' || s[k] === '\t')) {
      if (s[k] === ' ') { cols++; col++; k++; }
      else { const w = 4 - (col % 4); cols += w; col += w; k++; }
    }
    const rest = s.slice(k);
    let padding, contentStart;
    if (rest === '') { padding = markerLen + 1; contentStart = markerLen + 1; }
    else if (cols >= 1 && cols <= 4) { padding = markerLen + cols; contentStart = markerLen + cols; }
    else { padding = markerLen + 1; contentStart = markerLen + 1; }
    return { bullet, marker, delim, markerLen, padding, contentStart, nonEmpty: rest.trim() !== '', start };
  }

  addListItem(li, line) {
    let tip = this.tip;
    // find or create list
    const sameType = (l) => li.bullet ? (!l.ordered && l._bullet === li.marker) : (l.ordered && l._delim === li.delim);
    let list = null;
    if (tip.type === 'list') {
      if (sameType(tip)) list = tip;
      else { this.finalizeBlock(tip); tip = this.tip; }
    }
    if (!list) {
      const last = tip.lastChild;
      if (last && last.type === 'list' && last.open && sameType(last)) list = last;
    }
    if (!list) {
      list = BNode('list');
      list.ordered = !li.bullet;
      list.start = li.bullet ? 0 : li.start;
      list._bullet = li.marker;
      list._delim = li.delim;
      list.tight = true;
      appendChild(tip, list);
      this.stack.push(list);
    }
    // loose check: previous item had a pending blank
    const prevItem = list.lastChild;
    if (prevItem && prevItem._blankPending) { list._blankBetweenItems = true; }
    const item = BNode('item');
    const markerCol = line.column + line.indent;
    item._markerOffset = markerCol;
    item._padding = li.padding;
    appendChild(list, item);
    this.stack.push(item);
    // advance past the marker (raw chars) then the whitespace columns to content
    line.advanceChars(li.markerLen);
    const target = markerCol + li.contentStart;
    const remaining = target - line.column;
    if (remaining > 0) line.advance(remaining);
  }

  htmlBlockType(s, inParagraph) {
    if (/^ {0,3}<(pre|script|style|textarea)([ \t>]|\/>|$)/i.test(s)) return 1;
    if (/^ {0,3}<!--/.test(s)) return 2;
    if (/^ {0,3}<\?/.test(s)) return 3;
    if (/^ {0,3}<![A-Za-z]/.test(s)) return 4;
    if (/^ {0,3}<!\[CDATA\[/.test(s)) return 5;
    if (/^ {0,3}<\/?[A-Za-z][A-Za-z0-9-]*(?:[ \t]+[^<>]*)?(?:>|\/>| *$)/.test(s)) {
      const m = s.match(/^ {0,3}<\/?([A-Za-z][A-Za-z0-9-]*)/);
      if (m && BLOCK_TAGS.has(m[1].toLowerCase())) return 6;
    }
    if (!inParagraph) {
      if (/^ {0,3}<\/?[A-Za-z][A-Za-z0-9-]*(?:[ \t]+[^<>]*)?(?:>|\/>| *$)/.test(s)) {
        // type 7: open or close tag, alone on the line (possibly with attrs)
        const trimmed = s.trim();
        if (/^<\/?[A-Za-z][A-Za-z0-9-]*(?:\s+[^\s>][^>]*)?\/?>$/.test(trimmed)) return 7;
        if (/^<\/?[A-Za-z][A-Za-z0-9-]*\s*>$/.test(trimmed)) return 7;
      }
    }
    return 0;
  }

  isFenceStart(s) {
    const m = s.match(/^ {0,3}(`{3,}|~{3,})/);
    if (!m) return false;
    if (m[1][0] === '`') {
      const rest = s.slice(m[0].length);
      return !rest.includes('`');
    }
    return true;
  }
  isListStart(s) {
    return !!this.matchListItem({ column: 0, indent: 0 }, s);
  }
  isHtmlBlockStart(s, inParagraph) {
    return this.htmlBlockType(s, inParagraph) > 0;
  }
}

function parseTableDelimiter(s) {
  const cells = splitRow(s);
  if (cells.length === 0) return null;
  const align = [];
  for (const c of cells) {
    const t = c.trim();
    if (!/^:?-+:?$/.test(t)) return null;
    if (t.startsWith(':') && t.endsWith(':')) align.push('center');
    else if (t.endsWith(':')) align.push('right');
    else if (t.startsWith(':')) align.push('left');
    else align.push(null);
  }
  return align;
}

function splitRow(s) {
  // split on unescaped pipes; strip optional leading/trailing pipe
  let t = s.trim();
  if (t.startsWith('|')) t = t.slice(1);
  if (t.endsWith('|') && !t.endsWith('\\|')) t = t.slice(0, -1);
  const cells = [];
  let cur = '', i = 0;
  while (i < t.length) {
    const c = t[i];
    if (c === '\\' && i + 1 < t.length && (t[i + 1] === '|' || t[i + 1] === '\\')) { cur += t[i + 1]; i += 2; continue; }
    if (c === '|') { cells.push(cur); cur = ''; i++; continue; }
    cur += c; i++;
  }
  cells.push(cur);
  return cells;
}

// ---------- block rendering ----------
function renderBlocks(node, doc) {
  let out = '';
  let c = node.firstChild;
  while (c) {
    out += renderBlock(c, doc);
    c = c.next;
  }
  return out;
}
function renderBlock(n, doc) {
  switch (n.t) {
    case 'document': return renderBlocks(n, doc);
    case 'paragraph': return '<p>' + renderInline(n.literal || '', doc) + '</p>\n';
    case 'heading': return '<h' + n.level + '>' + renderInline(n.literal || '', doc) + '</h' + n.level + '>\n';
    case 'thematic_break': return '<hr>\n';
    case 'code_block': {
      let info = '';
      if (n._fenced && n.info) {
        const lang = n.info.split(/\s+/)[0];
        if (lang) info = ' class="language-' + escAttr(lang) + '"';
      }
      return '<pre><code' + info + '>' + escCode(n.literal || '') + '</code></pre>\n';
    }
    case 'html_block': return n.literal || '';
    case 'block_quote': return '<blockquote>\n' + renderBlocks(n, doc) + '</blockquote>\n';
    case 'list': {
      const tag = n.ordered ? 'ol' : 'ul';
      const startAttr = (n.ordered && n.start !== 1) ? ' start="' + n.start + '"' : '';
      let out = '<' + tag + startAttr + '>\n';
      let it = n.firstChild;
      while (it) {
        out += '<li>' + renderItem(it, n.tight, doc) + '</li>\n';
        it = it.next;
      }
      return out + '</' + tag + '>\n';
    }
    case 'table': {
      let out = '<table>\n<thead>\n<tr>\n';
      for (let k = 0; k < n._header.length; k++) {
        const a = n._align[k];
        out += '<th' + (a ? ' align="' + a + '"' : '') + '>' + renderInline(n._header[k].trim(), doc) + '</th>\n';
      }
      out += '</tr>\n</thead>\n<tbody>';
      for (const row of n._rows) {
        out += '<tr>\n';
        for (let k = 0; k < n._align.length; k++) {
          const cell = k < row.length ? row[k] : '';
          out += '<td' + (n._align[k] ? ' align="' + n._align[k] + '"' : '') + '>' + renderInline(cell.trim(), doc) + '</td>\n';
        }
        out += '</tr>\n';
      }
      return out + '</tbody></table>\n';
    }
    default: return renderBlocks(n, doc);
  }
}
function renderItem(item, tight, doc) {
  let out = '';
  let c = item.firstChild;
  let first = true;
  while (c) {
    if (c.t === 'paragraph') {
      let lit = c.literal || '';
      let task = '';
      if (first) {
        const m = lit.match(/^\[( |x|X)\] /);
        if (m) {
          task = m[1] === ' ' ? '<input disabled="" type="checkbox">'
            : '<input checked="" disabled="" type="checkbox">';
          lit = lit.slice(3);
        }
      }
      if (tight) {
        out += task + renderInline(lit, doc);
      } else {
        out += '<p>' + task + renderInline(lit, doc) + '</p>\n';
      }
    } else {
      out += renderBlock(c, doc);
    }
    first = false;
    c = c.next;
  }
  return out;
}

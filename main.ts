import fs from 'node:fs';
import path from 'node:path';
import { parse } from './parse.js';

const inDir = process.env.MAKEFUN_INPUT_DIR || '/input';
const outDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';

const raw = fs.readFileSync(path.join(inDir, 'cases.json'), 'utf8');
const data = JSON.parse(raw);
const cases = Array.isArray(data) ? data : data.cases;

const out = cases.map((c) => ({ id: c.id, html: parse(c.markdown) }));

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'html.json'), JSON.stringify(out));

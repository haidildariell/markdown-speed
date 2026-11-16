[![make.fun · markdown-render-speed-02](https://make.fun/badge/markdown-render-speed-02.svg)](https://make.fun/bounty/markdown-render-speed-02?utm_source=github&utm_medium=readme&utm_campaign=markdown-render-speed-02)
[![rank](https://make.fun/badge/markdown-render-speed-02/haidildariell/markdown-speed/rank.svg)](https://make.fun/bounty/markdown-render-speed-02/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=markdown-render-speed-02)
[![reward](https://make.fun/badge/markdown-render-speed-02/haidildariell/markdown-speed/reward.svg)](https://make.fun/bounty/markdown-render-speed-02?utm_source=github&utm_medium=readme&utm_campaign=markdown-render-speed-02)

# markdown-speed

An original, dependency-free Markdown to HTML renderer written from scratch in
JavaScript (Node 22). It implements CommonMark 0.31.2 plus the GFM extensions
(tables, strikethrough, autolinks, task lists) and aims for byte-identical
output with the reference renderer on the practice corpus.

## Run

```sh
node main.ts
```

`main.ts` reads `cases.json` from `MAKEFUN_INPUT_DIR` (default `/input`) and
writes `html.json` to `MAKEFUN_OUTPUT_DIR` (default `/output`).

## Test

```sh
node run.mjs parse.js --list   # full practice corpus (720 cases)
node bench.mjs parse.js 5      # speed, CPU ms per set
```

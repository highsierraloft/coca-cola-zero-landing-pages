# Coca-Cola Zero GPT-5.6 Benchmark Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish three independently generated GPT-5.6 Coca-Cola Zero landing pages alongside the restored GPT-5.4, GPT-5.5, and Gemini/Antigravity pages in one GitHub Pages comparison gallery.

**Architecture:** Keep every model result as a self-contained static subdirectory and serve a lightweight comparison index from the repository root. Restore historical outputs from git, move the current Gemini root intact, run Sol/Terra/Luna in isolated directories with the identical recovered prompt, and validate both filesystem structure and real browser behavior before publishing `main:/` through GitHub Pages.

**Tech Stack:** Static HTML/CSS/JavaScript, Bun for repository scripts, Codex CLI 0.144.0, GPT-5.6 Sol/Terra/Luna, Playwright browser QA, GitHub Pages, Telegram sender wrapper.

---

## File Structure

### Files created

- `prompts/gpt-56-benchmark.md`: canonical model prompt and isolation constraints shared byte-for-byte by all three GPT-5.6 runs.
- `scripts/validate-pages.mjs`: dependency-free structural and relative-asset validation for the gallery and model routes.
- `index.html`: root comparison gallery linking all six advertisements.
- `gallery.css`: root gallery styling; deliberately separate from generated page styling.
- `package.json`: root Bun scripts for structural validation and local serving.
- `gpt-56-sol/**`: files authored only by GPT-5.6 Sol.
- `gpt-56-terra/**`: files authored only by GPT-5.6 Terra.
- `gpt-56-luna/**`: files authored only by GPT-5.6 Luna.

### Files moved without content changes

- `app.js` -> `gemini-antigravity/app.js`
- `assets/**` -> `gemini-antigravity/assets/**`
- current `index.html` -> `gemini-antigravity/index.html`
- current `package.json` -> `gemini-antigravity/package.json`
- `style.css` -> `gemini-antigravity/style.css`

### Files restored from commit `21bf9517328d6d30ca62def78a749e2c155323b8`

- `coke-zero-54/**`
- `coke-zero-55/**`

### Files modified

- `README.md`: route table, model/effort provenance, canonical prompt, and local verification commands.

## Task 1: Add the Reproducible Prompt and Failing Structural Gate

**Files:**
- Create: `prompts/gpt-56-benchmark.md`
- Create: `scripts/validate-pages.mjs`

- [ ] **Step 1: Create the exact shared prompt**

```markdown
No skills are allowed. Create a beautiful landing page for Coca-Cola Zero using only plain AI. It can use custom design libraries. It must have at least five sections, with the hero section on top.

Build it as a GitHub Pages-compatible static website in the current working directory. Only create or edit files inside the current working directory. Do not inspect sibling directories or reuse another model's work. Use relative asset paths that work when the directory is hosted under a GitHub Pages repository subpath. Verify it locally and report the changed files plus verification performed.
```

- [ ] **Step 2: Write a structural validator that describes the final route contract**

```javascript
import { access, readFile, stat } from 'node:fs/promises';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const routeFilterIndex = process.argv.indexOf('--route');
const routeFilter = routeFilterIndex >= 0 ? process.argv[routeFilterIndex + 1] : null;

const routes = [
  { id: 'root', dir: '.', generated: false },
  { id: 'coke-zero-54', dir: 'coke-zero-54', generated: false },
  { id: 'coke-zero-55', dir: 'coke-zero-55', generated: false },
  { id: 'gemini-antigravity', dir: 'gemini-antigravity', generated: false },
  { id: 'gpt-56-sol', dir: 'gpt-56-sol', generated: true },
  { id: 'gpt-56-terra', dir: 'gpt-56-terra', generated: true },
  { id: 'gpt-56-luna', dir: 'gpt-56-luna', generated: true },
];

const selected = routeFilter ? routes.filter(({ id }) => id === routeFilter) : routes;
if (selected.length === 0) {
  console.error(`Unknown route: ${routeFilter}`);
  process.exit(2);
}

const failures = [];
const checked = [];
const externalReference = /^(?:[a-z]+:|\/\/|#|data:|mailto:|tel:|javascript:)/i;

function cleanReference(value) {
  return value.trim().replace(/^['"]|['"]$/g, '').split('#')[0].split('?')[0];
}

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function checkLocalReference(routeDir, sourceFile, rawReference) {
  const reference = cleanReference(rawReference);
  if (!reference || externalReference.test(reference)) return;
  if (reference.startsWith('/')) {
    failures.push(`${sourceFile}: root-absolute reference is not Pages-safe: ${reference}`);
    return;
  }

  const candidate = resolve(dirname(sourceFile), reference);
  if (!candidate.startsWith(resolve(routeDir))) {
    failures.push(`${sourceFile}: reference escapes route directory: ${reference}`);
    return;
  }
  if (!(await exists(candidate))) {
    failures.push(`${sourceFile}: missing local reference: ${reference}`);
  }
}

async function checkCss(routeDir, cssPath) {
  const css = await readFile(cssPath, 'utf8');
  const matches = [...css.matchAll(/url\(([^)]+)\)/gi)];
  for (const match of matches) {
    await checkLocalReference(routeDir, cssPath, match[1]);
  }
}

for (const route of selected) {
  const routeDir = join(root, route.dir);
  const indexPath = join(routeDir, 'index.html');
  if (!(await exists(indexPath))) {
    failures.push(`${route.id}: missing index.html`);
    continue;
  }

  const html = await readFile(indexPath, 'utf8');
  checked.push(route.id);
  if (!/<title>[^<]+<\/title>/i.test(html)) failures.push(`${route.id}: missing non-empty title`);
  if (!/<h1\b/i.test(html)) failures.push(`${route.id}: missing h1`);

  if (route.generated) {
    const sectionCount = (html.match(/<section\b/gi) || []).length;
    if (sectionCount < 5) failures.push(`${route.id}: expected at least 5 sections, found ${sectionCount}`);
    const firstSection = html.match(/<section\b[^>]*>/i)?.[0] ?? '';
    if (!/hero/i.test(firstSection)) failures.push(`${route.id}: first section is not identifiable as hero`);
  }

  const attributeMatches = [...html.matchAll(/(?:src|href)=(["'])(.*?)\1/gi)];
  for (const [, , rawReference] of attributeMatches) {
    await checkLocalReference(routeDir, indexPath, rawReference);
    const reference = cleanReference(rawReference);
    if (!reference || externalReference.test(reference)) continue;
    const candidate = resolve(dirname(indexPath), reference);
    if ((await exists(candidate)) && extname(candidate) === '.css') await checkCss(routeDir, candidate);
  }
}

if (!routeFilter && checked.includes('root')) {
  const gallery = await readFile(join(root, 'index.html'), 'utf8');
  for (const route of routes.filter(({ id }) => id !== 'root')) {
    const expected = `./${route.dir}/`;
    if (!gallery.includes(`href="${expected}"`) && !gallery.includes(`href='${expected}'`)) {
      failures.push(`root: missing gallery link ${expected}`);
    }
  }
}

if (failures.length > 0) {
  console.error(failures.map((failure) => `FAIL ${failure}`).join('\n'));
  process.exit(1);
}

console.log(`PASS ${checked.join(', ')}`);
```

- [ ] **Step 3: Run the validator and confirm the contract starts red**

Run: `bun scripts/validate-pages.mjs`

Expected: exit 1 with missing `gemini-antigravity/index.html`, `gpt-56-sol/index.html`, `gpt-56-terra/index.html`, `gpt-56-luna/index.html`, and missing root gallery links. This proves the gate detects the work that remains.

- [ ] **Step 4: Run syntax validation for the validator itself**

Run: `bun --check scripts/validate-pages.mjs`

Expected: exit 0 with no syntax errors.

- [ ] **Step 5: Commit the prompt and red gate**

```bash
git add prompts/gpt-56-benchmark.md scripts/validate-pages.mjs
git commit -m "test: add Coca-Cola Zero benchmark validation"
```

## Task 2: Preserve Gemini and Restore GPT-5.4/GPT-5.5

**Files:**
- Move: `app.js`, `assets/**`, `index.html`, `package.json`, `style.css` into `gemini-antigravity/`
- Restore: `coke-zero-54/**`
- Restore: `coke-zero-55/**`

- [ ] **Step 1: Move the current Gemini/Antigravity implementation intact**

```bash
mkdir -p gemini-antigravity
git mv app.js assets index.html package.json style.css gemini-antigravity/
```

- [ ] **Step 2: Restore both historical GPT routes from the proven deployment commit**

```bash
git restore --source=21bf9517328d6d30ca62def78a749e2c155323b8 -- coke-zero-54 coke-zero-55
```

- [ ] **Step 3: Verify the preserved and restored routes individually**

Run: `bun scripts/validate-pages.mjs --route gemini-antigravity`

Expected: `PASS gemini-antigravity`.

Run: `bun scripts/validate-pages.mjs --route coke-zero-54`

Expected: `PASS coke-zero-54`.

Run: `bun scripts/validate-pages.mjs --route coke-zero-55`

Expected: `PASS coke-zero-55`.

- [ ] **Step 4: Confirm the full gate remains red only for new pages and root gallery**

Run: `bun scripts/validate-pages.mjs`

Expected: exit 1; the three GPT-5.6 routes and root gallery remain incomplete, while no restored-route failure appears.

- [ ] **Step 5: Commit the preserved historical outputs**

```bash
git add -A app.js assets index.html package.json style.css gemini-antigravity coke-zero-54 coke-zero-55
git commit -m "chore: restore historical Coca-Cola Zero pages"
```

## Task 3: Generate GPT-5.6 Sol at Ultra

**Files:**
- Create: `gpt-56-sol/**` through the model run only

- [ ] **Step 1: Create the isolated empty target**

Run: `mkdir gpt-56-sol`

Expected: empty `gpt-56-sol/` directory.

- [ ] **Step 2: Invoke Sol with the shared prompt and explicit Ultra effort**

```bash
codex exec \
  -C "$PWD/gpt-56-sol" \
  --skip-git-repo-check \
  -s workspace-write \
  -a never \
  -m gpt-5.6-sol \
  -c 'model_reasoning_effort="ultra"' \
  - < "$PWD/prompts/gpt-56-benchmark.md"
```

Expected: the final response identifies created files and local verification; the target contains a static `index.html` and its own assets.

- [ ] **Step 3: Validate Sol's route contract**

Run: `bun scripts/validate-pages.mjs --route gpt-56-sol`

Expected: `PASS gpt-56-sol`.

If it fails, give the exact structural/path failure back to `gpt-5.6-sol` at `ultra` and instruct it to correct its own existing output without design guidance, then rerun the same validator.

- [ ] **Step 4: Inspect target-only changes**

Run: `git status --short -- gpt-56-sol`

Expected: only new files under `gpt-56-sol/`.

- [ ] **Step 5: Commit Sol's untouched result**

```bash
git add gpt-56-sol
git commit -m "feat: add GPT-5.6 Sol Coca-Cola Zero page"
```

## Task 4: Generate GPT-5.6 Terra at Ultra

**Files:**
- Create: `gpt-56-terra/**` through the model run only

- [ ] **Step 1: Create the isolated empty target**

Run: `mkdir gpt-56-terra`

Expected: empty `gpt-56-terra/` directory.

- [ ] **Step 2: Invoke Terra with the identical prompt and explicit Ultra effort**

```bash
codex exec \
  -C "$PWD/gpt-56-terra" \
  --skip-git-repo-check \
  -s workspace-write \
  -a never \
  -m gpt-5.6-terra \
  -c 'model_reasoning_effort="ultra"' \
  - < "$PWD/prompts/gpt-56-benchmark.md"
```

Expected: the final response identifies created files and local verification; the target contains a static `index.html` and its own assets.

- [ ] **Step 3: Validate Terra's route contract**

Run: `bun scripts/validate-pages.mjs --route gpt-56-terra`

Expected: `PASS gpt-56-terra`.

If it fails, give the exact structural/path failure back to `gpt-5.6-terra` at `ultra` and instruct it to correct its own existing output without design guidance, then rerun the same validator.

- [ ] **Step 4: Inspect target-only changes**

Run: `git status --short -- gpt-56-terra`

Expected: only new files under `gpt-56-terra/`.

- [ ] **Step 5: Commit Terra's untouched result**

```bash
git add gpt-56-terra
git commit -m "feat: add GPT-5.6 Terra Coca-Cola Zero page"
```

## Task 5: Generate GPT-5.6 Luna at Max

**Files:**
- Create: `gpt-56-luna/**` through the model run only

- [ ] **Step 1: Create the isolated empty target**

Run: `mkdir gpt-56-luna`

Expected: empty `gpt-56-luna/` directory.

- [ ] **Step 2: Invoke Luna with the identical prompt and its maximum supported effort**

```bash
codex exec \
  -C "$PWD/gpt-56-luna" \
  --skip-git-repo-check \
  -s workspace-write \
  -a never \
  -m gpt-5.6-luna \
  -c 'model_reasoning_effort="max"' \
  - < "$PWD/prompts/gpt-56-benchmark.md"
```

Expected: the final response identifies created files and local verification; the target contains a static `index.html` and its own assets.

- [ ] **Step 3: Validate Luna's route contract**

Run: `bun scripts/validate-pages.mjs --route gpt-56-luna`

Expected: `PASS gpt-56-luna`.

If it fails, give the exact structural/path failure back to `gpt-5.6-luna` at `max` and instruct it to correct its own existing output without design guidance, then rerun the same validator.

- [ ] **Step 4: Inspect target-only changes**

Run: `git status --short -- gpt-56-luna`

Expected: only new files under `gpt-56-luna/`.

- [ ] **Step 5: Commit Luna's untouched result**

```bash
git add gpt-56-luna
git commit -m "feat: add GPT-5.6 Luna Coca-Cola Zero page"
```

## Task 6: Build the Root Comparison Gallery

**Files:**
- Create: `index.html`
- Create: `gallery.css`
- Create: `package.json`

- [ ] **Step 1: Create the semantic comparison index**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta
      name="description"
      content="Six AI-generated interpretations of the same Coca-Cola Zero landing-page benchmark."
    />
    <title>Coca-Cola Zero AI Landing Page Benchmark</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Manrope:wght@400;600;700;800&display=swap"
      rel="stylesheet"
    />
    <link rel="stylesheet" href="./gallery.css" />
  </head>
  <body>
    <header class="masthead">
      <a class="wordmark" href="#top" aria-label="Coca-Cola Zero AI benchmark home">
        <span class="wordmark-dot" aria-hidden="true"></span>
        ZERO / MODEL LAB
      </a>
      <span class="edition">2026 comparison</span>
    </header>

    <main id="top">
      <section class="intro" aria-labelledby="page-title">
        <p class="eyebrow">One brief. Six independent builds.</p>
        <h1 id="page-title">Same prompt.<br /><span>Different instincts.</span></h1>
        <div class="intro-grid">
          <p class="lede">
            A side-by-side archive of Coca-Cola Zero landing pages created by different AI models.
            The OpenAI runs share one minimal prompt and receive no visual direction.
          </p>
          <dl class="benchmark-facts">
            <div><dt>Pages</dt><dd>06</dd></div>
            <div><dt>Prompt</dt><dd>01</dd></div>
            <div><dt>Framework</dt><dd>Open</dd></div>
          </dl>
        </div>
      </section>

      <section class="prompt-panel" aria-labelledby="prompt-title">
        <div>
          <p class="section-index">Benchmark input</p>
          <h2 id="prompt-title">The recovered prompt</h2>
        </div>
        <blockquote>
          “No skills are allowed. Create a beautiful landing page for Coca-Cola Zero using only
          plain AI. It can use custom design libraries. It must have at least five sections, with
          the hero section on top.”
        </blockquote>
      </section>

      <section class="results" aria-labelledby="results-title">
        <div class="section-heading">
          <p class="section-index">Results archive</p>
          <h2 id="results-title">Open an interpretation</h2>
        </div>

        <div class="card-grid">
          <article class="model-card legacy">
            <p class="card-number">01</p>
            <div><p class="family">OpenAI</p><h3>GPT-5.4</h3><p class="effort">Extra-high reasoning</p></div>
            <a href="./coke-zero-54/">View page</a>
          </article>
          <article class="model-card legacy">
            <p class="card-number">02</p>
            <div><p class="family">OpenAI</p><h3>GPT-5.5</h3><p class="effort">Extra-high reasoning</p></div>
            <a href="./coke-zero-55/">View page</a>
          </article>
          <article class="model-card gemini">
            <p class="card-number">03</p>
            <div><p class="family">Google / Antigravity</p><h3>Gemini</h3><p class="effort">3.5 Flash · High</p></div>
            <a href="./gemini-antigravity/">View page</a>
          </article>
          <article class="model-card current">
            <p class="card-number">04</p>
            <div><p class="family">OpenAI · GPT-5.6</p><h3>Sol</h3><p class="effort">Ultra reasoning</p></div>
            <a href="./gpt-56-sol/">View page</a>
          </article>
          <article class="model-card current">
            <p class="card-number">05</p>
            <div><p class="family">OpenAI · GPT-5.6</p><h3>Terra</h3><p class="effort">Ultra reasoning</p></div>
            <a href="./gpt-56-terra/">View page</a>
          </article>
          <article class="model-card current">
            <p class="card-number">06</p>
            <div><p class="family">OpenAI · GPT-5.6</p><h3>Luna</h3><p class="effort">Max reasoning</p></div>
            <a href="./gpt-56-luna/">View page</a>
          </article>
        </div>
      </section>
    </main>

    <footer>
      <p>Unofficial AI design benchmark. Not affiliated with or endorsed by The Coca-Cola Company.</p>
      <a href="https://github.com/highsierraloft/coca-cola-zero-landing-pages">Source repository</a>
    </footer>
  </body>
</html>
```

- [ ] **Step 2: Create the gallery visual system**

```css
:root {
  color-scheme: dark;
  --ink: #f2f0eb;
  --muted: #9c9993;
  --line: rgba(242, 240, 235, 0.16);
  --panel: #141414;
  --red: #f40009;
  --black: #080808;
}

* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  min-width: 320px;
  background:
    radial-gradient(circle at 72% 6%, rgba(244, 0, 9, 0.16), transparent 29rem),
    var(--black);
  color: var(--ink);
  font-family: Manrope, sans-serif;
}
a { color: inherit; }

.masthead,
main,
footer {
  width: min(100% - 40px, 1240px);
  margin-inline: auto;
}

.masthead {
  min-height: 88px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--line);
  font: 500 0.72rem/1 DM Mono, monospace;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.wordmark { display: inline-flex; align-items: center; gap: 10px; text-decoration: none; }
.wordmark-dot { width: 9px; height: 9px; border-radius: 50%; background: var(--red); box-shadow: 0 0 18px var(--red); }
.edition { color: var(--muted); }

.intro { padding: clamp(88px, 12vw, 168px) 0 96px; }
.eyebrow,
.section-index,
.family,
.effort,
.card-number {
  margin: 0;
  font: 500 0.72rem/1.4 DM Mono, monospace;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.eyebrow,
.section-index,
.family { color: var(--red); }
h1 {
  max-width: 1050px;
  margin: 24px 0 64px;
  font-size: clamp(3.7rem, 10vw, 9rem);
  line-height: 0.87;
  letter-spacing: -0.075em;
}
h1 span { color: transparent; -webkit-text-stroke: 1px rgba(242, 240, 235, 0.72); }
.intro-grid { display: grid; grid-template-columns: minmax(0, 1.25fr) minmax(300px, 0.75fr); gap: clamp(48px, 8vw, 120px); align-items: end; }
.lede { max-width: 690px; margin: 0; color: #cbc8c1; font-size: clamp(1.15rem, 2vw, 1.65rem); line-height: 1.55; }
.benchmark-facts { display: grid; grid-template-columns: repeat(3, 1fr); margin: 0; border-block: 1px solid var(--line); }
.benchmark-facts div { padding: 18px 10px; border-right: 1px solid var(--line); }
.benchmark-facts div:last-child { border-right: 0; }
.benchmark-facts dt { color: var(--muted); font: 400 0.65rem/1.4 DM Mono, monospace; text-transform: uppercase; }
.benchmark-facts dd { margin: 8px 0 0; font-weight: 800; }

.prompt-panel {
  display: grid;
  grid-template-columns: minmax(220px, 0.5fr) minmax(0, 1.5fr);
  gap: clamp(40px, 7vw, 100px);
  padding: 72px;
  background: var(--red);
  color: white;
}
.prompt-panel .section-index { color: rgba(255, 255, 255, 0.66); }
h2 { margin: 14px 0 0; font-size: clamp(1.8rem, 4vw, 3.7rem); line-height: 1; letter-spacing: -0.045em; }
blockquote { margin: 0; font-size: clamp(1.35rem, 2.5vw, 2.25rem); line-height: 1.4; font-weight: 600; letter-spacing: -0.025em; }

.results { padding: 120px 0; }
.section-heading { display: flex; align-items: end; justify-content: space-between; gap: 40px; margin-bottom: 52px; }
.card-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); border-top: 1px solid var(--line); border-left: 1px solid var(--line); }
.model-card {
  min-height: 370px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 28px;
  background: rgba(20, 20, 20, 0.72);
  border-right: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
  transition: background 180ms ease, transform 180ms ease;
}
.model-card:hover { background: #1c1c1c; transform: translateY(-4px); }
.model-card.current { background: linear-gradient(145deg, rgba(244, 0, 9, 0.14), rgba(20, 20, 20, 0.85) 45%); }
.model-card.gemini { background: linear-gradient(145deg, rgba(66, 133, 244, 0.12), rgba(20, 20, 20, 0.85) 45%); }
.card-number { color: var(--muted); }
.model-card h3 { margin: 8px 0 12px; font-size: clamp(2.5rem, 4vw, 4.4rem); line-height: 0.9; letter-spacing: -0.06em; }
.effort { color: var(--muted); }
.model-card a { display: flex; justify-content: space-between; align-items: center; padding-top: 20px; border-top: 1px solid var(--line); text-decoration: none; font-weight: 700; }

footer {
  min-height: 128px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
  border-top: 1px solid var(--line);
  color: var(--muted);
  font: 400 0.72rem/1.6 DM Mono, monospace;
}
footer p { max-width: 680px; }
footer a { color: var(--ink); }

@media (max-width: 900px) {
  .intro-grid,
  .prompt-panel { grid-template-columns: 1fr; }
  .prompt-panel { padding: 48px; }
  .card-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (max-width: 600px) {
  .masthead,
  main,
  footer { width: min(100% - 28px, 1240px); }
  .masthead { min-height: 72px; }
  .edition { display: none; }
  .intro { padding: 72px 0; }
  h1 { margin-bottom: 48px; font-size: clamp(3.3rem, 18vw, 5.2rem); }
  .intro-grid { gap: 36px; }
  .benchmark-facts { font-size: 0.85rem; }
  .prompt-panel { padding: 34px 24px; }
  .results { padding: 88px 0; }
  .card-grid { grid-template-columns: 1fr; }
  .model-card { min-height: 310px; }
  footer { align-items: flex-start; flex-direction: column; justify-content: center; padding: 28px 0; }
}

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  .model-card { transition: none; }
}
```

- [ ] **Step 3: Add root Bun commands**

```json
{
  "name": "coca-cola-zero-model-benchmark",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "test": "bun scripts/validate-pages.mjs",
    "serve": "bunx --bun http-server . -p 4173 -c-1"
  }
}
```

- [ ] **Step 4: Run the root-only gate**

Run: `bun scripts/validate-pages.mjs --route root`

Expected: `PASS root`.

- [ ] **Step 5: Run the complete structural gate**

Run: `bun run test`

Expected: `PASS root, coke-zero-54, coke-zero-55, gemini-antigravity, gpt-56-sol, gpt-56-terra, gpt-56-luna`.

- [ ] **Step 6: Commit the gallery**

```bash
git add index.html gallery.css package.json
git commit -m "feat: add Coca-Cola Zero model gallery"
```

## Task 7: Document the Benchmark and Provenance

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Replace README with the final route and model matrix**

```markdown
# Coca-Cola Zero AI Landing Page Benchmark

Six standalone Coca-Cola Zero landing pages collected under one GitHub Pages comparison gallery.

## Live pages

| Page | Model | Reasoning | Route |
| --- | --- | --- | --- |
| Historical OpenAI | GPT-5.4 | Extra-high | `/coke-zero-54/` |
| Historical OpenAI | GPT-5.5 | Extra-high | `/coke-zero-55/` |
| Antigravity | Gemini 3.5 Flash | High | `/gemini-antigravity/` |
| GPT-5.6 family | Sol | Ultra | `/gpt-56-sol/` |
| GPT-5.6 family | Terra | Ultra | `/gpt-56-terra/` |
| GPT-5.6 family | Luna | Max | `/gpt-56-luna/` |

## GPT-5.6 benchmark prompt

> No skills are allowed. Create a beautiful landing page for Coca-Cola Zero using only plain AI. It can use custom design libraries. It must have at least five sections, with the hero section on top.

All three GPT-5.6 models received the same prompt and the same operational wrapper. They ran in isolated folders without access to sibling results or visual guidance.

## Local verification

```bash
bun run test
bun run serve
```

GitHub Pages serves `main:/` at:

https://highsierraloft.github.io/coca-cola-zero-landing-pages/

This is an unofficial AI design benchmark and is not affiliated with or endorsed by The Coca-Cola Company.
```

- [ ] **Step 2: Verify documentation paths against the structural manifest**

Run: `rg -n '/(coke-zero-54|coke-zero-55|gemini-antigravity|gpt-56-sol|gpt-56-terra|gpt-56-luna)/' README.md`

Expected: all six routes appear once in the table.

- [ ] **Step 3: Commit documentation**

```bash
git add README.md
git commit -m "docs: document Coca-Cola Zero benchmark routes"
```

## Task 8: Run Local Browser and Accessibility Smoke QA

**Files:**
- No repository file changes expected

- [ ] **Step 1: Start the local server in a managed foreground session**

Run: `bun run serve`

Expected: HTTP server listens on `http://127.0.0.1:4173` and remains attached to a captured session ID.

- [ ] **Step 2: Run HTTP route checks**

```bash
for route in '' coke-zero-54/ coke-zero-55/ gemini-antigravity/ gpt-56-sol/ gpt-56-terra/ gpt-56-luna/; do
  curl -fsS -o /dev/null "http://127.0.0.1:4173/$route"
done
```

Expected: every request exits 0.

- [ ] **Step 3: Use the Playwright workflow for desktop screenshots and smoke checks**

Open each route at `1440x1100`. Check the page title and H1, confirm the first viewport is not blank, record console errors, failed requests, page errors, and horizontal overflow, and capture one screenshot per route outside the repository.

Expected: six advertisement pages and the gallery render without blocking overlap, uncaught errors, failed local assets, or horizontal overflow.

- [ ] **Step 4: Repeat the new GPT-5.6 checks on mobile**

Open `/gpt-56-sol/`, `/gpt-56-terra/`, and `/gpt-56-luna/` at `390x844`. Confirm readable hero copy, visible product treatment, reachable next section, usable navigation/controls, no horizontal overflow, and no page errors.

Expected: all three pages pass.

- [ ] **Step 5: Check reduced motion**

Emulate `prefers-reduced-motion: reduce` for the gallery and each GPT-5.6 route. Confirm essential content remains visible and no continuous motion blocks interaction.

Expected: all four routes remain usable.

- [ ] **Step 6: Stop the server and confirm cleanup**

Send Ctrl-C to the captured server session, then run `lsof -nP -iTCP:4173 -sTCP:LISTEN`.

Expected: no listener remains on port 4173 and no browser process started by this task remains stale.

## Task 9: Final Verification, Commit Audit, Push, and Pages Deployment

**Files:**
- No new repository file changes expected

- [ ] **Step 1: Run fresh final checks**

Run: `bun --check scripts/validate-pages.mjs`

Expected: exit 0.

Run: `bun run test`

Expected: all seven routes pass.

Run: `git diff --check`

Expected: no whitespace errors.

- [ ] **Step 2: Audit repository scope before publishing**

Run: `git status -sb`

Expected: `main` is ahead of `origin/main` with no unstaged or untracked files.

Run: `git log --oneline origin/main..HEAD`

Expected: only the approved design, plan, validation, historical preservation, three model outputs, gallery, and route documentation commits.

- [ ] **Step 3: Push the current branch**

Run: `git push origin main`

Expected: `main` updates successfully. If credentials select the wrong GitHub account, switch temporarily to the configured `highsierraloft` account, push, and restore the previously active account afterward.

- [ ] **Step 4: Wait for GitHub Pages to build the pushed SHA**

```bash
gh api repos/highsierraloft/coca-cola-zero-landing-pages/pages \
  --jq '{html_url,status,build_type,source}'
```

Expected: `status` is `built`, source is `main:/`, and the latest Pages deployment SHA equals local `HEAD`.

- [ ] **Step 5: Verify every public URL**

```bash
for route in '' coke-zero-54/ coke-zero-55/ gemini-antigravity/ gpt-56-sol/ gpt-56-terra/ gpt-56-luna/; do
  curl -fsS -o /dev/null "https://highsierraloft.github.io/coca-cola-zero-landing-pages/$route"
done
```

Expected: all seven routes return HTTP 200.

- [ ] **Step 6: Run one public browser smoke pass**

Open the public gallery, follow each of its six links, and confirm the destination title/H1 and lack of failed local assets.

Expected: every card reaches its intended live advertisement.

## Task 10: Send the Verified Handoff Through Telegram

**Files:**
- Create temporarily outside the repository: `/tmp/coca-cola-zero-benchmark-telegram.md`

- [ ] **Step 1: Prepare the exact final Markdown summary**

Use `apply_patch` to create `/tmp/coca-cola-zero-benchmark-telegram.md` with this exact content after every public check has passed:

```markdown
## Coca-Cola Zero AI benchmark is live

| Version | Reasoning | URL |
| --- | --- | --- |
| GPT-5.4 | Extra-high | [Open page](https://highsierraloft.github.io/coca-cola-zero-landing-pages/coke-zero-54/) |
| GPT-5.5 | Extra-high | [Open page](https://highsierraloft.github.io/coca-cola-zero-landing-pages/coke-zero-55/) |
| Gemini / Antigravity | High | [Open page](https://highsierraloft.github.io/coca-cola-zero-landing-pages/gemini-antigravity/) |
| GPT-5.6 Sol | Ultra | [Open page](https://highsierraloft.github.io/coca-cola-zero-landing-pages/gpt-56-sol/) |
| GPT-5.6 Terra | Ultra | [Open page](https://highsierraloft.github.io/coca-cola-zero-landing-pages/gpt-56-terra/) |
| GPT-5.6 Luna | Max | [Open page](https://highsierraloft.github.io/coca-cola-zero-landing-pages/gpt-56-luna/) |

**Comparison gallery:** [Open all versions](https://highsierraloft.github.io/coca-cola-zero-landing-pages/)

**Shared GPT-5.6 prompt:**
> No skills are allowed. Create a beautiful landing page for Coca-Cola Zero using only plain AI. It can use custom design libraries. It must have at least five sections, with the hero section on top.

Verification: **Passed** on desktop, mobile, structural checks, public routes, console, and local assets.
Deployment: **GitHub Pages built from the verified main branch.**
Orchestration repairs: None.
```

If a model had to correct its own structural or path failure, replace `Orchestration repairs: None.` with one sentence naming that model-authored correction before sending.

- [ ] **Step 2: Send through the configured allowlisted chat**

Run: `telegram-send send < /tmp/coca-cola-zero-benchmark-telegram.md`

Expected: wrapper reports successful delivery to the default allowlisted chat without exposing the bot token.

- [ ] **Step 3: Remove the temporary handoff and check Telegram errors**

Run: `rm -f /tmp/coca-cola-zero-benchmark-telegram.md`

Expected: temporary file is absent.

If delivery fails, run `skill-errors recent --skill send-via-telegram`, correct the wrapper/config issue without printing secrets, and retry once.

- [ ] **Step 4: Report completion in Codex**

Return the comparison URL, six direct page URLs, model/effort matrix, verified deployment SHA, checks performed, Telegram delivery status, and any model-authored output repairs. Do not claim completion until the public browser smoke and Telegram send have both succeeded.

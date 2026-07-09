# Coca-Cola Zero GPT-5.6 Benchmark Design

## Objective

Extend the existing Coca-Cola Zero model benchmark into one GitHub Pages gallery. Restore the historical GPT-5.4 and GPT-5.5 pages, preserve the current Gemini/Antigravity page at a stable subpath, generate three new pages with the GPT-5.6 model family, and publish a root comparison index that links every result.

## Recovered Benchmark Prompt

Every GPT-5.6 model receives the same creative instruction that was used for the historical OpenAI comparison:

> No skills are allowed. Create a beautiful landing page for Coca-Cola Zero using only plain AI. It can use custom design libraries. It must have at least five sections, with the hero section on top.

The execution wrapper may state the target directory, require a GitHub Pages-compatible static result, restrict edits to that directory, request local verification, and name the model for reporting. It must not add visual direction, content concepts, layout guidance, shared assets, or references to sibling results.

## Model Matrix

| Route | Source | Reasoning effort |
| --- | --- | --- |
| `/gpt-56-sol/` | `gpt-5.6-sol` | `ultra` |
| `/gpt-56-terra/` | `gpt-5.6-terra` | `ultra` |
| `/gpt-56-luna/` | `gpt-5.6-luna` | `max`, the model's highest supported effort |

Each model runs in a new, empty, isolated directory. It may not inspect or reuse another model's page.

## Published Route Set

| Route | Purpose |
| --- | --- |
| `/` | Comparison index with metadata and links to every page |
| `/coke-zero-54/` | Restored historical GPT-5.4 extra-high page |
| `/coke-zero-55/` | Restored historical GPT-5.5 extra-high page |
| `/gemini-antigravity/` | Preserved current Gemini/Antigravity page |
| `/gpt-56-sol/` | New GPT-5.6 Sol page |
| `/gpt-56-terra/` | New GPT-5.6 Terra page |
| `/gpt-56-luna/` | New GPT-5.6 Luna page |

The historical GPT pages will be restored from commit `21bf9517328d6d30ca62def78a749e2c155323b8`. The current root implementation from commit `aa682174c2b1fc8203801f79e569f9b51378278c` will be moved intact into `gemini-antigravity/` before the root index replaces it.

## Architecture

The repository remains a static GitHub Pages site served from `main:/`. Each advertisement is self-contained inside its route directory and uses relative asset paths, so the pages can be tested locally and served under the repository subpath without a build-time base URL.

The root index is intentionally restrained. It identifies the benchmark as an unofficial model comparison, records model and reasoning metadata, and links to each standalone page. It does not reinterpret or normalize the visual output of any model.

Generated files remain unchanged after generation unless a narrowly scoped repair is required for a broken relative path, missing entry point, or other defect that prevents GitHub Pages from serving the result. Any such repair must be recorded in the final handoff so benchmark provenance remains clear.

## Execution Flow

1. Move the current Gemini/Antigravity root files and assets into `gemini-antigravity/` without changing their content.
2. Restore `coke-zero-54/` and `coke-zero-55/` from the historical comparison commit.
3. Create empty `gpt-56-sol/`, `gpt-56-terra/`, and `gpt-56-luna/` directories.
4. Invoke each model non-interactively with the exact benchmark prompt, its maximum supported reasoning effort, and an isolated writable directory.
5. Create the root comparison index and update repository documentation with all model routes and provenance.
6. Run local structural, browser, and asset checks for every route.
7. Inspect `git status -sb` and the complete relevant diff, commit only intended repository changes, push `main`, and wait for GitHub Pages to report a built deployment.
8. Verify every public URL and send the result table to the configured allowlisted Telegram chat.

## Failure Handling

- If a requested GPT-5.6 model or reasoning effort is rejected, do not substitute another model or lower effort silently. Capture the failure and resolve the exact invocation before continuing.
- If a model leaves its target directory, stop that run and discard only that run's uncommitted output before retrying with tighter isolation.
- If a generated route lacks an `index.html`, has fewer than five sections, or does not place the hero first, ask the same model to correct its own output without adding design direction.
- If local or public assets fail, repair only path or packaging defects. Do not redesign the page during orchestration.
- If GitHub Pages has not updated after the push, inspect the deployment state and retain the previously working public version until the new deployment is confirmed.
- Telegram is sent only after public URL verification succeeds. A Telegram failure does not invalidate the deployment, but it must be reported and retried through the configured wrapper.

## Verification

Local verification will serve the repository over HTTP and check:

- every route returns HTTP 200;
- each new GPT-5.6 page has at least five semantic or identifiable sections with a hero at the top;
- desktop and mobile layouts render without horizontal overflow or blocking overlap;
- primary navigation and interactive controls are usable;
- local assets and required external resources load;
- no uncaught page errors or material console errors occur;
- reduced-motion preferences do not make essential content inaccessible;
- the root index links to all six advertisement routes.

Public verification will repeat route status, page-title, asset, and browser smoke checks against the GitHub Pages origin after the deployment reports `built`.

## Telegram Handoff

The final Telegram message will include:

- the comparison index URL;
- direct URLs for GPT-5.4, GPT-5.5, Gemini/Antigravity, GPT-5.6 Sol, Terra, and Luna;
- the exact model and reasoning effort used for each GPT-5.6 page;
- the recovered canonical prompt;
- deployment and verification status;
- any orchestration-only repairs made after generation.

## Acceptance Criteria

- Three independently generated GPT-5.6 pages are publicly reachable.
- Sol and Terra use `ultra`; Luna uses its highest supported effort, `max`.
- The identical recovered prompt drives all three runs without visual hints.
- GPT-5.4 and GPT-5.5 are restored at their historical paths.
- Gemini/Antigravity remains available at a stable direct path.
- The root comparison index links all six standalone advertisements.
- Desktop, mobile, asset, console, and public-route checks pass.
- The verified URL and model summary is delivered through the Send via Telegram workflow.

## Non-Goals

- Rewriting or visually harmonizing model-generated advertisements.
- Claiming official affiliation with The Coca-Cola Company.
- Adding analytics, tracking, a backend, commerce, authentication, or persistent data.
- Using a worktree or creating a second repository.

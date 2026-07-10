# Coca-Cola Zero AI Landing Page Benchmark

Seven standalone Coca-Cola Zero advertisements are collected under one comparison gallery for side-by-side review.

Live comparison: <https://highsierraloft.github.io/coca-cola-zero-landing-pages/>

## Live pages

| Model / source | Reasoning | Route | Absolute URL |
| --- | --- | --- | --- |
| GPT-5.4 / OpenAI | Extra-high | `/coke-zero-54/` | <https://highsierraloft.github.io/coca-cola-zero-landing-pages/coke-zero-54/> |
| GPT-5.5 / OpenAI | Extra-high | `/coke-zero-55/` | <https://highsierraloft.github.io/coca-cola-zero-landing-pages/coke-zero-55/> |
| Gemini 3.5 Flash / Google Antigravity | High | `/gemini-antigravity/` | <https://highsierraloft.github.io/coca-cola-zero-landing-pages/gemini-antigravity/> |
| GPT-5.6 Sol / OpenAI | Ultra | `/gpt-56-sol/` | <https://highsierraloft.github.io/coca-cola-zero-landing-pages/gpt-56-sol/> |
| GPT-5.6 Terra / OpenAI | Ultra | `/gpt-56-terra/` | <https://highsierraloft.github.io/coca-cola-zero-landing-pages/gpt-56-terra/> |
| GPT-5.6 Luna / OpenAI | Max | `/gpt-56-luna/` | <https://highsierraloft.github.io/coca-cola-zero-landing-pages/gpt-56-luna/> |
| Claude Opus 4.8 / Anthropic | Max | `/claude-opus-4-8/` | <https://highsierraloft.github.io/coca-cola-zero-landing-pages/claude-opus-4-8/> |

## GPT-5.6 benchmark prompt

> No skills are allowed. Create a beautiful landing page for Coca-Cola Zero using only plain AI. It can use custom design libraries. It must have at least five sections, with the hero section on top.

All three GPT-5.6 runs received the same prompt and the same operational wrapper, each in its own isolated folder. Sol and Terra's autonomous helpers remained on the same model and reasoning effort as their respective parent runs; Luna used no autonomous helpers. No run reused a sibling result, and the orchestration layer made no design edits.

## Provenance

- The historical GPT-5.4 and GPT-5.5 pages were restored from commit `21bf9517328d6d30ca62def78a749e2c155323b8`.
- The Gemini 3.5 Flash page was preserved from commit `aa682174c2b1fc8203801f79e569f9b51378278c`.
- GPT-5.6 Sol: initial result `8b54c536`; follow-up fix `52e9a6d`.
- GPT-5.6 Terra: initial result `142efbf`; follow-up fix `fa893a3`.
- GPT-5.6 Luna: initial result `f3bf55e`; follow-up fix `00de094`.
- Claude Opus 4.8: added on branch `feat/add-claude-opis-4.8-page` from the same brief, in its own isolated folder with no reuse of a sibling result.

## Local verification

```bash
bun run test
bun run serve
```

Open <http://127.0.0.1:4173> after starting the preview. The preview server is loopback-only and blocks dotfiles, directory listings, and path traversal.

This is an unofficial AI design benchmark and is not affiliated with or endorsed by The Coca-Cola Company.

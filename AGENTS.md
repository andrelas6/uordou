# Instructions for coding agents

## Git conventions

- **Author:** every commit is authored and committed as `andrelas <andre@bide1.com>`.
  Set it before committing: `git config user.name andrelas && git config user.email andre@bide1.com`.
- **Language:** commit messages, branch names and pull request titles/descriptions are in English.
- **Branch names:** short, lowercase, words separated by hyphens, **no slashes**
  (e.g. `stable-word-order`, `fix-share-text`). Cloudflare uses the branch name in
  preview URLs, where slashes aren't allowed.
- Work on a branch and open a pull request into `main`; never push to `main` directly.

## Project

Daily Brazilian Portuguese word game (Wordle-style), mobile-first. React + Vite + TypeScript;
the only runtime dependencies are `react` and `react-dom`. Plain CSS (`src/style.css`).
Code comments and UI text are in Portuguese.

- `npm run dev` — local server; `npm run build` — static site in `dist/`
- `npm run typecheck` and `npm test` (Node `node:test` + Python `unittest` for `tools/`) must pass before pushing.
- Deploys to Cloudflare Workers (`wrangler.jsonc`) automatically on every push to `main`; live at https://uordou.net.

## Word list rules

- `src/words.ts` is generated — never edit it by hand. Regenerate with `tools/build_words.py`
  (see README).
- `tools/answers.txt` is the answer order (line N = day N, day 1 = 2026-10-18). Today's and past
  days must never change; remove words only from future days and add new words at the end.
  A test fails on pull requests if a played day changed.
- To block a word, add it to `tools/blocklist.txt` and regenerate.
- Guesses are compared without accents (`c` = `ç`, `a` = `ã`…); answers must be unique ignoring accents.

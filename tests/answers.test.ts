import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { ANSWERS } from '../src/words.ts';
import { dayNumber } from '../src/game.ts';

const readList = (text: string) => text.split('\n').filter(Boolean);
const saved = readList(readFileSync(new URL('../tools/answers.txt', import.meta.url), 'utf8'));

test('src/words.ts segue a ordem salva em tools/answers.txt', () => {
  // Falha se alguém editou um dos dois à mão ou esqueceu de rodar o gerador.
  assert.deepEqual(ANSWERS, saved);
});

test('dias já jogados não mudam em relação à main', (t) => {
  // Na CI de pull requests, compara com a lista da branch base.
  const base = process.env.BASE_REF ?? 'origin/main';
  let baseText: string;
  try {
    baseText = execFileSync('git', ['show', `${base}:tools/answers.txt`], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  } catch {
    t.skip(`${base}:tools/answers.txt não existe (primeira versão ou sem git)`);
    return;
  }
  const before = readList(baseText);
  const played = Math.min(dayNumber(), before.length);
  assert.deepEqual(saved.slice(0, played), before.slice(0, played), `as respostas dos dias 1 a ${played} mudaram`);
});

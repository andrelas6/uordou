import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalize, evaluate, dayNumber, msUntilNextDay, shareText, emptyStats, recordResult, currentStreak,
} from '../src/game.js';
import { ANSWERS, VALID } from '../src/words.js';

test('normalize remove acentos e cedilha', () => {
  assert.equal(normalize('ação'), 'acao');
  assert.equal(normalize('Índio'), 'indio');
});

test('evaluate marca letras repetidas corretamente', () => {
  assert.deepEqual(evaluate('carro', 'carro'), Array(5).fill('correct'));
  // Só um "a" na resposta: o segundo "a" da tentativa fica ausente.
  assert.deepEqual(evaluate('arara', 'carro'), ['present', 'present', 'absent', 'correct', 'absent']);
  // "r" certo tem prioridade sobre "r" fora de lugar.
  assert.deepEqual(evaluate('rrrrr', 'carro'), ['absent', 'absent', 'correct', 'correct', 'absent']);
});

test('dia muda à meia-noite de Brasília', () => {
  assert.equal(dayNumber(new Date('2026-10-18T03:00:00Z')), 1);
  assert.equal(dayNumber(new Date('2026-10-19T02:59:59Z')), 1);
  assert.equal(dayNumber(new Date('2026-10-19T03:00:00Z')), 2);
  assert.equal(msUntilNextDay(new Date('2026-10-19T02:59:59Z')), 1000);
});

test('texto de compartilhamento', () => {
  const text = shareText({ day: 7, guesses: ['arara', 'carro'], answer: 'carro', won: true, url: 'https://x.y/' });
  assert.equal(text, 'uordou #7 2/6\n\n🟨🟨🟥🟩🟥\n🟩🟩🟩🟩🟩\n\nhttps://x.y/');
  assert.match(shareText({ day: 1, guesses: Array(6).fill('arara'), answer: 'carro', won: false }), /^uordou #1 X\/6/);
});

test('estatísticas e sequência', () => {
  let s = emptyStats();
  s = recordResult(s, { day: 1, won: true, attempts: 3 });
  s = recordResult(s, { day: 2, won: true, attempts: 4 });
  assert.equal(s.streak, 2);
  assert.equal(currentStreak(s, 3), 2);
  assert.equal(currentStreak(s, 4), 0);
  s = recordResult(s, { day: 3, won: false });
  assert.deepEqual([s.played, s.wins, s.streak, s.maxStreak], [3, 2, 0, 2]);
  assert.deepEqual(s.dist, [0, 0, 1, 1, 0, 0]);
});

test('listas de palavras', () => {
  const valid = new Set(VALID.map(normalize));
  assert.ok(ANSWERS.length > 1000);
  for (const w of ANSWERS) {
    assert.equal([...w].length, 5, w);
    assert.ok(valid.has(normalize(w)), w);
  }
  assert.equal(new Set(ANSWERS).size, ANSWERS.length);
});

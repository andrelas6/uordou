// Lógica pura do jogo (sem DOM), para poder ser testada isoladamente.

export const WORD_LENGTH = 5;
export const MAX_GUESSES = 6;
export const TIME_ZONE = 'America/Sao_Paulo';
// Dia 1 do jogo.
const EPOCH = Date.UTC(2026, 9, 18);
const DAY_MS = 86_400_000;

/** Remove acentos e cedilha: "ação" -> "acao". */
export function normalize(word) {
  return word.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

/** Data (ano, mês, dia) no horário de Brasília. */
function brDate(now) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(now);
  const get = (t) => Number(parts.find((p) => p.type === t).value);
  return [get('year'), get('month'), get('day')];
}

/** Número do jogo de hoje (1, 2, 3...). Muda à meia-noite de Brasília. */
export function dayNumber(now = new Date()) {
  const [y, m, d] = brDate(now);
  return Math.round((Date.UTC(y, m - 1, d) - EPOCH) / DAY_MS) + 1;
}

/** Milissegundos até a próxima palavra. */
export function msUntilNextDay(now = new Date()) {
  const [y, m, d] = brDate(now);
  // Brasília é UTC-3 o ano todo (sem horário de verão desde 2019).
  return Date.UTC(y, m - 1, d + 1, 3) - now.getTime();
}

export function answerForDay(day, answers) {
  const n = answers.length;
  return answers[(((day - 1) % n) + n) % n];
}

/**
 * Compara a tentativa com a resposta (ambas normalizadas).
 * Retorna um array com 'correct' | 'present' | 'absent' por letra,
 * tratando letras repetidas como no Wordle original.
 */
export function evaluate(guess, answer) {
  const result = Array(WORD_LENGTH).fill('absent');
  const remaining = {};
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (guess[i] === answer[i]) result[i] = 'correct';
    else remaining[answer[i]] = (remaining[answer[i]] || 0) + 1;
  }
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (result[i] === 'correct') continue;
    if (remaining[guess[i]] > 0) {
      result[i] = 'present';
      remaining[guess[i]]--;
    }
  }
  return result;
}

const EMOJI = { correct: '🟩', present: '🟨', absent: '🟥' };

/** Texto pronto para colar no WhatsApp. */
export function shareText({ day, guesses, answer, won, url }) {
  const score = won ? guesses.length : 'X';
  const grid = guesses
    .map((g) => evaluate(g, answer).map((s) => EMOJI[s]).join(''))
    .join('\n');
  return `uordou #${day} ${score}/${MAX_GUESSES}\n\n${grid}${url ? `\n\n${url}` : ''}`;
}

export function emptyStats() {
  return { played: 0, wins: 0, streak: 0, maxStreak: 0, lastWonDay: null, dist: Array(MAX_GUESSES).fill(0) };
}

/** Atualiza as estatísticas ao fim de uma partida. */
export function recordResult(stats, { day, won, attempts }) {
  const s = { ...stats, dist: [...stats.dist] };
  s.played++;
  if (won) {
    s.wins++;
    s.dist[attempts - 1]++;
    s.streak = s.lastWonDay === day - 1 ? s.streak + 1 : 1;
    s.lastWonDay = day;
    s.maxStreak = Math.max(s.maxStreak, s.streak);
  } else {
    s.streak = 0;
  }
  return s;
}

/** Sequência atual considerando dias pulados (pular um dia zera a sequência). */
export function currentStreak(stats, today) {
  if (stats.lastWonDay === today || stats.lastWonDay === today - 1) return stats.streak;
  return 0;
}

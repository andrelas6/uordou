import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ANSWERS, VALID } from './words.ts';
import {
  WORD_LENGTH, MAX_GUESSES, normalize, dayNumber, answerForDay,
  evaluate, shareText, emptyStats, recordResult, currentStreak,
} from './game.ts';
import type { GameState, LetterState, Stats } from './game.ts';
import { load, save } from './storage.ts';
import Board from './components/Board.tsx';
import Keyboard from './components/Keyboard.tsx';
import HelpSheet from './components/HelpSheet.tsx';
import StatsSheet from './components/StatsSheet.tsx';

const STATE_KEY = 'uordou:state';
const STATS_KEY = 'uordou:stats';
const RANK: Record<LetterState, number> = { absent: 1, present: 2, correct: 3 };
const REVEAL_MS = WORD_LENGTH * 250 + 300;
const WIN_MESSAGES = ['Genial!', 'Magnífico!', 'Impressionante!', 'Muito bem!', 'Boa!', 'Ufa!'];

// Palavra normalizada -> forma acentuada ("acao" -> "ação").
const dictionary = new Map(VALID.map((w) => [normalize(w), w]));
for (const w of ANSWERS) dictionary.set(normalize(w), w);

const today = dayNumber();
const answer = answerForDay(today, ANSWERS);
const answerKey = normalize(answer);
const display = (guess: string): string => (guess === answerKey ? answer : dictionary.get(guess) ?? guess);

type SheetName = 'help' | 'stats' | null;

interface Toast {
  id: number;
  text: string;
  hide?: boolean;
}

function initialGame(): GameState {
  const saved = load<GameState | null>(STATE_KEY, null);
  return saved?.day === today ? saved : { day: today, guesses: [], status: 'playing' };
}

function useToasts(): [Toast[], (text: string, ms?: number) => void] {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);
  const toast = useCallback((text: string, ms = 1200) => {
    const id = nextId.current++;
    setToasts((t) => [{ id, text }, ...t]);
    setTimeout(() => setToasts((t) => t.map((x) => (x.id === id ? { ...x, hide: true } : x))), ms);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), ms + 300);
  }, []);
  return [toasts, toast];
}

export default function App() {
  const [game, setGame] = useState<GameState>(initialGame);
  const [stats, setStats] = useState<Stats>(() => load(STATS_KEY, emptyStats()));
  const [current, setCurrent] = useState('');
  // Quantas tentativas já tiveram as cores reveladas (teclado só muda depois do giro).
  const [revealed, setRevealed] = useState(game.guesses.length);
  const [shake, setShake] = useState({ n: 0, row: -1 });
  const [winRow, setWinRow] = useState(-1);
  const [sheet, setSheet] = useState<SheetName>(null);
  const [toasts, toast] = useToasts();
  const flipFrom = useRef(game.guesses.length).current;

  const playing = game.status === 'playing';
  const busy = revealed < game.guesses.length;

  useEffect(() => save(STATE_KEY, game), [game]);
  useEffect(() => save(STATS_KEY, stats), [stats]);

  // Primeira visita: mostra as regras. Jogo já terminado: mostra as estatísticas.
  useEffect(() => {
    if (!playing) {
      const id = setTimeout(() => setSheet('stats'), 400);
      return () => clearTimeout(id);
    }
    if (!stats.played && !game.guesses.length) setSheet('help');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = useCallback(() => {
    if (current.length < WORD_LENGTH) return reject('Só palavras com 5 letras');
    if (!dictionary.has(current)) return reject('Palavra não aceita');

    const guesses = [...game.guesses, current];
    const won = current === answerKey;
    const status: GameState['status'] = won ? 'won' : guesses.length === MAX_GUESSES ? 'lost' : 'playing';
    setGame({ ...game, guesses, status });
    setCurrent('');
    if (status !== 'playing') {
      setStats((s) => recordResult(s, { day: today, won, attempts: guesses.length }));
    }

    setTimeout(() => {
      setRevealed(guesses.length);
      if (status === 'won') {
        setWinRow(guesses.length - 1);
        toast(WIN_MESSAGES[guesses.length - 1], 1800);
        setTimeout(() => setSheet('stats'), 2200);
      } else if (status === 'lost') {
        toast(answer.toUpperCase(), 3500);
        setTimeout(() => setSheet('stats'), 2600);
      }
    }, REVEAL_MS);

    function reject(message: string) {
      setShake((x) => ({ n: x.n + 1, row: game.guesses.length }));
      toast(message);
    }
  }, [current, game, toast]);

  const onKey = useCallback((key: string) => {
    if (busy || !playing) return;
    if (key === 'enter') submit();
    else if (key === 'back') setCurrent((c) => c.slice(0, -1));
    else setCurrent((c) => (c.length < WORD_LENGTH ? c + key : c));
  }, [busy, playing, submit]);

  // Teclado físico (desktop).
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || sheet) return;
      if (e.key === 'Enter') onKey('enter');
      else if (e.key === 'Backspace') onKey('back');
      else {
        const k = normalize(e.key);
        if (/^[a-z]$/.test(k)) onKey(k);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onKey, sheet]);

  const keyStates = useMemo(() => {
    const best: Partial<Record<string, LetterState>> = {};
    for (const g of game.guesses.slice(0, revealed)) {
      evaluate(g, answerKey).forEach((s, i) => {
        const prev = best[g[i]];
        if (!prev || RANK[s] > RANK[prev]) best[g[i]] = s;
      });
    }
    return best;
  }, [game.guesses, revealed]);

  const share = shareText({
    day: today,
    guesses: game.guesses,
    answer: answerKey,
    won: game.status === 'won',
    url: location.origin + location.pathname,
  });

  const onShare = async () => {
    // No celular abre a folha de compartilhamento nativa (WhatsApp etc.).
    if (navigator.share && matchMedia('(pointer: coarse)').matches) {
      try {
        await navigator.share({ text: share });
        return;
      } catch (e) {
        if (e instanceof DOMException && e.name === 'AbortError') return;
      }
    }
    try {
      await navigator.clipboard.writeText(share);
      toast('Resultado copiado!');
    } catch {
      location.href = `https://wa.me/?text=${encodeURIComponent(share)}`;
    }
  };

  const closeSheet = useCallback(() => setSheet(null), []);

  return (
    <>
      <header className="topbar">
        <button className="icon-btn" aria-label="Como jogar" onClick={() => setSheet('help')}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="9.5" />
            <path d="M9.5 9.2a2.6 2.6 0 0 1 5 .9c0 1.8-2.5 2.2-2.5 3.9" />
            <circle cx="12" cy="17.2" r=".6" className="fill" />
          </svg>
        </button>
        <h1 className="logo">uordou</h1>
        <button className="icon-btn" aria-label="Estatísticas" onClick={() => setSheet('stats')}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 20V12M12 20V5M19 20v-5" /></svg>
        </button>
      </header>

      <main className="game">
        <Board
          guesses={game.guesses}
          current={current}
          answerKey={answerKey}
          display={display}
          playing={playing}
          flipFrom={flipFrom}
          shake={shake}
          winRow={winRow}
        />
      </main>

      <Keyboard onKey={onKey} keyStates={keyStates} />

      <div className="toast-stack" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast${t.hide ? ' hide' : ''}`}>{t.text}</div>
        ))}
      </div>

      <HelpSheet open={sheet === 'help'} onClose={closeSheet} />
      <StatsSheet
        open={sheet === 'stats'}
        onClose={closeSheet}
        stats={stats}
        streak={currentStreak(stats, today)}
        todayAttempts={game.status === 'won' ? game.guesses.length : 0}
        finished={!playing}
        shareText={share}
        onShare={onShare}
      />
    </>
  );
}

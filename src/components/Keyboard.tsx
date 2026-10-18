import type { LetterState } from '../game.ts';

const LAYOUT = ['qwertyuiop', 'asdfghjkl', ['enter', ...'zxcvbnm', 'back']];

interface KeyboardProps {
  onKey: (key: string) => void;
  keyStates: Partial<Record<string, LetterState>>;
}

export default function Keyboard({ onKey, keyStates }: KeyboardProps) {
  return (
    <div className="keyboard" aria-label="Teclado">
      {LAYOUT.map((line, r) => (
        <div className="krow" key={r}>
          {[...line].map((k) => {
            if (k === 'enter') {
              return <button key={k} data-key={k} className="key wide" onClick={() => onKey(k)}>Enter</button>;
            }
            if (k === 'back') {
              return (
                <button key={k} data-key={k} className="key wide" aria-label="Apagar" onClick={() => onKey(k)}>
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M9 5h11v14H9l-6-7z" />
                    <path d="M12.5 9.5l5 5M17.5 9.5l-5 5" />
                  </svg>
                </button>
              );
            }
            return (
              <button key={k} data-key={k} className={`key ${keyStates[k] ?? ''}`} onClick={() => onKey(k)}>
                {k}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

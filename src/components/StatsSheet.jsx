import { useEffect, useState } from 'react';
import Sheet from './Sheet.jsx';
import { dayNumber, msUntilNextDay } from '../game.js';

function formatCountdown(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}`;
}

function Countdown() {
  const [ms, setMs] = useState(msUntilNextDay);
  useEffect(() => {
    const day = dayNumber();
    const id = setInterval(() => {
      // Virou o dia: recarrega para pegar a palavra nova.
      if (dayNumber() !== day) location.reload();
      setMs(msUntilNextDay());
    }, 1000);
    return () => clearInterval(id);
  }, []);
  return <b>{formatCountdown(ms)}</b>;
}

export default function StatsSheet({ open, onClose, stats, streak, todayAttempts, finished, shareText, onShare }) {
  const pct = stats.played ? Math.round((stats.wins / stats.played) * 100) : 0;
  const max = Math.max(1, ...stats.dist);

  return (
    <Sheet open={open} onClose={onClose} title="Estatísticas">
      <div className="stats-row">
        <div className="stat"><b>{stats.played}</b><span>Jogos</span></div>
        <div className="stat"><b>{stats.wins}/{stats.played}</b><span>Acertos</span></div>
        <div className="stat"><b>{pct}</b><span>% de vitórias</span></div>
        <div className="stat"><b>{streak}</b><span>Sequência atual</span></div>
        <div className="stat"><b>{stats.maxStreak}</b><span>Melhor sequência</span></div>
      </div>

      <h3>Distribuição de tentativas</h3>
      <div className="dist">
        {stats.dist.map((n, i) => (
          <div className="dist-row" key={i}>
            <span>{i + 1}</span>
            <div
              className={`dist-bar${todayAttempts === i + 1 ? ' today' : ''}`}
              style={{ width: `${Math.max(7, (n / max) * 100)}%` }}
            >
              {n}
            </div>
          </div>
        ))}
      </div>

      {finished && (
        <>
          <div className="share-area">
            <div className="next">
              <span>Próxima palavra em</span>
              <Countdown />
            </div>
            <button className="share-btn" onClick={onShare}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="18" cy="5" r="2.5" />
                <circle cx="6" cy="12" r="2.5" />
                <circle cx="18" cy="19" r="2.5" />
                <path d="M8.2 10.8l7.6-4.4M8.2 13.2l7.6 4.4" />
              </svg>
              Compartilhar
            </button>
          </div>
          <pre className="share-preview">{shareText}</pre>
        </>
      )}
    </Sheet>
  );
}

import { WORD_LENGTH, MAX_GUESSES, evaluate } from '../game.js';

function Row({ letters = '', result, current, flip, shake, win }) {
  const chars = [...letters];
  const classes = ['row', shake && 'shake', win && 'win'].filter(Boolean).join(' ');
  return (
    <div className={classes} role="row">
      {Array.from({ length: WORD_LENGTH }, (_, i) => {
        const tile = ['tile'];
        if (result) {
          tile.push(result[i]);
          if (flip) tile.push('flip');
        } else if (chars[i]) {
          tile.push('filled');
        } else if (current && i === chars.length) {
          tile.push('active');
        }
        return (
          <div key={i} className={tile.join(' ')} style={{ '--i': i }} role="gridcell">
            {chars[i] ?? ''}
          </div>
        );
      })}
    </div>
  );
}

/**
 * guesses: tentativas normalizadas; display(guess) devolve a forma acentuada.
 * flipFrom: índice a partir do qual as linhas reveladas animam (as carregadas não).
 */
export default function Board({ guesses, current, answerKey, display, playing, flipFrom, shake, winRow }) {
  return (
    <div className="board" role="grid" aria-label="Tabuleiro">
      {Array.from({ length: MAX_GUESSES }, (_, r) => {
        if (r < guesses.length) {
          return (
            <Row
              key={r}
              letters={display(guesses[r])}
              result={evaluate(guesses[r], answerKey)}
              flip={r >= flipFrom}
              win={r === winRow}
            />
          );
        }
        if (r === guesses.length && playing) {
          // A chave muda a cada erro para reiniciar a animação de tremer.
          const shaking = shake.row === r;
          return <Row key={`cur-${shaking ? shake.n : 0}`} letters={current} current shake={shaking} />;
        }
        return <Row key={r} />;
      })}
    </div>
  );
}

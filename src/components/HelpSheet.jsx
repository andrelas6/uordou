import Sheet from './Sheet.jsx';

function Example({ word, index, state }) {
  return (
    <div className="mini">
      {[...word].map((ch, i) => (
        <span key={i} className={`t ${i === index ? state : ''}`}>{ch}</span>
      ))}
    </div>
  );
}

export default function HelpSheet({ open, onClose }) {
  return (
    <Sheet open={open} onClose={onClose} title="Como jogar">
      <p>Descubra a palavra do dia em <b>6 tentativas</b>. Cada tentativa precisa ser uma palavra válida de 5 letras.</p>
      <p>Depois de cada tentativa, as cores mostram o quanto você chegou perto:</p>
      <div className="example">
        <Example word="turma" index={0} state="correct" />
        <p><b>T</b> está na palavra e na posição certa.</p>
        <Example word="viola" index={2} state="present" />
        <p><b>O</b> está na palavra, mas em outra posição.</p>
        <Example word="pulga" index={3} state="absent" />
        <p><b>G</b> não está na palavra.</p>
      </div>
      <p className="muted">
        Acentos e cedilha são preenchidos automaticamente: digite <b>acao</b> e vira <b>ação</b>.
        Letras podem se repetir. Uma palavra nova aparece todo dia à meia-noite (horário de Brasília).
      </p>
    </Sheet>
  );
}

# uordou

Wordle em português do Brasil, feito para celular. Uma palavra de 5 letras por dia, 6 tentativas.

- **Web app mobile-first** (React + Vite; a única biblioteca de runtime é o React, o resto é JS/CSS puro).
- **Acentos automáticos**: o jogador digita `acao` e o jogo mostra `AÇÃO`.
- **Palavra do dia** muda à meia-noite de Brasília, igual para todo mundo.
- **Estatísticas**: jogos, acertos (x/total), % de vitórias, sequência atual, melhor sequência e distribuição por tentativas.
- **Compartilhar** gera um texto pronto para o WhatsApp (abre a folha de compartilhamento do celular; no computador copia):

```
uordou #12 5/6

🟨🟥🟨🟥🟥
🟥🟨🟨🟨🟥
🟨🟩🟥🟨🟩
🟨🟩🟥🟩🟩
🟩🟩🟩🟩🟩

https://seu-site/
```

## Desenvolvimento

```sh
npm install
npm run dev      # servidor local (acessível pelo celular na mesma rede)
npm test         # testes da lógica do jogo
npm run build    # gera dist/ estático para publicar (GitHub Pages, Netlify, etc.)
```

## Estrutura

- `src/game.js` — lógica pura: avaliação das letras, número do dia, texto de compartilhamento, estatísticas.
- `src/words.js` — listas geradas: `ANSWERS` (respostas diárias, palavras comuns) e `VALID` (todas as tentativas aceitas).
- `src/App.jsx` e `src/components/` — interface em React.
- `src/style.css` — estilos (tema claro/escuro automático).

## Lista de palavras

Gerada a partir do [fserb/pt-br](https://github.com/fserb/pt-br) (licença MIT):

- **Tentativas aceitas** (~9.400): todas as palavras de 5 letras do léxico, das conjugações verbais e as formas frequentes do corpus (plurais etc.).
- **Respostas** (~1.100, cerca de 3 anos): palavras do léxico comuns no uso (filtradas pela frequência), sem estrangeirismos, nomes próprios e palavrões (`tools/blocklist.txt`).

Para regenerar (depois de baixar os arquivos `lexico`, `icf` e `conjugações` — este último salvo como `conjugacoes` — numa pasta):

```sh
python3 tools/build_words.py <pasta> src/words.js 12.9 tools/blocklist.txt
```

O último argumento numérico é o limite de raridade das respostas (maior = mais palavras, mais difíceis).

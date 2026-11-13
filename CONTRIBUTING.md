# Contribuindo

As convenções de git (autor, idioma, nomes de branch) e as regras da lista de palavras
estão em [AGENTS.md](AGENTS.md). Este arquivo resume o caminho de uma mudança até a `main`.

## Fluxo

1. Crie uma branch curta, em minúsculas, sem barras (por exemplo `fix-share-text`).
2. Faça a mudança e rode as verificações abaixo.
3. Abra um pull request para a `main` usando o template. Nunca faça push direto na `main`.
4. O CI precisa passar. Cada push na `main` publica o site em https://uordou.net.

## Verificações locais

São as mesmas que o job `check` do CI roda:

```sh
npm ci
npm run typecheck
npm test
npm run build
```

`npm test` roda os testes em Node e em Python (`tools/`). Nos pull requests, o CI também
confere que nenhum dia já jogado em `tools/answers.txt` mudou em relação à `main`. Para
rodar essa checagem localmente:

```sh
git fetch origin main
BASE_REF=origin/main npm test
```

## Lista de palavras

- Não edite `src/words.ts` à mão: regenere com `tools/build_words.py` (veja o README).
- Para bloquear uma palavra, inclua-a em `tools/blocklist.txt` e regenere.
- Palavras de hoje e de dias anteriores em `tools/answers.txt` nunca mudam.

## Segurança

Além do CI, rodam CodeQL, revisão de dependências nos pull requests e `npm audit` das
dependências de runtime (também semanalmente). O Dependabot abre os PRs de atualização.

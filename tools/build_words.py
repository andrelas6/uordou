"""Gera src/words.ts a partir do fserb/pt-br (MIT).

A ordem das respostas fica salva em tools/answers.txt (uma por linha, a linha N é o
dia N). Ao regenerar, o dia de hoje e os anteriores nunca mudam; palavras removidas
(blocklist etc.) saem só dos dias futuros e palavras novas entram no fim da lista.

Uso:
  python3 tools/build_words.py <pasta com lexico, icf e conjugacoes>
      [--threshold 12.9] [--today AAAA-MM-DD]
"""
import argparse, datetime, json, random, re, sys, unicodedata
from pathlib import Path
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parent.parent
ANSWERS_FILE = ROOT / 'tools' / 'answers.txt'
BLOCKLIST_FILE = ROOT / 'tools' / 'blocklist.txt'
OUT_FILE = ROOT / 'src' / 'words.ts'
# Dia 1 do jogo (igual ao EPOCH de src/game.ts).
EPOCH = datetime.date(2026, 10, 18)
OK = re.compile(r'^[a-záàâãéêíóôõúüç]{5}$')


def norm(w):
    """Remove acentos e cedilha: "ação" -> "acao"."""
    return ''.join(c for c in unicodedata.normalize('NFD', w) if unicodedata.category(c) != 'Mn')


def merge_order(existing, candidates, frozen_days, seed=20261018):
    """Nova ordem das respostas.

    existing: ordem atual (vazia na primeira vez); candidates: respostas válidas hoje,
    no máximo uma grafia por palavra sem acento; frozen_days: quantos dias do início
    não podem mudar (os já jogados, incluindo hoje).
    """
    frozen = existing[:frozen_days]
    taken = {norm(w) for w in frozen}
    by_key = {norm(w): w for w in candidates}
    future = []
    for w in existing[frozen_days:]:
        k = norm(w)
        if k in by_key and k not in taken:
            future.append(by_key[k])
            taken.add(k)
    new = sorted(w for w in candidates if norm(w) not in taken)
    random.Random(seed).shuffle(new)
    return frozen + future + new


def played_days(today):
    """Dias já jogados até hoje (inclusive), contando do dia 1."""
    return max(0, (today - EPOCH).days + 1)


def good(w, blocked):
    if re.search(r'[kwy]', w): return False
    if re.match(r'^s[^aeiouáéíóúâêôãõ]', w): return False
    if re.search(r'[^aeioulrszmáéíóúâêôãõ]$', w): return False
    if re.search(r'(ee|oo|ea|ou?gh|th|sh|ph)', w): return False
    return w not in blocked


def main():
    p = argparse.ArgumentParser()
    p.add_argument('data', help='pasta com os arquivos lexico, icf e conjugacoes do fserb/pt-br')
    p.add_argument('--threshold', type=float, default=12.9,
                   help='raridade máxima (ICF) das respostas; maior = mais palavras, mais difíceis')
    p.add_argument('--today', type=datetime.date.fromisoformat,
                   default=datetime.datetime.now(ZoneInfo('America/Sao_Paulo')).date(),
                   help='data de hoje no horário de Brasília (padrão: agora)')
    args = p.parse_args()
    d = Path(args.data)

    icf = {}
    for line in open(d / 'icf', encoding='utf-8'):
        w, s = line.strip().rsplit(',', 1)
        icf[w] = float(s)
    lex = {w.strip() for w in open(d / 'lexico', encoding='utf-8')}
    conj = {w.strip() for w in open(d / 'conjugacoes', encoding='utf-8')}
    blocked = set(BLOCKLIST_FILE.read_text(encoding='utf-8').split())
    rarity = lambda w: icf.get(w, 99)

    valid = {w for w in lex | conj if OK.match(w)}
    valid |= {w for w, s in icf.items() if OK.match(w) and s <= 14.5}
    # Uma grafia por palavra sem acento: a mais comum ("forca"/"força" -> "força").
    best = {}
    for w in valid:
        n = norm(w)
        if n not in best or rarity(w) < rarity(best[n]): best[n] = w

    common = {}
    for w in lex:
        if OK.match(w) and rarity(w) <= args.threshold and good(w, blocked):
            n = norm(w)
            if n not in common or rarity(w) < rarity(common[n]): common[n] = w

    existing = ANSWERS_FILE.read_text(encoding='utf-8').split() if ANSWERS_FILE.exists() else []
    frozen = played_days(args.today)
    answers = merge_order(existing, common.values(), frozen)

    kept = set(answers)
    removed = [w for w in existing[frozen:] if w not in kept]
    before = {norm(w) for w in existing}
    added = [w for w in answers if norm(w) not in before]
    print(f'{len(valid)} tentativas aceitas, {len(answers)} respostas; '
          f'dias congelados: {min(frozen, len(existing))}; '
          f'removidas: {" ".join(removed) or "-"}; novas: {len(added)}', file=sys.stderr)

    ANSWERS_FILE.write_text('\n'.join(answers) + '\n', encoding='utf-8')
    with open(OUT_FILE, 'w', encoding='utf-8') as f:
        f.write('// Gerado por tools/build_words.py a partir de fserb/pt-br (MIT). Não editar à mão.\n')
        f.write('export const ANSWERS: readonly string[] = ' + json.dumps(answers, ensure_ascii=False) + ';\n')
        f.write('export const VALID: readonly string[] = ' + json.dumps(sorted(best.values()), ensure_ascii=False) + ';\n')


if __name__ == '__main__':
    main()

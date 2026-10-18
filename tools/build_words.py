import sys, re, unicodedata, json, random
d = sys.argv[1]; out = sys.argv[2] if len(sys.argv)>2 else None
OK = re.compile(r'^[a-záàâãéêíóôõúüç]{5}$')
def norm(w):
    return ''.join(c for c in unicodedata.normalize('NFD', w) if unicodedata.category(c)!='Mn')
icf = {}
for line in open(f'{d}/icf', encoding='utf-8'):
    w, s = line.strip().rsplit(',',1); icf[w]=float(s)
lex = {w.strip() for w in open(f'{d}/lexico', encoding='utf-8')}
conj = {w.strip() for w in open(f'{d}/conjugacoes', encoding='utf-8')}
valid = {w for w in lex|conj if OK.match(w)}
valid |= {w for w,s in icf.items() if OK.match(w) and s<=14.5}
TH = float(sys.argv[3]) if len(sys.argv)>3 else 12.5
BAD = set(open(sys.argv[4] if len(sys.argv)>4 else '/dev/null', encoding='utf-8').read().split())
def good(w):
    if re.search(r'[kwy]', w): return False
    if re.match(r'^s[^aeiouáéíóúâêôãõ]', w): return False
    if re.search(r'[^aeioulrszmáéíóúâêôãõ]$', w): return False
    if re.search(r'(ee|oo|ea|ou?gh|th|sh|ph)', w): return False
    return w not in BAD
answers = sorted({w for w in lex if OK.match(w) and icf.get(w,99)<=TH and good(w)})
print(len(valid), len(answers), file=sys.stderr)
# map normalized -> best accented form (lowest icf)
best = {}
for w in valid:
    n = norm(w)
    if n not in best or icf.get(w,99) < icf.get(best[n],99): best[n]=w
if out:
    random.seed(20261018)
    random.shuffle(answers)
    with open(out,'w',encoding='utf-8') as f:
        f.write('// Gerado a partir de fserb/pt-br (MIT). Não editar à mão.\n')
        f.write('export const ANSWERS = ' + json.dumps(answers, ensure_ascii=False) + ';\n')
        f.write('export const VALID = ' + json.dumps(sorted(best.values()), ensure_ascii=False) + ';\n')
else:
    print(' '.join(answers))

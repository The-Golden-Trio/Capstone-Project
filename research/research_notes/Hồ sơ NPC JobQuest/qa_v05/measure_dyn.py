"""Đo máy lời AI-4 trong out_A.json / out_B.json theo luật R2, R4 và các trần của hồ sơ.

python -I measure_dyn.py dyn/out_A.json [dyn/out_B.json]
"""
import json, math, os, re, sys, unicodedata
from collections import defaultdict
sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import engine as E
cast = E.load_cast(os.path.join(HERE, '..', 'cast_a.yaml'), os.path.join(HERE, '..', 'cast_b.yaml'))
SC = json.load(open(os.path.join(HERE, 'dyn', os.environ.get('SCENES', 'scenes.json')), encoding='utf-8'))
EXPR = {'binh_thuong', 'vui', 'cuoi_lon', 'ngac_nhien', 'suy_nghi', 'lo_lang', 'kho_chiu', 'buon'}
nfc = lambda s: unicodedata.normalize('NFC', s)
PACKET = {}
SEP = chr(10) + '---' + chr(10)
LAST = nfc(open(os.path.join(HERE, 'dyn', os.environ.get('LAST', 'last_A.md')), encoding='utf-8').read())
sys.path.insert(0, os.path.join(HERE, '..', 'qa_v03'))
import lint_profile as LP
DOI_TU_KEYS = ('vai_trong_doi', 'que', 'doi_song', 'noi_gap', 'dong_luc', 'cau_chuyen', 'tuyen_truyen', 'cau_mau', 'thoi_quen', 'do_rieng', 'luu_y')


def story_grams(p):
    out = set()
    def walk(x):
        if isinstance(x, dict): [walk(v) for k, v in x.items() if k not in ('id', 'mo_o', 'len_muc', 'quan_he', 'bieu_cam', 'tu_muc')]
        elif isinstance(x, list): [walk(v) for v in x]
        elif isinstance(x, str): out.update(LP.ngrams(x, 3))
    walk({k: v for k, v in p['doi_tu'].items() if k in DOI_TU_KEYS})
    return out - set().union(*[LP.ngrams(t, 3) for t in [json.dumps(p['nguoi'], ensure_ascii=False)]])


def block(S, sc):
    if S not in PACKET: PACKET[S] = nfc(open(os.path.join(HERE, 'dyn', 'packet_%s.md' % S), encoding='utf-8').read())
    t = PACKET[S]; i = t.find('## Cảnh %s ' % sc.split('-')[0])
    if i < 0: return LAST
    j = t.find(SEP, i)
    return t[i:j if j > 0 else None] + LAST


def has(text, w):
    t = ' ' + re.sub(r'[^\w\s]', ' ', nfc(text).lower()) + ' '
    return (' %s ' % nfc(w).lower()) in t


def card_of(rec):
    sc = rec['scene']
    if sc in SC['WORK']:
        return {s['id']: s['card'] for s in SC['WORK'][sc]['slots']}
    if sc in SC['SIDE']: return {SC['SIDE'][sc]['card']: SC['SIDE'][sc]['card']}
    c = sc.split('-', 1)[1]; return {c: c}


def run(path):
    S = os.path.basename(path)[4:-5]
    recs = json.load(open(path, encoding='utf-8'))
    res = []; F = lambda ok, name, why='': res.append((ok, name, why))
    conv = defaultdict(list)
    for r in recs:
        o = r['output'] if isinstance(r['output'], dict) else json.loads(r['output'])
        m = card_of(r); beats = o.get('beats', [])
        F(isinstance(beats, list) and 1 <= len(beats) <= 5, 'R4 số nhịp', '%s/%s: %d' % (r['scene'], r['turn'], len(beats)))
        qs = [i for i, b in enumerate(beats) if '?' in b.get('text', '')]
        ok2 = sum(b.get('text', '').count('?') for b in beats) <= 1 and (not qs or qs[0] == len(beats) - 1) and all(beats[i]['speaker'] != 'canh' for i in qs)
        F(ok2, 'R2 câu hỏi', '%s/%s: nhịp hỏi %s / %d' % (r['scene'], r['turn'], qs, len(beats)))
        qb = o.get('question_by')
        F((qb is None) == (not qs) and (qb is None or qb == beats[-1]['speaker']), 'R2 question_by khớp', '%s/%s: %s, hỏi ở %s' % (r['scene'], r['turn'], qb, qs))
        for b in beats:
            sp, tx, ex = b.get('speaker'), b.get('text', ''), b.get('expression')
            F(len(tx) <= 120, 'R4 ≤120 ký tự', '%s/%s: %d' % (r['scene'], r['turn'], len(tx)))
            F(not re.search(r'[{}]', tx), 'không lọt biến {…}', '%s/%s: %s' % (r['scene'], r['turn'], tx[:40]))
            if sp == 'canh':
                F(ex is None, 'canh không có mặt', '%s/%s' % (r['scene'], r['turn'])); continue
            F(sp in m, 'speaker hợp lệ', '%s/%s: %s' % (r['scene'], r['turn'], sp))
            F(ex in EXPR, 'expression hợp lệ', '%s/%s: %s' % (r['scene'], r['turn'], ex))
            digs = re.findall(r'\d+', tx)
            ok = all(re.search(r'(?<!\d)%s(?!\d)' % d, nfc(r.get('player', '')) + block(S, r['scene'])) for d in digs)
            F(ok, 'không chữ số lạ', '%s/%s: %s' % (r['scene'], r['turn'], digs))
            if sp in m and r['scene'] in SC['WORK']:
                hit = LP.ngrams(tx, 3) & story_grams(cast[m[sp]])
                F(not hit, 'màn làm việc không chạm đời tư', '%s/%s %s: %s' % (r['scene'], r['turn'], sp, [' '.join(h) for h in sorted(hit)][:3]))
            if sp in m: conv[(r['scene'], m[sp])].append((r, b))
    stat = []
    for (sc, cid), items in sorted(conv.items()):
        p = cast[cid]; g = p['nguoi']['giong']; n = len(items); txt = [b['text'] for _, b in items]
        for tt in g['tro_tu']:
            k = sum(has(t, tt) for t in txt)
            F(k <= max(1, math.ceil(n / 4)), 'trợ từ ≤25% (làm tròn lên)', '%s %s "%s": %d/%d' % (sc, cid, tt, k, n))
        ban = [x.strip() for it in g['khong_bao_gio'] for mm in [re.match(r'trợ từ (.+)', nfc(it))] if mm for x in mm.group(1).split(',')]
        for bw in ban:
            k = sum(has(t, bw) for t in txt)
            F(k == 0, 'không trợ từ cấm', '%s %s "%s": %d' % (sc, cid, bw, k))
        ex = [b['expression'] for _, b in items]
        hi = sum(e in p['nguoi']['bieu_cam']['hiem_dung'] for e in ex)
        F(hi / n <= 0.10 or hi <= 1, 'mặt hiếm ≤10%', '%s %s: %d/%d' % (sc, cid, hi, n))
        if n >= 6: F(len(set(ex)) >= 3, '≥3 mặt khi ≥6 nhịp', '%s %s: %s' % (sc, cid, sorted(set(ex))))
        cr = sum(any(nfc(c).lower().rstrip('.?!') in nfc(t).lower() for c in g['cau_cua_rieng']) for t in txt)
        F(cr <= 1, 'câu của riêng ≤1', '%s %s: %d' % (sc, cid, cr))
        stat.append('%s %-20s nhịp %2d  mặt %s' % (sc, cid, n, dict(sorted({e: ex.count(e) for e in set(ex)}.items()))))
    return res, stat, recs


def report(path):
    res, stat, recs = run(path)
    by = defaultdict(lambda: [0, 0, []])
    for ok, name, why in res:
        by[name][0 if ok else 1] += 1
        if not ok: by[name][2].append(why)
    print('\n# %s — %d bản ghi, %d kiểm' % (os.path.basename(path), len(recs), len(res)))
    for name, (p, f, w) in by.items():
        print('%-4s %-24s %3d đạt, %d trượt %s' % ('PASS' if not f else 'FAIL', name, p, f, ('· ' + ' | '.join(w[:6])) if w else ''))
    print('\n'.join(stat))
    return recs


A = report(sys.argv[1])
if len(sys.argv) > 2:
    B = report(sys.argv[2])
    print('\n# Xưng hô A↔B (đếm từ gọi người chơi trong lời NPC)')
    SA, SB = (os.path.basename(x)[4:-5] for x in sys.argv[1:3])
    for sc in sorted({r['scene'] for r in A} & {r['scene'] for r in B}):
        for S, recs in ((SA, A), (SB, B)):
            S = S[-1]
            lc = SC['WORK'][sc]['lua_chon'][S] if sc in SC['WORK'] else SC['SIDE'][sc]['lua_chon'][S]
            cnt = defaultdict(lambda: defaultdict(int))
            for r in recs:
                if r['scene'] != sc: continue
                o = r['output'] if isinstance(r['output'], dict) else json.loads(r['output'])
                for b in o['beats']:
                    if b['speaker'] == 'canh': continue
                    for w in ('anh', 'chị', 'con', 'em', 'bạn', 'anh hai', 'chị hai'):
                        if has(b['text'], w): cnt[b['speaker']][w] += 1
            print('%s bộ %s (chọn %s): %s' % (sc, S, lc, {k: dict(v) for k, v in cnt.items()}))

"""Lint tĩnh cho cả cast 22 lá (schema v1.0: hai khối nguoi / doi_tu).

Dùng: python -I lint_cast.py <cast_a.yaml> <cast_b.yaml> <Kinh tế và sức khoẻ JobQuest.md>
Mã thoát 1 nếu có bài FAIL. WARN không làm trượt.
"""
import itertools, math, os, re, sys, unicodedata, collections as C
import yaml
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'qa_v03'))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import lint_profile as LP  # noqa: E402
import engine as E  # noqa: E402

sys.stdout.reconfigure(encoding='utf-8')
nfc = lambda s: unicodedata.normalize('NFC', str(s))
ROMAN = ['0', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV',
         'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI']
NAMES = {'anh': 'Sang Ngọc Đạt Phát Lộc Luân Hải Hiếu Duy Bảo Minh Tấn Mạnh'.split(),
         'chi': 'Thương Tiên Thảo Mai Phương Hồng My Lam Hân'.split()}
SAN = {'0', 'II', 'III', 'IV', 'VI', 'XIX'}; COT_MOC = {'X', 'XIII', 'XXI'}
LEVEL = {'rất thấp': 1, 'khá thấp': 2, 'hơi thấp': 3, 'trung bình': 4, 'hơi cao': 5, 'khá cao': 6, 'rất cao': 7}
B5 = ['huong_ngoai', 'de_chiu', 'tan_tam', 'on_dinh_cam_xuc', 'coi_mo']
RELS = ['cap_tren', 'ngang_hang', 'cap_duoi', 'phong_ban_khac', 'khach_hang']
PLAYER_AGE = 22


class Rep(LP.Report):
    def __init__(self):
        super().__init__(); self.warns = 0

    def warn(self, name, check, details):
        if details:
            self.warns += 1
            print('[WARN] %s | %s' % (name, check))
            for d in details: print('       - ' + d)
        else:
            print('[PASS] %s | %s' % (name, check))


def lines_of(p):
    out = [('cau_mau[%s]' % c['quan_he'], c['text']) for c in p['giong']['cau_mau']]
    out += [('qua.%s' % k, v['text']) for k, v in p['qua']['phan_ung'].items()]
    return out


def particle_hits(text, part):
    t = ' ' + re.sub(r'[^\w\s{}]', ' ', nfc(text).lower()) + ' '
    return (' %s ' % nfc(part).lower()) in t


def banned_particles(p):
    out = []
    for item in p['giong'].get('khong_bao_gio', []):
        m = re.match(r'trợ từ (.+)', nfc(item))
        if m: out += [x.strip() for x in m.group(1).split(',')]
    return out


def lab(hexc):
    r, g, b = [int(hexc[i:i + 2], 16) / 255 for i in (1, 3, 5)]
    f = lambda c: ((c + .055) / 1.055) ** 2.4 if c > .04045 else c / 12.92
    r, g, b = f(r), f(g), f(b)
    x = (r * .4124 + g * .3576 + b * .1805) / .95047
    y = (r * .2126 + g * .7152 + b * .0722)
    z = (r * .0193 + g * .1192 + b * .9505) / 1.08883
    h = lambda t: t ** (1 / 3) if t > .008856 else 7.787 * t + 16 / 116
    return (116 * h(y) - 16, 500 * (h(x) - h(y)), 200 * (h(y) - h(z)))


def khoi4_table(path):
    rows = {}
    for l in open(path, encoding='utf-8'):
        m = re.match(r'^\| (0|[IVX]+) [^|]+\|[^|]+\|([^|]+)\|([^|]+)\|\s*$', l)
        if m: rows[m.group(1)] = (m.group(2).strip(), m.group(3).strip())
    return rows


def toks(s):
    s = re.sub(r'\*\*|"|“|”', '', nfc(s).lower())
    return [t for t in re.split(r'[^\w%+−-]+', s) if t]


def main(a, b, report):
    raw = yaml.safe_load(open(a, encoding='utf-8')) + yaml.safe_load(open(b, encoding='utf-8'))
    RAW = {q['id']: q for q in raw}
    cast = [E.phang(q) for q in raw]
    rep = Rep()
    print('== Phần 1: các bài từng hồ sơ (bộ lint v0.4, cổng mức thân lấy cao_trao của từng chương) ==')
    for p in cast:
        q = dict(p); q['cau_chuyen'] = dict(p['cau_chuyen'])
        mo = dict(q['cau_chuyen'].get('mo_theo_muc_than') or {})
        for ch, lvl in zip(p['tuyen_truyen'], ['than', 'gan_bo', 'tri_ky']): mo[lvl] = ch['cao_trao']
        q['cau_chuyen']['mo_theo_muc_than'] = mo
        # Bộ v0.4 so tom_tat của mọi chương với mọi mức; ở đây kiểm theo đúng thứ tự nạp (bài 2b), nên bỏ tom_tat khỏi bộ cũ
        q['tuyen_truyen'] = [dict(ch, tom_tat='') for ch in p['tuyen_truyen']]
        LP.check_profile(p['id'], q, yaml.safe_dump(p, allow_unicode=True).split('\n'), rep)
        d = []
        lv = ['than', 'gan_bo', 'tri_ky']
        chk = [('cau_chuyen.tom_tat (nạp từ mức gặp)', p['cau_chuyen']['tom_tat'], 0)]
        chk += [('tuyen_truyen[%d].tom_tat' % (k + 1), ch['tom_tat'], k) for k, ch in enumerate(p['tuyen_truyen'])]
        for fld, txt, k in chk:
            for j in range(k, 3):
                hit = LP.ngrams(mo[lv[j]], 3) & LP.ngrams(txt, 3)
                if hit: d.append('%s "%s" trùng %s với cao_trao chương %d' % (fld, txt, [' '.join(h) for h in sorted(hit)], j + 1))
        rep.emit(p['id'], '2b cổng mức thân theo thứ tự nạp: chuyện đời và tóm tắt chương k không chứa cao trào chương k trở đi', d)
    print('\n== Phần 2: các bài toàn cast ==')
    by = {p['la_bai']['so']: p for p in cast}
    rep.emit('CAST', 'C1 đủ 22 lá, mỗi số một lá', [] if sorted(by, key=ROMAN.index) == ROMAN and len(cast) == 22
             else ['các lá có: %s' % [p['la_bai']['so'] for p in cast]])
    d = []
    for k, want in NAMES.items():
        have = sorted(p['danh_tinh']['ten_goi'] for p in cast if p['danh_tinh']['gioi'] == ('nam' if k == 'anh' else 'nu'))
        if sorted(want) != have: d.append('%s: cần %s, có %s' % (k, sorted(want), have))
    rep.emit('CAST', 'C2 đủ 22 tên đã chốt, đúng nhãn anh/chị, không trùng', d)
    bd = C.Counter(p['danh_tinh']['sinh_nhat'] for p in cast)
    d = ['%s trùng %d lá' % (k, v) for k, v in bd.items() if v > 1]
    for p in cast:
        dd, mm = map(int, p['danh_tinh']['sinh_nhat'].split('/'))
        if not (1 <= mm <= 12 and 1 <= dd <= [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][mm - 1]): d.append('%s ngày sai' % p['id'])
    rep.emit('CAST', 'C3 sinh nhật hợp lệ và không trùng', d)
    d = []
    for so, p in by.items():
        want = 'san' if so in SAN else 'cot_moc' if so in COT_MOC else 'danh_thiep_nguoi_moi'
        if p['la_bai']['mo_khoa'] != want: d.append('%s: %s, cần %s' % (so, p['la_bai']['mo_khoa'], want))
        if want == 'cot_moc' and not p['la_bai'].get('dieu_kien_cot_moc'): d.append('%s thiếu dieu_kien_cot_moc' % so)
    rep.emit('CAST', 'C4 cách mở lá khớp khối 4 (6 sẵn, 3 cột mốc, 13 danh thiếp/người mới)', d)
    t4 = khoi4_table(report); d = []
    for so, p in by.items():
        if so not in t4: d.append('%s không có trong bảng khối 4' % so); continue
        mine = set(toks(' '.join(n['mo_ta'] for n in p['than']['nang_luc'])))
        want = [t for t in toks(t4[so][1]) if len(t) > 1 or t.isdigit()]
        miss = [t for t in want if t not in mine]
        if len(miss) > max(1, len(want) // 8) or any(re.search(r'\d', t) for t in miss): d.append('%s thiếu chữ %s so với "%s"' % (so, miss, t4[so][1]))
        if so in COT_MOC:
            dk = set(toks(p['la_bai'].get('dieu_kien_cot_moc', '')))
            miss = [t for t in toks(t4[so][0].split(':', 1)[-1]) if t not in dk]
            if miss: d.append('%s điều kiện cột mốc thiếu %s' % (so, miss))
    rep.emit('CAST', 'C5 năng lực và điều kiện cột mốc chép đúng chữ của khối 4', d)

    vec = {p['id']: [LEVEL[p['tinh_cach']['big5'][k]] for k in B5] for p in cast}
    pairs = sorted((math.dist(vec[x], vec[y]), x, y) for x, y in itertools.combinations(vec, 2))
    rep.emit('CAST', 'C6a không có hai lá trùng hệt Big Five', ['%s = %s' % (x, y) for dd, x, y in pairs if dd == 0])
    rep.warn('CAST', 'C6b khoảng cách Big Five giữa hai lá ≥ 2 (thang 1–7); 5 cặp gần nhất: '
             + '; '.join('%s–%s %.2f' % (x.split('_')[0], y.split('_')[0], dd) for dd, x, y in pairs[:5]),
             ['%s–%s %.2f' % (x, y, dd) for dd, x, y in pairs if 0 < dd < 2])
    tro = {p['id']: set(map(nfc, p['giong']['tro_tu'])) for p in cast}
    jac = sorted(((len(tro[x] & tro[y]) / len(tro[x] | tro[y])), x, y) for x, y in itertools.combinations(tro, 2))[::-1]
    rep.emit('CAST', 'C7a bộ trợ từ giữa hai lá trùng < 50% (Jaccard)',
             ['%s–%s %.2f %s' % (x, y, j, sorted(tro[x] & tro[y])) for j, x, y in jac if j >= .5])
    cr = C.Counter(nfc(s).lower() for p in cast for s in p['giong']['cau_cua_rieng'])
    rep.emit('CAST', 'C7b câu của riêng không trùng giữa các lá', [k for k, v in cr.items() if v > 1])
    d = []
    for p in cast:
        ban = banned_particles(p)
        for part in ban:
            if part in tro[p['id']]: d.append('%s: trợ từ "%s" vừa dùng vừa cấm' % (p['id'], part))
            for w, t in lines_of(p) + [('cau_cua_rieng', s) for s in p['giong']['cau_cua_rieng']]:
                if particle_hits(t, part): d.append('%s %s dùng trợ từ cấm "%s": "%s"' % (p['id'], w, part, t))
    rep.emit('CAST', 'C7c câu mẫu và phản ứng quà không dùng trợ từ mà hồ sơ cấm', d)
    d = []; w2 = []
    for p in cast:
        L = lines_of(p)
        for part in p['giong']['tro_tu']:
            share = sum(particle_hits(t, part) for _, t in L) / len(L)
            if share > .5: d.append('%s: "%s" ở %.0f%% câu' % (p['id'], part, 100 * share))
            elif share > 1 / 3: w2.append('%s: "%s" ở %.0f%% câu' % (p['id'], part, 100 * share))
        if not any(particle_hits(t, part) for _, t in L for part in p['giong']['tro_tu']):
            w2.append('%s: câu mẫu không dùng trợ từ nào của chính mình' % p['id'])
    rep.emit('CAST', 'C7d không trợ từ nào ở quá 50% câu mẫu của một người', d)
    rep.warn('CAST', 'C7e trợ từ nào ở quá 1/3 câu mẫu thì dễ thành tật nói', w2)
    cols = {p['id']: lab(p['ngoai_hinh']['mau_chu_dao']) for p in cast}
    ce = sorted((math.dist(cols[x], cols[y]), x, y) for x, y in itertools.combinations(cols, 2))
    rep.emit('CAST', 'C8a màu chủ đạo khác nhau rõ (ΔE76 ≥ 10)', ['%s–%s ΔE %.1f' % (x, y, e) for e, x, y in ce if e < 10])
    rep.warn('CAST', 'C8b ΔE76 ≥ 20; cặp gần nhất %s–%s %.1f' % (ce[0][1], ce[0][2], ce[0][0]),
             ['%s–%s ΔE %.1f' % (x, y, e) for e, x, y in ce if 10 <= e < 20])
    cov = {r: [p['danh_tinh']['ten_goi'] for p in cast if r in p['vao_vai']['vai_hop_le']] for r in RELS}
    rep.emit('CAST', 'C9 mỗi quan hệ slot có ít nhất 5 lá đóng được: '
             + ', '.join('%s %d' % (r, len(v)) for r, v in cov.items()), ['%s chỉ %d lá' % (r, len(v)) for r, v in cov.items() if len(v) < 5])
    d = []
    for p in cast:
        age = p['danh_tinh']['tuoi']; v = p['vao_vai']['vai_hop_le']
        if 'cap_tren' in v and age < 25: d.append('%s %d tuổi làm cấp trên' % (p['id'], age))
        if 'cap_duoi' in v and age > 40: d.append('%s %d tuổi làm cấp dưới' % (p['id'], age))
        if age < 18 and set(v) - {'khach_hang'}: d.append('%s %d tuổi có vai nhân viên %s' % (p['id'], age, v))
    rep.emit('CAST', 'C10 tuổi hợp vai (cấp trên ≥ 25, cấp dưới ≤ 40, dưới 18 chỉ làm khách)', d)
    d = []
    for p in cast:
        xh = p['xung_ho']; younger = p['danh_tinh']['tuoi'] < PLAYER_AGE
        txt = yaml.safe_dump(p, allow_unicode=True)
        if younger and 'goi_theo_lua_chon' not in xh: d.append('%s nhỏ tuổi hơn người chơi mà không gọi theo lựa chọn anh/chị' % p['id'])
        if younger:
            for w, t in lines_of(p):
                if re.search(r'\b(anh|chị)\b', nfc(t).lower()): d.append('%s %s viết cứng anh/chị: "%s"' % (p['id'], w, t))
        for bad in ('khong_noi', 'gioi_nguoi_choi'):
            if bad in txt: d.append('%s còn trường %s' % (p['id'], bad))
        for ph in re.findall(r'\{(\w+)\}', txt):
            if ph not in ('ten', 'goi', 'xung'): d.append('%s có chỗ giữ lạ {%s}' % (p['id'], ph))
        for k in ('goi_theo_lua_chon',):
            for node in [xh] + [v for v in xh.values() if isinstance(v, dict)]:
                if k in node and set(node[k]) != {'anh', 'chi'}: d.append('%s %s phải có đúng hai khoá anh, chi' % (p['id'], k))
    rep.emit('CAST', 'C11 xưng hô theo lựa chọn anh/chị: NPC nhỏ tuổi gọi theo lựa chọn, không viết cứng anh/chị; chỗ giữ chỉ có {ten}, {goi}, {xung}', d)
    d = []
    for p in cast:
        hay, hiem = set(p['bieu_cam']['hay_dung']), set(p['bieu_cam']['hiem_dung'])
        if hay & hiem: d.append('%s hay_dung và hiem_dung trùng %s' % (p['id'], hay & hiem))
        n = sum(c['bieu_cam'] in hiem for c in p['giong']['cau_mau'])
        if n > 1: d.append('%s có %d câu mẫu dùng mặt hiếm' % (p['id'], n))
        if set(p['qua']['thich']) & set(p['qua']['ghet']): d.append('%s quà vừa thích vừa ghét' % p['id'])
    rep.emit('CAST', 'C12 biểu cảm: hay và hiếm không trùng; câu mẫu dùng mặt hiếm tối đa một câu; quà thích/ghét tách nhau', d)
    ids = C.Counter(ch['id'] for p in cast for ch in p['tuyen_truyen'])
    d = ['id chương trùng: %s' % k for k, v in ids.items() if v > 1]
    d += ['%s: id chương %s không bắt đầu bằng số lá' % (p['id'], ch['id']) for p in cast for ch in p['tuyen_truyen']
          if not ch['id'].startswith(p['la_bai']['so'] + '_')]
    rep.emit('CAST', 'C13 id chương tuyến truyện duy nhất và mang số lá', d)
    d = []
    for p in cast:
        for w, t in lines_of(p):
            if len(t.split()) > 25: d.append('%s %s dài %d tiếng' % (p['id'], w, len(t.split())))
    rep.emit('CAST', 'C14 câu mẫu và phản ứng quà ≤ 25 tiếng', d)

    PRON = {'tui', 'tớ', 'em', 'anh', 'chị', 'cô', 'chú', 'thầy', 'bạn', 'ông', 'bà'}
    d = []
    for p in cast:
        own = {'mình', p['danh_tinh']['ten_goi'].lower()}
        for c in p['giong']['cau_mau'] + [dict(quan_he='ngoai_gio', text=v['text']) for v in p['qua']['phan_ung'].values()]:
            rel = c['quan_he']
            for r in (p['vao_vai']['vai_hop_le'] if rel == 'bat_ky' else [rel]):
                canh = 'nhiem_vu_phu' if r == 'ngoai_gio' else 'man_lam_viec'
                ok = set(own)
                for lc in ('anh', 'chi'):
                    ok |= set(' '.join(E.xung_ho(RAW[p['id']], r, lc, 'gap', None, canh)).lower().split())
                words = re.findall(r'\w+', nfc(c['text']).lower())
                for i, w in enumerate(words):
                    nxt = words[i + 1] if i + 1 < len(words) else ''
                    if w not in PRON or w in ok: continue
                    if (w, nxt) in {('anh', 'chị'), ('bạn', 'bè'), ('bà', 'con')} or (w == 'em' and nxt in ('gái', 'trai')): continue
                    if w in ('ông', 'bà', 'chú', 'cô') and (nxt in ('thợ', 'khách', 'chú', 'già', 'cụ') or (i and words[i - 1] == 'ông')): continue
                    d.append('%s [%s→%s] dùng "%s", engine tính %s: "%s"' % (p['id'], rel, r, w, sorted(ok - own), c['text']))
    rep.warn('CAST', 'C15 đại từ trong câu mẫu khớp xưng hô engine tính (soát tay: có thể là người thứ ba)', d)
    d = []; mx = (0, ''); mxs = (0, '')
    for p in cast:
        for r in p['vao_vai']['vai_hop_le']:
            for lc in ('anh', 'chi'):
                _, n, _ = E.card(RAW[p['id']], lc, 'man_lam_viec', slot={'id': 'truong_nhom', 'vai': 'trưởng nhóm, kèm người chơi từ lúc mới vào', 'relation': r})
                if n > 250: d.append('%s %s %s: phần người %d tiếng' % (p['id'], r, lc, n))
                mx = max(mx, (n, '%s %s' % (p['id'], r)))
        for muc in E.LEVELS:
            _, n, m0 = E.card(RAW[p['id']], 'chi', 'nhiem_vu_phu', muc=muc, ten='Linh')
            _, _, m = E.card(RAW[p['id']], 'chi', 'nhiem_vu_phu', muc=muc, ten='Linh', ky_uc=['một hai ba bốn năm sáu bảy tám chín mười một hai ba bốn năm'] * 3, luot_cuoi=True)
            if n > 250 or m0 > 200 or m > 260: d.append('%s %s: người %d, tình huống gốc %d, đủ %d tiếng' % (p['id'], muc, n, m0, m))
            mxs = max(mxs, (m, '%s %s' % (p['id'], muc)))
    rep.emit('CAST', 'C16 mọi thẻ dựng ra: phần người ≤ 250 tiếng (dài nhất %d, %s); nhiệm vụ phụ: khối đời tư gốc ≤ 200, đủ cả 3 dòng ký ức 15 tiếng và dòng cao trào ≤ 260 (dài nhất %d, %s)'
             % (mx[0], mx[1], mxs[0], mxs[1]), d)
    d = []
    SWAP = {'anh': 'X', 'chị': 'X', 'Anh': 'X', 'Chị': 'X', 'ông': 'Y', 'bà': 'Y'}
    for p in cast:
        cases = [('man_lam_viec', r, 'gap') for r in p['vao_vai']['vai_hop_le']] + [('nhiem_vu_phu', None, m) for m in E.LEVELS]
        for canh, r, muc in cases:
            slot = {'id': 'slot', 'vai': 'vai thử', 'relation': r} if r else None
            a = E.card(RAW[p['id']], 'anh', canh, slot=slot, muc=muc, ten='Linh')[0].split()
            b = E.card(RAW[p['id']], 'chi', canh, slot=slot, muc=muc, ten='Linh')[0].split()
            bad = [(x, y) for x, y in zip(a, b) if x != y and SWAP.get(x.strip('".,:·'), x) != SWAP.get(y.strip('".,:·'), y)]
            if len(a) != len(b) or bad: d.append('%s %s %s: khác ngoài xưng hô %s' % (p['id'], canh, r or muc, bad[:3]))
    rep.emit('CAST', 'C17 thẻ khi người chơi chọn anh và khi chọn chị chỉ khác đúng chữ xưng hô', d)

    print('\n== Phần 2b: tách khối nguoi / doi_tu (v0.6) ==')
    TOP = ['id', 'phien_ban', 'la_bai', 'danh_tinh', 'ngoai_hinh', 'than', 'nguoi', 'doi_tu']
    d = ['%s: khoá %s' % (q['id'], list(q)) for q in raw if list(q) != TOP]
    d += ['%s: danh_tinh có %s' % (q['id'], sorted(q['danh_tinh'])) for q in raw
          if set(q['danh_tinh']) != {'ten_goi', 'ho_ten', 'tuoi', 'gioi', 'sinh_nhat'}]
    rep.emit('CAST', 'T1 mỗi hồ sơ đúng các khối; danh_tinh chỉ còn tên, tuổi, giới, sinh nhật', d)
    d = []
    for q in raw:
        bo = {k: v for k, v in q.items() if k != 'doi_tu'}
        for r in q['nguoi']['vao_vai']['vai_hop_le']:
            for lc in ('anh', 'chi'):
                sl = {'id': 'slot', 'vai': 'vai thử', 'relation': r}
                try: same = E.card(q, lc, 'man_lam_viec', slot=sl)[0] == E.card(bo, lc, 'man_lam_viec', slot=sl)[0]
                except KeyError as e: same = False
                if not same: d.append('%s %s %s: thẻ đổi khi bỏ doi_tu' % (q['id'], r, lc))
    rep.emit('CAST', 'T2 thẻ màn làm việc giống hệt khi xoá doi_tu khỏi hồ sơ (engine không đọc đời tư)', d)

    def texts(node):
        if isinstance(node, dict):
            for k, v in node.items():
                if not (isinstance(v, str) and k in ('id', 'muc', 'mo_o', 'len_muc', 'quan_he', 'bieu_cam', 'tu_muc', 'voi', 'vung')): yield from texts(v)
        elif isinstance(node, list):
            for v in node: yield from texts(v)
        elif isinstance(node, str): yield node
    d = []
    for q in raw:
        ng_n = set().union(*[LP.ngrams(t, 3) for t in texts(q['nguoi'])])
        for t in texts({k: v for k, v in q['doi_tu'].items() if k != 'qua'}):
            hit = LP.ngrams(t, 3) & ng_n
            if hit: d.append('%s: "%s" chung %s với khối nguoi' % (q['id'], t[:50], [' '.join(h) for h in sorted(hit)][:3]))
    rep.emit('CAST', 'T3 khối nguoi không chung cụm 3 từ nào với khối doi_tu', d)
    KHOA = ['gia đình', 'bố', 'mẹ', 'ba mẹ', 'con trai', 'con gái', 'vợ', 'chồng', 'nhẫn cưới', 'người nhà', 'bệnh nhân', 'người bệnh',
            'quê', 'hồi nhỏ', 'nợ', 'bài tarot', 'bộ bài', 'kính lúp', 'mùn cưa', 'tạp dề', 'máy ảnh', 'mối hàn', 'tuyển người',
            'doanh số', 'sổ sách', 'sổ tiền', 'kỹ thuật', 'anh chị']
    d = []
    for q in raw:
        for t in texts({k: v for k, v in q['nguoi'].items() if k != 'mo_ta_ngan'}):
            for w in KHOA:
                if re.search(r'(?<!\w)%s(?!\w)' % w, nfc(t).lower()): d.append('%s: "%s" có "%s"' % (q['id'], t[:60], w))
    rep.warn('CAST', 'T4 khối nguoi không có từ chỉ chuyện nhà hay nghề ngoài đời (soát tay)', d)
    d = []
    for q in raw:
        for r in q['nguoi']['vao_vai']['vai_hop_le']:
            for lc in ('anh', 'chi'):
                tu, goi = E.xung_ho(q, r, lc)
                if r == 'cap_tren' and (tu == 'em' or goi not in ('em', 'con', 'cháu')): d.append('%s cấp trên: %s/%s' % (q['id'], tu, goi))
                if r == 'cap_duoi' and (tu, goi) != ('em', E.GOI_LUA_CHON[lc]): d.append('%s cấp dưới: %s/%s' % (q['id'], tu, goi))
    rep.emit('CAST', 'C18 màn làm việc: cấp trên xưng bậc trên và gọi người chơi em/con/cháu; cấp dưới xưng em, gọi anh/chị (chốt 6/11)', d)
    NGHE = ['thầy', 'cô giáo', 'học trò', 'sư phụ', 'bác sĩ', 'y tá', 'điều dưỡng', 'thợ']
    d = []
    for q in raw:
        for t in texts(q['nguoi']):
            for w in NGHE:
                if re.search(r'(?<!\w)%s(?!\w)' % w, nfc(t).lower()): d.append('%s: "%s" có "%s"' % (q['id'], t[:60], w))
    rep.emit('CAST', 'T7 khối nguoi không có danh xưng gắn nghề (thầy, y tá, thợ…), kể cả trong xưng hô', d)
    mt = [q['nguoi'].get('mo_ta_ngan', '') for q in raw]
    d = ['%s: mo_ta_ngan "%s" (%d tiếng)' % (q['id'], m, len(m.split())) for q, m in zip(raw, mt) if not m or len(m.split()) > 15]
    d += ['mo_ta_ngan trùng: %s' % m for m, k in C.Counter(mt).items() if k > 1]
    rep.emit('CAST', 'T5 mỗi lá có mo_ta_ngan ≤ 15 tiếng, không trùng', d)
    d = []
    for q in raw:
        ng = q['doi_tu'].get('noi_gap', '')
        if not ng or len(ng.split()) > 14 or re.search(r'\d', ng): d.append('%s: noi_gap "%s"' % (q['id'], ng))
        moi = ' '.join([q['nguoi']['mo_ta_ngan'], ng])
        for ch in q['doi_tu']['tuyen_truyen']:
            if LP.ngrams(ch['cao_trao'], 3) & LP.ngrams(moi, 3): d.append('%s: mo_ta_ngan hoặc noi_gap chạm cao trào chương %d' % (q['id'], ch['chuong']))
        for k, muc in enumerate(E.LEVELS):
            dong = E.so_tay(q, muc).count('\n· ')
            if dong != k + 1: d.append('%s %s: sổ tay có %d dòng chuyện, cần %d' % (q['id'], muc, dong, k + 1))
    rep.emit('CAST', 'T6 noi_gap ≤ 14 tiếng, không chữ số; mô tả ngắn và chỗ gặp không chạm cao trào nào; sổ tay mức k có đúng k+1 dòng chuyện', d)
    d = []
    for q in raw:
        for x in q['than'].get('nang_luc', []):
            st = x.get('mo_ta_so_tay', '')
            if not st or len(st.split()) > 15 or re.search(r'\d|%|−|\+|\bOT\b|buff|D-', st): d.append('%s %s: mo_ta_so_tay "%s"' % (q['id'], x['id'], st))
    d = []; d2 = []
    PRON = {'em', 'con', 'cháu', 'bạn', 'ông', 'bà', 'anh', 'chị', 'cô', 'chú', 'bác', 'thầy', 'tui', 'tớ'}
    for q in raw:
        ctx = [('man_lam_viec', r) for r in q['nguoi']['vao_vai']['vai_hop_le']] + [('nhiem_vu_phu', 'ngoai_gio')]
        tus = {E.xung_ho(q, r, lc, canh=c)[0] for c, r in ctx for lc in ('anh', 'chi')}
        gois = {E.xung_ho(q, r, lc, canh=c)[1] for c, r in ctx for lc in ('anh', 'chi')} & PRON
        tu_ngoai = {E.xung_ho(q, 'ngoai_gio', lc, canh='nhiem_vu_phu')[0] for lc in ('anh', 'chi')}
        dung_chung = [(x['text'], tus) for x in q['nguoi']['giong']['cau_mau'] if x['quan_he'] == 'bat_ky'] + [(x['text'], tu_ngoai) for x in q['doi_tu'].get('cau_mau', [])]
        for t, tu_canh in dung_chung:
            w = set(re.findall(r'\w+', nfc(t).lower()))
            if len(tu_canh) > 1 and w & tu_canh: d.append('%s: "%s" tự xưng cứng %s, mà lá này xưng %s tuỳ cảnh; dùng {xung}' % (q['id'], t, sorted(w & tu_canh), sorted(tu_canh)))
            if w & (gois - tus): d2.append('%s: "%s" có %s; nếu là gọi người chơi thì dùng {goi}' % (q['id'], t, sorted(w & (gois - tus))))
    rep.emit('CAST', 'C19a câu mẫu dùng chung (bat_ky và câu ngoài giờ) không viết cứng đại từ tự xưng khi engine tính khác nhau giữa các cảnh', d)
    rep.warn('CAST', 'C19b câu mẫu dùng chung không gọi người chơi bằng đại từ viết cứng, vì từ mức gọi tên sẽ sai (soát tay: có thể là danh từ, như "con cá")', d2)
    TRAN = {15: ['nguoi.tinh_cach.ba_net', 'nguoi.cach_lam_viec', 'nguoi.giong.tro_tu', 'nguoi.giong.cau_cua_rieng', 'nguoi.giong.khong_bao_gio',
                 'nguoi.bieu_cam.thoi_quen', 'nguoi.vao_vai.theo_quan_he', 'nguoi.mo_ta_ngan', 'doi_tu.noi_gap', 'doi_tu.dong_luc',
                 'doi_tu.thoi_quen', 'doi_tu.do_rieng', 'doi_tu.tuyen_truyen[].tom_tat', 'doi_tu.qua', 'doi_tu.cau_chuyen.mo_theo_muc_than'],
            20: ['nguoi.giong.mo_ta', 'nguoi.luu_y', 'doi_tu.vai_trong_doi', 'doi_tu.que', 'doi_tu.doi_song', 'doi_tu.luu_y', 'doi_tu.tuyen_truyen[].cao_trao'],
            25: ['nguoi.giong.cau_mau', 'doi_tu.cau_mau'],
            40: ['doi_tu.cau_chuyen.tom_tat']}
    d = []; khong_tran = set()
    def di(x, path):
        if isinstance(x, dict):
            for k, v in x.items():
                if k not in ('id', 'quan_he', 'bieu_cam', 'tu_muc', 'mo_o', 'len_muc', 'muc', 'chu_dao', 'xu_ly_phu', 'vung', 'big5', 'goi_theo_lua_chon'): di(v, path + '.' + k)
        elif isinstance(x, list):
            for v in x: di(v, path + '[]')
        elif isinstance(x, str):
            lim = next((n for n, ps in sorted(TRAN.items()) if any(path.startswith(pp) for pp in ps)), None)
            if lim is None: khong_tran.add(path)
            elif len(x.split()) > lim: d.append('%s %s: %d tiếng > %d' % (q['id'], path, len(x.split()), lim))
    for q in raw:
        di(q['nguoi'], 'nguoi'); di(q['doi_tu'], 'doi_tu')
    d += ['trường chữ chưa có trần: %s' % p_ for p_ in sorted(khong_tran) if not p_.endswith(('xung_ho.ngoai_le.tu_xung', 'xung_ho.ngoai_le.goi', 'tu_xung', 'goi', 'goi_du_phong', 'tu_xung_ngang_hang', '[]'))]
    rep.emit('CAST', 'T9 trần độ dài theo loại trường: 15 tiếng (trường ngắn), 20 (câu tả), 25 (câu mẫu), 40 (chuyện đời tóm tắt)', d)
    rep.emit('CAST', 'T8 mỗi năng lực có mo_ta_so_tay bằng lời thường: ≤ 15 tiếng, không số, không %, không OT/buff/mã D-', d)

    print('\n== Phần 3: báo cáo đa dạng (không chấm đạt/trượt) ==')
    print('Vùng giọng:', dict(C.Counter(p['giong']['vung'] for p in cast)))
    print('Giới NPC:', dict(C.Counter(p['danh_tinh']['gioi'] for p in cast)))
    ages = sorted(p['danh_tinh']['tuoi'] for p in cast)
    print('Tuổi:', ages, '· nhóm <25: %d, 25–34: %d, 35–49: %d, ≥50: %d' % (
        sum(a < 25 for a in ages), sum(25 <= a < 35 for a in ages), sum(35 <= a < 50 for a in ages), sum(a >= 50 for a in ages)))
    print('Cách xử lý bất đồng:', dict(C.Counter(p['tinh_cach']['xu_ly_bat_dong']['chu_dao'] for p in cast)))
    print('Mức trang trọng:', dict(sorted(C.Counter(p['giong']['muc_trang_trong'] for p in cast).items())))
    for k in B5:
        print('Big Five %-16s' % k, dict(sorted(C.Counter(vec[i][B5.index(k)] for i in vec).items())))
    print('Mặt hay dùng (số lá):', dict(C.Counter(e for p in cast for e in p['bieu_cam']['hay_dung']).most_common()))
    print('Lá theo quan hệ:', {r: v for r, v in cov.items()})
    print('\nTỔNG: %d bài FAIL, %d bài WARN' % (rep.fails, rep.warns))
    return 1 if rep.fails else 0


if __name__ == '__main__':
    sys.exit(main(*sys.argv[1:4]))

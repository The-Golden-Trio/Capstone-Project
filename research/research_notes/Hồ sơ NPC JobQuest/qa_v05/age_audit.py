"""Tuổi NPC có hợp vai theo cấp của người chơi không.

python -I age_audit.py <levels_non_it.json> → in bảng, ghi dyn/age_audit.json
Năm kinh nghiệm mỗi cấp = trung vị cận dưới / cận trên của years_experience trên mọi nghề có cấp đó.
"""
import json, os, re, statistics as S, sys, collections
sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import engine as E
cast = E.load_cast(os.path.join(HERE, '..', 'cast_a.yaml'), os.path.join(HERE, '..', 'cast_b.yaml'))
lv = json.load(open(sys.argv[1], encoding='utf-8'))
roles = lv['roles'] if isinstance(lv['roles'], list) else list(lv['roles'].values())
lo, hi = collections.defaultdict(list), collections.defaultdict(list)
for r in roles:
    for l in r['levels']:
        m = re.findall(r'\d+', str(l.get('years_experience') or ''))
        if not m: continue
        b = int((l.get('band_equivalent') or l['band'])[1:])
        lo[b].append(int(m[0])); hi[b].append(int(m[1]) if len(m) > 1 else int(m[0]) + 5)
EXP = {b: S.median(lo[b]) for b in lo}; TOP = {b: S.median(hi[b]) for b in hi}
EXP[10], TOP[10] = EXP[9] + 3, TOP[9] + 5          # không nghề nào có số cho L10: ngoại suy
START, NGHI_HUU = 22, 62
TRE = int(sys.argv[2]) if len(sys.argv) > 2 else 5   # giả định của nhóm: vào nghề muộn hay đổi nghề tối đa TRE năm
REL = ('cap_tren', 'ngang_hang', 'cap_duoi')


def hop(rel, b, kn, tuoi):
    if tuoi > NGHI_HUU: return 'quá tuổi đi làm'
    if rel == 'cap_tren':
        can = EXP[min(b + 1, 10)] + (3 if b == 10 else 0)
        return None if kn >= can else 'ít năm hơn cấp trên của L%d (%g < %g)' % (b, kn, can)
    if rel == 'ngang_hang':
        return None if EXP[b] - 1 <= kn <= TOP[b] + TRE else 'lệch cấp L%d (%g năm, cấp này %g–%g)' % (b, kn, EXP[b], TOP[b])
    if rel == 'cap_duoi':
        if b < 4: return 'L%d chưa có cấp dưới' % b
        return None if kn <= TOP[b - 1] + TRE else 'nhiều năm hơn cấp L%d (%g > %g)' % (b - 1, kn, TOP[b - 1])


out = {'exp': EXP, 'top': TOP, 'mo_hinh': {}}
print('Cho phép vào nghề muộn tối đa %d năm' % TRE)
print('Cấp:   ' + '  '.join('L%-3d' % b for b in range(1, 11)))
print('Năm:   ' + '  '.join('%-4g' % EXP[b] for b in range(1, 11)))
print('Tuổi người chơi (22 + năm): ' + ' '.join('%g' % (START + EXP[b]) for b in range(1, 11)))
for mh, ten in (('cung_gia', 'M1: mọi người cùng già theo lịch'), ('npc_dung_yen', 'M2: NPC giữ tuổi, người chơi già theo cấp')):
    res = {}; bad = tot = 0; pool = collections.defaultdict(int)
    for cid, p in cast.items():
        a = p['danh_tinh']['tuoi']
        for rel in p['nguoi']['vao_vai']['vai_hop_le']:
            if rel not in REL: continue
            for b in range(1, 11):
                tuoi = a + EXP[b] if mh == 'cung_gia' else a
                kn = tuoi - START
                why = hop(rel, b, kn, tuoi)
                if why == 'L%d chưa có cấp dưới' % b: continue
                tot += 1
                if why: bad += 1; res.setdefault(cid, []).append((rel, b, why))
                else: pool[(rel, b)] += 1
    out['mo_hinh'][mh] = {'loi': res, 'pool': {'%s L%d' % k: v for k, v in pool.items()}, 'ty_le_loi': [bad, tot]}
    print('\n## %s: %d/%d tổ hợp (lá × vai × cấp) không hợp' % (ten, bad, tot))
    for cid, L in res.items():
        g = collections.defaultdict(list)
        for rel, b, why in L: g[rel].append(b)
        print('  %-20s %s' % ('%s (%d)' % (cast[cid]['danh_tinh']['ten_goi'], cast[cid]['danh_tinh']['tuoi']),
                              '; '.join('%s: L%s' % (r, ','.join(map(str, bs))) for r, bs in g.items())))
    print('  Số lá đóng được mỗi vai, theo cấp:')
    for rel in REL:
        print('   %-11s %s' % (rel, ' '.join('%2d' % pool.get((rel, b), 0) for b in range(1, 11))))
json.dump(out, open(os.path.join(HERE, 'dyn', 'age_audit_tre%d.json' % TRE), 'w', encoding='utf-8'), ensure_ascii=False, indent=1, default=str)

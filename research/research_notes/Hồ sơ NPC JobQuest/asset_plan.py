import csv, json, os, sys, collections as C
import yaml
sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, '..', '..', '..') + os.sep
env_in = {e['id']: e for e in json.load(open(os.path.join(HERE, 'env_input.json'), encoding='utf-8'))}
bp = {e['id']: e['bo_phan'] for e in json.load(open(os.path.join(HERE, 'env_bo_phan.json'), encoding='utf-8'))}
cast = yaml.safe_load(open(os.path.join(HERE, 'cast_a.yaml'), encoding='utf-8')) + yaml.safe_load(open(os.path.join(HERE, 'cast_b.yaml'), encoding='utf-8'))

# Trọng số loại hình = tổng trọng số của mọi nghề (mỗi nghề cộng 1 chia theo %)
w_env = C.Counter()
for r in csv.DictReader(open(ROOT + 'occupation-data/decisions/occupation_work_environments.csv', encoding='utf-8')):
    for part in r['environments'].split(';'):
        if ':' in part:
            k, v = part.split(':'); w_env[k.strip()] += float(v) / 100
n_roles = sum(w_env.values())

def body(do): return (do['ao_nen'], tuple(sorted(do['khoac'])))
def full(do): return body(do) + (tuple(sorted(do['deo'])),)

combos = []  # (env, ctype, bo_phan_id, relations, do, weight)
for eid, e in env_in.items():
    cts = e['company_types'] or ['(không ghi)']
    deps = bp[eid]
    for ct in cts:
        for d in deps:
            do = d['do']
            for v in d.get('bien_the_cong_ty', []):
                if v['company_type'] == ct: do = v['do']
            combos.append((eid, ct, d['id'], d['relation_hop'], do, w_env[eid] / len(cts) / len(deps)))

staff = [c for c in combos if c[2] != 'khach_nguoi_ngoai']
print(f'Tổ hợp loại hình × loại công ty × bộ phận: {len(combos)} (nhân viên {len(staff)}, khách {len(combos)-len(staff)})')
print(f'Số nghề tính trọng số: {n_roles:.0f}; loại hình có nghề: {sum(1 for k in env_in if w_env[k]>0)}/110')

def report(keyf, name, rows):
    w = C.Counter(); n = C.Counter()
    for c in rows: w[keyf(c[4])] += c[5]; n[keyf(c[4])] += 1
    tot = sum(w.values()); cum = 0; cut = {}
    for i, (k, v) in enumerate(w.most_common(), 1):
        cum += v / tot
        for t in (0.8, 0.9, 0.95, 0.99):
            if t not in cut and cum >= t: cut[t] = i
    print(f'\n{name}: {len(w)} nhóm; số nhóm phủ 80/90/95/99% suất: {cut.get(0.8)}/{cut.get(0.9)}/{cut.get(0.95)}/{cut.get(0.99)}')
    return w, n

wb, nb = report(body, 'Nhóm đồ (áo nền + áo khoác ngoài)', staff)
for k, v in wb.most_common():
    print(f'  {k[0]:20s} {"+".join(k[1]) or "-":22s} {100*v/sum(wb.values()):5.1f}%  ({nb[k]} tổ hợp)')
wf, nf = report(full, 'Công thức đủ (thêm đồ đeo)', staff)
mau = C.Counter()
for c in staff: mau[c[4]['mau']] += c[5]
print('\nMàu theo suất:', {k: f'{100*v/sum(mau.values()):.0f}%' for k, v in mau.items()})
print('Số công ty cần màu riêng (tổng company_slots):', sum(e['company_slots'] for e in env_in.values()))

# Theo nhân vật
print('\nTheo nhân vật (nhóm đồ làm việc với tới được qua vai_hop_le; + 1 bộ ngoài giờ):')
tot_body = tot_full = 0; per = {}
for ch in cast:
    vai = set(ch['nguoi']['vao_vai']['vai_hop_le']) - {'khach_hang'}
    rows = [c for c in staff if vai & set(c[3])]
    gb = C.Counter(); gf = C.Counter()
    for c in rows: gb[body(c[4])] += c[5]; gf[full(c[4])] += c[5]
    has_k = 'khach_hang' in ch['nguoi']['vao_vai']['vai_hop_le']
    # đồ thường riêng dùng chung với bộ ngoài giờ của chính nhân vật
    nb_ = len([k for k in gb if k[0] != 'doi_thuong_rieng' or k[1]]) + 1
    tw = sum(gb.values()) or 1
    top = sorted(gb.items(), key=lambda x: -x[1]); cum = 0; n90 = 0
    for k, v in top:
        cum += v / tw; n90 += 1
        if cum >= 0.9: break
    per[ch['id']] = (nb_, len(gf), n90)
    tot_body += nb_; tot_full += len(gf) + 1
    print(f'  {ch["id"]:22s} {ch["danh_tinh"]["ten_goi"]:6s} vai={",".join(ch["nguoi"]["vao_vai"]["vai_hop_le"]):45s} nhóm đồ={nb_:3d}  (90% suất: {n90}+1)  công thức đủ={len(gf)}')
print(f'\nTổng ảnh thân (nhóm đồ × nhân vật, gồm bộ ngoài giờ): {tot_body}; nếu tách cả đồ đeo: {tot_full}')
print('Mặt: 22 × 8 biểu cảm =', 22 * 8)
s90 = sum(v[2] + 1 for v in per.values())
print('Bản lõi (90% suất mỗi nhân vật + ngoài giờ):', s90)

print('\nĐồ đeo trong từng nhóm đồ (bộ đeo phổ biến nhất, phần suất nó phủ, bộ thứ hai nếu ≥20%):')
HEAD = {'mu_bao_ho','mu_bep','mu_trum','non_la','mu_luoi_trai','mu_bao_hiem'}
FACE = {'khau_trang','kinh_bao_ho'}
g = C.defaultdict(C.Counter); mau_g = C.defaultdict(C.Counter)
for c in staff:
    g[body(c[4])][tuple(sorted(c[4]['deo']))] += c[5]; mau_g[body(c[4])][c[4]['mau']] += c[5]
variants = 0; head_n = 0; face_n = 0; mask_n = 0
for k in sorted(g, key=lambda k: -sum(g[k].values())):
    t = sum(g[k].values()); top = g[k].most_common(3)
    v = [top[0]] + [x for x in top[1:] if x[1] / t >= 0.2]
    variants += len(v)
    h = sum(w for s, w in g[k].items() if HEAD & set(s)) / t
    f = sum(w for s, w in g[k].items() if FACE & set(s)) / t
    m = mau_g[k]['cong_ty'] / t
    if h >= .2: head_n += 1
    if f >= .2: face_n += 1
    if m >= .2: mask_n += 1
    print(f'  {k[0]}+{"+".join(k[1]) or "-"}: ' + ' | '.join(f'{",".join(s) or "không"} {100*w/t:.0f}%' for s, w in v)
          + f'  · đội đầu {100*h:.0f}% · che mặt {100*f:.0f}% · màu công ty {100*m:.0f}%')
print(f'Biến thể thân theo đồ đeo (bộ đầu + bộ ≥20%): {variants}; nhóm có đội đầu ≥20%: {head_n}; che mặt ≥20%: {face_n}; cần mặt nạ màu công ty: {mask_n}')

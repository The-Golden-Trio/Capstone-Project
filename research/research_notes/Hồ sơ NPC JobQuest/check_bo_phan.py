import json, re, sys
from collections import Counter
from pathlib import Path

HERE = Path(__file__).parent
AO = {'doi_thuong_rieng', 'thun_polo', 'so_mi', 'so_mi_vest', 'ao_dai', 'dong_phuc_nganh', 'scrubs',
      'ao_lao_dong', 'ao_the_thao', 'trang_phuc_bieu_dien', 'ao_khoac_ky_thuat'}
KHOAC = {'blouse_trang', 'ao_phan_quang', 'tap_de', 'ao_phao', 'do_phong_sach', 'ao_mua'}
DEO = {'mu_bao_ho', 'mu_bep', 'mu_trum', 'khau_trang', 'kinh_bao_ho', 'tai_nghe', 'the_deo', 'ong_nghe',
       'phu_hieu', 'non_la', 'mu_luoi_trai', 'mu_bao_hiem', 'gang_tay'}
MAU = {'cong_ty', 'nganh', 'tu_do'}
REL = {'cap_tren', 'ngang_hang', 'cap_duoi', 'phong_ban_khac', 'khach_hang'}
NGUON = {'dress_code', 'suy_luan'}
ID_RE = re.compile(r'^[a-z][a-z0-9_]*$')

inp = json.loads((HERE / 'env_input.json').read_text(encoding='utf-8'))
out = json.loads((HERE / 'env_bo_phan.json').read_text(encoding='utf-8'))
err = []


def check_do(d, where):
    if set(d) != {'ao_nen', 'khoac', 'deo', 'mau'}:
        err.append(f'{where}: do keys {sorted(d)}')
    if d.get('ao_nen') not in AO:
        err.append(f'{where}: ao_nen {d.get("ao_nen")}')
    k, o = d.get('khoac', []), d.get('deo', [])
    if not isinstance(k, list) or len(k) > 2 or len(set(k)) != len(k) or not set(k) <= KHOAC:
        err.append(f'{where}: khoac {k}')
    if not isinstance(o, list) or len(o) > 3 or len(set(o)) != len(o) or not set(o) <= DEO:
        err.append(f'{where}: deo {o}')
    if d.get('mau') not in MAU:
        err.append(f'{where}: mau {d.get("mau")}')


if len(out) != 110:
    err.append(f'count {len(out)} != 110')
if [e['id'] for e in out] != [e['id'] for e in inp]:
    err.append('ids/order differ from input')
types = {e['id']: set(e['company_types']) for e in inp}

for env in out:
    bps = env['bo_phan']
    if not 2 <= len(bps) <= 4:
        err.append(f'{env["id"]}: {len(bps)} bo_phan')
    ids = [b['id'] for b in bps]
    if len(set(ids)) != len(ids):
        err.append(f'{env["id"]}: duplicate bo_phan id')
    if 'khach_nguoi_ngoai' not in ids:
        err.append(f'{env["id"]}: no khach_nguoi_ngoai')
    for b in bps:
        w = f'{env["id"]}.{b["id"]}'
        if not ID_RE.match(b['id']):
            err.append(f'{w}: bad id')
        if not b.get('ten_vn'):
            err.append(f'{w}: no ten_vn')
        r = b.get('relation_hop', [])
        if not r or not set(r) <= REL or len(set(r)) != len(r):
            err.append(f'{w}: relation_hop {r}')
        if b.get('nguon') not in NGUON:
            err.append(f'{w}: nguon {b.get("nguon")}')
        check_do(b['do'], w)
        for v in b.get('bien_the_cong_ty', []):
            if v['company_type'] not in types.get(env['id'], ()):
                err.append(f'{w}: unknown company_type {v["company_type"]}')
            check_do(v['do'], f'{w}[{v["company_type"]}]')

if err:
    print('\n'.join(err))
    sys.exit(1)
all_bp = [b for e in out for b in e['bo_phan']]
c = Counter(b['nguon'] for b in all_bp)
staff_s = sum(1 for b in all_bp if b['nguon'] == 'suy_luan' and b['id'] != 'khach_nguoi_ngoai')
print(f'OK: 110 envs, {len(all_bp)} bo_phan, nguon={dict(c)}, suy_luan excl. khach={staff_s}, '
      f'bien_the={sum(len(b.get("bien_the_cong_ty", [])) for b in all_bp)}')

"""Đối chiếu tài liệu hồ sơ với cast và engine.

python -I check_doc.py <ho_so.md>  → in từng bài OK/LỆCH
"""
import collections as C, os, re, sys
import yaml
sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import engine as E
cast = E.load_cast(os.path.join(HERE, '..', 'cast_a.yaml'), os.path.join(HERE, '..', 'cast_b.yaml'))
doc = open(sys.argv[1], encoding='utf-8').read()
bad = 0


def res(name, issues):
    global bad
    bad += bool(issues)
    print('%s %s' % ('OK   ' if not issues else 'LỆCH ', name))
    for i in issues: print('      -', i)


def section(title):
    i = doc.index(title); j = doc.find('\n## ', i + 1)
    return doc[i:j if j > 0 else None]


# 1. Bảng cast mục 7
VAI = {'ngang hàng': 'ngang_hang', 'phòng khác': 'phong_ban_khac', 'khách': 'khach_hang', 'cấp dưới': 'cap_duoi', 'cấp trên': 'cap_tren'}
MO = {'san': 'Sẵn', 'cot_moc': 'Cột mốc'}
by_so = {p['la_bai']['so']: p for p in cast.values()}
iss = []
rows = [l for l in section('## 7. Cast 22 lá').splitlines() if re.match(r'\| (0|[IVX]+) ', l)]
for l in rows:
    c = [x.strip() for x in l.strip('|').split('|')]
    so, ten_la = c[0].split(' ', 1); p = by_so[so]
    if c[1] != p['danh_tinh']['ten_goi']: iss.append('%s tên %s ≠ %s' % (so, c[1], p['danh_tinh']['ten_goi']))
    if ten_la != p['la_bai']['ten_la']: iss.append('%s tên lá %s ≠ %s' % (so, ten_la, p['la_bai']['ten_la']))
    if int(c[2]) != p['danh_tinh']['tuoi']: iss.append('%s tuổi %s ≠ %s' % (so, c[2], p['danh_tinh']['tuoi']))
    v = {VAI[x.strip()] for x in c[7].split(',')}
    if v != set(p['nguoi']['vao_vai']['vai_hop_le']): iss.append('%s vai %s ≠ %s' % (so, sorted(v), sorted(p['nguoi']['vao_vai']['vai_hop_le'])))
    mo = MO.get(p['la_bai']['mo_khoa'], 'Danh thiếp, người mới')
    if c[6] != mo: iss.append('%s mở %s ≠ %s' % (so, c[6], mo))
    if p['doi_tu']['vai_trong_doi'][:6].lower() not in c[5].lower() and False: pass
res('Mục 7: bảng 22 lá khớp cast (tên, tên lá, tuổi, mở lá, vai_hop_le); %d dòng' % len(rows), iss + ([] if len(rows) == 22 else ['có %d dòng' % len(rows)]))

# 2. Các con số của mục 7
vung = C.Counter()
for p in cast.values():
    v = p['nguoi']['giong']['vung']; vung['Bắc' if v.startswith('bac') else ('Trung' if v.startswith('trung') else 'Nam')] += 1
tki = C.Counter(p['nguoi']['tinh_cach']['xu_ly_bat_dong']['chu_dao'] for p in cast.values())
mo = C.Counter(p['la_bai']['mo_khoa'] for p in cast.values())
rel = C.Counter(r for p in cast.values() for r in p['nguoi']['vao_vai']['vai_hop_le'])
cd = sorted(p['danh_tinh']['ten_goi'] for p in cast.values() if 'cap_duoi' in p['nguoi']['vao_vai']['vai_hop_le'])
print('      số liệu: vùng %s; bất đồng %s; mở %s; vai %s; cấp dưới %s' % (dict(vung), dict(tki), dict(mo), dict(rel), cd))
s7 = section('## 7. Cast 22 lá'); iss = []
want = '%d Nam, %d Bắc, %d Trung' % (vung['Nam'], vung['Bắc'], vung['Trung'])
if want not in s7: iss.append('vùng phải là ' + want)
want = 'cạnh tranh %d, hợp tác %d, thoả hiệp %d, né tránh %d, nhường nhịn %d' % tuple(tki[k] for k in ('canh_tranh', 'hop_tac', 'thoa_hiep', 'ne_tranh', 'nhuong_nhin'))
if want not in s7: iss.append('bất đồng phải là ' + want)
want = 'sẵn %d lá, cột mốc %d lá, danh thiếp hoặc người mới %d lá' % (mo['san'], mo['cot_moc'], 22 - mo['san'] - mo['cot_moc'])
if want not in s7: iss.append('mở lá phải là ' + want)
m = re.search(r'Mỗi quan hệ của slot có ít nhất (\d+) lá', s7)
if not m or int(m.group(1)) != min(rel.values()): iss.append('ít nhất %d lá mỗi quan hệ' % min(rel.values()))
m = re.search(r'có (\d+) lá đóng được \(([^)]*)\)', s7)
if not m or int(m.group(1)) != len(cd) or sorted(x.strip() for x in m.group(2).split(',')) != cd: iss.append('cấp dưới: %d lá %s' % (len(cd), cd))
res('Mục 7: số liệu vùng, bất đồng, mở lá, phân vai', iss)

# 3. Ví dụ schema mục 2 = Hồng trong cast
blk = re.search(r'```yaml\n(.*?)\n```', section('## 2. Schema'), re.S).group(1)
blk = blk.split('# ── Chưa ghi trong cast')[0]
ex = yaml.safe_load(blk); iss = []
def diff(a, b, path=''):
    if isinstance(a, dict) and isinstance(b, dict):
        for k in set(a) | set(b):
            if k not in a: iss.append('thiếu trong tài liệu: ' + path + k)
            elif k not in b: iss.append('thừa trong tài liệu: ' + path + k)
            else: diff(a[k], b[k], path + k + '.')
    elif (a.strip() if isinstance(a, str) else a) != (b.strip() if isinstance(b, str) else b): iss.append('%s: tài liệu %r ≠ cast %r' % (path.rstrip('.'), a, b))
diff(ex, cast['IV_hoang_de'])
res('Mục 2: ví dụ schema giống hệt hồ sơ Hồng trong cast_a.yaml', iss)

# 4. Ví dụ thẻ mục 6.1, 6.2, 6.3
def code_blocks(title):
    return re.findall(r'```\n(.*?)\n```', section(title) if title.startswith('## ') else doc[doc.index(title):doc.index('\n### ', doc.index(title) + 1)], re.S)
H = cast['IV_hoang_de']
slot = dict(id='quan_ly', relation='cap_tren', vai='quản lý trực tiếp của người chơi', want='…', known='…')
txt = E.card(H, 'chi', 'man_lam_viec', slot=slot)[0].replace('….', '…')
d61 = code_blocks('### 6.1')[0]
res('Mục 6.1: thẻ màn làm việc trong tài liệu = engine dựng', [] if d61 == txt else ['khác:\n' + '\n'.join(l for l in d61.splitlines() if l not in txt.splitlines())])
txt = E.card(H, 'chi', 'nhiem_vu_phu', muc='than', ten='Linh', ky_uc=['cùng làm ca tối ở quán cơm; người chơi phụ Hân bàn 9'])[0]
d62 = code_blocks('### 6.2')[0]
part = txt[txt.index('── Nhiệm vụ phụ ──'):]
res('Mục 6.2: khối đời tư trong tài liệu = engine dựng', [] if d62 == part else ['dòng lệch: ' + ' | '.join(l for l in d62.splitlines() if l not in part.splitlines())])
d63 = code_blocks('### 6.3')
gen = [E.so_tay(H, 'than'), E.so_tay(H, 'tri_ky')]
res('Mục 6.3: trang sổ tay trong tài liệu = engine dựng', [] if d63[:1] == ['\n\n'.join(gen)] or d63[:2] == gen else ['tài liệu:\n' + '\n---\n'.join(d63) + '\nengine:\n' + '\n---\n'.join(gen)])

# 5. Bảng ngoại lệ xưng hô mục 4
s4 = section('## 4. Xưng hô'); iss = []
for p in cast.values():
    nl = p['nguoi']['xung_ho'].get('ngoai_le')
    if nl and '%s (%s)' % (nl['tu_xung'], p['danh_tinh']['ten_goi']) not in s4 and p['danh_tinh']['ten_goi'] not in s4:
        iss.append('%s ngoại lệ %s/%s chưa có trong mục 4' % (p['danh_tinh']['ten_goi'], nl['tu_xung'], nl['goi']))
    if nl and p['danh_tinh']['ten_goi'] not in s4: iss.append('thiếu ' + p['danh_tinh']['ten_goi'])
names = re.search(r'Ngoại lệ khai trong hồ sơ.*', s4).group(0)
for p in cast.values():
    nl = p['nguoi']['xung_ho'].get('ngoai_le')
    if nl:
        n = p['danh_tinh']['ten_goi']
        if not re.search(r'%s \([^)]*%s' % (re.escape(nl['tu_xung']), n), names): iss.append('%s: tự xưng %s không khớp bảng' % (n, nl['tu_xung']))
        if not re.search(r'%s \([^)]*%s' % (re.escape(nl['goi']), n), names): iss.append('%s: gọi %s không khớp bảng' % (n, nl['goi']))
listed = set(re.findall(r'[A-ZĐ][a-zà-ỹ]+', names.split('|')[2] + names.split('|')[3])) - {'Ngoại'}
real = {p['danh_tinh']['ten_goi'] for p in cast.values() if p['nguoi']['xung_ho'].get('ngoai_le')}
if listed != real: iss.append('bảng ghi %s, cast có %s' % (sorted(listed), sorted(real)))
res('Mục 4: bảng ngoại lệ xưng hô khớp cast', iss)

# 6. Trần độ dài mục 6
mx = 0; mxs = mxs2 = mxfull = 0
for p in cast.values():
    for r in p['nguoi']['vao_vai']['vai_hop_le']:
        for lc in ('anh', 'chi'):
            mx = max(mx, E.card(p, lc, 'man_lam_viec', slot=dict(id='truong_nhom', relation=r, vai='trưởng nhóm, kèm người chơi từ lúc mới vào'))[1])
    for m in E.LEVELS:
        for lc in ('anh', 'chi'):
            _, n, k = E.card(p, lc, 'nhiem_vu_phu', muc=m, ten='Linh'); mx = max(mx, n); mxs = max(mxs, k)
            t, n, k = E.card(p, lc, 'nhiem_vu_phu', muc=m, ten='Linh', ky_uc=['a b c d e f g h i j k l m n o'] * 3, luot_cuoi=True); mxs2 = max(mxs2, k); mxfull = max(mxfull, len(t.split()))
s6 = section('## 6. Thẻ AI-4'); iss = []
for lab, val in (('dài nhất %d.' % mx, mx), ('dài nhất %d,' % mxs, mxs), ('dài nhất đúng %d' % mxs2, mxs2), ('dài nhất %d tiếng' % mxfull, mxfull)):
    if lab not in s6: iss.append('tài liệu chưa ghi "%s"' % lab)
print('      đo: phần người dài nhất %d; đời tư gốc dài nhất %d; đời tư với 3 ký ức 15 tiếng + cao trào dài nhất %d' % (mx, mxs, mxs2))
res('Mục 6: số đo trần ghi trong tài liệu khớp engine', iss)

# 7. Đường dẫn file nhắc trong tài liệu có thật
iss = []
root = os.path.join(HERE, '..')
for f in sorted(set(re.findall(r'`((?:qa_v05/)?[\w./-]+\.(?:py|json|yaml|txt|md|csv))`', doc))):
    rel_ = f
    if not (os.path.exists(os.path.join(root, rel_)) or os.path.exists(os.path.join(HERE, rel_))):
        iss.append(f)
res('Đường dẫn file trong tài liệu (trong thư mục ghi chú)', [i for i in iss if not i.endswith(('JobQuest.md', 'work_environments.json', 'occupation_work_environments.csv', 'levels_non_it.json'))])
sys.exit(1 if bad else 0)

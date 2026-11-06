"""Engine mẫu v1.0: tính xưng hô (mục 4) và dựng thẻ (mục 6) từ hồ sơ hai khối. Dùng cho QA, không phải code game.

Màn làm việc chỉ đọc `danh_tinh` và `nguoi`. Nhiệm vụ phụ đọc thêm `doi_tu`, theo mức thân.
"""
import re
import yaml

PLAYER_AGE = 22
LEVELS = ['gap', 'than', 'gan_bo', 'tri_ky']
LEVEL_VN = {'gap': 'Gặp', 'than': 'Thân', 'gan_bo': 'Gắn bó', 'tri_ky': 'Tri kỷ'}
B5_VN = [('huong_ngoai', 'hướng ngoại'), ('de_chiu', 'dễ chịu'), ('tan_tam', 'tận tâm'),
         ('on_dinh_cam_xuc', 'ổn định cảm xúc'), ('coi_mo', 'cởi mở')]
TKI_VN = {'canh_tranh': 'cạnh tranh', 'hop_tac': 'hợp tác', 'thoa_hiep': 'thoả hiệp', 'ne_tranh': 'né tránh',
          'nhuong_nhin': 'nhường nhịn'}
GOI_LUA_CHON = {'anh': 'anh', 'chi': 'chị'}


def load_cast(*paths):
    out = []
    for p in paths: out += yaml.safe_load(open(p, encoding='utf-8'))
    return {c['id']: c for c in out}


def phan_viec(p):
    """Phần hồ sơ màn làm việc được phép đọc."""
    return {'id': p['id'], 'danh_tinh': p['danh_tinh'], 'nguoi': p['nguoi']}


def xung_ho(p, quan_he, lua_chon, muc=None, ten=None, canh='man_lam_viec'):
    """Trả (tu_xung, goi). quan_he: relation của slot, hoặc 'ngoai_gio' ở nhiệm vụ phụ."""
    assert lua_chon in ('anh', 'chi')
    xh = p['nguoi']['xung_ho']; tuoi = p['danh_tinh']['tuoi']; diff = tuoi - PLAYER_AGE
    xd = p['doi_tu']['xung_ho'] if canh == 'nhiem_vu_phu' else {}
    if quan_he == 'ngoai_gio' and 'ngoai_gio' in xd:
        tu, goi = xd['ngoai_gio']['tu_xung'], xd['ngoai_gio']['goi_theo_lua_chon'][lua_chon]
    elif quan_he == 'cap_duoi':
        tu, goi = 'em', GOI_LUA_CHON[lua_chon]
    elif 'ngoai_le' in xh:
        tu, goi = xh['ngoai_le']['tu_xung'], xh['ngoai_le']['goi']
    elif quan_he == 'cap_tren':
        tu, goi = ('anh' if p['danh_tinh']['gioi'] == 'nam' else 'chị'), 'em'
    elif diff < 0:
        tu, goi = xh.get('tu_xung', 'em'), xh['goi_theo_lua_chon'][lua_chon]
    elif diff >= 5:
        tu, goi = ('anh' if p['danh_tinh']['gioi'] == 'nam' else 'chị'), 'em'
    else:
        tu = xh.get('tu_xung_ngang_hang') or ('tớ' if p['nguoi']['giong']['vung'] == 'bac' else 'tui')
        goi = 'bạn'
    if muc and 'tu_muc_than' in xd:
        t = xd['tu_muc_than']
        if LEVELS.index(muc) >= LEVELS.index(t['muc']):
            if 'goi_theo_lua_chon' in t: goi = t['goi_theo_lua_chon'][lua_chon]
            elif ten: goi = t['goi'].replace('{ten}', ten)
            else: goi = xd.get('goi_du_phong', goi)
    return tu, goi


def _fill(text, goi, tu):
    """{goi}: cách gọi người chơi; {xung}: NPC tự xưng. Câu mẫu dùng chung nhiều cảnh không viết cứng đại từ."""
    for k, v in (('{goi}', goi), ('{xung}', tu)):
        if text.startswith(k): text = v[:1].upper() + v[1:] + text[len(k):]
        text = text.replace(k, v)
    return text


def _cau_mau(p, quan_he, canh, muc, goi, tu):
    cm = p['nguoi']['giong']['cau_mau']
    if canh == 'man_lam_viec':
        pool = [c for c in cm if c['quan_he'] == quan_he]
    else:
        pool = [c for c in p['doi_tu'].get('cau_mau', []) if LEVELS.index(c.get('tu_muc', 'gap')) <= LEVELS.index(muc)]
    out = pool[:2]
    if len(out) < 2: out += [c for c in cm if c['quan_he'] == 'bat_ky'][:2 - len(out)]
    return ' · '.join('"%s"' % _fill(c['text'], goi, tu) for c in out)


def person_part(p, quan_he, lua_chon, canh, muc=None, ten=None, slot=None, rut_gon=0):
    tu, goi = xung_ho(p, quan_he, lua_chon, muc, ten, canh)
    d = p['danh_tinh']; n = p['nguoi']; t = n['tinh_cach']; cl = n['cach_lam_viec']; g = n['giong']; b = n['bieu_cam']
    L = []
    if canh == 'man_lam_viec':
        L.append('[%s] %s, %d tuổi. Vai trong màn: %s.' % (slot['id'], d['ten_goi'], d['tuoi'], slot['vai']))
        L.append('Xưng "%s", gọi người chơi "%s". Kênh: %s.' % (tu, goi, slot.get('kenh') or 'gặp trực tiếp'))
    else:
        L.append('[%s] %s, %d tuổi. Vai trong đời: %s.' % (p['id'], d['ten_goi'], d['tuoi'], p['doi_tu']['vai_trong_doi']))
        L.append('Xưng "%s", gọi người chơi "%s".' % (tu, goi))
    L.append('Tính cách: ' + ', '.join('%s %s' % (vn, t['big5'][k]) for k, vn in B5_VN if t['big5'][k] != 'trung bình') + '.')
    L.append('Ba nét: ' + '; '.join(t['ba_net']) + '.')
    L.append('Điểm yếu: %s.' % cl['diem_yeu'])
    L.append('Khi áp lực: %s.' % cl['khi_ap_luc'])
    chu = t['xu_ly_bat_dong']['chu_dao']
    if canh == 'man_lam_viec':
        L.append('Bất đồng: %s; trong vai này nghiêng về %s.' % (TKI_VN[chu], TKI_VN[n['vao_vai']['theo_quan_he'][quan_he]['xu_ly_phu']]))
    else:
        L.append('Bất đồng: %s.' % TKI_VN[chu])
    gv = []
    if rut_gon < 1: gv.append('Giá trị: %s.' % ', '.join(cl['gia_tri']))
    if rut_gon < 2: gv.append('Tin rằng: %s.' % cl['niem_tin_nen'])
    if gv: L.append(' '.join(gv))
    L.append('Giọng: %s. Trợ từ (≤1/4 số câu): %s. Không bao giờ: %s.' % (g['mo_ta'], ', '.join(g['tro_tu']), '; '.join(g['khong_bao_gio'])))
    L.append('Câu của riêng (cả cuộc trò chuyện tối đa 1 lần): ' + ' '.join('"%s"' % s for s in g['cau_cua_rieng']))
    L.append('Câu mẫu: ' + _cau_mau(p, quan_he, canh, muc, goi, tu))
    L.append('Mặt hay dùng: %s. Hiếm: %s.' % (', '.join(b['hay_dung']), ', '.join(b['hiem_dung'])))
    L.append('Thói quen: %s.' % b['thoi_quen'])
    if n.get('luu_y'): L.append('Lưu ý: ' + '; '.join(x['text'] for x in n['luu_y']) + '.')
    return L


NHAN_KY_NANG = {'am_nhac': 'âm nhạc', 'ban_hang': 'bán hàng', 'co_khi_dong_tau': 'cơ khí đóng tàu', 'cong_nghe': 'công nghệ', 'dich_vu_khach_san': 'dịch vụ khách sạn', 'dien_toa_nha': 'điện toà nhà', 'giao_duc': 'giáo dục', 'giao_tiep': 'giao tiếp', 'huong_nghiep': 'hướng nghiệp', 'ke_toan': 'kế toán', 'kinh_doanh_nho': 'kinh doanh nhỏ', 'lam_moc': 'làm mộc', 'luat_lao_dong': 'luật lao động', 'nau_an': 'nấu ăn', 'nhan_su': 'nhân sự', 'nhiep_anh': 'nhiếp ảnh', 'quan_ly_doi': 'quản lý đội', 'sua_chua_co_khi': 'sửa chữa cơ khí', 'sua_chua_dien_thoai': 'sửa điện thoại', 'suc_khoe_tinh_than': 'sức khoẻ tinh thần', 'tai_chinh_ca_nhan': 'tài chính cá nhân', 'the_thao': 'thể thao', 'thiet_ke': 'thiết kế', 'van_chuyen': 'vận chuyển', 'xay_dung': 'xây dựng', 'y_te': 'y tế'}


def _diem(d):
    return ', '.join('%s %s' % (NHAN_KY_NANG[k], v) for k, v in d.items())


def _ky_nang(n):
    return _diem(n['vao_vai']['ky_nang_chung'])


def slot_part(p, slot):
    n = p['nguoi']; L = ['── Trong màn này (từ seed) ──']
    L.append('Trong màn muốn: %s. Vướng: %s. Thái độ: %s. Khúc mắc: %s.' % (
        slot.get('want', 'không có'), slot.get('pressure', 'không có'),
        slot.get('stance') or n['vao_vai']['theo_quan_he'][slot['relation']]['stance_mac_dinh'], slot.get('concerns', 'không có')))
    L.append('Nghĩ là: %s.   Biết: %s.' % (slot.get('beliefs', 'không có'), slot.get('known', 'không có')))
    L.append('Hiểu biết nghề: %s. Kỹ năng chung: %s.' % (slot.get('expertise') or 'đúng mức của vai trong màn', _ky_nang(n)))
    L.append('Cách nói ra điều mình biết: %s.' % (slot.get('disclosure') or 'nói thẳng'))
    return L


def side_part(p, muc, ky_uc=(), quen=(), luot_cuoi=False, ngoai_tuyen=False):
    dt = p['doi_tu']; L = ['── Nhiệm vụ phụ ──', 'Mức thân: %s.' % LEVEL_VN[muc]]
    L.append('Quê: %s. Đời sống: %s.' % (dt['que'], dt['doi_song']))
    L.append('Bản thân muốn: %s. Sợ: %s.' % (dt['dong_luc']['muon'], dt['dong_luc']['so']))
    L.append('Chuyện đời: %s' % dt['cau_chuyen']['tom_tat'])
    tt = dt['tuyen_truyen']
    da_ke = dt['cau_chuyen']['mo_theo_muc_than']['gap'] if muc == 'gap' else tt[LEVELS.index(muc) - 1]['cao_trao']
    L.append('Ở mức này đã kể: %s.' % da_ke)
    L.append('Điều chưa tự nhận ra: %s (không nói thẳng ra).' % dt['dong_luc']['can'])
    extra = []
    if dt.get('hieu_biet'): extra.append('Hiểu biết: %s.' % _diem(dt['hieu_biet']))
    if dt.get('thoi_quen'): extra.append('Thói quen ngoài giờ: %s.' % dt['thoi_quen'])
    if extra: L.append(' '.join(extra))
    ly = [x['text'] for x in dt.get('luu_y', []) if LEVELS.index(x.get('tu_muc', 'gap')) <= LEVELS.index(muc)]
    if ly: L.append('Lưu ý riêng: ' + '; '.join(ly) + '.')
    ch = None if ngoai_tuyen else next((c for c in tt if c['mo_o'] == muc), None)
    if ch:
        L.append('Chương đang chơi: %s.' % ch['tom_tat'])
        if luot_cuoi: L.append('Lượt này: nói ra điều sau: %s.' % ch['cao_trao'])
    if quen: L.append('Người quen có mặt: %s.' % '; '.join(quen))
    if ky_uc: L.append('Đã cùng người chơi: %s.' % ' / '.join(ky_uc[:3]))
    return L


def card(p, lua_chon, canh, quan_he=None, slot=None, muc='gap', ten=None, ky_uc=(), quen=(), luot_cuoi=False, ngoai_tuyen=False):
    """Dựng thẻ, tự rút gọn theo mục 6 khi phần người quá 250 tiếng. Trả (text, so_tieng_nguoi, so_tieng_tinh_huong)."""
    if canh == 'man_lam_viec':
        p = phan_viec(p); q = slot['relation']
    else:
        q = 'ngoai_gio'
    for rg in range(3):
        per = person_part(p, q, lua_chon, canh, muc, ten, slot, rg)
        n = len(' '.join(per).split())
        if n <= 250: break
    rest = slot_part(p, slot) if canh == 'man_lam_viec' else side_part(p, muc, ky_uc, quen, luot_cuoi, ngoai_tuyen)
    return '\n'.join(per + rest), n, len(' '.join(rest).split())


def phang(p):
    """Gộp hai khối về dạng phẳng của v0.5, chỉ để các bài lint nội dung cũ chạy được. Engine không dùng."""
    n, dt = p['nguoi'], p['doi_tu']
    return {'id': p['id'], 'phien_ban': p['phien_ban'], 'la_bai': p['la_bai'],
            'danh_tinh': dict(p['danh_tinh'], que=dt['que'], vai_trong_doi=dt['vai_trong_doi'], doi_song=dt['doi_song']),
            'tinh_cach': n['tinh_cach'], 'dong_luc': dict(n['cach_lam_viec'], **dt['dong_luc']),
            'cau_chuyen': dt['cau_chuyen'], 'tuyen_truyen': dt['tuyen_truyen'],
            'giong': dict(n['giong'], cau_mau=n['giong']['cau_mau'] + dt.get('cau_mau', [])),
            'bieu_cam': n['bieu_cam'], 'xung_ho': dict(n['xung_ho'], **dt['xung_ho']),
            'vao_vai': {'vai_hop_le': n['vao_vai']['vai_hop_le'], 'theo_quan_he': n['vao_vai']['theo_quan_he'],
                        'hieu_biet_nen': dict(n['vao_vai']['ky_nang_chung'], **dt.get('hieu_biet', {}))},
            'than': p['than'], 'qua': dt['qua'], 'ngoai_hinh': dict(p['ngoai_hinh'], nhan_dien=dt.get('do_rieng', '')),
            'nhay_cam': n.get('luu_y', []) + dt.get('luu_y', [])}


KINH_XUNG = ('thầy', 'cô', 'chú', 'bác')


def danh_xung(p):
    """Người chơi gọi NPC thế nào trong sổ tay (thế giới ngoài giờ, theo tuổi). Rỗng khi gọi tên trơn."""
    for xh in (p['doi_tu']['xung_ho'].get('ngoai_gio', {}), p['nguoi']['xung_ho'].get('ngoai_le', {})):
        if xh.get('tu_xung') in KINH_XUNG: return xh['tu_xung']
    if p['danh_tinh']['tuoi'] - PLAYER_AGE >= 5: return 'anh' if p['danh_tinh']['gioi'] == 'nam' else 'chị'
    return ''


def _giong_so_tay(p, text):
    """Đổi chữ ngôi thứ ba sang giọng sổ tay nói với người chơi: "người chơi" thành "bạn", tên NPC kèm danh xưng."""
    text = re.sub(r'(?i)\banh (hay|hoặc) chị\b|người chơi', 'bạn', text)
    dx, ten = danh_xung(p), p['danh_tinh']['ten_goi']
    if dx:
        truoc = tuple(x + ' ' for x in KINH_XUNG + ('anh', 'chị'))
        text = re.sub(r'(?<!\w)%s(?!\w)' % re.escape(ten),
                      lambda m: m.group(0) if text[:m.start()].lower().endswith(truoc) else '%s %s' % (dx, ten), text)
    return re.sub(r'(^|[.!?] )(\w)', lambda m: m.group(1) + m.group(2).upper(), text)


def _bo_chu_ngu(p, text):
    """Dòng sau dòng đầu bỏ tên ở đầu câu, như ghi chú: "Kể chuyện…" thay vì "Chị Thảo kể chuyện…"."""
    dx, ten = danh_xung(p), p['danh_tinh']['ten_goi']
    for dau in ('%s %s ' % (dx, ten), '%s ' % ten, '%s ' % dx):
        if dau.strip() and text.lower().startswith(dau.lower()):
            rest = text[len(dau):]
            return rest[:1].upper() + rest[1:]
    return text


def so_tay(p, muc, da_gap=True):
    """Trang hồ sơ người chơi xem trong menu. Chỉ dùng chữ đã có: mỗi điều viết một lần, hiển thị hai cách.

    Mức Gặp: chuyện công khai. Mỗi mức sau: thêm cao trào của chương vừa xong. Không bao giờ có chương chưa chơi.
    Dữ liệu viết ngôi thứ ba; lúc hiển thị, tên NPC được ghép cách người chơi gọi ("chị Hồng"), như sổ tay người chơi tự ghi.
    """
    d = p['danh_tinh']; dt = p['doi_tu']; k = LEVELS.index(muc)
    L = ['%s · %s %s' % (d['ten_goi'], p['la_bai']['so'], p['la_bai']['ten_la']),
         ' '.join('%s %s' % (LEVEL_VN[m], '●' if i <= k else '○') for i, m in enumerate(LEVELS)),
         p['nguoi']['mo_ta_ngan']]
    if da_gap: L.append('Gặp ở: %s.' % _giong_so_tay(p, dt['noi_gap']))
    if k >= 1: L.append('Sinh nhật: %s.' % d['sinh_nhat'])
    L.append('· %s' % _giong_so_tay(p, dt['cau_chuyen']['tom_tat'].strip()))
    L += ['· %s.' % _bo_chu_ngu(p, _giong_so_tay(p, ch['cao_trao'])) for ch in dt['tuyen_truyen'][:k]]
    nl = p['than'].get('nang_luc', [])
    co = [x['mo_ta_so_tay'] for x in nl if LEVELS.index(x['muc']) <= k]
    sau = [x['mo_ta_so_tay'] for x in nl if LEVELS.index(x['muc']) == k + 1]
    noi = lambda xs: '; '.join(x if i == 0 else x[:1].lower() + x[1:] for i, x in enumerate(xs))
    if co: L.append('Đang có: %s.' % noi(co))
    if sau: L.append('Thân hơn nữa: %s.' % noi(sau))
    return '\n'.join(L)

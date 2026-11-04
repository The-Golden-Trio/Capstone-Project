"""Mô phỏng cân bằng xu, buff và sức khoẻ qua cả một nghề.

Chạy từ gốc repo:  python -I "research/research_notes/Kinh tế và sức khoẻ/mo_phong_can_bang.py" [đường dẫn worktree môi trường làm việc]
Mọi tham số là số tạm. Kết quả in ra bảng Markdown.
"""
import csv, json, random, statistics, sys
from collections import defaultdict

sys.stdout.reconfigure(encoding='utf-8')
NOTES = 'research/research_notes/Kinh tế và sức khoẻ/'
ENV_ROOT = sys.argv[1] if len(sys.argv) > 1 and sys.argv[1] != '-' else '../data-moi-truong-lam-viec-be40bc'
RUNS = 300
PRICE_MODE = sys.argv[2] if len(sys.argv) > 2 else 'own'   # own: món tiến độ theo xu của nghề; band: theo X của band
GROUPS = ['giao_tiep_hop_tac', 'tri_tue_cam_xuc', 'lanh_dao_kinh_doanh', 'tu_duy_giai_quyet_van_de',
          'tu_quan_ly_ap_luc', 'thich_ung_hoc_hoi', 'dao_duc_chuyen_nghiep']
JOBS = {
    'Lao động trồng trọt': 'ONET-45-2092.00',
    'Nhân viên phục vụ nhà hàng': 'ONET-35-3031.00',
    'Điều dưỡng': 'ONET-29-1141.00',
    'Lập trình viên Back-end': 'SWE_BACKEND',
}
SKILL = {'yếu': (0.55, 0.35), 'trung bình': (0.70, 0.20), 'giỏi': (0.85, 0.05)}
SIGN = ('giao_tiep_hop_tac', 'thich_ung_hoc_hoi')

# ---- luật (số tạm) ----
N_ACT, BUFFER = 8, 2                      # hoạt động mỗi màn, lượt dự phòng
OT = [(2, 12), (1, 18)]                   # (lượt, sức khoẻ) cho lần 1, lần 2
TIER_TURNS = [(80, 1), (50, 0), (25, -1), (0, -2)]
REST = 10                                 # hồi mỗi khoảng nghỉ, miễn phí
REST_SLOT, SIDE_HEAL = 8, 6               # một suất nghỉ, một nhiệm vụ phụ
SLOTS = 2                                 # suất hoạt động mỗi khoảng nghỉ
CONST, PERM = 0.12, 0.05                  # chòm sao, buff vĩnh viễn của cột mốc
ITEM = {'nhẹ': (0.10, 0.25), 'vừa': (0.20, 0.50), 'mạnh': (0.30, 0.90)}   # (hệ số, giá × X)
CAP_MULT = 0.50                           # trần chung phần cộng thêm
SIDE_SHARE, SIDE_CAP = 0.025, 0.10        # thưởng cố định mỗi nhiệm vụ phụ (không chấm), trần mỗi cấp
TICKET = 0.20                             # vé nhiệm vụ phụ × X
UNLOCK = 0.60
REPLAY_PAY = [1.0, 0.5, 0.25]
OT_PAY = {'tra_them': 0.15, 'theo_san_pham': 0.10, 'phu_cap_co_dinh': 0.0, 'luong_tron_goi': 0.0,
          'ap_luc_khong_luong': 0.0, 'nghi_bu': 0.0, 'khong_ap_dung': 0.0}
OT_ASK = {'it': 0.10, 'theo_dot': 0.35, 'thuong_xuyen': 0.80}
FOOD = [(0.05, 5), (0.10, 8), (0.50, 25)]  # (giá × X, hồi)
GYM = (0.30, 5)
CHECKUP = 0.80
# cột mốc: giá một lần theo X (xu chuẩn của band đang chơi), cấp sớm nhất, buff; không có chi cố định
MILESTONES = {
    'phòng riêng':   dict(price=3, from_lv=2, perm='tu_quan_ly_ap_luc'),
    'báo hiếu':      dict(price=1, from_lv=2, perm='dao_duc_chuyen_nghiep'),   # lần đầu gửi lương về nhà
    'xe máy':        dict(price=4, from_lv=1),
    'CLB công ty':   dict(price=0, from_lv=2, perm='giao_tiep_hop_tac', slots=3),
    'company trip':  dict(price=1, from_lv=2, perm='thich_ung_hoc_hoi'),
    'chứng chỉ':     dict(price=4, from_lv=2, perm='giao_tiep_hop_tac'),
    'portfolio':     dict(price=0, from_lv=2, perm='tu_duy_giai_quyet_van_de', slots=3),
    'thú cưng':      dict(price=2, from_lv=2, perm='tri_tue_cam_xuc', needs='phòng riêng'),
    'mentor':        dict(price=0, from_lv=4, perm='lanh_dao_kinh_doanh', slots=2),
    'nước ngoài':    dict(price=6, from_lv=3, perm='thich_ung_hoc_hoi'),
    'quỹ dự phòng':  dict(price=6, from_lv=2),
    'sổ tiết kiệm':  dict(price=6, from_lv=3, needs='quỹ dự phòng'),
    'căn hộ':        dict(price=8, from_lv=4, needs='phòng riêng'),
}


def load():
    budgets = {r['role_code']: r for r in json.load(open('occupation-data/generated/point_budgets.json', encoding='utf-8'))['roles']}
    coins = defaultdict(dict)
    band_x = defaultdict(list)
    for r in csv.DictReader(open(NOTES + 'luong_quy_xu.csv', encoding='utf-8')):
        if r['xu_moi_man']:
            coins[r['role_code']][int(r['cap'])] = int(r['xu_moi_man'])
            band_x[r['band_equivalent']].append(int(r['xu_moi_man']))
    band_x = {b: statistics.median(v) for b, v in band_x.items()}
    km = {c['role_code']: c for c in json.load(open('occupation-data/generated/keyword_map.json', encoding='utf-8'))['careers']}
    envs = {e['id']: e for e in json.load(open(ENV_ROOT + '/occupation-data/datasets/work_environments.json', encoding='utf-8'))['environments']}
    weights = {r['role_code']: [(p.split(':')[0], int(p.split(':')[1])) for p in r['environments'].split(';')]
               for r in csv.DictReader(open(ENV_ROOT + '/occupation-data/decisions/occupation_work_environments.csv', encoding='utf-8'))}
    jobs = {}
    for name, rc in JOBS.items():
        levels = []
        for i, lv in enumerate(budgets[rc]['levels']):
            k = km[rc]['levels'][i]
            raised = sum(1 for kk, v in k['output'].items() if v > k.get('entry', {}).get(kk, 0))
            levels.append(dict(budget=lv['budget'], m=raised + 1, xu=coins[rc][i + 1],
                               x=band_x[lv['band_equivalent']], months=3 if i == 0 else 12))
        jobs[name] = dict(levels=levels, envs=[(envs[e], w) for e, w in weights[rc]])
    return jobs


def drain(env):
    L = env['levels']
    d = 2
    d += {'truc': 2, 'ca_xoay': 2, 'theo_chuyen': 2}.get(L.get('schedule_type'), 0)
    d += {'vua': 2, 'cao': 4}.get(L.get('physical_risk'), 0)
    d += {'vua': 1, 'cao': 2}.get(L.get('customer_contact'), 0)
    d += 1 if L.get('weekend') in ('xoay_ca_ca_tuan', 'thu_7', 'theo_lich') else 0
    return d


def tier_turns(h):
    return next(t for lim, t in TIER_TURNS if h >= lim)


class Player:
    def __init__(self, skill, strat, rng):
        self.q0, self.slow = SKILL[skill]
        self.strat, self.rng = strat, rng
        self.cash, self.h, self.hmax = 0.0, 80, 100
        self.owned, self.perm = set(), set()
        self.debuff, self.ot_streak, self.gym = False, 0, 0
        self.log = defaultdict(float)
        self.bought_at = {}
        self.exp_bud = defaultdict(float)


def mult(p, g, item_g, item_k):
    extra = (CONST if g in SIGN else 0) + (PERM if g in p.perm else 0) + (item_k if g == item_g else 0)
    return 1 + min(extra, CAP_MULT)


def bottleneck(p, cum_pts, cum_bud):
    exp = p.exp_bud
    return min(GROUPS, key=lambda g: cum_pts[g] / max(exp[g], 1))


def play_mission(p, lv, env, cum_pts, cum_bud, pay_rate, lvl_idx):
    s, X = p.strat, (lv['xu'] if PRICE_MODE == 'own' else lv['x'])
    trần = {g: lv['budget'][g] / lv['m'] for g in GROUPS}
    need = N_ACT * (1 + p.slow)
    turns = N_ACT + BUFFER + tier_turns(p.h)
    tiers_hit = 'kiệt' if p.h < 25 else 'mệt' if p.h < 50 else 'ok'
    p.log['màn'] += 1
    p.log['màn mệt'] += tiers_hit == 'mệt'
    p.log['màn kiệt'] += tiers_hit == 'kiệt'
    # buff trước màn
    bn = bottleneck(p, cum_pts, cum_bud)
    ratio = cum_pts[bn] / p.exp_bud[bn] if p.exp_bud[bn] else 1
    item_g, item_k = None, 0
    pick = None
    if s == 'cày OT' or s == 'tiêu hết':
        pick = 'mạnh'
    elif s == 'cân bằng' and ratio < 0.70:
        pick = 'vừa'
    elif s == 'tiết kiệm' and ratio < 0.63:
        pick = 'nhẹ'
    if pick:
        k, price = ITEM[pick]
        if p.cash >= price * X:
            p.cash -= price * X; p.log['xu buff'] += price * X
            item_g, item_k = bn, k
    # OT
    ot_pay_k = OT_PAY.get(env['levels'].get('overtime_pay'), 0)
    asked = p.rng.random() < OT_ASK[env['levels'].get('overtime_level')]
    n_ot = 0
    for lượt, hp in OT:
        if p.h < 25:
            break
        short = turns < need
        take = {
            'cày OT': short or asked,
            'cân bằng': (short and p.h >= 50) or (asked and ot_pay_k > 0 and p.h >= 70),
            'tiết kiệm': (short and turns < need * 0.9) or (asked and ot_pay_k > 0 and p.h >= 50),
            'tiêu hết': short and p.h >= 40,
        }[s]
        if not take:
            break
        turns += lượt
        p.h -= hp * (0.8 if 'quỹ dự phòng' in p.owned else 1)
        n_ot += 1
        asked = asked and n_ot < 1
    p.log['OT'] += n_ot
    p.ot_streak = p.ot_streak + 1 if n_ot else 0
    if p.ot_streak >= 3:
        p.debuff = True
    p.h -= drain(env)
    p.h = max(p.h, 0)
    c = min(1.0, turns / need)
    pts, raw = {}, {}
    for g in GROUPS:
        q = min(1, max(0, p.rng.gauss(p.q0, 0.10)))
        r = trần[g] * q * c
        raw[g] = r
        pts[g] = min(trần[g] * c, r * mult(p, g, item_g, item_k))
    income = lv['xu'] * pay_rate * (1 + 0.03 * ('sổ tiết kiệm' in p.owned)) * (1 + ot_pay_k * n_ot)
    p.cash += income; p.log['xu kiếm'] += income
    return pts, raw


def break_time(p, lv, lvl_idx, side_left, cum_pts, cum_bud, side_pts):
    s, X = p.strat, (lv['xu'] if PRICE_MODE == 'own' else lv['x'])
    XB = lv['x']
    disc = 0.8 if 'xe máy' in p.owned else 1
    rec = REST * (0.5 if p.debuff else 1) + (5 if 'căn hộ' in p.owned else 0)
    if p.gym > 0:
        rec += GYM[1]; p.gym -= 1
    p.h = min(p.hmax, p.h + rec)
    # suất hoạt động
    slots = SLOTS
    want_h = {'cày OT': 30, 'cân bằng': 60, 'tiết kiệm': 35, 'tiêu hết': 70}[s]
    while slots and side_left[0] > 0 and (s != 'tiết kiệm' or p.h >= want_h):
        ticket = TICKET * X * disc
        if p.cash < ticket:
            break
        p.cash -= ticket; p.log['xu nhiệm vụ phụ'] += ticket
        g = bottleneck(p, cum_pts, cum_bud)
        gain = SIDE_SHARE * lv['budget'][g]
        side_pts[g] += gain; cum_pts[g] += gain
        side_left[0] -= SIDE_SHARE
        p.h = min(p.hmax, p.h + SIDE_HEAL); slots -= 1
    while slots and p.h < want_h:
        p.h = min(p.hmax, p.h + REST_SLOT); slots -= 1
    # khám, ăn, gym
    if p.debuff and p.cash >= CHECKUP * X * disc and s != 'tiết kiệm':
        p.cash -= CHECKUP * X * disc; p.log['xu sức khoẻ'] += CHECKUP * X * disc; p.debuff = False
    if p.debuff and p.ot_streak == 0:
        p.debuff = False
    for price, hp in FOOD:
        while p.h < want_h and p.cash >= price * X * disc:
            p.cash -= price * X * disc; p.log['xu sức khoẻ'] += price * X * disc; p.h = min(p.hmax, p.h + hp)
    if s == 'cân bằng' and p.gym == 0 and p.h < 70 and p.cash >= GYM[0] * X * 4 * disc + X:
        p.cash -= GYM[0] * X * 4 * disc; p.log['xu sức khoẻ'] += GYM[0] * X * 4 * disc; p.gym = 4
    # cột mốc
    order = {
        'cân bằng': ['báo hiếu', 'phòng riêng', 'portfolio', 'xe máy', 'CLB công ty', 'mentor', 'thú cưng', 'company trip', 'quỹ dự phòng', 'căn hộ'],
        'tiết kiệm': ['phòng riêng', 'quỹ dự phòng', 'xe máy', 'portfolio', 'căn hộ', 'mentor', 'sổ tiết kiệm', 'báo hiếu', 'CLB công ty', 'thú cưng', 'company trip'],
        'cày OT': ['xe máy', 'quỹ dự phòng', 'phòng riêng'],
        'tiêu hết': [],
    }[s]
    reserve = {'cân bằng': 0.5 * XB, 'tiết kiệm': 0, 'cày OT': 2 * XB}.get(s, 0)
    for m in order:
        spec = MILESTONES[m]
        if m in p.owned or lvl_idx + 1 < spec['from_lv'] or (spec.get('needs') and spec['needs'] not in p.owned):
            continue
        if spec.get('slots'):
            if slots >= 1:
                slots -= 1
                p.log[f'suất {m}'] += 1
                if p.log[f'suất {m}'] >= spec['slots']:
                    p.owned.add(m); p.bought_at[m] = lvl_idx + 1
                    p.perm.add(spec['perm'])
            continue
        price = spec['price'] * XB
        if p.cash - price >= reserve:
            p.cash -= price; p.log['xu cột mốc'] += price
            p.owned.add(m); p.bought_at[m] = lvl_idx + 1
            if spec.get('perm'):
                p.perm.add(spec['perm'])
        else:
            break
    if s == 'tiêu hết' and p.cash > 1.5 * X:
        spend = p.cash - 1.5 * X
        p.cash -= spend; p.log['xu trang trí'] += spend


def run(job, skill, strat, seed):
    rng = random.Random(seed)
    p = Player(skill, strat, rng)
    cum_pts = defaultdict(float); cum_bud = defaultdict(float); cum_raw = defaultdict(float)
    replays = stuck = 0
    for li, lv in enumerate(job['levels']):
        if li > 0:
            tries = 0
            while any(cum_pts[g] < UNLOCK * cum_bud[g] for g in GROUPS) and tries < 8:
                # chơi lại màn kém nhất của cấp trước
                prev = job['levels'][li - 1]
                k = min(range(prev['m']), key=lambda i: sum(best[i].values()))
                env = rng.choices([e for e, _ in job['envs']], [w for _, w in job['envs']])[0]
                pay = REPLAY_PAY[min(plays[k], 2)]; plays[k] += 1
                pts, raw = play_mission(p, prev, env, cum_pts, cum_bud, pay, li - 1)
                for g in GROUPS:
                    if pts[g] > best[k][g]:
                        cum_pts[g] += pts[g] - best[k][g]; best[k][g] = pts[g]
                    if raw[g] > best_raw[k][g]:
                        cum_raw[g] += raw[g] - best_raw[k][g]; best_raw[k][g] = raw[g]
                break_time(p, prev, li - 1, [0], cum_pts, cum_bud, defaultdict(float))
                replays += 1; tries += 1
            if any(cum_pts[g] < UNLOCK * cum_bud[g] for g in GROUPS):
                stuck = 1
                break
        env = rng.choices([e for e, _ in job['envs']], [w for _, w in job['envs']])[0]
        if li > 0:
            p.h = max(p.h, 70)
            p.cash += 0.5 * lv['xu']; p.log['xu kiếm'] += 0.5 * lv['xu']   # thưởng Tết, lương tháng 13
        for g in GROUPS:
            cum_bud[g] += lv['budget'][g]
        best = [{g: 0.0 for g in GROUPS} for _ in range(lv['m'])]
        best_raw = [{g: 0.0 for g in GROUPS} for _ in range(lv['m'])]
        plays = [1] * lv['m']
        side_left = [SIDE_CAP]
        side_pts = defaultdict(float)
        for i in range(lv['m']):
            pts, raw = play_mission(p, lv, env, cum_pts, cum_bud, 1.0, li)
            best[i] = pts; best_raw[i] = raw
            for g in GROUPS:
                p.exp_bud[g] += lv['budget'][g] / lv['m']
            for g in GROUPS:
                cum_pts[g] += pts[g]; cum_raw[g] += raw[g]
            break_time(p, lv, li, side_left, cum_pts, cum_bud, side_pts)
    share = {g: cum_pts[g] / cum_bud[g] for g in GROUPS}
    share_raw = {g: cum_raw[g] / cum_bud[g] for g in GROUPS}
    return dict(pct=statistics.mean(share.values()), pct_min=min(share.values()),
                pct_raw=statistics.mean(share_raw.values()), replays=replays, stuck=stuck,
                tired=(p.log['màn mệt'] + p.log['màn kiệt']) / p.log['màn'], exhausted=p.log['màn kiệt'] / p.log['màn'],
                ot=p.log['OT'] / p.log['màn'], earned=p.log['xu kiếm'], buff=p.log['xu buff'],
                health=p.log['xu sức khoẻ'], miles=p.log['xu cột mốc'], decor=p.log['xu trang trí'],
                bought=dict(p.bought_at), n_perm=len(p.perm), n_miles=len(p.owned), cash=p.cash, n_levels=len(job['levels']))


def main():
    jobs = load()
    print('| Nghề | Mức chơi | Kiểu | % quỹ (có buff) | % quỹ gốc | Nhóm thấp nhất | Chơi lại | Kẹt | Màn mệt/kiệt | OT mỗi màn | Xu kiếm | Buff | Sức khoẻ | Cột mốc | Xu còn | Số cột mốc | Buff vĩnh viễn | Phòng riêng | Xe máy | Căn hộ |')
    print('|' + '---|' * 20)
    for jn, job in jobs.items():
        for sk in SKILL:
            for st in ['cày OT', 'cân bằng', 'tiết kiệm', 'tiêu hết']:
                rs = [run(job, sk, st, seed) for seed in range(RUNS)]
                m = lambda k: statistics.mean(r[k] for r in rs)
                def at(name):
                    v = [r['bought'][name] for r in rs if name in r['bought']]
                    return f"{statistics.median(v):.0f} ({len(v) / RUNS:.0%})" if v else '—'
                print(f"| {jn} | {sk} | {st} | {m('pct'):.0%} | {m('pct_raw'):.0%} | {m('pct_min'):.0%} | {m('replays'):.1f} | {m('stuck'):.0%} | "
                      f"{m('tired'):.0%} / {m('exhausted'):.0%} | {m('ot'):.2f} | {m('earned'):.0f} | {m('buff'):.0f} | {m('health'):.0f} | {m('miles'):.0f} | "
                      f"{m('cash'):.0f} | {m('n_miles'):.1f} | {m('n_perm'):.1f} | {at('phòng riêng')} | {at('xe máy')} | {at('căn hộ')} |")


if __name__ == '__main__':
    main()

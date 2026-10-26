"""Dựng thang cấp cho 199 nghề ngoài IT, quỹ điểm soft skill và điều kiện bậc để vào từng cấp của cả 221 nghề.

Đầu vào:
- datasets/final_22_roles.json (thang cấp 22 nghề IT)
- research/research_notes/Thang cấp nghề/thang_cap_nhom_{A,B}.csv (thang cấp nghề ngoài IT, có nguồn)
- research/research_notes/Thang cấp nghề/nghe_di_truoc.csv (nghề cấp cao và nghề chuyển ngang: nghề đi trước, band cần đạt)
- external/onet_31_0/ (thêm essential_skills, transferable_skills để tính độ khó)
Đầu ra: generated/levels_non_it.json, generated/point_budgets.json, generated/point_budgets.md

Luật (khối "Điểm và mở khoá" của đề xuất game design):
- Độ khó k = 1 + chuẩn hoá (p5–p95) của mức trung bình O*NET đòi ở 35 kỹ năng, trọng số theo độ quan trọng; k trong [1, 2].
- Thang cấp ngoài IT đánh số band liền nhau; band thật (tương đương với nghề khác) giữ ở "band_equivalent".
- Quỹ một cấp = quỹ gốc của band tương đương × 5.000/6.700 × k^1,4, chia cho 7 nhóm theo trọng số nghề (2^z / max);
  2 nhóm trọng tâm của cấp nhân 1,6 rồi chuẩn hoá lại để tổng quỹ của cấp không đổi. Hồ sơ mỗi nhóm tối đa 10.000.
- Bậc 0 đến 5. Vào một cấp cần mọi nhóm đạt bậc mà người chơi đạt 60% quỹ các cấp trước sẽ có (nhóm cần bậc 0 thì không ghi).
- Điểm soft skill dùng chung giữa các nghề, không quy đổi; nghề khó đòi bậc cao hơn vì quỹ lớn hơn.
- Nghề cấp cao và nghề chuyển ngang (ngoại lệ của BR-01): cấp đầu không mở sẵn. Muốn vào phải đã xong một cấp có band
  tương đương ≥ band cấp đầu − 1 ở một nghề đi trước, và đủ bậc mà người chơi đạt 60% có được khi đi tới đó (mỗi nhóm lấy
  quỹ ít nhất trong các nghề đi trước, nên đi đường nào đúng luật cũng vào được); các cấp sau cộng tiếp từ quỹ đó.
"""
import csv
import json
import statistics
from pathlib import Path

from build_onet_profiles import ROLES, SOFT_GROUPS, ATTRIBUTION, EXTERNAL, GENERATED, ROOT, load as load_onet, zscores, soft_profile

REPO = ROOT.parent
LADDER_DIR = REPO / "research" / "research_notes" / "Thang cấp nghề"
PREREQ_FILE = LADDER_DIR / "nghe_di_truoc.csv"
BAND_BASE = {"L1": 300, "L2": 500, "L3": 700, "L4": 900, "L5": 1100, "L6": 1400, "L7": 1800, "L8": 2200, "L9": 2700}
TOP_BUDGET = 5000
BAND_SCALE = TOP_BUDGET / sum(BAND_BASE[f"L{i}"] for i in range(1, 8))
K_POWER = 1.4
PROFILE_CAP = 10000
FOCUS_BOOST = 1.6
ENTRY_SHARE = 0.6
RANKS = [0, 500, 1500, 3000, 6000, 10000]  # bậc 0 đến bậc 5
GROUPS = [g["id"] for g in SOFT_GROUPS]
NAMES = {g["id"]: g["name"] for g in SOFT_GROUPS}


def rank(points):
    return max(i for i, t in enumerate(RANKS) if min(points, PROFILE_CAP) >= t)


def tier(k):
    return "dễ" if k < 1.4 else "vừa" if k < 1.75 else "khó" if k < 1.9 else "rất khó"


def focus_groups(band, top):
    n = int(band[1:])
    if n <= 2:
        return ["thich_ung_hoc_hoi", "dao_duc_chuyen_nghiep"]
    if n <= 5:
        return top[:2]
    lead = "lanh_dao_kinh_doanh"
    if n <= 7:
        return [lead, top[0] if top[0] != lead else top[1]]
    return [lead, "giao_tiep_hop_tac"]


def r10(x):
    return int(round(x / 10.0)) * 10


def read_csv(path):
    with open(path, encoding="utf-8-sig", newline="") as fh:
        return list(csv.DictReader(fh))


def difficulty():
    level = {}
    for name in ("essential_skills", "transferable_skills"):
        for r in read_csv(EXTERNAL / f"{name}.csv"):
            level.setdefault(r["O*NET-SOC Code"], {}).setdefault(r["Element Name"], {})[r["Scale ID"]] = float(r["Data Value"])
    score = {}
    for code, elements in level.items():
        pairs = [((v["IM"] - 1) / 4, v["LV"]) for v in elements.values() if "IM" in v and "LV" in v]
        weight = sum(w for w, _ in pairs)
        if weight:
            score[code] = sum(w * lv for w, lv in pairs) / weight
    ordered = sorted(score.values())
    p5, p95 = ordered[int(0.05 * len(ordered))], ordered[int(0.95 * len(ordered))]
    return {c: 1 + min(1.0, max(0.0, (s - p5) / (p95 - p5))) for c, s in score.items()}, (p5, p95)


def careers():
    it = json.loads((ROOT / "datasets" / "final_22_roles.json").read_text(encoding="utf-8"))
    it = it["roles"] if isinstance(it, dict) else it
    onet_codes = {code: codes for code, _, codes, _ in ROLES}
    out = []
    for r in it:
        out.append({
            "role_code": r["role_code"], "name_vn": r["role_name_vn"], "is_it": True, "onet": onet_codes[r["role_code"]],
            "levels": [{"band": l["band"], "band_equivalent": l["band"], "title_vn": l["title_vn"], "years_experience": l.get("years_experience")} for l in r["levels"]],
        })
    names = {r["role_code"]: r for r in read_csv(LADDER_DIR / "danh_sach_199_nghe.csv")}
    rows = read_csv(LADDER_DIR / "thang_cap_nhom_A.csv") + read_csv(LADDER_DIR / "thang_cap_nhom_B.csv")
    ladders = {}
    for r in rows:
        ladders.setdefault(r["role_code"], []).append({k: r[k] for k in ("band", "title_vn", "years_experience", "core_output", "basis", "evidence")})
    for code, levels in sorted(ladders.items()):
        levels.sort(key=lambda l: int(l["band"][1:]))
        start = int(levels[0]["band"][1:])
        for n, l in enumerate(levels):
            l["band_equivalent"] = l["band"]
            l["band"] = f"L{start + n}"
        out.append({
            "role_code": code, "name_vn": names[code]["ten_vn"], "group_vn": names[code]["nhom_nganh"], "is_it": False,
            "onet": [code.removeprefix("ONET-")], "levels": levels,
        })
    return out


def build():
    k_of, (p5, p95) = difficulty()
    _, _, activities, styles = load_onet()
    za, zs = zscores(activities), zscores(styles)
    prereq = {r["role_code"]: r for r in read_csv(PREREQ_FILE)}
    staged = []
    for c in careers():
        codes = [x for x in c["onet"] if x in k_of and x in za and x in zs]
        k = statistics.mean(k_of[x] for x in codes)
        soft = {g: statistics.mean(soft_profile(x, za, zs)[g] for x in codes) for g in GROUPS}
        raw = {g: 2 ** soft[g] for g in GROUPS}
        top_raw = max(raw.values())
        weights = {g: raw[g] / top_raw for g in GROUPS}
        top3 = sorted(GROUPS, key=lambda g: -weights[g])[:3]
        def budget_of(band):
            focus = focus_groups(band, top3)
            boosted = {g: weights[g] * (FOCUS_BOOST if g in focus else 1) for g in GROUPS}
            norm = sum(weights.values()) / sum(boosted.values())
            base = BAND_BASE[band] * BAND_SCALE * k ** K_POWER
            return focus, {g: r10(base * boosted[g] * norm) for g in GROUPS}

        p = prereq.get(c["role_code"])
        extra = {"prerequisite": {"type": p["loai"], "band": p["band_can"], "careers": p["nghe_di_truoc"].split(";")}} if p else {}
        staged.append((c, k, weights, top3, extra, [budget_of(l["band_equivalent"]) for l in c["levels"]]))

    by_code = {c["role_code"]: (c, budgets, extra) for c, _, _, _, extra, budgets in staged}
    arrival = {}

    def arrive(code):
        """Quỹ ít nhất (từng nhóm) mà người chơi đã đi qua khi tới band cần đạt ở một nghề đi trước."""
        if code not in arrival:
            c, _, extra = by_code[code]
            paths = []
            for f in extra["prerequisite"]["careers"]:
                fc, fbudgets, fextra = by_code[f]
                total = dict(arrive(f)) if fextra else {g: 0.0 for g in GROUPS}
                for l, (_, b) in zip(fc["levels"], fbudgets):
                    for g in GROUPS:
                        total[g] += b[g]
                    if int(l["band_equivalent"][1:]) >= int(extra["prerequisite"]["band"][1:]):
                        break
                paths.append(total)
            arrival[code] = {g: min(t[g] for t in paths) for g in GROUPS}
        return arrival[code]

    result = []
    for c, k, weights, top3, extra, level_budgets in staged:
        cumulative = dict(arrive(c["role_code"])) if extra else {g: 0.0 for g in GROUPS}
        if extra:
            extra = {**extra, "arrival_points": {g: r10(v) for g, v in cumulative.items()}}
        levels = []
        for l, (focus, budget) in zip(c["levels"], level_budgets):
            needed = {g: rank(ENTRY_SHARE * cumulative[g]) for g in GROUPS}
            requirement = {g: b for g, b in sorted(needed.items(), key=lambda x: -x[1]) if b > 0}
            levels.append({**l, "focus": focus, "budget": budget, "requirement": requirement})
            for g in GROUPS:
                cumulative[g] += budget[g]
        own = {g: sum(b[g] for _, b in level_budgets) for g in GROUPS}
        result.append({**c, "k": round(k, 2), "tier": tier(round(k, 2)), "weights": {g: round(w, 2) for g, w in weights.items()}, "top3": top3,
                       **extra, "career_budget": {g: r10(v) for g, v in own.items()}, "levels": levels})
    return result, (p5, p95)


def blocked_at(career, share, buff=()):
    """Chơi riêng nghề này với tỉ lệ đạt `share` của quỹ mỗi màn: bị chặn ở cấp nào (None nếu đi hết).
    `buff`: các nhóm được chòm sao nhân 1,12 phần dương. Nghề có nghề đi trước: coi như đã đi qua nghề đi trước cùng tỉ lệ."""
    prior = career.get("arrival_points", {})
    have = {g: prior.get(g, 0) * share * (1.12 if g in buff else 1) for g in GROUPS}
    for l in career["levels"]:
        if any(rank(have[g]) < b for g, b in l["requirement"].items()):
            return l["band"]
        for g in GROUPS:
            have[g] += l["budget"][g] * share * (1.12 if g in buff else 1)
    return None


def finish_rank(career, share):
    main = career["top3"][0]
    total = (career.get("arrival_points", {}).get(main, 0) + sum(l["budget"][main] for l in career["levels"])) * share
    return rank(total)


def dec(x, digits):
    return f"{x:.{digits}f}".replace(".", ",")


def markdown(data, p):
    from collections import Counter, defaultdict
    num = lambda v: f"{v:,}".replace(",", ".")
    lines = [
        "# Quỹ điểm soft skill và điều kiện vào cấp, 221 nghề",
        "",
        f"Sinh bởi `occupation-data/scripts/build_point_budgets.py`. Độ khó k từ O\\*NET 31.0 (p5 = {dec(p[0], 2)}, p95 = {dec(p[1], 2)}).",
        "",
        f"- Bậc: " + " · ".join(f"bậc {i} từ {num(t)}" for i, t in enumerate(RANKS)) + f"; mỗi nhóm tối đa {num(PROFILE_CAP)}.",
        f"- Quỹ một cấp = quỹ gốc của band tương đương × {dec(BAND_SCALE, 3)} × k^{dec(K_POWER, 1)}; 2 nhóm trọng tâm của cấp × {dec(FOCUS_BOOST, 1)}, tổng quỹ của cấp giữ nguyên.",
        f"- Điều kiện vào cấp: mọi nhóm cần bậc mà người chơi đạt {int(ENTRY_SHARE * 100)}% quỹ các cấp trước sẽ có; nhóm cần bậc 0 thì không ghi. Điểm dùng chung giữa các nghề, không quy đổi.",
        "",
        "## Kiểm tra trên 221 nghề, chơi riêng một nghề",
        "",
        "| Hạng | Số nghề | Bậc nhóm chính cần ở cấp cuối | Chơi 60% đi hết | Chơi 50% (đạt) đi hết | Chơi 75% (tốt): nhóm chính khi xong nghề |",
        "|---|---|---|---|---|---|",
    ]
    by_tier = defaultdict(list)
    for c in data:
        by_tier[c["tier"]].append(c)
    for t in ("dễ", "vừa", "khó", "rất khó"):
        cs = by_tier[t]
        last = Counter(c["levels"][-1]["requirement"][c["top3"][0]] for c in cs)
        fin = Counter(finish_rank(c, 0.75) for c in cs)
        lines.append(f"| {t} | {len(cs)} | " + ", ".join(f"bậc {b}: {n}" for b, n in sorted(last.items()))
                     + f" | {sum(blocked_at(c, ENTRY_SHARE + 1e-9) is None for c in cs)} | {sum(blocked_at(c, 0.5) is None for c in cs)} | "
                     + ", ".join(f"bậc {b}: {n}" for b, n in sorted(fin.items())) + " |")
    no_buff = sum(blocked_at(c, 0.55) is None for c in data)
    buffed = sum(blocked_at(c, 0.55, buff=c["top3"][:2]) is None for c in data)
    lines += ["", f"Chòm sao: chơi 55%, không buff thì {no_buff}/221 nghề đi hết; buff đúng 2 nhóm chính của nghề thì {buffed}/221.", ""]
    names = {c["role_code"]: c["name_vn"] for c in data}
    lines += ["## Nghề cấp cao và nghề chuyển ngang", "",
              f"Cấp đầu không mở sẵn (ngoại lệ của BR-01). Nguồn: `{PREREQ_FILE.relative_to(REPO).as_posix()}`.", "",
              "| Nghề | Loại | Cấp đầu | Cần đã xong | Ở một trong các nghề | Bậc cần ở cấp đầu |", "|---|---|---|---|---|---|"]
    for c in data:
        p = c.get("prerequisite")
        if p:
            lines.append(f"| {c['name_vn']} | {'cấp cao' if p['type'] == 'cap_cao' else 'chuyển ngang'} | {c['levels'][0]['band_equivalent']} | {p['band']} | "
                         + "; ".join(names[x] for x in p["careers"]) + " | "
                         + "; ".join(f"{NAMES[g]} bậc {b}" for g, b in c["levels"][0]["requirement"].items()) + " |")
    lines += ["", "## Từng nghề", "", "| Nghề | k | Hạng | Cấp | Điều kiện vào cấp cuối |", "|---|---|---|---|---|"]
    for c in sorted(data, key=lambda c: -c["k"]):
        last = c["levels"][-1]
        lines.append(f"| {c['name_vn']} | {dec(c['k'], 2)} | {c['tier']} | {c['levels'][0]['band']}–{last['band']}"
                     + (f" (cuối ≈ {last['band_equivalent']})" if last['band_equivalent'] != last['band'] else "")
                     + " | " + "; ".join(f"{NAMES[g]} bậc {b}" for g, b in last["requirement"].items()) + " |")
    lines += ["", "## Nguồn", ""] + [f"- {a}" for a in ATTRIBUTION]
    return "\n".join(lines) + "\n"


def main():
    data, p = build()
    non_it = [{k: c[k] for k in ("role_code", "name_vn", "group_vn", "levels")} for c in data if not c["is_it"]]
    for c in non_it:
        c["levels"] = [{k: l[k] for k in ("band", "band_equivalent", "title_vn", "years_experience", "core_output", "basis", "evidence")} for l in c["levels"]]
    GENERATED.mkdir(parents=True, exist_ok=True)
    (GENERATED / "levels_non_it.json").write_text(json.dumps({"source": "research/research_notes/Thang cấp nghề/", "roles": non_it}, ensure_ascii=False, indent=2), encoding="utf-8")
    (GENERATED / "point_budgets.json").write_text(json.dumps({"attribution": ATTRIBUTION, "roles": data}, ensure_ascii=False, indent=2), encoding="utf-8")
    (GENERATED / "point_budgets.md").write_text(markdown(data, p), encoding="utf-8")
    print("wrote levels_non_it.json, point_budgets.json, point_budgets.md for", len(data), "careers")


if __name__ == "__main__":
    main()

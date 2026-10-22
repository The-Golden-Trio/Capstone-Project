"""Dựng bản đồ keyword kỹ năng cứng cho 221 nghề và bảng quy đổi keyword giữa các nghề.

Đầu vào (occupation-data/external/onet_31_0/): knowledge, essential_skills, transferable_skills, task_statements,
tasks_to_dwas, gwas_to_iwas_to_dwas, related_occupations, occupation_data; generated/point_budgets.json (thang cấp 221 nghề);
research/research_notes/Bản đồ keyword/ten_keyword_vi.csv (tên tiếng Việt, nếu có).
Đầu ra: generated/keyword_map.json, generated/keyword_map.md, generated/keyword_elements_en.csv (danh sách cần đặt tên).

Luật (khối G1 của đề xuất game design; nguồn ở research/research_notes/Bản đồ keyword/):
- Kho keyword = 33 mảng kiến thức + 13 kỹ năng kỹ thuật của O*NET + các hoạt động trung gian (IWA) thuộc nhóm hoạt động
  không trùng soft skill. Một nghề "dùng" một keyword khi RCA > 1 (kiến thức, kỹ năng: theo Importance; IWA: theo số nhiệm vụ cốt lõi).
- Mỗi nghề 6–10 keyword: tối đa 4 kiến thức hoặc kỹ năng kỹ thuật, còn lại là IWA.
- Quy đổi một chiều s(A→B) = P(B dùng | A dùng) trên mọi nghề O*NET; giữ cặp có z siêu bội ≥ 3.
  Tín chỉ: cùng keyword 1; s ≥ 0,75 → 0,5; 0,5 ≤ s < 0,75 → 0,25; còn lại 0. Mức quy đổi lấy lớn nhất, không cộng dồn.
"""
import csv
import json
import math
import statistics
from collections import Counter, defaultdict

from build_onet_profiles import ATTRIBUTION, EXTERNAL, GENERATED, ROOT, ROLES

REPO = ROOT.parent
KW_DIR = REPO / "research" / "research_notes" / "Bản đồ keyword"
NAMES_FILE = KW_DIR / "ten_keyword_vi.csv"
IT_FILE = KW_DIR / "keyword_it.csv"
IT_ONET_FILE = KW_DIR / "keyword_it_onet.csv"

TECH_SKILLS = [
    "Operations Analysis", "Technology Design", "Equipment Selection", "Installation", "Programming",
    "Operations Monitoring", "Operation and Control", "Equipment Maintenance", "Troubleshooting", "Repairing",
    "Quality Control Analysis", "Systems Analysis", "Systems Evaluation",
]
DROP_KNOWLEDGE = {"English Language", "Customer and Personal Service", "Administration and Management", "Personnel and Human Resources"}
# Nhóm hoạt động cha (GWA) thuần giao tiếp, quan hệ, quản lý người, lập kế hoạch: đã nằm trong 7 nhóm soft skill.
SOFT_GWAS = {
    "Communicating with Supervisors, Peers, or Subordinates", "Communicating with People Outside the Organization",
    "Establishing and Maintaining Interpersonal Relationships", "Selling or Influencing Others",
    "Resolving Conflicts and Negotiating with Others", "Performing for or Working Directly with the Public",
    "Coordinating the Work and Activities of Others", "Developing and Building Teams",
    "Guiding, Directing, and Motivating Subordinates", "Coaching and Developing Others", "Staffing Organizational Units",
    "Scheduling Work and Activities", "Organizing, Planning, and Prioritizing Work",
    "Updating and Using Relevant Knowledge", "Developing Objectives and Strategies",
    "Interpreting the Meaning of Information for Others", "Monitoring and Controlling Resources",
}
MAX_BASE = 4
TARGET = (6, 10)
MIN_OCC = 5
Z_MIN = 3.0
CREDIT = [(0.75, 0.5), (0.5, 0.25)]


def read(name):
    with open(EXTERNAL / f"{name}.csv", encoding="utf-8-sig", newline="") as fh:
        return list(csv.DictReader(fh))


def rca(table):
    """table[occ][element] = giá trị dương. RCA = (x_oe / Σ_e x_oe) / (Σ_o x_oe / Σ x)."""
    occ_tot = {o: sum(v.values()) for o, v in table.items()}
    el_tot = defaultdict(float)
    for v in table.values():
        for e, x in v.items():
            el_tot[e] += x
    grand = sum(occ_tot.values())
    return {o: {e: (x / occ_tot[o]) / (el_tot[e] / grand) for e, x in v.items() if x > 0} for o, v in table.items()}


def load():
    titles = {r["O*NET-SOC Code"]: r["Title"] for r in read("occupation_data")}
    imp, lvl = defaultdict(dict), defaultdict(dict)
    for name in ("knowledge", "essential_skills", "transferable_skills"):
        for r in read(name):
            e = r["Element Name"]
            if (name == "knowledge" and e in DROP_KNOWLEDGE) or (name != "knowledge" and e not in TECH_SKILLS):
                continue
            key = ("K:" if name == "knowledge" else "S:") + e
            if r["Scale ID"] == "IM":
                imp[r["O*NET-SOC Code"]][key] = float(r["Data Value"])
            elif r["Scale ID"] == "LV":
                lvl[r["O*NET-SOC Code"]][key] = float(r["Data Value"])
    core = {r["Task ID"] for r in read("task_statements") if r["Task Type"] == "Core"}
    tree = {r["DWA Element ID"]: r for r in read("gwas_to_iwas_to_dwas")}
    iwa = defaultdict(Counter)
    for r in read("tasks_to_dwas"):
        t = tree.get(r["DWA Element ID"])
        if r["Task ID"] in core and t and t["GWA Element Name"] not in SOFT_GWAS:
            iwa[r["O*NET-SOC Code"]]["I:" + t["IWA Element Name"]] += 1
    related = defaultdict(set)
    for r in read("related_occupations"):
        if r["Relatedness Tier"].startswith("Primary"):
            related[r["O*NET-SOC Code"]].add(r["Related O*NET-SOC Code"])
    return titles, imp, lvl, iwa, related


def usage(imp, iwa):
    """Phần tử nào mỗi nghề "dùng" (RCA > 1, kiến thức và kỹ năng thêm điều kiện Importance ≥ 3)."""
    r_base = rca({o: {e: max(0.0, v - 1) for e, v in d.items()} for o, d in imp.items()})
    r_iwa = rca({o: dict(c) for o, c in iwa.items()})
    used = defaultdict(dict)
    for o, d in r_base.items():
        for e, x in d.items():
            if x > 1 and imp[o][e] >= 3:
                used[o][e] = x
    for o, d in r_iwa.items():
        for e, x in d.items():
            if x > 1:
                used[o][e] = x * iwa[o][e]
    return used


def conversion(used):
    occs = list(used)
    n = len(occs)
    count = Counter(e for o in occs for e in used[o])
    keep = {e for e, c in count.items() if c >= MIN_OCC}
    pair = Counter()
    for o in occs:
        es = sorted(e for e in used[o] if e in keep)
        for i, a in enumerate(es):
            for b in es[i + 1:]:
                pair[(a, b)] += 1
    out = {}
    for (a, b), nab in pair.items():
        for x, y in ((a, b), (b, a)):
            na, nb = count[x], count[y]
            expected = na * nb / n
            var = expected * (1 - na / n) * (n - nb) / (n - 1)
            z = (nab - expected) / math.sqrt(var) if var > 0 else 0
            s = nab / na
            credit = next((c for t, c in CREDIT if s >= t), 0)
            if z >= Z_MIN and credit:
                out.setdefault(x, {})[y] = {"s": round(s, 3), "z": round(z, 1), "credit": credit}
    return out, count


def select(o, imp, lvl, used, iwa_count):
    """6–10 keyword cho một mã O*NET: kiến thức và kỹ năng kỹ thuật theo Importance × Level, rồi IWA theo trọng số."""
    u = used.get(o, {})
    base = sorted((e for e in u if e[:2] in ("K:", "S:")), key=lambda e: -imp[o][e] * lvl[o].get(e, 0))[:MAX_BASE]
    acts = sorted((e for e in u if e.startswith("I:")), key=lambda e: (-iwa_count[o][e], -u[e]))
    solid = [e for e in acts if iwa_count[o][e] >= 2]
    acts = (solid if len(solid) + len(base) >= TARGET[0] else acts)[: TARGET[1] - len(base)]
    picked = [x for pair in zip(acts, base) for x in pair] + acts[len(base):] + base[len(acts):]
    if len(picked) < TARGET[0]:
        extra = sorted((e for e in imp.get(o, {}) if e not in picked), key=lambda e: -imp[o][e] * lvl[o].get(e, 0))
        picked += extra[: TARGET[0] - len(picked)]
    return picked


def max_level(o, e, imp, lvl, pct):
    if e.startswith("I:"):
        return 3
    v = lvl[o].get(e, 0)
    return 3 if v >= pct[e][1] else 2 if v >= pct[e][0] else 1


def schedule(keys, maxes, n):
    """Chia các lần lên mức cho n cấp: cấp i (i ≥ 1) có đầu ra; đầu vào cấp i = đầu ra cộng dồn tới cấp i−1."""
    steps = [k for lvl in (1, 2, 3) for k in keys if maxes[k] >= lvl]
    have, levels = {}, []
    per = [len(steps) * (i + 1) // n - len(steps) * i // n for i in range(n)]
    pos = 0
    for i in range(n):
        entry = dict(have)
        for k in steps[pos:pos + per[i]]:
            have[k] = have.get(k, 0) + 1
        pos += per[i]
        levels.append({"entry": entry, "output": dict(have)})
    return levels


def coverage(have, need, conv, equiv=None):
    """Độ phủ = Σ min(mức quy đổi, mức cần) / Σ mức cần. Keyword IT và phần tử O*NET tương đương tính là một (tín chỉ 1)."""
    equiv = equiv or {}
    expanded = dict(have)
    for a, la in have.items():
        for e in equiv.get(a, ()):
            expanded[e] = max(expanded.get(e, 0), la)

    def best(b):
        value = expanded.get(b, 0)
        for a, la in expanded.items():
            c = conv.get(a, {}).get(b)
            if c:
                value = max(value, la * c["credit"])
        return value

    total = sum(need.values())
    got = 0.0
    for b, lv in need.items():
        value = max([best(b)] + [best(e) for e in equiv.get(b, ())])
        got += min(value, lv)
    return got / total if total else 1.0


def auc(pos, neg):
    """Diện tích dưới đường ROC qua thứ hạng (Mann–Whitney), xử lý điểm bằng nhau bằng hạng trung bình."""
    allv = sorted([(v, 1) for v in pos] + [(v, 0) for v in neg])
    rank_sum, i = 0.0, 0
    while i < len(allv):
        j = i
        while j < len(allv) and allv[j][0] == allv[i][0]:
            j += 1
        avg = (i + j + 1) / 2
        rank_sum += avg * sum(1 for k in range(i, j) if allv[k][1])
        i = j
    n1, n0 = len(pos), len(neg)
    return (rank_sum - n1 * (n1 + 1) / 2) / (n1 * n0)


def markdown(data):
    v = data["validation"]
    pct = lambda x: f"{x * 100:.1f}%".replace(".", ",")
    lines = [
        "# Bản đồ keyword kỹ năng cứng, 221 nghề",
        "",
        "Sinh bởi `occupation-data/scripts/build_keyword_map.py`. Nghề IT dùng 22 keyword của nhóm; nghề ngoài IT lấy từ O\\*NET 31.0 "
        "(kiến thức, kỹ năng kỹ thuật, hoạt động trung gian không trùng soft skill). Tên tiếng Việt ở `research/research_notes/Bản đồ keyword/ten_keyword_vi.csv`.",
        "",
        f"- Kho keyword: {data['vocabulary_size']}; cặp quy đổi có tín chỉ: {sum(len(x) for x in data['conversion'].values())}.",
        "",
        "## Kiểm định trên 878 nghề O\\*NET",
        "",
        "Độ phủ keyword (nghề nguồn ở mức cao nhất) cho nghề đích; so nghề liên quan tầng Primary của O\\*NET với các nghề còn lại.",
        "",
        "| Cách tính | AUC | Độ phủ trung bình, nghề liên quan | Độ phủ trung bình, nghề khác | Đạt 50%, nghề liên quan | Đạt 50%, nghề khác |",
        "|---|---|---|---|---|---|",
    ]
    for k, label in (("conv", "Có quy đổi"), ("exact", "Chỉ keyword trùng")):
        r = v[k]
        lines.append(f"| {label} | {str(r['auc']).replace('.', ',')} | {pct(r['mean_related'])} | {pct(r['mean_other'])} | {pct(r['pass50_related'])} | {pct(r['pass50_other'])} |")
    lines += ["", "## Từng nghề", "", "| Nghề | Keyword (mức cao nhất) |", "|---|---|"]
    for c in data["careers"]:
        kws = "; ".join(f"{k['ten_vi'] or k['element']} ({k['max_level']})" for k in c["keywords"]) or "Chưa có dữ liệu O\\*NET"
        lines.append(f"| {c['name_vn']} | {kws} |")
    lines += ["", "## Nguồn", ""] + [f"- {a}" for a in data["attribution"]]
    return "\n".join(lines) + "\n"


def main():
    titles, imp, lvl, iwa, related = load()
    used = usage(imp, iwa)
    conv, count = conversion(used)
    pct = {}
    for e in {e for d in lvl.values() for e in d}:
        vals = sorted(d[e] for d in lvl.values() if e in d)
        pct[e] = (vals[len(vals) // 3], vals[2 * len(vals) // 3])

    # Kiểm định: độ phủ keyword (mức tối đa của nghề nguồn) cho nghề đích, nghề liên quan Primary so với nghề khác
    codes = sorted(o for o in used if o in related)
    sets = {o: {e: max_level(o, e, imp, lvl, pct) for e in select(o, imp, lvl, used, iwa)} for o in codes}
    res = {"conv": ([], []), "exact": ([], [])}
    for o in codes:
        for t in codes:
            if t == o:
                continue
            bucket = 0 if t in related[o] else 1
            res["conv"][bucket].append(coverage(sets[o], sets[t], conv))
            res["exact"][bucket].append(coverage(sets[o], sets[t], {}))
    validation = {k: {"auc": round(auc(*v), 3), "mean_related": round(statistics.mean(v[0]), 3), "mean_other": round(statistics.mean(v[1]), 3),
                      "pass50_related": round(sum(x >= 0.5 for x in v[0]) / len(v[0]), 3), "pass50_other": round(sum(x >= 0.5 for x in v[1]) / len(v[1]), 3)}
                  for k, v in res.items()}

    budgets = json.loads((GENERATED / "point_budgets.json").read_text(encoding="utf-8"))["roles"]
    names = {}
    if NAMES_FILE.exists():
        with open(NAMES_FILE, encoding="utf-8-sig", newline="") as fh:
            names = {r["element"]: r["ten_vi"] for r in csv.DictReader(fh)}
    it_keys = defaultdict(dict)
    with open(IT_FILE, encoding="utf-8-sig", newline="") as fh:
        for r in csv.DictReader(fh):
            it_keys[r["role_code"]]["T:" + r["keyword"]] = int(r["max_level"])
    equiv = defaultdict(set)
    with open(IT_ONET_FILE, encoding="utf-8-sig", newline="") as fh:
        for r in csv.DictReader(fh):
            equiv["T:" + r["keyword"]].add(r["onet_element"])
            equiv[r["onet_element"]].add("T:" + r["keyword"])
    careers = []
    for c in budgets:
        if c["role_code"] in it_keys:
            maxes = it_keys[c["role_code"]]
            keys = sorted(maxes, key=lambda k: -maxes[k])
        else:
            codes_c = [x for x in c["onet"] if x in used]
            keys, maxes = [], {}
            for x in codes_c:
                for e in select(x, imp, lvl, used, iwa):
                    if e not in maxes:
                        keys.append(e)
                    maxes[e] = max(maxes.get(e, 0), max_level(x, e, imp, lvl, pct))
            keys = keys[: TARGET[1]]
        plan = schedule(keys, maxes, len(c["levels"]))
        careers.append({
            "role_code": c["role_code"], "name_vn": c["name_vn"], "is_it": c["is_it"],
            "keywords": [{"element": k, "ten_vi": k[2:] if k.startswith("T:") else names.get(k), "max_level": maxes[k]} for k in keys],
            "levels": [{"band": l["band"], "title_vn": l["title_vn"], **p} for l, p in zip(c["levels"], plan)],
        })
    vocab = sorted({k["element"] for c in careers for k in c["keywords"]} | {e for es in equiv.values() for e in es})
    GENERATED.mkdir(parents=True, exist_ok=True)
    with open(GENERATED / "keyword_elements_en.csv", "w", encoding="utf-8", newline="") as fh:
        w = csv.writer(fh)
        w.writerow(["element", "so_nghe_o_net_dung", "ten_vi"])
        for e in vocab:
            w.writerow([e, count.get(e, 0), names.get(e, "")])
    data = {"attribution": ATTRIBUTION, "validation": validation, "vocabulary_size": len(vocab),
            "it_equivalents": {k: sorted(v) for k, v in equiv.items() if k.startswith("T:")},
            "conversion": {a: {b: v for b, v in d.items() if a in vocab and b in vocab} for a, d in conv.items() if a in vocab},
            "careers": careers}
    (GENERATED / "keyword_map.json").write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    (GENERATED / "keyword_map.md").write_text(markdown(data), encoding="utf-8")
    print("vocabulary", len(vocab), "| pairs with credit", sum(len(d) for d in data["conversion"].values()))
    print("validation", validation)


if __name__ == "__main__":
    main()

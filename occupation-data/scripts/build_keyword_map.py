"""Dựng bản đồ keyword kỹ năng cứng cho 221 nghề và bảng quy đổi khi nhảy nghề, từ ESCO v1.2.1.

Đầu vào: occupation-data/external/esco_1_2_1/ (bản CSV tiếng Anh, tải tay qua form của ESCO, xem README);
research/research_notes/Bản đồ keyword/nghe_esco.csv (221 nghề → nghề ESCO); generated/point_budgets.json (thang cấp, mã O*NET);
ten_keyword_vi.csv (tên tiếng Việt, nếu có); keyword_it.csv + keyword_it_esco.csv (bài kiểm: keyword nhóm soạn cho 22 nghề IT);
external/onet_31_0/related_occupations.csv (kiểm định độc lập).
Đầu ra: generated/keyword_map.json, generated/keyword_map.md, generated/keyword_elements_en.csv (danh sách cần đặt tên).

Luật (khối G của đề xuất game design; nguồn ở research/research_notes/Bản đồ keyword/):
- Keyword = kỹ năng bắt buộc của nghề ESCO, bỏ kỹ năng chung, ngoại ngữ, bộ 40 kỹ năng nghiên cứu ESCO gắn chung cho
  122 nghề nghiên cứu, kỹ năng mà mọi nhánh đều nằm trong nhóm ESCO trùng 7 nhóm soft skill (SOFT_GROUPS),
  tên sản phẩm cụ thể, và kỹ năng dưới 3 nghề ESCO dùng.
- Mỗi nghề tối đa 6 keyword cốt lõi (nhiều nghề cùng nhóm ISCO 3 số có, hiếm ở nghề khác; nhóm dưới 5 nghề thì lấy nhóm
  ISCO 2 số) và 4 keyword đặc trưng (nghề cùng nhóm ít có). Một kỹ năng và một kiến thức cùng gốc từ chỉ giữ một.
  Nghề ESCO có dưới 6 keyword bắt buộc thì bổ sung kỹ năng tuỳ chọn (ghi ở "optional_fill").
- Mức cao nhất: hai keyword cốt lõi đầu, rồi xen kẽ đặc trưng và cốt lõi (keyword đặc trưng là thứ làm nên nghề);
  30% đầu Chuyên sâu, 20% cuối Làm quen, còn lại Thành thạo.
- Nhảy nghề tính ở tầng nhóm kỹ năng cấp 3 của ESCO (S x.y.z; kiến thức theo lĩnh vực ISCED-F 4 số, thiếu thì 3 số):
  mỗi keyword cần lấy nhóm tốt nhất của nó. Quy đổi một chiều giữa nhóm s(A→B) = P(B dùng | A dùng) trên 3.039 nghề ESCO;
  giữ nhóm có ≥ 10 nghề dùng, cặp cùng có ở ≥ 3 nghề và z siêu bội ≥ 3.
  Tín chỉ: cùng nhóm 1; s ≥ 0,75 → 0,5; 0,5 ≤ s < 0,75 → 0,25; còn lại 0. Mức quy đổi lấy lớn nhất, không cộng dồn.
"""
import csv
import json
import math
import re
import statistics
from collections import Counter, defaultdict

from build_onet_profiles import EXTERNAL, GENERATED, ROOT

REPO = ROOT.parent
ESCO = ROOT / "external" / "esco_1_2_1"
KW_DIR = REPO / "research" / "research_notes" / "Bản đồ keyword"
MAP_FILE = KW_DIR / "nghe_esco.csv"
NAMES_FILE = KW_DIR / "ten_keyword_vi.csv"
IT_FILE = KW_DIR / "keyword_it.csv"
IT_ESCO_FILE = KW_DIR / "keyword_it_esco.csv"
ATTRIBUTION = [
    "This service uses the ESCO classification of the European Commission (ESCO v1.2.1).",
    "JobQuest has modified the ESCO data: selected and grouped skills, assigned levels and added Vietnamese names.",
]

CORE, SPEC = 6, 4
MIN_KEYWORDS = 6
MIN_FAMILY = 5
TOP_SHARE, LOW_SHARE = 0.3, 0.2
MIN_USES = 3
MIN_OCC = 10
MIN_PAIR = 3
Z_MIN = 3.0
CREDIT = [(0.75, 0.5), (0.5, 0.25)]
# Nhóm ESCO trùng 7 nhóm soft skill: giao tiếp và hợp tác (S1.0, S1.2, S1.4, S1.7, S1.8), tư duy và giải quyết vấn đề
# (S1.9, S4.9), lãnh đạo và kinh doanh (S1.1, S4.1, S4.5, S4.6, S4.8), tự quản lý (S4.2), đạo đức và chuyên nghiệp
# (S3.3.1 "tuân thủ quy trình an toàn"; khối B xếp "giữ an toàn, tuân thủ quy định" vào nhóm này).
SOFT_GROUPS = {"S1.0", "S1.1", "S1.2", "S1.4", "S1.7", "S1.8", "S1.9", "S4.1", "S4.2", "S4.5", "S4.6", "S4.8", "S4.9", "S3.3.1"}
# Ngoại ngữ (S1.15.1) không là keyword; biên dịch, phiên dịch (S1.15.2) vẫn là kỹ năng nghề.
EXCLUDED = SOFT_GROUPS | {"S1.15.1"}
# Nhánh cấp 2 lẫn nhóm bị bỏ với nhóm giữ lại: xét theo nhóm cấp 3.
SPLIT_BRANCHES = {"S3.3", "S1.15"}
# ESCO xếp hai mục này dưới một kỹ năng khác và viết hoa như tên sản phẩm, nhưng chúng là phương pháp và lĩnh vực.
NOT_PRODUCTS = {"DevOps", "Internet of Things"}
# Từ quá chung để coi hai keyword là cùng gốc.
GENERIC = {"software", "system", "systems", "develop", "design", "manage", "perform", "apply", "technical", "processes",
           "process", "principles", "techniques", "tools", "computer", "information", "digital", "standards", "operate",
           "equipment", "management", "methods", "methodologies", "create", "implement"}


def read(name):
    with open(ESCO / f"{name}.csv", encoding="utf-8-sig", newline="") as fh:
        return list(csv.DictReader(fh))


def read_kw(path):
    with open(path, encoding="utf-8-sig", newline="") as fh:
        return list(csv.DictReader(fh))


class Esco:
    def __init__(self):
        self.skills = {r["conceptUri"]: r for r in read("skills_en")}
        self.occ = {r["conceptUri"]: r for r in read("occupations_en")}
        self.ess, self.opt = defaultdict(set), defaultdict(set)
        for r in read("occupationSkillRelations_en"):
            (self.ess if r["relationType"] == "essential" else self.opt)[r["occupationUri"]].add(r["skillUri"])
        self.broader = defaultdict(list)
        for r in read("broaderRelationsSkillPillar_en"):
            self.broader[r["conceptUri"]].append(r["broaderUri"])
        groups = read("skillGroups_en")
        self.gcode = {r["conceptUri"]: r["code"] for r in groups}
        self.glabel = {r["code"]: r["preferredLabel"] for r in groups}
        self.research = {r["conceptUri"] for r in read("researchSkillsCollection_en")}
        self.uses = Counter(s for o in self.occ for s in self.ess[o] | self.opt[o])
        self.ess_uses = Counter(s for o in self.occ for s in self.ess[o])
        self.family = defaultdict(list)
        for u, r in self.occ.items():
            self.family[r["iscoGroup"][:3]].append(u)
            self.family[r["iscoGroup"][:2]].append(u)
        self._codes = {}

    def codes(self, u):
        """Mã các nhóm tổ tiên của một kỹ năng trong cây phân loại ESCO (cây không có vòng)."""
        if u not in self._codes:
            out = set()
            for b in self.broader.get(u, []):
                if b in self.gcode:
                    out.add(self.gcode[b])
                out |= self.codes(b)
            self._codes[u] = out
        return self._codes[u]

    def groups(self, u):
        """Nhóm cấp 3 dùng khi nhảy nghề; bỏ nhóm trùng soft skill."""
        codes = self.codes(u)
        skill = {c for c in codes if c[0] == "S" and c.count(".") == 2 and c not in EXCLUDED and c.rsplit(".", 1)[0] not in EXCLUDED}
        field = {c for c in codes if c.isdigit() and len(c) == 4} or {c for c in codes if c.isdigit() and len(c) == 3}
        return skill | field

    def is_keyword(self, s):
        r = self.skills[s]
        label = r["preferredLabel"]
        codes = self.codes(s)
        branches = {c for c in codes if c[0] == "S" and c.count(".") == 1}
        for b in branches & SPLIT_BRANCHES:
            branches = branches - {b} | ({c for c in codes if c.startswith(b + ".")} or {b})
        general = any(c[0] in "TL" for c in codes)
        if r["reuseLevel"] == "transversal" or s in self.research or ((branches or general) and branches <= EXCLUDED):
            return False
        product = any(b in self.skills for b in self.broader.get(s, [])) and (label[:1].isupper() or "(" in label)
        return self.uses[s] >= MIN_USES and not (product and label not in NOT_PRODUCTS)


def stems(label):
    return {w[:5] for w in re.findall(r"[a-z0-9-]+", label.lower()) if len(w) >= 5 and w not in GENERIC}


def select(esco, o):
    """Keyword của một nghề ESCO kèm mức cao nhất, và số keyword phải bổ sung từ kỹ năng tuỳ chọn."""
    isco = esco.occ[o]["iscoGroup"]
    sibs = [x for x in esco.family[isco[:3]] if x != o]
    if len(sibs) < MIN_FAMILY:
        sibs = [x for x in esco.family[isco[:2]] if x != o]

    def scored(skills):
        return [(s, sum(s in esco.ess[x] | esco.opt[x] for x in sibs) / len(sibs), math.log(len(esco.occ) / esco.uses[s]))
                for s in skills if esco.is_keyword(s)]

    rows = scored(esco.ess[o])
    picked, cores, specs = [], [], []
    types = ("skill/competence", "knowledge")

    def twin(a, b):
        ta, tb = esco.skills[a]["skillType"], esco.skills[b]["skillType"]
        return {ta, tb} == set(types) and bool(stems(esco.skills[a]["preferredLabel"]) & stems(esco.skills[b]["preferredLabel"]))

    def add(s, bucket):
        if not any(twin(s, t) for t in picked):
            picked.append(s)
            bucket.append(s)

    for s, share, idf in sorted(rows, key=lambda t: (-t[1] * t[2], t[0])):
        if len(cores) == CORE:
            break
        add(s, cores)
    for s, share, idf in sorted(rows, key=lambda t: (-(1 - t[1]) * t[2], t[0])):
        if len(specs) == SPEC:
            break
        if s not in picked:
            add(s, specs)
    essential = len(picked)
    for s, share, idf in sorted(scored(esco.opt[o]), key=lambda t: (-t[1] * t[2], t[0])):
        if len(picked) >= MIN_KEYWORDS:
            break
        add(s, cores)
    rest = cores[2:]
    order = cores[:2] + [x for pair in zip(specs, rest) for x in pair] + specs[len(rest):] + rest[len(specs):]
    n = len(order)
    top, low = math.ceil(TOP_SHARE * n), math.floor(LOW_SHARE * n)
    return {s: 3 if i < top else 1 if i >= n - low else 2 for i, s in enumerate(order)}, len(picked) - essential


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
        if nab < MIN_PAIR:
            continue
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


def lift(levels, groups):
    """Mức theo keyword của người chơi → mức theo nhóm kỹ năng (lấy lớn nhất). Keyword không thuộc nhóm nào giữ nguyên."""
    out = {}
    for k, v in levels.items():
        for g in groups.get(k) or [k]:
            out[g] = max(out.get(g, 0), v)
    return out


def coverage(have, need, groups, conv):
    """Độ phủ = Σ min(mức quy đổi, mức cần) / Σ mức cần, theo từng keyword cần.

    have: mức theo nhóm (lift); need: mức theo keyword. Mỗi keyword cần lấy nhóm tốt nhất của nó, nên keyword thuộc
    nhiều nhóm không nặng hơn keyword thuộc một nhóm."""
    def best(g):
        value = have.get(g, 0)
        for a, la in have.items():
            c = conv.get(a, {}).get(g)
            if c:
                value = max(value, la * c["credit"])
        return value

    total = sum(need.values())
    return sum(min(max(best(g) for g in groups.get(k) or [k]), lv) for k, lv in need.items()) / total if total else 1.0


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


def validate(careers, groups, conv, tests):
    """Độ phủ (nghề nguồn đã xong cấp cuối) cho cấp cuối nghề đích; cặp có hướng liên quan theo từng phép kiểm."""
    have = {c["role_code"]: lift(c["levels"][-1]["output"], groups) for c in careers}
    out = {}
    for name, related in tests.items():
        for k, table in (("conv", conv), ("exact", {})):
            pos, neg = [], []
            for a in careers:
                for b in careers:
                    if a is not b:
                        cov = coverage(have[a["role_code"]], b["levels"][-1]["output"], groups, table)
                        (pos if related(a["role_code"], b["role_code"]) else neg).append(cov)
            out[f"{name}_{k}"] = {
                "pairs_related": len(pos), "auc": round(auc(pos, neg), 3),
                "mean_related": round(statistics.mean(pos), 3), "mean_other": round(statistics.mean(neg), 3),
                "pass50_related": round(sum(x >= 0.5 for x in pos) / len(pos), 3),
                "pass50_other": round(sum(x >= 0.5 for x in neg) / len(neg), 3)}
    return out


def onet_related(budgets):
    """Hai nghề liên quan khi chung mã O*NET hoặc một mã nằm trong Related Occupations tầng Primary của mã kia."""
    rel = defaultdict(set)
    with open(EXTERNAL / "related_occupations.csv", encoding="utf-8-sig", newline="") as fh:
        for r in csv.DictReader(fh):
            if r["Relatedness Tier"].startswith("Primary"):
                rel[r["O*NET-SOC Code"]].add(r["Related O*NET-SOC Code"])
    codes = {c["role_code"]: c["onet"] for c in budgets}
    return lambda a, b: bool(set(codes[a]) & set(codes[b])) or any(y in rel[x] for x in codes[a] for y in codes[b])


def it_agreement(careers):
    """Phần keyword nhóm soạn cho 22 nghề IT (có trọng số theo mức) mà bộ keyword ESCO tìm lại được, so đúng kỹ năng."""
    equiv = defaultdict(set)
    for r in read_kw(IT_ESCO_FILE):
        equiv[r["keyword"]].add(r["esco_uri"])
    team = defaultdict(dict)
    for r in read_kw(IT_FILE):
        if r["keyword"][:2] not in ("K:", "S:", "I:"):
            team[r["role_code"]][r["keyword"]] = int(r["max_level"])
    per_role, got, total = {}, 0, 0
    for c in careers:
        if c["role_code"] not in team:
            continue
        picked = {k["element"] for k in c["keywords"]}
        need = team[c["role_code"]]
        hit = sum(v for k, v in need.items() if equiv[k] & picked)
        per_role[c["role_code"]] = {"share": round(hit / sum(need.values()), 3),
                                    "missing": [k for k in need if not equiv[k] & picked]}
        got, total = got + hit, total + sum(need.values())
    return {"share": round(got / total, 3), "roles": per_role}


def markdown(data):
    v = data["validation"]
    pct = lambda x: f"{x * 100:.1f}%".replace(".", ",")
    dec = lambda x: f"{x:.3f}".replace(".", ",")
    num = lambda n: f"{n:,}".replace(",", ".")
    short = [c for c in data["careers"] if c["optional_fill"] or len(c["keywords"]) < MIN_KEYWORDS]
    lines = [
        "# Bản đồ keyword kỹ năng cứng, 221 nghề",
        "",
        "Sinh bởi `occupation-data/scripts/build_keyword_map.py` từ ESCO v1.2.1, cùng một cách cho mọi nghề. Nghề nối sang ESCO "
        "ở `research/research_notes/Bản đồ keyword/nghe_esco.csv`; tên tiếng Việt ở `ten_keyword_vi.csv` cùng thư mục.",
        "",
        f"- Kho keyword: {num(data['vocabulary_size'])}; nhóm kỹ năng dùng khi nhảy nghề: {data['group_count']}; "
        f"cặp nhóm quy đổi có tín chỉ: {num(sum(len(x) for x in data['group_conversion'].values()))}.",
        f"- Khớp với keyword nhóm soạn cho 22 nghề IT (có trọng số theo mức, so đúng kỹ năng): {pct(v['it_team']['share'])}.",
        f"- {len(short)} nghề có ít kỹ năng bắt buộc trong ESCO nên bổ sung kỹ năng tuỳ chọn hoặc còn dưới {MIN_KEYWORDS} keyword: "
        + "; ".join(f"{c['name_vn']} ({len(c['keywords'])})" for c in short) + ".",
        "",
        "## Kiểm định trên 221 nghề",
        "",
        "Độ phủ keyword (nghề nguồn đã xong cấp cuối) cho cấp cuối nghề đích, tính trên cặp có hướng. Phép kiểm theo O\\*NET độc lập "
        "với cách chọn keyword; phép kiểm theo ISCO chỉ để soát sơ bộ, vì cách chọn keyword đã dùng nhóm ISCO 3 số.",
        "",
        "| Cặp liên quan | Cách tính | AUC | Độ phủ TB, liên quan | Độ phủ TB, khác | Đạt 50%, liên quan | Đạt 50%, khác |",
        "|---|---|---|---|---|---|---|",
    ]
    for name, label in (("onet", "Nghề liên quan O\\*NET (Primary)"), ("isco3", "Cùng ISCO 3 số"), ("isco2", "Cùng ISCO 2 số")):
        for k, how in (("conv", "Có quy đổi"), ("exact", "Chỉ cùng nhóm")):
            r = v[f"{name}_{k}"]
            lines.append(f"| {label} ({num(r['pairs_related'])} cặp) | {how} | {dec(r['auc'])} | {pct(r['mean_related'])} | "
                         f"{pct(r['mean_other'])} | {pct(r['pass50_related'])} | {pct(r['pass50_other'])} |")
    lines += ["", "## Từng nghề", "", "| Nghề | Nghề ESCO | Keyword (mức cao nhất) |", "|---|---|---|"]
    for c in data["careers"]:
        kws = "; ".join(f"{k['ten_vi'] or k['en']} ({k['max_level']})" for k in c["keywords"])
        lines.append(f"| {c['name_vn']} | {c['esco']['label']} | {kws} |")
    lines += ["", "## Nguồn", ""] + [f"- {a}" for a in data["attribution"]]
    return "\n".join(lines) + "\n"


def main():
    esco = Esco()
    mapping = {r["role_code"]: r for r in read_kw(MAP_FILE)}
    names = {r["element"]: r["ten_vi"] for r in read_kw(NAMES_FILE)} if NAMES_FILE.exists() else {}
    groups = {s: sorted(esco.groups(s)) for s in esco.skills}
    used = {o: {g: 1.0 for s in esco.ess[o] if esco.is_keyword(s) for g in groups[s] or [s]} for o in esco.occ}
    conv, count = conversion(used)

    budgets = json.loads((GENERATED / "point_budgets.json").read_text(encoding="utf-8"))["roles"]
    careers, isco = [], {}
    for c in budgets:
        m = mapping[c["role_code"]]
        o = esco.occ[m["esco_uri"]]
        isco[c["role_code"]] = o["iscoGroup"]
        maxes, fill = select(esco, m["esco_uri"])
        keys = sorted(maxes, key=lambda k: -maxes[k])
        plan = schedule(keys, maxes, len(c["levels"]))
        careers.append({
            "role_code": c["role_code"], "name_vn": c["name_vn"], "is_it": c["is_it"],
            "esco": {"label": o["preferredLabel"], "code": o["code"], "uri": m["esco_uri"], "how": m["cach_chon"]},
            "optional_fill": fill,
            "keywords": [{"element": k, "en": esco.skills[k]["preferredLabel"], "ten_vi": names.get(k), "max_level": maxes[k],
                          "groups": groups[k]} for k in keys],
            "levels": [{"band": l["band"], "title_vn": l["title_vn"], **p} for l, p in zip(c["levels"], plan)],
        })
    vocab = sorted({k["element"] for c in careers for k in c["keywords"]})
    gvocab = sorted({g for k in vocab for g in groups[k] or [k]})
    tests = {"onet": onet_related(budgets),
             "isco3": lambda a, b: isco[a][:3] == isco[b][:3],
             "isco2": lambda a, b: isco[a][:2] == isco[b][:2]}
    validation = validate(careers, groups, conv, tests)
    validation["it_team"] = it_agreement(careers)

    GENERATED.mkdir(parents=True, exist_ok=True)
    with open(GENERATED / "keyword_elements_en.csv", "w", encoding="utf-8", newline="") as fh:
        w = csv.writer(fh)
        w.writerow(["element", "loai", "ten_en", "so_nghe_esco_bat_buoc", "ten_vi"])
        for k in vocab:
            w.writerow([k, "keyword", esco.skills[k]["preferredLabel"], esco.ess_uses[k], names.get(k, "")])
        for g in gvocab:
            if g not in esco.skills:
                w.writerow([g, "nhom", esco.glabel[g], count.get(g, 0), names.get(g, "")])
    group_conversion = {a: {b: x for b, x in d.items() if b in gvocab} for a, d in conv.items() if a in gvocab}
    data = {
        "attribution": ATTRIBUTION, "validation": validation,
        "vocabulary_size": len(vocab), "group_count": len(gvocab),
        "groups": {g: {"en": esco.glabel.get(g) or esco.skills[g]["preferredLabel"], "ten_vi": names.get(g)} for g in gvocab},
        "group_conversion": {a: d for a, d in group_conversion.items() if d},
        "careers": careers,
    }
    (GENERATED / "keyword_map.json").write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    (GENERATED / "keyword_map.md").write_text(markdown(data), encoding="utf-8")
    print("keywords", len(vocab), "| groups", len(gvocab), "| group pairs with credit", sum(len(d) for d in data["group_conversion"].values()))
    print("validation", json.dumps({k: v for k, v in validation.items() if k != "it_team"}), "| it_team", validation["it_team"]["share"])


if __name__ == "__main__":
    main()

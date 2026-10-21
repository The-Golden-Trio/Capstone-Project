"""Đo độ giống nghề–nghề theo từng nhóm mô tả của O*NET 31.0 và so với danh sách Related Occupations.

Related Occupations là danh sách nghề liên quan do O*NET công bố (mỗi nghề 20 nghề, chia ba tầng:
Primary-Short 5, Primary-Long 5, Supplemental 10). Script tính, với mỗi cách đo độ giống, 5 hay 10 nghề
giống nhất có trúng bao nhiêu nghề trong danh sách đó.

Đầu vào: occupation-data/external/onet_31_0/ (thêm related_occupations, essential_skills,
transferable_skills, knowledge ngoài bốn file của build_onet_profiles.py).
Đầu ra: occupation-data/generated/onet_similarity_eval.json và .md.
"""
import csv
import json
import math
import operator
import random
import statistics
from pathlib import Path

from build_onet_profiles import ATTRIBUTION, EXTERNAL, GENERATED, RIASEC, ROLES, SOFT_GROUPS, read, zscores

DOMAINS = {
    "riasec": "Sở thích RIASEC (6)",
    "soft": "Soft skill 7 nhóm của JobQuest",
    "activities": "Work Activities (41)",
    "styles": "Work Styles (21)",
    "skills": "Essential + Transferable Skills (35)",
    "knowledge": "Knowledge (33)",
}

COMBOS = {
    "riasec": {"riasec": 1},
    "soft": {"soft": 1},
    "riasec3+styles3+skills1 (đang dùng)": {"riasec": 3, "styles": 3, "skills": 1},
    "activities": {"activities": 1},
    "skills": {"skills": 1},
    "knowledge": {"knowledge": 1},
    "skills+knowledge": {"skills": 1, "knowledge": 1},
    "skills+knowledge+activities": {"skills": 1, "knowledge": 1, "activities": 1},
    "tất cả 6 nhóm, bằng nhau": {d: 1 for d in DOMAINS},
}


def table(name, scale):
    out = {}
    for r in read(name):
        if r["Scale ID"] == scale:
            out.setdefault(r["O*NET-SOC Code"], {})[r["Element Name"]] = float(r["Data Value"])
    return out


def load():
    titles = {r["O*NET-SOC Code"]: r["Title"] for r in read("occupation_data")}
    skills = table("essential_skills", "IM")
    for code, row in table("transferable_skills", "IM").items():
        skills.setdefault(code, {}).update(row)
    raw = {
        "riasec": table("career_interest_types", "OI"),
        "activities": table("work_activities", "IM"),
        "styles": table("work_styles", "WI"),
        "skills": skills,
        "knowledge": table("knowledge", "IM"),
    }
    related = {}
    for r in read("related_occupations"):
        related.setdefault(r["O*NET-SOC Code"], []).append((r["Related O*NET-SOC Code"], r["Relatedness Tier"]))
    return titles, raw, related


def unit(v):
    n = math.sqrt(sum(x * x for x in v))
    return [x / n for x in v] if n else v


def build_vectors(raw, codes):
    z = {d: zscores({c: raw[d][c] for c in codes}) for d in raw}
    elements = {d: sorted(next(iter(z[d].values()))) for d in z}
    vec = {d: {c: unit([z[d][c][e] for e in elements[d]]) for c in codes} for d in z}
    za, zs = z["activities"], z["styles"]
    vec["soft"] = {
        c: unit([statistics.mean([za[c][e] for e in g["wa"]] + [zs[c][e] for e in g["ws"]]) for g in SOFT_GROUPS])
        for c in codes
    }
    vec["riasec"] = {c: unit([z["riasec"][c][k] for k in RIASEC]) for c in codes}
    return vec


def cosine_matrices(vec, codes):
    sims = {}
    for d, vs in vec.items():
        rows = [vs[c] for c in codes]
        m = [[0.0] * len(codes) for _ in codes]
        for i, a in enumerate(rows):
            for j in range(i + 1, len(rows)):
                s = sum(map(operator.mul, a, rows[j]))
                m[i][j] = m[j][i] = s
        sims[d] = m
    return sims


def standardise(sims):
    """Chuẩn hoá ma trận độ giống của từng nhóm (trên mọi cặp khác nhau) trước khi gộp, như O*NET làm với Related Occupations."""
    out = {}
    for d, m in sims.items():
        vals = [m[i][j] for i in range(len(m)) for j in range(len(m)) if i != j]
        mu, sd = statistics.mean(vals), statistics.pstdev(vals) or 1.0
        out[d] = [[(v - mu) / sd for v in row] for row in m]
    return out


def ranked(sims, weights, i, n):
    total = sum(weights.values())
    scores = [(sum(w * sims[d][i][j] for d, w in weights.items()) / total, j) for j in range(n) if j != i]
    scores.sort(reverse=True)
    return [j for _, j in scores]


def evaluate(sims, codes, related, weights, subset=None):
    idx = {c: i for i, c in enumerate(codes)}
    p5, p10, r20, n_eval = 0.0, 0.0, 0.0, 0
    for c in subset or codes:
        rel = [(idx[r], t) for r, t in related.get(c, []) if r in idx]
        short = {j for j, t in rel if t == "Primary-Short"}
        primary = {j for j, t in rel if t.startswith("Primary")}
        everything = {j for j, _ in rel}
        if len(short) < 5 or len(primary) < 10:
            continue
        top = ranked(sims, weights, idx[c], len(codes))
        p5 += len(set(top[:5]) & short) / 5
        p10 += len(set(top[:10]) & primary) / 10
        r20 += len(set(top[:20]) & everything) / len(everything)
        n_eval += 1
    return {"p5_short": p5 / n_eval, "p10_primary": p10 / n_eval, "r20_all": r20 / n_eval, "occupations": n_eval}


def tune(sims, codes, related, domains=tuple(DOMAINS)):
    """Chọn trọng số trên một nửa số nghề (leo đồi theo từng nhóm, mỗi trọng số 0–3), đo lại trên nửa còn lại."""
    rng = random.Random(11)
    shuffled = codes[:]
    rng.shuffle(shuffled)
    train, test = sorted(shuffled[: len(codes) // 2]), sorted(shuffled[len(codes) // 2 :])
    weights = {d: 1 for d in domains}
    best = evaluate(sims, codes, related, weights, train)["p10_primary"]
    improved = True
    while improved:
        improved = False
        for d in domains:
            for w in (0, 1, 2, 3):
                if w == weights[d] or (w == 0 and sum(weights.values()) == weights[d]):
                    continue
                trial = dict(weights, **{d: w})
                score = evaluate(sims, codes, related, {k: v for k, v in trial.items() if v}, train)["p10_primary"]
                if score > best + 1e-9:
                    best, weights, improved = score, trial, True
    weights = {k: v for k, v in weights.items() if v}
    return {
        "weights": weights,
        "train": evaluate(sims, codes, related, weights, train),
        "test": evaluate(sims, codes, related, weights, test),
        "equal_on_test": evaluate(sims, codes, related, {d: 1 for d in domains}, test),
    }


def baselines(codes, related):
    """Mốc so sánh: chọn ngẫu nhiên, và xếp theo cùng nhóm SOC (cùng 5 rồi 4 rồi 2 ký tự đầu của mã)."""
    idx = {c: i for i, c in enumerate(codes)}
    rng = random.Random(7)
    out = {}
    for name in ("ngẫu nhiên", "cùng nhóm mã SOC"):
        p5 = p10 = r20 = 0.0
        n_eval = 0
        for c in codes:
            rel = [(r, t) for r, t in related.get(c, []) if r in idx]
            short = {r for r, t in rel if t == "Primary-Short"}
            primary = {r for r, t in rel if t.startswith("Primary")}
            everything = {r for r, _ in rel}
            if len(short) < 5 or len(primary) < 10:
                continue
            others = [o for o in codes if o != c]
            if name == "ngẫu nhiên":
                rng.shuffle(others)
            else:
                rng.shuffle(others)
                others.sort(key=lambda o: -(4 if o[:6] == c[:6] else 3 if o[:5] == c[:5] else 2 if o[:4] == c[:4] else 1 if o[:2] == c[:2] else 0))
            p5 += len(set(others[:5]) & short) / 5
            p10 += len(set(others[:10]) & primary) / 10
            r20 += len(set(others[:20]) & everything) / len(everything)
            n_eval += 1
        out[name] = {"p5_short": p5 / n_eval, "p10_primary": p10 / n_eval, "r20_all": r20 / n_eval, "occupations": n_eval}
    return out


def it_examples(sims, codes, titles, related, weights):
    idx = {c: i for i, c in enumerate(codes)}
    out = []
    seen = set()
    for _, name, onet, _ in ROLES:
        if len(onet) != 1 or onet[0] in seen or onet[0] not in idx:
            continue
        c = onet[0]
        seen.add(c)
        rel = {r for r, t in related.get(c, []) if t.startswith("Primary")}
        top = [codes[j] for j in ranked(sims, weights, idx[c], len(codes))[:5]]
        out.append({"role": name, "code": c, "top5": [{"code": t, "title": titles[t], "in_related": t in rel} for t in top]})
    return out


def main():
    titles, raw, related = load()
    codes = sorted(set.intersection(*(set(t) for t in raw.values())) & set(titles))
    print("occupations with all descriptors:", len(codes))
    vec = build_vectors(raw, codes)
    sims = standardise(cosine_matrices(vec, codes))
    results = {name: evaluate(sims, codes, related, w) for name, w in COMBOS.items()}
    for name, r in results.items():
        print(f"{name:40s} P@5={r['p5_short']:.3f} P@10={r['p10_primary']:.3f} R@20={r['r20_all']:.3f}")
    base = baselines(codes, related)
    for name, r in base.items():
        print(f"{name:40s} P@5={r['p5_short']:.3f} P@10={r['p10_primary']:.3f} R@20={r['r20_all']:.3f}")
    tuned = tune(sims, codes, related)
    # Related Occupations dùng sẵn Knowledge, nên chọn thêm một bộ trọng số không có Knowledge để đo phần khớp không vòng lặp.
    tuned_nk = tune(sims, codes, related, tuple(d for d in DOMAINS if d != "knowledge"))
    for label, t in (("tuned", tuned), ("tuned without knowledge", tuned_nk)):
        print(label, t["weights"], "train P@10", round(t["train"]["p10_primary"], 3),
              "test P@10", round(t["test"]["p10_primary"], 3), "equal weights on test", round(t["equal_on_test"]["p10_primary"], 3))
    best = max(results, key=lambda k: results[k]["p10_primary"])
    data = {
        "tuned": tuned,
        "tuned_without_knowledge": tuned_nk,
        "attribution": ATTRIBUTION,
        "occupations": len(codes),
        "method": "cosine trên vector z (chuẩn hoá từng mục trên toàn bộ nghề), chuẩn hoá ma trận độ giống của từng nhóm, gộp bằng trung bình có trọng số",
        "metrics": {
            "p5_short": "trong 5 nghề giống nhất, tỉ lệ thuộc tầng Primary-Short (5 nghề)",
            "p10_primary": "trong 10 nghề giống nhất, tỉ lệ thuộc Primary-Short hoặc Primary-Long (10 nghề)",
            "r20_all": "trong 20 nghề giống nhất, tỉ lệ bắt được của cả 20 nghề liên quan",
        },
        "results": results,
        "baselines": base,
        "it_examples_in_use": it_examples(sims, codes, titles, related, COMBOS["riasec3+styles3+skills1 (đang dùng)"]),
        "it_examples_best": {"combo": best, "rows": it_examples(sims, codes, titles, related, COMBOS[best])},
    }
    GENERATED.mkdir(parents=True, exist_ok=True)
    (GENERATED / "onet_similarity_eval.json").write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    (GENERATED / "onet_similarity_eval.md").write_text(markdown(data), encoding="utf-8")
    print("wrote", GENERATED / "onet_similarity_eval.json")


def pct(x):
    return f"{x * 100:.1f}%"


def markdown(data):
    lines = [
        "# Độ giống nghề–nghề so với O*NET Related Occupations",
        "",
        f"Sinh bởi `occupation-data/scripts/evaluate_onet_similarity.py`. {data['occupations']} nghề có đủ mọi nhóm mô tả. Cách tính: {data['method']}.",
        "",
        "| Cách đo | Trúng trong 5 nghề đầu (Primary-Short) | Trúng trong 10 nghề đầu (Primary) | Bắt được trong 20 nghề đầu (cả 20) |",
        "|---|---|---|---|",
    ]
    for name, r in data["results"].items():
        lines.append(f"| {name} | {pct(r['p5_short'])} | {pct(r['p10_primary'])} | {pct(r['r20_all'])} |")
    for name, r in data["baselines"].items():
        lines.append(f"| *Mốc: {name}* | {pct(r['p5_short'])} | {pct(r['p10_primary'])} | {pct(r['r20_all'])} |")
    t = data["tuned"]
    lines += [
        "",
        "## Trọng số chọn trên một nửa số nghề, đo trên nửa còn lại",
        "",
        "Trọng số: " + ", ".join(f"{DOMAINS[d]} × {w}" for d, w in t["weights"].items()) + ".",
        "",
        f"- Nửa dùng để chọn: trúng {pct(t['train']['p10_primary'])} trong 10 nghề đầu.",
        f"- Nửa để kiểm: trúng {pct(t['test']['p10_primary'])} (cùng nửa này, 6 nhóm bằng nhau: {pct(t['equal_on_test']['p10_primary'])}).",
    ]
    t = data["tuned_without_knowledge"]
    lines += [
        "",
        "Related Occupations được dựng một phần từ Knowledge, nên bộ trọng số dưới đây bỏ Knowledge để đo phần khớp không vòng lặp.",
        "",
        "Trọng số: " + ", ".join(f"{DOMAINS[d]} × {w}" for d, w in t["weights"].items()) + ".",
        "",
        f"- Nửa dùng để chọn: trúng {pct(t['train']['p10_primary'])}; nửa để kiểm: {pct(t['test']['p10_primary'])} (5 nhóm bằng nhau: {pct(t['equal_on_test']['p10_primary'])}).",
    ]
    for key, label in (("it_examples_in_use", "riasec3+styles3+skills1 (đang dùng)"), ("it_examples_best", data["it_examples_best"]["combo"])):
        rows = data[key] if key == "it_examples_in_use" else data[key]["rows"]
        lines += ["", f"## 5 nghề giống nhất của một số nghề IT, cách đo: {label}", "", "✓ là nghề có trong tầng Primary của Related Occupations.", ""]
        for r in rows:
            tops = "; ".join(("✓ " if t["in_related"] else "") + t["title"] for t in r["top5"])
            lines.append(f"- **{r['role']}** ({r['code']}): {tops}")
    lines += ["", "## Nguồn", ""] + [f"- {a}" for a in data["attribution"]]
    return "\n".join(lines) + "\n"


if __name__ == "__main__":
    main()

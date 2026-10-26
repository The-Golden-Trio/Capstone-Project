"""Kiểm độ nhạy của gợi ý nghề IT với trọng số: đổi từng nhóm ×0,5 và ×2, rồi đếm nghề nào đổi top 1 hoặc tập top 3.

Đầu ra: occupation-data/generated/onet_profile_stability.md.
"""
import sys

from build_onet_profiles import DOMAIN_VI, GENERATED, ROLES, WEIGHTS, domain_vectors, prepare, similarity


CODES = {key: codes for key, _, codes, _ in ROLES}


def top3(prep, role_vecs, key, weights):
    scored = sorted(
        (
            (similarity(role_vecs[key], role_vecs[other], prep, weights), other)
            for other in role_vecs if CODES[other] != CODES[key]
        ),
        reverse=True,
    )
    return [other for _, other in scored[:3]]


def scenarios():
    yield "Trọng số gốc", WEIGHTS
    for d in WEIGHTS:
        for factor in (0.5, 2):
            yield f"{DOMAIN_VI[d]} × {factor:g}", {**WEIGHTS, d: WEIGHTS[d] * factor}
    yield "Mọi nhóm bằng nhau", {d: 1 for d in WEIGHTS}


def main():
    prep = prepare()
    role_vecs = {key: domain_vectors(prep, codes) for key, _, codes, _ in ROLES}
    names = {key: name for key, name, _, _ in ROLES}
    base = {key: top3(prep, role_vecs, key, WEIGHTS) for key in names}

    rows = []
    changed_any = set()
    for label, weights in scenarios():
        current = {key: top3(prep, role_vecs, key, weights) for key in names}
        top1 = [key for key in names if current[key][0] != base[key][0]]
        top3_set = [key for key in names if set(current[key]) != set(base[key])]
        changed_any |= set(top3_set)
        rows.append((label, top1, top3_set))

    lines = [
        "# Độ nhạy của gợi ý nghề IT với trọng số",
        "",
        "Sinh bởi `occupation-data/scripts/check_profile_stability.py`. Mỗi kịch bản đổi trọng số một nhóm, "
        "rồi so top 3 với trọng số gốc.",
        "",
        "| Kịch bản | Nghề đổi top 1 | Nghề đổi tập top 3 |",
        "|---|---|---|",
    ]
    for label, top1, top3_set in rows:
        lines.append(f"| {label} | {len(top1)} / {len(names)} | {len(top3_set)} / {len(names)} |")
    lines += ["", "## Nghề đổi top 3 ở ít nhất một kịch bản", ""]
    for key in names:
        if key in changed_any:
            lines.append(f"- {names[key]}: {', '.join(names[o] for o in base[key])} (gốc)")
    lines.append("")
    text = "\n".join(lines)
    (GENERATED / "onet_profile_stability.md").write_text(text, encoding="utf-8")
    sys.stdout.reconfigure(encoding="utf-8")
    print(text)
    print("wrote", GENERATED / "onet_profile_stability.md")


if __name__ == "__main__":
    sys.exit(main())

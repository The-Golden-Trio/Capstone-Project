#!/usr/bin/env python3
"""
build_role_graph.py — Dựng dữ liệu graph 22 role cho màn "Planet Universe".

Input:
  dataset_22_roles_enriched_v3.json   (roles[] + graph_edges_full[])
  output/skills_taxonomy.json         (từ build_skill_taxonomy.py — chạy TRƯỚC script này)

Luật (theo plan mục 2.1):
  - Node = 1 role (không tính band). Skill set = union hard_skills_languages + hard_skills_frameworks
    (top 10 mỗi loại), resolve qua taxonomy alias.
  - SIMILAR có weight sẵn         → distance = 1 - weight ; requiredSkills = shared_skills_top (người thật chọn)
  - PROGRESSES_TO (không weight)  → distance = clamp(1 - Jaccard(A,B), min 0.05) ;
                                     requiredSkills = top-2 trong A∩B (ưu tiên rank cao ở cả 2 role)
  - ABSORBED: toàn bộ 39 cạnh trỏ tới role_code KHÔNG nằm trong 22 node (SWE_WEB, QA_AUTO ...) —
    chúng là alias tìm kiếm ("user gõ Data Scientist vẫn ra AI Engineer"), không phải node thật.
    Không thể tính Jaccard (không có skill data) → ghi riêng vào `absorbed[]` và gắn vào
    node.absorbedRoles; KHÔNG đưa vào `edges[]` để graph 22 node không có cạnh treo.

Output: output/role_graph.json
  { _meta, nodes: [{roleCode, nameVn, roleGroup, skillIds, absorbedRoles}],
    edges: [{id, from, to, type, distance, distanceMethod, requiredSkills}],
    absorbed: [{parentRoleCode, roleCode, note}] }
"""
from __future__ import annotations

import json
import os
import sys
from collections import Counter
from datetime import date

HERE = os.path.dirname(os.path.abspath(__file__))
SRC_22 = os.path.join(HERE, "dataset_22_roles_enriched_v3.json")
SRC_TAXONOMY = os.path.join(HERE, "output", "skills_taxonomy.json")
OUT_PATH = os.path.join(HERE, "output", "role_graph.json")

MIN_DISTANCE = 0.05          # tránh 2 node chồng nhau khi Jaccard = 1
JUNK_STRINGS = {"not using", "none", "n/a"}   # nhãn rác của báo cáo, cùng bộ với build_skill_taxonomy.py
REQUIRED_SKILLS_TOP_N = 2    # PROGRESSES_TO: lấy top-2 skill giao nhau


def load_json(path: str):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def build_lookup(taxonomy: dict) -> dict[str, str]:
    lk: dict[str, str] = {}
    for s in taxonomy["skills"]:
        lk[s["name_vn"].strip().casefold()] = s["skill_id"]
        for a in s["aliases"]:
            lk[a.strip().casefold()] = s["skill_id"]
    return lk


def resolve(lookup: dict[str, str], raw: str, unknown: Counter) -> str | None:
    key = " ".join(raw.split()).casefold()
    if key in JUNK_STRINGS:
        return None
    sid = lookup.get(key)
    if sid is None:
        unknown[raw] += 1
    return sid


def main() -> int:
    if not os.path.exists(SRC_TAXONOMY):
        print(f"Thiếu {SRC_TAXONOMY} — chạy build_skill_taxonomy.py trước.", file=sys.stderr)
        return 1
    data = load_json(SRC_22)
    taxonomy = load_json(SRC_TAXONOMY)
    lookup = build_lookup(taxonomy)
    unknown: Counter = Counter()

    # ---- nodes -------------------------------------------------------------
    nodes: list[dict] = []
    skill_sets: dict[str, set[str]] = {}
    skill_rank: dict[str, dict[str, int]] = {}   # roleCode -> skillId -> rank tốt nhất (nhỏ = cao)
    for role in data["roles"]:
        code = role["role_code"]
        ss = role.get("skills_status") or {}
        ids: set[str] = set()
        ranks: dict[str, int] = {}
        for bucket in ("hard_skills_languages", "hard_skills_frameworks"):
            for item in ss.get(bucket) or []:
                sid = resolve(lookup, item["skill"], unknown)
                if sid is None:
                    continue
                ids.add(sid)
                r = int(item.get("rank") or 99)
                ranks[sid] = min(ranks.get(sid, 99), r)
        skill_sets[code] = ids
        skill_rank[code] = ranks
        nodes.append({
            "roleCode": code,
            "nameVn": role["role_name_vn"],
            "nameEn": role.get("role_name"),
            "roleGroup": role["role_group"],
            "bands": role.get("bands"),
            "hasSkillData": bool(ids),
            "skillIds": sorted(ids),
            "absorbedRoles": [],
        })
    node_by_code = {n["roleCode"]: n for n in nodes}

    # ---- edges -------------------------------------------------------------
    edges: list[dict] = []
    absorbed: list[dict] = []
    type_counter: Counter = Counter()
    for e in data["graph_edges_full"]:
        etype = e["type"]
        src, dst = e["from"], e["to"]
        type_counter[etype] += 1

        if etype == "ABSORBED":
            if src not in node_by_code:
                raise SystemExit(f"ABSORBED from={src} không phải node — dữ liệu lạ")
            entry = {"parentRoleCode": src, "roleCode": dst, "note": e.get("note")}
            absorbed.append(entry)
            node_by_code[src]["absorbedRoles"].append({"roleCode": dst, "note": e.get("note")})
            continue

        if src not in node_by_code or dst not in node_by_code:
            raise SystemExit(f"Cạnh {etype} {src}->{dst} có đầu mút không nằm trong 22 node")

        a, b = skill_sets[src], skill_sets[dst]
        inter = a & b
        if etype == "SIMILAR":
            weight = e.get("weight")
            if weight is None:
                raise SystemExit(f"SIMILAR {src}->{dst} thiếu weight")
            distance = round(max(MIN_DISTANCE, 1.0 - float(weight)), 4)
            method = "1 - weight (70% semantic + 30% skill-Jaccard, gán sẵn trong dataset)"
            required = []
            for s in e.get("shared_skills_top") or []:
                sid = resolve(lookup, s, unknown)
                if sid and sid not in required:
                    required.append(sid)
        elif etype == "PROGRESSES_TO":
            union = a | b
            if not a or not b:
                jaccard = 0.0
                method = "no_skill_data: một trong hai role KHONG_CO_TRONG_BAO_CAO → Jaccard=0 → distance=1.0"
            else:
                jaccard = len(inter) / len(union)
                method = "1 - jaccard(hard skill top-10 languages ∪ frameworks)"
            distance = round(max(MIN_DISTANCE, 1.0 - jaccard), 4)
            # top-N skill giao nhau, ưu tiên rank cao ở CẢ 2 role (tổng rank nhỏ nhất)
            ranked = sorted(inter, key=lambda sid: (skill_rank[src].get(sid, 99) + skill_rank[dst].get(sid, 99), sid))
            required = ranked[:REQUIRED_SKILLS_TOP_N]
        else:
            raise SystemExit(f"Loại cạnh lạ: {etype}")

        edges.append({
            "id": f"{etype}:{src}->{dst}",
            "from": src,
            "to": dst,
            "type": etype,
            "distance": distance,
            "distanceMethod": method,
            "requiredSkills": required,
            "sharedSkillCount": len(inter),
            "note": e.get("note"),
        })

    # sort ổn định
    nodes.sort(key=lambda n: n["roleCode"])
    for n in nodes:
        n["absorbedRoles"].sort(key=lambda x: x["roleCode"])
    edges.sort(key=lambda x: x["id"])
    absorbed.sort(key=lambda x: (x["parentRoleCode"], x["roleCode"]))

    payload = {
        "_meta": {
            "generated_at": date.today().isoformat(),
            "generator": "occupation-data/build_role_graph.py",
            "source": "dataset_22_roles_enriched_v3.json + output/skills_taxonomy.json",
            "counts": {
                "nodes": len(nodes),
                "edges": len(edges),
                "edges_by_type": {k: v for k, v in sorted(type_counter.items())},
                "absorbed_aliases": len(absorbed),
                "nodes_without_skill_data": sorted(n["roleCode"] for n in nodes if not n["hasSkillData"]),
            },
            "distance_rules": {
                "SIMILAR": "1 - weight",
                "PROGRESSES_TO": f"max({MIN_DISTANCE}, 1 - Jaccard(skillSet A, skillSet B)); Jaccard=0 nếu thiếu skill data",
                "ABSORBED": "không phải node — ghi ở absorbed[]",
            },
            "note": "39 cạnh ABSORBED trong dataset đều trỏ tới role_code ngoài 22 node (alias tìm kiếm). "
                    "Graph hiển thị 22 node + 64 cạnh SIMILAR/PROGRESSES_TO; alias giữ ở absorbed[] để UI có thể vẽ vệ tinh.",
        },
        "nodes": nodes,
        "edges": edges,
        "absorbed": absorbed,
    }
    with open(OUT_PATH, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)
        f.write("\n")

    print(f"Đã ghi {OUT_PATH}")
    print(f"  nodes={len(nodes)} edges={len(edges)} {dict(type_counter)} absorbed={len(absorbed)}")
    print(f"  node không có skill data: {payload['_meta']['counts']['nodes_without_skill_data']}")
    if unknown:
        print(f"  [warn] {len(unknown)} chuỗi skill KHÔNG resolve được qua taxonomy:")
        for k, v in unknown.most_common():
            print(f"     {v:2}x {k!r}")
    print("  distance PROGRESSES_TO (sample):")
    for e in [x for x in edges if x["type"] == "PROGRESSES_TO"][:8]:
        print(f"     {e['from']:15} -> {e['to']:15} d={e['distance']:.3f} req={e['requiredSkills']}")
    print("  distance SIMILAR (sample):")
    for e in [x for x in edges if x["type"] == "SIMILAR"][:6]:
        print(f"     {e['from']:15} -> {e['to']:15} d={e['distance']:.3f} req={e['requiredSkills']}")
    return 0


if __name__ == "__main__":
    sys.exit(main())

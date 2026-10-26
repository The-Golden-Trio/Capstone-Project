"""Dựng danh mục nghề ngoài IT từ O*NET 31.0, theo cùng khuôn với roles[] trong final_22_roles.json.

Đầu vào:
- occupation-data/external/onet_31_0/: các file của build_onet_profiles.py, thêm task_statements, work_context,
  job_zones, knowledge, related_occupations.
- occupation-data/decisions/onet_merge/*.json: quyết định giữ, gộp, loại cho từng nhóm (giống 78_to_22_roles.csv).
- occupation-data/datasets/onet_vi/: bản tiếng Việt (tên, mô tả, việc hằng ngày, thuật ngữ, hồ sơ nhóm).

Đầu ra: occupation-data/generated/onet_all_roles.json và .md, occupation-data/decisions/onet_to_catalogue.csv.

Nghề ngoài IT: mọi mã có đủ dữ liệu, trừ nhóm 15-1 (máy tính) và các mã 22 nghề IT đang dùng.
Không có dữ liệu Việt Nam (lương, JD, cấp bậc) cho các nghề này; phần chữ tiếng Việt là bản dịch nháp.
"""
import argparse
import collections
import csv
import json
import re
import statistics
import sys
from pathlib import Path

from build_onet_profiles import (
    ATTRIBUTION,
    GENERATED,
    RIASEC,
    ROLES,
    ROOT,
    interest_code,
    profile_of,
    prepare,
    read,
)

VI = ROOT / "datasets" / "onet_vi"
DECISIONS = ROOT / "decisions" / "onet_merge"
DECISIONS_CSV = ROOT / "decisions" / "onet_to_catalogue.csv"
TASKS_PER_ROLE = 5
MAX_DOWNSIDES = 4
MIN_DOWNSIDES = 3
SIMILAR_PER_ROLE = 5
CTP_RULES = {"4.C.3.d.4": ("2", "3"), "4.C.3.d.8": ("3",)}
CTP_MIN_PERCENT = 50.0
ENVIRONMENT_Z = 0.5
INDOORS, OUTDOORS = "4.C.2.a.1.a", "4.C.2.a.1.c"
REGULAR_SCHEDULE_PCT = 5
SENIOR_TITLE = re.compile(r"^First-Line Supervisors|\b(Managers?|Supervisors?)\b|^Chief\b")
ENTRY_TITLE = re.compile(r"\b(Helpers?|Assistants?|Aides?|Apprentices?|Trainees?|Attendants?)\b")


def onet_code(code):
    return f"ONET-{code}"


def load_tables():
    tasks = {}
    for r in read("task_statements"):
        if r["Task Type"] == "Core":
            tasks.setdefault(r["O*NET-SOC Code"], []).append({"task_id": r["Task ID"], "text": r["Task"]})
    context, ctp = {}, {}
    for r in read("work_context"):
        if r["Scale ID"] == "CX":
            context.setdefault(r["O*NET-SOC Code"], {})[r["Element ID"]] = float(r["Data Value"])
        elif r["Scale ID"] == "CTP" and r["Element ID"] in CTP_RULES and r["Category"] in CTP_RULES[r["Element ID"]]:
            row = ctp.setdefault(r["O*NET-SOC Code"], {})
            row[r["Element ID"]] = row.get(r["Element ID"], 0.0) + float(r["Data Value"])
    zones = {r["O*NET-SOC Code"]: r["Job Zone"] for r in read("job_zones")}
    skills, knowledge = {}, {}
    for name in ("essential_skills", "transferable_skills"):
        for r in read(name):
            if r["Scale ID"] == "IM":
                skills.setdefault(r["O*NET-SOC Code"], {})[r["Element Name"]] = float(r["Data Value"])
    for r in read("knowledge"):
        if r["Scale ID"] == "IM":
            knowledge.setdefault(r["O*NET-SOC Code"], {})[r["Element Name"]] = float(r["Data Value"])
    related = {}
    for r in read("related_occupations"):
        if r["Relatedness Tier"] == "Primary-Short":
            related.setdefault(r["O*NET-SOC Code"], []).append(r["Related O*NET-SOC Code"])
    return tasks, context, ctp, zones, skills, knowledge, related


def context_stats(context):
    stats = {}
    elements = {e for row in context.values() for e in row}
    for e in elements:
        values = [row[e] for row in context.values() if e in row]
        stats[e] = (statistics.mean(values), statistics.pstdev(values) or 1.0)
    return stats


def mean_rows(rows):
    """Trung bình theo từng mục của nhiều mã O*NET, bỏ qua mã thiếu mục đó."""
    values = collections.defaultdict(list)
    for row in rows:
        for k, v in row.items():
            values[k].append(v)
    return {k: statistics.mean(v) for k, v in values.items()}


def downsides_of(context_row, ctp_row, rules, stats, group_downsides):
    """Mặt trái theo ba tầng: cao rõ (z ≥ 1, giá trị ≥ 3), cao vừa (z ≥ 0,5, giá trị ≥ 2,5), rồi mới tới mặt trái chung của nhóm."""
    strong, moderate = [], []
    for element, sentence in rules.items():
        if element.startswith("_"):
            continue
        if element in CTP_RULES:
            pct = ctp_row.get(element)
            if pct is not None and pct >= CTP_MIN_PERCENT:
                strong.append({"element_id": element, "text": sentence, "value": round(pct, 1), "unit": "% người trả lời",
                               "basis": "work_context", "rank": pct / 25})
            continue
        value = context_row.get(element)
        if value is None:
            continue
        mean, sd = stats[element]
        z = (value - mean) / sd
        item = {"element_id": element, "text": sentence, "value": round(value, 2), "unit": "thang 1–5", "z": round(z, 2), "rank": z}
        if z >= 1.0 and value >= 3.0:
            strong.append({**item, "basis": "work_context"})
        elif z >= 0.5 and value >= 2.5:
            moderate.append({**item, "basis": "work_context_moderate"})
    found = sorted(strong, key=lambda x: x["rank"], reverse=True)[:MAX_DOWNSIDES]
    if len(found) < MIN_DOWNSIDES:
        found += sorted(moderate, key=lambda x: x["rank"], reverse=True)[:MIN_DOWNSIDES - len(found)]
    for text in group_downsides:
        if len(found) >= MIN_DOWNSIDES:
            break
        found.append({"element_id": None, "text": text, "basis": "group"})
    for f in found:
        f.pop("rank", None)
    return found


def work_environment_of(context_row, ctp_row, rules, stats):
    """Câu mô tả môi trường cho mục Work Context lệch khỏi mặt bằng mọi nghề từ ENVIRONMENT_Z độ lệch chuẩn, cộng giờ làm và lịch làm."""
    facts = []
    for element, rule in rules.items():
        if element.startswith("_") or not isinstance(rule, dict) or element not in context_row:
            continue
        value = context_row[element]
        mean, sd = stats[element]
        z = (value - mean) / sd
        side = "high" if z >= ENVIRONMENT_Z else "low" if z <= -ENVIRONMENT_Z else None
        if side in rule:
            facts.append({"element_id": element, "text": rule[side], "side": side, "value": round(value, 2), "unit": "thang 1–5",
                          "z": round(z, 2)})
    sides = {f["element_id"]: f["side"] for f in facts}
    if sides.get(INDOORS) == "high" and sides.get(OUTDOORS) == "high":
        facts = [{"element_id": f"{INDOORS}+{OUTDOORS}", "text": rules["indoor_outdoor_mixed"], "side": "high"}] + [
            f for f in facts if f["element_id"] not in (INDOORS, OUTDOORS)]
    for key, element in (("hours_over_40", "4.C.3.d.8"), ("irregular_schedule", "4.C.3.d.4")):
        if element in ctp_row:
            pct = ctp_row[element]
            if key == "irregular_schedule" and pct < REGULAR_SCHEDULE_PCT:
                key = "regular_schedule_all"
            facts.append({"element_id": element, "text": rules[key].format(pct=round(pct)), "value": round(pct, 1), "unit": "% người trả lời"})
    return {
        "facts": [f["text"] for f in facts],
        "facts_basis": facts,
        "status": "NHAP_CHO_DUYET",
        "source_note": (
            f"Sinh từ O*NET Work Context (thị trường Mỹ), trung bình các mã của nghề: một câu cho mỗi mục cao hoặc thấp hơn "
            f"mặt bằng mọi nghề từ {ENVIRONMENT_Z} độ lệch chuẩn; giờ làm và lịch làm là tỉ lệ người trả lời."
        ),
    }


def fit_summary_of(riasec, phrases):
    """Câu "hợp với ai" từ hai chiều RIASEC cao nhất và chiều thấp nhất."""
    ordered = sorted(RIASEC, key=lambda k: riasec[k], reverse=True)
    first, second, low = ordered[0], ordered[1], ordered[-1]
    return {
        "text": f"Hợp với người thích {phrases[first]}. Nghề cũng cần {phrases[second]}, nhưng ít cần {phrases[low]}.",
        "top": [first, second],
        "low": low,
        "status": "NHAP_CHO_DUYET",
        "source_note": "Sinh từ điểm sở thích RIASEC (Holland) của O*NET, câu mẫu ở datasets/onet_vi/_terms.json riasec_phrases.",
    }


def career_path_of(main, absorbs, zones, titles, vi, name_vi, manager):
    """Lộ trình nháp từ các mã đã gộp: Job Zone thấp hơn hoặc vị trí phụ việc là vị trí dễ vào hơn, Job Zone cao hơn là chuyên sâu,
    quản lý hoặc giám sát là cấp cao; manager là nghề quản lý của nhóm nếu có."""
    main_zone = int(zones[main]) if main in zones else None
    main_senior = bool(SENIOR_TITLE.search(titles[main]))
    stages = {"de_vao_hon": [], "chuyen_sau": [], "cap_cao": []}
    for c in absorbs:
        zone = int(zones[c]) if c in zones else None
        if SENIOR_TITLE.search(titles[c]) and not main_senior:
            stage = "cap_cao"
        elif main_zone is None or zone is None:
            stage = None
        elif zone < main_zone or (ENTRY_TITLE.search(titles[c]) and zone <= main_zone):
            stage = "de_vao_hon"
        elif zone > main_zone:
            stage = "chuyen_sau"
        else:
            stage = None
        if stage:
            stages[stage].append({"role_code": onet_code(c), "role_name": titles[c],
                                  "role_name_vn": vi.get(c, {}).get("title_vi"), "job_zone": zone})
    steps = []
    if stages["de_vao_hon"]:
        steps.append({"stage": "de_vao_hon", "label_vi": "Vị trí gần, dễ vào hơn", "roles": stages["de_vao_hon"],
                      "basis": "mã gộp có Job Zone thấp hơn hoặc là vị trí phụ việc"})
    steps.append({"stage": "nghe_chinh", "label_vi": "Nghề chính", "roles": [
        {"role_code": onet_code(main), "role_name": titles[main], "role_name_vn": name_vi, "job_zone": main_zone}]})
    if stages["chuyen_sau"]:
        steps.append({"stage": "chuyen_sau", "label_vi": "Chuyên sâu, cần học thêm", "roles": stages["chuyen_sau"],
                      "basis": "mã gộp có Job Zone cao hơn"})
    if stages["cap_cao"]:
        steps.append({"stage": "cap_cao", "label_vi": "Cấp cao", "roles": stages["cap_cao"],
                      "basis": "mã gộp là vị trí quản lý hoặc giám sát"})
    if manager and manager["role_code"] != onet_code(main) and not main_senior:
        steps.append({"stage": "quan_ly", "label_vi": "Lên quản lý", "roles": [manager],
                      "basis": "nghề quản lý chung của nhóm, _terms.json groups[].manager_role"})
    return {
        "steps": steps,
        "status": "NHAP_CHO_DUYET",
        "source_note": (
            "Suy từ quyết định gộp (decisions/onet_merge/) và Job Zone của O*NET; O*NET không có dữ liệu thăng tiến. "
            "Chưa đối chiếu với Việt Nam."
        ),
    }


def top_items(row, names, n=5):
    ordered = sorted(row.items(), key=lambda kv: kv[1], reverse=True)[:n]
    return [{"name": k, "name_vi": names.get(k), "importance": round(v, 2)} for k, v in ordered]


def load_vi():
    terms = json.loads((VI / "_terms.json").read_text(encoding="utf-8"))
    roles = {}
    for path in sorted(VI.glob("[0-9][0-9].json")):
        roles.update(json.loads(path.read_text(encoding="utf-8")))
    return terms, roles


def load_decisions(codes):
    """Đọc quyết định của mọi nhóm và kiểm mỗi mã xuất hiện đúng một lần (giữ, bị gộp hoặc bị loại)."""
    keeps, removes, seen = [], [], collections.Counter()
    for path in sorted(DECISIONS.glob("[0-9][0-9].json")):
        data = json.loads(path.read_text(encoding="utf-8"))
        for k in data["keep"]:
            keeps.append({**k, "group": data["group"], "absorbs": k.get("absorbs", [])})
            seen.update([k["code"], *k.get("absorbs", [])])
        for r in data["remove"]:
            removes.append({**r, "group": data["group"]})
            seen[r["code"]] += 1
    problems = {
        "trùng": sorted(c for c, n in seen.items() if n > 1),
        "không có trong danh mục": sorted(c for c in seen if c not in codes),
        "chưa có quyết định": sorted(c for c in codes if c not in seen),
    }
    problems = {k: v for k, v in problems.items() if v}
    if problems:
        raise SystemExit(f"quyết định gộp chưa hợp lệ: {problems}")
    return keeps, removes


def build():
    prep = prepare()
    titles = prep["titles"]
    descriptions = {r["O*NET-SOC Code"]: r["Description"] for r in read("occupation_data")}
    tasks, context, ctp, zones, skills, knowledge, related = load_tables()
    stats = context_stats(context)
    terms, vi = load_vi()

    it_by_code = {}
    for key, _, codes, _ in ROLES:
        for c in codes:
            it_by_code.setdefault(c, key)
    codes = {c for c in prep["population"] if not c.startswith("15-1") and c not in it_by_code}
    keeps, removes = load_decisions(codes)
    role_of = {}
    for k in keeps:
        for c in [k["code"], *k["absorbs"]]:
            role_of[c] = k["code"]

    def ref(code):
        if code in role_of:
            main = role_of[code]
            name = next(k["name_vi"] for k in keeps if k["code"] == main)
            return {"role_code": onet_code(main), "role_name": titles[main], "role_name_vn": name}
        if code in it_by_code:
            return {"role_code": it_by_code[code], "role_name": titles[code], "role_name_vn": None, "it_role": True}
        return None

    managers = {}
    for key, g in terms["groups"].items():
        if g.get("manager_role"):
            m = g["manager_role"]
            managers[key] = {"role_code": onet_code(m), "role_name": titles[m],
                             "role_name_vn": next(k["name_vi"] for k in keeps if k["code"] == m)}
    progresses_from = collections.defaultdict(list)

    roles, missing = [], []
    for stt, k in enumerate(keeps, start=1):
        main, members = k["code"], [k["code"], *k["absorbs"]]
        group = terms["groups"][k["group"]]
        t = vi.get(main, {})
        p = profile_of(prep, members)
        zone = zones.get(main)
        zone_vi = terms["job_zones"].get(zone) if zone else None
        role_tasks = tasks.get(main, [])[:TASKS_PER_ROLE]
        tasks_vi = t.get("tasks_vi", {})
        context_row = mean_rows([context[c] for c in members if c in context])
        ctp_row = mean_rows([ctp[c] for c in members if c in ctp])
        downs = downsides_of(context_row, ctp_row, terms["downside_rules"], stats, group["downsides"])
        path = career_path_of(main, k["absorbs"], zones, titles, vi, k["name_vi"], managers.get(k["group"]))
        progresses_to = [r["role_code"] for s in path["steps"] if s["stage"] == "quan_ly" for r in s["roles"]]
        for code in progresses_to:
            progresses_from[code].append(onet_code(main))
        summary_vi = k.get("description_vi") or t.get("description_vi")
        if summary_vi and zone_vi:
            summary_vi = f"{summary_vi} Mức chuẩn bị: {zone_vi['label_vi'].lower()}. {zone_vi['education_vi']}"
        absorbed_missing = [c for c in k["absorbs"] if not vi.get(c, {}).get("title_vi")]
        if not summary_vi or any(x["task_id"] not in tasks_vi for x in role_tasks) or absorbed_missing:
            missing.append(main)

        links = collections.Counter()
        for c in members:
            for rc in related.get(c, []):
                r = ref(rc)
                if r and r["role_code"] != onet_code(main):
                    links[r["role_code"]] += 1
        refs = {}
        for c in members:
            for rc in related.get(c, []):
                r = ref(rc)
                if r and r["role_code"] in links:
                    refs.setdefault(r["role_code"], r)
        similar_ranked = [
            {**refs[code], "links": n, "why": "O*NET Related Occupations, tầng Primary-Short"}
            for code, n in links.most_common(SIMILAR_PER_ROLE)
        ]

        roles.append({
            "stt": stt,
            "role_code": onet_code(main),
            "role_name": titles[main],
            "role_name_vn": k["name_vi"],
            "role_group": group["name"],
            "role_group_vn": group["name_vi"],
            "roleplay_experience": None,
            "description": {
                "summary": summary_vi,
                "summary_en": descriptions[main],
                "downsides": [d["text"] for d in downs],
                "downsides_basis": downs,
                "evidence_level": "B_TITLE_SEEN",
                "status": "NHAP_CHO_DUYET",
                "source_note": (
                    "Mô tả dịch từ O*NET 31.0 (thị trường Mỹ), chưa đối chiếu với Việt Nam. Mặt trái sinh từ Work Context, "
                    "lấy trung bình mọi mã O*NET của nghề (xem downsides_basis[].basis): work_context = cao hơn mặt bằng "
                    "mọi nghề từ 1 độ lệch chuẩn; work_context_moderate = từ 0,5 độ lệch chuẩn; group = mặt trái chung "
                    "của nhóm nghề. Bản dịch là nháp, chưa có người duyệt."
                ),
            },
            "tasks": [
                {"task_id": x["task_id"], "text": x["text"], "text_vi": tasks_vi.get(x["task_id"])}
                for x in role_tasks
            ],
            "similar_roles": [
                {
                    "role_code": onet_code(c),
                    "role_name": titles[c],
                    "role_name_vn": vi.get(c, {}).get("title_vi"),
                    "merge_reason": k.get("merge_reason"),
                }
                for c in k["absorbs"]
            ],
            "feeder_roles": [],
            "work_environment_ids": [],
            "work_environment_primary": None,
            "work_environment_note": "Chưa gán mã môi trường: datasets/work_environments.json chỉ có cho nghề IT. Xem work_environment_onet.",
            "work_environment_onet": work_environment_of(context_row, ctp_row, terms["work_environment_rules"], stats),
            "fit_summary": fit_summary_of(p["riasec"], terms["riasec_phrases"]),
            "career_path": path,
            "education_path_ids": [],
            "education_path_primary": None,
            "education_path_note": "Xem job_zone.",
            "job_outlook": None,
            "onet": {
                "codes": members,
                "interest_code": interest_code(p["riasec"]),
                "riasec": {r: round(p["riasec"][r], 3) for r in RIASEC},
                "soft": {g: round(v, 3) for g, v in p["soft"].items()},
                "note": titles[main] if len(members) == 1 else f"{titles[main]}, gộp {len(members) - 1} mã O*NET khác; hồ sơ là trung bình các mã",
                "_source": "O*NET 31.0 (scripts/build_all_onet_profiles.py)",
            },
            "archetype": None,
            "bands": None,
            "levels": [],
            "levels_note": "O*NET không có thang cấp bậc trong nghề; mức chuẩn bị để vào nghề nằm ở job_zone.",
            "job_zone": {"zone": int(zone), **zone_vi} if zone_vi else None,
            "compensation": {
                "_status": "KHONG_CO_DU_LIEU_VN",
                "note": "Chưa có số lương Việt Nam cho nghề này. Báo cáo ITviec chỉ phủ nghề IT.",
            },
            "roleplay_events": {"role_specific": [], "shared_pool_ref": "shared_events", "total_role_specific": 0},
            "graph_edges": {
                "progresses_to": progresses_to,
                "progresses_from": [],
                "similar": [r["role_code"] for r in similar_ranked],
                "absorbed_roles": [onet_code(c) for c in k["absorbs"]],
                "similar_ranked": similar_ranked,
            },
            "skills_status": {
                "_status": "ONET",
                "evidence_level": "B_TITLE_SEEN",
                "hard_skills_top": top_items(mean_rows([skills[c] for c in members if c in skills]), terms["skills"]),
                "knowledge_top": top_items(mean_rows([knowledge[c] for c in members if c in knowledge]), terms["knowledge"]),
                "note": "Kỹ năng và kiến thức quan trọng nhất theo thang Importance của O*NET, trung bình các mã của nghề.",
            },
            "work_life": {
                "evidence_level": None,
                "top_reasons_to_leave": [],
                "gap_note": "Không có khảo sát lý do nghỉ việc cho nghề này.",
            },
        })

    for r in roles:
        r["graph_edges"]["progresses_from"] = progresses_from.get(r["role_code"], [])

    return {
        "_meta": {
            "version": "0.3",
            "role_count": len(roles),
            "onet_codes_total": len(codes),
            "merged_codes": sum(len(k["absorbs"]) for k in keeps),
            "source": "O*NET 31.0 Database (CSV), https://www.onetcenter.org/database.html",
            "licence": "CC BY 4.0",
            "attribution": ATTRIBUTION,
            "scope": "Mọi nghề O*NET có đủ dữ liệu, trừ nhóm 15-1 (máy tính) và các mã 22 nghề IT đang dùng.",
            "merge_rule": (
                "Gộp như 78 → 22 nghề IT: giữ nghề có trải nghiệm riêng, gộp nghề trùng trải nghiệm hoặc ở Việt Nam dùng "
                "chung tên, loại nghề không có ở Việt Nam hoặc quá ít vị trí. Quyết định ở decisions/onet_merge/."
            ),
            "shape": "Cùng khuôn với roles[] của datasets/final_22_roles.json; field không có dữ liệu để rỗng hoặc null.",
            "tasks_rule": f"{TASKS_PER_ROLE} task loại Core đầu tiên của mã chính, theo thứ tự trong task_statements.csv.",
            "translation_status": "NHAP_CHO_DUYET",
            "missing_translation": missing,
            "removed": [
                {"role_code": onet_code(r["code"]), "role_name": titles[r["code"]], "reason_group": r["reason_group"], "reason": r["reason"]}
                for r in removes
            ],
        },
        "groups": {key: {"code": key, **g} for key, g in terms["groups"].items()},
        "roles": roles,
    }, keeps, removes, titles, vi, terms


def decisions_csv(keeps, removes, titles, vi, terms):
    rows = []
    for k in keeps:
        group = terms["groups"][k["group"]]["name"]
        rows.append({
            "nhom": "GROUP 1 - GIU LAI", "role_code": onet_code(k["code"]), "role_name_goc": titles[k["code"]],
            "role_name_vn": k["name_vi"], "role_group": group, "gop_vao_role": "",
            "cac_role_gop_vao_day": "; ".join(titles[c] for c in k["absorbs"]), "so_role_gop": len(k["absorbs"]),
            "nhom_ly_do": "", "ly_do_chi_tiet": "Nghề có trải nghiệm riêng",
        })
    for k in keeps:
        group = terms["groups"][k["group"]]["name"]
        for c in k["absorbs"]:
            rows.append({
                "nhom": "GROUP 2 - GOP", "role_code": onet_code(c), "role_name_goc": titles[c],
                "role_name_vn": vi.get(c, {}).get("title_vi") or "", "role_group": group,
                "gop_vao_role": f"{onet_code(k['code'])} ({k['name_vi']})", "cac_role_gop_vao_day": "", "so_role_gop": 0,
                "nhom_ly_do": "", "ly_do_chi_tiet": k.get("merge_reason", ""),
            })
    for r in removes:
        rows.append({
            "nhom": "GROUP 3 - LOAI BO", "role_code": onet_code(r["code"]), "role_name_goc": titles[r["code"]],
            "role_name_vn": vi.get(r["code"], {}).get("title_vi") or "", "role_group": terms["groups"][r["group"]]["name"],
            "gop_vao_role": "", "cac_role_gop_vao_day": "", "so_role_gop": 0,
            "nhom_ly_do": r["reason_group"], "ly_do_chi_tiet": r["reason"],
        })
    fields = ["nhom", "stt", "role_code", "role_name_goc", "role_name_vn", "role_group", "gop_vao_role",
              "cac_role_gop_vao_day", "so_role_gop", "nhom_ly_do", "ly_do_chi_tiet"]
    with open(DECISIONS_CSV, "w", encoding="utf-8-sig", newline="") as fh:
        writer = csv.DictWriter(fh, fieldnames=fields)
        writer.writeheader()
        for i, row in enumerate(rows, start=1):
            writer.writerow({**row, "stt": i})


def markdown(data):
    roles = data["roles"]
    meta = data["_meta"]
    lines = [
        "# Danh mục nghề ngoài IT (O*NET 31.0)",
        "",
        "> Sinh bởi `occupation-data/scripts/build_all_onet_profiles.py`. Đừng sửa tay; sửa quyết định gộp ở "
        "`decisions/onet_merge/` và bản dịch ở `datasets/onet_vi/`.",
        "> " + " ".join(meta["attribution"]),
        "",
        f"{meta['onet_codes_total']} mã O*NET → {len(roles)} nghề giữ lại, {meta['merged_codes']} mã gộp, "
        f"{len(meta['removed'])} mã loại. Nghề còn thiếu bản dịch: {len(meta['missing_translation'])}.",
        "",
        "| Nhóm | Tên nhóm | Số nghề | Số mã O*NET | Có mức chuẩn bị |",
        "|---|---|---|---|---|",
    ]
    for code, g in data["groups"].items():
        members = [r for r in roles if r["role_group"] == g["name"]]
        if not members:
            continue
        lines.append(
            f"| {code} | {g['name_vi']} | {len(members)} | {sum(len(r['onet']['codes']) for r in members)} | "
            f"{sum(1 for r in members if r['job_zone'])} |"
        )
    basis = collections.Counter(d["basis"] for r in roles for d in r["description"]["downsides_basis"])
    lines += ["", "## Nguồn của mặt trái", "", "| Nguồn | Số mục |", "|---|---|"]
    lines += [f"| {k} | {v} |" for k, v in sorted(basis.items())]
    lines += ["", "## Nghề loại", "", "| Mã | Nghề | Lý do |", "|---|---|---|"]
    lines += [f"| {r['role_code']} | {r['role_name']} | {r['reason_group']}: {r['reason']} |" for r in meta["removed"]]
    return "\n".join(lines) + "\n"


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--export-missing", type=Path, help="ghi danh sách mục chưa dịch ra file JSON để dịch theo lô")
    args = parser.parse_args()
    data, keeps, removes, titles, vi, terms = build()
    if args.export_missing:
        todo = collections.defaultdict(dict)
        descriptions = {r["O*NET-SOC Code"]: r["Description"] for r in read("occupation_data")}
        by_code = {r["onet"]["codes"][0]: r for r in data["roles"]}
        for k in keeps:
            t = vi.get(k["code"], {})
            role = by_code[k["code"]]
            need = {}
            if not k.get("description_vi") and not t.get("description_vi"):
                need["description"] = descriptions[k["code"]]
            missing_tasks = {x["task_id"]: x["text"] for x in role["tasks"] if not x["text_vi"]}
            if missing_tasks:
                need["tasks"] = missing_tasks
            if not t.get("title_vi"):
                need["title"] = titles[k["code"]]
            if need:
                todo[k["code"][:2]][k["code"]] = need
            for c in k["absorbs"]:
                if not vi.get(c, {}).get("title_vi"):
                    todo[c[:2]][c] = {"title": titles[c]}
        args.export_missing.write_text(json.dumps(todo, ensure_ascii=False, indent=1), encoding="utf-8")
        print("exported", sum(len(v) for v in todo.values()), "items to", args.export_missing)
        return
    GENERATED.mkdir(exist_ok=True)
    (GENERATED / "onet_all_roles.json").write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    (GENERATED / "onet_all_roles.md").write_text(markdown(data), encoding="utf-8")
    decisions_csv(keeps, removes, titles, vi, terms)
    print("wrote", GENERATED / "onet_all_roles.json", "roles:", len(data["roles"]),
          "missing translation:", len(data["_meta"]["missing_translation"]))
    print("wrote", DECISIONS_CSV)


if __name__ == "__main__":
    sys.exit(main())

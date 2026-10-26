"""Dựng hồ sơ nghề chuẩn cho 221 nghề (22 IT + 199 ngoài IT), cùng một khuôn.

Đầu vào:
- datasets/final_22_roles.json, datasets/78_roles_unmerged.json (task theo cấp từ JD): nghề IT.
- generated/onet_all_roles.json (chạy build_all_onet_profiles.py trước): 199 nghề ngoài IT.
- external/onet_31_0/ qua build_onet_profiles.py và build_all_onet_profiles.py: phần O*NET của nghề IT.
- datasets/onet_vi/_terms.json, datasets/onet_vi/it.json: chữ tiếng Việt cho phần O*NET.
- decisions/onet_to_vsco.csv: mã nghề Việt Nam.
- generated/vietjobs_stats.json (chạy build_vietjobs_stats.py trước): lương rao và số tin.
- datasets/vn/public_pay.json, datasets/vn/lfs_2024.json: thang lương nhà nước, lương bình quân nhóm nghề.
- datasets/vn/salary_reference.json: lương tham khảo đã duyệt cho nghề ngoài IT chưa có nguồn nào ở trên.
- datasets/vn/it_postings.json, datasets/vn/it_jd_tasks.json: số tin ITviec và task theo cấp từ JD của nghề IT.
- datasets/vn/it_salary_by_years.json: lương trung vị theo vị trí và số năm kinh nghiệm của ITviec.
- research/research_notes/Thang cấp nghề/nghe_di_truoc.csv: lộ trình cấp cao, chuyển ngang của nghề IT (D-121).
- decisions/education_map.json, datasets/vn/education_majors.json: ngành học và giấy phép hành nghề.
- datasets/work_settings.json: nơi làm việc có mã, gán theo luật trong file.

Đầu ra: generated/occupation_profiles.json, generated/occupation_profiles.md (bảng độ phủ) và
generated/occupation_profiles_review.md (lý do của từng quyết định theo từng nghề, để duyệt).

Luật bỏ phần kém tin cậy (plan-ho-so-nghe-chuan_2026-W43.md, mục 1.3): mã Việt Nam độ tin cậy thấp; nhu cầu tuyển IT
độ tin cậy thấp; phần O*NET chép nguyên của nghề IT dùng chung mã với nghề IT khác; bước "dễ vào hơn" của lộ trình;
lương VietJobs dưới MIN_POSTINGS tin; nhu cầu tuyển của nghề dưới MIN_OUTLOOK_POSTINGS tin. Mục không có dữ liệu thì không có trong hồ sơ.
"""
import collections
import csv
import json
import sys

from build_all_onet_profiles import (
    ENVIRONMENT_Z,
    context_stats,
    fit_summary_of,
    load_tables,
    load_vi,
    mean_rows,
    top_items,
    work_environment_of,
)
from build_vietjobs_stats import MIN_POSTINGS
from build_onet_profiles import ATTRIBUTION, GENERATED, RIASEC, ROLES, ROOT, interest_code, prepare, profile_of
from build_point_budgets import PREREQ_FILE

DATASETS = ROOT / "datasets"
DECISIONS = ROOT / "decisions"
TASKS_PER_ROLE = 5
DROPPED_PATH_STAGES = {"de_vao_hon"}
IT_PATH_STAGES = (("cap_cao", "Cấp cao"), ("chuyen_ngang", "Chuyển ngang"))
OUTLOOK_LEVELS = ("thap", "vua", "cao")
MIN_OUTLOOK_POSTINGS = 5
VIETJOBS_DATA_YEAR = "trước 3/2026 (bộ dữ liệu đăng 2/3/2026, không có ngày đăng từng tin)"
ITVIEC_REPORT = "Báo cáo ITviec Vietnam IT Salary & Recruitment Market Report 2025-2026"


def load_json(path):
    return json.loads(path.read_text(encoding="utf-8"))


def settings_of(codes, context, stats, config):
    return settings_with_reasons(codes, context, stats, config)[0]


def settings_with_reasons(codes, context, stats, config):
    """Nơi làm việc theo luật của datasets/work_settings.json, tối đa hai nơi, theo thứ tự luật; kèm luật đã khớp."""
    row = mean_rows([context[c] for c in codes if c in context])
    high = set()
    for name, element in config["_meta"]["context_elements"].items():
        if element in row:
            mean, sd = stats[element]
            if (row[element] - mean) / sd >= ENVIRONMENT_Z:
                high.add(name)
    main = codes[0]
    found, why = [], []
    for rule in config["rules"]:
        if rule.get("fallback") and found:
            continue
        if rule.get("groups") and not any(main.startswith(g) for g in rule["groups"]):
            continue
        if any(main.startswith(e) for e in rule.get("except", [])):
            continue
        if not set(rule.get("context_high", [])) <= high or high & set(rule.get("context_not_high", [])):
            continue
        if rule["setting"] not in found:
            found.append(rule["setting"])
            parts = []
            if rule.get("groups"):
                parts.append("nhóm " + ", ".join(rule["groups"]))
            if rule.get("context_high"):
                parts.append("Work Context cao: " + ", ".join(rule["context_high"]))
            if rule.get("context_not_high"):
                parts.append("không cao: " + ", ".join(rule["context_not_high"]))
            if rule.get("fallback"):
                parts.append("luật dự phòng")
            why.append(f"{rule['setting']} ({'; '.join(parts)})")
    return found[:2], why[:2]


def load_sources():
    vsco = {r["role_code"]: r for r in csv.DictReader(open(DECISIONS / "onet_to_vsco.csv", encoding="utf-8-sig"))}
    majors = load_json(DATASETS / "vn" / "education_majors.json")
    unmerged = load_json(DATASETS / "78_roles_unmerged.json")
    return {
        "it": load_json(DATASETS / "final_22_roles.json"),
        "it_levels": {r["role_code"]: r.get("levels", []) for r in (unmerged["roles"] if isinstance(unmerged, dict) else unmerged)},
        "it_vi": load_json(DATASETS / "onet_vi" / "it.json"),
        "non_it": load_json(GENERATED / "onet_all_roles.json"),
        "vsco": vsco,
        "vietjobs": load_json(GENERATED / "vietjobs_stats.json"),
        "public": load_json(DATASETS / "vn" / "public_pay.json"),
        "lfs": load_json(DATASETS / "vn" / "lfs_2024.json"),
        "it_postings": load_json(DATASETS / "vn" / "it_postings.json"),
        "it_jd": load_json(DATASETS / "vn" / "it_jd_tasks.json"),
        "it_salary": load_json(DATASETS / "vn" / "it_salary_by_years.json"),
        "salary_ref": load_json(DATASETS / "vn" / "salary_reference.json"),
        "edu": load_json(DECISIONS / "education_map.json"),
        "settings": load_json(DATASETS / "work_settings.json"),
        "prereq": list(csv.DictReader(open(PREREQ_FILE, encoding="utf-8-sig"))),
        "majors": {
            "university": {m["name"]: m for m in majors["university"]},
            "vocational": {m["name"]: m for m in majors["vocational"]},
        },
    }


def it_onet(src):
    """Phần O*NET của 22 nghề IT. shared_with: nghề IT đứng trước trong ROLES có cùng bộ mã (mọi phần O*NET giống hệt).
    tasks_shared_with: nghề IT đứng trước có cùng mã chính (task chỉ lấy từ mã chính nên chép nguyên)."""
    prep = prepare()
    tasks, context, ctp, zones, skills, knowledge, _ = load_tables()
    stats = context_stats(context)
    terms, _ = load_vi()
    owner, task_owner, out = {}, {}, {}
    for key, _, codes, _ in ROLES:
        p = profile_of(prep, codes)
        main = codes[0]
        owner.setdefault(tuple(sorted(codes)), key)
        task_owner.setdefault(main, key)
        tasks_vi = src["it_vi"].get(main, {}).get("tasks_vi", {})
        out[key] = {
            "codes": codes,
            "shared_with": owner[tuple(sorted(codes))] if owner[tuple(sorted(codes))] != key else None,
            "tasks_shared_with": task_owner[main] if task_owner[main] != key else None,
            "riasec": p["riasec"],
            "soft": p["soft"],
            "work_environment": work_environment_of(
                mean_rows([context[c] for c in codes if c in context]),
                mean_rows([ctp[c] for c in codes if c in ctp]),
                terms["work_environment_rules"], stats),
            "fit_summary": fit_summary_of(p["riasec"], terms["riasec_phrases"]),
            "job_zone": {"zone": int(zones[main]), **terms["job_zones"][zones[main]]} if main in zones else None,
            "skills": top_items(mean_rows([skills[c] for c in codes if c in skills]), terms["skills"]),
            "knowledge": top_items(mean_rows([knowledge[c] for c in codes if c in knowledge]), terms["knowledge"]),
            "tasks": [tasks_vi[t["task_id"]] for t in tasks.get(main, [])[:TASKS_PER_ROLE] if t["task_id"] in tasks_vi],
        }
    return out


def scored(items):
    return [{"name_vn": x["name_vi"], "name": x["name"], "score": x["importance"]} for x in items]


def vsco_of(src, role_code):
    row = src["vsco"].get(role_code)
    if not row or row["confidence"] == "thap":
        return None
    return {"code": row["vsco_code"], "name": row["vsco_name"], "confidence": row["confidence"]}


def public_pay(src, role_code):
    key = src["public"]["roles"].get(role_code)
    if not key:
        return None
    scale, base = src["public"]["scales"][key], src["public"]["_meta"]["base_salary_vnd"]
    out = {
        "label_vn": scale["label_vn"],
        "monthly_vnd": {"low": int(round(scale["coef_low"] * base, -3)), "high": int(round(scale["coef_high"] * base, -3))},
        "law": scale["law"],
        "source": f"{scale['law']}; lương cơ sở {base:,} đ ({src['public']['_meta']['base_salary_law']})".replace(f"{base:,}", f"{base:,}".replace(",", ".")),
        "data_year": "2026",
        "status": scale["status"],
        "excludes": "Chưa gồm phụ cấp ưu đãi nghề, thâm niên, khu vực.",
    }
    if scale.get("allowance_note"):
        out["allowance_note"] = scale["allowance_note"]
    return out


def group_average(src, vsco):
    if not vsco or vsco["code"][0] == "0":
        return None
    group = src["lfs"]["income_by_occupation_group"]["groups"].get(vsco["code"][0])
    if not group:
        return None
    return {"average": int(round(group["all"] * 1000, -3)), "group_vn": group["name"]}


def pay_non_it(src, role_code, vsco):
    vj = src["vietjobs"]["roles"].get(role_code, {}).get("pay_million_vnd")
    public = public_pay(src, role_code)
    ref = src["salary_ref"]["roles"].get(role_code)
    avg = group_average(src, vsco)
    if vj:
        stats = src["vietjobs"]["roles"][role_code]
        pay = {
            "monthly_vnd": {"low": vj["p25"] * 1e6, "median": vj["median"] * 1e6, "high": vj["p75"] * 1e6},
            "basis": "job_postings", "n": stats["with_pay"],
            "source": "Bộ dữ liệu tin tuyển dụng VietJobs (HuggingFace dinhieufam/VietJobs)", "data_year": VIETJOBS_DATA_YEAR,
            "note": "Lương rao trên tin tuyển dụng (P25, trung vị, P75), không phải lương thực nhận.",
        }
        source = {"evidence": "B", "source": src["vietjobs"]["_meta"]["source"]}
    elif public:
        pay = {"monthly_vnd": public["monthly_vnd"], "basis": "public_scale", "source": public["source"],
               "data_year": public["data_year"], "note": public["label_vn"]}
        source = {"evidence": "A" if public["status"] == "van_ban" else "B", "source": public["law"]}
    elif ref:
        money = dict(ref["monthly_vnd"])
        if ref["stat"] == "average" and "median" in money:
            money["average"] = money.pop("median")
        pay = {"monthly_vnd": money, "basis": "reference", "stat": ref["stat"], "quality": ref["quality"],
               "source": ref["source"], "url": ref["url"], "data_year": ref["date"][:4] if ref.get("date") else "không ghi năm",
               "collected": src["salary_ref"]["_meta"]["collected"][:10]}
        for k in ("mid_kind", "by_experience", "date", "note"):
            if k in ref:
                pay[k] = ref[k]
        source = {"evidence": "A" if ref["quality"] == "tot" else "B", "source": ref["source"], "url": ref["url"]}
    elif avg:
        pay = {"monthly_vnd": {"average": avg["average"]}, "basis": "group_average",
               "source": src["lfs"]["_meta"]["source"] + ", biểu 3.5", "data_year": "2024",
               "note": f"Thu nhập bình quân của nhóm nghề \"{avg['group_vn']}\", không riêng nghề này."}
        source = {"evidence": "B", "source": src["lfs"]["_meta"]["source"]}
    else:
        return None, None
    for k in ("low", "median", "high"):
        if k in pay["monthly_vnd"]:
            pay["monthly_vnd"][k] = int(round(pay["monthly_vnd"][k], -3))
    if public and pay["basis"] != "public_scale":
        pay["public_sector"] = public
    return pay, source


def pay_it(src, role):
    """Nghề có dòng trong bảng vị trí × năm kinh nghiệm của ITviec dùng trung vị của đúng dòng đó; nghề khác giữ số
    ITviec ở mục khác của báo cáo (theo loại công ty hay nhóm kinh nghiệm), ghi trong final_22_roles.json."""
    table = src["it_salary"]
    position = table["role_map"].get(role["role_code"])
    if position:
        row = table["rows"][position]
        pay = {"basis": "itviec", "itviec_position": position,
               "monthly_vnd": {"median": int(round(row["total"] * 1e6, -3))},
               "by_years": [{"years": b, "median": int(round(v * 1e6, -3))}
                            for b, v in zip(table["buckets"], row["by_years"]) if v is not None],
               "source": ITVIEC_REPORT, "url": table["_meta"]["url"], "data_year": "2025–2026",
               "note": "Trung vị lương tháng của đúng vị trí này theo số năm kinh nghiệm; trang không ghi gross hay net."}
        return pay, {"evidence": "A", "source": table["_meta"]["source"]}
    level = (role.get("compensation") or {}).get("role_level_salary") or {}
    if not level.get("avg"):
        return None, None
    pay = {"basis": "itviec", "monthly_vnd": {"average": level["avg"]}, "source": ITVIEC_REPORT, "data_year": "2025–2026"}
    if level.get("note"):
        pay["note"] = level["note"]
    return pay, {"evidence": "A", "source": ITVIEC_REPORT}


def outlook_levels(src):
    """Chia nghề có luật khớp tin thành ba mức theo số tin trên 10.000 tin (tam phân vị)."""
    shares = sorted(s["share_per_10k"] for s in src["vietjobs"]["roles"].values() if s["postings"] >= MIN_OUTLOOK_POSTINGS)
    cut = (shares[len(shares) // 3], shares[2 * len(shares) // 3])
    return lambda share: OUTLOOK_LEVELS[(share > cut[0]) + (share > cut[1])]


def education(src, role_code, job_zone):
    entry = src["edu"]["roles"].get(role_code, {})
    out = {}
    if job_zone:
        out["preparation"] = {"zone": job_zone["zone"], "label_vn": job_zone["label_vi"], "education_vn": job_zone["education_vi"],
                              "note": "Theo O*NET (Mỹ)."}
    for key in ("university", "vocational"):
        found = [src["majors"][key][n] for n in entry.get(key, [])]
        if found:
            out[f"majors_{key}"] = [
                {"code": m["code"], "name": m["name"], **({"levels": m["levels"]} if "levels" in m else {})} for m in found
            ]
    if entry.get("licence"):
        out["licence"] = src["edu"]["licences"][entry["licence"]]
    if entry.get("note"):
        out["note"] = entry["note"]
    return out


def check_education(src, role_codes):
    problems = []
    for code, entry in src["edu"]["roles"].items():
        if code not in role_codes:
            problems.append(f"{code}: không có trong danh mục nghề")
        for key in ("university", "vocational"):
            problems += [f"{code}: không có ngành '{n}' trong danh mục {key}" for n in entry.get(key, []) if n not in src["majors"][key]]
        if entry.get("licence") and entry["licence"] not in src["edu"]["licences"]:
            problems.append(f"{code}: không có giấy phép '{entry['licence']}'")
    problems += [f"{c}: chưa gán ngành học" for c in role_codes if c not in src["edu"]["roles"]]
    if problems:
        raise SystemExit("education_map.json chưa hợp lệ:\n" + "\n".join(problems))


def it_profile(src, role, onet, it_level_of):
    code = role["role_code"]
    shared = onet["shared_with"]
    desc = role.get("description") or {}
    vsco = vsco_of(src, code)
    profile = {
        "role_code": code, "role_name_vn": role["role_name_vn"], "role_name": role["role_name"],
        "role_group_vn": "Công nghệ thông tin", "is_it": True,
        "codes": {"onet": onet["codes"], **({"vsco": vsco} if vsco else {})},
        "overview": {"summary": desc.get("summary"), "downsides": desc.get("downsides", [])},
        "interests": {"interest_code": interest_code(onet["riasec"]), "riasec": {r: round(onet["riasec"][r], 3) for r in RIASEC}},
    }
    sources = {"overview": {"evidence": "C", "status": desc.get("status"), "source": "Nhóm soạn từ JD và báo cáo ITviec"}}
    if not shared:
        profile["overview"]["fit_summary"] = onet["fit_summary"]["text"]
    else:
        profile["onet_shared_with"] = shared

    levels = [l for l in src["it_levels"].get(code, []) if l.get("tasks")]
    jd = src["it_jd"]["roles"].get(code)
    if levels:
        profile["daily_work"] = {"by_level": [{"band": l["band"], "title_vn": l.get("title_vn"), "tasks": l["tasks"]} for l in levels]}
        sources["daily_work"] = {"evidence": "A", "source": "JD đã xác minh (datasets/78_roles_unmerged.json)"}
    elif jd:
        profile["daily_work"] = {"by_level": [{"band": l["band"], "tasks": l["tasks"]} for l in jd["by_level"]]}
        sources["daily_work"] = {"evidence": "B", "status": src["it_jd"]["_meta"]["status"],
                                 "source": f"{len(jd['sources'])} JD ở Việt Nam (datasets/vn/it_jd_tasks.json)"}
    elif not onet["tasks_shared_with"] and onet["tasks"]:
        profile["daily_work"] = {"tasks": onet["tasks"]}
        sources["daily_work"] = {"evidence": "B", "source": "O*NET 31.0, dịch nháp (datasets/onet_vi/it.json)"}

    skills = {}
    if not shared:
        skills["hard"] = scored(onet["skills"])
        skills["knowledge"] = scored(onet["knowledge"])
        skills["soft"] = {g: round(v, 3) for g, v in onet["soft"].items()}
        sources["skills.hard"] = {"evidence": "B", "source": "O*NET 31.0 (Mỹ), thang Importance"}
    if skills:
        profile["skills"] = skills

    env = {}
    settings = settings_of(onet["codes"], *src["context"], src["settings"])
    if settings:
        env["settings"] = settings
    if role.get("work_environment_ids"):
        env["company_types"] = role["work_environment_ids"]
    if not shared:
        env["facts"] = onet["work_environment"]["facts"]
    if env:
        profile["work_environment"] = env

    edu = education(src, code, onet["job_zone"])
    if edu:
        profile["education"] = edu

    career = {}
    levels = role.get("levels") or []
    if levels:
        career["levels"] = [{"band": l["band"], "title_vn": l.get("title_vn"), "years": l.get("years_experience"),
                             "core_output": l.get("core_output")} for l in levels]
    # Lộ trình nghề IT lấy từ nghề đi trước của D-121: các nghề nhận nghề này làm nghề đi trước.
    path = [{"stage": "nghe_chinh", "label_vn": "Nghề chính", "roles": [{"role_code": code}]}]
    for stage, label in IT_PATH_STAGES:
        roles = [{"role_code": r["role_code"]} for r in src["prereq"]
                 if r["loai"] == stage and code in r["nghe_di_truoc"].split(";")]
        if roles:
            path.append({"stage": stage, "label_vn": label, "roles": roles})
    if len(path) > 1:
        career["path"] = path
    edges = role.get("graph_edges") or {}
    if edges.get("progresses_to"):
        career["progresses_to"] = edges["progresses_to"]
    if edges.get("similar_ranked"):
        career["similar"] = [{"role_code": s["role_code"], "why": s.get("why")} for s in edges["similar_ranked"]]
    # Tên tiếng Việt của nghề gần được điền ở build(), sau khi có đủ 221 hồ sơ.
    if career:
        profile["career"] = career

    pay, source = pay_it(src, role)
    if pay:
        public = public_pay(src, code)
        if public:
            pay["public_sector"] = public
        profile["pay"] = pay
        sources["pay"] = source

    count = src["it_postings"]["roles"].get(code)
    if count:
        measured = src["it_postings"]["_meta"]["measured_at"]
        profile["outlook"] = {"open_postings": count["open_postings"], "board": "ITviec", "keyword": count["slug"],
                              "source": "ITviec, số tin đang mở", "data_year": measured[:4], "measured_at": measured,
                              "level": it_level_of(count["open_postings"])}
        sources["outlook"] = {"evidence": "B", "source": src["it_postings"]["_meta"]["source"]}
    profile["sources"] = sources
    return profile


def non_it_profile(src, role, level_of):
    code = role["role_code"]
    desc = role["description"]
    vsco = vsco_of(src, code)
    profile = {
        "role_code": code, "role_name_vn": role["role_name_vn"], "role_name": role["role_name"],
        "role_group_vn": role["role_group_vn"], "is_it": False,
        "codes": {"onet": role["onet"]["codes"], **({"vsco": vsco} if vsco else {})},
        "overview": {"summary": desc["summary"], "fit_summary": role["fit_summary"]["text"], "downsides": desc["downsides"]},
        "interests": {"interest_code": role["onet"]["interest_code"], "riasec": role["onet"]["riasec"]},
    }
    sources = {"overview": {"evidence": "C", "status": desc["status"], "source": "Dịch nháp từ O*NET 31.0; mặt trái suy từ Work Context"}}
    tasks = [t["text_vi"] for t in role["tasks"] if t.get("text_vi")]
    if tasks:
        profile["daily_work"] = {"tasks": tasks}
        sources["daily_work"] = {"evidence": "B", "source": "O*NET 31.0, dịch nháp"}
    ss = role["skills_status"]
    profile["skills"] = {"hard": scored(ss["hard_skills_top"]), "knowledge": scored(ss["knowledge_top"]),
                         "soft": role["onet"]["soft"]}
    sources["skills.hard"] = {"evidence": "B", "source": "O*NET 31.0 (Mỹ), thang Importance"}
    profile["work_environment"] = {"facts": role["work_environment_onet"]["facts"]}
    settings = settings_of(role["onet"]["codes"], *src["context"], src["settings"])
    if settings:
        profile["work_environment"]["settings"] = settings

    edu = education(src, code, role.get("job_zone"))
    if edu:
        profile["education"] = edu

    career = {}
    path = [s for s in role["career_path"]["steps"] if s["stage"] not in DROPPED_PATH_STAGES]
    if len(path) > 1:
        career["path"] = [{"stage": s["stage"], "label_vn": s["label_vi"],
                           "roles": [{"role_code": r["role_code"], "role_name_vn": r.get("role_name_vn")} for r in s["roles"]]}
                          for s in path]
    edges = role["graph_edges"]
    if edges.get("progresses_to"):
        career["progresses_to"] = edges["progresses_to"]
    if edges.get("similar_ranked"):
        career["similar"] = [{"role_code": s["role_code"], "role_name_vn": s.get("role_name_vn"), "why": s.get("why")}
                             for s in edges["similar_ranked"]]
    if career:
        profile["career"] = career

    pay, source = pay_non_it(src, code, vsco)
    if pay:
        profile["pay"] = pay
        sources["pay"] = source

    vj = src["vietjobs"]["roles"].get(code)
    if vj is not None and vj["postings"] >= MIN_OUTLOOK_POSTINGS:
        profile["outlook"] = {"postings_per_10k": vj["share_per_10k"], "postings": vj["postings"], "level": level_of(vj["share_per_10k"]),
                              "source": "Bộ dữ liệu tin tuyển dụng VietJobs (HuggingFace dinhieufam/VietJobs)", "data_year": VIETJOBS_DATA_YEAR,
                              "note": "Số tin của nghề trên 10.000 tin tuyển dụng trong bộ VietJobs; chỉ báo tương đối, "
                                      "nghiêng về việc văn phòng ở Hà Nội và TP.HCM."}
        sources["outlook"] = {"evidence": "B", "source": src["vietjobs"]["_meta"]["source"]}
    profile["sources"] = sources
    return profile


LABEL_VN = {"thap": "thấp", "vua": "vừa", "cao": "cao", "tot": "tốt", "yeu": "yếu"}


def clean(text):
    return text.rstrip(". ")


def money(v):
    return f"{v / 1e6:.1f}".replace(".", ",") + "tr"


def pay_text(pay):
    m = pay.get("monthly_vnd", {})
    if "average" in m and len(m) == 1:
        return f"trung bình {money(m['average'])}"
    parts = []
    if "low" in m and "high" in m:
        parts.append(f"{money(m['low'])}–{money(m['high'])}")
    elif "high" in m:
        parts.append(f"tới {money(m['high'])}")
    if "median" in m:
        parts.append(f"giữa {money(m['median'])}")
    if "average" in m:
        parts.append(f"trung bình {money(m['average'])}")
    return ", ".join(parts)


def review_lines(src, raw, profile, onet_it):
    """Lý do của từng quyết định cho một nghề, dựng lại từ dữ liệu đầu vào."""
    code = profile["role_code"]
    out = [f"### {profile['role_name_vn']} (`{code}`)", "", "- [ ] Đã duyệt"]

    if profile["is_it"]:
        o = onet_it[code]
        note = next(n for k, _, _, n in ROLES if k == code)
        out.append(f"- **Mã O\\*NET:** {', '.join(o['codes'])}. Gán theo `ROLES` trong build_onet_profiles.py: {clean(note)}.")
        if o["shared_with"]:
            out.append(f"  - Cùng bộ mã với `{o['shared_with']}` nên bỏ câu môi trường, câu \"hợp với ai\", kỹ năng, kiến thức O\\*NET (chép nguyên).")
        if o["tasks_shared_with"]:
            out.append(f"  - Mã chính trùng với `{o['tasks_shared_with']}` nên không dùng task O\\*NET; task lấy từ JD nếu có.")
    else:
        codes = raw["onet"]["codes"]
        absorbed = raw.get("similar_roles", [])
        if absorbed:
            names = "; ".join(f"{a['role_name_vn'] or a['role_name']}" for a in absorbed)
            out.append(f"- **Gộp O\\*NET:** mã chính {codes[0]} và {len(absorbed)} mã gộp vào ({names}). "
                       f"Lý do gộp: {clean(absorbed[0].get('merge_reason') or 'không ghi')} (decisions/onet_merge/{codes[0][:2]}.json).")
        else:
            out.append(f"- **Gộp O\\*NET:** chỉ một mã {codes[0]}, không gộp.")

    row = src["vsco"].get(code)
    if row:
        if row["basis"] == "sua_tay":
            why = f"sửa tay: {clean(row['reason'])}"
        else:
            why = (f"giữ đề xuất tự động; mã ISCO {row['isco08_auto']} chiếm {float(row['share_auto']):.0%} liên kết ESCO "
                   f"của mã O\\*NET chính")
        verdict = ("**bỏ khỏi hồ sơ** vì độ tin cậy thấp" if row["confidence"] == "thap"
                   else f"độ tin cậy {LABEL_VN[row['confidence']]}")
        out.append(f"- **Mã nghề Việt Nam:** {row['vsco_code']} {row['vsco_name']} — {why}; {verdict}.")

    pay = profile.get("pay")
    if profile["is_it"]:
        if pay and pay.get("itviec_position"):
            out.append(f"- **Lương:** báo cáo ITviec 2025–2026, dòng \"{pay['itviec_position']}\" của bảng vị trí × năm kinh nghiệm: "
                       f"{pay_text(pay)}, {len(pay['by_years'])} mốc năm có số.")
        elif pay:
            out.append(f"- **Lương:** báo cáo ITviec 2025–2026, bảng vị trí không có dòng cho nghề này; dùng số ở mục khác: "
                       f"{pay_text(pay)}" + (f" ({clean(pay['note'])})" if pay.get("note") else "") + ".")
        else:
            out.append("- **Lương:** báo cáo ITviec 2025–2026 không có số cho nghề này.")
        if pay and pay.get("public_sector"):
            out.append(f"  - Thêm thang viên chức để so: {pay_text(pay['public_sector'])}.")
    else:
        vj = src["vietjobs"]["roles"].get(code)
        chain = []
        if vj is None:
            chain.append("VietJobs: không có luật khớp chức danh (nghề chủ yếu tuyển ở khu vực nhà nước hoặc không đăng tin)")
        elif not vj["pay_million_vnd"]:
            chain.append(f"VietJobs: {vj['with_pay']} tin có lương, cần từ {MIN_POSTINGS} tin, không dùng")
        public_key = src["public"]["roles"].get(code)
        if pay and pay["basis"] != "job_postings" and not public_key:
            chain.append("không thuộc thang lương nhà nước trong public_pay.json")
        ref = src["salary_ref"]["roles"].get(code)
        unverified = src["salary_ref"]["unverified"].get(code)
        not_found = src["salary_ref"]["not_found"].get(code)
        if pay:
            basis = pay["basis"]
            if basis == "job_postings":
                pick = f"dùng lương rao VietJobs ({pay['n']} tin có lương): {pay_text(pay)}"
            elif basis == "public_scale":
                pick = f"dùng thang lương nhà nước \"{src['public']['scales'][public_key]['label_vn']}\": {pay_text(pay)}, chưa gồm phụ cấp"
            elif basis == "reference":
                pick = (f"dùng lương tham khảo: {pay_text(pay)} — {ref['source']}"
                        f"{', ' + ref['date'] if ref.get('date') else ''}; loại {ref['kind']}, chất lượng **{LABEL_VN[ref['quality']]}**"
                        f"{'. ' + clean(ref['note']) if ref.get('note') else ''}")
            else:
                reason = (f"số chưa xác nhận ({unverified.split(' — ')[0]})" if unverified
                          else clean(not_found[0].lower() + not_found[1:]) if not_found else "không tìm được lương tham khảo")
                pick = f"dùng trung bình nhóm nghề ({pay_text(pay)}) vì {reason}"
            chain.append(pick)
            if pay.get("public_sector") and basis != "public_scale":
                chain.append(f"kèm thang nhà nước để so: {pay_text(pay['public_sector'])}")
        else:
            chain.append("**không có lương**: mã nghề Việt Nam bị bỏ nên không lấy được trung bình nhóm, và không có nguồn nào khác")
        if pay:
            chain.append(f"năm số liệu: {pay['data_year']}")
        out.append("- **Lương:** " + "; ".join(chain) + ".")

    outlook = profile.get("outlook")
    if profile["is_it"]:
        c = src["it_postings"]["roles"].get(code)
        out.append(f"- **Nhu cầu tuyển:** {c['open_postings']} tin trên ITviec, từ khoá `{c['slug']}`, ngày {src['it_postings']['_meta']['measured_at']}; "
                   f"mức {LABEL_VN[outlook['level']]} so với 22 nghề IT." + (f" {c['note']}" if c.get("note") else ""))
    else:
        vj = src["vietjobs"]["roles"].get(code)
        if outlook:
            out.append(f"- **Nhu cầu tuyển:** {outlook['postings']} tin trong VietJobs ({outlook['postings_per_10k']}/10.000 tin), "
                       f"mức {LABEL_VN[outlook['level']]}; năm số liệu: {outlook['data_year']}.")
        elif vj is None:
            out.append("- **Nhu cầu tuyển:** không có mục này; nghề không có luật khớp tin (chủ yếu tuyển qua thi công chức, công an, hoặc không đăng tin).")
        else:
            out.append(f"- **Nhu cầu tuyển:** **bỏ**, chỉ {vj['postings']} tin (cần từ {MIN_OUTLOOK_POSTINGS}); bộ dữ liệu không phủ ngành này.")

    dw = profile["sources"].get("daily_work")
    if dw:
        out.append(f"- **Việc hằng ngày:** {dw['source']}" + (" (nháp)" if dw.get("status") else "") + ".")
    else:
        out.append("- **Việc hằng ngày:** không có.")

    settings, why = settings_with_reasons(profile["codes"]["onet"], *src["context"], src["settings"])
    names = ", ".join(src["settings"]["settings"][x]["name_vn"] for x in settings)
    out.append(f"- **Nơi làm việc:** {names} — luật khớp: {'; '.join(why)}.")

    entry = src["edu"]["roles"].get(code, {})
    edu = []
    if entry.get("university"):
        edu.append("đại học: " + ", ".join(entry["university"]))
    if entry.get("vocational"):
        edu.append("cao đẳng, trung cấp: " + ", ".join(entry["vocational"]))
    if entry.get("licence"):
        edu.append("giấy phép: " + src["edu"]["licences"][entry["licence"]]["name"])
    if entry.get("note"):
        edu.append("ghi chú: " + clean(entry["note"]))
    out.append("- **Ngành học (nhóm tự gán, decisions/education_map.json):** " + ("; ".join(edu) if edu else "không gán ngành") + ".")

    if not profile["is_it"]:
        dropped = [s for s in raw["career_path"]["steps"] if s["stage"] in DROPPED_PATH_STAGES]
        path = profile.get("career", {}).get("path")
        text = (" → ".join(f"{s['label_vn']} ({len(s['roles'])})" for s in path) if path else "chỉ có nghề chính, không hiện lộ trình")
        if dropped:
            text += f"; bỏ bước \"dễ vào hơn\" ({len(dropped[0]['roles'])} mã)"
        out.append(f"- **Lộ trình (suy từ quyết định gộp và Job Zone):** {text}.")

    drafts = [k for k, v in profile["sources"].items() if v.get("evidence") == "C" or v.get("status")]
    if drafts:
        out.append("- **Phần nháp cần đọc kỹ:** " + ", ".join(drafts) + ".")
    out.append("")
    return out


def review_markdown(src, data, raw_by_code, onet_it):
    meta = data["_meta"]
    lines = [
        "# Duyệt hồ sơ nghề chuẩn: lý do từng quyết định",
        "",
        "> Sinh bởi `occupation-data/scripts/build_occupation_profiles.py`. Đừng sửa tay; muốn đổi quyết định thì sửa file gốc ghi trong từng dòng rồi chạy lại.",
        "> Cách duyệt: đọc từng nghề, đánh dấu `[x]` khi đồng ý; chỗ không đồng ý ghi ngay dưới dòng đó.",
        "",
        "## Logic chung",
        "",
        "**Lương nghề ngoài IT**, lấy nguồn đầu tiên có trong thứ tự:",
        f"1. Lương rao VietJobs khi nghề có từ {MIN_POSTINGS} tin có lương (P25, trung vị, P75 của trung điểm khoảng lương).",
        f"2. Thang lương nhà nước (hệ số × lương cơ sở {src['public']['_meta']['base_salary_vnd']:,} đ) cho nghề chủ yếu ở khu vực nhà nước, "
        "theo `datasets/vn/public_pay.json`.".replace(",", "."),
        "3. Lương tham khảo đã duyệt trong `datasets/vn/salary_reference.json`: chỉ nhận số đã mở trang đọc được, từ năm 2022; chất lượng tốt (khảo sát có mẫu, thang nhà nước, thống kê đúng nghề), vừa (bài hướng nghiệp, từ 3 tin), yếu (số mô hình WageIndicator, 1–2 tin, số đại diện cho ngành rộng hơn).",
        "4. Trung bình nhóm nghề cấp 1 của Cục Thống kê 2024 theo mã nghề Việt Nam.",
        "",
        "**Lương nghề IT:** báo cáo ITviec 2025–2026: trung vị theo vị trí và số năm kinh nghiệm khi bảng có dòng cho nghề; nếu không, số ở mục khác của báo cáo. Không dùng lương theo cấp của toàn ngành.",
        "",
        f"**Nhu cầu tuyển:** IT đếm tin trên ITviec cùng ngày, chia ba mức theo tam phân vị trong 22 nghề IT. Ngoài IT là số tin trên 10.000 tin VietJobs, bỏ khi dưới {MIN_OUTLOOK_POSTINGS} tin, chia ba mức theo tam phân vị.",
        "",
        f"**Mã nghề Việt Nam:** nối O\\*NET → ESCO → ISCO-08 → mã Việt Nam cùng số; "
        f"{sum(1 for r in src['vsco'].values() if r['basis'] == 'sua_tay')} dòng sửa tay có lý do; bỏ dòng độ tin cậy thấp (decisions/onet_to_vsco.csv).",
        "",
        "**Việc hằng ngày:** IT ưu tiên task theo cấp từ JD đã xác minh (78_roles_unmerged.json), rồi task tóm từ JD mới (it_jd_tasks.json), rồi task O\\*NET dịch nháp. Ngoài IT là 5 task Core đầu của mã O\\*NET chính, dịch nháp.",
        "",
        "**Nơi làm việc:** luật trong `datasets/work_settings.json`, theo thứ tự, tối đa hai nơi; luật dự phòng chỉ áp khi chưa khớp luật nào.",
        "",
        "**Đã bỏ trên toàn bộ:**",
    ]
    lines += [f"- {x}" for x in meta["dropped"]]
    lines += [""]
    groups = collections.OrderedDict()
    for p in data["profiles"]:
        groups.setdefault(p["role_group_vn"], []).append(p)
    for group, items in groups.items():
        lines += [f"## {group} ({len(items)} nghề)", ""]
        for p in items:
            lines += review_lines(src, raw_by_code.get(p["role_code"]), p, onet_it)
    return "\n".join(lines) + "\n"


def coverage(profiles):
    def has(p, path):
        cur = p
        for k in path.split("."):
            if not isinstance(cur, dict) or k not in cur:
                return False
            cur = cur[k]
        return bool(cur)

    fields = [
        ("Tóm tắt", "overview.summary"), ("Hợp với ai", "overview.fit_summary"), ("Mặt trái", "overview.downsides"),
        ("Mã nghề Việt Nam", "codes.vsco"), ("Việc hằng ngày", "daily_work"), ("Kỹ năng O*NET", "skills.hard"),
        ("Kiến thức", "skills.knowledge"), ("Môi trường: câu mô tả", "work_environment.facts"),
        ("Nơi làm việc", "work_environment.settings"), ("Kiểu công ty (IT)", "work_environment.company_types"), ("Mức chuẩn bị", "education.preparation"),
        ("Ngành đại học", "education.majors_university"), ("Ngành cao đẳng, trung cấp", "education.majors_vocational"),
        ("Giấy phép hành nghề", "education.licence"), ("Thang cấp", "career.levels"), ("Lộ trình", "career.path"),
        ("Thăng tiến", "career.progresses_to"), ("Nghề gần", "career.similar"), ("Lương", "pay"),
        ("Nhu cầu tuyển", "outlook"),
    ]
    rows = []
    for label, path in fields:
        it = sum(1 for p in profiles if p["is_it"] and has(p, path))
        non = sum(1 for p in profiles if not p["is_it"] and has(p, path))
        rows.append({"field": label, "path": path, "it": it, "non_it": non})
    basis = collections.Counter(p["pay"]["basis"] for p in profiles if "pay" in p)
    return rows, dict(basis)


def markdown(data):
    meta, cov = data["_meta"], data["_meta"]["coverage"]
    it = sum(1 for p in data["profiles"] if p["is_it"])
    lines = [
        "# Hồ sơ nghề chuẩn: độ phủ",
        "",
        "> Sinh bởi `occupation-data/scripts/build_occupation_profiles.py`. Đừng sửa tay.",
        "",
        f"{len(data['profiles'])} nghề: {it} IT, {len(data['profiles']) - it} ngoài IT.",
        "",
        f"| Mục | Đường dẫn | IT (/{it}) | Ngoài IT (/{len(data['profiles']) - it}) |",
        "|---|---|---|---|",
    ]
    lines += [f"| {r['field']} | `{r['path']}` | {r['it']} | {r['non_it']} |" for r in cov]
    lines += ["", "## Lương theo nguồn", "", "| Nguồn | Số nghề |", "|---|---|"]
    lines += [f"| {k} | {v} |" for k, v in sorted(meta["pay_basis"].items())]
    lines += ["", "## Đã bỏ vì kém tin cậy", ""] + [f"- {x}" for x in meta["dropped"]]
    return "\n".join(lines) + "\n"


def build():
    src = load_sources()
    it_roles = src["it"]["roles"]
    non_it = src["non_it"]["roles"]
    check_education(src, {r["role_code"] for r in it_roles} | {r["role_code"] for r in non_it})
    _, context, _, _, _, _, _ = load_tables()
    src["context"] = (context, context_stats(context))
    onet = it_onet(src)
    level_of = outlook_levels(src)
    counts = sorted(c["open_postings"] for c in src["it_postings"]["roles"].values())
    cut = (counts[len(counts) // 3], counts[2 * len(counts) // 3])
    it_level_of = lambda n: OUTLOOK_LEVELS[(n > cut[0]) + (n > cut[1])]
    profiles = [it_profile(src, r, onet[r["role_code"]], it_level_of) for r in it_roles]
    profiles += [non_it_profile(src, r, level_of) for r in non_it]
    name_of = {p["role_code"]: p["role_name_vn"] for p in profiles}
    for p in profiles:
        for s in p.get("career", {}).get("similar", []):
            s["role_name_vn"] = name_of[s["role_code"]]
        for step in p.get("career", {}).get("path", []):
            for r in step["roles"]:
                r["role_name_vn"] = r.get("role_name_vn") or name_of.get(r["role_code"])

    dropped = [
        "Mã nghề Việt Nam độ tin cậy thấp: " + ", ".join(c for c, r in src["vsco"].items() if r["confidence"] == "thap"),
        "Phần O*NET (câu môi trường, hợp với ai, kỹ năng, kiến thức) của nghề IT có cùng bộ mã O*NET với nghề khác: " + ", ".join(
            f"{k} (giống {v['shared_with']})" for k, v in onet.items() if v["shared_with"]),
        "Bước 'Vị trí gần, dễ vào hơn' của lộ trình: " + str(sum(
            1 for r in non_it for s in r["career_path"]["steps"] if s["stage"] in DROPPED_PATH_STAGES)) + " nghề",
        f"Lương rao VietJobs của nghề có dưới {MIN_POSTINGS} tin có lương.",
        f"Nhu cầu tuyển của nghề có dưới {MIN_OUTLOOK_POSTINGS} tin trong VietJobs (bộ dữ liệu không phủ ngành đó, không phải ít tuyển): "
        + str(sum(1 for s in src["vietjobs"]["roles"].values() if s["postings"] < MIN_OUTLOOK_POSTINGS)) + " nghề",
    ]
    cov, basis = coverage(profiles)
    raw_by_code = {r["role_code"]: r for r in it_roles + non_it}
    return src, raw_by_code, onet, {
        "_meta": {
            "version": "1.0",
            "role_count": len(profiles),
            "schema": "occupation-data/JSON_SCHEMA.md §13",
            "evidence_levels": {"A": "Số liệu Việt Nam đã kiểm hoặc văn bản chính thức", "B": "O*NET (Mỹ) hoặc số Việt Nam của nhóm rộng hơn",
                                "C": "Nhóm soạn hoặc dịch, chưa duyệt"},
            "attribution": ATTRIBUTION,
            "dropped": dropped,
            "coverage": cov,
            "pay_basis": basis,
            "work_settings": {k: v["name_vn"] for k, v in src["settings"]["settings"].items()},
            "company_types_ref": "datasets/work_environments.json",
        },
        "profiles": profiles,
    }


def main():
    src, raw_by_code, onet, data = build()
    (GENERATED / "occupation_profiles.json").write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    (GENERATED / "occupation_profiles.md").write_text(markdown(data), encoding="utf-8")
    (GENERATED / "occupation_profiles_review.md").write_text(review_markdown(src, data, raw_by_code, onet), encoding="utf-8")
    print("profiles:", len(data["profiles"]), "pay basis:", data["_meta"]["pay_basis"])


if __name__ == "__main__":
    sys.exit(main())

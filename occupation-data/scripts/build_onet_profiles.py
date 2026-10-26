"""Dựng hồ sơ RIASEC và mức cần 7 nhóm soft skill cho 22 nghề từ O*NET 31.0.

Đầu vào: sáu file CSV của O*NET 31.0 trong occupation-data/external/onet_31_0/
(tải bằng --download). Đầu ra: occupation-data/generated/onet_profiles.json
và occupation-data/generated/onet_profiles.md.

Độ giống nghề–nghề dùng RIASEC, Work Styles và Skills (trọng số trong WEIGHTS), không dùng 7 nhóm soft skill:
bộ này cho kết quả tốt hơn trên Related Occupations của O*NET (xem evaluate_onet_similarity.py).

Gán mã O*NET cho nghề và bảng nối 7 nhóm soft skill là nhận định của nhóm,
chưa có nguồn công bố; xem phần "note" của từng mục trong file JSON.
"""
import argparse
import csv
import io
import json
import math
import statistics
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EXTERNAL = ROOT / "external" / "onet_31_0"
GENERATED = ROOT / "generated"
BASE_URL = "https://www.onetcenter.org/dl_files/database/db_31_0_csv/"
FILES = [
    "occupation_data",
    "career_interest_types",
    "work_activities",
    "work_styles",
    "essential_skills",
    "transferable_skills",
    "knowledge",
    "task_statements",
    "work_context",
    "job_zones",
    "related_occupations",
]

ATTRIBUTION = [
    "This page includes information from the O*NET 31.0 Database by the U.S. Department of Labor, "
    "Employment and Training Administration (USDOL/ETA).",
    "Used under the CC BY 4.0 license.",
    "O*NET® is a trademark of USDOL/ETA.",
    "JobQuest has modified all or some of this information.",
    "USDOL/ETA has not approved, endorsed, or tested these modifications.",
]

RIASEC = ["Realistic", "Investigative", "Artistic", "Social", "Enterprising", "Conventional"]
RIASEC_VI = {
    "Realistic": "Thực hành",
    "Investigative": "Tìm tòi",
    "Artistic": "Sáng tạo",
    "Social": "Kết nối",
    "Enterprising": "Dẫn dắt",
    "Conventional": "Tổ chức",
}

# Trọng số độ giống. Chọn trên một nửa số nghề O*NET, kiểm trên nửa còn lại (evaluate_onet_similarity.py).
WEIGHTS = {"riasec": 3, "styles": 3, "skills": 1}
DOMAIN_VI = {
    "riasec": "Sở thích RIASEC (6)",
    "styles": "Work Styles (21)",
    "skills": "Essential + Transferable Skills (35)",
}

# Bảng nối 7 nhóm soft skill với O*NET: "wa" là Work Activities (thang Importance),
# "ws" là Work Styles (thang Work Styles Impact). Nhận định của nhóm.
SOFT_GROUPS = [
    {
        "id": "giao_tiep_hop_tac",
        "name": "Giao tiếp & hợp tác",
        "wa": [
            "Communicating with Supervisors, Peers, or Subordinates",
            "Communicating with People Outside the Organization",
            "Interpreting the Meaning of Information for Others",
            "Providing Consultation and Advice to Others",
            "Documenting/Recording Information",
        ],
        "ws": ["Cooperation"],
    },
    {
        "id": "tri_tue_cam_xuc",
        "name": "Trí tuệ cảm xúc & xử lý xung đột",
        "wa": [
            "Resolving Conflicts and Negotiating with Others",
            "Establishing and Maintaining Interpersonal Relationships",
            "Assisting and Caring for Others",
            "Performing for or Working Directly with the Public",
        ],
        "ws": ["Empathy", "Self-Control", "Humility", "Social Orientation"],
    },
    {
        "id": "lanh_dao_kinh_doanh",
        "name": "Lãnh đạo & tư duy kinh doanh",
        "wa": [
            "Guiding, Directing, and Motivating Subordinates",
            "Coordinating the Work and Activities of Others",
            "Developing and Building Teams",
            "Coaching and Developing Others",
            "Training and Teaching Others",
            "Selling or Influencing Others",
            "Developing Objectives and Strategies",
            "Monitoring and Controlling Resources",
            "Staffing Organizational Units",
        ],
        "ws": ["Leadership Orientation", "Self-Confidence"],
    },
    {
        "id": "tu_duy_giai_quyet_van_de",
        "name": "Tư duy & giải quyết vấn đề",
        "wa": [
            "Analyzing Data or Information",
            "Making Decisions and Solving Problems",
            "Thinking Creatively",
            "Processing Information",
            "Getting Information",
            "Working with Computers",
        ],
        "ws": ["Innovation", "Intellectual Curiosity"],
    },
    {
        "id": "tu_quan_ly_ap_luc",
        "name": "Tự quản lý & chịu áp lực",
        "wa": [
            "Organizing, Planning, and Prioritizing Work",
            "Scheduling Work and Activities",
        ],
        "ws": ["Attention to Detail", "Stress Tolerance", "Initiative", "Achievement Orientation", "Perseverance"],
    },
    {
        "id": "thich_ung_hoc_hoi",
        "name": "Thích ứng & học hỏi",
        "wa": ["Updating and Using Relevant Knowledge"],
        "ws": ["Adaptability", "Tolerance for Ambiguity", "Optimism"],
    },
    {
        "id": "dao_duc_chuyen_nghiep",
        "name": "Đạo đức & chuyên nghiệp",
        "wa": ["Evaluating Information to Determine Compliance with Standards"],
        "ws": ["Integrity", "Sincerity", "Dependability", "Cautiousness"],
    },
]

# 22 nghề đã chốt. Nghề không có mã khớp thì lấy trung bình của nhiều mã.
ROLES = [
    ("SWE_FRONTEND", "Lập trình viên Front-end", ["15-1254.00"], "Web Developers"),
    ("SWE_BACKEND", "Lập trình viên Back-end", ["15-1252.00"], "Software Developers"),
    ("SWE_MOBILE", "Lập trình viên Mobile", ["15-1252.00"],
     "O*NET không có mã riêng cho mobile; dùng chung hồ sơ với Back-end nên hai nghề không được so với nhau"),
    ("SWE_GAME", "Lập trình viên Game", ["15-1252.00", "15-1255.01"],
     "Ghép Software Developers và Video Game Designers"),
    ("SWE_UIUX", "Chuyên viên thiết kế UI/UX", ["15-1255.00"], "Web and Digital Interface Designers"),
    ("SWE_EMBEDDED", "Kỹ sư phần mềm nhúng / IoT", ["15-1252.00", "17-2061.00"],
     "Ghép Software Developers và Computer Hardware Engineers"),
    ("SWE_ARCH_SOL", "Kiến trúc sư giải pháp", ["15-1299.08"], "Computer Systems Engineers/Architects"),
    ("SWE_TECHLEAD", "Trưởng nhóm kỹ thuật", ["15-1252.00", "11-3021.00"],
     "Không có mã riêng; ghép Software Developers và Computer and Information Systems Managers"),
    ("SWE_EM", "Trưởng phòng Kỹ thuật", ["11-3021.00"], "Computer and Information Systems Managers"),
    ("QA_MANUAL", "Kiểm thử", ["15-1253.00"], "Software Quality Assurance Analysts and Testers"),
    ("DATA_DA", "Chuyên viên phân tích dữ liệu", ["15-2051.01"], "Business Intelligence Analysts"),
    ("DATA_AI", "Kỹ sư trí tuệ nhân tạo", ["15-2051.00"], "Data Scientists"),
    ("DATA_DE", "Kỹ sư dữ liệu", ["15-1243.01", "15-1243.00"],
     "Ghép Data Warehousing Specialists và Database Architects"),
    ("CLOUD_DEVOPS", "Kỹ sư DevOps", ["15-1244.00", "15-1252.00"],
     "Không có mã riêng; ghép Network and Computer Systems Administrators và Software Developers"),
    ("CLOUD_ENG", "Kỹ sư điện toán đám mây", ["15-1299.08", "15-1244.00"],
     "Không có mã riêng; ghép Computer Systems Engineers/Architects và Network and Computer Systems Administrators"),
    ("SEC_ENG", "Kỹ sư an ninh mạng", ["15-1299.05"], "Information Security Engineers"),
    ("SEC_PENTEST", "Chuyên viên kiểm thử xâm nhập", ["15-1299.04"], "Penetration Testers"),
    ("PROD_BA", "Chuyên viên phân tích nghiệp vụ", ["15-1211.00"], "Computer Systems Analysts"),
    ("PROD_PM", "Quản lý sản phẩm", ["15-1299.09"],
     "Chỉ IT Project Managers; không ghép Marketing Managers vì kéo hồ sơ về phía marketing"),
    ("INFRA_ERP", "Chuyên viên tư vấn giải pháp ERP", ["15-1211.00", "13-1111.00"],
     "Ghép Computer Systems Analysts và Management Analysts"),
    ("INFRA_HELPDESK", "Nhân viên hỗ trợ kỹ thuật / IT Support", ["15-1232.00"], "Computer User Support Specialists"),
    ("INFRA_NETWORK", "Kỹ sư hệ thống mạng", ["15-1244.00", "15-1241.00"],
     "Ghép Network and Computer Systems Administrators và Computer Network Architects"),
]

# Nghề ngoài IT, chỉ để kiểm gợi ý khác ngành.
OUTSIDE = [
    ("11-2021.00", "Quản lý marketing"),
    ("13-1161.01", "Chuyên viên marketing tìm kiếm"),
    ("13-1161.00", "Nghiên cứu thị trường, chuyên viên marketing"),
    ("27-1024.00", "Thiết kế đồ hoạ"),
    ("27-1013.00", "Hoạ sĩ, nhà điêu khắc, minh hoạ"),
    ("17-1011.00", "Kiến trúc sư công trình"),
    ("13-1082.00", "Chuyên viên quản lý dự án"),
    ("15-2041.00", "Nhà thống kê"),
]


def download():
    EXTERNAL.mkdir(parents=True, exist_ok=True)
    for name in FILES:
        target = EXTERNAL / f"{name}.csv"
        with urllib.request.urlopen(BASE_URL + f"{name}.csv", timeout=120) as resp:
            target.write_bytes(resp.read())
        print("downloaded", target)


def read(name):
    with open(EXTERNAL / f"{name}.csv", encoding="utf-8", newline="") as fh:
        return list(csv.DictReader(fh))


def load():
    titles = {r["O*NET-SOC Code"]: r["Title"] for r in read("occupation_data")}
    interests = {}
    for r in read("career_interest_types"):
        if r["Scale ID"] == "OI":
            interests.setdefault(r["O*NET-SOC Code"], {})[r["Element Name"]] = float(r["Data Value"])
    activities = {}
    for r in read("work_activities"):
        if r["Scale ID"] == "IM":
            activities.setdefault(r["O*NET-SOC Code"], {})[r["Element Name"]] = float(r["Data Value"])
    styles = {}
    for r in read("work_styles"):
        if r["Scale ID"] == "WI":
            styles.setdefault(r["O*NET-SOC Code"], {})[r["Element Name"]] = float(r["Data Value"])
    return titles, interests, activities, styles


def load_skills():
    skills = {}
    for name in ("essential_skills", "transferable_skills"):
        for r in read(name):
            if r["Scale ID"] == "IM":
                skills.setdefault(r["O*NET-SOC Code"], {})[r["Element Name"]] = float(r["Data Value"])
    return skills


def zscores(table):
    """Chuẩn hoá từng mục trên toàn bộ nghề của O*NET: nghề này cần mục đó hơn mức thường gặp bao nhiêu."""
    elements = {e for row in table.values() for e in row}
    stats = {}
    for e in elements:
        values = [row[e] for row in table.values() if e in row]
        stats[e] = (statistics.mean(values), statistics.pstdev(values) or 1.0)
    return {
        code: {e: (v - stats[e][0]) / stats[e][1] for e, v in row.items()}
        for code, row in table.items()
    }


def soft_profile(code, za, zs):
    profile = {}
    for g in SOFT_GROUPS:
        parts = [za[code][e] for e in g["wa"] if e in za.get(code, {})]
        parts += [zs[code][e] for e in g["ws"] if e in zs.get(code, {})]
        if len(parts) != len(g["wa"]) + len(g["ws"]):
            raise SystemExit(f"{code} thiếu dữ liệu cho nhóm {g['id']}")
        profile[g["id"]] = statistics.mean(parts)
    return profile


def average(dicts):
    keys = dicts[0].keys()
    return {k: statistics.mean(d[k] for d in dicts) for k in keys}


def unit(v):
    n = math.sqrt(sum(x * x for x in v))
    return [x / n for x in v]


def descriptor_vectors(table):
    """Vector đơn vị của từng nghề trên một nhóm mô tả: z trên toàn bộ nghề, rồi chuẩn hoá độ dài."""
    z = zscores(table)
    elements = sorted(next(iter(z.values())))
    return {code: unit([row[e] for e in elements]) for code, row in z.items()}


def pair_stats(vectors):
    """Trung bình và độ lệch chuẩn của cosine trên mọi cặp nghề khác nhau, tính qua ma trận Gram (không dựng ma trận N×N)."""
    rows = list(vectors.values())
    n, d = len(rows), len(rows[0])
    total = sum(sum(r[i] for r in rows) ** 2 for i in range(d)) - n
    squares = sum(sum(r[i] * r[j] for r in rows) ** 2 for i in range(d) for j in range(d)) - n
    pairs = n * (n - 1)
    mean = total / pairs
    return mean, math.sqrt(squares / pairs - mean * mean)


def role_vector(vectors, codes):
    """Vector của một nghề: trung bình các vector mã O*NET của nghề, rồi chuẩn hoá độ dài."""
    return unit([statistics.mean(vectors[c][i] for c in codes) for i in range(len(vectors[codes[0]]))])


def cosine(a, b):
    return sum(x * y for x, y in zip(a, b))


def similarity(p, q, prep, weights=WEIGHTS):
    """Độ giống chuẩn hoá: trung bình có trọng số của cosine từng nhóm, mỗi nhóm trừ trung bình và chia độ lệch chuẩn của mọi cặp O*NET."""
    score = 0.0
    for d, w in weights.items():
        mean, sd = prep["stats"][d]
        score += w * (cosine(p[d], q[d]) - mean) / sd
    return score / sum(weights.values())


def interest_code(riasec):
    ordered = sorted(RIASEC, key=lambda k: riasec[k], reverse=True)
    return "".join(k[0] for k in ordered[:3])


def prepare():
    titles, interests, activities, styles = load()
    skills = load_skills()
    za, zs, zi = zscores(activities), zscores(styles), zscores(interests)
    population = [
        c for c in titles
        if c in za and c in zs and c in skills and len(interests.get(c, {})) == 6
    ]
    vecs = {
        "riasec": descriptor_vectors({c: interests[c] for c in population}),
        "styles": descriptor_vectors({c: styles[c] for c in population}),
        "skills": descriptor_vectors({c: skills[c] for c in population}),
    }
    return {
        "titles": titles,
        "interests": interests,
        "za": za,
        "zs": zs,
        "zi": zi,
        "population": set(population),
        "vecs": vecs,
        "stats": {d: pair_stats(vecs[d]) for d in WEIGHTS},
    }


def domain_vectors(prep, codes):
    return {d: role_vector(prep["vecs"][d], codes) for d in WEIGHTS}


def profile_of(prep, codes):
    missing = [c for c in codes if c not in prep["population"]]
    if missing:
        raise SystemExit(f"thiếu dữ liệu O*NET cho {missing}")
    return {
        "riasec": average([prep["interests"][c] for c in codes]),
        "riasec_z": average([prep["zi"][c] for c in codes]),
        "soft": average([soft_profile(c, prep["za"], prep["zs"]) for c in codes]),
    }


def build():
    prep = prepare()
    titles = prep["titles"]
    roles = {}
    outside = {}
    vectors = {}
    for role_code, name_vi, codes, note in ROLES:
        p = profile_of(prep, codes)
        roles[role_code] = {
            "name_vi": name_vi,
            "onet_codes": [{"code": c, "title": titles[c]} for c in codes],
            "note": note,
            "interest_code": interest_code(p["riasec"]),
            **p,
        }
        vectors[role_code] = domain_vectors(prep, codes)
    for code, name_vi in OUTSIDE:
        p = profile_of(prep, [code])
        outside[code] = {"name_vi": name_vi, "title": titles[code], "interest_code": interest_code(p["riasec"]), **p}
        vectors[code] = domain_vectors(prep, [code])

    used = {c for _, _, codes, _ in ROLES for c in codes}
    pool = [c for c in titles if not c.startswith("15-") and c not in used and c in prep["population"]]
    for code in pool:
        vectors[code] = domain_vectors(prep, [code])

    # Hai nghề dùng chung đúng một bộ mã O*NET thì hồ sơ trùng nhau theo cách dựng, nên không so với nhau.
    codes_of = {k: [c["code"] for c in v["onet_codes"]] for k, v in roles.items()}
    within_it = {}
    for key in roles:
        scored = [
            {"to": other, "combined": round(similarity(vectors[key], vectors[other], prep), 3)}
            for other in roles if codes_of[other] != codes_of[key]
        ]
        scored.sort(key=lambda x: x["combined"], reverse=True)
        within_it[key] = scored[:3]

    cross_field = {}
    for key in roles:
        scored = [
            {"to": code, "title": titles[code], "combined": round(similarity(vectors[key], vectors[code], prep), 3)}
            for code in pool
        ]
        scored.sort(key=lambda x: x["combined"], reverse=True)
        cross_field[key] = scored[:5]

    outside_to_it = {}
    for code in outside:
        scored = [
            {"to": key, "combined": round(similarity(vectors[code], vectors[key], prep), 3)}
            for key in roles
        ]
        scored.sort(key=lambda x: x["combined"], reverse=True)
        outside_to_it[code] = scored[:3]

    def rounded(d):
        return {k: round(v, 3) for k, v in d.items()}

    for bag in (roles, outside):
        for v in bag.values():
            v["riasec"] = rounded(v["riasec"])
            v["riasec_z"] = rounded(v["riasec_z"])
            v["soft"] = rounded(v["soft"])

    return {
        "meta": {
            "source": "O*NET 31.0 Database (CSV), https://www.onetcenter.org/database.html",
            "licence": "CC BY 4.0",
            "attribution": ATTRIBUTION,
            "riasec_scale": "Occupational Interests, 1–7",
            "soft_scale": (
                "Trung bình điểm chuẩn hoá (z) trên toàn bộ nghề của O*NET của các mục được nối với nhóm: "
                "Work Activities thang Importance, Work Styles thang Work Styles Impact. 0 = mức thường gặp. "
                "Chỉ để hiển thị, không tham gia so sánh nghề."
            ),
            "similarity": (
                "Độ giống chuẩn hoá: trung bình có trọng số của cosine từng nhóm (RIASEC, Work Styles, Skills). "
                "Cùng một cách đo cho mọi bảng, không trừ tâm nghề IT."
            ),
            "weights": WEIGHTS,
            "population": len(prep["population"]),
            "cross_field_pool_size": len(pool),
            "judgement": "Gán mã O*NET cho nghề và bảng nối 7 nhóm soft skill là nhận định của nhóm, chưa có nguồn công bố.",
        },
        "riasec_names_vi": RIASEC_VI,
        "soft_groups": SOFT_GROUPS,
        "roles": roles,
        "outside_it": outside,
        "within_it": within_it,
        "cross_field": cross_field,
        "outside_to_it": outside_to_it,
    }


def markdown(data):
    names = {**{k: v["name_vi"] for k, v in data["roles"].items()},
             **{k: v["name_vi"] for k, v in data["outside_it"].items()}}
    groups = data["soft_groups"]
    out = io.StringIO()
    w = out.write
    w("# Hồ sơ RIASEC và soft skill của 22 nghề (O*NET 31.0)\n\n")
    w("> Sinh bởi `occupation-data/scripts/build_onet_profiles.py`. Đừng sửa tay.\n")
    w("> " + " ".join(data["meta"]["attribution"]) + "\n\n")
    w("## RIASEC (thang 1–7)\n\n| Nghề | Mã O*NET | Mã sở thích | "
      + " | ".join(RIASEC_VI[k] for k in RIASEC) + " |\n|---|---|---|" + "---|" * 6 + "\n")
    for v in data["roles"].values():
        codes = ", ".join(c["code"] for c in v["onet_codes"])
        w(f"| {v['name_vi']} | {codes} | {v['interest_code']} | "
          + " | ".join(f"{v['riasec'][k]:.2f}" for k in RIASEC) + " |\n")
    w("\n## Mức cần 7 nhóm soft skill (z so với mọi nghề của O*NET; 0 = mức thường gặp)\n\n| Nghề | "
      + " | ".join(g["name"] for g in groups) + " |\n|---|" + "---|" * len(groups) + "\n")
    for v in data["roles"].values():
        w(f"| {v['name_vi']} | " + " | ".join(f"{v['soft'][g['id']]:+.2f}" for g in groups) + " |\n")
    w("\n## Trong ngành: 3 nghề IT gần nhất\n\n"
      "| Nghề | Gần nhất | Thứ hai | Thứ ba |\n|---|---|---|---|\n")
    for key, lst in data["within_it"].items():
        cells = [f"{names[n['to']]} ({n['combined']:.2f})" for n in lst]
        w(f"| {names[key]} | " + " | ".join(cells) + " |\n")
    w(f"\n## Khác ngành: 5 nghề ngoài IT gần nhất (so với {data['meta']['cross_field_pool_size']} nghề O*NET)\n\n"
      "| Nghề | Gợi ý khác ngành (độ giống) |\n|---|---|\n")
    for key, lst in data["cross_field"].items():
        w(f"| {names[key]} | " + "; ".join(f"{n['title']} ({n['combined']:.2f})" for n in lst) + " |\n")
    w("\n## Chiều ngược lại: nghề ngoài IT gần nghề IT nào nhất\n\n"
      "| Nghề ngoài IT | Gần nhất | Thứ hai | Thứ ba |\n|---|---|---|---|\n")
    for code, lst in data["outside_to_it"].items():
        cells = [f"{names[n['to']]} ({n['combined']:.2f})" for n in lst]
        w(f"| {data['outside_it'][code]['name_vi']} | " + " | ".join(cells) + " |\n")
    w("\n## Gán mã O*NET cho từng nghề\n\n| Nghề | Mã | Ghi chú |\n|---|---|---|\n")
    for v in data["roles"].values():
        w(f"| {v['name_vi']} | " + ", ".join(f"{c['code']} {c['title']}" for c in v["onet_codes"]) + f" | {v['note']} |\n")
    w("\n## Cách đo độ giống\n\n")
    for d, wt in data["meta"]["weights"].items():
        w(f"- {DOMAIN_VI[d]} × {wt}\n")
    w(f"- Chuẩn hoá theo {data['meta']['population']} nghề O*NET có đủ dữ liệu.\n")
    w("- Soft skill 7 nhóm chỉ để hiển thị, không tham gia so sánh nghề.\n")
    w("- Nghề dùng chung đúng một bộ mã O*NET (Back-end và Mobile) không được so với nhau trong bảng trong ngành.\n")
    w("- Độ giống là số chuẩn hoá, không phải tỉ lệ phần trăm; chỉ so thứ tự trong cùng một bảng.\n")
    return out.getvalue()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--download", action="store_true", help="tải lại sáu file O*NET 31.0")
    args = parser.parse_args()
    if args.download:
        download()
    data = build()
    GENERATED.mkdir(exist_ok=True)
    (GENERATED / "onet_profiles.json").write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    (GENERATED / "onet_profiles.md").write_text(markdown(data), encoding="utf-8")
    print("wrote", GENERATED / "onet_profiles.json")
    print("wrote", GENERATED / "onet_profiles.md")


if __name__ == "__main__":
    sys.exit(main())

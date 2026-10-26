"""Thống kê lương rao và số tin tuyển dụng theo nghề từ bộ VietJobs.

Đầu vào (tải bằng --download):
- occupation-data/external/vietjobs/VietJobs.csv: 48.092 tin tuyển dụng tiếng Việt có lương (HuggingFace dinhieufam/VietJobs,
  đăng 2/3/2026). Bộ dữ liệu không có ngày đăng của từng tin và chưa ghi giấy phép.
- occupation-data/decisions/vietjobs_title_rules.json: luật khớp chức danh với nghề.

Đầu ra: occupation-data/generated/vietjobs_stats.json và .md.

Làm sạch: bỏ tin trùng (cùng chức danh, nơi làm, lương, 200 ký tự đầu của mô tả); bỏ tin thực tập, bán thời gian,
thời vụ, cộng tác viên theo cả tên chức danh lẫn cột contract_type. Lương tháng của một tin là trung điểm của khoảng lương,
hoặc con số duy nhất khi tin chỉ ghi một đầu; bỏ tin "thoả thuận" (lương 0) và tin ngoài [MIN_PAY, MAX_PAY] triệu.
Một tin có thể khớp nhiều nghề.
"""
import argparse
import csv
import json
import re
import statistics
import sys
import unicodedata
import urllib.request

from build_onet_profiles import GENERATED, ROOT

SOURCE = ROOT / "external" / "vietjobs" / "VietJobs.csv"
URL = "https://huggingface.co/datasets/dinhieufam/VietJobs/resolve/main/VietJobs.csv"
RULES = ROOT / "decisions" / "vietjobs_title_rules.json"
MIN_PAY, MAX_PAY = 4.0, 150.0
MIN_POSTINGS = 20
SAMPLE_TITLES = 5


def plain(text):
    """Viết thường, bỏ dấu tiếng Việt, gộp khoảng trắng."""
    text = unicodedata.normalize("NFD", text.lower().replace("đ", "d"))
    text = "".join(c for c in text if unicodedata.category(c) != "Mn")
    return re.sub(r"\s+", " ", text).strip()


def load_postings():
    csv.field_size_limit(10**8)
    seen, postings = set(), []
    with open(SOURCE, encoding="utf-8", newline="") as fh:
        for r in csv.DictReader(fh):
            key = (r["job_title"].strip().lower(), r["location"], r["salary"], r["description"][:200])
            if key in seen:
                continue
            seen.add(key)
            try:
                low, high = float(r["salary_min"] or 0), float(r["salary_max"] or 0)
            except ValueError:
                low = high = 0.0
            if low > 0 and high >= low:
                pay = (low + high) / 2
            else:
                pay = max(low, high) or None
            postings.append({"title": r["job_title"].strip(), "plain": plain(r["job_title"]), "pay": pay,
                             "contract": plain(r["contract_type"] or "")})
    return postings


def quantiles(values):
    q = statistics.quantiles(values, n=4)
    return {"p25": round(q[0], 1), "median": round(statistics.median(values), 1), "p75": round(q[2], 1)}


def build():
    rules = json.loads(RULES.read_text(encoding="utf-8"))
    global_exclude = re.compile(rules["global_exclude"])
    staff_exclude = re.compile(rules["staff_exclude"])
    sales_exclude = re.compile(rules["sales_exclude"])
    contract_exclude = re.compile(rules["contract_exclude"])
    postings = [p for p in load_postings() if not global_exclude.search(p["plain"]) and not contract_exclude.search(p["contract"])]
    total = len(postings)
    stats, matched_any = {}, set()
    for role_code, rule in rules["roles"].items():
        include = re.compile("|".join(f"(?:{x})" for x in rule["include"]))
        exclude = re.compile("|".join(f"(?:{x})" for x in rule.get("exclude", []))) if rule.get("exclude") else None
        hits = []
        for i, p in enumerate(postings):
            if not include.search(p["plain"]):
                continue
            if exclude and exclude.search(p["plain"]):
                continue
            if rule.get("staff") and staff_exclude.search(p["plain"]):
                continue
            if not rule.get("sales") and sales_exclude.search(p["plain"]):
                continue
            hits.append(i)
        matched_any.update(hits)
        pays = [postings[i]["pay"] for i in hits if postings[i]["pay"] and MIN_PAY <= postings[i]["pay"] <= MAX_PAY]
        titles = {}
        for i in hits:
            titles[postings[i]["title"]] = titles.get(postings[i]["title"], 0) + 1
        stats[role_code] = {
            "postings": len(hits),
            "share_per_10k": round(len(hits) / total * 10000, 1),
            "with_pay": len(pays),
            "pay_million_vnd": quantiles(pays) if len(pays) >= MIN_POSTINGS else None,
            "sample_titles": [t for t, _ in sorted(titles.items(), key=lambda kv: -kv[1])[:SAMPLE_TITLES]],
        }
    return {
        "_meta": {
            "source": "VietJobs (HuggingFace dinhieufam/VietJobs, bản đăng 2/3/2026), https://arxiv.org/abs/2603.05262",
            "licence": "Chưa ghi trên trang dữ liệu; repo code của nhóm tác giả là MIT. Cần hỏi tác giả trước khi công bố.",
            "postings_after_cleaning": total,
            "matched_any_role": len(matched_any),
            "pay_rule": f"Trung điểm khoảng lương rao (triệu đồng/tháng), bỏ tin thoả thuận và tin ngoài [{MIN_PAY}, {MAX_PAY}] triệu. "
                        f"Chỉ tính phân vị khi có từ {MIN_POSTINGS} tin có lương.",
            "share_rule": "Số tin của nghề trên 10.000 tin sau làm sạch; một tin có thể tính cho nhiều nghề. Là chỉ báo tương đối "
                          "trong một bộ dữ liệu từ trang tuyển dụng, nghiêng về việc văn phòng ở Hà Nội và TP.HCM.",
            "caveat": "Lương rao, không phải lương thực nhận. Bộ dữ liệu không có ngày đăng của từng tin.",
        },
        "roles": stats,
    }


def markdown(data):
    meta = data["_meta"]
    rows = sorted(data["roles"].items(), key=lambda kv: -kv[1]["postings"])
    lines = [
        "# Lương rao và số tin theo nghề (VietJobs)",
        "",
        "> Sinh bởi `occupation-data/scripts/build_vietjobs_stats.py`. Sửa luật khớp ở `decisions/vietjobs_title_rules.json`.",
        f"> {meta['caveat']} {meta['licence']}",
        "",
        f"{meta['postings_after_cleaning']} tin sau làm sạch, {meta['matched_any_role']} tin khớp ít nhất một nghề. "
        f"{sum(1 for _, s in rows if s['pay_million_vnd'])}/{len(rows)} nghề có đủ {MIN_POSTINGS} tin có lương.",
        "",
        "| Nghề | Số tin | /10.000 | Có lương | P25 | Trung vị | P75 | Chức danh hay gặp |",
        "|---|---|---|---|---|---|---|---|",
    ]
    for code, s in rows:
        pay = s["pay_million_vnd"] or {}
        lines.append(
            f"| {code} | {s['postings']} | {s['share_per_10k']} | {s['with_pay']} | {pay.get('p25', '')} | "
            f"{pay.get('median', '')} | {pay.get('p75', '')} | {'; '.join(s['sample_titles'][:3])} |"
        )
    return "\n".join(lines) + "\n"


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--download", action="store_true", help="tải VietJobs.csv vào occupation-data/external/vietjobs/")
    args = parser.parse_args()
    if args.download:
        SOURCE.parent.mkdir(parents=True, exist_ok=True)
        SOURCE.write_bytes(urllib.request.urlopen(URL).read())
    data = build()
    (GENERATED / "vietjobs_stats.json").write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    (GENERATED / "vietjobs_stats.md").write_text(markdown(data), encoding="utf-8")
    print("roles:", len(data["roles"]), "with pay:", sum(1 for s in data["roles"].values() if s["pay_million_vnd"]))


if __name__ == "__main__":
    sys.exit(main())

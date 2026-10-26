"""Nối 221 nghề của danh mục (22 IT + 199 ngoài IT) với mã nghề Việt Nam (Quyết định 34/2020/QĐ-TTg) qua ISCO-08.

Chuỗi nối: mã O*NET-SOC 2019 → nghề ESCO (bảng nối của O*NET) → 4 số đầu của mã ESCO là mã ISCO-08 →
mã cấp 4 của danh mục nghề Việt Nam. Danh mục Việt Nam theo ISCO-08 tới cấp 4, trừ nhóm 0 (lực lượng vũ trang)
và nhóm 1 (lãnh đạo, quản lý) có mã riêng. Nghề có mã ISCO không có trong danh mục Việt Nam phải được sửa tay trong
file overrides, nếu không script dừng và báo.

Đầu vào (tải bằng --download):
- occupation-data/external/esco_onet/ESCO_to_ONET-SOC.xlsx (O*NET Resource Center, ESCO v1.1.0)
- occupation-data/external/vsco_2020/Danh-muc-nghe-nghiep-Viet-Nam.xlsx (Cục Thống kê, Phụ lục I)
- generated/onet_all_roles.json và ROLES của build_onet_profiles.py

- occupation-data/decisions/onet_to_vsco_overrides.json: mã Việt Nam sửa tay, kèm lý do và độ tin cậy

Đầu ra: occupation-data/decisions/onet_to_vsco.csv và occupation-data/generated/onet_to_vsco.md.

Mã ISCO chính của nghề là mã có nhiều liên kết ESCO nhất với mã O*NET chính; hoà thì lấy mã có nhiều liên kết
nhất trên mọi mã O*NET của nghề. share là tỉ lệ liên kết của mã đó trên mọi liên kết của mã O*NET chính (hoặc của mọi mã
khi mã chính không có liên kết ESCO nào).
Đề xuất tự động sai ở khoảng một phần tư số nghề (bảng nối ESCO nhiều–nhiều, và nhiều mã ISCO trùng số nhưng khác
nghĩa với mã Việt Nam), nên mọi dòng đều đã duyệt tay; dòng sai được ghi đè bằng file overrides.
"""
import argparse
import collections
import csv
import json
import re
import sys
import urllib.request
import xml.etree.ElementTree as ET
import zipfile
from pathlib import Path

from build_onet_profiles import GENERATED, ROLES, ROOT

EXTERNAL = ROOT / "external"
ESCO_FILE = EXTERNAL / "esco_onet" / "ESCO_to_ONET-SOC.xlsx"
VSCO_FILE = EXTERNAL / "vsco_2020" / "Danh-muc-nghe-nghiep-Viet-Nam.xlsx"
DOWNLOADS = {
    ESCO_FILE: "https://www.onetcenter.org/crosswalks/esco/ESCO_to_ONET-SOC.xlsx",
    VSCO_FILE: "https://www.nso.gov.vn/wp-content/uploads/2020/12/Danh-muc-nghe-nghiep-Viet-Nam.xlsx",
}
OVERRIDES = ROOT / "decisions" / "onet_to_vsco_overrides.json"
OUT_CSV = ROOT / "decisions" / "onet_to_vsco.csv"
OUT_MD = GENERATED / "onet_to_vsco.md"
LOW_SHARE = 0.5
NS = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}


def xlsx_rows(path):
    """Đọc sheet đầu tiên của file xlsx thành list các dòng, mỗi dòng là dict cột → giá trị chữ."""
    with zipfile.ZipFile(path) as z:
        shared = []
        if "xl/sharedStrings.xml" in z.namelist():
            for si in ET.fromstring(z.read("xl/sharedStrings.xml")).findall("m:si", NS):
                shared.append("".join(t.text or "" for t in si.iter(f"{{{NS['m']}}}t")))
        sheet = ET.fromstring(z.read("xl/worksheets/sheet1.xml"))
    rows = []
    for row in sheet.iter(f"{{{NS['m']}}}row"):
        cells = {}
        for c in row.findall("m:c", NS):
            col = re.match(r"[A-Z]+", c.get("r")).group()
            if c.get("t") == "inlineStr":
                value = "".join(t.text or "" for t in c.iter(f"{{{NS['m']}}}t"))
            else:
                v = c.find("m:v", NS)
                if v is None:
                    continue
                value = shared[int(v.text)] if c.get("t") == "s" else v.text
            cells[col] = value.strip()
        rows.append(cells)
    return rows


def load_esco():
    """Mã O*NET → Counter mã ISCO-08 4 số, đếm theo số nghề ESCO nối tới."""
    links = collections.defaultdict(collections.Counter)
    header = None
    for r in xlsx_rows(ESCO_FILE):
        if r.get("A") == "ESCO/ISCO Code":
            header = r
            continue
        if not header or not re.match(r"^\d{4}", r.get("A", "")) or not r.get("C"):
            continue
        links[r["C"]][r["A"][:4]] += 1
    if not links:
        raise SystemExit(f"không đọc được bảng nối trong {ESCO_FILE}")
    return links


def load_vsco():
    """Mã cấp 4 → tên cấp 4 và các tên cấp 5 bên dưới."""
    unit, current = {}, None
    for r in xlsx_rows(VSCO_FILE):
        code4, code5, name = r.get("D", ""), r.get("E", ""), " ".join(r.get("F", "").split())
        if re.fullmatch(r"\d{4}", code4):
            current = code4
            unit[code4] = {"name": name, "level5": []}
        if re.fullmatch(r"\d{5}", code5) and current and code5.startswith(current):
            unit[current]["level5"].append({"code": code5, "name": name})
    if not unit:
        raise SystemExit(f"không đọc được danh mục trong {VSCO_FILE}")
    return unit


def catalogue():
    """221 nghề: (role_code, tên tiếng Việt, nhóm, các mã O*NET, mã chính)."""
    roles = [(key, name, "IT", codes, codes[0]) for key, name, codes, _ in ROLES]
    data = json.loads((GENERATED / "onet_all_roles.json").read_text(encoding="utf-8"))
    for r in data["roles"]:
        codes = r["onet"]["codes"]
        roles.append((r["role_code"], r["role_name_vn"], r["role_group_vn"], codes, codes[0]))
    return roles


def build():
    links, vsco = load_esco(), load_vsco()
    overrides = json.loads(OVERRIDES.read_text(encoding="utf-8"))["roles"]
    roles = catalogue()
    problems = {
        "mã sửa tay không có trong danh mục": sorted(k for k, o in overrides.items() if o["vsco"] not in vsco),
        "nghề sửa tay không có trong danh mục nghề": sorted(set(overrides) - {r[0] for r in roles}),
        "độ tin cậy sửa tay không phải cao, vua, thap": sorted(k for k, o in overrides.items() if o["confidence"] not in ("cao", "vua", "thap")),
    }
    rows = []
    for role_code, name_vi, group, codes, main in roles:
        main_links = links.get(main, collections.Counter())
        all_links = collections.Counter()
        for c in codes:
            all_links.update(links.get(c, {}))
        pool = main_links or all_links
        best = max(pool, key=lambda k: (pool[k], all_links[k])) if pool else ""
        total = sum(pool.values())
        share = pool[best] / total if pool else 0.0
        override = overrides.get(role_code)
        if override:
            code, basis, confidence, reason = override["vsco"], "sua_tay", override["confidence"], override["reason"]
        else:
            code, basis, reason = best, "tu_dong", ""
            confidence = "cao" if share >= LOW_SHARE else "vua"
        if code not in vsco:
            problems.setdefault("nghề chưa có mã Việt Nam", []).append(role_code)
            continue
        unit = vsco[code]
        rows.append({
            "role_code": role_code, "role_name_vn": name_vi, "role_group_vn": group,
            "onet_main": main, "onet_codes": ";".join(codes),
            "vsco_code": code, "vsco_name": unit["name"],
            "vsco_level5": "; ".join(f"{x['code']} {x['name']}" for x in unit["level5"]),
            "basis": basis, "confidence": confidence, "reason": reason,
            "isco08_auto": best, "share_auto": f"{share:.2f}",
            "alternatives_auto": "; ".join(f"{k}:{n / total:.2f}" for k, n in pool.most_common() if k != best)[:200],
            "n_links": total,
        })
    problems = {k: v for k, v in problems.items() if v}
    if problems:
        raise SystemExit(f"bảng nối chưa hợp lệ: {problems}")
    return rows, vsco


def markdown(rows, vsco):
    basis = collections.Counter(r["basis"] for r in rows)
    confidence = collections.Counter(r["confidence"] for r in rows)
    shared = collections.Counter(r["vsco_code"] for r in rows)
    lines = [
        "# Nối danh mục nghề với mã nghề Việt Nam",
        "",
        "> Sinh bởi `occupation-data/scripts/build_onet_to_vsco.py`. Đừng sửa tay; sửa ở `decisions/onet_to_vsco_overrides.json`.",
        "> Nguồn: bảng nối ESCO–O\\*NET-SOC 2019 của O\\*NET Resource Center (CC BY 4.0; ESCO v1.1.0 của Ủy ban châu Âu); "
        "Danh mục nghề nghiệp Việt Nam, Phụ lục I Quyết định 34/2020/QĐ-TTg (Cục Thống kê).",
        "",
        f"{len(rows)} nghề, đều có mã cấp 4 của Việt Nam (danh mục có {len(vsco)} mã cấp 4). "
        f"Giữ đề xuất tự động: {basis['tu_dong']}; sửa tay: {basis['sua_tay']}.",
        f"Độ tin cậy: cao {confidence['cao']}, vừa {confidence['vua']}, thấp {confidence['thap']}.",
        "",
        f"Mã Việt Nam dùng chung bởi nhiều nghề: {sum(1 for n in shared.values() if n > 1)} mã, "
        f"phủ {sum(n for n in shared.values() if n > 1)} nghề. Số liệu thống kê theo mã sẽ giống nhau giữa các nghề này.",
        "",
        "| Nghề | Nhóm | Mã Việt Nam | Tên nghề Việt Nam | Cách gán | Tin cậy |",
        "|---|---|---|---|---|---|",
    ]
    lines += [
        f"| {r['role_name_vn']} | {r['role_group_vn']} | {r['vsco_code']} | {r['vsco_name']} | {r['basis']} | {r['confidence']} |"
        for r in rows
    ]
    return "\n".join(lines) + "\n"


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--download", action="store_true", help="tải hai file đầu vào vào occupation-data/external/")
    args = parser.parse_args()
    if args.download:
        for path, url in DOWNLOADS.items():
            path.parent.mkdir(parents=True, exist_ok=True)
            request = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            path.write_bytes(urllib.request.urlopen(request).read())
            print("downloaded", path)
    rows, vsco = build()
    with open(OUT_CSV, "w", encoding="utf-8-sig", newline="") as fh:
        writer = csv.DictWriter(fh, fieldnames=list(rows[0]))
        writer.writeheader()
        writer.writerows(rows)
    OUT_MD.write_text(markdown(rows, vsco), encoding="utf-8")
    print("wrote", OUT_CSV, "rows:", len(rows))
    print("wrote", OUT_MD)


if __name__ == "__main__":
    sys.exit(main())

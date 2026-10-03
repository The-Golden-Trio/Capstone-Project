#!/usr/bin/env python3
"""
build_skill_taxonomy.py — Xây skill taxonomy (nguồn thật duy nhất cho mọi skill_id).

Quét toàn bộ chuỗi skill từ 4 nguồn:
  1. datasets/78_roles_unmerged.json    levels[].skills_hard[].skill, levels[].skills_soft[]
  2. 9_roles_tier1_pass2.json              cùng shape (1) — ĐÃ XOÁ khỏi repo, script tự bỏ qua
  3. datasets/final_22_roles.json skills_status.hard_skills_languages[].skill,
                                           skills_status.hard_skills_frameworks[].skill,
                                           graph_edges.similar_ranked[].shared_skills_top[]
  4. scenarios/**/*.json                   context.skills_hard / context.skills_soft

Chuẩn hoá: trim + casefold + alias map tay cho các biến thể RÕ RÀNG (React.js/ReactJS/React,
Javascript/JavaScript ...). Còn lại giữ nguyên để người review gộp tiếp bằng tay.

Output: generated/skills_taxonomy.json
  [{ skill_id, name_vn, type: "hard"|"soft", category, aliases: [] }]
  category (hard) = language | framework | tool — theo nguồn gốc; soft = null ở MVP.

Chạy:  python3 occupation-data/scripts/build_skill_taxonomy.py
Deterministic: chạy lại ra file y hệt (sort ổn định) — an toàn để commit.
"""
from __future__ import annotations

import glob
import json
import os
import re
import sys
import unicodedata
from collections import OrderedDict
from datetime import date

# Script nằm ở occupation-data/scripts/ — mọi đường dẫn tính từ occupation-data/.
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_PATH = os.path.join(HERE, "generated", "skills_taxonomy.json")

SRC_MERGED_78 = os.path.join(HERE, "datasets", "78_roles_unmerged.json")
SRC_TIER1_9 = os.path.join(HERE, "9_roles_tier1_pass2.json")
SRC_22 = os.path.join(HERE, "datasets", "final_22_roles.json")
SRC_SCENARIO_GLOBS = [
    os.path.join(HERE, "scenarios", "**", "*.json"),
]

# Chuỗi rác lọt vào danh sách skill của báo cáo — không phải skill.
JUNK_STRINGS = {"not using", "none", "n/a", "khác", "other"}

# ---------------------------------------------------------------------------
# Alias map TAY — chỉ gộp biến thể rõ ràng (khác casing / khác cách viết của
# cùng MỘT công nghệ / cùng MỘT kỹ năng). Key = tên canonical (name_vn),
# value = danh sách biến thể. So khớp sau khi casefold, nên không cần liệt kê
# khác biệt hoa/thường.
# KHÔNG gộp: Angular vs Angular.js (2 framework khác nhau), các chuỗi ghép
# kiểu "ReactJS/VueJS" (để người review quyết).
# ---------------------------------------------------------------------------
HARD_ALIASES: dict[str, list[str]] = {
    "JavaScript": ["Javascript", "JS"],
    "TypeScript": ["Typescript", "TS"],
    "React.js": ["ReactJS", "React", "Reactjs"],
    "Vue.js": ["VueJS", "Vue", "Vuejs"],
    "Next.js": ["NextJS", "Nextjs"],
    "Nuxt.js": ["NuxtJS", "Nuxtjs"],
    "Node.js": ["NodeJS", "Nodejs", "Node"],
    "Angular.js": ["AngularJS", "Angularjs"],
    "ASP.NET": ["ASP.Net", "ASP.net", "Asp.net"],
    "ASP.NET Core": ["ASP.Net Core", "Asp.net Core"],
    "PyTorch": ["Torch/PyTorch", "Torch"],
    "HTML/CSS": ["CSS/HTML", "HTML & CSS", "HTML, CSS"],
    "Scikit-learn": ["scikit-learn", "sklearn"],
    "Bash/Shell": ["Shell/Bash"],
}

SOFT_ALIASES: dict[str, list[str]] = {
    "Giải quyết vấn đề": ["Kỹ năng giải quyết vấn đề"],
    "Làm việc độc lập": ["Độc lập"],
    "Mentor": ["Mentoring"],
    "Lãnh đạo kỹ thuật": ["Technical Leadership"],
    "Lãnh đạo": ["Leadership"],
    "Chú ý chi tiết": ["Chi tiết"],
    "Thương lượng": ["Đàm phán"],
    "Chủ động học hỏi": ["Chịu khó học hỏi"],
}


def norm_key(s: str) -> str:
    """Khoá so khớp: trim + gộp khoảng trắng + casefold."""
    return re.sub(r"\s+", " ", s.strip()).casefold()


def slugify(name: str) -> str:
    """Sinh phần slug của skill_id: bỏ dấu tiếng Việt, ASCII, snake_case.
    Giữ phân biệt C / C# / C++ bằng cách thay # → sharp, + → plus trước khi lọc."""
    s = name.replace("#", " sharp ").replace("+", " plus ")
    s = unicodedata.normalize("NFD", s)
    s = "".join(ch for ch in s if unicodedata.category(ch) != "Mn")
    s = s.replace("đ", "d").replace("Đ", "D")
    s = s.casefold()
    s = re.sub(r"[^a-z0-9]+", "_", s).strip("_")
    return s or "unnamed"


class Taxonomy:
    """Gom skill theo (type, khoá canonical) — giữ thứ tự xuất hiện đầu tiên để chọn
    tên hiển thị, nhưng output cuối cùng được sort để deterministic."""

    def __init__(self) -> None:
        # (type, canonical_key) -> entry
        self.entries: "OrderedDict[tuple[str, str], dict]" = OrderedDict()
        # (type, alias_key) -> canonical_key
        self.alias_to_canonical: dict[tuple[str, str], str] = {}
        self.canonical_display: dict[tuple[str, str], str] = {}
        for skill_type, table in (("hard", HARD_ALIASES), ("soft", SOFT_ALIASES)):
            for canonical, variants in table.items():
                ckey = norm_key(canonical)
                self.canonical_display[(skill_type, ckey)] = canonical
                self.alias_to_canonical[(skill_type, ckey)] = ckey
                for v in variants:
                    self.alias_to_canonical[(skill_type, norm_key(v))] = ckey

    def add(self, raw: str | None, skill_type: str, category: str | None, source: str) -> None:
        if not raw or not isinstance(raw, str):
            return
        raw = re.sub(r"\s+", " ", raw.strip())
        if not raw:
            return
        key = norm_key(raw)
        if key in JUNK_STRINGS:
            return
        ckey = self.alias_to_canonical.get((skill_type, key), key)
        entry = self.entries.get((skill_type, ckey))
        if entry is None:
            display = self.canonical_display.get((skill_type, ckey), raw)
            entry = {
                "type": skill_type,
                "name_vn": display,
                "category": None,
                "_variants": OrderedDict(),   # raw string -> None (ordered set)
                "_sources": OrderedDict(),    # source -> None
                "_category_votes": OrderedDict(),
            }
            self.entries[(skill_type, ckey)] = entry
        entry["_variants"][raw] = None
        entry["_sources"][source] = None
        if category:
            entry["_category_votes"][category] = None

    def finalize(self) -> list[dict]:
        rows: list[dict] = []
        used_ids: set[str] = set()
        # sort ổn định: type rồi tên hiển thị (casefold) rồi tên gốc
        items = sorted(self.entries.items(), key=lambda kv: (kv[0][0], norm_key(kv[1]["name_vn"]), kv[1]["name_vn"]))
        for (skill_type, _ckey), e in items:
            name = e["name_vn"]
            if skill_type == "hard":
                votes = list(e["_category_votes"].keys())
                # ưu tiên nhãn từ báo cáo 22-role (language/framework); còn lại là tool
                category = "language" if "language" in votes else ("framework" if "framework" in votes else "tool")
            else:
                category = None
            base = f"{skill_type}_{slugify(name)}"
            sid = base
            n = 2
            while sid in used_ids:
                sid = f"{base}_{n}"
                n += 1
            used_ids.add(sid)
            aliases = [v for v in e["_variants"].keys() if v != name]
            # thêm alias tay chưa xuất hiện trong dữ liệu (để lookup tương lai vẫn khớp)
            table = HARD_ALIASES if skill_type == "hard" else SOFT_ALIASES
            for v in table.get(name, []):
                if v != name and v not in aliases and norm_key(v) != norm_key(name):
                    aliases.append(v)
            rows.append({
                "skill_id": sid,
                "name_vn": name,
                "type": skill_type,
                "category": category,
                "aliases": sorted(set(aliases), key=lambda s: (norm_key(s), s)),
                "sources": sorted(e["_sources"].keys()),
            })
        return rows


def load_json(path: str):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def scan_levels_dataset(tax: Taxonomy, path: str, source: str) -> int:
    """Shape 78-role / 9-role: roles[].levels[].skills_hard[].skill + skills_soft[]."""
    if not os.path.exists(path):
        print(f"  [skip] không thấy {path}", file=sys.stderr)
        return 0
    data = load_json(path)
    roles = data["roles"] if isinstance(data, dict) and "roles" in data else data
    n = 0
    for role in roles:
        for level in role.get("levels") or []:
            for s in level.get("skills_hard") or []:
                raw = s.get("skill") if isinstance(s, dict) else s
                tax.add(raw, "hard", "tool", source)
                n += 1
            for s in level.get("skills_soft") or []:
                raw = s.get("skill") if isinstance(s, dict) else s
                tax.add(raw, "soft", None, source)
                n += 1
    return n


def scan_22_roles(tax: Taxonomy, path: str, source: str) -> int:
    data = load_json(path)
    n = 0
    for role in data["roles"]:
        ss = role.get("skills_status") or {}
        for s in ss.get("hard_skills_languages") or []:
            tax.add(s.get("skill"), "hard", "language", source)
            n += 1
        for s in ss.get("hard_skills_frameworks") or []:
            tax.add(s.get("skill"), "hard", "framework", source)
            n += 1
        ge = role.get("graph_edges") or {}
        for sim in ge.get("similar_ranked") or []:
            for s in sim.get("shared_skills_top") or []:
                # chuỗi này đã lowercase; alias lookup casefold sẽ khớp về canonical
                tax.add(s, "hard", None, source)
                n += 1
    for e in data.get("graph_edges_full") or []:
        for s in e.get("shared_skills_top") or []:
            tax.add(s, "hard", None, source)
            n += 1
    return n


def scan_scenarios(tax: Taxonomy, patterns: list[str]) -> int:
    n = 0
    for pat in patterns:
        for path in sorted(glob.glob(pat, recursive=True)):
            try:
                data = load_json(path)
            except Exception as ex:  # noqa: BLE001
                print(f"  [warn] không đọc được {path}: {ex}", file=sys.stderr)
                continue
            source = "scenario:" + os.path.relpath(path, HERE)
            ctx = data.get("context") or {}
            for s in ctx.get("skills_hard") or []:
                tax.add(s, "hard", None, source)
                n += 1
            for s in ctx.get("skills_soft") or []:
                tax.add(s, "soft", None, source)
                n += 1
            # observes[].skill cũng phải resolve được — quét luôn để chắc chắn
            for act in data.get("activities") or []:
                for ob in act.get("observes") or []:
                    st = ob.get("skill_type")
                    if st in ("hard", "soft"):
                        tax.add(ob.get("skill"), st, None, source)
                        n += 1
    return n


def main() -> int:
    tax = Taxonomy()
    print("Quét nguồn skill:")
    # Thứ tự quét quyết định tên hiển thị khi KHÔNG có alias tay: quét dataset 22-role
    # trước vì casing ở đó là chuẩn báo cáo (React.js, Next.js ...).
    c22 = scan_22_roles(tax, SRC_22, "final_22_roles")
    print(f"  final_22_roles.json : {c22} chuỗi")
    c9 = scan_levels_dataset(tax, SRC_TIER1_9, "9_roles_tier1_pass2")
    print(f"  9_roles_tier1_pass2.json          : {c9} chuỗi")
    c78 = scan_levels_dataset(tax, SRC_MERGED_78, "78_roles_unmerged")
    print(f"  datasets/78_roles_unmerged.json: {c78} chuỗi")
    csc = scan_scenarios(tax, SRC_SCENARIO_GLOBS)
    print(f"  scenarios                         : {csc} chuỗi")

    rows = tax.finalize()
    hard = [r for r in rows if r["type"] == "hard"]
    soft = [r for r in rows if r["type"] == "soft"]
    merged = [r for r in rows if r["aliases"]]

    payload = {
        "_meta": {
            "generated_at": date.today().isoformat(),
            "generator": "occupation-data/scripts/build_skill_taxonomy.py",
            "sources": [
                "datasets/final_22_roles.json",
                "9_roles_tier1_pass2.json",
                "datasets/78_roles_unmerged.json",
                "scenarios/**/*.json",
            ],
            "counts": {"total": len(rows), "hard": len(hard), "soft": len(soft), "with_aliases": len(merged)},
            "note": "skill_id là khoá duy nhất cho cả pipeline sinh scenario lẫn graph 22-role. "
                    "Lookup: casefold(chuỗi) so với name_vn và aliases. "
                    "Alias map tay chỉ gộp biến thể rõ ràng; chuỗi ghép (VD 'ReactJS/VueJS') giữ nguyên chờ người review.",
        },
        "skills": rows,
    }
    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    with open(OUT_PATH, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)
        f.write("\n")

    print(f"\nĐã ghi {OUT_PATH}")
    print(f"  tổng {len(rows)} skill — hard {len(hard)} (language {sum(1 for r in hard if r['category']=='language')}, "
          f"framework {sum(1 for r in hard if r['category']=='framework')}, tool {sum(1 for r in hard if r['category']=='tool')}), soft {len(soft)}")
    print(f"  {len(merged)} skill có alias được gộp:")
    for r in merged:
        print(f"    {r['skill_id']:40} {r['name_vn']!r:28} <- {r['aliases']}")
    return 0


if __name__ == "__main__":
    sys.exit(main())

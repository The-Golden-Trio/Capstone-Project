#!/usr/bin/env python3
"""Quản lý docs/project-hub/tuan/: tuần, ID task, danh sách task, mục lục.

  python3 tools/hub/tuan.py week 2026-09-19 [--meeting]   → 2026-W39 (có --meeting: họp T7/CN tính cho tuần sau)
  python3 tools/hub/tuan.py init 2026-W40                  → tạo tuan/2026-W40/tuan.md nếu chưa có, cập nhật mục lục
  python3 tools/hub/tuan.py next-id 2026-09-19             → ID task kế tiếp của buổi họp ngày đó, vd T1909.3
  python3 tools/hub/tuan.py tasks [--week W] [--open] [--person Nam] [--json]
                                                           → task (trạng thái mới nhất của mỗi ID)
  python3 tools/hub/tuan.py index                          → viết lại bảng mục lục trong tuan/README.md
  python3 tools/hub/tuan.py check                          → kiểm tra bảng task, ID, trạng thái, link minutes

Quy ước (xem tuan/README.md):
  - Thư mục tuần = tuần ISO (T2 → CN). Buổi họp vào T7/CN là buổi MỞ ĐẦU của tuần sau.
  - ID task = T<ddmm của buổi họp giao task>.<số thứ tự>, vd T1909.2. Không rõ buổi họp: dùng ngày T2 của tuần.
  - Bảng "## Task giao" trong tuan.md có 7 cột: ID | Ai | Task | Hạn | Nguồn | Trạng thái | Bằng chứng.
    Task chưa xong được chuyển sang tuần sau với CÙNG ID; dòng ở tuần mới nhất là trạng thái hiện tại.
Chỉ dùng thư viện chuẩn.
"""
import argparse
import datetime as dt
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
TUAN = ROOT / "docs" / "project-hub" / "tuan"
WEEK_RE = re.compile(r"^(\d{4})-W(\d{2})$")
ID_RE = re.compile(r"\bT(\d{2})(\d{2})\.(\d{1,2})\b")
STATUS = {
    "✅": "xong", "🟡": "một phần", "⏳": "đang làm / chưa tới hạn", "❌": "trễ hạn, chưa có sản phẩm",
    "↪": "chuyển sang tuần sau", "🚫": "huỷ", "❓": "không đủ dữ liệu",
}
OPEN = {"⏳", "🟡", "❌", "❓", "↪"}
COLS = ["ID", "Ai", "Task", "Hạn", "Nguồn", "Trạng thái", "Bằng chứng"]
WD = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"]
INDEX_START, INDEX_END = "<!-- INDEX:START -->", "<!-- INDEX:END -->"


def week_of(d, meeting=False):
    if meeting and d.weekday() >= 5:
        d = d + dt.timedelta(days=7 - d.weekday())
    y, w, _ = d.isocalendar()
    return f"{y}-W{w:02d}"


def week_dates(week):
    y, w = map(int, WEEK_RE.match(week).groups())
    mon = dt.date.fromisocalendar(y, w, 1)
    return mon, mon + dt.timedelta(days=6)


def split_row(line):
    line = re.sub(r"`[^`]*`", lambda m: m.group(0).replace("|", "¦"), line.strip())
    line = line.replace("\\|", "¦")
    if line.startswith("|"):
        line = line[1:]
    if line.endswith("|"):
        line = line[:-1]
    return [c.strip() for c in line.split("|")]


def section(text, title):
    m = re.search(r"^##\s+" + re.escape(title) + r".*$", text, flags=re.M)
    if not m:
        return None
    nxt = re.search(r"^##\s+", text[m.end():], flags=re.M)
    return text[m.end(): m.end() + nxt.start()] if nxt else text[m.end():]


def parse_tasks(week_dir):
    f = week_dir / "tuan.md"
    if not f.is_file():
        return []
    sec = section(f.read_text(encoding="utf-8"), "Task giao")
    if sec is None:
        return []
    rows = []
    started = False
    for line in sec.splitlines():
        if not line.strip().startswith("|"):
            if started:
                break  # chỉ đọc bảng đầu tiên của mục
            continue
        started = True
        cells = split_row(line)
        if cells[0] in ("ID", "") or re.match(r"^:?-{2,}", cells[0]):
            continue
        rec = dict(zip(COLS, cells + [""] * (len(COLS) - len(cells))))
        rec["_ncols"] = len(cells)
        st = rec["Trạng thái"].strip()
        rec["status"] = next((s for s in STATUS if st.startswith(s)), "")
        rec["week"] = week_dir.name
        rows.append(rec)
    return rows


def weeks():
    return sorted(p for p in TUAN.iterdir() if p.is_dir() and WEEK_RE.match(p.name)) if TUAN.is_dir() else []


def all_tasks():
    latest, history = {}, {}
    for w in weeks():
        for r in parse_tasks(w):
            latest[r["ID"]] = r
            history.setdefault(r["ID"], []).append(r["week"])
    for k, r in latest.items():
        r["weeks"] = history[k]
    return latest


def skeleton(week):
    mon, sun = week_dates(week)
    y, w = map(int, WEEK_RE.match(week).groups())
    return f"""# Tuần {w} · {mon.day}/{mon.month} → {sun.day}/{sun.month}/{sun.year}

> Buổi họp T7/CN trước tuần này là buổi mở đầu tuần. Minutes: skill `/capstone-meeting-minutes`. Đối chiếu giao với làm được: skill `/capstone-weekly-progress` (thường chiều T6).

## Buổi họp

<!-- Mỗi buổi một dòng, link tới file minutes trong thư mục này. -->

## Task giao

| ID | Ai | Task | Hạn | Nguồn | Trạng thái | Bằng chứng |
|---|---|---|---|---|---|---|

## Làm thêm ngoài task giao

<!-- capstone-weekly-progress: việc có trong git/PR nhưng không gắn với task nào ở trên. -->

## Đã nộp / trình bày cho cô

<!-- Report, deck, demo. capstone-sync-report và capstone-meeting-minutes ghi vào đây. -->

## Theo người

<!-- capstone-weekly-progress: mỗi người 3–8 dòng, Đã xong / Đang làm / Quy ước. -->

## Chuyển sang tuần sau

<!-- Task ↪ và việc cần để ý. -->
"""


def cmd_index():
    readme = TUAN / "README.md"
    text = readme.read_text(encoding="utf-8")
    lines = ["| Tuần | Ngày | Buổi họp | Task | ✅ | 🟡 | ⏳ | ❌ | ↪ | 🚫 | ❓ |", "|---|---|---|---|---|---|---|---|---|---|---|"]
    for w in reversed(weeks()):
        mon, sun = week_dates(w.name)
        tasks = parse_tasks(w)
        meets = sorted(p.name for p in w.glob("????-??-??_*.md"))
        mt = ", ".join(f"[{int(m[8:10])}/{int(m[5:7])}]({w.name}/{m})" for m in meets) or "—"
        cnt = {s: sum(1 for t in tasks if t["status"] == s) for s in ["✅", "🟡", "⏳", "❌", "↪", "🚫", "❓"]}
        title = ""
        t = (w / "tuan.md").read_text(encoding="utf-8").splitlines()[0] if (w / "tuan.md").is_file() else ""
        m = re.search(r"—\s*(.+)$", t)
        if m:
            title = " · " + m.group(1)
        lines.append(f"| [{w.name}]({w.name}/tuan.md){title} | {mon.day}/{mon.month} – {sun.day}/{sun.month} | {mt} | {len(tasks)} | "
                     + " | ".join(str(cnt[s] or "") for s in cnt) + " |")
    block = f"{INDEX_START}\n" + "\n".join(lines) + f"\n{INDEX_END}"
    if INDEX_START in text:
        text = re.sub(re.escape(INDEX_START) + r"[\s\S]*?" + re.escape(INDEX_END), block, text)
    else:
        text += "\n" + block + "\n"
    readme.write_text(text, encoding="utf-8")
    print(f"Đã cập nhật {readme.relative_to(ROOT)} ({len(weeks())} tuần)")


def cmd_check():
    errs = []
    seen_ids = set()
    for w in weeks():
        tf = w / "tuan.md"
        if not tf.is_file():
            errs.append(f"{w.name}: thiếu tuan.md")
            continue
        text = tf.read_text(encoding="utf-8")
        if section(text, "Task giao") is None:
            errs.append(f"{w.name}/tuan.md: thiếu mục '## Task giao'")
        ids_here = set()
        for r in parse_tasks(w):
            where = f"{w.name}/tuan.md {r['ID']}"
            if r["_ncols"] != len(COLS):
                errs.append(f"{where}: có {r['_ncols']} cột, cần {len(COLS)}")
            if not re.fullmatch(r"T\d{4}\.\d{1,2}", r["ID"]):
                errs.append(f"{where}: ID sai dạng (cần T<ddmm>.<n>, vd T1909.2)")
            if r["ID"] in ids_here:
                errs.append(f"{where}: ID trùng trong cùng tuần")
            ids_here.add(r["ID"])
            if not r["status"]:
                errs.append(f"{where}: trạng thái '{r['Trạng thái']}' không hợp lệ. Dùng: {' '.join(STATUS)}")
        seen_ids |= ids_here
        for mf in w.glob("????-??-??_*.md"):
            if mf.name not in text:
                errs.append(f"{w.name}/tuan.md: chưa link tới minutes {mf.name}")
            d = dt.date.fromisoformat(mf.name[:10])
            if week_of(d, meeting=True) != w.name:
                errs.append(f"{w.name}/{mf.name}: buổi họp này thuộc {week_of(d, meeting=True)}, không phải {w.name}")
            sec = section(mf.read_text(encoding="utf-8"), "Task giao") or ""
            for m in ID_RE.finditer(sec):
                if m.group(0) not in seen_ids and not any(m.group(0) in (x / "tuan.md").read_text(encoding="utf-8")
                                                          for x in weeks() if (x / "tuan.md").is_file()):
                    errs.append(f"{w.name}/{mf.name}: task {m.group(0)} chưa có trong bảng Task giao của tuần nào")
    # ↪ without continuation
    lat = all_tasks()
    for k, r in lat.items():
        if r["status"] == "↪":
            errs.append(f"{r['week']}/tuan.md {k}: đánh ↪ nhưng tuần sau chưa có dòng tiếp theo (chạy capstone-weekly-progress hoặc thêm tay)")
    if errs:
        print("\n".join(errs))
        print(f"\n{len(errs)} lỗi")
        sys.exit(1)
    print(f"OK: {len(weeks())} tuần, {len(lat)} task")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    p = sub.add_parser("week"); p.add_argument("date"); p.add_argument("--meeting", action="store_true")
    p = sub.add_parser("init"); p.add_argument("week")
    p = sub.add_parser("next-id"); p.add_argument("date")
    p = sub.add_parser("tasks"); p.add_argument("--week"); p.add_argument("--open", action="store_true")
    p.add_argument("--person"); p.add_argument("--json", action="store_true")
    sub.add_parser("index"); sub.add_parser("check")
    a = ap.parse_args()

    if a.cmd == "week":
        print(week_of(dt.date.fromisoformat(a.date), a.meeting))
    elif a.cmd == "init":
        if not WEEK_RE.match(a.week):
            sys.exit("Tuần dạng 2026-W40")
        d = TUAN / a.week
        d.mkdir(parents=True, exist_ok=True)
        if not (d / "tuan.md").exists():
            (d / "tuan.md").write_text(skeleton(a.week), encoding="utf-8")
            print(f"Đã tạo {(d / 'tuan.md').relative_to(ROOT)}")
        else:
            print(f"Đã có {(d / 'tuan.md').relative_to(ROOT)}")
        cmd_index()
    elif a.cmd == "next-id":
        d = dt.date.fromisoformat(a.date)
        key = f"{d.day:02d}{d.month:02d}"
        mx = 0
        for f in TUAN.rglob("*.md"):
            for m in ID_RE.finditer(f.read_text(encoding="utf-8")):
                if m.group(1) + m.group(2) == key:
                    mx = max(mx, int(m.group(3)))
        print(f"T{key}.{mx + 1}")
    elif a.cmd == "tasks":
        if a.week:
            rows = parse_tasks(TUAN / a.week)
            lat = all_tasks()
            for r in rows:
                r["latest_status"] = lat.get(r["ID"], r)["status"]
        else:
            rows = list(all_tasks().values())
        if a.open:
            rows = [r for r in rows if r.get("latest_status", r["status"]) in OPEN]
        if a.person:
            rows = [r for r in rows if a.person.lower() in r["Ai"].lower() or "cả nhóm" in r["Ai"].lower()]
        if a.json:
            print(json.dumps([{k: v for k, v in r.items() if not k.startswith("_")} for r in rows], ensure_ascii=False, indent=1))
        else:
            for r in rows:
                print(f"{r['week']}  {r['ID']:<9} {r['status'] or '?'}  {r['Ai']:<10} {r['Task'][:90]}  (hạn {r['Hạn']})")
            print(f"— {len(rows)} task")
    elif a.cmd == "index":
        cmd_index()
    elif a.cmd == "check":
        cmd_check()


if __name__ == "__main__":
    main()

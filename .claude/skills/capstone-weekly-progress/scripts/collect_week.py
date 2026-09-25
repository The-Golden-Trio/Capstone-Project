#!/usr/bin/env python3
"""Collect one week of git + GitHub activity per team member.

Usage (from the repo root):
  python3 .claude/skills/capstone-weekly-progress/scripts/collect_week.py [--last | --week 2026-W39 |
          --since 2026-09-21 --until 2026-09-25] [--no-fetch] [--no-pr] [--out DIR]

Default window: Monday 00:00 of the current week (Asia/Ho_Chi_Minh) → now.
Reads:
  - commits on ALL branches (git log --all), by AUTHOR date, merges excluded,
    with files, +/- lines, area (web/api/data/...) and whether they reached origin/main
  - PRs touched in the window (gh CLI, if installed and logged in): title, body,
    state, files, commits, reviews
  - quality flags from tools/git (commit message + PR description rules)
  - tasks assigned for this week (docs/project-hub/tuan/<week>/tuan.md, via tools/hub/tuan.py)
    and still-open tasks from earlier weeks, with every commit/PR that cites their ID ("Task: T1909.2")
Writes to --out (default /tmp/capstone-weekly-progress/<YYYY-Www>):
  week.json   everything, machine-readable
  digest.md   per-person digest for Claude to read and summarise
Standard library only.
"""
import argparse
import datetime as dt
import json
import re
import shutil
import subprocess
import sys
from collections import Counter, defaultdict
from pathlib import Path

try:
    from zoneinfo import ZoneInfo
    TZ = ZoneInfo("Asia/Ho_Chi_Minh")
except Exception:  # tzdata missing
    TZ = dt.timezone(dt.timedelta(hours=7))

WEEKDAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"]
AREAS = [
    ("apps/web/", "web"), ("apps/api/", "api"), ("packages/game-core/data/", "game-data (sinh tự động)"),
    ("packages/game-core/", "game-core"), ("occupation-data/", "data"), ("docs/data/", "data"),
    ("docs/project-hub/", "hub"), ("reports/", "report"), ("docs/", "docs"), (".github/", "ci"),
    (".husky/", "ci"), ("tools/", "ci"), (".claude/", "skills"), ("infra/", "infra"),
    ("_archive/", "archive"), ("pnpm-lock.yaml", "deps"), ("package.json", "deps"),
]
SIZE_IGNORE = [re.compile(p) for p in (
    r"(^|/)pnpm-lock\.yaml$", r"(^|/)package-lock\.json$", r"^packages/game-core/data/.*\.json$",
    r"\.(png|jpe?g|gif|webp|svg|pdf|pptx|zip|ico)$")]
SQUASH_RE = re.compile(r"\(#(\d+)\)\s*$")


def run(cmd, check=True, **kw):
    r = subprocess.run(cmd, capture_output=True, text=True, **kw)
    if check and r.returncode != 0:
        raise RuntimeError(f"{' '.join(cmd)}: {r.stderr.strip()}")
    return r


def area_of(path):
    for pfx, name in AREAS:
        if path.startswith(pfx) or path == pfx:
            return name
    return "repo"


def window(a):
    now = dt.datetime.now(TZ)
    if a.since:
        start = dt.datetime.fromisoformat(a.since).replace(tzinfo=TZ)
        end = (dt.datetime.fromisoformat(a.until).replace(tzinfo=TZ) + dt.timedelta(days=1)) if a.until else now
    else:
        if a.week:
            y, w = re.match(r"(\d{4})-?W(\d{1,2})", a.week).groups()
            monday = dt.date.fromisocalendar(int(y), int(w), 1)
        else:
            monday = now.date() - dt.timedelta(days=now.weekday())
            if a.last:
                monday -= dt.timedelta(days=7)
        start = dt.datetime.combine(monday, dt.time(), TZ)
        end = min(now, start + dt.timedelta(days=7)) if not a.last and not a.week else start + dt.timedelta(days=7)
        end = min(end, now)
    return start, end


class Team:
    def __init__(self, path):
        self.members = json.loads(Path(path).read_text(encoding="utf-8"))["members"]
        self.by_email = {e.lower(): m["name"] for m in self.members for e in m.get("emails", [])}
        self.by_name = {n.lower(): m["name"] for m in self.members for n in m.get("git_names", [])}
        self.by_login = {l.lower(): m["name"] for m in self.members for l in m.get("github", [])}
        self.unknown = set()

    def person(self, name="", email="", login=""):
        for table, key in ((self.by_email, email), (self.by_login, login), (self.by_name, name)):
            if key and key.lower() in table:
                return table[key.lower()]
        if login:
            # GitHub noreply: 12345+login@users.noreply.github.com
            m = re.match(r"(?:\d+\+)?([^@]+)@users\.noreply\.github\.com", email or "")
            if m and m.group(1).lower() in self.by_login:
                return self.by_login[m.group(1).lower()]
        label = f"Chưa map: {name or login} <{email}>" if (name or email) else f"Chưa map: @{login}"
        self.unknown.add(label)
        return label


def collect_commits(start, end, team):
    since = (start - dt.timedelta(days=30)).isoformat()  # git filters by committer date; widen, then filter by author date
    fmt = "%x1e%H%x1f%an%x1f%ae%x1f%aI%x1f%cI%x1f%S%x1f%P%x1f%B%x1d"
    out = run(["git", "log", "--all", "--no-merges", f"--since={since}", "--numstat", "-M",
               f"--format={fmt}"]).stdout
    try:
        main_ref = "origin/main" if run(["git", "rev-parse", "--verify", "-q", "origin/main"], check=False).returncode == 0 else "main"
    except Exception:
        main_ref = "main"
    commits, seen = [], set()
    for rec in out.split("\x1e")[1:]:
        head, _, stat = rec.partition("\x1d")
        sha, an, ae, adate, cdate, src, parents, body = head.split("\x1f", 7)
        if sha in seen:
            continue
        seen.add(sha)
        when = dt.datetime.fromisoformat(adate).astimezone(TZ)
        if not (start <= when < end):
            continue
        files, size_files, size_lines = [], 0, 0
        for line in stat.strip().splitlines():
            m = re.match(r"^(\d+|-)\t(\d+|-)\t(.+)$", line)
            if not m:
                continue
            path = m.group(3)
            if "=>" in path:  # rename: a/{x => y}/b
                path = re.sub(r"\{[^}]*=> ([^}]*)\}", r"\1", path).replace("//", "/")
                path = path.split(" => ")[-1]
            add = 0 if m.group(1) == "-" else int(m.group(1))
            dele = 0 if m.group(2) == "-" else int(m.group(2))
            files.append({"path": path, "add": add, "del": dele, "area": area_of(path)})
            if not any(r.search(path) for r in SIZE_IGNORE):
                size_files += 1
                size_lines += add + dele
        on_main = run(["git", "merge-base", "--is-ancestor", sha, main_ref], check=False).returncode == 0
        subject = body.strip().split("\n", 1)[0]
        sq = SQUASH_RE.search(subject)
        commits.append({
            "sha": sha, "short": sha[:7], "person": team.person(an, ae), "author": f"{an} <{ae}>",
            "date": when.isoformat(timespec="minutes"), "weekday": WEEKDAYS[when.weekday()],
            "committed": dt.datetime.fromisoformat(cdate).astimezone(TZ).isoformat(timespec="minutes"),
            "ref": src.replace("refs/heads/", "").replace("refs/remotes/", ""),
            "on_main": on_main, "squash_of_pr": int(sq.group(1)) if sq and on_main else None,
            "subject": subject, "body": body.strip().split("\n", 1)[1].strip() if "\n" in body.strip() else "",
            "files": files, "size": {"files": size_files, "lines": size_lines},
        })
    commits.sort(key=lambda c: c["date"])
    return commits


def collect_prs(start, team, warnings):
    if not shutil.which("gh"):
        warnings.append("Không có `gh` CLI → không đọc được PR. Cài: https://cli.github.com rồi `gh auth login`.")
        return None
    if run(["gh", "auth", "status"], check=False).returncode != 0:
        warnings.append("`gh` chưa đăng nhập → không đọc được PR. Chạy `gh auth login`.")
        return None
    fields = ("number,title,body,author,state,isDraft,createdAt,updatedAt,mergedAt,closedAt,baseRefName,"
              "headRefName,additions,deletions,changedFiles,url,reviews,commits,files")
    r = run(["gh", "pr", "list", "--state", "all", "--limit", "200", "--search",
             f"updated:>={start.date().isoformat()}", "--json", fields], check=False)
    if r.returncode != 0:
        warnings.append(f"`gh pr list` lỗi: {r.stderr.strip()[:200]}")
        return None
    prs = json.loads(r.stdout)
    # learn login → person from the PR's commits
    for pr in prs:
        for c in pr.get("commits", []):
            for au in c.get("authors", []):
                if au.get("login") and au.get("email"):
                    p = team.person(au.get("name", ""), au["email"])
                    if not p.startswith("Chưa map"):
                        team.by_login.setdefault(au["login"].lower(), p)
    out = []
    for pr in prs:
        login = (pr.get("author") or {}).get("login", "")
        out.append({
            "number": pr["number"], "title": pr["title"], "body": pr.get("body") or "", "url": pr["url"],
            "person": team.person(login=login), "login": login, "state": pr["state"], "draft": pr["isDraft"],
            "base": pr["baseRefName"], "head": pr["headRefName"], "created": pr["createdAt"],
            "merged": pr.get("mergedAt"), "closed": pr.get("closedAt"), "updated": pr["updatedAt"],
            "additions": pr["additions"], "deletions": pr["deletions"], "changed_files": pr["changedFiles"],
            "files": [f["path"] for f in pr.get("files", [])][:80],
            "areas": dict(Counter(area_of(f["path"]) for f in pr.get("files", []))),
            "commits": [c["oid"][:7] + " " + c["messageHeadline"] for c in pr.get("commits", [])],
            "reviews": [{"by": team.person(login=(rv.get("author") or {}).get("login", "")),
                         "state": rv["state"], "at": rv.get("submittedAt"), "body": (rv.get("body") or "")[:300]}
                        for rv in pr.get("reviews", [])],
        })
    return out


def lint_all(commits, prs):
    if not shutil.which("node") or not Path("tools/git/lint-commit-msg.mjs").exists():
        return
    items = [{"sha": c["sha"], "message": c["subject"] + ("\n\n" + c["body"] if c["body"] else ""),
              "files": c["size"]["files"], "lines": c["size"]["lines"], "date": c["date"][:10]} for c in commits]
    items += [{"kind": "pr", "id": p["number"], "title": p["title"], "body": p["body"]} for p in (prs or [])]
    r = run(["node", "tools/git/lint-commit-msg.mjs", "--batch"], check=False, input=json.dumps(items))
    if r.returncode != 0:
        return
    res = json.loads(r.stdout)
    by_sha = {x["sha"]: x for x in res if "sha" in x}
    by_pr = {x["id"]: x for x in res if "id" in x}
    for c in commits:
        x = by_sha.get(c["sha"], {})
        c["lint"] = {"errors": x.get("errors", []), "warnings": x.get("warnings", []), "legacy": x.get("legacy", False)}
    for p in prs or []:
        x = by_pr.get(p["number"], {})
        p["lint"] = {"errors": x.get("errors", []), "warnings": x.get("warnings", [])}


TASK_ID_RE = re.compile(r"\bT\d{4}\.\d{1,2}\b")


def load_tasks(week_id, warnings):
    tool = Path("tools/hub/tuan.py")
    if not tool.exists():
        warnings.append("Không có tools/hub/tuan.py → không đọc được task giao.")
        return [], []
    import importlib.util
    spec = importlib.util.spec_from_file_location("tuan", tool)
    tuan = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(tuan)
    latest = tuan.all_tasks()
    here = tuan.parse_tasks(tuan.TUAN / week_id)
    if not (tuan.TUAN / week_id / "tuan.md").exists():
        warnings.append(f"Chưa có docs/project-hub/tuan/{week_id}/tuan.md → chưa có task giao cho tuần này "
                        f"(chạy `python3 tools/hub/tuan.py init {week_id}`).")
    ids_here = {r["ID"] for r in here}
    older_open = [r for k, r in latest.items() if k not in ids_here and r["status"] in tuan.OPEN]
    clean = lambda r: {k: v for k, v in r.items() if not k.startswith("_")}
    return [clean(r) for r in here], [clean(r) for r in older_open]


def link_tasks(tasks, commits, prs):
    refs = defaultdict(list)
    for c in commits:
        for t in set(TASK_ID_RE.findall(c["subject"] + "\n" + c["body"])):
            refs[t].append(f"`{c['short']}` {c['subject']}")
    for p in prs or []:
        text = p["title"] + "\n" + p["body"] + "\n" + "\n".join(p["commits"])
        for t in set(TASK_ID_RE.findall(text)):
            refs[t].append(f"PR #{p['number']} ({p['state'].lower()}) {p['title']}")
    for t in tasks:
        t["refs"] = refs.get(t["ID"], [])
    known = {t["ID"] for t in tasks}
    return {k: v for k, v in refs.items() if k not in known}


def fmt_dt(iso):
    if not iso:
        return ""
    d = dt.datetime.fromisoformat(iso.replace("Z", "+00:00")).astimezone(TZ)
    return f"{WEEKDAYS[d.weekday()]} {d.day}/{d.month} {d:%H:%M}"


def digest(start, end, commits, prs, team, warnings, tasks=(), older=(), stray=None):
    iso = start.isocalendar()
    L = [f"# Dữ liệu tuần {iso[0]}-W{iso[1]:02d}: {start.day}/{start.month} → {end.day}/{end.month} {end:%H:%M} (giờ VN)", ""]
    if warnings or team.unknown:
        L += ["## Cảnh báo", ""] + [f"- {w}" for w in warnings] + \
             [f"- {u} → thêm vào `.claude/skills/capstone-weekly-progress/team.json`" for u in sorted(team.unknown)] + [""]
    people = [m["name"] for m in team.members] + sorted({c["person"] for c in commits if c["person"].startswith("Chưa map")})

    def task_rows(rows, with_week=False):
        out = ["| ID | Ai | Task | Hạn | Trạng thái đang ghi" + (" | Ở tuần" if with_week else "") + " | Commit / PR ghi ID này |",
               "|---|---|---|---|---" + ("|---" if with_week else "") + "|---|"]
        for t in rows:
            refs = "<br>".join(r.replace("|", "¦") for r in t.get("refs", [])) or "—"
            out.append(f"| {t['ID']} | {t['Ai']} | {t['Task'].replace('|', '¦')[:160]} | {t['Hạn']} | {t['status'] or '?'}"
                       + (f" | {t['week']}" if with_week else "") + f" | {refs} |")
        return out

    L += ["## Task giao tuần này", ""]
    L += task_rows(tasks) if tasks else ["*Chưa có task nào trong bảng Task giao của tuần này.*"]
    L.append("")
    if older:
        L += ["## Task cũ còn mở (tuần trước)", ""] + task_rows(older, True) + [""]
    if stray:
        L += ["## ID task được nhắc trong commit/PR nhưng không có trong bảng", ""] + \
             [f"- {k}: " + "; ".join(v) for k, v in sorted(stray.items())] + [""]
    L += ["## Tổng quan", "", "| Người | Commit | Ngày có commit | +/− (không tính lockfile, file sinh) | PR mở | PR merge | Review |",
          "|---|---|---|---|---|---|---|"]
    for p in people:
        cs = [c for c in commits if c["person"] == p and not c["squash_of_pr"]]
        days = sorted({c["weekday"] for c in cs}, key=WEEKDAYS.index)
        add = sum(f["add"] for c in cs for f in c["files"] if not any(r.search(f["path"]) for r in SIZE_IGNORE))
        dele = sum(f["del"] for c in cs for f in c["files"] if not any(r.search(f["path"]) for r in SIZE_IGNORE))
        if prs is None:
            opened = merged = reviews = "?"
        else:
            opened = sum(1 for x in prs if x["person"] == p and x["created"] >= start.astimezone(dt.timezone.utc).isoformat()[:19])
            merged = sum(1 for x in prs if x["person"] == p and x["merged"] and x["merged"] >= start.astimezone(dt.timezone.utc).isoformat()[:19])
            reviews = sum(1 for x in prs for rv in x["reviews"] if rv["by"] == p and (rv["at"] or "") >= start.astimezone(dt.timezone.utc).isoformat()[:19])
        L.append(f"| {p} | {len(cs)} | {' '.join(days) or '—'} | +{add} / −{dele} | {opened} | {merged} | {reviews} |")
    L.append("")

    for p in people:
        cs = [c for c in commits if c["person"] == p]
        mine = [x for x in (prs or []) if x["person"] == p]
        L += [f"## {p}", ""]
        areas = Counter()
        for c in cs:
            for f in c["files"]:
                areas[f["area"]] += f["add"] + f["del"]
        if areas:
            L += ["**Phần đã động tới (dòng thay đổi):** " + ", ".join(f"{a} {n}" for a, n in areas.most_common()), ""]
        if cs:
            L += ["### Commit", "", "| Khi | Branch | SHA | Message | File | +/− | Lên main | Quy ước |", "|---|---|---|---|---|---|---|---|"]
            for c in cs:
                flag = ""
                if c.get("lint"):
                    mark = "⚠ (commit cũ, trước khi có quy ước) " if c["lint"].get("legacy") else "✖ "
                    flag = mark + "; ".join(c["lint"]["errors"])[:140] if c["lint"]["errors"] else ("⚠" if c["lint"]["warnings"] else "✔")
                add = sum(f["add"] for f in c["files"])
                dele = sum(f["del"] for f in c["files"])
                sq = f" (squash PR #{c['squash_of_pr']})" if c["squash_of_pr"] else ""
                L.append(f"| {fmt_dt(c['date'])} | `{c['ref']}` | `{c['short']}` | {c['subject'].replace('|', '¦')}{sq} | {len(c['files'])} | +{add}/−{dele} | {'✔' if c['on_main'] else ''} | {flag.replace('|', '¦')} |")
            L.append("")
            detailed = [c for c in cs if c["body"] or (c.get("lint") and c["lint"]["errors"])]
            if detailed:
                L += ["### Chi tiết commit (body, và file của commit có message kém)", ""]
                for c in detailed:
                    L.append(f"- `{c['short']}` {c['subject']}")
                    if c["body"]:
                        L += ["  > " + ln for ln in c["body"].splitlines()[:12]]
                    if c.get("lint") and c["lint"]["errors"]:
                        top = sorted(c["files"], key=lambda f: -(f["add"] + f["del"]))[:12]
                        L.append("  File: " + ", ".join(f"`{f['path']}` +{f['add']}/−{f['del']}" for f in top))
                L.append("")
        if mine:
            L += ["### PR", ""]
            for x in mine:
                state = "draft" if x["draft"] and x["state"] == "OPEN" else x["state"].lower()
                L.append(f"- **#{x['number']} {x['title']}** ({state}, {x['head']} → {x['base']}, tạo {fmt_dt(x['created'])}"
                         + (f", merge {fmt_dt(x['merged'])}" if x["merged"] else "") + f") {x['url']}")
                L.append(f"  - {x['changed_files']} file, +{x['additions']}/−{x['deletions']}; phần: " +
                         ", ".join(f"{a} ({n})" for a, n in sorted(x["areas"].items(), key=lambda t: -t[1])))
                if x.get("lint") and x["lint"]["errors"]:
                    L.append("  - ✖ Quy ước: " + "; ".join(x["lint"]["errors"]))
                body = re.sub(r"<!--[\s\S]*?-->", "", x["body"]).strip()
                L += (["  - Description:"] + ["    > " + ln for ln in body.splitlines()[:30]]) if body else ["  - Description: *(trống)*"]
                if x["reviews"]:
                    L.append("  - Review: " + "; ".join(f"{rv['by']} {rv['state'].lower()} {fmt_dt(rv['at'])}" for rv in x["reviews"]))
            L.append("")
        given = [(x, rv) for x in (prs or []) for rv in x["reviews"] if rv["by"] == p and x["person"] != p]
        if given:
            L += ["### Review cho người khác", ""] + [f"- #{x['number']} ({x['person']}): {rv['state'].lower()} {fmt_dt(rv['at'])}"
                                                      + (f": {rv['body'][:120]}" if rv["body"] else "") for x, rv in given] + [""]
        if not cs and not mine and not given:
            L += ["*Không có commit, PR hay review nào trong tuần (trên các branch đã fetch).*", ""]
    return "\n".join(L) + "\n"


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    g = ap.add_mutually_exclusive_group()
    g.add_argument("--last", action="store_true", help="tuần trước")
    g.add_argument("--week", help="ISO week, vd 2026-W39")
    g.add_argument("--since", help="YYYY-MM-DD (giờ VN)")
    ap.add_argument("--until", help="YYYY-MM-DD, tính cả ngày đó")
    ap.add_argument("--no-fetch", action="store_true")
    ap.add_argument("--no-pr", action="store_true")
    ap.add_argument("--team", default=str(Path(__file__).resolve().parent.parent / "team.json"))
    ap.add_argument("--out")
    a = ap.parse_args()

    if run(["git", "rev-parse", "--is-inside-work-tree"], check=False).returncode != 0:
        sys.exit("Chạy script từ trong repo.")
    start, end = window(a)
    warnings = []
    if not a.no_fetch:
        r = run(["git", "fetch", "--all", "--prune", "--quiet"], check=False)
        if r.returncode != 0:
            warnings.append("`git fetch` lỗi (" + r.stderr.strip().splitlines()[-1][:150] + ") → chỉ thấy các branch đã có ở máy. Commit trên branch người khác chưa fetch sẽ bị thiếu.")
    team = Team(a.team)
    commits = collect_commits(start, end, team)
    prs = None if a.no_pr else collect_prs(start, team, warnings)
    if a.no_pr:
        warnings.append("Bỏ qua PR (--no-pr).")
    lint_all(commits, prs)
    iso0 = start.isocalendar()
    tasks, older = load_tasks(f"{iso0[0]}-W{iso0[1]:02d}", warnings)
    stray = link_tasks(tasks + older, commits, prs)

    iso = start.isocalendar()
    out = Path(a.out or f"/tmp/capstone-weekly-progress/{iso[0]}-W{iso[1]:02d}")
    out.mkdir(parents=True, exist_ok=True)
    (out / "week.json").write_text(json.dumps({
        "window": {"start": start.isoformat(), "end": end.isoformat(), "iso_week": f"{iso[0]}-W{iso[1]:02d}"},
        "warnings": warnings, "unknown_authors": sorted(team.unknown), "commits": commits, "prs": prs,
        "tasks": tasks, "older_open_tasks": older, "unlisted_task_refs": stray,
    }, ensure_ascii=False, indent=1), encoding="utf-8")
    (out / "digest.md").write_text(digest(start, end, commits, prs, team, warnings, tasks, older, stray), encoding="utf-8")

    print(f"Tuần {iso[0]}-W{iso[1]:02d}: {start:%d/%m %H:%M} → {end:%d/%m %H:%M} (giờ VN)")
    print(f"Commit: {len(commits)} · PR: {'?' if prs is None else len(prs)} · Task giao tuần này: {len(tasks)} · task cũ còn mở: {len(older)}")
    for p, n in Counter(c["person"] for c in commits).most_common():
        print(f"  {p}: {n} commit")
    for w in warnings + sorted(team.unknown):
        print("⚠ " + w)
    print(f"Đã ghi: {out}/digest.md, {out}/week.json")


if __name__ == "__main__":
    main()

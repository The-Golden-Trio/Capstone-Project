"""Measure generated NPC lines against the profile draft (v0.3).

Usage: python -I measure_output.py <lines.json> <profile.md>

lines.json: array of {scene, npc ("IV"|"0"), speaker, text, expression, context ("work"|"side"|"interview"), q?}
Beats with expression null/empty are excluded from expression stats.
Beats whose speaker is in NARRATION_SPEAKERS are excluded from the pronoun checks
(narration may legitimately address the player as "bạn").
Scene grouping for expression variety / signature phrases is (scene, npc).
Exit code is always 0 for a successful run; flags are printed and counted.
"""
import importlib.util
import json
import os
import re
import sys
import unicodedata
from collections import Counter, defaultdict

NARRATION_SPEAKERS = {"canh", "narrator", "narration", "loi_dan", "lời dẫn"}
PARTICLES = ["nhé", "nhỉ", "đấy", "nha", "hen", "á", "hông"]
PAST_JOB = ["hồi trước", "lần trước ở"]
REQUIRED = ["scene", "npc", "speaker", "text", "expression", "context"]
CONTEXTS = ["work", "side", "interview"]


def load_lint():
    here = os.path.dirname(os.path.abspath(__file__))
    spec = importlib.util.spec_from_file_location("lint_profile", os.path.join(here, "lint_profile.py"))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def nfc(s):
    return unicodedata.normalize("NFC", s)


def norm(s):
    s = nfc(s).lower()
    s = re.sub(r"[^\w\s{}]", " ", s)
    return " ".join(s.split())


def tokens(s):
    return norm(s).split()


def count_phrase(text, phrase):
    t = " " + norm(text) + " "
    p = " " + norm(phrase) + " "
    return t.count(p)


def sentence_final_tokens(text):
    out = []
    for sent in re.split(r"[.!?…]+", nfc(text)):
        t = tokens(sent)
        if t:
            out.append(t[-1])
    return out


def is_c1(scene):
    return re.match(r"^C1(?![A-Za-z0-9])", str(scene)) is not None


def short(b):
    return '[%s #%d %s/%s] "%s"' % (b["scene"], b["_i"], b["npc"], b["context"], b["text"])


def main(argv):
    if len(argv) != 3:
        print("usage: python -I measure_output.py <lines.json> <profile.md>")
        return 2
    lint = load_lint()
    profiles = lint.load_profiles(argv[2])
    with open(argv[1], encoding="utf-8-sig") as f:
        beats = json.load(f)
    if not isinstance(beats, list):
        print("ERROR: lines.json must be a JSON array")
        return 2
    for i, b in enumerate(beats):
        miss = [k for k in REQUIRED if k not in b]
        if miss:
            print("ERROR: beat %d missing keys %s" % (i, miss))
            return 2
        if b["npc"] not in profiles:
            print('ERROR: beat %d has npc %r, expected "IV" or "0"' % (i, b["npc"]))
            return 2
        if b["context"] not in CONTEXTS:
            print("ERROR: beat %d has context %r, expected %s" % (i, b["context"], CONTEXTS))
            return 2
        b["_i"] = i
        b["text"] = nfc(str(b["text"]))
    flags = 0

    def flag(msg):
        nonlocal flags
        flags += 1
        print("  FLAG " + msg)

    npcs = [n for n in ("IV", "0") if any(b["npc"] == n for b in beats)]
    print("== %d beats; NPCs present: %s ==" % (len(beats), npcs))

    print("\n-- 1. hiem_dung share of beats (flag > 10%; null expressions excluded) --")
    for n in npcs:
        hiem = set(profiles[n]["bieu_cam"]["hiem_dung"])
        groups = [("all", [b for b in beats if b["npc"] == n and b.get("expression")])]
        for c in CONTEXTS:
            groups.append((c, [b for b in groups[0][1] if b["context"] == c]))
        for label, bs in groups:
            if not bs:
                continue
            k = sum(1 for b in bs if b["expression"] in hiem)
            pct = 100.0 * k / len(bs)
            print("  NPC %s, %-9s: %d/%d = %.1f%% (hiem_dung=%s)" % (n, label, k, len(bs), pct, sorted(hiem)))
            if pct > 10:
                flag("NPC %s %s: hiem_dung share %.1f%% > 10%%" % (n, label, pct))

    print("\n-- 2. distinct expressions per scene (flag >= 6 beats and < 3 distinct) --")
    by_scene = defaultdict(list)
    for b in beats:
        by_scene[(b["scene"], b["npc"])].append(b)
    for (sc, n), bs in sorted(by_scene.items(), key=lambda kv: (str(kv[0][0]), kv[0][1])):
        ex = [b["expression"] for b in bs if b.get("expression")]
        d = sorted(set(ex))
        print("  scene %s, NPC %s: %d beats with expression, %d distinct %s" % (sc, n, len(ex), len(d), d))
        if len(ex) >= 6 and len(d) < 3:
            flag("scene %s NPC %s: %d beats but only %d distinct expressions" % (sc, n, len(ex), len(d)))

    print("\n-- 3. cau_cua_rieng per scene (flag total > 1) --")
    for (sc, n), bs in sorted(by_scene.items(), key=lambda kv: (str(kv[0][0]), kv[0][1])):
        cnt = Counter()
        for b in bs:
            if b["speaker"] in NARRATION_SPEAKERS:
                continue
            for ph in profiles[n]["giong"]["cau_cua_rieng"]:
                cnt[ph] += count_phrase(b["text"], ph)
        total = sum(cnt.values())
        print("  scene %s, NPC %s: total %d %s" % (sc, n, total, dict(cnt)))
        if total > 1:
            flag("scene %s NPC %s: cau_cua_rieng used %d times" % (sc, n, total))

    print("\n-- 4. beats containing digits --")
    dig = [b for b in beats if re.search(r"\d", b["text"])]
    if not dig:
        print("  none")
    for b in dig:
        flag("digit in " + short(b))

    print("\n-- 5. pronoun checks --")
    excluded = 0
    for b in beats:
        if b["speaker"] in NARRATION_SPEAKERS:
            excluded += 1
            continue
        toks = set(tokens(b["text"]))
        if b["npc"] == "IV":
            bad = [t for t in ("nha", "hen", "bạn") if t in toks]
            if bad:
                flag("IV uses %s in %s" % (bad, short(b)))
        elif b["npc"] == "0" and b["context"] == "work":
            low = b["text"].lower()
            bad = []
            if "{ten}" in low:
                bad.append("{ten}")
            if re.search(r"(?<!\w)linh(?!\w)", low):
                bad.append("Linh")
            if bad:
                flag("0 in work uses %s in %s" % (bad, short(b)))
    print("  (%d narration beats skipped)" % excluded)

    print("\n-- 6. forbidden in work context --")
    for b in beats:
        if b["context"] != "work":
            continue
        t = norm(b["text"])
        if "quán cơm" in t and not is_c1(b["scene"]):
            flag("'quán cơm' in non-C1 work scene: " + short(b))
        for ph in PAST_JOB:
            if ph in t:
                flag("past-job phrase '%s' in work: %s" % (ph, short(b)))

    print("\n-- 7. particle fingerprint (sentence-final count / any-position count / beats) --")
    for n in npcs:
        bs = [b for b in beats if b["npc"] == n and b["speaker"] not in NARRATION_SPEAKERS]
        fin = Counter()
        anyc = Counter()
        for b in bs:
            fin.update(t for t in sentence_final_tokens(b["text"]) if t in PARTICLES)
            tk = tokens(b["text"])
            anyc.update(t for t in tk if t in PARTICLES)
        profile_particles = profiles[n]["giong"]["tro_tu"]
        print("  NPC %s (%d beats; profile tro_tu=%s)" % (n, len(bs), profile_particles))
        for p in PARTICLES:
            per100 = 100.0 * fin[p] / len(bs) if bs else 0.0
            print("    %-4s final=%d (%.1f per 100 beats)  any=%d" % (p, fin[p], per100, anyc[p]))

    print("\nTOTAL FLAGS: %d" % flags)
    return 0


if __name__ == "__main__":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass
    sys.exit(main(sys.argv))

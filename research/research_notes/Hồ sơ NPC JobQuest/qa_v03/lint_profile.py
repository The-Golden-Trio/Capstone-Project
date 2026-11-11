"""Static lint for the tarot NPC profile draft (v0.3).

Usage: python -I lint_profile.py <profile.md>
Exit code 1 if any check FAILs.
"""
import re
import sys
import unicodedata

EXPRESSIONS = {"binh_thuong", "vui", "cuoi_lon", "ngac_nhien", "suy_nghi", "lo_lang", "kho_chiu", "buon"}
CORE_SCALARS = ["muon", "so", "diem_yeu", "khi_ap_luc", "niem_tin_nen"]
REMOVED_FIELDS = ["ly_do_co_mat", "da_gap", "sidequest_hooks"]
HIGH_LEVELS = ["than", "gan_bo", "tri_ky"]
STOPWORDS = set(
    "và của là mà thì cho với được có một những các này đó ra để về cũng rồi nó khi nên hay lại cả đã sẽ đang thế".split()
)
FORBIDDEN_IN_CARD = ["Mức thân", "Đã gặp", "ký ức"]


def nfc(s):
    return unicodedata.normalize("NFC", s)


# ---------------------------------------------------------------- mini YAML
def strip_comment(line):
    inq = False
    for i, ch in enumerate(line):
        if ch == '"':
            inq = not inq
        elif ch == "#" and not inq and (i == 0 or line[i - 1] in " \t"):
            return line[:i].rstrip()
    return line.rstrip()


def balance(s):
    inq = False
    n = 0
    for ch in s:
        if ch == '"':
            inq = not inq
        elif not inq:
            if ch in "{[":
                n += 1
            elif ch in "}]":
                n -= 1
    return n


def prepare(block_lines):
    out = []
    buf = None
    for raw in block_lines:
        line = strip_comment(raw)
        if not line.strip():
            continue
        if buf is not None:
            buf[1] += " " + line.strip()
            if balance(buf[1]) <= 0:
                out.append((buf[0], buf[1]))
                buf = None
            continue
        indent = len(line) - len(line.lstrip(" "))
        text = line.strip()
        if balance(text) > 0:
            buf = [indent, text]
        else:
            out.append((indent, text))
    return out


def _ws(s, i):
    while i < len(s) and s[i] in " \t":
        i += 1
    return i


def parse_flow(s, i, in_flow):
    i = _ws(s, i)
    if i >= len(s):
        return "", i
    c = s[i]
    if c == "{":
        d = {}
        i += 1
        while True:
            i = _ws(s, i)
            if s[i] == "}":
                return d, i + 1
            j = s.index(":", i)
            key = s[i:j].strip()
            val, i = parse_flow(s, j + 1, True)
            d[key] = val
            i = _ws(s, i)
            if s[i] == ",":
                i += 1
    if c == "[":
        lst = []
        i += 1
        while True:
            i = _ws(s, i)
            if s[i] == "]":
                return lst, i + 1
            val, i = parse_flow(s, i, True)
            lst.append(val)
            i = _ws(s, i)
            if s[i] == ",":
                i += 1
    if c == '"':
        j = i + 1
        while s[j] != '"':
            j += 2 if s[j] == "\\" else 1
        return s[i + 1:j], j + 1
    j = i
    stops = ",}]" if in_flow else ""
    while j < len(s) and s[j] not in stops:
        j += 1
    v = s[i:j].strip()
    return (None if v in ("null", "~") else v), j


def parse_scalar(s):
    return parse_flow(s.strip(), 0, False)[0]


KEY_RE = re.compile(r"^(\S+?):(?:\s+(.*))?$")


def parse_block(items, i, indent):
    if items[i][1].startswith("-"):
        lst = []
        while i < len(items) and items[i][0] == indent and items[i][1].startswith("-"):
            lst.append(parse_scalar(items[i][1][1:]))
            i += 1
        return lst, i
    d = {}
    while i < len(items) and items[i][0] == indent and not items[i][1].startswith("- "):
        m = KEY_RE.match(items[i][1])
        if not m:
            raise ValueError("cannot parse YAML line: %r" % items[i][1])
        key, rest = m.group(1), (m.group(2) or "").strip()
        i += 1
        if rest == "":
            if i < len(items) and (items[i][0] > indent or (items[i][0] == indent and items[i][1].startswith("- "))):
                val, i = parse_block(items, i, items[i][0])
            else:
                val = None
        elif rest in (">", "|"):
            parts = []
            while i < len(items) and items[i][0] > indent:
                parts.append(items[i][1])
                i += 1
            val = " ".join(parts)
        else:
            val = parse_scalar(rest)
        d[key] = val
    return d, i


def parse_yaml(block_lines):
    items = prepare(block_lines)
    val, i = parse_block(items, 0, items[0][0])
    if i != len(items):
        raise ValueError("unparsed trailing line: %r" % (items[i],))
    return val


# ---------------------------------------------------------------- markdown
def first_fence(lines, start, end, lang="yaml"):
    i = start
    while i < end:
        if lines[i].startswith("```" + lang):
            j = i + 1
            while not lines[j].startswith("```"):
                j += 1
            return lines[i + 1:j]
        i += 1
    return None


def find_line(lines, pattern):
    for i, l in enumerate(lines):
        if re.match(pattern, l):
            return i
    raise ValueError("heading not found: " + pattern)


def next_heading(lines, start, pattern):
    for i in range(start + 1, len(lines)):
        if re.match(pattern, lines[i]):
            return i
    return len(lines)


def load_document(path):
    with open(path, encoding="utf-8-sig") as f:
        text = nfc(f.read())
    lines = text.split("\n")
    s2 = find_line(lines, r"^## 2\b")
    e2 = next_heading(lines, s2, r"^## ")
    s72 = find_line(lines, r"^### 7\.2\b")
    e72 = next_heading(lines, s72, r"^##+ ")
    iv_raw = first_fence(lines, s2, e2)
    nhi_raw = first_fence(lines, s72, e72)
    if iv_raw is None or nhi_raw is None:
        raise ValueError("YAML block missing in section 2 or 7.2")
    profiles = {}
    for label, raw in (("IV", iv_raw), ("0", nhi_raw)):
        profiles[label] = {"data": parse_yaml(raw), "raw": raw}
    card_start = None
    for i, l in enumerate(lines):
        if l.startswith("[quan_ly] Hà"):
            card_start = i
            break
    card = None
    if card_start is not None:
        card = []
        for l in lines[card_start:]:
            if l.startswith("── Trong màn này") or l.startswith("```"):
                break
            card.append(l)
    return profiles, card


def load_profiles(path):
    """Returns {"IV": dict, "0": dict} keyed by la_bai.so."""
    profiles, _ = load_document(path)
    return {k: v["data"] for k, v in profiles.items()}


# ---------------------------------------------------------------- helpers
def words(s):
    return str(s).split()


def norm_phrase(s):
    s = nfc(str(s)).lower()
    s = re.sub(r"[^\w\s{}]", " ", s)
    return " ".join(s.split())


def content_segments(text):
    out = []
    for seg in re.split(r"[,.;:!?…\"“”()\-–—]+", nfc(text).lower()):
        toks = [t for t in seg.split() if t not in STOPWORDS]
        if toks:
            out.append(toks)
    return out


def ngrams(text, n):
    res = set()
    for toks in content_segments(text):
        for i in range(len(toks) - n + 1):
            res.add(tuple(toks[i:i + n]))
    return res


def all_keys(node, acc=None):
    acc = set() if acc is None else acc
    if isinstance(node, dict):
        for k, v in node.items():
            acc.add(k)
            all_keys(v, acc)
    elif isinstance(node, list):
        for v in node:
            all_keys(v, acc)
    return acc


def g(d, *path, default=None):
    for p in path:
        if not isinstance(d, dict) or p not in d:
            return default
        d = d[p]
    return d


# ---------------------------------------------------------------- checks
class Report:
    def __init__(self):
        self.fails = 0

    def emit(self, name, check, details):
        ok = not details
        if not ok:
            self.fails += 1
        print("[%s] %s | %s" % ("PASS" if ok else "FAIL", name, check))
        for d in details:
            print("       - " + d)


def check_profile(name, p, raw, rep):
    cau_mau = g(p, "giong", "cau_mau", default=[]) or []
    riengs = g(p, "giong", "cau_cua_rieng", default=[]) or []

    rep.emit(name, "1a cau_mau text has no digits",
             ['%s: "%s"' % (c.get("quan_he"), c.get("text")) for c in cau_mau if re.search(r"\d", c.get("text", ""))])

    d = []
    for c in cau_mau:
        t = norm_phrase(c.get("text", ""))
        for ph in riengs:
            if norm_phrase(ph) in t:
                d.append('%s: "%s" contains cau_cua_rieng "%s"' % (c.get("quan_he"), c.get("text"), ph))
    rep.emit(name, "1b cau_mau does not contain any cau_cua_rieng phrase", d)

    chu_dao = g(p, "tinh_cach", "xu_ly_bat_dong", "chu_dao")
    d = ["%s: xu_ly_phu == chu_dao == %s" % (rel, chu_dao)
         for rel, v in (g(p, "vao_vai", "theo_quan_he", default={}) or {}).items()
         if v.get("xu_ly_phu") == chu_dao]
    rep.emit(name, "1c xu_ly_phu differs from chu_dao", d)

    d = []
    for f in CORE_SCALARS:
        v = g(p, "dong_luc", f)
        if v is None:
            d.append("dong_luc.%s missing" % f)
        elif len(words(v)) > 15:
            d.append('dong_luc.%s = %d words: "%s"' % (f, len(words(v)), v))
    for item in g(p, "tinh_cach", "ba_net", default=[]) or []:
        if len(words(item)) > 15:
            d.append('ba_net item %d words: "%s"' % (len(words(item)), item))
    rep.emit(name, "1d core fields <= 15 words", d)

    d = []
    have = {c.get("quan_he") for c in cau_mau}
    for rel in g(p, "vao_vai", "vai_hop_le", default=[]) or []:
        if rel not in have:
            d.append("vai_hop_le '%s' has no cau_mau with that quan_he (cau_mau quan_he present: %s)"
                     % (rel, sorted(have)))
    if "bat_ky" not in have:
        d.append("no cau_mau with quan_he bat_ky")
    rep.emit(name, "1e every vai_hop_le relation has a cau_mau; at least one bat_ky", d)

    # 2 bond gate
    core_texts = []
    for item in g(p, "nhay_cam", default=[]) or []:
        if isinstance(item, dict):
            if item.get("tu_muc"):
                continue
            item = item.get("text", "")
        core_texts.append(("nhay_cam", item))
    for ch in g(p, "tuyen_truyen", default=[]) or []:
        if isinstance(ch, dict) and ch.get("tom_tat"):
            core_texts.append(("tuyen_truyen[%s].tom_tat" % ch.get("chuong"), ch["tom_tat"]))
    for c in cau_mau:
        if not c.get("tu_muc"):
            core_texts.append(("cau_mau[%s]" % c.get("quan_he"), c.get("text", "")))
    for f in ("muon", "so", "diem_yeu", "khi_ap_luc", "niem_tin_nen"):
        v = g(p, "dong_luc", f)
        if v:
            core_texts.append((f, v))
    mo = g(p, "cau_chuyen", "mo_theo_muc_than", default={}) or {}
    d = []
    info = []
    for lvl in HIGH_LEVELS:
        if lvl not in mo:
            continue
        g3 = ngrams(mo[lvl], 3)
        g2 = ngrams(mo[lvl], 2)
        for fld, txt in core_texts:
            hit3 = g3 & ngrams(txt, 3)
            if hit3:
                d.append('%s "%s" shares trigram %s with mo_theo_muc_than.%s "%s"'
                         % (fld, txt, [" ".join(h) for h in sorted(hit3)], lvl, mo[lvl]))
            hit2 = g2 & ngrams(txt, 2)
            if hit2 and not hit3:
                info.append('%s shares bigram %s with %s' % (fld, [" ".join(h) for h in sorted(hit2)], lvl))
    rep.emit(name, "2 bond gate: no [loi] content word-trigram shared with than/gan_bo/tri_ky", d)
    for i in info:
        print("       (info, not a failure) " + i)

    # 3 expressions
    hay = g(p, "bieu_cam", "hay_dung", default=[]) or []
    d = []
    if len(hay) < 4:
        d.append("hay_dung has %d items: %s" % (len(hay), hay))
    if not ({"vui", "cuoi_lon"} & set(hay)):
        d.append("hay_dung has no vui/cuoi_lon: %s" % hay)
    if not ({"lo_lang", "buon", "kho_chiu"} & set(hay)):
        d.append("hay_dung has no lo_lang/buon/kho_chiu: %s" % hay)
    rep.emit(name, "3a hay_dung >= 4, one happy, one unhappy", d)

    used = []
    for k in ("hay_dung", "hiem_dung"):
        for e in g(p, "bieu_cam", k, default=[]) or []:
            used.append((k, e))
    for c in cau_mau:
        used.append(("cau_mau[%s]" % c.get("quan_he"), c.get("bieu_cam")))
    for grp, v in (g(p, "qua", "phan_ung", default={}) or {}).items():
        used.append(("qua.phan_ung.%s" % grp, v.get("bieu_cam")))
    for e in (g(p, "asset", "mat", default={}) or {}):
        used.append(("asset.mat", e))
    rep.emit(name, "3b every expression used is in the 8-set",
             ["%s uses '%s'" % (w, e) for w, e in used if e not in EXPRESSIONS])

    d = []
    ghet = g(p, "qua", "phan_ung", "ghet", "bieu_cam")
    thich = g(p, "qua", "phan_ung", "thich", "bieu_cam")
    if ghet == thich:
        d.append("ghet.bieu_cam == thich.bieu_cam == %s" % ghet)
    if ghet not in ("lo_lang", "buon", "kho_chiu"):
        d.append("ghet.bieu_cam = %s, not in {lo_lang, buon, kho_chiu}" % ghet)
    rep.emit(name, "3c phan_ung.ghet differs from thich and is unhappy", d)

    # 4 removed fields
    keys = all_keys(p)
    d = []
    for f in REMOVED_FIELDS:
        if f in keys:
            d.append("key '%s' present in parsed YAML" % f)
    stripped = "\n".join(strip_comment(l) for l in raw)
    for f in REMOVED_FIELDS:
        if f not in keys and re.search(r"\b%s\b" % f, stripped):
            d.append("'%s' appears in raw YAML text (outside comments)" % f)
    rep.emit(name, "4 removed fields absent (ly_do_co_mat, da_gap, sidequest_hooks)", d)

    # 5 tuyen_truyen
    tt = p.get("tuyen_truyen")
    d = []
    if not isinstance(tt, list) or not tt:
        d.append("tuyen_truyen missing or empty")
    else:
        if [str(x.get("chuong")) for x in tt] != ["1", "2", "3"]:
            d.append("chuong sequence = %s, expected [1, 2, 3]" % [x.get("chuong") for x in tt])
        want = ["than", "gan_bo", "tri_ky"]
        prev = ["gap", "than", "gan_bo"]
        for idx, x in enumerate(tt[:3]):
            if x.get("len_muc") != want[idx]:
                d.append("chuong %s len_muc = %s, expected %s" % (x.get("chuong"), x.get("len_muc"), want[idx]))
            exp_mo = prev[idx] if idx == 0 else tt[idx - 1].get("len_muc")
            if x.get("mo_o") != exp_mo:
                d.append("chuong %s mo_o = %s, expected %s (previous level)" % (x.get("chuong"), x.get("mo_o"), exp_mo))
        if len(tt) != 3:
            d.append("tuyen_truyen has %d chapters, expected 3" % len(tt))
    rep.emit(name, "5 tuyen_truyen chapters 1..3, than -> gan_bo -> tri_ky, mo_o = previous level", d)


def check_card(card, rep):
    if card is None:
        rep.emit("CARD", "6 section 6 example card found", ["card starting with '[quan_ly] Hà' not found"])
        return
    n = len(" ".join(card).split())
    rep.emit("CARD", "6a word count <= 250 (counted %d, whitespace tokens, lines before '── Trong màn này')" % n,
             ["%d words > 250" % n] if n > 250 else [])
    low = "\n".join(card).lower()
    d = []
    for f in FORBIDDEN_IN_CARD:
        for i, l in enumerate(card):
            if f.lower() in l.lower():
                d.append('contains "%s" in line %d: "%s"' % (f, i + 1, l))
    rep.emit("CARD", "6b contains none of %s" % FORBIDDEN_IN_CARD, d)


def main(argv):
    if len(argv) != 2:
        print("usage: python -I lint_profile.py <profile.md>")
        return 2
    profiles, card = load_document(argv[1])
    rep = Report()
    for label in ("IV", "0"):
        check_profile(label, profiles[label]["data"], profiles[label]["raw"], rep)
        print()
    check_card(card, rep)
    print()
    print("TOTAL FAILED CHECKS: %d" % rep.fails)
    return 1 if rep.fails else 0


if __name__ == "__main__":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass
    sys.exit(main(sys.argv))

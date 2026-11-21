"""Parse ERD_JobQuest_Chen.puml (PlantUML Chen notation) into plain Python structures.

The ERD is the source of truth and is never edited by these tools. This module only reads it.

Returned structure (see parse_erd):
  entities[NAME]      = {name, weak, attrs[], section, tag, tag_note}
  relationships[NAME] = {name, identifying, attrs[], section, tag, tag_note, ends[]}
  isa                 = [{parent, kind, overlap, children[]}]
  attrs are {name, key, multi, derived, group, children[]} where `group` marks a composite attribute `{...}`.
  ends are {entity, label, total, lo, hi}: one per link `X -label- REL` or `REL -label- X`.
  label is "1", "N", "M" or "(lo,hi)"; total is True for "=" lines.
"""
import re
from pathlib import Path

ERD = Path(__file__).resolve().parents[2] / "plantuml" / "erd" / "ERD_JobQuest_Chen.puml"

SECTION = re.compile(r"^'\s*═══\s*([A-L])\.\s*(.*?)\s*═══")
ENTITY = re.compile(r"^entity\s+([A-Z0-9_]+)\s*((?:<<\w+>>\s*)*)\{\s*(\})?\s*$")
REL = re.compile(r"^relationship\s+([A-Z0-9_]+)\s*((?:<<\w+>>\s*)*)\{\s*(\})?\s*$")
ATTR = re.compile(r"^([a-z0-9_]+)\s*((?:<<\w+>>\s*)*)(\{)?\s*$")
LINK = re.compile(r"^([A-Z0-9_]+)\s+([-=])(\(\d+,\d+\)|1|N|M)\2\s+([A-Z0-9_]+)\s*$")
ISA = re.compile(r"^([A-Z0-9_]+)\s+([-=])>\2\s+([od])\s*\{\s*(.*?)\s*\}\s*$")
STEREO = re.compile(r"<<(\w+)>>")


def parse_erd(path=ERD):
    lines = path.read_text(encoding="utf-8").splitlines()
    entities, relationships, isa, links = {}, {}, [], []
    section, pending_tag, pending_note = None, None, None
    i = 0
    in_links = False
    while i < len(lines):
        raw = lines[i].rstrip()
        s = raw.strip()
        i += 1
        if not s:
            continue
        if s.startswith("'"):
            m = SECTION.match(s)
            if m:
                section = m.group(1)
            if "LINKS." in s:
                in_links = True
            t = re.match(r"^'\s*\[(CAM|VANG)\]\s*(.*)$", s)
            if t:
                pending_tag, pending_note = t.group(1), t.group(2)
            elif not SECTION.match(s) and s[1:].strip() and s[1:].strip()[0] not in "╔║╚":
                # free comment directly above an entity or relationship (kept as a note)
                pending_note = (pending_note + " " if pending_note and not pending_tag else "") + s[1:].strip()
            continue
        if s in ("@startchen ERD_JobQuest_Chen", "@endchen") or s.startswith("title "):
            continue
        em = ENTITY.match(s)
        rm = REL.match(s) if not em else None
        if em or rm:
            m = em or rm
            stereos = STEREO.findall(m.group(2))
            attrs = []
            if not m.group(3):
                attrs, i = parse_attrs(lines, i)
            rec = {"name": m.group(1), "section": section, "attrs": attrs,
                   "tag": pending_tag, "note": pending_note}
            pending_tag = pending_note = None
            if em:
                rec["weak"] = "weak" in stereos
                entities[rec["name"]] = rec
            else:
                rec["identifying"] = "identifying" in stereos
                rec["ends"] = []
                relationships[rec["name"]] = rec
            continue
        pm = ISA.match(s)
        if pm:
            isa.append({"parent": pm.group(1), "total": pm.group(2) == "=", "overlap": pm.group(3) == "o",
                        "children": [c.strip() for c in pm.group(4).split(",")]})
            pending_tag = pending_note = None
            continue
        lm = LINK.match(s)
        if lm:
            a, line, label, b = lm.groups()
            links.append({"a": a, "total": line == "=", "label": label, "b": b, "section": section, "note": pending_note})
            pending_note = None
            continue
        raise ValueError(f"ERD line {i}: cannot parse {s!r}")

    # attach each link to its relationship (one of the two names is the relationship)
    for lk in links:
        if lk["b"] in relationships and lk["a"] in entities:
            ent, rel = lk["a"], lk["b"]
        elif lk["a"] in relationships and lk["b"] in entities:
            ent, rel = lk["b"], lk["a"]
        else:
            raise ValueError(f"link {lk} does not join an entity and a relationship")
        label = lk["label"]
        lo = hi = None
        if label.startswith("("):
            lo, hi = (int(x) for x in label[1:-1].split(","))
        relationships[rel]["ends"].append(
            {"entity": ent, "label": label, "total": lk["total"], "lo": lo, "hi": hi, "note": lk["note"]})
    return entities, relationships, isa


def parse_attrs(lines, i):
    """Read attribute lines until the closing brace of the entity or relationship."""
    attrs = []
    while True:
        s = lines[i].strip()
        i += 1
        if s == "}":
            return attrs, i
        m = ATTR.match(s)
        if not m:
            raise ValueError(f"ERD line {i}: bad attribute {s!r}")
        st = STEREO.findall(m.group(2))
        a = {"name": m.group(1), "key": "key" in st, "multi": "multi" in st, "derived": "derived" in st,
             "group": bool(m.group(3)), "children": []}
        if a["group"]:
            while True:
                c = lines[i].strip()
                i += 1
                if c == "}":
                    break
                cm = ATTR.match(c)
                cst = STEREO.findall(cm.group(2))
                a["children"].append({"name": cm.group(1), "key": "key" in cst, "multi": "multi" in cst,
                                      "derived": "derived" in cst})
        attrs.append(a)


if __name__ == "__main__":
    e, r, isa = parse_erd()
    nattr = sum(len(x["attrs"]) for x in e.values())
    print(len(e), "entities,", len(r), "relationships,", len(isa), "isa,", nattr, "entity attributes")
    print(sum(1 for x in r.values() if len(x["ends"]) != 2), "relationships whose ends != 2:",
          [(x["name"], len(x["ends"])) for x in r.values() if len(x["ends"]) != 2])

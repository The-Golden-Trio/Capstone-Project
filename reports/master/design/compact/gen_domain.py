"""Generate the UML domain class diagrams CD-01 ... CD-08 from the Chen ERD.

Source of truth: plantuml/erd/ERD_JobQuest_Chen.puml (read only, never edited) plus the overlay domain.yaml.
Output: plantuml/class/domain/CD-*.puml and a coverage report on stdout.

Mapping (Chen -> UML):
  entity                        -> class (weak entity: <<weak>>)
  isa                           -> generalization
  weak entity + identifying rel -> composition (owner end drawn as the whole)
  weak entity with 2+ owners    -> plain associations + {id = (...)} note
  relationship with attributes  -> association class on the association line
  ternary relationship          -> n-ary diamond (+ association class when it has attributes)
  aggregation list in yaml      -> aggregation
  everything else               -> association with the multiplicity read from the ERD labels

Checks (any failure exits 1): every ERD entity, attribute and relationship appears exactly once; every
multiplicity is derived from the ERD; [CAM] items are marked; yaml refers only to things that exist.
"""
import re
import sys
from collections import defaultdict
from pathlib import Path

import yaml

from erd_parse import parse_erd

ROOT = Path(__file__).resolve().parent
OUT = ROOT.parent.parent / "plantuml" / "class" / "domain"
cfg = yaml.safe_load((ROOT / "domain.yaml").read_text(encoding="utf-8"))
entities, rels, isa = parse_erd()
errors = []


def err(msg):
    errors.append(msg)


# ---------------------------------------------------------------- naming
def pascal(name):
    return "".join(w.capitalize() for w in name.lower().split("_"))


def camel(name):
    p = pascal(name)
    return p[0].lower() + p[1:]


def dotted_camel(name):
    return ".".join(camel(x) for x in name.split("."))


# ---------------------------------------------------------------- multiplicity
def fmt(lo, hi):
    if hi is None:
        return f"{lo}..*"
    return f"{lo}" if lo == hi else f"{lo}..{hi}"


def label_hi(end):
    """Upper bound of an ERD label: explicit (lo,hi), '1', or many (None)."""
    if end["lo"] is not None:
        return end["hi"]
    return 1 if end["label"] == "1" else None


def end_mults(rel):
    """Multiplicities (m_a at a's end, m_b at b's end) of a binary relationship."""
    a, b = rel["ends"]
    partners = rel["name"] in cfg["partners_reading"]

    def one(own, other, label_end):
        # own = the end whose multiplicity we compute; label_end = the end whose label gives the upper bound
        if label_end["lo"] is not None:
            return label_end["lo"], label_end["hi"]
        lo = 1 if other["total"] else 0
        return lo, label_hi(label_end)

    if partners:
        return one(a, b, b), one(b, a, a)
    return one(a, b, a), one(b, a, b)


def leg_mult(end):
    if end["lo"] is not None:
        return fmt(end["lo"], end["hi"])
    return fmt(1 if end["total"] else 0, label_hi(end))


# ---------------------------------------------------------------- types
type_patterns = [(re.compile(p["re"]), p["type"]) for p in cfg["type_patterns"]]
enum_of = {}  # "ENTITY.attr" -> enum name
for ename, e in cfg["enums"].items():
    for u in e.get("use") or []:
        enum_of[u] = ename
scales = cfg["scales"]
defaulted = []  # attributes that fell back to String, for the report


def attr_type(owner, path, a_derived=False):
    key = f"{owner}.{path}"
    leaf = path.split(".")[-1]
    if key in enum_of:
        return enum_of[key], None
    if key in scales:
        return "Int", scales[key]
    if key in cfg["types_by_entity"]:
        return cfg["types_by_entity"][key], None
    if leaf in cfg["types_by_name"]:
        return cfg["types_by_name"][leaf], None
    for rx, t in type_patterns:
        if rx.search(leaf):
            return t, None
    if leaf in cfg["enum_candidates"]:
        return "String", "enum?"
    defaulted.append(key)
    return "String", None


def render_attr(owner, a, weak):
    """Return list of member lines (without the leading indent) for one ERD attribute."""
    lines = []
    items = [(a["name"], a)] if not a["group"] else [(f"{a['name']}.{c['name']}", c) for c in a["children"]]
    for path, x in items:
        t, extra = attr_type(owner, path)
        name = dotted_camel(path)
        mult = " [0..*]" if (a["multi"] or x.get("multi")) else ""
        derived = a["derived"] or x.get("derived")
        key = ""
        if a["key"]:
            key = " {partial id}" if weak else " {id}"
        suffix = ""
        if extra == "enum?":
            suffix = "  «enum?»"
        elif extra:
            suffix = f"  «{extra}»"
        lead = "/" if derived else "-"
        lines.append(f"{lead} {name} : {t}{mult}{key}{suffix}")
    return lines


# ---------------------------------------------------------------- diagram placement
section_diagram = {}
for did, d in cfg["diagrams"].items():
    for s in d["sections"]:
        section_diagram[s] = did
for e in entities.values():
    if e["section"] not in section_diagram:
        err(f"entity {e['name']} is in section {e['section']} with no diagram")
for r in rels.values():
    if r["section"] not in section_diagram:
        err(f"relationship {r['name']} is in section {r['section']} with no diagram")

weak = {n for n, e in entities.items() if e["weak"]}
identifying = {n for n, r in rels.items() if r["identifying"]}
owners = defaultdict(list)  # weak entity -> identifying relationships it belongs to
for rn in identifying:
    for end in rels[rn]["ends"]:
        if end["entity"] in weak:
            owners[end["entity"]].append(rn)
multi_owner = {w for w, rl in owners.items() if len(rl) >= 2}
# a weak entity that is the identifying side of its relationship: the other end is the owner
for rn in identifying:
    ends = rels[rn]["ends"]
    ws = [e for e in ends if e["entity"] in weak]
    if not ws:
        err(f"identifying relationship {rn} has no weak entity")

assoc_class = {rn for rn, r in rels.items() if r["attrs"]}
nary = {rn for rn, r in rels.items() if len(r["ends"]) == 3}
xor_of = {}
for g, spec in cfg["xor_groups"].items():
    for rn in spec["rels"]:
        if rn not in rels:
            err(f"xor group {g}: unknown relationship {rn}")
        xor_of[rn] = g
for rn in list(cfg["aggregation"]) + list(cfg["roles"]) + list(cfg["constraints"]) + list(cfg["partners_reading"]):
    if rn not in rels:
        err(f"domain.yaml refers to unknown relationship {rn}")
for ent in cfg["methods"]:
    if ent not in entities and ent not in rels:
        err(f"domain.yaml methods: unknown {ent}")
for k in list(cfg["types_by_entity"]) + list(enum_of) + list(scales):
    owner = k.split(".")[0]
    if owner not in entities and owner not in rels:
        err(f"domain.yaml refers to unknown owner in {k}")


def cname(n):
    return pascal(n)


def tag_of(item):
    return item["tag"]  # CAM, VANG or None


# ---------------------------------------------------------------- diagram building
class Diagram:
    def __init__(self, did):
        self.id = did
        self.home_entities = []
        self.rel_names = []
        self.stubs = set()
        self.lines = []
        self.notes = []


diagrams = {did: Diagram(did) for did in cfg["diagrams"]}
for n, e in entities.items():
    diagrams[section_diagram[e["section"]]].home_entities.append(n)
for n, r in rels.items():
    diagrams[section_diagram[r["section"]]].rel_names.append(n)


def class_def(name, home):
    """PlantUML class block for an entity or an association class."""
    if name in entities:
        e = entities[name]
        stereo = "weak" if e["weak"] else "entity"
        if e["tag"] == "CAM":
            stereo = "pending"
        head = f"class {cname(name)} <<{stereo}>> {{"
        body = []
        for a in e["attrs"]:
            body += render_attr(name, a, e["weak"])
    else:
        r = rels[name]
        stereo = "pending" if r["tag"] == "CAM" else ("vang" if r["tag"] == "VANG" else "assoc")
        head = f"class {cname(name)} <<{stereo}>> {{"
        body = []
        for a in r["attrs"]:
            body += render_attr(name, a, False)
    ms = cfg["methods"].get(name) or []
    out = [head] + [f"  {b}" for b in body]
    if ms:
        out.append("  --")
        out += [f"  {m}" for m in ms]
    out.append("}")
    return out


def mark(item):
    tag = item["tag"]
    return {"CAM": "#E8710A", "VANG": "#B8860B"}.get(tag)


def edge_style(sym, rel):
    """Insert a line colour for pending relationships, e.g. -[#E8710A]-."""
    col = mark(rel)
    if not col:
        return sym
    return sym.replace("--", f"-[{col}]-")


def association_lines(rn, d):
    """Lines drawing one binary or n-ary relationship in diagram d. Returns list of lines."""
    r = rels[rn]
    lines = []
    label = rn
    if rn in xor_of:
        label += " {xor}"
    if r["tag"] == "CAM":
        label += " «pending»"
    if len(r["ends"]) == 3:
        dn = f"D_{pascal(rn)}"
        lines.append(f"diamond {dn}")
        for end in r["ends"]:
            d.stubs.add(end["entity"])
            lines.append(f'{cname(end["entity"])} "{leg_mult(end)}" -- {dn}')
        if rn in assoc_class:
            lines.append(f"{dn} .. {cname(rn)}")
        lines.append(f"note bottom of {dn} : {rn}")
        return lines
    a, b = r["ends"]
    d.stubs.add(a["entity"])
    d.stubs.add(b["entity"])
    ma, mb = end_mults(r)
    A, B = cname(a["entity"]), cname(b["entity"])
    if rn in cfg["roles"]:
        ra, rb = cfg["roles"][rn]
        label += f"\\n({ra} → {rb})" if a["entity"] == b["entity"] else f"\\n({ra} / {rb})"
    fa, fb = f'"{fmt(*ma)}"', f'"{fmt(*mb)}"'
    if rn in identifying and not (set(x["entity"] for x in r["ends"]) & multi_owner):
        # weak end is the part, the other end is the whole
        part = a if a["entity"] in weak else b
        whole = b if part is a else a
        W, P = cname(whole["entity"]), cname(part["entity"])
        sym = edge_style("*--", r)
        lines.append(f"{W} {fmt_q(end_mults(r), a, b, whole)} {sym} {fmt_q(end_mults(r), a, b, part)} {P} : {label}")
    elif rn in cfg["aggregation"]:
        whole_name = cfg["aggregation"][rn]
        if a["entity"] == whole_name:
            sym = edge_style("o--", r)
            lines.append(f"{A} {fa} {sym} {fb} {B} : {label}")
        else:
            sym = edge_style("o--", r)
            lines.append(f"{B} {fb} {sym} {fa} {A} : {label}")
    else:
        sym = edge_style("--", r)
        lines.append(f"{A} {fa} {sym} {fb} {B} : {label}")
    if rn in assoc_class:
        lines.append(f"({A}, {B}) .. {cname(rn)}")
    return lines


def fmt_q(mults, a, b, end):
    ma, mb = mults
    return f'"{fmt(*(ma if end is a else mb))}"'


def build():
    # classes appear in their home diagram; stubs elsewhere
    for did, d in diagrams.items():
        body = []
        for rn in d.rel_names:
            body += association_lines(rn, d)
        d.lines = body
    # generalization
    for g in isa:
        did = section_diagram[entities[g["parent"]]["section"]]
        d = diagrams[did]
        d.stubs.add(g["parent"])
        for ch in g["children"]:
            d.stubs.add(ch)
            flag = "{overlapping, incomplete}" if g["overlap"] and not g["total"] else "{disjoint}"
            d.lines.append(f"{cname(g['parent'])} <|-- {cname(ch)}" + (f" : {flag}" if ch == g['children'][0] else ""))


build()


def note_lines(d):
    out = []
    # xor notes, attached to the class that carries all the alternatives
    for g, spec in cfg["xor_groups"].items():
        rl = [rels[x] for x in spec["rels"]]
        if not all(r in d.rel_names for r in spec["rels"]):
            continue
        sets = [set(e["entity"] for e in r["ends"]) for r in rl]
        common = set.intersection(*sets)
        if len(common) != 1:
            err(f"xor group {g}: no single common entity ({common})")
            continue
        out.append(f'note right of {cname(next(iter(common)))} : {{xor}} {spec["text"]}\\n({", ".join(spec["rels"])})')
    for rn, text in cfg["constraints"].items():
        if rn in d.rel_names:
            r = rels[rn]
            target = cname(rn) if rn in assoc_class else (f"D_{pascal(rn)}" if rn in nary else cname(r["ends"][0]["entity"]))
            out.append(f"note bottom of {target} : {text}")
    # identity note for weak entities with several owners
    for w in multi_owner:
        if w in d.home_entities:
            ows = []
            for rn in owners[w]:
                for e in rels[rn]["ends"]:
                    if e["entity"] != w:
                        ows.append(camel(e["entity"]))
            out.append(f"note bottom of {cname(w)} : {{id = ({', '.join(ows)})}}  identified by several owners")
    # pending / vang entity notes
    for n in d.home_entities:
        e = entities[n]
        if e["tag"] and e["note"]:
            out.append(f"note bottom of {cname(n)} : «pending A28» {e['note']}")
    for rn in d.rel_names:
        r = rels[rn]
        if r["tag"] and rn in assoc_class and r["note"]:
            out.append(f"note bottom of {cname(rn)} : «{'pending A28' if r['tag'] == 'CAM' else 'research only'}» {r['note']}")
    return out


HEADER = """hide empty members
skinparam classAttributeIconSize 0
skinparam linetype polyline
skinparam nodesep 35
skinparam ranksep 55
skinparam class {
  BackgroundColor<<entity>> #FFFFFF
  BackgroundColor<<weak>> #F3F6FA
  BackgroundColor<<assoc>> #EAF3EA
  BackgroundColor<<pending>> #FFE3C2
  BorderColor<<pending>> #E8710A
  BackgroundColor<<vang>> #FFF3C4
  BackgroundColor<<stub>> #F2F2F2
  BorderColor<<stub>> #AAAAAA
  FontColor<<stub>> #777777
}"""

LEGEND = """legend bottom
  | Notation | Meaning |
  | white / light blue class | entity / weak entity (composition ◆ from its owner) |
  | green class | association class (an ERD relationship that carries attributes) |
  | orange | «pending A28»: research still open, drawn as in the ERD |
  | grey class | defined in another diagram (CD-0x) |
  | /attr | derived attribute; attr : T [0..*] is multi-valued; a.b is a composite attribute |
  | String «enum?» | enum-like column with no values in the ERD or research yet |
  | method «D-xx» | a domain rule with its source; data = Prisma model, pure rules = game-core |
  | types | inferred from names (the ERD has none): proposals, not decisions |
endlegend"""


def write_diagram(did):
    d = diagrams[did]
    spec = cfg["diagrams"][did]
    out = [f"@startuml {spec['file']}",
                      HEADER, ""]
    # enum classes used by this diagram's entities
    used_enums = []
    for ename, e in cfg["enums"].items():
        if not e.get("values"):
            continue
        for u in e.get("use") or []:
            owner = u.split(".")[0]
            home = (entities[owner]["section"] if owner in entities else rels[owner]["section"]) if (owner in entities or owner in rels) else None
            if home in spec["sections"] and ename not in used_enums:
                used_enums.append(ename)
    for n in d.home_entities:
        out += class_def(n, True)
    for rn in d.rel_names:
        if rn in assoc_class:
            out += class_def(rn, True)
    for ename in used_enums:
        e = cfg["enums"][ename]
        out.append(f"enum {ename} {{")
        out += [f"  {v}" for v in e["values"]]
        out.append("}")
        out.append(f"note right of {ename} : {e['source']}")
    for s in sorted(d.stubs - set(d.home_entities)):
        home = section_diagram[entities[s]["section"]]
        out.append(f"class {cname(s)} <<stub>> {{\n  {home}\n}}")
    out.append("")
    out += d.lines
    out += note_lines(d)
    out.append(LEGEND)
    out.append("@enduml")
    return "\n".join(out) + "\n"


# ---------------------------------------------------------------- checks
def check_coverage():
    seen_entities = set()
    for d in diagrams.values():
        for n in d.home_entities:
            if n in seen_entities:
                err(f"entity {n} placed twice")
            seen_entities.add(n)
    if seen_entities != set(entities):
        err(f"entities not placed: {set(entities) - seen_entities}")
    seen_rels = [rn for d in diagrams.values() for rn in d.rel_names]
    if sorted(seen_rels) != sorted(rels):
        err("relationship coverage mismatch")
    # an association class needs both its ends to exist; a ternary relationship has exactly 3 ends
    for rn, r in rels.items():
        if len(r["ends"]) not in (2, 3):
            err(f"{rn}: {len(r['ends'])} ends")
        for e in r["ends"]:
            if e["entity"] not in entities:
                err(f"{rn}: unknown entity {e['entity']}")
    # all [CAM] items marked
    for n, e in entities.items():
        if e["tag"] == "CAM":
            if class_def(n, True)[0].find("<<pending>>") < 0:
                err(f"{n} [CAM] not marked")
    # enum values used for an attribute must be attributes that exist
    for key in list(enum_of) + list(scales):
        owner, path = key.split(".", 1)
        src = entities.get(owner) or rels.get(owner)
        if not src:
            continue
        names = set()
        for a in src["attrs"]:
            if a["group"]:
                names |= {f"{a['name']}.{c['name']}" for c in a["children"]}
            else:
                names.add(a["name"])
        if path not in names:
            err(f"domain.yaml enum/scale refers to missing attribute {key}")


check_coverage()

if errors:
    print("ERRORS:")
    for e in errors:
        print(" -", e)
    sys.exit(1)

OUT.mkdir(parents=True, exist_ok=True)
for did, d in diagrams.items():
    path = OUT / (cfg["diagrams"][did]["file"] + ".puml")
    path.write_text(write_diagram(did), encoding="utf-8")
    print(f"{did}: {len(d.home_entities)} classes, "
          f"{sum(1 for r in d.rel_names if r in assoc_class)} association classes, {len(d.rel_names)} relationships, "
          f"{len(d.stubs - set(d.home_entities))} stubs -> {path.name}")
if "--types" in sys.argv:
    print("\nattributes defaulted to String:", len(defaulted))
    print("; ".join(sorted(defaulted)))

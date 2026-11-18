"""Generate NestJS module class diagrams (CL-00 … CL-07) from nest-modules.yaml into ../../plantuml/class/compact/.

Routes are declared on each controller in the YAML (signature, HTTP method and path, roles).
Checks before drawing:
  * every route has a unique "METHOD /path" and known roles; every controller has routes
  * every constructor dependency is provided by the module itself, an imported module's exports,
    a global module, or a known framework/library type
  * no module imports a module whose exports it does not use (staff modules may import AuthModule for its guard)
  * module imports have no cycles; every declared input DTO is used by a route
"""
import re
import sys
from collections import defaultdict
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent
OUT = ROOT.parent.parent / "plantuml" / "class" / "compact"
OUT.mkdir(exist_ok=True)
nest = yaml.safe_load((ROOT / "nest-modules.yaml").read_text())

EXTERNAL = {"S3Client", "Redis", "JwtService", "Reflector", "OAuth2Client", "HttpService", "Transporter", "Queue",
            "Histogram", "Counter", "Gauge", "ConfigService"}
ROLES = {"Pub", "EX", "DE", "CA", "SA"}
NOT_DTO = {"AuthUser", "Observable", "MessageEvent", "Page", "Promise"}
GLOBAL_TYPES = set(nest["global_types"])
DTOS = nest.get("dtos", {})
VIEWS = nest.get("views", {})
errors = []

provider_module, controller_module = {}, {}
for mname, mod in nest["modules"].items():
    for c in (mod.get("controllers") or {}):
        controller_module[c] = mname
    for p in (mod.get("providers") or {}):
        provider_module[p] = mname


def base_type(t):
    t = re.sub(r"«.*?»", "", t).strip().replace("[]", "")
    return re.split(r"[<\s]", t)[0]


def types_in(sig):
    return {w for w in re.findall(r"\b[A-Z][A-Za-z0-9]+\b", sig) if w not in NOT_DTO}


# ───────────── route checks ─────────────
seen_http, used_dtos = {}, set()
for mname, mod in nest["modules"].items():
    for cname, c in (mod.get("controllers") or {}).items():
        routes = (c or {}).get("routes") or []
        if not routes:
            errors.append(f"controller {cname} has no routes")
        for r in routes:
            if r["http"] in seen_http:
                errors.append(f"{r['http']} declared by {seen_http[r['http']]} and {cname}")
            seen_http[r["http"]] = cname
            bad = set(r["roles"]) - ROLES
            if bad:
                errors.append(f"{cname}.{r['m']}: unknown roles {bad}")
            used_dtos |= types_in(r["m"])
for d in DTOS:
    if d not in used_dtos:
        errors.append(f"dto {d} is declared but no route uses it")
for t in sorted(used_dtos):
    if t not in DTOS and t not in VIEWS:
        errors.append(f"type {t} is used by a route but declared in neither dtos nor views")


# ───────────── DI check ─────────────
def visible_providers(mname):
    mod = nest["modules"][mname]
    vis = set((mod.get("providers") or {}).keys())
    for imp in mod.get("imports", []) or []:
        if imp in nest["modules"]:
            vis |= set(nest["modules"][imp].get("exports", []) or [])
    for gm in nest["modules"].values():
        if gm.get("global"):
            vis |= set(gm.get("exports", []) or [])
    return vis


for mname, mod in nest["modules"].items():
    vis = visible_providers(mname)
    for group in ("controllers", "providers"):
        for cname, c in (mod.get(group) or {}).items():
            for dep in (c or {}).get("deps", []):
                t = base_type(dep.split(":", 1)[1])
                if t not in vis and t not in EXTERNAL and t != "ModelProvider":
                    errors.append(f"{mname}.{cname}: dependency {t} is not visible (add an import/export)")
    for exp in mod.get("exports") or []:
        if exp not in (mod.get("providers") or {}) and not exp.endswith("Module"):
            errors.append(f"{mname}: exports {exp}, which it does not provide")

for mname, mod in nest["modules"].items():
    used = set()
    for group in ("controllers", "providers"):
        for c in (mod.get(group) or {}).values():
            for dep in (c or {}).get("deps", []):
                used.add(base_type(dep.split(":", 1)[1]))
    staff = any(r["http"].split(" ", 1)[1].startswith("/staff")
                for c in (mod.get("controllers") or {}).values() for r in (c or {}).get("routes", []))
    for imp in mod.get("imports") or []:
        if imp not in nest["modules"]:
            continue
        if imp == "AuthModule" and staff:
            continue
        if not (set(nest["modules"][imp].get("exports") or []) & used):
            errors.append(f"{mname}: imports {imp} but uses none of its exports")

graph = {m: [i for i in (d.get("imports") or []) if i in nest["modules"]] for m, d in nest["modules"].items()}
state = {}


def dfs(n, stack):
    state[n] = 1
    for x in graph[n]:
        if state.get(x) == 1:
            errors.append("import cycle: " + " → ".join(stack + [n, x]))
        elif not state.get(x):
            dfs(x, stack + [n])
    state[n] = 2


for m in graph:
    if not state.get(m):
        dfs(m, [])

listed = [m for d in nest["diagrams"].values() for m in d["modules"]]
for m in nest["modules"]:
    if listed.count(m) != 1:
        errors.append(f"module {m} appears {listed.count(m)} times in the diagrams")

if errors:
    print("\n".join(errors))
    sys.exit(1)

# ───────────── drawing ─────────────
STEREO = {"processor": "processor", "cron": "cron", "guard": "guard", "interceptor": "interceptor", "adapter": "adapter",
          "library": "library", "command": "command"}


def esc(s):
    return s.replace('"', "'")


def member_lines(c):
    lines = []
    if c.get("note"):
        lines.append(f"  <i>{esc(c['note'])}</i>")
    deps = c.get("deps", [])
    for d in deps:
        n, t = d.split(":", 1)
        lines.append(f"  -{n.strip()} : {t.strip()}")
    meth = c.get("methods", [])
    if (c.get("note") or deps) and meth:
        lines.append("  --")
    lines += [f"  {m}" for m in meth]
    return lines


def draw_module(mname, out, cross):
    mod = nest["modules"][mname]
    out.append(f'package "{mname}" <<Rectangle>> {{')
    meta = ["  imports: " + (", ".join(mod.get("imports") or []) or "—"),
            "  controllers: " + (", ".join((mod.get("controllers") or {}).keys()) or "—"),
            "  providers: " + (", ".join(k for k, v in (mod.get("providers") or {}).items()
                                       if (v or {}).get("kind") not in ("interface", "decorator", "constants", "library")) or "—"),
            "  exports: " + (", ".join(mod.get("exports") or []) or "—")]
    if mod.get("global"):
        meta.append("  <i>@Global()</i>")
    if mod.get("note"):
        meta.append(f"  <i>{esc(mod['note'])}</i>")
    out.append(f"  class {mname} <<module>> {{")
    out += ["  " + x for x in meta]
    out.append("  }")
    dtos = set()
    for cname, c in (mod.get("controllers") or {}).items():
        c = c or {}
        out.append(f"  class {cname} <<controller>> {{")
        for d in c.get("deps", []):
            n, t = d.split(":", 1)
            out.append(f"    -{n.strip()} : {t.strip()}")
        out.append("    --")
        for r in c["routes"]:
            out.append(f"    +{r['m']}  «{r['http']}» [{','.join(r['roles'])}]")
            dtos |= types_in(r["m"])
        out.append("  }")
    for pname, p in (mod.get("providers") or {}).items():
        p = p or {}
        kind = p.get("kind", "service")
        if kind == "interface":
            out.append(f"  interface {pname} {{")
            out += ["  " + l for l in member_lines(p)]
            out.append("  }")
        elif kind == "constants":
            out.append(f"  enum {pname} {{")
            out += [f"    {f}" for f in p["fields"]]
            out.append("  }")
        elif kind == "decorator":
            out.append(f"  class {pname} <<decorator>> {{")
            out += [f"    {f}" for f in p["fields"]]
            out.append("  }")
        else:
            st = STEREO.get(kind)
            if kind == "processor":
                st = f"processor · {p['queue']}"
            out.append(f"  class {pname}" + (f" <<{st}>>" if st else "") + " {")
            out += ["  " + l for l in member_lines(p)]
            out.append("  }")
    if dtos:
        out.append(f'  class "{mname} DTOs" as {mname}_DTOs <<dto>> {{')
        for d in sorted(dtos, key=lambda x: (x not in DTOS, x)):
            out.append(f"    {d} {{ {DTOS[d]} }}" if d in DTOS else f"    {d}")
        out.append("  }")
    out.append("}")

    rel = []
    for cname, c in (mod.get("controllers") or {}).items():
        for d in (c or {}).get("deps", []):
            t = base_type(d.split(":", 1)[1])
            if t not in GLOBAL_TYPES and t not in EXTERNAL:
                rel.append((cname, t))
    for pname, p in (mod.get("providers") or {}).items():
        p = p or {}
        if p.get("implements"):
            rel.append((pname, p["implements"], "impl"))
        for d in p.get("deps", []):
            t = base_type(d.split(":", 1)[1])
            if t not in GLOBAL_TYPES and t not in EXTERNAL:
                rel.append((pname, t))
    for r in rel:
        if r[1] not in (mod.get("providers") or {}) and r[1] not in (mod.get("controllers") or {}):
            cross.add(r[1])
    return rel


def diagram_file(did, title):
    return OUT / f"{did}_{''.join(w.capitalize() for w in re.split(r'[ ,-]+', title) if w)}.puml"


written = []
for did, d in nest["diagrams"].items():
    name = diagram_file(did, d["title"])
    out = [f"@startuml {name.stem}", f"title {did} · NestJS modules — {d['title']}", "hide empty members",
           "skinparam classAttributeIconSize 0", "left to right direction", ""]
    cross, rels = set(), []
    for m in d["modules"]:
        rels += draw_module(m, out, cross)
        out.append("")
    in_diagram = set()
    for m in d["modules"]:
        in_diagram |= set((nest["modules"][m].get("providers") or {}).keys())
    for t in sorted(cross - in_diagram):
        owner = provider_module[t]
        owner_did = next(k for k, v in nest["diagrams"].items() if owner in v["modules"])
        out.append(f"class {t} <<{owner_did} · {owner}>>")
    out.append("")
    for r in rels:
        out.append(f"{r[0]} ..|> {r[1]}" if len(r) == 3 else f"{r[0]} --> {r[1]}")
    out.append("@enduml")
    name.write_text("\n".join(out) + "\n")
    written.append(name.name)

# ───────────── CL-00 module map ─────────────
o = ["@startuml CL-00_ModuleMap",
     "title CL-00 · NestJS module map (API app and worker app)\\n<size:11>Arrows are module imports. Global modules are available everywhere. Modules with /staff routes also import AuthModule for OccupationAccessGuard (arrows omitted).</size>",
     "skinparam componentStyle rectangle", ""]
by_comp = defaultdict(list)
for m, mod in nest["modules"].items():
    by_comp[mod["component"]].append(m)
for comp, label in nest["components"].items():
    o.append(f'package "{label}" {{')
    for m in by_comp[comp]:
        mod = nest["modules"][m]
        did = next(k for k, v in nest["diagrams"].items() if m in v["modules"])
        tags = []
        if mod.get("global"):
            tags.append("global")
        kinds = {(p or {}).get("kind") for p in (mod.get("providers") or {}).values()}
        if "processor" in kinds:
            tags.append("worker")
        if mod.get("controllers"):
            tags.append("api")
        if not tags or tags == ["global"]:
            tags.append("shared")
        o.append(f'  [{m}\\n<size:10>{did} · {" · ".join(tags)}</size>] as {m}')
    o.append("}")
for m, mod in nest["modules"].items():
    for imp in mod.get("imports") or []:
        if imp in nest["modules"] and imp != "AuthModule":
            o.append(f"{m} ..> {imp}")
o.append("@enduml")
(OUT / "CL-00_ModuleMap.puml").write_text("\n".join(o) + "\n")
written.insert(0, "CL-00_ModuleMap.puml")

n_routes = sum(len((c or {}).get("routes", [])) for mod in nest["modules"].values() for c in (mod.get("controllers") or {}).values())
print("OK:", n_routes, "routes;", len(nest["modules"]), "modules;", ", ".join(written))

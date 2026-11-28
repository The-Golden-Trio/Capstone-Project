"""Generate the OpenAPI 3.1 contract (../../api/compact/openapi.yaml) and a Swagger UI page
(../../api/compact/swagger.html) from nest-modules.yaml.

The same YAML drives the class diagrams (gen_class.py), so every operation here has exactly one
controller method of the same name. Run gen_class.py first: it checks the module design.
"""
import json
import re
import sys
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent
OUT = ROOT.parent.parent / "api" / "compact" / "openapi.yaml"
nest = yaml.safe_load((ROOT / "nest-modules.yaml").read_text())
DTOS, VIEWS = nest.get("dtos", {}), nest.get("views", {})
NAMED = {**DTOS, **VIEWS}
ROLE_LONG = {"EX": "EXPLORER", "DE": "DOMAIN_EXPERT", "CA": "CONTENT_ADMIN", "SA": "SYSTEM_ADMIN", "Pub": "PUBLIC"}
INT_NAMES = {"coins", "health", "score", "points", "qty", "version", "attempt", "levelNo", "tier", "affinity",
             "minutes", "seq", "expiresIn", "responses", "plays", "flags", "tokens", "rowVersion", "limit",
             "samples", "pricePaid", "price", "owned", "need", "have", "mastery", "budget", "used", "cost"}
# Path keys that are codes, not uuids (npc.id is the card code, e.g. IV_hoang_de)
TEXT_KEYS = {"npcId"}
errors = []

# Routes of the approved contract (api/openapi.yaml, 11/11). Any route not found there is marked proposed.
APPROVED = yaml.safe_load((ROOT.parent.parent / "api" / "openapi.yaml").read_text())
_norm = lambda path: re.sub(r"\{[^}]+\}", "{}", path)
APPROVED_OPS = {(m.upper(), _norm(pth)) for pth, ops in APPROVED["paths"].items() for m in ops
                if m in ("get", "post", "put", "patch", "delete")}


# ───────────── field-spec parser ─────────────
def split_top(text):
    parts, depth, cur = [], 0, ""
    for ch in text:
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
        if ch == "," and depth == 0:
            parts.append(cur.strip())
            cur = ""
        else:
            cur += ch
    if cur.strip():
        parts.append(cur.strip())
    return parts


FIELD_RE = re.compile(r"^(\w+)(\?)?(\[[^\]]*\])?(?:\s*:\s*([^{]+))?\s*(?:\{(.*)\})?\s*(.*)$")


def infer(name):
    if name == "id" or name.endswith("Id"):
        return {"type": "string", "format": "uuid"}
    if name.endswith("At"):
        return {"type": "string", "format": "date-time"}
    if name.endswith("Date"):
        return {"type": "string", "format": "date"}
    if re.match(r"^(is|has)[A-Z]", name):
        return {"type": "boolean"}
    if name in INT_NAMES:
        return {"type": "integer"}
    return {"type": "string"}


def type_schema(t, ctx):
    t = t.strip()
    if not t:
        return None
    if t in NAMED:
        return {"$ref": f"#/components/schemas/{t}"}
    if t.endswith("[]") and t[:-2] in NAMED:
        return {"type": "array", "items": {"$ref": f"#/components/schemas/{t[:-2]}"}}
    simple = {"uuid": {"type": "string", "format": "uuid"}, "integer": {"type": "integer"},
              "number": {"type": "number"}, "boolean": {"type": "boolean"}, "object": {"type": "object"},
              "date": {"type": "string", "format": "date"}, "date-time": {"type": "string", "format": "date-time"},
              "string": {"type": "string"}}
    if t in simple:
        return dict(simple[t])
    if "|" in t:
        return {"type": "string", "enum": [v.strip() for v in t.split("|")]}
    if t[0].isupper():
        errors.append(f"{ctx}: unknown type {t}")
    return {"type": "string", "description": t}


def object_schema(spec, ctx):
    props, required = {}, []
    for part in split_top(spec):
        m = FIELD_RE.match(part)
        if not m:
            errors.append(f"{ctx}: cannot parse field '{part}'")
            continue
        name, opt, arr, typ, inner, rest = m.groups()
        if inner is not None:
            item = object_schema(inner, f"{ctx}.{name}")
        else:
            item = type_schema(typ or "", f"{ctx}.{name}") if typ else None
            if item is None:
                item = infer(name[:-1] if arr and name.endswith("s") and name[:-1].endswith("Id") else name)
        if arr is not None:
            sch = {"type": "array", "items": item}
            bound = arr[1:-1]
            if bound.isdigit():
                sch["minItems"] = sch["maxItems"] = int(bound)
            elif bound.startswith("≤") and bound[1:].isdigit():
                sch["maxItems"] = int(bound[1:])
        else:
            sch = item
        rest = rest.strip().lstrip("—").strip()
        if rest:
            sch = {**sch, "description": rest} if "$ref" not in sch else {"allOf": [sch], "description": rest}
        props[name] = sch
        if not opt:
            required.append(name)
    out = {"type": "object", "properties": props}
    if required:
        out["required"] = required
    return out


# ───────────── operations ─────────────
SIG_RE = re.compile(r"^(\w+)\((.*)\)\s*:\s*(.+)$")


def ret_schema(ret):
    ret = ret.strip()
    m = re.match(r"^Page<(\w+)>$", ret)
    if m:
        return {"allOf": [{"$ref": "#/components/schemas/Page"},
                          {"type": "object", "properties": {"items": {"type": "array", "items": {"$ref": f"#/components/schemas/{m.group(1)}"}}}}]}
    return type_schema(ret, "return")


paths, tags = {}, []
for mname, mod in nest["modules"].items():
    for cname, c in (mod.get("controllers") or {}).items():
        tag = cname.replace("Controller", "")
        tags.append({"name": tag, "description": f"{mname} · {cname}"})
        for r in c["routes"]:
            sig = SIG_RE.match(r["m"])
            op_id, params, ret = sig.group(1), sig.group(2), sig.group(3)
            method, path = r["http"].split(" ", 1)
            op = {"tags": [tag], "operationId": op_id, "summary": re.sub(r"(?<!^)([A-Z])", r" \1", op_id).capitalize(),
                  "x-roles": [ROLE_LONG[x] for x in r["roles"]]}
            if (method.upper(), _norm(path)) not in APPROVED_OPS:
                op["x-status"] = "proposed"
                op["summary"] += " (proposed)"
            else:
                op["x-status"] = "approved"
            if r["roles"] == ["Pub"]:
                op["security"] = []
            parameters = [{"name": p, "in": "path", "required": True,
                           "schema": {"type": "string"} if p in TEXT_KEYS else {"type": "string", "format": "uuid"}}
                          for p in re.findall(r"\{(\w+)\}", path)]
            body = None
            for p in [x.strip() for x in split_top(params)]:
                if p.startswith("query:"):
                    q = p.split(":", 1)[1].strip()
                    for name, sch in object_schema(NAMED[q], q)["properties"].items():
                        parameters.append({"name": name, "in": "query",
                                           "required": name in object_schema(NAMED[q], q).get("required", []), "schema": sch})
                elif p.startswith("dto:"):
                    body = p.split(":", 1)[1].strip()
                elif p.startswith("lastEventId"):
                    parameters.append({"name": "Last-Event-ID", "in": "header", "required": False, "schema": {"type": "string"}})
            if parameters:
                op["parameters"] = parameters
            if body:
                op["requestBody"] = {"required": True, "content": {"application/json": {"schema": {"$ref": f"#/components/schemas/{body}"}}}}
            responses = {}
            ok = str(r.get("status", 200))
            for alt in [x.strip() for x in ret.split("|")]:
                if alt == "void":
                    responses["204" if ok == "200" else ok] = {"description": "Done"}
                elif alt == "Observable<MessageEvent>":
                    responses["200"] = {"description": "Server-Sent Events", "content": {"text/event-stream": {"schema": {"$ref": "#/components/schemas/StreamEvent"}}}}
                elif alt == "JobAccepted" and len(ret.split("|")) > 1:
                    responses["202"] = {"description": "Accepted; the result arrives on /stream",
                                        "content": {"application/json": {"schema": {"$ref": "#/components/schemas/JobAccepted"}}}}
                else:
                    code = "202" if alt == "JobAccepted" else ok
                    responses[code] = {"description": "OK", "content": {"application/json": {"schema": ret_schema(alt)}}}
            for code in (["401", "403"] if r["roles"] != ["Pub"] else []) + (["422"] if body else []):
                responses[code] = {"$ref": f"#/components/responses/{ {'401': 'Unauthorized', '403': 'Forbidden', '422': 'ValidationFailed'}[code] }"}
            op["responses"] = responses
            paths.setdefault(path, {})[method.lower()] = op

schemas = {
    "Problem": {"type": "object", "description": "RFC 9457 Problem Details", "required": ["type", "title", "status", "code"],
                "properties": {"type": {"type": "string"}, "title": {"type": "string"}, "status": {"type": "integer"},
                               "detail": {"type": "string"}, "code": {"type": "string", "examples": ["NOT_ASSIGNED"]}}},
    "Page": {"type": "object", "required": ["items"], "properties": {"items": {"type": "array", "items": {}},
                                                                     "nextCursor": {"type": ["string", "null"]}}},
    "StreamEvent": {"type": "object", "required": ["type"], "properties": {
        "type": {"type": "string", "enum": ["turn.lines", "turn.done", "provider.delay", "run.paused", "summary.ready", "judgement.ready", "notification"]},
        "runId": {"type": "string", "format": "uuid"}, "jobId": {"type": "string", "format": "uuid"},
        "payload": {"type": "object", "description": "judgement.ready: {segment} (one evidence segment of a shift graded by the judge panel). summary.ready: {} (every segment of the finished run is graded or failed). provider.delay: {waitingFor: narration | checks | summary}. run.paused: {turnId, reason}."}}},
}
for name, spec in {**DTOS, **VIEWS}.items():
    schemas[name] = object_schema(spec, name)

if errors:
    print("\n".join(errors))
    sys.exit(1)

doc = {
    "openapi": "3.1.0",
    "info": {"title": "JobQuest API", "version": "2.0.0",
             "description": "Generated from nest-modules.yaml (Chen ERD, 19 NestJS modules). x-status marks a route as approved (present in the 11/11 contract api/openapi.yaml) or proposed. All paths are under /api/v1. "
                            "x-roles lists the roles allowed; staff routes also check the occupation assignment. "
                            "Long AI work returns 202 and the result arrives on GET /stream (Server-Sent Events). "
                            "All content is in Vietnamese."},
    "servers": [{"url": "/api/v1"}],
    "security": [{"bearerAuth": []}],
    "tags": tags,
    "paths": paths,
    "components": {
        "securitySchemes": {"bearerAuth": {"type": "http", "scheme": "bearer", "bearerFormat": "JWT"}},
        "responses": {
            "Unauthorized": {"description": "Missing or expired token", "content": {"application/problem+json": {"schema": {"$ref": "#/components/schemas/Problem"}}}},
            "Forbidden": {"description": "Role or occupation assignment does not allow this", "content": {"application/problem+json": {"schema": {"$ref": "#/components/schemas/Problem"}}}},
            "ValidationFailed": {"description": "The request breaks a rule", "content": {"application/problem+json": {"schema": {"$ref": "#/components/schemas/Problem"}}}},
        },
        "schemas": schemas,
    },
}
OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(yaml.safe_dump(doc, sort_keys=False, allow_unicode=True, width=120))

# Swagger UI page with the spec embedded, so it opens from disk (file://) without a server.
SWAGGER_UI = "https://unpkg.com/swagger-ui-dist@5.17.14"
html = f"""<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>JobQuest API · Swagger</title>
  <link rel="stylesheet" href="{SWAGGER_UI}/swagger-ui.css">
</head>
<body>
  <!-- Generated by reports/master/design/compact/gen_openapi.py. Do not edit by hand. -->
  <div id="swagger-ui"></div>
  <script src="{SWAGGER_UI}/swagger-ui-bundle.js"></script>
  <script>
    const spec = {json.dumps(doc, ensure_ascii=False)};
    window.ui = SwaggerUIBundle({{ spec, dom_id: "#swagger-ui", deepLinking: true, docExpansion: "none",
      defaultModelsExpandDepth: 0, displayOperationId: true, tryItOutEnabled: false }});
  </script>
</body>
</html>
"""
(OUT.parent / "swagger.html").write_text(html)
n_ops = sum(len(v) for v in paths.values())
print(f"OK: {n_ops} operations, {len(paths)} paths, {len(schemas)} schemas → {OUT.relative_to(ROOT.parent.parent)}")

"""Sinh deployment diagram của JobQuest (báo cáo §5.3.1) theo ký hiệu UML.

Node là hộp 3D có stereotype («device», «node», «executionEnvironment»), artifact là hình
chữ nhật xanh lá có biểu tượng tài liệu, đường nối ghi giao thức, mũi tên đứt nét là phụ thuộc.

    python3 build_deployment.py            # ghi jobquest_deployment.svg cạnh file này
    # rồi chụp PNG bằng Chrome (lệnh trong README.md cùng thư mục)
"""
from pathlib import Path
from xml.sax.saxutils import escape

W, H = 1880, 1620
D = 12  # độ sâu mặt 3D

C = {
    "device": "#fbf7c5",
    "blue": "#86cff2",
    "steel": "#4d88a8",
    "store": "#ffc386",
    "store_in": "#ffe2c4",
    "region": "#f4f8fb",
    "ext": "#e4e7ea",
    "artifact": "#d4f281",
    "artifact_line": "#6b8f1f",
    "line": "#4a4a4a",
    "text": "#111111",
}

out = []


def shade(hex_color, k):
    r, g, b = (int(hex_color[i:i + 2], 16) for i in (1, 3, 5))
    return "#%02x%02x%02x" % tuple(max(0, min(255, int(c * k))) for c in (r, g, b))


def text(x, y, s, size=14, weight="normal", anchor="start", color=None, italic=False):
    style = "font-style:italic;" if italic else ""
    out.append(
        f'<text x="{x}" y="{y}" font-size="{size}" font-weight="{weight}" text-anchor="{anchor}" '
        f'fill="{color or C["text"]}" style="{style}">{escape(s)}</text>'
    )


def node(x, y, w, h, fill, stereo, name, sub=None, light_text=False, depth=D, name_size=17, dashed=False):
    """Hộp 3D kiểu UML: mặt trước, mặt trên, mặt phải."""
    dash = ' stroke-dasharray="7 5"' if dashed else ""
    top = f"{x},{y} {x + depth},{y - depth} {x + w + depth},{y - depth} {x + w},{y}"
    right = f"{x + w},{y} {x + w + depth},{y - depth} {x + w + depth},{y + h - depth} {x + w},{y + h}"
    out.append(f'<polygon points="{top}" fill="{shade(fill, 0.93)}" stroke="#333" stroke-width="1.2"{dash}/>')
    out.append(f'<polygon points="{right}" fill="{shade(fill, 0.82)}" stroke="#333" stroke-width="1.2"{dash}/>')
    out.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{fill}" stroke="#333" stroke-width="1.2"{dash}/>')
    if not name:  # node lồng nhỏ: chữ do nơi gọi tự viết
        return
    col = "#ffffff" if light_text else C["text"]
    cx = x + w / 2
    text(cx, y + 20, f"«{stereo}»", 13, anchor="middle", color=col)
    text(cx, y + 40, name, name_size, "bold", "middle", col)
    if sub:
        text(cx, y + 58, sub, 12.5, anchor="middle", color=col, italic=True)


def artifact(x, y, w, h, name, sub=None, dashed=False):
    out.append(
        f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{C["artifact"]}" '
        f'stroke="{C["artifact_line"]}" stroke-width="1.2"{' stroke-dasharray="6 4"' if dashed else ""}/>'
    )
    # biểu tượng tài liệu góc gấp
    ix, iy = x + w - 22, y + 7
    out.append(
        f'<path d="M{ix},{iy} h9 l5,5 v13 h-14 z M{ix + 9},{iy} v5 h5" fill="#fff" '
        f'stroke="#333" stroke-width="1"/>'
    )
    cx = x + w / 2
    text(cx, y + 17, "«artifact»", 12, anchor="middle")
    text(cx, y + 34, name, 14, "bold", "middle")
    if sub:
        for i, line in enumerate(sub if isinstance(sub, list) else [sub]):
            text(cx, y + 51 + i * 15, line, 12, anchor="middle")


def line(points, label=None, at=None, dashed=False, arrow=False, anchor="middle"):
    pts = " ".join(f"{px},{py}" for px, py in points)
    dash = ' stroke-dasharray="7 5"' if dashed else ""
    mark = ' marker-end="url(#open)"' if arrow else ""
    out.append(f'<polyline points="{pts}" fill="none" stroke="{C["line"]}" stroke-width="1.6"{dash}{mark}/>')
    if label:
        lx, ly = at
        out.append(
            f'<text x="{lx}" y="{ly}" font-size="13" text-anchor="{anchor}" fill="{C["line"]}" '
            f'paint-order="stroke" stroke="#ffffff" stroke-width="4">{escape(label)}</text>'
        )


def note(x, y, w, h, lines):
    f = 14
    out.append(
        f'<path d="M{x},{y} h{w - f} l{f},{f} v{h - f} h-{w} z M{x + w - f},{y} v{f} h{f}" '
        f'fill="#fffde8" stroke="#555" stroke-width="1.1"/>'
    )
    for i, s in enumerate(lines):
        text(x + 12, y + 22 + i * 17, s, 13)


# ── Hàng trên: thiết bị người dùng và CDN ─────────────────────────────
node(340, 50, 360, 150, C["device"], "device", "Explorer's phone or laptop", "web browser, no installation")
artifact(370, 118, 300, 64, "explorer app", "React SPA with game-core")

node(760, 50, 300, 150, C["blue"], "node", "Content delivery network", "no personal data")
artifact(780, 118, 125, 64, "bundles", "both apps")
artifact(915, 118, 125, 64, "releases", "published, by version")

node(1120, 50, 360, 150, C["device"], "device", "Staff computer", "web browser")
artifact(1150, 118, 300, 64, "staff app", "React SPA, separate download")

line([(700, 125), (760, 125)], "HTTPS", (730, 115))
line([(1120, 125), (1060, 125)], "HTTPS", (1090, 115))

# ── Vùng cloud tại Việt Nam (node lồng các node) ─────────────────────
node(340, 270, 1140, 1160, C["region"], "node", "Cloud region in Vietnam", "system of record; two zones (DC-03)", depth=14, name_size=18)

node(380, 360, 1060, 80, C["blue"], "node", "WAF + layer-7 load balancer", "TLS termination, rate limits, health checks")
line([(520, 200), (520, 348)], "HTTPS, SSE", (528, 300), anchor="start")
line([(1300, 200), (1300, 348)], "HTTPS", (1308, 300), anchor="start")

# API pod
node(380, 500, 380, 560, C["blue"], "executionEnvironment", "API pod × n", "Docker · Node.js · stateless, ≥ 2 per zone")
artifact(405, 580, 330, 125, "jobquest image (API role)", [
    "Exploration · Assessment", "Content lifecycle · Identity and access", "Analytics · Operations",
    "Result stream (SSE per explorer)",
])
artifact(470, 790, 200, 64, "game-core", "rules, scoring, caps")
line([(570, 705), (570, 782)], "«use»", (580, 750), dashed=True, arrow=True, anchor="start")
line([(570, 440), (570, 488)], "HTTP, SSE", (580, 472), anchor="start")

# Worker pod
node(1140, 500, 300, 380, C["steel"], "executionEnvironment", "Worker pod × m", "same image · scaled on queue length", light_text=True)
artifact(1160, 580, 260, 125, "jobquest image (worker)", [
    "AI orchestration", "Model gateway", "Scheduler · Notification", "Reference-data import",
])
artifact(1160, 790, 120, 64, "game-core", "rule checks")
artifact(1295, 790, 125, 64, "prompts", "and rubrics")
line([(1220, 705), (1220, 782)], "«use»", (1228, 750), dashed=True, arrow=True, anchor="start")
line([(1357, 705), (1357, 782)], "«use»", (1365, 750), dashed=True, arrow=True, anchor="start")

# Kho dữ liệu ở cột giữa: API nối từ bên trái, worker nối từ bên phải
node(820, 500, 260, 170, C["store"], "node", "Redis", "managed cache")
node(840, 575, 220, 34, C["store_in"], "node", "", depth=6)
text(950, 597, "primary · zone A · AOF", 12.5, anchor="middle")
node(840, 622, 220, 34, C["store_in"], "node", "", depth=6)
text(950, 644, "replica · zone B", 12.5, anchor="middle")

node(820, 710, 260, 220, C["store"], "node", "PostgreSQL", "managed database")
for i, s in enumerate(["primary · zone A · all writes", "synchronous standby · zone B", "read replica · analytics"]):
    node(840, 785 + i * 46, 220, 34, C["store_in"], "node", "", depth=6)
    text(950, 807 + i * 46, s, 12.5, anchor="middle")

line([(760, 585), (820, 585)], "Redis", (790, 576))
line([(760, 820), (820, 820)], "SQL", (790, 811))
line([(1140, 585), (1080, 585)], "Redis", (1110, 576))
line([(1140, 820), (1080, 820)], "SQL", (1126, 811))

# Object storage dưới API pod: API ghi file, sao lưu đi thẳng xuống vùng dự phòng
node(380, 1110, 380, 140, C["store"], "node", "Object storage", "S3-compatible, across zones")
artifact(420, 1176, 300, 60, "assets · exports", "WAL archive · backups")
line([(570, 1060), (570, 1098)], "S3 API", (580, 1086), anchor="start")

# Egress proxy dưới worker, chừa khe bên trái cho đường worker → observability
node(1240, 940, 200, 120, C["blue"], "node", "Egress proxy", "allowlisted endpoints only")
text(1340, 1040, "de-identified text only", 12.5, anchor="middle")
line([(1340, 880), (1340, 928)], "HTTPS", (1350, 912), anchor="start")

# Observability: nhận OTLP từ API và worker, metrics từ Redis, PostgreSQL, object storage, log từ egress
node(820, 1100, 620, 120, C["ext"], "node", "Observability", "metrics, logs, traces; alerts on queue length, p95 per provider, cost per session", name_size=16)
text(1130, 1200, "also scrapes the load balancer", 12, anchor="middle")
line([(950, 930), (950, 1088)], "metrics", (958, 1050), anchor="start")
# Redis → observability qua khe bên phải cột giữa; nhảy qua đường worker → PostgreSQL
out.append('<path d="M1080,650 H1112 V808 A12,12 0 0 1 1112,832 V1088" fill="none" stroke="#4a4a4a" stroke-width="1.6"/>')
out.append('<text x="1118" y="1078" font-size="13" fill="#4a4a4a" paint-order="stroke" stroke="#ffffff" stroke-width="4">metrics</text>')
line([(1180, 880), (1180, 1088)], "OTLP", (1188, 1000), anchor="start")
line([(1340, 1060), (1340, 1088)], "logs", (1350, 1082), anchor="start")
line([(760, 1030), (800, 1030), (800, 1160), (820, 1160)], "OTLP", (780, 1048))
line([(760, 1205), (820, 1205)], "metrics", (790, 1196))

# ── Ý tưởng: LLM local làm fallback khi nhà cung cấp lỗi (D-98; không hiện thực, ngoài phạm vi) ──
node(980, 1260, 280, 140, C["ext"], "node", "Local LLM server", "in Vietnam · fallback when providers fail", dashed=True)
artifact(1000, 1330, 240, 56, "open-weight model", "Ollama or vLLM, idea only", dashed=True)
# worker → LLM local: đi dọc mép phải vùng, nhảy qua đường egress → nhà cung cấp
out.append('<path d="M1440,850 H1462 V988 A12,12 0 0 1 1462,1012 V1330 H1272" fill="none" stroke="#4a4a4a" stroke-width="1.6" stroke-dasharray="7 5"/>')
out.append('<text x="1452" y="1322" font-size="13" text-anchor="end" fill="#4a4a4a" paint-order="stroke" stroke="#ffffff" stroke-width="4">HTTP, OpenAI-compatible API</text>')
line([(1120, 1248), (1120, 1222)], "metrics", (1128, 1240), anchor="start")

# ── Cột trái: Google ──────────────────────────────────────────────────
node(20, 500, 250, 110, C["ext"], "node", "Google Identity", "optional sign-in")
line([(380, 560), (270, 560)], "OIDC, HTTPS", (330, 549))

# ── Cột phải: nhà cung cấp model và dịch vụ ngoài ─────────────────────
node(1580, 870, 270, 260, C["ext"], "node", "Model providers", "abroad · no training, no retention")
artifact(1600, 950, 230, 70, "narrator API", "one model family")
artifact(1600, 1035, 230, 70, "judge APIs", "three other families")
line([(1440, 1000), (1580, 1000)], "HTTPS", (1516, 989))

node(1580, 500, 270, 120, C["ext"], "node", "Email · O*NET · ESCO", "notifications; occupational data")
line([(1440, 560), (1580, 560)], "SMTP, HTTPS", (1516, 549))

# ── Dưới: vùng dự phòng và ghi chú Stage 1 ────────────────────────────
node(440, 1490, 260, 100, C["ext"], "node", "Second region in Vietnam", "recovery copies")
line([(570, 1250), (570, 1478)], "WAL, backups copied", (580, 1370), anchor="start")

note(820, 1460, 720, 118, [
    "Stages 3 and 4 shown. At Stage 1 the same nodes run on one",
    "university server under Docker Compose, with one API pod and one",
    "worker pod; later stages add replicas and managed services, not nodes.",
    "Explorer text leaves Vietnam only through the egress proxy.",
    "Dashed: idea only, not implemented (out of scope).",
])

svg = (
    f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" '
    f'font-family="Helvetica, Arial, sans-serif">'
    '<defs><marker id="open" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="9" markerHeight="9" '
    'orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10" fill="none" stroke="#4a4a4a" stroke-width="1.6"/>'
    "</marker></defs>"
    f'<rect width="{W}" height="{H}" fill="#ffffff"/>' + "".join(out) + "</svg>"
)
Path(__file__).with_name("jobquest_deployment.svg").write_text(svg, encoding="utf-8")
print("ok", W, H)

"""Gera o desenho técnico da Babi (public/products/babi/desenho-tecnico.svg).

Cotas do desenho do projeto, em mm. Rode com: python3 scripts/desenho-tecnico-babi.py
"""
import math
from pathlib import Path

# --- medidas (mm) ---
ALTURA = 306.0
H_BASE = 126.0          # topo da base cilíndrica / início da saia inferior
H_SAIA = 162.0          # topo da saia inferior / início da cúpula
D_BASE = 120.0
D_SAIA_INF = 193.08     # saia inferior (REF)
D_SAIA_INF_TOPO = 167.0
D_CUPULA = 217.0        # base da cúpula (REF)
D_CUPULA_TOPO = 132.0
D_SOQUETE = (83.0, 47.0)
LOBULOS = 12

K = 1 / 3               # escala do desenho na folha (1:3)
W, H = 420, 297         # folha (unidades da folha)

ROSA = "#b63a55"
TRACO = "#171717"
COTA = "#4a4a4a"

out = []
add = out.append


def f(v):
    return f"{v:.2f}".rstrip("0").rstrip(".")


def br(v):
    """número no formato brasileiro (vírgula decimal)."""
    s = f"{v:.2f}".rstrip("0").rstrip(".")
    return s.replace(".", ",")


def linha(x1, y1, x2, y2, cls="vis"):
    add(f'<line class="{cls}" x1="{f(x1)}" y1="{f(y1)}" x2="{f(x2)}" y2="{f(y2)}"/>')


def texto(x, y, s, cls="t", anchor="middle", rot=None):
    tr = f' transform="rotate({rot} {f(x)} {f(y)})"' if rot is not None else ""
    add(f'<text class="{cls}" x="{f(x)}" y="{f(y)}" text-anchor="{anchor}"{tr}>{s}</text>')


def seta(x, y, ang):
    """ponta de seta preenchida apontando na direção ang (graus)."""
    a = math.radians(ang)
    L, b = 3.2, 1.0
    bx, by = x - L * math.cos(a), y - L * math.sin(a)
    px, py = -math.sin(a) * b, math.cos(a) * b
    add(f'<path class="seta" d="M{f(x)} {f(y)} L{f(bx + px)} {f(by + py)} L{f(bx - px)} {f(by - py)} Z"/>')


def cota_v(x, y1, y2, valor, ref_x, lado=1):
    """cota vertical em x, entre y1 e y2; linhas de chamada saindo de ref_x."""
    for y in (y1, y2):
        linha(ref_x + lado * 1.5, y, x + lado * 2, y, "ch")
    linha(x, y1, x, y2, "cota")
    seta(x, y1, -90 if y1 < y2 else 90)
    seta(x, y2, 90 if y1 < y2 else -90)
    texto(x - 1.6 * lado if lado < 0 else x - 1.6, (y1 + y2) / 2, valor, "tc", rot=-90)


def cota_h(y, x1, x2, valor, ref_y, cima=True):
    s = -1 if cima else 1
    for x in (x1, x2):
        linha(x, ref_y + s * 1.5, x, y + s * 2, "ch")
    linha(x1, y, x2, y, "cota")
    seta(x1, y, 180)
    seta(x2, y, 0)
    texto((x1 + x2) / 2, y - 1.6, valor, "tc")


def chamada(x0, y0, x1, y1, x2, s):
    """linha de chamada (leader) com ponto na peça e texto na horizontal."""
    add(f'<circle class="ponto" cx="{f(x0)}" cy="{f(y0)}" r="0.9"/>')
    add(f'<polyline class="cota" points="{f(x0)},{f(y0)} {f(x1)},{f(y1)} {f(x2)},{f(y1)}"/>')
    anchor = "start" if x2 >= x1 else "end"
    texto(x2 + (1.5 if anchor == "start" else -1.5), y1 + 1.4, s, "tc", anchor)


def lobado(cx, cy, R, prof, fase=0.0, n=360):
    pts = []
    for i in range(n + 1):
        t = 2 * math.pi * i / n
        r = R - prof * (1 - math.cos(LOBULOS * (t - fase))) / 2
        pts.append((cx + r * math.cos(t), cy + r * math.sin(t)))
    return "M" + " L".join(f"{f(x)} {f(y)}" for x, y in pts) + " Z"


# ---------------- folha ----------------
add(f'<rect class="folha" x="0" y="0" width="{W}" height="{H}"/>')
add(f'<rect class="moldura" x="10" y="10" width="{W - 20}" height="{H - 20}"/>')

# ---------------- vista frontal ----------------
cx, chao = 100, 152
def yh(h):
    return chao - h * K

rb, rsi, rsit, rc, rct = (D_BASE / 2 * K, D_SAIA_INF / 2 * K, D_SAIA_INF_TOPO / 2 * K, D_CUPULA / 2 * K, D_CUPULA_TOPO / 2 * K)
# base
add(f'<rect class="vis" x="{f(cx - rb)}" y="{f(yh(H_BASE))}" width="{f(2 * rb)}" height="{f(H_BASE * K)}"/>')
# saia inferior
add(f'<path class="vis" d="M{f(cx - rsi)} {f(yh(H_BASE))} L{f(cx - rsit)} {f(yh(H_SAIA))} L{f(cx + rsit)} {f(yh(H_SAIA))} L{f(cx + rsi)} {f(yh(H_BASE))} Z"/>')
# cúpula
add(f'<path class="vis" d="M{f(cx - rc)} {f(yh(H_SAIA))} L{f(cx - rct)} {f(yh(ALTURA))} L{f(cx + rct)} {f(yh(ALTURA))} L{f(cx + rc)} {f(yh(H_SAIA))} Z"/>')
# arestas das ondulações (cristas visíveis de frente)
for s in (math.sin(math.radians(a)) for a in (30, 60, -30, -60)):
    linha(cx + rct * s, yh(ALTURA), cx + rc * s, yh(H_SAIA), "fina")
    linha(cx + rsit * s, yh(H_SAIA), cx + rsi * s, yh(H_BASE), "fina")
# linha de centro
linha(cx, yh(ALTURA) - 6, cx, chao + 6, "centro")
# cotas
cota_v(cx - rc - 16, yh(ALTURA), chao, br(ALTURA), cx - rb, lado=-1)
cota_v(cx + rc + 12, yh(ALTURA), yh(H_SAIA), br(ALTURA - H_SAIA), cx + rct)
cota_v(cx + rc + 12, yh(H_SAIA), chao, br(H_SAIA), cx + rc)
cota_v(cx + rc + 26, yh(H_BASE), chao, br(H_BASE), cx + rb)
cota_h(chao + 11, cx - rb, cx + rb, "Ø" + br(D_BASE), chao, cima=False)
texto(22, 28, "VISTA FRONTAL", "titulo", "start")

# ---------------- vista superior (1º diedro: abaixo da frontal) ----------------
sx, sy = cx, chao + 26 + rc
add(f'<path class="vis" d="{lobado(sx, sy, rc, 16 * K)}"/>')
add(f'<path class="oculta" d="{lobado(sx, sy, rsi, 12 * K, fase=math.pi / LOBULOS)}"/>')
add(f'<circle class="oculta" cx="{sx}" cy="{f(sy)}" r="{f(rb)}"/>')
add(f'<circle class="vis" cx="{sx}" cy="{f(sy)}" r="{f(rct)}"/>')
for d in D_SOQUETE:
    add(f'<circle class="vis" cx="{sx}" cy="{f(sy)}" r="{f(d / 2 * K)}"/>')
linha(sx - rc - 6, sy, sx + rc + 6, sy, "centro")
linha(sx, sy - rc - 6, sx, sy + rc + 6, "centro")
cota_h(sy + rc + 10, sx - rc, sx + rc, "Ø" + br(D_CUPULA) + " REF", sy + rc, cima=False)
a = math.radians(-20)
chamada(sx + rsi * math.cos(a) * 0.985, sy + rsi * math.sin(a) * 0.985, sx + rc + 8, sy - rc + 2, sx + rc + 14, "SAIA INFERIOR Ø" + br(D_SAIA_INF) + " REF")
a = math.radians(30)
chamada(sx + rb * math.cos(a), sy + rb * math.sin(a), sx + rc + 8, sy + rc - 6, sx + rc + 14, "BASE Ø" + br(D_BASE))
texto(22, sy - rc - 4, "VISTA SUPERIOR", "titulo", "start")

# ---------------- perspectiva ----------------
px, pchao, KP = 300, 150, 0.36
ACH = 0.2  # achatamento das curvas horizontais


def raio(t, R, prof, fase):
    return R - prof * (1 - math.cos(LOBULOS * (t - fase))) / 2


def ponto(h, R, prof, fase, t):
    r = raio(t, R, prof, fase) * KP
    return px + r * math.cos(t), pchao - h * KP + r * math.sin(t) * ACH


def curva(h, R, prof=0.0, fase=0.0, frente=True, cls="vis"):
    n = 240
    ts = [math.pi * i / n for i in range(n + 1)] if frente else [2 * math.pi * i / n for i in range(n + 1)]
    pts = [ponto(h, R, prof, fase, t) for t in ts]
    add(f'<path class="{cls}" d="M' + " L".join(f"{f(x)} {f(y)}" for x, y in pts) + '"/>')


def y_frente(h, R, x):
    """altura (na folha) da metade da frente de uma curva circular de raio R, na abscissa x."""
    r = R * KP
    u = max(0.0, 1 - ((x - px) / r) ** 2)
    return pchao - h * KP + r * ACH * math.sqrt(u)


def lado(h1, r1, h2, r2, corte=None):
    for s in (-1, 1):
        x1, y1 = px + s * r1 * KP, pchao - h1 * KP
        x2, y2 = px + s * r2 * KP, pchao - h2 * KP
        if corte:
            hc, Rc = corte
            yc = y_frente(hc, Rc, x2)
            # termina onde a linha encontra a borda da frente da peça de cima
            if y2 < yc:
                fr = (y1 - yc) / (y1 - y2)
                x2, y2 = x1 + (x2 - x1) * fr, yc
        linha(x1, y1, x2, y2)


def cristas(h1, R1, p1, h2, R2, p2, fase):
    for k in range(LOBULOS):
        t = fase + k * 2 * math.pi / LOBULOS
        if 0.25 < (t % (2 * math.pi)) < math.pi - 0.25:
            x1, y1 = ponto(h1, R1, p1, fase, t)
            x2, y2 = ponto(h2, R2, p2, fase, t)
            linha(x1, y1, x2, y2, "fina")


curva(0, D_BASE / 2)
lado(0, D_BASE / 2, H_BASE, D_BASE / 2, corte=(H_BASE, D_SAIA_INF / 2 - 12))
curva(H_BASE, D_SAIA_INF / 2, 12, 0.0)
lado(H_BASE, D_SAIA_INF / 2, H_SAIA, D_SAIA_INF_TOPO / 2, corte=(H_SAIA, D_CUPULA / 2 - 16))
cristas(H_BASE, D_SAIA_INF / 2, 12, H_SAIA - 8, D_SAIA_INF_TOPO / 2 + 6, 9, math.pi / LOBULOS * 2)
curva(H_SAIA, D_CUPULA / 2, 16)
lado(H_SAIA, D_CUPULA / 2, ALTURA, D_CUPULA_TOPO / 2)
cristas(H_SAIA, D_CUPULA / 2, 16, ALTURA, D_CUPULA_TOPO / 2, 9, 0.0)
curva(ALTURA, D_CUPULA_TOPO / 2, 9, 0.0, frente=False)
texto(232, 28, "PERSPECTIVA", "titulo", "start")

# ---------------- notas ----------------
notas = [
    "NOTAS",
    "1. Cotas em milímetros.",
    "2. REF: cota de referência, medida nas cristas.",
    "3. Material: PETG translúcido.",
    "4. Lâmpada LED 6 W, 3000 K, bivolt.",
    "5. Não medir no desenho.",
]
for i, n in enumerate(notas):
    texto(232, 182 + i * 6.6, n, "titulo" if i == 0 else "nota", "start")

# ---------------- legenda (carimbo) ----------------
x0, y0, x1, y1 = 272, 233, W - 10, H - 10
add(f'<rect class="moldura" x="{x0}" y="{y0}" width="{x1 - x0}" height="{y1 - y0}"/>')
linha(x0, y0 + 16, x1, y0 + 16, "grade")
linha(x0, y0 + 32, x1, y0 + 32, "grade")
linha(x0 + 46, y0 + 16, x0 + 46, y1, "grade")
linha(x0 + 92, y0 + 16, x0 + 92, y1, "grade")
texto(x0 + 4, y0 + 7.5, "CARPI ATELIÊ", "marca", "start")
texto(x0 + 4, y0 + 13, "Abajur BABI · desenho de conjunto", "nota", "start")
celulas = [
    ("PROJEÇÃO", "1º diedro"), ("ESCALA", "1:3"), ("UNIDADE", "mm"),
    ("MATERIAL", "PETG"), ("DATA", "10/2026"), ("FOLHA", "1/1 · REV. A"),
]
for i, (r, v) in enumerate(celulas):
    cxl = x0 + 2.5 + (i % 3) * 46
    cyl = y0 + 16 + (i // 3) * 16
    texto(cxl, cyl + 5, r, "rotulo", "start")
    texto(cxl, cyl + 12, v, "valor", "start")

estilo = f"""
<style>
  text {{ font-family: 'Liberation Sans', Arial, Helvetica, sans-serif; fill: {TRACO}; }}
  .folha {{ fill: #fff; }}
  .moldura {{ fill: none; stroke: {TRACO}; stroke-width: 0.7; }}
  .grade {{ stroke: {TRACO}; stroke-width: 0.35; }}
  .vis {{ fill: none; stroke: {TRACO}; stroke-width: 0.6; stroke-linejoin: round; }}
  .fina {{ stroke: {TRACO}; stroke-width: 0.25; }}
  .oculta {{ fill: none; stroke: {TRACO}; stroke-width: 0.3; stroke-dasharray: 2 1.2; }}
  .centro {{ stroke: {ROSA}; stroke-width: 0.25; stroke-dasharray: 8 1.5 1.5 1.5; }}
  .ch {{ stroke: {COTA}; stroke-width: 0.2; }}
  .cota {{ fill: none; stroke: {COTA}; stroke-width: 0.25; }}
  .seta, .ponto {{ fill: {COTA}; }}
  .tc {{ font-size: 5.2px; fill: {TRACO}; }}
  .titulo {{ font-size: 5.4px; font-weight: 700; letter-spacing: 0.6px; fill: {ROSA}; }}
  .nota {{ font-size: 4.4px; }}
  .marca {{ font-size: 6px; font-weight: 700; letter-spacing: 1.6px; fill: {ROSA}; }}
  .rotulo {{ font-size: 2.6px; letter-spacing: 0.3px; fill: #6b6b6b; }}
  .valor {{ font-size: 4px; font-weight: 700; }}
</style>"""

svg = (
    f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W * 4}" height="{H * 4}">'
    + estilo + "\n" + "\n".join(out) + "\n</svg>\n"
)
destino = Path(__file__).resolve().parent.parent / "public/products/babi/desenho-tecnico.svg"
destino.write_text(svg, encoding="utf-8")
print(destino)

"""Gera o desenho técnico de conjunto da Babi (SVG, folha A3 na escala 1:3).

Medidas tiradas dos desenhos do projeto (CARPI-00 a CARPI-04, 29/10/2026), em mm.
Rode com: python3 scripts/desenho-tecnico-babi.py [arquivo-de-saída.svg]
(sem argumento, grava em public/products/babi/desenho-tecnico.svg)
"""
import math
import sys
from pathlib import Path

# --- cotas dos desenhos das peças (mm) ---
ALTURA = 286.00            # conjunto montado (CARPI-04)
CUP_ALTURA = 144.00        # cúpula (CARPI-00)
CUP_ENVELOPE = 216.83      # cúpula: maior largura, nas cristas
CUP_ANEL = 84.48           # cúpula: anel de encaixe
CUP_CASCA = 0.85           # cúpula: casca interna
SAIA_ALTURA = 43.68        # saia (CARPI-01)
SAIA_ENVELOPE = 192.90
SAIA_ANEL = 83.88
SAIA_ASSENTO = 116.28
SAIA_ABA = 2.40
BASE_ALTURA = 130.00       # base (CARPI-02)
BASE_D = 120.00
BASE_D_INT = 115.68
BASE_TUBO = 52.80
BASE_FURO = 33.80
BASE_FUNDO = 3.00
BASE_PAREDE = 1.90
LOBULOS = 12

# --- geometria do conjunto montado, medida no desenho CARPI-04 (só para desenhar, sem cota) ---
H_CUP = ALTURA - CUP_ALTURA          # 142: onde a cúpula começa
H_SAIA = 105.9                       # borda de baixo da saia
R_CUP_TOPO = 66.3                    # boca de cima da cúpula
R_SAIA_TOPO = 77.4
H_BOLINHAS = 186.0                   # altura do centro das bolinhas
R_BOLINHA = 3.2

K = 1 / 3                            # escala 1:3
W, H = 420, 297                      # folha A3 (mm)
ROSA, TRACO, COTA = "#b63a55", "#171717", "#4a4a4a"

out = []
add = out.append


def f(v):
    return f"{v:.2f}".rstrip("0").rstrip(".")


def br(v):
    return f"{v:.2f}".replace(".", ",")


def linha(x1, y1, x2, y2, cls="vis"):
    add(f'<line class="{cls}" x1="{f(x1)}" y1="{f(y1)}" x2="{f(x2)}" y2="{f(y2)}"/>')


def caminho(pts, cls="vis", fechar=True):
    d = "M" + " L".join(f"{f(x)} {f(y)}" for x, y in pts) + (" Z" if fechar else "")
    add(f'<path class="{cls}" d="{d}"/>')


def texto(x, y, s, cls="tc", anchor="middle", rot=None):
    tr = f' transform="rotate({rot} {f(x)} {f(y)})"' if rot is not None else ""
    add(f'<text class="{cls}" x="{f(x)}" y="{f(y)}" text-anchor="{anchor}"{tr}>{s}</text>')


def seta(x, y, ang):
    a = math.radians(ang)
    L, b = 2.8, 0.85
    bx, by = x - L * math.cos(a), y - L * math.sin(a)
    px, py = -math.sin(a) * b, math.cos(a) * b
    add(f'<path class="seta" d="M{f(x)} {f(y)} L{f(bx + px)} {f(by + py)} L{f(bx - px)} {f(by - py)} Z"/>')


def cota_v(x, y1, y2, valor, ref_x):
    lado = 1 if x > ref_x else -1
    for y in (y1, y2):
        linha(ref_x + lado * 1.2, y, x + lado * 1.8, y, "ch")
    linha(x, y1, x, y2, "cota")
    seta(x, y1, -90)
    seta(x, y2, 90)
    texto(x - 1.3, (y1 + y2) / 2, valor, rot=-90)


def cota_h(y, x1, x2, valor, ref_y):
    s = -1 if y < ref_y else 1
    for x in (x1, x2):
        linha(x, ref_y + s * 1.2, x, y + s * 1.8, "ch")
    linha(x1, y, x2, y, "cota")
    seta(x1, y, 180)
    seta(x2, y, 0)
    texto((x1 + x2) / 2, y - 1.3, valor)


def chamada(x0, y0, x1, y1, x2, s):
    add(f'<circle class="ponto" cx="{f(x0)}" cy="{f(y0)}" r="0.7"/>')
    add(f'<polyline class="cota" points="{f(x0)},{f(y0)} {f(x1)},{f(y1)} {f(x2)},{f(y1)}"/>')
    anchor = "start" if x2 >= x1 else "end"
    texto(x2 + (1.2 if anchor == "start" else -1.2), y1 + 1.2, s, "tc", anchor)


def raio_cupula(h):
    """raio da cúpula na altura h (do chão)."""
    return CUP_ENVELOPE / 2 - (CUP_ENVELOPE / 2 - R_CUP_TOPO) * (h - H_CUP) / CUP_ALTURA


def lobado(cx, cy, R, prof, fase=0.0, n=360, ach=1.0, meia=False):
    pts = []
    for i in range(n + 1):
        t = (math.pi if meia else 2 * math.pi) * i / n
        r = R - prof * (1 - math.cos(LOBULOS * (t - fase))) / 2
        pts.append((cx + r * math.cos(t), cy + r * math.sin(t) * ach))
    return pts


def bolinha(x, y, r, cls="vis"):
    """bolinha em gota (como no desenho): círculo com ponta para baixo."""
    add(f'<path class="{cls}" d="M{f(x - r)} {f(y)} A{f(r)} {f(r)} 0 1 1 {f(x + r)} {f(y)} L{f(x)} {f(y + r * 1.45)} Z"/>')


# ================================================================ folha
add(f'<rect class="folha" x="0" y="0" width="{W}" height="{H}"/>')
add(f'<rect class="moldura" x="10" y="10" width="{W - 20}" height="{H - 20}"/>')

# ================================================================ vista frontal
cx, chao = 86, 140


def y(h):
    return chao - h * K


rb = BASE_D / 2 * K
add(f'<rect class="vis" x="{f(cx - rb)}" y="{f(y(H_SAIA))}" width="{f(2 * rb)}" height="{f(H_SAIA * K)}"/>')
caminho([(cx - SAIA_ENVELOPE / 2 * K, y(H_SAIA)), (cx - R_SAIA_TOPO * K, y(H_CUP)), (cx + R_SAIA_TOPO * K, y(H_CUP)), (cx + SAIA_ENVELOPE / 2 * K, y(H_SAIA))])
caminho([(cx - CUP_ENVELOPE / 2 * K, y(H_CUP)), (cx - R_CUP_TOPO * K, y(ALTURA)), (cx + R_CUP_TOPO * K, y(ALTURA)), (cx + CUP_ENVELOPE / 2 * K, y(H_CUP))])
for k in range(LOBULOS):  # bolinhas: as da frente aparecem na vista frontal
    t = math.radians(15 + 30 * k)
    if math.sin(t) > 0.05:
        bolinha(cx + raio_cupula(H_BOLINHAS) * math.cos(t) * K, y(H_BOLINHAS), R_BOLINHA * K * 3 * (0.55 + 0.45 * math.sin(t)))
texto(cx, y(4), "CARPI", "gravacao")
linha(cx, y(ALTURA) - 5, cx, chao + 5, "centro")
# corte A-A
for s in (-1, 1):
    yy = y(ALTURA) - 12 if s < 0 else chao + 5
    linha(cx + 1, yy, cx + 7, yy, "cota")
    seta(cx + 1, yy, 180)
    texto(cx + 9, yy + 1.3, "A", "rotulo-corte", "start")
cota_v(cx - CUP_ENVELOPE / 2 * K - 9, y(ALTURA), chao, br(ALTURA), cx - rb)
cota_v(cx + CUP_ENVELOPE / 2 * K + 7, y(ALTURA), y(H_CUP), br(CUP_ALTURA), cx + R_CUP_TOPO * K)
cota_h(y(ALTURA) - 5, cx - CUP_ENVELOPE / 2 * K, cx + CUP_ENVELOPE / 2 * K, f"Ø{br(CUP_ENVELOPE)} REF", y(H_CUP))
cota_h(chao + 12, cx - rb, cx + rb, f"Ø{br(BASE_D)}", chao)
cota_h(chao + 21, cx - SAIA_ENVELOPE / 2 * K, cx + SAIA_ENVELOPE / 2 * K, f"Ø{br(SAIA_ENVELOPE)} REF", y(H_SAIA))
texto(cx, 26, "VISTA FRONTAL", "titulo")

# ================================================================ vista superior (1º diedro: abaixo da frontal)
sy = 216
rc = CUP_ENVELOPE / 2 * K
caminho(lobado(cx, sy, rc, 18 * K))
caminho(lobado(cx, sy, R_CUP_TOPO * K, 8 * K), "vis-grossa")
add(f'<circle class="vis" cx="{f(cx)}" cy="{f(sy)}" r="{f(CUP_ANEL / 2 * K)}"/>')
for d in (BASE_TUBO, BASE_FURO):
    add(f'<circle class="vis" cx="{f(cx)}" cy="{f(sy)}" r="{f(d / 2 * K)}"/>')
for k in range(LOBULOS):
    t = math.radians(30 * k)
    bx, by = cx + 98 * K * math.cos(t), sy + 98 * K * math.sin(t)
    add(f'<circle class="vis" cx="{f(bx)}" cy="{f(by)}" r="{f(R_BOLINHA * K * 2.6)}"/>')
linha(cx - rc - 5, sy, cx + rc + 5, sy, "centro")
linha(cx, sy - rc - 5, cx, sy + rc + 5, "centro")
chamada(cx + CUP_ANEL / 2 * K * 0.71, sy - CUP_ANEL / 2 * K * 0.71, cx + rc + 6, sy - rc + 4, cx + rc + 10, f"Ø{br(CUP_ANEL)} anel da cúpula")
chamada(cx + BASE_TUBO / 2 * K * 0.71, sy + BASE_TUBO / 2 * K * 0.71, cx + rc + 6, sy + rc - 4, cx + rc + 10, f"Ø{br(BASE_TUBO)} / Ø{br(BASE_FURO)} tubo da base")
chamada(cx + 98 * K + R_BOLINHA * K * 2.6, sy, cx + rc + 6, sy, cx + rc + 10, "12 bolinhas, a cada 30°")
texto(cx, sy - rc - 7, "VISTA SUPERIOR", "titulo")

# ================================================================ corte A-A (mesma escala, alinhado com a frontal)
kx = 226.5


def xs(r):
    return kx + r * K


def corte(pts):
    caminho(pts, "cortado")


def casca(tri, d):
    """triângulo oco (casca fina, em preto), como as cascas duplas da cúpula e da saia no corte."""
    (ax, ay), (bx, by), (qx, qy) = tri
    la, lb, lc = math.dist((bx, by), (qx, qy)), math.dist((ax, ay), (qx, qy)), math.dist((ax, ay), (bx, by))
    per = la + lb + lc
    ix, iy = (la * ax + lb * bx + lc * qx) / per, (la * ay + lb * by + lc * qy) / per
    area = abs((bx - ax) * (qy - ay) - (qx - ax) * (by - ay)) / 2
    k = 1 - d / (2 * area / per)
    dentro = [(ix + (px_ - ix) * k, iy + (py_ - iy) * k) for px_, py_ in reversed(tri)]
    d_ = lambda pts: "M" + " L".join(f"{f(a)} {f(b)}" for a, b in pts) + " Z"
    add(f'<path class="fino" fill-rule="evenodd" d="{d_(tri)} {d_(dentro)}"/>')


e = 1.6  # espessura desenhada das paredes cortadas (mm reais)
for s in (-1, 1):
    # base: parede externa, fundo, colar de cima e tubo central
    corte([(kx + s * (BASE_D / 2) * K, y(0)), (kx + s * (BASE_D / 2) * K, y(BASE_ALTURA - 3)), (kx + s * (BASE_D / 2 - BASE_PAREDE) * K, y(BASE_ALTURA - 3)), (kx + s * (BASE_D / 2 - BASE_PAREDE) * K, y(BASE_FUNDO)), (kx + s * (BASE_TUBO / 2) * K, y(BASE_FUNDO)), (kx + s * (BASE_TUBO / 2) * K, y(0))])
    corte([(kx + s * (BASE_TUBO / 2) * K, y(0)), (kx + s * (BASE_TUBO / 2) * K, y(BASE_ALTURA)), (kx + s * (BASE_FURO / 2) * K, y(BASE_ALTURA)), (kx + s * (BASE_FURO / 2) * K, y(0))])
    corte([(kx + s * (BASE_D / 2) * K, y(BASE_ALTURA - 3)), (kx + s * (BASE_D / 2) * K, y(BASE_ALTURA - 3 + 2)), (kx + s * (BASE_TUBO / 2) * K, y(BASE_ALTURA - 3 + 2)), (kx + s * (BASE_TUBO / 2) * K, y(BASE_ALTURA - 3))])
    # saia: casca cônica, aba de cima e assento sobre a base
    casca([(kx + s * SAIA_ENVELOPE / 2 * K, y(H_SAIA)), (kx + s * R_SAIA_TOPO * K, y(H_CUP - 2)), (kx + s * BASE_D / 2 * K, y(H_SAIA))], 0.45)
    corte([(kx + s * R_SAIA_TOPO * K, y(H_CUP - 2)), (kx + s * R_SAIA_TOPO * K, y(H_CUP - 2 + SAIA_ABA)), (kx + s * SAIA_ANEL / 2 * K, y(H_CUP - 2 + SAIA_ABA)), (kx + s * SAIA_ANEL / 2 * K, y(H_CUP - 2))])
    corte([(kx + s * SAIA_ASSENTO / 2 * K, y(H_CUP - 2)), (kx + s * SAIA_ASSENTO / 2 * K, y(BASE_ALTURA - 1)), (kx + s * (SAIA_ASSENTO / 2 - e) * K, y(BASE_ALTURA - 1)), (kx + s * (SAIA_ASSENTO / 2 - e) * K, y(H_CUP - 2))])
    # cúpula: casca externa, casca interna e fundo com o anel de encaixe
    casca([(kx + s * CUP_ENVELOPE / 2 * K, y(H_CUP)), (kx + s * R_CUP_TOPO * K, y(ALTURA)), (kx + s * (CUP_ANEL / 2 + 2) * K, y(H_CUP))], 0.45)
    corte([(kx + s * CUP_ENVELOPE / 2 * K, y(H_CUP)), (kx + s * CUP_ENVELOPE / 2 * K, y(H_CUP + 2)), (kx + s * (CUP_ANEL / 2 - CUP_CASCA * 2) * K, y(H_CUP + 2)), (kx + s * (CUP_ANEL / 2 - CUP_CASCA * 2) * K, y(H_CUP))])
# lâmpada (referência, sem corte)
add(f'<path class="lampada" d="M{f(xs(-8))} {f(y(132))} L{f(xs(-8))} {f(y(152))} C{f(xs(-22))} {f(y(165))} {f(xs(-22))} {f(y(205))} {f(kx)} {f(y(207))} '
    f'C{f(xs(22))} {f(y(205))} {f(xs(22))} {f(y(165))} {f(xs(8))} {f(y(152))} L{f(xs(8))} {f(y(132))} Z"/>')
add(f'<rect class="lampada" x="{f(xs(-BASE_FURO / 2 + 2))}" y="{f(y(132))}" width="{f((BASE_FURO - 4) * K)}" height="{f(60 * K)}"/>')
linha(kx, y(ALTURA) - 5, kx, chao + 5, "centro")
chamada(xs(BASE_D / 2 - BASE_PAREDE / 2), y(60), xs(BASE_D / 2) + 8, y(60), xs(BASE_D / 2) + 12, f"parede {br(BASE_PAREDE)}")
chamada(xs(BASE_D / 2 - 10), y(BASE_FUNDO / 2), xs(BASE_D / 2) + 8, y(10), xs(BASE_D / 2) + 12, f"fundo {br(BASE_FUNDO)}")
chamada(xs(SAIA_ASSENTO / 2), y(H_CUP - 8), xs(SAIA_ENVELOPE / 2) + 6, y(118), xs(SAIA_ENVELOPE / 2) + 10, f"assento Ø{br(SAIA_ASSENTO)}")
chamada(xs(-CUP_ANEL / 2), y(H_CUP + 1), xs(-CUP_ENVELOPE / 2) - 4, y(160), xs(-CUP_ENVELOPE / 2) - 8, "baioneta")
chamada(xs(-9), y(190), xs(-CUP_ENVELOPE / 2) - 4, y(215), xs(-CUP_ENVELOPE / 2) - 8, "lâmpada (ref.)")
texto(kx, 26, "CORTE A-A", "titulo")

# ================================================================ perspectiva
px, pchao, KP, ACH = 352, 140, K, 0.2


def ponto(h, R, prof, fase, t):
    r = (R - prof * (1 - math.cos(LOBULOS * (t - fase))) / 2) * KP
    return px + r * math.cos(t), pchao - h * KP + r * math.sin(t) * ACH


def curva(h, R, prof=0.0, frente=True):
    n = 200
    ts = [math.pi * i / n for i in range(n + 1)] if frente else [2 * math.pi * i / n for i in range(n + 1)]
    caminho([ponto(h, R, prof, 0, t) for t in ts], fechar=False)


def lados(h1, r1, h2, r2):
    for s in (-1, 1):
        linha(px + s * r1 * KP, pchao - h1 * KP, px + s * r2 * KP, pchao - h2 * KP)


curva(0, BASE_D / 2)
lados(0, BASE_D / 2, H_SAIA + 2, BASE_D / 2)
curva(H_SAIA, SAIA_ENVELOPE / 2, 12)
lados(H_SAIA, SAIA_ENVELOPE / 2, H_CUP - 6, R_SAIA_TOPO + 5)
curva(H_CUP, CUP_ENVELOPE / 2, 18)
lados(H_CUP, CUP_ENVELOPE / 2, ALTURA, R_CUP_TOPO)
curva(ALTURA, R_CUP_TOPO, 8, frente=False)
for k in range(LOBULOS):
    t = math.radians(15 + 30 * k)
    if math.sin(t) > 0.1:
        bx, by = ponto(H_BOLINHAS, raio_cupula(H_BOLINHAS), 0, 0, t)
        add(f'<ellipse class="vis" cx="{f(bx)}" cy="{f(by)}" rx="{f(R_BOLINHA * KP * 2.2 * (0.5 + 0.5 * math.sin(t)))}" ry="{f(R_BOLINHA * KP * 2.2)}"/>')
texto(px, pchao + BASE_D / 2 * KP * ACH - 4 * KP, "CARPI", "gravacao")
texto(px, 26, "PERSPECTIVA", "titulo")

# ================================================================ notas (duas colunas) e lista de peças
nx, ny = 203, 186
notas = (
    [
        "1. Cotas em milímetros. Não medir no desenho.",
        "2. REF: cota de referência, nas cristas da ondulação.",
        "3. Encaixes de baioneta entre as peças: 3 entradas em",
        "    cada conexão, giro nominal de 20°, folga radial 0,30.",
    ],
    [
        f"4. Cúpula com casca interna nominal de {br(CUP_CASCA)}.",
        f"5. Base com paredes cilíndricas de {br(BASE_PAREDE)}.",
        "6. Corte A-A simplificado; lâmpada só como referência.",
    ],
)
texto(nx, ny, "NOTAS", "titulo", "start")
for c, coluna in enumerate(notas):
    for i, n in enumerate(coluna):
        texto(nx + c * 100 + (3 if n.startswith("  ") else 0), ny + 7.5 + i * 6.2, n.strip(), "nota", "start")

tx, ty, cw = nx, 222, [12, 34, 34, 110]
cab = ["ITEM", "PEÇA", "DESENHO", "MEDIDAS PRINCIPAIS"]
linhas_tab = [
    ["1", "Cúpula", "CARPI-00", f"altura {br(CUP_ALTURA)} · Ø{br(CUP_ENVELOPE)} REF · anel Ø{br(CUP_ANEL)}"],
    ["2", "Saia", "CARPI-01", f"altura {br(SAIA_ALTURA)} · Ø{br(SAIA_ENVELOPE)} REF · Ø{br(SAIA_ANEL)} / Ø{br(SAIA_ASSENTO)}"],
    ["3", "Base", "CARPI-02", f"altura {br(BASE_ALTURA)} · Ø{br(BASE_D)} / Ø{br(BASE_D_INT)} · tubo Ø{br(BASE_TUBO)}"],
]
alt = 6.2
largura = sum(cw)
add(f'<rect class="moldura-fina" x="{tx}" y="{ty}" width="{largura}" height="{f(alt * 4)}"/>')
for i in range(1, 4):
    linha(tx, ty + alt * i, tx + largura, ty + alt * i, "grade")
xx = tx
for c in cw[:-1]:
    xx += c
    linha(xx, ty, xx, ty + alt * 4, "grade")
for i, lin in enumerate([cab] + linhas_tab):
    xx = tx
    for c, v in zip(cw, lin):
        texto(xx + 1.8, ty + alt * i + 4.3, v, "rotulo" if i == 0 else "celula", "start")
        xx += c

# ================================================================ legenda (faixa na largura toda, embaixo)
x0, y0, x1, y1 = 10, 262, W - 10, H - 10
linha(x0, y0, x1, y0, "moldura")
marca = 120
linha(x0 + marca, y0, x0 + marca, y1, "grade")
texto(x0 + 6, y0 + 11, "CARPI ATELIÊ", "marca", "start")
texto(x0 + 6, y0 + 18.5, "Abajur BABI · desenho de conjunto", "nota", "start")
celulas = [
    ("PROJEÇÃO", "1º diedro"), ("ESCALA", "1:3 (A3)"), ("UNIDADE", "mm"),
    ("MATERIAL", "PETG"), ("DATA", "30/10/2026"), ("DESENHO", "CARPI-BABI rev. 1"),
]
cel = (x1 - x0 - marca) / len(celulas)
for i, (r, v) in enumerate(celulas):
    xc = x0 + marca + i * cel
    if i:
        linha(xc, y0, xc, y1, "grade")
    texto(xc + 4, y0 + 9, r, "rotulo", "start")
    texto(xc + 4, y0 + 17, v, "valor", "start")

estilo = f"""
<style>
  text {{ font-family: 'Liberation Sans', Arial, Helvetica, sans-serif; fill: {TRACO}; }}
  .folha {{ fill: #fff; }}
  line.moldura {{ stroke-width: 0.6; }}
  .moldura {{ fill: none; stroke: {TRACO}; stroke-width: 0.7; }}
  .moldura-fina {{ fill: none; stroke: {TRACO}; stroke-width: 0.45; }}
  .grade {{ stroke: {TRACO}; stroke-width: 0.3; }}
  .vis {{ fill: none; stroke: {TRACO}; stroke-width: 0.5; stroke-linejoin: round; }}
  .fino {{ fill: {TRACO}; stroke: none; }}
  .vis-grossa {{ fill: none; stroke: {TRACO}; stroke-width: 0.8; stroke-linejoin: round; }}
  .cortado {{ fill: url(#hachura); stroke: {TRACO}; stroke-width: 0.35; stroke-linejoin: round; }}
  .lampada {{ fill: none; stroke: {COTA}; stroke-width: 0.3; stroke-dasharray: 1.6 0.8; }}
  .centro {{ stroke: {ROSA}; stroke-width: 0.22; stroke-dasharray: 7 1.3 1.3 1.3; }}
  .ch {{ stroke: {COTA}; stroke-width: 0.18; }}
  .cota {{ fill: none; stroke: {COTA}; stroke-width: 0.22; }}
  .seta, .ponto {{ fill: {COTA}; }}
  .tc {{ font-size: 3.6px; }}
  .titulo {{ font-size: 4.2px; font-weight: 700; letter-spacing: 0.5px; fill: {ROSA}; }}
  .rotulo-corte {{ font-size: 4.2px; font-weight: 700; }}
  .nota {{ font-size: 3.4px; }}
  .celula {{ font-size: 3.1px; }}
  .gravacao {{ font-size: 2.6px; font-weight: 700; letter-spacing: 0.3px; }}
  .marca {{ font-size: 6px; font-weight: 700; letter-spacing: 1.6px; fill: {ROSA}; }}
  .rotulo {{ font-size: 2.5px; letter-spacing: 0.2px; fill: #6b6b6b; }}
  .valor {{ font-size: 3.8px; font-weight: 700; }}
</style>
<defs>
  <pattern id="hachura" width="1.4" height="1.4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
    <rect width="1.4" height="1.4" fill="#fff"/><line x1="0" y1="0" x2="0" y2="1.4" stroke="{TRACO}" stroke-width="0.3"/>
  </pattern>
</defs>"""

svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}mm" height="{H}mm">' + estilo + "\n" + "\n".join(out) + "\n</svg>\n"
destino = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).resolve().parent.parent / "public/products/babi/desenho-tecnico.svg"
destino.write_text(svg, encoding="utf-8")
print(destino)

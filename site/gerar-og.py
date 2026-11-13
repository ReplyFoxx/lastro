"""Gera a imagem de prévia (Open Graph) da plataforma: site/og-cerne.png.
Uso:  python site/gerar-og.py   (requer Pillow)
O Pillow não lê a fonte do site (woff2); a imagem usa a Segoe UI do sistema."""
import os
from PIL import Image, ImageDraw, ImageFont

AQUI = os.path.dirname(os.path.abspath(__file__))
BRANCO, TINTA, TINTA2, AMARELO, AZUL = "#FFFFFF", "#172554", "#263B67", "#FFB38A", "#172554"
E = 2  # desenha em dobro e reduz, para suavizar


def fonte(nomes, tamanho):
    for n in nomes:
        try:
            return ImageFont.truetype(n, tamanho * E)
        except OSError:
            continue
    return ImageFont.load_default()


def anel(d, cx, cy, r, esp):
    d.ellipse([(cx - r) * E, (cy - r) * E, (cx + r) * E, (cy + r) * E], outline=AZUL, width=int(esp * E))


img = Image.new("RGB", (1200 * E, 630 * E), BRANCO)
d = ImageDraw.Draw(img)
# marca: tronco cortado azul-marinho, cerne pêssego (proporções do logotipo, viewBox 32)
k, ox, oy = 9.5, 80, 150
anel(d, ox + 16 * k, oy + 16 * k, 13.4 * k, 2.4 * k)
anel(d, ox + 14.4 * k, oy + 17.2 * k, 8 * k, 2.4 * k)
r = 3.3 * k
d.ellipse([(ox + 12.9 * k - r) * E, (oy + 18.4 * k - r) * E, (ox + 12.9 * k + r) * E, (oy + 18.4 * k + r) * E], fill=AMARELO)

preta = ["seguibl.ttf", "segoeuib.ttf", "arialbd.ttf", "DejaVuSans-Bold.ttf"]
negrito = ["segoeuib.ttf", "arialbd.ttf", "DejaVuSans-Bold.ttf"]
normal = ["segoeui.ttf", "arial.ttf", "DejaVuSans.ttf"]
d.text((450 * E, 130 * E), "Cerne", font=fonte(preta, 150), fill=TINTA)
lema, f_lema = "Valor real antes do preço.", fonte(negrito, 44)
x0, y0, x1, y1 = d.textbbox((470 * E, 340 * E), lema, font=f_lema)
d.rectangle([x0 - 14 * E, y0 - 10 * E, x1 + 14 * E, y1 + 12 * E], fill=AMARELO)
d.text((470 * E, 340 * E), lema, font=f_lema, fill=TINTA)
d.line([(456 * E, 440 * E), (1120 * E, 440 * E)], fill=TINTA, width=3 * E)
d.text((456 * E, 458 * E), "Educação financeira fundamentalista.", font=fonte(normal, 28), fill=TINTA2)
d.text((456 * E, 498 * E), "Ferramentas e trilhas gratuitas, sem cadastro.", font=fonte(normal, 28), fill=TINTA2)
img.resize((1200, 630), Image.LANCZOS).save(os.path.join(AQUI, "og-cerne.png"), optimize=True)
print("og-cerne.png gerado")

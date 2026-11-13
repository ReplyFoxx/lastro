"""Gera a imagem de prévia (Open Graph) da plataforma: site/og-cerne.png.
Uso:  python site/gerar-og.py   (requer Pillow)"""
import os
from PIL import Image, ImageDraw, ImageFont

AQUI = os.path.dirname(os.path.abspath(__file__))
PAPEL, TINTA, TINTA2, OCRE, VERDE = "#F4F0E6", "#1B2623", "#4A5651", "#B07E1A", "#1F5D50"
E = 2  # desenha em dobro e reduz, para suavizar


def fonte(nomes, tamanho):
    for n in nomes:
        try:
            return ImageFont.truetype(n, tamanho * E)
        except OSError:
            continue
    return ImageFont.load_default()


def anel(d, cx, cy, r, esp):
    d.ellipse([(cx - r) * E, (cy - r) * E, (cx + r) * E, (cy + r) * E], outline=TINTA, width=int(esp * E))


img = Image.new("RGB", (1200 * E, 630 * E), PAPEL)
d = ImageDraw.Draw(img)
# marca: tronco cortado, proporções do logotipo (viewBox 32)
k, ox, oy = 9.5, 80, 150
anel(d, ox + 16 * k, oy + 16 * k, 13.4 * k, 2.4 * k)
anel(d, ox + 14.4 * k, oy + 17.2 * k, 8 * k, 2.4 * k)
r = 3.3 * k
d.ellipse([(ox + 12.9 * k - r) * E, (oy + 18.4 * k - r) * E, (ox + 12.9 * k + r) * E, (oy + 18.4 * k + r) * E], fill=OCRE)

serif = ["georgiab.ttf", "georgia.ttf", "DejaVuSerif-Bold.ttf"]
serif_i = ["georgiai.ttf", "georgia.ttf", "DejaVuSerif-Italic.ttf"]
sans = ["segoeui.ttf", "arial.ttf", "DejaVuSans.ttf"]
d.text((450 * E, 150 * E), "Cerne", font=fonte(serif, 150), fill=TINTA)
d.text((456 * E, 330 * E), "Valor real antes do preço.", font=fonte(serif_i, 46), fill=VERDE)
d.line([(456 * E, 420 * E), (1120 * E, 420 * E)], fill=TINTA, width=2 * E)
d.text((456 * E, 440 * E), "Educação financeira fundamentalista.", font=fonte(sans, 28), fill=TINTA2)
d.text((456 * E, 480 * E), "Ferramentas gratuitas, sem cadastro.", font=fonte(sans, 28), fill=TINTA2)
img.resize((1200, 630), Image.LANCZOS).save(os.path.join(AQUI, "og-cerne.png"), optimize=True)
print("og-cerne.png gerado")

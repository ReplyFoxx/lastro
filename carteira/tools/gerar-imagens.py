"""Gera os icones do PWA e a imagem de previa (Open Graph).
Uso:  python tools/gerar-imagens.py     (precisa do Pillow: pip install pillow)
"""
import os
from PIL import Image, ImageDraw, ImageFont

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAPEL, TINTA, TINTA2, VERDE = "#F4F0E6", "#1B2623", "#4A5651", "#1F5D50"
FATIAS = [("#5E86AD", 18), ("#2B8574", 24), ("#7C9F45", 8), ("#C9952A", 20), ("#BF4F3C", 12), ("#7A5AA3", 10), ("#C4718F", 8)]
PASTAS = (r"C:\Windows\Fonts", "/usr/share/fonts/truetype/dejavu", "/Library/Fonts", "/System/Library/Fonts/Supplemental")


def fonte(nomes, tamanho):
    for n in nomes:
        for pasta in PASTAS:
            caminho = os.path.join(pasta, n)
            if os.path.exists(caminho):
                return ImageFont.truetype(caminho, tamanho)
    return ImageFont.load_default()


def rosca(img, cx, cy, r_fora, r_dentro, fundo, escala=4):
    """Desenha a rosca com suavizacao (desenha maior e reduz)."""
    lado = r_fora * 2
    grande = Image.new("RGBA", (lado * escala, lado * escala), (0, 0, 0, 0))
    d = ImageDraw.Draw(grande)
    ang = -90.0
    for cor, pct in FATIAS:
        fim = ang + pct * 3.6
        d.pieslice([0, 0, lado * escala - 1, lado * escala - 1], ang, fim, fill=cor, outline=fundo, width=escala * max(2, r_fora // 60))
        ang = fim
    m = (r_fora - r_dentro) * escala
    d.ellipse([m, m, lado * escala - 1 - m, lado * escala - 1 - m], fill=fundo)
    pequeno = grande.resize((lado, lado), Image.LANCZOS)
    img.paste(pequeno, (cx - r_fora, cy - r_fora), pequeno)


def icone(tamanho, arquivo, margem=0.16, cantos=True):
    img = Image.new("RGBA", (tamanho, tamanho), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    if cantos:
        d.rounded_rectangle([0, 0, tamanho - 1, tamanho - 1], radius=int(tamanho * 0.22), fill=PAPEL)
    else:
        d.rectangle([0, 0, tamanho, tamanho], fill=PAPEL)
    r = int(tamanho * (0.5 - margem))
    rosca(img, tamanho // 2, tamanho // 2, r, int(r * 0.55), PAPEL)
    img.save(os.path.join(RAIZ, "icons", arquivo), optimize=True)


def previa():
    largura, altura = 1200, 630
    img = Image.new("RGB", (largura, altura), PAPEL)
    d = ImageDraw.Draw(img)
    serif = ["georgiab.ttf", "georgia.ttf", "DejaVuSerif-Bold.ttf", "Georgia Bold.ttf"]
    sans = ["segoeui.ttf", "arial.ttf", "DejaVuSans.ttf", "Arial.ttf"]
    d.rectangle([80, 96, 160, 103], fill=VERDE)
    d.text((80, 130), "Monte sua", font=fonte(serif, 92), fill=TINTA)
    d.text((80, 232), "carteira", font=fonte(serif, 92), fill=TINTA)
    d.text((80, 372), "Um roteiro guiado para dividir seus", font=fonte(sans, 34), fill=TINTA2)
    d.text((80, 418), "investimentos por classes.", font=fonte(sans, 34), fill=TINTA2)
    d.text((80, 500), "Educacional  \u00b7  gratuito  \u00b7  sem cadastro", font=fonte(sans, 28), fill=VERDE)
    rosca(img, 930, 300, 200, 112, PAPEL)
    for i in range(0, 25):  # regua decorativa na base
        x = 80 + i * 43.3
        d.line([x, 590, x, 590 - (16 if i % 4 == 0 else 8)], fill="#8E937F", width=2)
    d.line([80, 590, 1120, 590], fill="#8E937F", width=2)
    img.save(os.path.join(RAIZ, "og-image.png"), optimize=True)


if __name__ == "__main__":
    icone(192, "icon-192.png")
    icone(512, "icon-512.png")
    icone(180, "apple-touch-icon.png", cantos=False)
    icone(512, "icon-maskable-512.png", margem=0.24, cantos=False)
    previa()
    print("Imagens geradas.")

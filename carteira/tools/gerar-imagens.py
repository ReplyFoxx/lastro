"""Gera os icones do PWA e a imagem de previa (Open Graph).
Uso:  python tools/gerar-imagens.py     (precisa do Pillow: pip install pillow)
Identidade Cerne: tronco azul-marinho, cerne pessego, fundo branco.
O Pillow nao le a fonte do site (woff2); as imagens usam a Segoe UI do sistema.
"""
import os
from PIL import Image, ImageDraw, ImageFont

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BRANCO, TINTA, TINTA2, AMARELO, AZUL, CINZA = "#FFFFFF", "#172554", "#263B67", "#FFB38A", "#172554", "#7C89A6"
PASTAS = (r"C:\Windows\Fonts", "/usr/share/fonts/truetype/dejavu", "/Library/Fonts", "/System/Library/Fonts/Supplemental")


def fonte(nomes, tamanho):
    for n in nomes:
        for pasta in PASTAS:
            caminho = os.path.join(pasta, n)
            if os.path.exists(caminho):
                return ImageFont.truetype(caminho, tamanho)
    return ImageFont.load_default()


def tronco(img, cx, cy, raio, escala=4):
    """Desenha a marca (proporcoes do logotipo, viewBox 32) com suavizacao."""
    lado = int(raio * 2 * 16 / 13.4) + 4
    grande = Image.new("RGBA", (lado * escala, lado * escala), (0, 0, 0, 0))
    d = ImageDraw.Draw(grande)
    k = lado * escala / 32.0

    def anel(x, y, r):
        d.ellipse([(x - r) * k, (y - r) * k, (x + r) * k, (y + r) * k], outline=AZUL, width=max(1, int(2.4 * k)))

    anel(16, 16, 14.6)
    anel(14.4, 17.2, 9.2)
    d.ellipse([(12.9 - 3.3) * k, (18.4 - 3.3) * k, (12.9 + 3.3) * k, (18.4 + 3.3) * k], fill=AMARELO)
    pequeno = grande.resize((lado, lado), Image.LANCZOS)
    img.paste(pequeno, (cx - lado // 2, cy - lado // 2), pequeno)


def icone(tamanho, arquivo, margem=0.16, cantos=True):
    img = Image.new("RGBA", (tamanho, tamanho), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    if cantos:
        d.rounded_rectangle([0, 0, tamanho - 1, tamanho - 1], radius=int(tamanho * 0.22), fill=BRANCO)
    else:
        d.rectangle([0, 0, tamanho, tamanho], fill=BRANCO)
    tronco(img, tamanho // 2, tamanho // 2, int(tamanho * (0.5 - margem)))
    img.save(os.path.join(RAIZ, "icons", arquivo), optimize=True)


def previa():
    largura, altura = 1200, 630
    img = Image.new("RGB", (largura, altura), BRANCO)
    d = ImageDraw.Draw(img)
    preta = ["seguibl.ttf", "segoeuib.ttf", "arialbd.ttf", "DejaVuSans-Bold.ttf", "Arial Bold.ttf"]
    negrito = ["segoeuib.ttf", "arialbd.ttf", "DejaVuSans-Bold.ttf", "Arial Bold.ttf"]
    sans = ["segoeui.ttf", "arial.ttf", "DejaVuSans.ttf", "Arial.ttf"]
    d.rectangle([80, 92, 170, 104], fill=AMARELO)
    d.text((80, 124), "Monte sua", font=fonte(preta, 96), fill=TINTA)
    d.text((80, 232), "carteira", font=fonte(preta, 96), fill=TINTA)
    d.text((80, 384), "Um roteiro guiado para dividir seus", font=fonte(sans, 34), fill=TINTA2)
    d.text((80, 430), "investimentos por classes.", font=fonte(sans, 34), fill=TINTA2)
    d.text((80, 508), "Educacional  \u00b7  gratuito  \u00b7  sem cadastro", font=fonte(negrito, 28), fill=TINTA)
    tronco(img, 930, 300, 190)
    d.line([80, 590, 1120, 590], fill=CINZA, width=2)
    img.save(os.path.join(RAIZ, "og-image.png"), optimize=True)


if __name__ == "__main__":
    icone(192, "icon-192.png")
    icone(512, "icon-512.png")
    icone(180, "apple-touch-icon.png", cantos=False)
    icone(512, "icon-maskable-512.png", margem=0.24, cantos=False)
    previa()
    print("Imagens geradas.")

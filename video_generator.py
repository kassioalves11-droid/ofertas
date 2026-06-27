import os
import math
import random
import requests
import re

from gtts import gTTS
from moviepy.editor import *

from PIL import Image
from PIL import ImageDraw
from PIL import ImageFont
from PIL import ImageFilter
from PIL import ImageOps


print("VIDEO GENERATOR IA ULTRA V15 FINAL SELO LIMPO")


DURACAO_VIDEO = 12
LARGURA_VIDEO = 720
ALTURA_VIDEO = 1280

# Produto maior dentro do vídeo, mas ainda com margem segura
MAX_LARGURA_PRODUTO = 660
MAX_ALTURA_PRODUTO = 920


HOOKS_POR_CATEGORIA = {
    "eletrônicos": [
        "🔥 ESSE PRODUTO VIROU FEBRE",
        "⚡ TODO MUNDO ESTÁ COMPRANDO",
        "😱 VOCÊ PRECISA VER ISSO",
        "🚀 ACHADO TECNOLÓGICO"
    ],
    "eletronicos": [
        "🔥 ESSE PRODUTO VIROU FEBRE",
        "⚡ TODO MUNDO ESTÁ COMPRANDO",
        "😱 VOCÊ PRECISA VER ISSO",
        "🚀 ACHADO TECNOLÓGICO"
    ],
    "moda": [
        "🔥 VISUAL FORTE",
        "👕 TODO MUNDO QUER ISSO",
        "🚀 ACHADO DE MODA",
        "✨ OLHA ESSE ESTILO"
    ],
    "casa": [
        "🏠 ISSO FACILITA SUA VIDA",
        "🔥 ACHADO INCRÍVEL PARA CASA",
        "⚡ VOCÊ VAI USAR TODO DIA",
        "🚀 OLHA ESSA PRATICIDADE"
    ],
    "beleza": [
        "✨ PRODUTO QUE VIROU FEBRE",
        "🔥 TODO MUNDO ESTÁ USANDO",
        "💄 ACHADO DE BELEZA",
        "🚀 VOCÊ PRECISA TESTAR"
    ],
    "pet": [
        "🐶 SEU PET VAI AMAR",
        "🔥 TODO DONO DE PET PRECISA",
        "🚀 ACHADO PET VIRAL",
        "🐾 OLHA ISSO PARA SEU PET"
    ],
    "infantil": [
        "👶 PAIS ESTÃO GOSTANDO",
        "🔥 ACHADO INFANTIL",
        "🚀 OLHA ESSA OPÇÃO",
        "✨ PRODUTO ÚTIL PARA CRIANÇAS"
    ],
    "default": [
        "🔥 ACHADO DO MOMENTO",
        "😱 VOCÊ PRECISA VER ISSO",
        "⚡ TODO MUNDO ESTÁ COMPRANDO",
        "🚀 PRODUTO VIRAL",
        "🔥 CORRE ANTES QUE ACABE"
    ]
}


FALAS_POR_CATEGORIA = {
    "eletrônicos": [
        "Olha esse produto tecnológico que está chamando atenção.",
        "Esse achado está fazendo sucesso pelo custo benefício.",
        "Produto bonito, útil e com preço interessante.",
        "Esse item pode facilitar muito o seu dia."
    ],
    "eletronicos": [
        "Olha esse produto tecnológico que está chamando atenção.",
        "Esse achado está fazendo sucesso pelo custo benefício.",
        "Produto bonito, útil e com preço interessante.",
        "Esse item pode facilitar muito o seu dia."
    ],
    "moda": [
        "Esse item deixa o visual muito mais estiloso.",
        "Olha esse achado de moda que está chamando atenção.",
        "Uma opção bonita e com preço interessante.",
        "Esse produto combina com vários estilos."
    ],
    "casa": [
        "Isso facilita muito o dia a dia.",
        "Produto super útil para sua casa.",
        "Você vai usar isso todos os dias.",
        "Olha essa praticidade."
    ],
    "beleza": [
        "Produto de beleza que viralizou.",
        "Todo mundo está usando isso.",
        "Olha esse achado incrível.",
        "Isso está fazendo sucesso."
    ],
    "pet": [
        "Seu pet vai amar isso.",
        "Produto perfeito para cachorro e gato.",
        "Olha esse acessório para pets.",
        "Quem tem pet precisa disso."
    ],
    "infantil": [
        "Uma opção útil para o dia a dia.",
        "Esse produto pode ajudar bastante.",
        "Olha esse achado interessante.",
        "Uma escolha prática e com preço interessante."
    ],
    "default": [
        "Olha esse produto viral.",
        "Esse produto está fazendo muito sucesso.",
        "Corre antes que acabe a promoção.",
        "Melhor custo benefício do momento.",
        "Todo mundo está comprando isso.",
        "Vale muito a pena aproveitar."
    ]
}


CTA_POR_CATEGORIA = {
    "eletrônicos": [
        "🛒 GARANTA O SEU",
        "🔗 LINK NA BIO",
        "🔥 APROVEITE A OFERTA"
    ],
    "eletronicos": [
        "🛒 GARANTA O SEU",
        "🔗 LINK NA BIO",
        "🔥 APROVEITE A OFERTA"
    ],
    "moda": [
        "👕 VEJA ESSA OFERTA",
        "🔗 LINK NA BIO",
        "🔥 GARANTA O SEU"
    ],
    "casa": [
        "🏠 TENHA ISSO EM CASA",
        "🔗 LINK NA BIO",
        "🔥 APROVEITE A OFERTA"
    ],
    "beleza": [
        "✨ EXPERIMENTE HOJE",
        "🔗 LINK NA BIO",
        "🔥 GARANTA O SEU"
    ],
    "pet": [
        "🐶 SEU PET MERECE",
        "🔗 LINK NA BIO",
        "🔥 GARANTA AGORA"
    ],
    "infantil": [
        "👶 VEJA ESSA OPÇÃO",
        "🔗 LINK NA BIO",
        "🔥 APROVEITE"
    ],
    "default": [
        "🛒 COMPRE AGORA",
        "🔗 LINK NA BIO",
        "🔥 APROVEITE A OFERTA"
    ]
}


PALAVRAS_VIRAIS = [
    "led",
    "rgb",
    "viral",
    "promoção",
    "promo",
    "oferta",
    "kit",
    "smart",
    "premium",
    "pro",
    "gamer",
    "mini",
    "luxo",
    "viralizou",
    "sucesso"
]


fala_escolhida = ""


def calcular_score_viral(produto):

    score = 50

    titulo = produto.get("titulo", "").lower()
    categoria = produto.get("categoria", "default").lower()
    preco = str(produto.get("preco", "0"))

    imagens = [
        produto.get("imagem"),
        produto.get("imagem2"),
        produto.get("imagem3"),
        produto.get("imagem4")
    ]

    categorias_fortes = [
        "gamer",
        "pet",
        "fitness",
        "beleza",
        "casa",
        "eletrônicos",
        "eletronicos",
        "moda"
    ]

    if categoria in categorias_fortes:
        score += 15

    try:
        valor = float(
            preco
            .replace("R$", "")
            .replace(",", ".")
        )

        if valor <= 50:
            score += 15
        elif valor <= 120:
            score += 10
        elif valor <= 250:
            score += 5

    except:
        pass

    for palavra in PALAVRAS_VIRAIS:
        if palavra in titulo:
            score += 4

    qtd_imagens = len([
        i for i in imagens
        if i and str(i).strip()
    ])

    score += qtd_imagens * 3
    score = min(score, 100)

    print(f"SCORE VIRAL: {score}")

    return score


def escolher_selo_video(score_viral, produto):
    """
    Define o selo que será desenhado dentro do vídeo.
    Também respeita campo manual no Firebase, se existir:
    seloVideo: "🔥 EM ALTA"
    """

    selo_manual = produto.get("seloVideo", "")

    if selo_manual and str(selo_manual).strip():
        return str(selo_manual).strip()

    if produto.get("destaque") is True:
        return "MAIS VISTO"

    if score_viral >= 90:
        return "MAIS VISTO"

    if score_viral >= 80:
        return "EM ALTA"

    if score_viral >= 70:
        return "ACHADINHO"

    return "OFERTA"


def gerar_narracao(categoria="default"):

    global fala_escolhida

    categoria = categoria.lower().strip()

    frases = FALAS_POR_CATEGORIA.get(
        categoria,
        FALAS_POR_CATEGORIA["default"]
    )

    fala_escolhida = random.choice(frases)

    tts = gTTS(
        text=fala_escolhida,
        lang="pt-br"
    )

    caminho = "temp_voice.mp3"
    tts.save(caminho)

    return caminho


def listar_musicas():

    pasta = "musicas"

    extensoes = (
        ".mp3",
        ".wav",
        ".m4a",
        ".aac"
    )

    if not os.path.exists(pasta):
        return []

    musicas = []

    for arquivo in os.listdir(pasta):
        if arquivo.lower().endswith(extensoes):
            musicas.append(
                os.path.join(pasta, arquivo)
            )

    return musicas


def escolher_musica():

    musicas = listar_musicas()

    if not musicas:
        print("\nNenhuma música encontrada na pasta musicas.")
        return None

    musica = random.choice(musicas)

    print(f"\nMÚSICA ESCOLHIDA: {musica}")

    return musica


def ajustar_musica_para_duracao(caminho_musica, duracao):

    if not caminho_musica:
        return None

    musica_base = AudioFileClip(caminho_musica).volumex(0.20)

    if musica_base.duration <= 0:
        return None

    repeticoes = math.ceil(
        duracao / musica_base.duration
    )

    partes = []

    for _ in range(repeticoes):
        partes.append(musica_base)

    musica_loop = concatenate_audioclips(partes)

    musica_final = musica_loop.subclip(
        0,
        duracao
    )

    return musica_final


def limpar_nome_arquivo(texto):

    texto = texto.strip()
    texto = texto.replace(" ", "_")

    texto = re.sub(
        r"[^a-zA-Z0-9_\-]",
        "",
        texto
    )

    if not texto:
        texto = "produto_viral"

    return texto[:120]


def baixar_imagens_produto(imagens_produto):

    imagens_baixadas = []

    for i, img_url in enumerate(imagens_produto):

        caminho_img = img_url

        if img_url.startswith("http"):

            response = requests.get(
                img_url,
                timeout=20
            )

            caminho_img = f"temp_{i}.jpg"

            with open(caminho_img, "wb") as f:
                f.write(response.content)

        if os.path.exists(caminho_img):
            imagens_baixadas.append(caminho_img)

    return imagens_baixadas


def criar_fundo_blur(imagem_path):

    fundo_blur = Image.open(imagem_path).convert("RGB")

    fundo_blur = ImageOps.fit(
        fundo_blur,
        (LARGURA_VIDEO, ALTURA_VIDEO),
        method=Image.LANCZOS,
        centering=(0.5, 0.5)
    )

    fundo_blur = fundo_blur.filter(
        ImageFilter.GaussianBlur(18)
    )

    fundo_blur_path = "temp_blur.jpg"
    fundo_blur.save(fundo_blur_path)

    fundo = (
        ImageClip(fundo_blur_path)
        .set_duration(DURACAO_VIDEO)
        .resize((LARGURA_VIDEO, ALTURA_VIDEO))
    )

    return fundo


def preparar_imagem_produto(img_path):

    imagem_clip_base = ImageClip(img_path)

    escala = min(
        MAX_LARGURA_PRODUTO / imagem_clip_base.w,
        MAX_ALTURA_PRODUTO / imagem_clip_base.h
    )

    imagem_clip_base = imagem_clip_base.resize(escala)

    return imagem_clip_base


def carregar_fonte(tamanho):

    fontes = [
        "C:/Windows/Fonts/arialbd.ttf",
        "C:/Windows/Fonts/arial.ttf",
        "arialbd.ttf",
        "arial.ttf"
    ]

    for fonte in fontes:
        try:
            return ImageFont.truetype(fonte, tamanho)
        except:
            pass

    return ImageFont.load_default()


def quebrar_texto(texto, fonte, largura_maxima):

    palavras = texto.split()
    linhas = []
    linha_atual = ""

    img_temp = Image.new("RGBA", (10, 10))
    draw = ImageDraw.Draw(img_temp)

    for palavra in palavras:

        teste = (linha_atual + " " + palavra).strip()

        bbox = draw.textbbox(
            (0, 0),
            teste,
            font=fonte
        )

        largura = bbox[2] - bbox[0]

        if largura <= largura_maxima:
            linha_atual = teste
        else:
            if linha_atual:
                linhas.append(linha_atual)

            linha_atual = palavra

    if linha_atual:
        linhas.append(linha_atual)

    return linhas


def criar_selo_video(texto, caminho_saida="temp_selo.png"):

    img = Image.new(
        "RGBA",
        (LARGURA_VIDEO, ALTURA_VIDEO),
        (0, 0, 0, 0)
    )

    draw = ImageDraw.Draw(img)

    fonte = carregar_fonte(28)

    bbox = draw.textbbox(
        (0, 0),
        texto,
        font=fonte
    )

    largura_texto = bbox[2] - bbox[0]
    altura_texto = bbox[3] - bbox[1]

    padding_x = 22
    padding_y = 12

    x1 = 32
    y1 = 28
    x2 = x1 + largura_texto + (padding_x * 2)
    y2 = y1 + altura_texto + (padding_y * 2)

    # sombra
    draw.rounded_rectangle(
        (x1 + 5, y1 + 6, x2 + 5, y2 + 6),
        radius=24,
        fill=(0, 0, 0, 120)
    )

    # caixa dourada/laranja
    draw.rounded_rectangle(
        (x1, y1, x2, y2),
        radius=24,
        fill=(255, 193, 7, 245),
        outline=(255, 255, 255, 210),
        width=2
    )

    # pequeno detalhe de brilho
    draw.rounded_rectangle(
        (x1 + 8, y1 + 8, x2 - 8, y1 + 18),
        radius=10,
        fill=(255, 255, 255, 45)
    )

    draw.text(
        (x1 + padding_x + 2, y1 + padding_y + 2),
        texto,
        font=fonte,
        fill=(0, 0, 0, 90)
    )

    draw.text(
        (x1 + padding_x, y1 + padding_y),
        texto,
        font=fonte,
        fill=(17, 24, 39, 255)
    )

    img.save(caminho_saida)

    return caminho_saida


def criar_overlay_texto(textos, caminho_saida, tipo="hook"):

    img = Image.new(
        "RGBA",
        (LARGURA_VIDEO, ALTURA_VIDEO),
        (0, 0, 0, 0)
    )

    draw = ImageDraw.Draw(img)

    if tipo == "hook":
        fonte_titulo = carregar_fonte(52)
        fonte_sub = carregar_fonte(42)
        y_base = 155
        cor_box = (0, 0, 0, 175)
        cor_borda = (255, 200, 0, 235)

    else:
        fonte_titulo = carregar_fonte(48)
        fonte_sub = carregar_fonte(40)
        y_base = 900
        cor_box = (0, 0, 0, 185)
        cor_borda = (0, 198, 255, 235)

    margem_x = 45
    largura_box = LARGURA_VIDEO - (margem_x * 2)

    linhas_finais = []

    for i, texto in enumerate(textos):

        fonte = fonte_titulo if i == 0 else fonte_sub

        linhas = quebrar_texto(
            texto,
            fonte,
            largura_box - 50
        )

        for linha in linhas:
            linhas_finais.append((linha, fonte))

    altura_total = 0

    for linha, fonte in linhas_finais:

        bbox = draw.textbbox(
            (0, 0),
            linha,
            font=fonte
        )

        altura_total += (bbox[3] - bbox[1]) + 12

    altura_box = altura_total + 45

    x1 = margem_x
    y1 = y_base
    x2 = LARGURA_VIDEO - margem_x
    y2 = y_base + altura_box

    draw.rounded_rectangle(
        (x1, y1, x2, y2),
        radius=28,
        fill=cor_box,
        outline=cor_borda,
        width=3
    )

    y_texto = y1 + 24

    for linha, fonte in linhas_finais:

        bbox = draw.textbbox(
            (0, 0),
            linha,
            font=fonte
        )

        largura_texto = bbox[2] - bbox[0]
        altura_texto = bbox[3] - bbox[1]

        x_texto = (LARGURA_VIDEO - largura_texto) / 2

        draw.text(
            (x_texto + 3, y_texto + 3),
            linha,
            font=fonte,
            fill=(0, 0, 0, 210)
        )

        draw.text(
            (x_texto, y_texto),
            linha,
            font=fonte,
            fill=(255, 255, 255, 255)
        )

        y_texto += altura_texto + 14

    img.save(caminho_saida)

    return caminho_saida


def escolher_hook(categoria):

    categoria = categoria.lower().strip()

    lista = HOOKS_POR_CATEGORIA.get(
        categoria,
        HOOKS_POR_CATEGORIA["default"]
    )

    hook1 = random.choice(lista)

    hook2 = random.choice([
        "👇 VEJA ATÉ O FINAL",
        "⚡ OFERTA DISPONÍVEL",
        "🔥 LINK NA BIO",
        "😱 OLHA ESSE ACHADO"
    ])

    return [
        hook1,
        hook2
    ]


def escolher_cta(categoria):

    categoria = categoria.lower().strip()

    lista = CTA_POR_CATEGORIA.get(
        categoria,
        CTA_POR_CATEGORIA["default"]
    )

    cta1 = random.choice(lista)

    cta2 = random.choice([
        "🔗 LINK NA BIO",
        "🔥 APROVEITE AGORA",
        "👇 VEJA A OFERTA",
        "⚡ NÃO PERCA"
    ])

    return [
        cta1,
        cta2
    ]


def gerar_video(produto):

    titulo = produto.get(
        "titulo",
        "Produto Viral"
    )

    categoria = produto.get(
        "categoria",
        "default"
    )

    score_viral = calcular_score_viral(produto)
    selo_video = escolher_selo_video(score_viral, produto)

    print(f"\nGERANDO: {titulo}")
    print(f"SCORE: {score_viral}")
    print(f"SELO: {selo_video}")

    os.makedirs("videos", exist_ok=True)

    imagens_produto = [
        produto.get("imagem", ""),
        produto.get("imagem2", ""),
        produto.get("imagem3", ""),
        produto.get("imagem4", "")
    ]

    imagens_produto = [
        img for img in imagens_produto
        if img and img.strip()
    ]

    imagens_baixadas = baixar_imagens_produto(imagens_produto)

    if not imagens_baixadas:
        raise Exception("Nenhuma imagem válida encontrada")

    imagem_path = imagens_baixadas[0]

    fundo = criar_fundo_blur(imagem_path)

    qtd_imagens = len(imagens_baixadas)

    duracao_por_cena = DURACAO_VIDEO / qtd_imagens

    cenas = []

    for img_path in imagens_baixadas:

        imagem_clip_base = preparar_imagem_produto(img_path)

        movimento = random.randint(1, 3)

        if movimento == 1:

            imagem_clip = (
                imagem_clip_base
                .set_duration(duracao_por_cena)
                .set_position(("center", "center"))
            )

        elif movimento == 2:

            imagem_clip = (
                imagem_clip_base
                .set_duration(duracao_por_cena)
                .resize(
                    lambda t:
                    1 + (0.018 * (t / duracao_por_cena))
                )
                .set_position(("center", "center"))
            )

        else:

            imagem_clip = (
                imagem_clip_base
                .set_duration(duracao_por_cena)
                .set_position(
                    lambda t:
                    (
                        "center",
                        (ALTURA_VIDEO / 2) - (imagem_clip_base.h / 2) + math.sin(t * 2) * 4
                    )
                )
            )

        cena = CompositeVideoClip(
            [
                fundo,
                imagem_clip
            ],
            size=(LARGURA_VIDEO, ALTURA_VIDEO)
        ).set_duration(duracao_por_cena)

        cenas.append(cena)

    video_base = concatenate_videoclips(
        cenas,
        method="compose"
    ).set_duration(DURACAO_VIDEO)

    hook_textos = escolher_hook(categoria)
    cta_textos = escolher_cta(categoria)

    selo_path = criar_selo_video(
        selo_video,
        "temp_selo.png"
    )

    hook_path = criar_overlay_texto(
        hook_textos,
        "temp_hook.png",
        tipo="hook"
    )

    cta_path = criar_overlay_texto(
        cta_textos,
        "temp_cta.png",
        tipo="cta"
    )

    selo_clip = (
        ImageClip(
            selo_path,
            transparent=True
        )
        .set_start(0)
        .set_duration(DURACAO_VIDEO)
        .set_position(("left", "top"))
        .crossfadein(0.20)
    )

    hook_clip = (
        ImageClip(
            hook_path,
            transparent=True
        )
        .set_start(0.25)
        .set_duration(2.4)
        .set_position(("center", "center"))
        .crossfadein(0.25)
        .crossfadeout(0.25)
    )

    cta_clip = (
        ImageClip(
            cta_path,
            transparent=True
        )
        .set_start(9.0)
        .set_duration(3)
        .set_position(("center", "center"))
        .crossfadein(0.25)
        .crossfadeout(0.25)
    )

    video = CompositeVideoClip(
        [
            video_base,
            selo_clip,
            hook_clip,
            cta_clip
        ],
        size=(LARGURA_VIDEO, ALTURA_VIDEO)
    ).set_duration(DURACAO_VIDEO)

    voz_path = gerar_narracao(categoria)

    voz_audio = AudioFileClip(voz_path).volumex(1.8)

    if voz_audio.duration > DURACAO_VIDEO:
        voz_audio = voz_audio.subclip(
            0,
            DURACAO_VIDEO
        )

    caminho_musica = escolher_musica()

    musica_audio = ajustar_musica_para_duracao(
        caminho_musica,
        DURACAO_VIDEO
    )

    audios = []

    if musica_audio:
        audios.append(musica_audio)

    audios.append(voz_audio)

    audio_final = CompositeAudioClip(
        audios
    ).set_duration(DURACAO_VIDEO)

    video = video.set_audio(audio_final)

    nome_video = limpar_nome_arquivo(titulo)

    output = os.path.join(
        "videos",
        f"{nome_video}.mp4"
    )

    video.write_videofile(
        output,
        fps=30,
        codec="libx264",
        audio_codec="aac"
    )

    return output

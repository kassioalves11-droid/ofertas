import requests

from bs4 import BeautifulSoup


# =========================================
# CAPTURA PRODUTO
# =========================================

def capturar_produto(url):

    headers = {

        "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
    }


    # =====================================
    # ABRIR LINK + REDIRECIONAMENTO
    # =====================================

    session = requests.Session()

    response = session.get(

        url,

        headers=headers,

        timeout=10,

        allow_redirects=True
    )

    url_final = response.url

    print(f"\nURL FINAL: {url_final}")


    # =====================================
    # HTML
    # =====================================

    soup = BeautifulSoup(

        response.text,

        "html.parser"
    )


    # =====================================
    # TITULO
    # =====================================

    titulo = "Produto Viral"

    titulo_meta = soup.find(

        "meta",

        property="og:title"
    )

    if titulo_meta:

        titulo = titulo_meta.get(

            "content",

            titulo
        )


    # =====================================
    # IMAGEM
    # =====================================

    imagem = ""

    imagem_meta = soup.find(

        "meta",

        property="og:image"
    )

    if imagem_meta:

        imagem = imagem_meta.get(

            "content",

            ""
        )


    # =====================================
    # PRECO
    # =====================================

    preco = "0.00"

    preco_meta = soup.find(

        "meta",

        property="product:price:amount"
    )

    if preco_meta:

        preco = preco_meta.get(

            "content",

            "0.00"
        )


    # =====================================
    # CATEGORIA AUTOMATICA
    # =====================================

    categoria = "viral"

    titulo_lower = titulo.lower()


    if "gamer" in titulo_lower:

        categoria = "gamer"


    elif "smartwatch" in titulo_lower or \
         "relogio" in titulo_lower:

        categoria = "relogios"


    elif "fone" in titulo_lower:

        categoria = "audio"


    elif "beleza" in titulo_lower:

        categoria = "beleza"


    elif "iphone" in titulo_lower or \
         "celular" in titulo_lower:

        categoria = "tecnologia"


    # =====================================
    # RESULTADO
    # =====================================

    produto = {

        "titulo": titulo,

        "imagem": imagem,

        "preco": preco,

        "categoria": categoria,

        "link": url_final
    }


    return produto


# =========================================
# TESTE RAPIDO
# =========================================

if __name__ == "__main__":

    url = input(

        "Cole o link do produto: "
    )

    produto = capturar_produto(url)

    print("\nDADOS CAPTURADOS:\n")

    print(produto)
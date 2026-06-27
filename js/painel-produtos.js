import {
    db
} from "./firebase-config.js";

import {
    collection,
    addDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


const produtosRef = collection(db, "produtos");

const URL_SITE = "https://kassioalves11-droid.github.io/ofertas/";

const produtosDiv = document.getElementById("produtos");
const logsDiv = document.getElementById("logs");
const buscaInput = document.getElementById("busca-produto");

const btnSalvar = document.getElementById("btn-salvar");
const btnAuto = document.getElementById("btn-auto");
const btnCapturarLink = document.getElementById("btn-capturar-link");
const btnLimpar = document.getElementById("btn-limpar");
const btnGerarCopy = document.getElementById("btn-gerar-copy");

const campoTitulo = document.getElementById("titulo-produto");
const campoPreco = document.getElementById("preco-produto");
const campoCategoria = document.getElementById("categoria-produto");
const campoLink = document.getElementById("link-produto");
const campoImagem = document.getElementById("imagem-produto");
const campoImagem2 = document.getElementById("imagem2-produto");
const campoImagem3 = document.getElementById("imagem3-produto");
const campoImagem4 = document.getElementById("imagem4-produto");

const previewImagem = document.getElementById("preview-imagem");
const previewImagem2 = document.getElementById("preview-imagem2");
const previewImagem3 = document.getElementById("preview-imagem3");
const previewImagem4 = document.getElementById("preview-imagem4");

let produtosLista = [];
let filtroAtual = "todos";
let editandoId = null;


function log(msg) {
    const item = document.createElement("div");
    item.innerHTML = msg;
    logsDiv.prepend(item);
}


function copiarTexto(texto) {
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(texto)
            .then(() => {
                log("Link do vídeo copiado!");
            })
            .catch(() => {
                copiarTextoManual(texto);
            });
    } else {
        copiarTextoManual(texto);
    }
}


function copiarTextoManual(texto) {
    const input = document.createElement("input");
    input.value = texto;
    document.body.appendChild(input);
    input.select();
    document.execCommand("copy");
    document.body.removeChild(input);

    log("Link do vídeo copiado!");
}


function gerarScore(produto) {
    let score = 40;

    if ((produto.titulo || "").length > 40) score += 10;
    if (produto.imagem) score += 15;
    if (produto.categoria) score += 10;
    if (produto.status === "video_pronto") score += 20;
    if (produto.preco) score += 5;

    if (score > 100) score = 100;

    return score;
}


function atualizarDashboard() {
    document.getElementById("dash-total").innerText = produtosLista.length;

    document.getElementById("dash-fila").innerText = produtosLista.filter(
        p => p.status === "fila_video"
    ).length;

    document.getElementById("dash-gerando").innerText = produtosLista.filter(
        p => p.status === "gerando_video"
    ).length;

    document.getElementById("dash-prontos").innerText = produtosLista.filter(
        p => p.status === "video_pronto"
    ).length;

    document.getElementById("dash-erro").innerText = produtosLista.filter(
        p => p.status === "erro" || p.status === "erro_render"
    ).length;
}


function atualizarAnalytics() {
    if (produtosLista.length === 0) {
        document.getElementById("analytics-score").innerText = "0%";
        document.getElementById("analytics-categoria").innerText = "---";
        document.getElementById("analytics-videos").innerText = "0";
        document.getElementById("analytics-virais").innerText = "0";

        renderRanking();

        return;
    }

    let soma = 0;
    let videos = 0;
    let virais = 0;
    const categorias = {};

    produtosLista.forEach(produto => {
        const score = gerarScore(produto);
        soma += score;

        if (score >= 80) virais++;
        if (produto.status === "video_pronto") videos++;

        const cat = produto.categoria || "Outros";
        categorias[cat] = (categorias[cat] || 0) + 1;
    });

    const media = Math.round(soma / produtosLista.length);

    let topCategoria = "---";
    let maior = 0;

    Object.entries(categorias).forEach(([cat, total]) => {
        if (total > maior) {
            maior = total;
            topCategoria = cat;
        }
    });

    document.getElementById("analytics-score").innerText = media + "%";
    document.getElementById("analytics-categoria").innerText = topCategoria;
    document.getElementById("analytics-videos").innerText = videos;
    document.getElementById("analytics-virais").innerText = virais;

    renderRanking();
}


function renderRanking() {
    const rankingDiv = document.getElementById("ranking-produtos");

    if (!rankingDiv) return;

    rankingDiv.innerHTML = "";

    const ranking = [...produtosLista]
        .sort((a, b) => gerarScore(b) - gerarScore(a))
        .slice(0, 5);

    if (ranking.length === 0) {
        rankingDiv.innerHTML = `
            <div class="ranking-item">
                <div class="ranking-info">
                    <div class="ranking-titulo">
                        Nenhum produto cadastrado ainda
                    </div>
                </div>
            </div>
        `;

        return;
    }

    ranking.forEach((produto, index) => {
        const score = gerarScore(produto);

        const item = document.createElement("div");
        item.className = "ranking-item";

        item.innerHTML = `
            <div class="ranking-info">
                <div class="ranking-titulo">
                    #${index + 1} - ${produto.titulo || "Produto"}
                </div>

                <div class="ranking-score">
                    🔥 Score Viral: ${score}%
                </div>
            </div>

            <button
                class="btn-video"
                onclick="gerarVideo('${produto.id}')"
            >
                Gerar Vídeo
            </button>
        `;

        rankingDiv.appendChild(item);
    });
}


const camposRascunho = [
    "titulo-produto",
    "preco-produto",
    "categoria-produto",
    "link-produto",
    "imagem-produto",
    "imagem2-produto",
    "imagem3-produto",
    "imagem4-produto"
];

function salvarRascunho() {
    const rascunho = {};

    camposRascunho.forEach(id => {
        const campo = document.getElementById(id);

        if (campo) {
            rascunho[id] = campo.value;
        }
    });

    localStorage.setItem(
        "rascunhoProduto",
        JSON.stringify(rascunho)
    );
}

function carregarRascunho() {
    const salvo = localStorage.getItem("rascunhoProduto");

    if (!salvo) return;

    const rascunho = JSON.parse(salvo);

    camposRascunho.forEach(id => {
        const campo = document.getElementById(id);

        if (campo && rascunho[id]) {
            campo.value = rascunho[id];
        }
    });

    atualizarPreviewImagem();
    atualizarCategoriaAutomatica();
}

function limparRascunho() {
    localStorage.removeItem("rascunhoProduto");
}

camposRascunho.forEach(id => {
    const campo = document.getElementById(id);

    if (campo) {
        campo.addEventListener("input", salvarRascunho);
    }
});


function atualizarPreviewImagem() {
    const previews = [
        {
            campo: campoImagem,
            img: previewImagem
        },
        {
            campo: campoImagem2,
            img: previewImagem2
        },
        {
            campo: campoImagem3,
            img: previewImagem3
        },
        {
            campo: campoImagem4,
            img: previewImagem4
        }
    ];

    previews.forEach(item => {
        if (!item.campo || !item.img) return;

        const url = item.campo.value.trim();

        if (!url) {
            item.img.style.display = "none";
            item.img.src = "";
            return;
        }

        item.img.src = url;
        item.img.style.display = "block";
    });
}

[
    campoImagem,
    campoImagem2,
    campoImagem3,
    campoImagem4
].forEach(campo => {
    if (campo) {
        campo.addEventListener("input", atualizarPreviewImagem);
    }
});


function sugerirCategoria(titulo, link) {
    const texto = (titulo + " " + link).toLowerCase();

    if (
        texto.includes("fone") ||
        texto.includes("bluetooth") ||
        texto.includes("smartwatch") ||
        texto.includes("usb") ||
        texto.includes("carregador") ||
        texto.includes("celular") ||
        texto.includes("gamer") ||
        texto.includes("caixa de som") ||
        texto.includes("speaker")
    ) {
        return "Eletrônicos";
    }

    if (
        texto.includes("blusa") ||
        texto.includes("camisa") ||
        texto.includes("roupa") ||
        texto.includes("tênis") ||
        texto.includes("tenis") ||
        texto.includes("bolsa") ||
        texto.includes("calça") ||
        texto.includes("vestido") ||
        texto.includes("moda")
    ) {
        return "Moda";
    }

    if (
        texto.includes("panela") ||
        texto.includes("cozinha") ||
        texto.includes("casa") ||
        texto.includes("organizador") ||
        texto.includes("limpeza") ||
        texto.includes("tapete") ||
        texto.includes("utensílio") ||
        texto.includes("utensilio")
    ) {
        return "Casa";
    }

    if (
        texto.includes("maquiagem") ||
        texto.includes("beleza") ||
        texto.includes("perfume") ||
        texto.includes("cabelo") ||
        texto.includes("creme") ||
        texto.includes("skin care") ||
        texto.includes("skincare")
    ) {
        return "Beleza";
    }

    if (
        texto.includes("brinquedo") ||
        texto.includes("infantil") ||
        texto.includes("criança") ||
        texto.includes("crianca") ||
        texto.includes("bebê") ||
        texto.includes("bebe")
    ) {
        return "Infantil";
    }

    if (
        texto.includes("pet") ||
        texto.includes("cachorro") ||
        texto.includes("gato") ||
        texto.includes("animal")
    ) {
        return "Pet";
    }

    return "";
}

function atualizarCategoriaAutomatica() {
    if (!campoTitulo || !campoCategoria) return;

    const titulo = campoTitulo.value.trim();
    const link = campoLink ? campoLink.value.trim() : "";

    if (!titulo && !link) {
        campoCategoria.value = "";
        salvarRascunho();
        return;
    }

    const categoriaSugerida = sugerirCategoria(titulo, link);

    campoCategoria.value = categoriaSugerida;

    salvarRascunho();
}

if (campoTitulo) {
    campoTitulo.addEventListener("input", atualizarCategoriaAutomatica);
}

if (campoLink) {
    campoLink.addEventListener("input", atualizarCategoriaAutomatica);
}


async function carregarProdutos() {
    produtosDiv.innerHTML = "";
    produtosLista = [];

    const snapshot = await getDocs(produtosRef);

    snapshot.forEach((docSnap) => {
        produtosLista.push({
            id: docSnap.id,
            ...docSnap.data()
        });
    });

    renderizarProdutos(produtosLista);
    atualizarDashboard();
    atualizarAnalytics();
}


function criarMidiaProduto(produto, imagem) {
    let video = produto.videoUrl || produto.video || "";

    if (video) {
        video = video + "?v=" + Date.now();

        return `
            <div class="produto-video-wrapper">
                <video
                    class="produto-video"
                    controls
                    preload="metadata"
                    poster="${imagem}"
                >
                    <source
                        src="${video}"
                        type="video/mp4"
                    >
                    Seu navegador não suporta vídeo.
                </video>
            </div>
        `;
    }

    return `
        <img
            src="${imagem}"
            class="produto-img"
        >
    `;
}


function renderizarProdutos(lista) {
    produtosDiv.innerHTML = "";

    lista.forEach(produto => {
        const card = document.createElement("div");
        card.className = "produto-card";

        const status = produto.status || "novo";

        let badgeClass = "badge-novo";

        if (status === "fila_video") badgeClass = "badge-fila";
        else if (status === "gerando_video") badgeClass = "badge-gerando";
        else if (status === "video_pronto") badgeClass = "badge-pronto";
        else if (status === "erro" || status === "erro_render") badgeClass = "badge-erro";

        const imagem = produto.imagem ||
            "https://via.placeholder.com/300x300?text=SEM+IMAGEM";

        const score = gerarScore(produto);

        const textoDestaque = produto.destaque
            ? "⭐ Remover Destaque"
            : "⭐ Destacar";

        const corDestaque = produto.destaque
            ? "linear-gradient(135deg,#f59e0b,#d97706)"
            : "linear-gradient(135deg,#334155,#1e293b)";

        const badgeDestaque = produto.destaque
            ? `
                <div style="
                    display:inline-block;
                    margin-bottom:10px;
                    padding:7px 12px;
                    border-radius:999px;
                    background:linear-gradient(135deg,#facc15,#f97316);
                    color:#111827;
                    font-size:12px;
                    font-weight:bold;
                ">
                    ⭐ Produto dos vídeos
                </div>
            `
            : "";

        const badgeVideo = (produto.videoUrl || produto.video)
            ? `
                <div style="
                    display:inline-block;
                    margin-bottom:10px;
                    margin-left:6px;
                    padding:7px 12px;
                    border-radius:999px;
                    background:linear-gradient(135deg,#38bdf8,#2563eb);
                    color:white;
                    font-size:12px;
                    font-weight:bold;
                ">
                    ▶ Vídeo pronto
                </div>
            `
            : "";

        const midiaProduto = criarMidiaProduto(produto, imagem);

        card.innerHTML = `
            ${midiaProduto}

            <div class="produto-info">

                ${badgeDestaque}
                ${badgeVideo}

                <div class="${badgeClass}">
                    ${status}
                </div>

                <h3>
                    ${produto.titulo || "Sem título"}
                </h3>

                <p class="produto-preco">
                    ${produto.preco || "R$ 0,00"}
                </p>

                <p class="produto-categoria">
                    ${produto.categoria || "Sem categoria"}
                </p>

                <div class="score-bar">
                    <div
                        class="score-fill"
                        style="width:${score}%"
                    ></div>
                </div>

                <p style="
                    margin-bottom:15px;
                    font-weight:bold;
                    color:#facc15;
                ">
                    🔥 Score Viral: ${score}%
                </p>

                <div class="produto-botoes">

                    <button
                        class="btn-video"
                        onclick="gerarVideo('${produto.id}')"
                    >
                        Gerar Vídeo
                    </button>

                    <button
                        class="btn-editar"
                        onclick="editarProduto('${produto.id}')"
                    >
                        Editar
                    </button>

                    <button
                        onclick="toggleDestaque('${produto.id}')"
                        style="
                            background:${corDestaque};
                            color:white;
                            border:none;
                            padding:10px 12px;
                            border-radius:10px;
                            cursor:pointer;
                            font-weight:bold;
                        "
                    >
                        ${textoDestaque}
                    </button>

                    <button
                        onclick="copiarLinkVideo('${produto.id}')"
                        style="
                            background:linear-gradient(135deg,#0ea5e9,#2563eb);
                            color:white;
                            border:none;
                            padding:10px 12px;
                            border-radius:10px;
                            cursor:pointer;
                            font-weight:bold;
                        "
                    >
                        🔗 Copiar Link Vídeo
                    </button>

                    <button
                        class="btn-delete"
                        onclick="excluirProduto('${produto.id}')"
                    >
                        Excluir
                    </button>

                </div>

            </div>
        `;

        produtosDiv.appendChild(card);
    });
}


btnSalvar.addEventListener("click", async () => {
    const titulo = document.getElementById("titulo-produto").value;
    const preco = document.getElementById("preco-produto").value;
    const categoria = document.getElementById("categoria-produto").value;
    const link = document.getElementById("link-produto").value;
    const imagem = document.getElementById("imagem-produto").value;
    const imagem2 = document.getElementById("imagem2-produto").value;
    const imagem3 = document.getElementById("imagem3-produto").value;
    const imagem4 = document.getElementById("imagem4-produto").value;

    if (editandoId) {
        await updateDoc(
            doc(db, "produtos", editandoId),
            {
                titulo,
                preco,
                categoria,
                link,
                imagem,
                imagem2,
                imagem3,
                imagem4
            }
        );

        log("Produto atualizado");

        editandoId = null;
        btnSalvar.innerText = "Salvar Produto";
    } else {
        const dadosProduto = {
            titulo,
            preco,
            categoria,
            link,
            imagem,
            imagem2,
            imagem3,
            imagem4,
            status: "novo",
            destaque: false
        };

        await addDoc(produtosRef, dadosProduto);

        log("Produto salvo");
    }

    limparFormulario();
    limparRascunho();
    carregarProdutos();
});


function limparFormulario() {
    document.getElementById("titulo-produto").value = "";
    document.getElementById("preco-produto").value = "";
    document.getElementById("categoria-produto").value = "";
    document.getElementById("link-produto").value = "";
    document.getElementById("imagem-produto").value = "";
    document.getElementById("imagem2-produto").value = "";
    document.getElementById("imagem3-produto").value = "";
    document.getElementById("imagem4-produto").value = "";

    atualizarPreviewImagem();
}


if (btnLimpar) {
    btnLimpar.addEventListener("click", () => {
        limparFormulario();
        limparRascunho();
        atualizarPreviewImagem();

        editandoId = null;
        btnSalvar.innerText = "Salvar Produto";

        log("Cadastro limpo.");
    });
}


if (btnCapturarLink) {
    btnCapturarLink.addEventListener("click", () => {
        const link = prompt("Cole o link Shopee / Mercado Livre:");

        if (!link) return;

        document.getElementById("link-produto").value = link;

        atualizarCategoriaAutomatica();
        salvarRascunho();

        window.open(link, "_blank");

        log("Produto aberto em nova aba. Complete os campos normalmente.");
    });
}


window.editarProduto = async (id) => {
    const produto = produtosLista.find(p => p.id === id);

    if (!produto) return;

    editandoId = id;

    document.getElementById("titulo-produto").value = produto.titulo || "";
    document.getElementById("preco-produto").value = produto.preco || "";
    document.getElementById("categoria-produto").value = produto.categoria || "";
    document.getElementById("link-produto").value = produto.link || "";
    document.getElementById("imagem-produto").value = produto.imagem || "";
    document.getElementById("imagem2-produto").value = produto.imagem2 || "";
    document.getElementById("imagem3-produto").value = produto.imagem3 || "";
    document.getElementById("imagem4-produto").value = produto.imagem4 || "";

    btnSalvar.innerText = "Atualizar Produto";

    salvarRascunho();
    atualizarPreviewImagem();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

    log("Modo edição ativado");
};


window.toggleDestaque = async (id) => {
    const produto = produtosLista.find(p => p.id === id);

    if (!produto) return;

    try {
        await updateDoc(
            doc(db, "produtos", id),
            {
                destaque: !produto.destaque
            }
        );

        log(
            produto.destaque
                ? "Destaque removido."
                : "Produto destacado."
        );

        carregarProdutos();
    } catch (e) {
        console.error(e);
        log("Erro ao alterar destaque.");
    }
};


window.copiarLinkVideo = (id) => {
    const linkVideo = `${URL_SITE}?produto=${id}`;

    copiarTexto(linkVideo);
};


window.excluirProduto = async (id) => {
    if (!confirm("Excluir produto?")) return;

    await deleteDoc(
        doc(db, "produtos", id)
    );

    log("Produto excluído");

    carregarProdutos();
};


window.gerarVideo = async (id) => {
    const produto = produtosLista.find(p => p.id === id);

    if (!produto) return;

    try {
        log(`Produto enviado para fila de vídeo: ${produto.titulo}`);

        await updateDoc(
            doc(db, "produtos", id),
            {
                status: "fila_video"
            }
        );

        carregarProdutos();

    } catch (e) {
        console.error(e);

        await updateDoc(
            doc(db, "produtos", id),
            {
                status: "erro"
            }
        );

        log("Erro ao enviar produto para fila");
    }

    carregarProdutos();
};


btnAuto.addEventListener("click", async () => {
    for (const produto of produtosLista) {
        await gerarVideo(produto.id);
    }
});


buscaInput.addEventListener("input", () => {
    const termo = buscaInput.value.toLowerCase();

    const filtrados = produtosLista.filter(
        p => (p.titulo || "").toLowerCase().includes(termo)
    );

    renderizarProdutos(filtrados);
});


document.querySelectorAll(".filtro-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        filtroAtual = btn.dataset.status;

        if (filtroAtual === "todos") {
            renderizarProdutos(produtosLista);
            return;
        }

        const filtrados = produtosLista.filter(
            p => p.status === filtroAtual
        );

        renderizarProdutos(filtrados);
    });
});


if (btnGerarCopy) {
    btnGerarCopy.addEventListener("click", () => {
        const titulo = campoTitulo.value.trim();
        const categoria = campoCategoria.value.trim();
        const preco = campoPreco.value.trim();

        if (!titulo) {
            alert("Preencha o título do produto.");
            return;
        }

        let hook = "";
        let legenda = "";
        let cta = "👉 Link na bio";
        let hashtags = "#achadinhos #ofertas";
        let botao = "🔥 Ver Oferta";
        let cena = "";

        if (categoria === "Eletrônicos") {
            hook = "Parece premium 😳";
            legenda = `${titulo} com visual bonito, funções úteis e preço interessante ${preco}. Veja na bio.`;
            hashtags = "#achadinhos #eletronicos #gadgets #ofertas #shopee";
            cena = "⌚ Mostrar detalhe + zoom rápido.";
        }

        else if (categoria === "Moda") {
            hook = "Visual forte 🔥";
            legenda = `${titulo} com estilo bonito e preço interessante. Veja na bio.`;
            hashtags = "#moda #look #achadinhos #ofertas #tendencia";
            cena = "👕 Mostrar look completo + giro rápido.";
        }

        else if (categoria === "Beleza") {
            hook = "Virou queridinho ✨";
            legenda = `${titulo} com ótimo custo-benefício. Confira na bio.`;
            hashtags = "#beleza #skincare #achadinhos #ofertas #cuidados";
            cena = "✨ Mostrar aplicação / resultado.";
        }

        else if (categoria === "Casa") {
            hook = "Facilita muito 🔥";
            legenda = `${titulo} é uma utilidade simples que pode ajudar no dia a dia. Veja na bio.`;
            hashtags = "#casa #utilidades #achadinhos #organizacao #ofertas";
            cena = "🏠 Mostrar uso real no dia a dia.";
        }

        else if (categoria === "Pet") {
            hook = "Pet aprovado 🐶";
            legenda = `${titulo} pode ajudar quem tem pet em casa. Veja na bio.`;
            hashtags = "#pet #achadinhos #cachorro #gato #ofertas";
            cena = "🐶 Mostrar reação do pet.";
        }

        else if (categoria === "Infantil") {
            hook = "Pais estão gostando 👶";
            legenda = `${titulo} é uma opção útil e com preço interessante. Confira na bio.`;
            hashtags = "#infantil #bebe #criancas #achadinhos #ofertas";
            cena = "👶 Mostrar uso real / interação.";
        }

        else {
            hook = "Achadinho bom 🔥";
            legenda = `${titulo} disponível na nossa página de achadinhos. Veja na bio.`;
            hashtags = "#achadinhos #ofertas #promocao";
            cena = "🎬 Mostrar o produto em destaque + zoom rápido.";
        }

        document.getElementById("copy-hook").value = hook;
        document.getElementById("copy-legenda").value = legenda;
        document.getElementById("copy-cta").value = cta;
        document.getElementById("copy-hashtags").value = hashtags;
        document.getElementById("copy-botao").value = botao;

        const campoCena = document.getElementById("copy-cena");

        if (campoCena) {
            campoCena.value = cena;
        }

        log("Copy curta + cena gerada.");
    });
}


carregarRascunho();
atualizarPreviewImagem();
atualizarCategoriaAutomatica();
carregarProdutos();
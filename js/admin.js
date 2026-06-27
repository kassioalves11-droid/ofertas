import { db } from "./firebase-config.js"

import {

  collection,
  getDocs,
  addDoc

}

from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js"


// ========================================
// ELEMENTOS
// ========================================

const statusText = document.getElementById(
  "status-text"
)

const btnStart = document.getElementById(
  "btn-start"
)

const btnStop = document.getElementById(
  "btn-stop"
)

const btnSave = document.getElementById(
  "btn-save"
)

const nichoInput = document.getElementById(
  "nicho"
)

const videosInput = document.getElementById(
  "videos"
)


// ========================================
// STATUS
// ========================================

let automacaoLigada = true


function atualizarStatus() {

  statusText.innerText = automacaoLigada

    ? "Automação Ligada"

    : "Automação Parada"
}


btnStart.addEventListener("click", () => {

  automacaoLigada = true

  atualizarStatus()
})


btnStop.addEventListener("click", () => {

  automacaoLigada = false

  atualizarStatus()
})


atualizarStatus()


// ========================================
// GERAR PRODUTOS TESTE
// ========================================

btnSave.addEventListener("click", async () => {

  const nicho = nichoInput.value

  const quantidade = Number(
    videosInput.value
  )


  if (!nicho || !quantidade) {

    alert("Preencha os campos")

    return
  }


  for (let i = 1; i <= quantidade; i++) {

    await addDoc(

      collection(db, "produtos"),

      {

        titulo:

          `${nicho} ${i}`,

        preco:

          (Math.random() * 300 + 50)
          .toFixed(2),

        imagem:

          "https://picsum.photos/500/800",

        status:

          "fila_video"
      }
    )
  }


  alert("Produtos enviados!")

  atualizarPainel()
})


// ========================================
// CACHE HTML
// ========================================

let ultimoHTML = ""


// ========================================
// LISTAR PRODUTOS
// ========================================

async function carregarProdutos() {

  const lista = document.getElementById(
    "listaProdutos"
  )

  if (!lista) return


  const snapshot = await getDocs(

    collection(db, "produtos")
  )


  let html = ""


  snapshot.forEach(docItem => {

    const produto = docItem.data()


    html += `

      <div style="
        border:1px solid #333;
        border-radius:12px;
        padding:15px;
        margin-top:15px;
        background:#111;
      ">

        <h3 style="
          color:white;
        ">
          ${produto.titulo || ""}
        </h3>


        <p style="
          color:#aaa;
        ">
          Preço: R$ ${produto.preco || ""}
        </p>


        <p style="
          color:#00ff88;
        ">
          Status: ${produto.status || ""}
        </p>


        ${produto.imagem ? `

          <img
            src="${produto.imagem}"
            width="200"

            style="
              border-radius:10px;
              margin-top:10px;
              display:block;
            "
          >

        ` : ""}


        ${produto.video ? `

          <video
            controls
            width="250"

            style="
              margin-top:15px;
              border-radius:12px;
              display:block;
            "
          >

            <source
              src="${produto.video}"
              type="video/mp4"
            >

          </video>

        ` : ""}

      </div>

    `
  })


  // ======================================
  // ATUALIZA SOMENTE SE MUDAR
  // ======================================

  if (html !== ultimoHTML) {

    lista.innerHTML = html

    ultimoHTML = html
  }
}


// ========================================
// AUTO UPDATE
// ========================================

let carregando = false


async function atualizarPainel() {

  if (carregando) return

  carregando = true

  await carregarProdutos()

  carregando = false
}


setInterval(() => {

  atualizarPainel()

}, 15000)


atualizarPainel()
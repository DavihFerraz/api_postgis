const apiUrl = "http://localhost:8000/locais";
let idEdicao = null;

async function cadastrarLocal() {
  const nome = document.getElementById("nome").value;
  const latitude = parseFloat(document.getElementById("latitude").value);
  const longitude = parseFloat(document.getElementById("longitude").value);
  const erro = document.getElementById("erro");
  erro.textContent = "";

  try {
    const resposta = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ nome, latitude, longitude })
    });

    if (!resposta.ok) throw new Error("Erro ao cadastrar local");

    document.getElementById("nome").value = "";
    document.getElementById("latitude").value = "";
    document.getElementById("longitude").value = "";
    carregarLocais();
  } catch (e) {
    erro.textContent = "Erro de conexão com o backend.";
    console.error(e);
  }
}

async function carregarLocais() {
  const lista = document.getElementById("lista-locais");
  const erro = document.getElementById("erro");
  lista.innerHTML = "";
  erro.textContent = "";

  try {
    const resposta = await fetch(apiUrl);
    if (!resposta.ok) throw new Error("Erro ao buscar locais");
    const locais = await resposta.json();

    if (locais.length === 0) {
      lista.innerHTML = "<li>Nenhum local cadastrado.</li>";
    } else {
      locais.forEach(local => {
        const item = document.createElement("li");
        item.innerHTML = `
          ID: ${local.id} | Nome: ${local.nome}
          <button onclick="abrirModal(${local.id}, '${local.nome}')" >Editar</button>
          <button onclick="deletarLocal(${local.id})" class="excluir-btn">Excluir</button>
        `;
        lista.appendChild(item);
      });
    }
  } catch (e) {
    erro.textContent = "Erro ao se conectar com o backend.";
    console.error(e);
  }
}

function abrirModal(id, nome) {
  idEdicao = id;
  document.getElementById("editar-nome").value = nome;
  document.getElementById("editar-modal").style.display = "flex";
}

function fecharModal() {
  document.getElementById("editar-modal").style.display = "none";
  idEdicao = null;
}

async function salvarEdicao() {
  const nome = document.getElementById("editar-nome").value;
  const latitude = parseFloat(document.getElementById("editar-latitude").value);
  const longitude = parseFloat(document.getElementById("editar-longitude").value);

  try {
    const resposta = await fetch(`${apiUrl}/${idEdicao}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, latitude, longitude })
    });

    if (!resposta.ok) throw new Error("Erro ao editar");
    fecharModal();
    carregarLocais();
  } catch (e) {
    alert("Erro ao editar local.");
    console.error(e);
  }
}

async function deletarLocal(id) {
  if (!confirm("Tem certeza que deseja excluir este local?")) return;

  try {
    const resposta = await fetch(`${apiUrl}/${id}`, {
      method: "DELETE"
    });

    if (!resposta.ok) throw new Error("Erro ao deletar");
    carregarLocais();
  } catch (e) {
    alert("Erro ao excluir local.");
    console.error(e);
  }
}

carregarLocais();

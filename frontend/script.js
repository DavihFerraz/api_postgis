const apiUrl = "http://localhost:8000/locais";
let idEdicao = null;

let mapa = L.map('map').setView([-25.4284, -49.2733], 13); // Curitiba como centro
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
}).addTo(mapa);

let marcadores = [];


async function cadastrarLocal() {
  const nome = document.getElementById("nome").value;
  const latitude = parseFloat(document.getElementById("latitude").value);
  const longitude = parseFloat(document.getElementById("longitude").value);
  const obs = document.getElementById("obs").value;
  const erro = document.getElementById("erro");
  erro.textContent = "";

  try {
    const resposta = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ nome, latitude, longitude, obs})
    });

    if (!resposta.ok) throw new Error("Erro ao cadastrar local");

    document.getElementById("nome").value = "";
    document.getElementById("latitude").value = "";
    document.getElementById("longitude").value = "";
    document.getElementById("obs").value = "";
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
          ID: ${local.id} | Nome: ${local.nome} - ${local.obs}
          <button onclick="abrirModal(${local.id}, '${local.nome}', ${local.latitude}, ${local.longitude}, '${local.obs}')" >Editar</button>
          <button onclick="editarObs('${local.id}')" class="editar-obs-btn" >Editar Obs</button>
          <button onclick="deletarLocal(${local.id})" class="excluir-btn">Excluir</button>
        `;
        lista.appendChild(item);

        const marcador = L.marker([local.latitude, local.longitude])
          .addTo(mapa)
          .bindPopup(`<strong>${local.nome}</strong><br>${local.obs}`);
  
        marcadores.push(marcador);
      });
    }
  } catch (e) {
    erro.textContent = "Erro ao se conectar com o backend.";
    console.error(e);
  }
}

function limparMarcadores() {
  marcadores.forEach(m => mapa.removeLayer(m));
  marcadores = [];
}


function abrirModal(id, nome, latitude = "", longitude = "", obs = "") {
  idEdicao = id;
  document.getElementById("editar-nome").value = nome;
  document.getElementById("editar-latitude").value = latitude;
  document.getElementById("editar-longitude").value = longitude;
  document.getElementById("editar-obs").value = obs;
  document.getElementById("editar-modal").style.display = "flex";
}

function fecharModal() {
  document.getElementById("editar-modal").style.display = "none";
  idEdicao = null;
}

async function salvarEdicao() {
  const nome = document.getElementById("editar-nome").value;
  const obs = document.getElementById("editar-obs").value;
  const latitude = parseFloat(document.getElementById("editar-latitude").value);
  const longitude = parseFloat(document.getElementById("editar-longitude").value);

  try {
    const resposta = await fetch(`${apiUrl}/${idEdicao}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, latitude, longitude,obs })
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

async function editarObs(id) {
  const novaObs = prompt("Digite a nova observação:");
  if (!novaObs) return;

  try {
    const resposta = await fetch(`${apiUrl}/${id}/obs`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ obs: novaObs })
    });

    if (!resposta.ok) throw new Error("Erro ao editar observação");

    carregarLocais();
  } catch (e) {
    alert("Erro ao atualizar observação.");
    console.error(e);
  }
}

carregarLocais();
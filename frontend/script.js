const apiUrl = "http://localhost:8000/locais";

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

        if (!resposta.ok) {
          throw new Error("Erro ao cadastrar local");
        }

        document.getElementById("nome").value = "";
        document.getElementById("latitude").value = "";
        document.getElementById("longitude").value = "";
        carregarLocais(); // Atualiza lista após cadastro
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
            item.textContent = `ID: ${local.id} | Nome: ${local.nome}`;
            lista.appendChild(item);
          });
        }
      } catch (e) {
        erro.textContent = "Erro ao se conectar com o backend.";
        console.error(e);
      }
    }

    // Carrega a lista ao abrir a página
    carregarLocais();
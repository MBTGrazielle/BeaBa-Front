document.getElementById("btnDeslogar").addEventListener("click", function (e) {
  e.preventDefault();

  localStorage.removeItem("usuarioId");
  localStorage.removeItem("usuarioToken");
  localStorage.removeItem("usuarioNome");
  localStorage.removeItem("usuarioMatricula");
  localStorage.removeItem("usuarioEquipe");
  localStorage.removeItem("usuarioCargo");
  localStorage.removeItem("usuarioEmail");
  localStorage.removeItem("usuarioArea");
  localStorage.removeItem("usuarioSquad");
  localStorage.removeItem("usuarioAcesso");
  localStorage.removeItem("usuarioImagem");
  localStorage.removeItem("id_template");
  localStorage.removeItem("status");

  window.location.href = "../../../login/index.html";
});

window.addEventListener("load", function () {
  buscarInformacoesDoUsuario()
  buscarDadosETabela();
});

async function buscarInformacoesDoUsuario() {
  const id_usuario = localStorage.getItem("usuarioId")
  const nomeUsuarioElemento = document.getElementById("nomeUsuario");
  const usuarioSquadElemento = document.getElementById("usuarioSquad");
  const usuarioSquad = localStorage.getItem("usuarioSquad")
  const area_usuario = localStorage.getItem("usuarioArea")
  const tipoAcessoElemento = document.getElementById("tipoAcesso");
  const usuarioImagemElemento = document.getElementById("usuarioImagem");
  const qtdPendenteElement = document.querySelector('.qtd-pendente');

  const respostaPendente = await buscarTemplateStatus('Pendente', area_usuario);

  if (respostaPendente.status === 404) {
    qtdPendenteElement.innerHTML = ''
  } else {
    qtdPendenteElement.innerHTML = respostaPendente.resultado.length;
  }

  try {
    const response = await fetch(
      `http://localhost:3008/master/buscarUsuariosId/${id_usuario}`
    );
    const data = await response.json();

    if (response.status === 200) {
      nomeUsuarioElemento.innerHTML = data.usuario[0].nome_usuario;
      usuarioSquadElemento.innerHTML = data.usuario[0].squad;
      tipoAcessoElemento.innerHTML = data.usuario[0].tipo_acesso;
      usuarioImagemElemento.src = data.usuario[0].imagem_perfil;
      return data.usuario[0].email;
    } else if (response.status === 404) {
      inputMatricula.value = "";
      inputId.value = "";
      inputNomeUsuario.value = "";
      inputEmail.value = "";
      inputArea.value = "";
      inputCargo.value = "";
      inputEquipe.value = "";
      inputSquad.value = "";
      inputAcesso.value = "";
    }
  } catch (error) {
    console.error(error.message);
  }
}

async function buscarTemplateStatus(status_template, nome_area) {
  localStorage.setItem('status', status_template);
  try {
    const response = await fetch(
      `http://localhost:3008/master/templates/${status_template}/${nome_area} `
    );
    const data = await response.json();

    return data;
  } catch (error) {
    console.error(error.message);
  }
}

let currentPage = 1; 
const itemsPerPage =7; 
let data = [];

function formatarTimestamp(timestamp) {
  const data = new Date(timestamp);
  const dia = String(data.getDate()).padStart(2, '0');
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const ano = data.getFullYear();
  const horas = String(data.getHours()).padStart(2, '0');
  const minutos = String(data.getMinutes()).padStart(2, '0');
  const segundos = String(data.getSeconds()).padStart(2, '0');
  
  return `${dia}-${mes}-${ano} ${horas}:${minutos}:${segundos}`;
}

function preencherTabela() {
  const tabela = document.getElementById('tabela-upload');
  const tbody = tabela.querySelector('tbody');

  tbody.innerHTML = '';

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const itemsToDisplay = data.slice(startIndex, endIndex);

  itemsToDisplay.forEach((row) => {
    const newRow = tbody.insertRow();

    for (const key in row) {
      if (row.hasOwnProperty(key)) {
        const cell = newRow.insertCell();

        if (key === 'caminho_upload') {
          const downloadLink = document.createElement('a');
          downloadLink.href = row[key];
          downloadLink.target = '_blank';
          downloadLink.rel = 'noopener noreferrer';
          downloadLink.innerHTML = '<i class="fas fa-download"></i>';
          cell.appendChild(downloadLink);
        } else if (key === 'data_criacao_upload') { 
          cell.textContent = formatarTimestamp(row[key]);
        } else {
          cell.textContent = row[key];
        }
      }
    }
  });

  atualizarControlesPagina();
}

function atualizarControlesPagina() {
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const paginaAnterior = document.getElementById('pagina-anterior');
  const paginaSeguinte = document.getElementById('pagina-seguinte');
  const paginaAtual = document.getElementById('pagina-atual');

  paginaAnterior.disabled = currentPage === 1;
  paginaSeguinte.disabled = currentPage === totalPages;
  paginaAtual.textContent = `Página ${currentPage} de ${totalPages}`;
}

function irParaPaginaAnterior() {
  if (currentPage > 1) {
    currentPage--;
    preencherTabela();
  }
}

function irParaPaginaSeguinte() {
  const totalPages = Math.ceil(data.length / itemsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    preencherTabela();
  }
}

document.getElementById('pagina-anterior').addEventListener('click', irParaPaginaAnterior);
document.getElementById('pagina-seguinte').addEventListener('click', irParaPaginaSeguinte);

async function buscarDadosETabela() {
  const nome_area= localStorage.getItem('usuarioArea');

  try {
    const response = await fetch(
      `http://localhost:3008/master/verTabelas/${nome_area}`
    );
    console.log(response);
    if (response.status === 200) {
      const jsonData = await response.json();
      data = jsonData.uploads;

      if (Array.isArray(data) && data.length > 0) {
        data.sort((a, b) => new Date(b.data_criacao_upload) - new Date(a.data_criacao_upload));
        preencherTabela();
        console.log(data);
      }
    } else {
      const pagination=document.querySelector(".pagination")
      const paginas=document.querySelector("#pagina-atual")
      
      const retorno1 = document.getElementById('retorno1');

      pagination.style.display="none"
      paginas.style.display="none"

      retorno1.innerHTML = "Nenhum upload até o momento";
      Swal.fire("Nenhum upload até o momento", "", "info");
    }
  } catch (error) {
    console.error('Erro ao buscar dados:', error.message);
  }
}


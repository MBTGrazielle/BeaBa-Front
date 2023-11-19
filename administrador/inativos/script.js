const navbarToggle = document.querySelector(".navbar-toggler");
const navbarCollapse = document.querySelector(".navbar-collapse");

navbarToggle.addEventListener("click", () => {
  if (window.innerWidth <= 768) {
    navbarCollapse.classList.remove("show");
  }
});

window.addEventListener("resize", () => {
  if (window.innerWidth <= 768) {
    navbarCollapse.classList.remove("show");
  }
});

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

  window.location.href = "../../login/index.html";
});

const retornoMensagemInativo = document.getElementById('template-container')

window.addEventListener("load", async () => {

  const usuarioSquad = localStorage.getItem("usuarioSquad")
  const area_usuario = localStorage.getItem("usuarioArea")

  const respostaPendente = await buscarTemplateStatus('Pendente', area_usuario, usuarioSquad);

  buscarInformacoesDoUsuario()

  let respostaInativo = await buscarTemplateStatus('Inativo', area_usuario, usuarioSquad);

  console.log(respostaInativo)

  renderTemplatesInativos(respostaInativo.resultado);

  if (respostaInativo.status === 404) {
    Swal.fire("Não há templates inativos", "", "info");
    retornoMensagemInativo.innerHTML = "Não há templates inativos"
    retornoMensagemInativo.style.color = "red";
    retornoMensagemInativo.style.fontWeight = "bold";
    retornoMensagemInativo.style.marginTop = "190px";
    retornoMensagemInativo.style.marginLeft = "400px";
  }


  const flexSwitchCheckChecked = document.getElementById('flexSwitchCheckChecked');

  flexSwitchCheckChecked.addEventListener("click", async function () {
    const templateId = flexSwitchCheckChecked.getAttribute("data-template-id");
    Swal.fire({
      title: "Confirma a ativação do template?",
      inputLabel: "Informe o motivo",
      showCancelButton: true,
      confirmButtonText: "Confirmar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        if (flexSwitchCheckChecked.checked) {
          await ativarTemplate(templateId)
          Swal.fire("Template ativado", "", "success");
          setTimeout(function () {
            window.location.reload()
          }, 1000);
        }
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire("Ação cancelada", "", "error");
        flexSwitchCheckChecked.checked = false;
      }
    });
  });

  const itemVisualizar = document.querySelectorAll('.item-visualizar');

  itemVisualizar.forEach((element, index) => {
    element.addEventListener("click", async (event) => {
      event.preventDefault();
      const templateId = element.getAttribute("data-template-id");

      try {
        const resultado = await visualizarTemplate(templateId);

        if (resultado.resultadoTemplates && resultado.resultadoTemplates.length > 0) {
          const modalConteudo = document.getElementById('modalConteudo');
          const camposEtipos = resultado.camposEtipos;

          modalConteudo.innerHTML = `
            <p><strong>Status:</strong> ${resultado.resultadoTemplates[0].status_template}</p>
            <p><strong>Data da Criação:</strong> ${formatarDataComHorario(resultado.resultadoTemplates[0].data_criacao_template)}</p>
            <p><strong>ID:</strong> ${resultado.resultadoTemplates[0].id_template}</p>
            <p><strong>Nome do template:</strong> ${resultado.resultadoTemplates[0].nome_template}.${resultado.resultadoTemplates[0].extensao_template}</p>
            <p><strong>Objetivo do template:</strong> ${resultado.resultadoTemplates[0].objetivo_template}</p>
            <p><strong>Nome:</strong> ${resultado.resultadoTemplates[0].referencia_nome}</p>
            <p><strong>Área:</strong> ${resultado.resultadoTemplates[0].referencia_area}</p>
            <p><strong>Squad:</strong> ${resultado.resultadoTemplates[0].referencia_squad}</p>
            <p style="color:#209642;font-weight:bold; font-size:20px">Campos</p>
            <p></p>
            ${Object.keys(camposEtipos).map((campo, index) => `
              <p>${campo}: 
                <strong>Campo:</strong> ${camposEtipos[campo].nome},
                <strong>Tipo:</strong> ${camposEtipos[campo].tipo}
              </p>`).join('')}
          `;

          const visualizarModal = new bootstrap.Modal(document.getElementById('visualizarModal'));
          visualizarModal.show();
        } else {
          console.error('Nenhum resultado de template encontrado.');
        }
      } catch (error) {
        console.error("Erro ao visualizar o template:", error);
      }
    });
  });

  const itemRemover = document.querySelectorAll('.item-remover');

  itemRemover.forEach((element, index) => {
    element.addEventListener("click", async (event) => {
      event.preventDefault();
      const templateId = element.getAttribute("data-template-id");

      Swal.fire({
        title: "Confirmar a exclusão",
        inputLabel: "Informe o motivo",
        showCancelButton: true,
        confirmButtonText: "Confirmar",
        cancelButtonText: "Cancelar",
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            let respostaCampo = await deletarCampo(templateId);

            if (respostaCampo && respostaCampo.status === 200) {
              await deletarTemplate(templateId);
              Swal.fire("Template excluído com sucesso", "", "success");
              setTimeout(function () {
                window.location.reload()
              }, 1200);
            }
          } catch (error) {
            Swal.fire("Erro ao remover", "", "error");
            console.error(error.message);
          }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          Swal.fire("Ação cancelada", "", "error");
        }
      });
    });
  });

  const apagar = document.getElementById('apagar');
  const buscar = document.getElementById('buscar');
  const buscaID = document.getElementById('busca-id');
  const buscaNome = document.getElementById('busca-nome');
  const buscaCriador = document.getElementById('busca-criador');
  const buscaExtensao = document.getElementById('busca-extensao');

  buscar.addEventListener('click', async () => {
    const id = buscaID.value;
    const nome = buscaNome.value;
    const criador = buscaCriador.value;
    const extensao = buscaExtensao.value;
    let status = localStorage.getItem("status")
    const usuarioSquad = localStorage.getItem("usuarioSquad")
    const area_usuario = localStorage.getItem("usuarioArea")


    const parametros = {};

    if (id) parametros.id_template = id;
    if (nome) parametros.nome_template = nome;
    if (criador) parametros.referencia_nome = criador;
    if (extensao) parametros.extensao_template = extensao;

    const queryParams = new URLSearchParams(parametros).toString();

    if (Object.keys(parametros).length === 0) {
      Swal.fire("Nenhum parâmetro de busca fornecido", "", "info");
      return;
    }

    const url = `http://localhost:3008/adm/buscarTemplates/${area_usuario}/${usuarioSquad}/${status}?${queryParams}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();

      if (response.status === 200) {

        if (status === 'Ativo') {
          renderTemplatesAtivos(data.templatesFiltrados);
        } else if (status === 'Pendente') {
          renderTemplatesPendentes(data.templatesFiltrados);
        } else if (status === 'Invalidado') {
          renderTemplatesInvalidados(data.templatesFiltrados);
        } else if (status === 'Inativo') {
          renderTemplatesInativos(data.templatesFiltrados);
        }
      } else {
        Swal.fire("Template não encontrado", "", "error");
      }
    } catch (error) {
      console.error('Erro ao buscar templates:', error);
    }
  });

  apagar.addEventListener('click', async () => {
    let respostaInativo = await buscarTemplateStatus('Inativo', area_usuario, usuarioSquad);
    renderTemplatesInativos(respostaInativo.resultado);
    const usuario_squad = document.getElementById('busca-squad');

    if (respostaInativo) {
      buscaID.value = ''
      buscaNome.value = ''
      buscaCriador.value = ''
      buscaExtensao.value = ''
      usuario_squad.value = ''
    }
  })
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

  const respostaPendente = await buscarTemplateStatus('Pendente', area_usuario, usuarioSquad);

  if (respostaPendente.status === 404) {
    qtdPendenteElement.innerHTML = ''
  } else {
    qtdPendenteElement.innerHTML = respostaPendente.resultado.length;
  }

  try {
    const response = await fetch(
      `http://localhost:3008/adm/buscarUsuariosId/${id_usuario}`
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

async function buscarTemplateStatus(status_template, nome_area, squad) {
  localStorage.setItem('status', status_template)
  try {
    const response = await fetch(
      `http://localhost:3008/adm/templates/${status_template}/${nome_area}/${squad} `
    );
    const data = await response.json();

    return data;
  } catch (error) {
    console.error(error.message);
  }
}

async function visualizarTemplate(template) {
  const id_template = template

  try {
    const response = await fetch(`http://localhost:3008/adm/visualizar/${id_template}`, {
      method: "GET",
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      throw new Error("Não foi possível obter o modelo.");
    }
  } catch (error) {
    throw error;
  }
}

const inativosTemplates = document.getElementById('inativos-tab');


function createTemplateElementInativo(template) {
  const templateHTMLInativo = `
    <div class="col-md-6 mt-2 mt-2">
      <div class="cardTemplate w-100 p-4 rounded-4 mt-1">
        <header class="d-flex justify-content-between align-items-center">
          <span class="badge text-bg-inativo px-3 pt-2 pb-2 fs-6">${template.status_template}</span>
          <div class="form-check form-switch">
          <input class="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckChecked" data-template-id="${template.id_template}" />
          </div>
          <li class="nav-item dropdown nav-card">
            <a class="nav-link dropdown-toggle teste" data-bs-toggle="dropdown" href="#" role="button" aria-expanded="false"> Menu </a>
            <ul class="dropdown-menu">
              <li><a class="dropdown-item item-visualizar" data-template-id="${template.id_template}" href="#">Visualizar</a></li>
              <li><a class="dropdown-item item-remover" data-template-id="${template.id_template}" href="#">Remover</a></li>
            </ul>
          </li>
        </header>
        <nav class="mt-3 mb-3">
        <i class="fas fa-calendar"></i> Criado em ${formatarDataComHorario(template.data_criacao_template)}
        </nav>
        <nav class="mt-3 mb-3">
          <h4>${template.nome_template}</h4>
          <p>ID do template: ${template.id_template}</p>
        </nav>
        <div>
          <div class="d-flex justify-content-between align-items-center">
            <div class="w-50 mx-2">
              <strong>Extensão:</strong> ${template.extensao_template}
            </div>
            <div class="w-50 mx-2">
            <strong>Nome:</strong> ${template.referencia_nome}
          </div>
          </div>
          <div class="d-flex justify-content-between align-items-center">
            <div class="w-50 mx-2">
              <strong>Área:</strong> ${template.referencia_area}
            </div>
            <div class="w-50 mx-2">
              <strong>Squad:</strong> ${template.referencia_squad}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  return templateHTMLInativo;
}

function renderTemplatesInativos(templates) {
  const templateContainerInativos = document.getElementById('template-container');

  templateContainerInativos.innerHTML = '';
  templates.forEach((template) => {
    const templateElement = createTemplateElementInativo(template);
    templateContainerInativos.innerHTML += templateElement;
  });
}

function formatarDataComHorario(data) {
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };
  return new Date(data).toLocaleDateString('pt-BR', options);
}

async function ativarTemplate(template) {
  const id_template = template
  try {
    const formData = new FormData();
    formData.append("status_template", 'Ativo');

    const response = await fetch(
      `http://localhost:3008/adm/ativarTemplate/${id_template}`,
      {
        method: "PATCH",
        body: formData,
      }
    );
    return response;
  } catch (error) {
    throw error;
  }
}

async function deletarTemplate(templateId) {
  try {
    const response = await fetch(`http://localhost:3008/adm/deletarTemplate/${templateId}`, {
      method: "DELETE",
    });

    const data = await response.json();

    return data
  } catch (error) {
    console.error("Ocorreu um erro:", error);
  }
}

async function deletarCampo(templateId) {
  try {
    const response = await fetch(`http://localhost:3008/adm/deletarCampo/${templateId}`, {
      method: "DELETE",
    });

    const data = await response.json();

    return data
  } catch (error) {
    console.error("Ocorreu um erro:", error);
  }
}

const qtdCamposInput = document.getElementById("qtd_campos");
const camposContainer = document.getElementById("campos-container");

qtdCamposInput.addEventListener("change", () => {
  const numCampos = parseInt(qtdCamposInput.value);

  camposContainer.innerHTML = "";

  for (let i = 1; i <= numCampos; i++) {

    const rowDiv = document.createElement("div");
    rowDiv.classList.add("row", "mt-2", "mb-3");


    const inputDiv = document.createElement("div");
    inputDiv.classList.add("col-md-8");

    const inputContainer = document.createElement("div");
    inputContainer.classList.add("input-container-modal");

    const label = document.createElement("label");
    label.textContent = `Campo ${i}:`;
    label.setAttribute("for", `nome-template${i}`);

    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "";
    input.name = `nome-template${i}`;
    input.id = `nome-template${i}`;
    input.classList.add("form-control");

    inputContainer.appendChild(label);
    inputContainer.appendChild(input);
    inputDiv.appendChild(inputContainer);


    const selectDiv = document.createElement("div");
    selectDiv.classList.add("col-md-4");

    const selectContainer = document.createElement("div");
    selectContainer.classList.add("mb-2");

    const selectLabel = document.createElement("label");
    selectLabel.textContent = "Tipo do campo";
    selectLabel.classList.add("form-label");

    const select = document.createElement("select");
    select.classList.add("form-select");
    select.id = `form-acesso${i}`;

    const option1 = document.createElement("option");
    option1.value = "Selecione";
    option1.textContent = "Selecione";

    const option2 = document.createElement("option");
    option2.value = "timestamp";
    option2.textContent = "TIMESTAMP";

    const option3 = document.createElement("option");
    option3.value = "boolean";
    option3.textContent = "BOOLEAN";

    const option4 = document.createElement("option");
    option4.value = "varchar";
    option4.textContent = "VARCHAR";

    const option5 = document.createElement("option");
    option5.value = "int";
    option5.textContent = "INT";

    const option6 = document.createElement("option");
    option6.value = "date";
    option6.textContent = "DATE";

    const option7 = document.createElement("option");
    option7.value = "numeric";
    option7.textContent = "NUMERIC";

    select.appendChild(option1);
    select.appendChild(option2);
    select.appendChild(option3);
    select.appendChild(option4);
    select.appendChild(option5);
    select.appendChild(option6);
    select.appendChild(option7);

    selectContainer.appendChild(selectLabel);
    selectContainer.appendChild(select);
    selectDiv.appendChild(selectContainer);


    rowDiv.appendChild(inputDiv);
    rowDiv.appendChild(selectDiv);


    camposContainer.appendChild(rowDiv);
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

  window.location.href = "../../../login/index.html";
});

window.addEventListener("load", function () {
  buscarInformacoesDoUsuario()
});

async function buscarTemplateStatusPendente(id_usuario, status_template) {
  try {
    const response = await fetch(
      `http://localhost:3008/cad/buscarTemplates/${id_usuario}/${status_template} `
    );
    const data = await response.json();

    return data

  } catch (error) {
    console.error(error.message);
  }
}

async function buscarInformacoesDoUsuario() {
  const id_usuario = localStorage.getItem("usuarioId")
  const nomeUsuarioElemento = document.getElementById("nomeUsuario");
  const usuarioSquadElemento = document.getElementById("usuarioSquad");
  const usuarioSquad = localStorage.getItem("usuarioSquad")
  const area_usuario = localStorage.getItem("usuarioArea")
  const tipoAcessoElemento = document.getElementById("tipoAcesso");
  const usuarioImagemElemento = document.getElementById("usuarioImagem");
  const qtdPendenteElement = document.querySelector('.qtd-pendente');

  const respostaPendente = await buscarTemplateStatusPendente(id_usuario, 'Pendente');

  if (respostaPendente.status === 404) {
    qtdPendenteElement.innerHTML = ''
  } else {
    qtdPendenteElement.innerHTML = respostaPendente.templatesFiltrados.length;
  }

  try {
    const response = await fetch(
      `http://localhost:3008/cad/buscarUsuariosId/${id_usuario}`
    );
    const data = await response.json();

    if (response.status === 200) {
      nomeUsuarioElemento.innerHTML = data.usuario[0].nome_usuario;
      usuarioSquadElemento.innerHTML = data.usuario[0].squad;
      tipoAcessoElemento.innerHTML = data.usuario[0].tipo_acesso;
      usuarioImagemElemento.src = data.usuario[0].imagem_perfil;
      return data
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
      `http://localhost:3008/cad/templates/${status_template}/${nome_area}/${squad} `
    );
    const data = await response.json();

    return data

  } catch (error) {
    console.error(error.message);
  }
}

async function cadastrarTemplate() {
  const id_usuario = localStorage.getItem("usuarioId");
  const qtdCampos = document.getElementById('qtd_campos').value;
  const nome_template = document.getElementById('nome-template').value;
  const objetivo_template = document.getElementById('objetivo-template').value;
  const extensao_template = document.getElementById('form-acesso').value;
  const motivo_invalidacao = 'sem motivo'

  if (nome_template.length === 0) {
    Swal.fire("Informe o nome do template", "", "error");
    return;
  }

  if (qtdCampos.length === 0) {
    Swal.fire("Informe a quantidade de campos", "", "error");
    return;
  }

  if (objetivo_template.length === 0) {
    Swal.fire("Informe o objetivo do template", "", "error");
    return;
  }

  if (extensao_template === 'selecione') {
    Swal.fire("Selecione o formato esperado", "", "error");
    return;
  }

  const formData = {
    nome_template,
    objetivo_template,
    extensao_template,
    motivo_invalidacao
  };

  try {
    if (!formData) {
      return
    } else {
      const response = await fetch(`http://localhost:3008/adm/cadastrarTemplate/${id_usuario}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.status === 201) {
        return data.template[0].id_template;
      } else {
        Swal.fire(data.mensagem, "", "error");
        return null;
      }
    }
  } catch (error) {
    console.error("Ocorreu um erro:", error);
    return null;
  }
}

async function cadastrarCampos(id_template) {
  const camposInput = document.querySelectorAll("[id^=nome-template]");

  for (let index = 0; index < camposInput.length; index++) {
    const campo = camposInput[index];
    const nome_campo = campo.value;
    const select = document.getElementById(`form-acesso${index}`);

    if (!select) {
      console.error(`Select não encontrado para campo ${index}`);
      continue;
    }

    const tipo_dado_campo = select.value;

    const formDataCampo = {
      nome_campo: nome_campo,
      tipo_dado_campo: tipo_dado_campo,
      referencia_template: id_template
    };

    try {
      const response = await fetch(`http://localhost:3008/cad/cadastrarCampo/${id_template}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formDataCampo),
      });

      const data = await response.json();

      if (data.status === 201) {
        Swal.fire("Template cadastrado com sucesso", "", "success");
      } else {
        console.error("Erro ao cadastrar campo:", data.mensagem);
      }
    } catch (error) {
      console.error("Ocorreu um erro ao cadastrar o campo:", error);
    }
  }
}

document.getElementById('btn-preencher').addEventListener('click', async (e) => {
  e.preventDefault();

  const id_template = await cadastrarTemplate();
  console.log(id_template);

  if (id_template !== null) {

    const modal = new bootstrap.Modal(document.getElementById('exampleModalToggle'));
    modal.show();

    document.getElementById('btn-cancelar').addEventListener('click', async () => {
      if (id_template) {
        Swal.fire("Preenchimento de campos cancelado", "", "error").then(async () => {
          await deletarTemplate(id_template);
        });
      }
    });

    document.getElementById('btn-salvar-campos').addEventListener('click', async () => {
      await cadastrarCampos(id_template);
      const qtdCampos = document.getElementById('qtd_campos');
      const nome_template = document.getElementById('nome-template');
      const objetivo_template = document.getElementById('objetivo-template');
      const extensao_template = document.getElementById('form-acesso');

      qtdCampos.value = ''
      nome_template.value = ''
      objetivo_template.value = ''
      extensao_template.value = 'selecione'
      setTimeout(function () {
        window.location.reload()
      }, 1000);
    });
  }
});

async function deletarTemplate(id_template) {
  try {
    const response = await fetch(`http://localhost:3008/cad/deletarTemplate/${id_template}`, {
      method: "DELETE",
    });

    const data = await response.json();

    return data
  } catch (error) {
    console.error("Ocorreu um erro:", error);
  }
}














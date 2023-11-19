const confirmarAtualizacao = document.querySelector(".atualizar-btn");

const btnBuscarUsuario = document.querySelector(".input-group-text");
const btnExcluirUsuario = document.querySelector(".excluir-btn");

const matriculaBuscar = document.getElementById("matricula-usuario");

const inputMatricula = document.getElementById("matricula");
const inputId = document.getElementById("id-usuario");
const inputNomeUsuario = document.getElementById("nome-usuario");
const inputEmail = document.getElementById("email");
const inputArea = document.getElementById("area");
const inputCargo = document.getElementById("cargo");
const inputEquipe = document.getElementById("equipe");
const inputSquad = document.getElementById("squad");
const inputAcesso = document.getElementById("form-acesso");

confirmarAtualizacao.addEventListener("click", async () => {
  // Chama a função para criar uma janela modal - biblioteca SweetAlert2 (Swal)
  Swal.fire({
    title: "Confirmar atualização",
    inputLabel: "Informe o motivo",
    showCancelButton: true,
    confirmButtonText: "Confirmar",
    cancelButtonText: "Cancelar",
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        let resposta = await atualizarItem();

        if (resposta && resposta.status === 200) {
          Swal.fire("Informações salvas com sucesso.", "", "success");
          setTimeout(function () {
            window.location.reload()
          }, 1500);
        } else {
          Swal.fire("Todos os campos devem estar preenchidos.", "", "error");

        }

      } catch (error) {
        Swal.fire("Erro ao atualizar.", "", "error");
        console.error(error.message);
      }

    } else if (result.dismiss === Swal.DismissReason.cancel) {
      Swal.fire("Ação cancelada", "", "error");
    }
  });
});

const atualizarItem = async () => {
  const id_usuario = inputId.value;
  const nome_usuario = inputNomeUsuario.value;
  const email = inputEmail.value;
  const matricula = inputMatricula.value;
  const tipo_acesso = inputAcesso.value;
  const nome_area = inputArea.value;
  const cargo = inputCargo.value;
  const squad = inputSquad.value;
  const equipe = inputEquipe.value;

  if (!nome_usuario || !email || !matricula || !tipo_acesso || !nome_area || !cargo || !squad || !equipe) {
    console.log("Todos os campos devem estar preenchidos.");
    return;
  }

  try {
    const formData = new FormData();

    formData.append("nome_usuario", nome_usuario);
    formData.append("email", email);
    formData.append("matricula", matricula);
    formData.append("tipo_acesso", tipo_acesso);
    formData.append("nome_area", nome_area);
    formData.append("cargo", cargo);
    formData.append("squad", squad);
    formData.append("equipe", equipe);

    const imagem_perfil = localStorage.getItem("usuarioImagem");
    if (imagem_perfil) {
      formData.append("imagem_perfil", imagem_perfil);
    }

    const response = await fetch(
      `http://localhost:3008/master/atualizar/${id_usuario}`,
      {
        method: "PATCH",
        body: formData,
      }
    );

    console.log(response);
    return response;
  } catch (error) {
    throw error;
  }
};

btnBuscarUsuario.addEventListener("click", async function () {
  const matricula = matriculaBuscar.value;

  try {
    if (matricula.length === 0) {
      Swal.fire(`Digite uma matrícula.`, "", "warning");
      resetInputFields();
    } else {
      const response = await fetch(
        `http://localhost:3008/master/buscarUsuarios/${matricula}`
      );

      const data = await response.json();

      if (response.status === 200) {
        inputMatricula.value = data.usuario[0].matricula;
        inputId.value = data.usuario[0].id_usuario;
        inputNomeUsuario.value = data.usuario[0].nome_usuario;
        inputEmail.value = data.usuario[0].email;
        inputArea.value = data.usuario[0].nome_area;
        inputCargo.value = data.usuario[0].cargo;
        inputEquipe.value = data.usuario[0].equipe;
        inputSquad.value = data.usuario[0].squad;
        inputAcesso.value = data.usuario[0].tipo_acesso;
      } else if (response.status === 404) {
        Swal.fire(`Usuário não encontrado.`, "", "error");
        resetInputFields();
      }
    }
  } catch (error) {
    Swal.fire(error.message, "", "error");
  }
});

function resetInputFields() {
  inputMatricula.value = "";
  inputId.value = "";
  inputNomeUsuario.value = "";
  inputEmail.value = "";
  inputCargo.value = "";
  inputEquipe.value = "";
  inputSquad.value = "";
  inputAcesso.value = "";
}

btnExcluirUsuario.addEventListener("click", async function () {
  const id_usuario = inputId.value;

  btnExcluirUsuario.disabled = true
  Swal.fire({
    title: "Excluindo o usuário...",
    allowEscapeKey: false,
    allowOutsideClick: false,
    onOpen: () => {
      Swal.showLoading();
    },
  });

  try {
    const response = await fetch(
      `http://localhost:3008/master/deletar/${id_usuario}`,
      {
        method: "DELETE",
      }
    );
    const data = await response.json();

    if (response.status === 200) {
      Swal.fire(`Usuário deletado com sucesso.`, "", "success").then(() => {
        window.location.reload()
      });
    } else if (response.status === 404) {
      console.log(data.mensagem);
    }
  } catch (error) {
    console.error(error.message);
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
      inputArea.value = data.usuario[0].nome_area
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
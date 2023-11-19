const inputImagem = document.getElementById('exampleFormControlFile1');
const inputMatricula = document.getElementById('matricula');
const inputNomeUsuario = document.getElementById('nome-usuario');
const inputEmail = document.getElementById('email');
const inputArea = document.getElementById('area');
const inputCargo = document.getElementById('cargo');
const inputEquipe = document.getElementById('equipe');
const inputSquad = document.getElementById('squad');
const inputAcesso = document.getElementById('form-acesso');

function resetInputFields() {
  inputMatricula.value = "";
  inputNomeUsuario.value = "";
  inputEmail.value = "";
  inputCargo.value = "";
  inputEquipe.value = "";
  inputSquad.value = "";
  inputAcesso.value = "";
  inputImagem.value = null
}

const btnCadastrar = document.querySelector('.btn-cadastrar');

btnCadastrar.addEventListener("click", async (e) => {
  e.preventDefault();
  btnCadastrar.disabled = true

  Swal.fire({
    title: "Confirmar cadastro",
    inputLabel: "Informe o motivo",
    showCancelButton: true,
    confirmButtonText: "Confirmar",
    cancelButtonText: "Cancelar",
  }).then(async (result) => {

    if (result.isConfirmed) {
      Swal.fire({
        title: "Cadastrando o usuário...",
        allowEscapeKey: false,
        allowOutsideClick: false,
        onOpen: () => {
          Swal.showLoading();
        },
      });
      try {
        let resposta = await cadastrarUsuario();
        console.log(resposta)

        if (resposta && resposta.status === 201) {
          Swal.fire("Usuário cadastrado com sucesso. Senha enviada por e-mail", "", "success").then(() => {
            resetInputFields();
          });
        } else if (resposta && resposta.status) {
          Swal.fire(`${resposta.mensagem}`, "", "error");
        }

      } catch (error) {
        Swal.fire("Erro ao cadastrar o usuário.", "", "error");
        console.error(error.message);
      } finally {
        btnCadastrar.innerHTML = 'Cadastrar';
        btnCadastrar.disabled = false;
      }
    } else if (result.dismiss === Swal.DismissReason.cancel) {
      Swal.fire("Ação cancelada", "", "error");
    }
  });
});

const cadastrarUsuario = async () => {
  const imagem_perfil = inputImagem.files[0];
  const nome_usuario = inputNomeUsuario.value;
  const email = inputEmail.value;
  const matricula = inputMatricula.value;
  const tipo_acesso = inputAcesso.value;
  const nome_area = inputArea.value
  const cargo = inputCargo.value;
  const squad = inputSquad.value;
  const equipe = inputEquipe.value;

  const formData = new FormData();
  formData.append('imagem_perfil', imagem_perfil);
  formData.append('nome_usuario', nome_usuario);
  formData.append('email', email);
  formData.append('matricula', matricula);
  formData.append('tipo_acesso', tipo_acesso);
  formData.append('nome_area', nome_area);
  formData.append('cargo', cargo);
  formData.append('squad', squad);
  formData.append('equipe', equipe);

  try {
    const response = await fetch('http://localhost:3008/adm/cadastrar', {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error.message);
  }
};

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

window.addEventListener("load", async () => {
  buscarInformacoesDoUsuario()
});

async function buscarInformacoesDoUsuario() {
  const id_usuario = localStorage.getItem("usuarioId")
  const nomeUsuarioElemento = document.getElementById("nomeUsuario");
  const usuarioSquadElemento = document.getElementById("usuarioSquad");
  const tipoAcessoElemento = document.getElementById("tipoAcesso");
  const usuarioImagemElemento = document.getElementById("usuarioImagem");
  const qtdPendenteElement = document.querySelector('.qtd-pendente');
  const usuarioSquad = localStorage.getItem("usuarioSquad")
  const area_usuario = localStorage.getItem("usuarioArea")
  const area = document.getElementById("area")

  const respostaPendente = await buscarTemplateStatus('Pendente', area_usuario, usuarioSquad);

  if (respostaPendente.resultado.length === 0) {
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
      area.value = data.usuario[0].nome_area
      return data;
    } else if (response.status === 404) {
      inputMatricula.value = "";
      inputNomeUsuario.value = "";
      inputEmail.value = "";
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
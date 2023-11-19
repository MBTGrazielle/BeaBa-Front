const confirmarAtualizacao = document.querySelector(".atualizar-btn");
const btnDeletar = document.getElementById("deletarImagemBtn")
const btnSalvarImagem = document.getElementById("salvarImagemBtn")
const btnGerenciarImagem = document.getElementById("btn-gerenciar")

const inputMatricula = document.getElementById("matricula");
const inputId = document.getElementById("id-usuario");
const inputNomeUsuario = document.getElementById("nome-usuario");
const inputEmail = document.getElementById("email");
const inputArea = document.getElementById("area");
const inputCargo = document.getElementById("cargo");
const inputEquipe = document.getElementById("equipe");
const inputSquad = document.getElementById("squad");
const inputSenha = document.getElementById("senha");
const inputAcesso = document.getElementById("form-acesso");

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
  const tipoAcessoElemento = document.getElementById("tipoAcesso");
  const usuarioImagemElemento = document.getElementById("usuarioImagem");
  const qtdPendenteElement = document.querySelector('.qtd-pendente');
  const saudacaoUsuarioElemento = document.getElementById("saudacaoUsuario");
  const usuarioSquad = localStorage.getItem("usuarioSquad")
  const area_usuario = localStorage.getItem("usuarioArea")

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
      inputMatricula.value = data.usuario[0].matricula;
      inputId.value = data.usuario[0].id_usuario;
      inputNomeUsuario.value = data.usuario[0].nome_usuario;
      inputEmail.value = data.usuario[0].email;
      inputArea.value = data.usuario[0].nome_area;
      inputCargo.value = data.usuario[0].cargo;
      inputEquipe.value = data.usuario[0].equipe;
      inputSquad.value = data.usuario[0].squad;
      inputAcesso.value = data.usuario[0].tipo_acesso;
      inputSenha.value = data.usuario[0].senha;
      saudacaoUsuarioElemento.innerHTML = data.usuario[0].nome_usuario

      const resultado = {
        email: data.usuario[0].email,
        chave: data.usuario[0].chave,
        iv: data.usuario[0].iv
      }
      return resultado;
    }

  } catch (error) {
    console.error(error.message);
  }
}

async function buscarTemplateStatus(status_template, nome_area, squad) {
  try {
    const response = await fetch(
      `http://localhost:3008/cad/templates/${status_template}/${nome_area}/${squad} `
    );
    const data = await response.json();

    return data;
  } catch (error) {
    console.error(error.message);
  }
}

confirmarAtualizacao.addEventListener("click", async (e) => {
  //chamo a função para criar uma janela modal - biblioteca SweetAlert2 (Swal)
  e.preventDefault();

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
          setTimeout(function () {
            window.location.reload()
          }, 2500);
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
  const senha = inputSenha.value

  if (!nome_usuario || !senha || !email || !matricula || !tipo_acesso || !nome_area || !cargo || !squad || !equipe) {
    console.log("Todos os campos devem estar preenchidos.");
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:3008/cad/atualizar/${id_usuario}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome_usuario,
          email,
          matricula,
          tipo_acesso,
          nome_area,
          cargo,
          squad,
          equipe,
          senha
        }),
      }
    );

    const data = await response.json();
    return data
  } catch (error) {
    console.error(error.message);
  }
}

function removerDadosLocalStorage() {
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
}

function apagarDadosLocalStorageApos15Minutos() {
  const tempoParaApagar = 900000; // 15 minutos

  setTimeout(function () {
    removerDadosLocalStorage();
    console.log("Dados do localStorage foram apagados após 15 minutos de inatividade.");
  }, tempoParaApagar);
}

document.getElementById("ModalImagem").addEventListener("shown.bs.modal", function (e) {
  e.preventDefault();
  const id_usuario = localStorage.getItem("usuarioId");

  btnDeletar.addEventListener("click", async (e) => {
    e.preventDefault();

    btnDeletar.disabled = true
    btnSalvarImagem.disabled = true

    Swal.fire({
      title: "Confirmar a exclusão da imagem de perfil",
      inputLabel: "Informe o motivo",
      showCancelButton: true,
      confirmButtonText: "Confirmar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {

      if (result.isConfirmed) {
        Swal.fire({
          title: "Excluindo a imagem de perfil...",
          allowEscapeKey: false,
          allowOutsideClick: false,
          onOpen: () => {
            Swal.showLoading();
          },
        });
        if (id_usuario) {
          try {
            const response = await fetch(
              `http://localhost:3008/cad/deletarImagem/${id_usuario}`,
              {
                method: "DELETE",
              }
            );

            const data = await response.json();

            if (response.status === 200) {

              Swal.fire(`Imagem deletada com sucesso.`, "", "success").then(() => {
                window.location.reload()
              });
            } else if (response.status === 404) {
              console.log(data.mensagem);
            }
          } catch (error) {
            console.error(error.message);
          }
        } else {
          console.log("ID de usuário não encontrado no localStorage.");
        }
      }
    });
  })

  btnSalvarImagem.addEventListener("click", async (e) => {
    e.preventDefault();

    const imagem_perfil = document.getElementById("exampleFormControlFile1").files[0];
    const nome_area = inputArea.value;
    const squad = inputSquad.value;

    if (!imagem_perfil) {
      Swal.fire(`Escolha uma imagem de perfil.`, "", "info");
      return;
    }

    Swal.fire({
      title: "Confirmar atualização de imagem de perfil",
      inputLabel: "Informe o motivo",
      showCancelButton: true,
      confirmButtonText: "Confirmar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "Atualizando a imagem de perfil...",
          allowEscapeKey: false,
          allowOutsideClick: false,
          onOpen: () => {
            Swal.showLoading();
          },
        });
        try {
          const formData = new FormData();

          formData.append("imagem_perfil", imagem_perfil);
          formData.append("nome_area", nome_area);
          formData.append("squad", squad);

          const response = await fetch(
            `http://localhost:3008/cad/atualizar/${id_usuario}`,
            {
              method: "PATCH",
              body: formData,
            }
          );

          const data = await response.json();

          if (response.status === 200) {
            Swal.fire(`Informações salvas com sucesso.`, "", "success").then(() => {
              window.location.reload();
            });
          } else if (response.status === 404) {
            console.log(data.mensagem);
          }
        } catch (error) {
          console.error(error.message);
        }
      }
    });
  });
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

const mostrarSenhaBtn = document.getElementById('mostrarSenha');
const olhoIcon = document.getElementById('olho');
olhoIcon.classList.add('fa-eye-slash');

mostrarSenhaBtn.addEventListener('click', async () => {
  const senhaCriptografada = inputSenha.value;

  const processo = await buscarInformacoesDoUsuario();
  const chaveArrayBuffer = new Uint8Array(processo.chave.data);

  if (processo.iv.length !== 24) {
    console.error('IV incorreto: Tamanho inválido');
    return;
  }

  if (inputSenha.type === 'password') {
    const ivArrayBuffer = base64ToArrayBuffer(processo.iv);
    const key = await window.crypto.subtle.importKey(
      'raw',
      chaveArrayBuffer,
      { name: 'AES-CBC' },
      false,
      ['decrypt']
    );

    const decryptedData = await window.crypto.subtle.decrypt(
      {
        name: 'AES-CBC',
        iv: ivArrayBuffer,
      },
      key,
      new Uint8Array(hexStringToByteArray(senhaCriptografada))
    );

    const senhaDescriptografada = new TextDecoder('utf-8').decode(decryptedData);
    inputSenha.type = 'text';
    inputSenha.value = senhaDescriptografada;
    olhoIcon.classList.remove('fa-eye-slash');
    olhoIcon.classList.add('fa-eye');

  } else {
    inputSenha.type = 'password';

    olhoIcon.classList.add('fa-eye-slash');
    olhoIcon.classList.remove('fa-eye');
  }
});

function hexStringToByteArray(hexString) {
  const byteArray = [];
  for (let i = 0; i < hexString.length; i += 2) {
    byteArray.push(parseInt(hexString.substr(i, 2), 16));
  }
  return byteArray;
}

function base64ToArrayBuffer(base64) {
  const binaryString = window.atob(base64);
  const length = binaryString.length;
  const bytes = new Uint8Array(length);

  for (let i = 0; i < length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return bytes.buffer;
}

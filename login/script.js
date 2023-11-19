const btnLogin = document.querySelector(".btn-login")

document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const formData = {
    email: email,
    senha: password,
  };

  fetch("http://localhost:3008/loginUsuario", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.status === 200) {
        localStorage.setItem("usuarioId", data.usuario.id);
        localStorage.setItem("usuarioToken", data.token);
        localStorage.setItem("usuarioNome", data.usuario.nome);
        localStorage.setItem("usuarioSquad", data.usuario.squad);
        localStorage.setItem("usuarioMatricula", data.usuario.matricula);
        localStorage.setItem("usuarioArea", data.usuario.nome_area);
        localStorage.setItem("usuarioCargo", data.usuario.cargo);
        localStorage.setItem("usuarioSquad", data.usuario.squad);
        localStorage.setItem("usuarioEquipe", data.usuario.equipe);
        localStorage.setItem("usuarioEmail", data.usuario.email);
        localStorage.setItem("usuarioAcesso", data.usuario.tipo_acesso);
        localStorage.setItem("usuarioImagem", data.usuario.imagem_perfil);
        if (data.usuario.tipo_acesso === "Administrador") {
          window.location.href = "../../administrador/dashboard/templates/index.html";
        } else if (data.usuario.tipo_acesso === "Cadastrador") {
          window.location.href = "../../../cadastrador/dashboard/templates/index.html";
        } else if (data.usuario.tipo_acesso === "Master") {
          window.location.href = "../master/dashboard/templates/index.html";
        }
      } else {
        Swal.fire(data.mensagem, "", "error");
      }
    })
    .catch((error) => {
      console.error("Ocorreu um erro:", error);
    });
});

document
  .getElementById("esqueciSenha")
  .addEventListener("click", async function () {
    const emailInput = document.getElementById("email");
    const email = emailInput.value;
    btnLogin.disabled = true;

    if (!email) {
      btnLogin.innerHTML = 'Login';
      Swal.fire("Informe o seu e-mail", "", "error");
    } else {
      Swal.fire({
        title: "Recuperação de Senha",
        input: "text",
        inputValue: `${email}`,
        inputLabel: "Confirme o seu e-mail",
        showCancelButton: true,
        confirmButtonText: "Confirmar",
        cancelButtonText: "Cancelar",
      }).then(async (result) => {
        if (result.isConfirmed) {
          emailInput.value = result.value;

          Swal.fire({
            title: "Recuperando senha...",
            allowEscapeKey: false,
            allowOutsideClick: false,
            onOpen: () => {
              Swal.showLoading();
            },
          });

          try {
            let resposta = await esqueciSenha(result.value);

            if (resposta && resposta.status === 200) {
              btnLogin.innerHTML = 'Login';
              Swal.fire("Uma nova senha foi enviada para o seu e-mail", "", "success");
            } else {
              Swal.fire("Todos os campos devem estar preenchidos", "", "error");
            }
          } catch (error) {
            Swal.fire("Erro ao atualizar.", "", "error");
            console.error(error.message);
          }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          btnLogin.innerHTML = 'Login';
          Swal.fire("Ação cancelada", "", "error");
        }
      });
    }
  });

const esqueciSenha = async (email) => {
  try {
    const response = await fetch("http://localhost:3008/esqueceuSenha", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });
    const data = await response.json();
    return data
  } catch (error) {
    console.error("Ocorreu um erro:", error.message);
  }
};


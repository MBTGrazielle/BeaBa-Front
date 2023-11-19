

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
    localStorage.removeItem("diretorio");
  
    window.location.href = "../../../../login/index.html";
  });

window.addEventListener("load", function () {
    buscarInformacoesDoUsuario()
    console.log(buscarInformacoesDoUsuario)

    const queryString = window.location.search;


    const urlParams = new URLSearchParams(queryString);

    const templateId = urlParams.get("templateId");
    localStorage.setItem('id_template',templateId)
    if (templateId) {
        const inputId = document.getElementById('input-id')
        inputId.value = templateId
    } else {
        console.log("Nenhum ID do template encontrado na query string.");
    }
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
    try {
        const response = await fetch(
            `http://localhost:3008/adm/templates/${status_template}/${nome_area}/${squad} `
        );
        const data = await response.json();

        return data

    } catch (error) {
        console.error(error.message);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const fileInput = document.getElementById("fileInput");
    const btnEnvia = document.getElementById("btn-envia");
    const squad= localStorage.getItem("usuarioSquad")
    const area= localStorage.getItem("usuarioArea")

    const btnDiretorio = document.querySelector(".btn-diretorio");
    btnDiretorio.style.display = "none";

    document.querySelector(".select-upload").addEventListener("change", async ()=>{
        if( document.querySelector(".select-upload").value==="Selecione"){
            btnDiretorio.style.display = "none"; 
        }else{
         btnDiretorio.style.display = "block";   
        } 
    } )

    btnEnvia.addEventListener("click", async () => {
        let estadoOperacao = "verificando"; 

        const referencia_template = localStorage.getItem("id_template");
        const referencia_usuario = localStorage.getItem("usuarioId");
        const diretorio = document.querySelector(".select-upload").value
        const squad= localStorage.getItem("usuarioSquad")
        const area= localStorage.getItem("usuarioArea")
        const nomeUsuarioUpload= localStorage.getItem("usuarioNome")

        if (confirm("Confirmar envio do arquivo?")) {
            estadoOperacao = "enviando"; 
            
            const file = fileInput.files[0];

            if (!file) {
                alert("Selecione um arquivo antes de enviar.");
                return;
            }

            const formData = new FormData();
            formData.append("file", file);
            formData.append("referencia_template", referencia_template);
            formData.append("referencia_usuario", referencia_usuario);
            formData.append("diretorio", diretorio);
            formData.append("squad", squad);
            formData.append("area", area);
            formData.append("nomeUsuarioUpload", nomeUsuarioUpload);
           
            const url = `/upload_file/${referencia_template}`;

            try {
                const response = await fetch(url, {
                    method: 'POST',
                    body: formData,
                });
                console.log(response)
                if (response.status === 200) {
                    estadoOperacao = "enviado"; 
                    alert("Arquivo enviado com sucesso");
                    fileInput.value = null;
                } else {
                    const errorData = await response.json();
                    alert(`Erro ao enviar o arquivo: ${errorData.error}`);
                }
            } catch (error) {
                console.error('Erro ao fazer a requisição:', error);
                alert("Arquivo Enviado");
            }
        } else {
            alert("Ação cancelada");
        }
    });
});







  












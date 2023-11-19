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

const retornoMensagem = document.getElementById('template-container')
const retornoMensagemPendente = document.getElementById('template-container-pendente')
const retornoMensagemInvalidado = document.getElementById('template-container-invalidado')

window.addEventListener("load", async function () {

  buscarInformacoesDoUsuario();

  const id_usuario = localStorage.getItem("usuarioId");
  const usuarioSquad = localStorage.getItem("usuarioSquad")
  const area_usuario = localStorage.getItem("usuarioArea")

  let respostaAtivo = await buscarTemplateStatus('Ativo', area_usuario, usuarioSquad);

  renderTemplatesAtivos(respostaAtivo.resultado);

  if (respostaAtivo.status === 404) {
    Swal.fire("Não há templates ativos", "", "info");
    retornoMensagem.innerHTML = "Não há templates ativos"
    retornoMensagem.style.color = "red";
    retornoMensagem.style.fontWeight = "bold";
    retornoMensagem.style.marginTop = "190px";
    retornoMensagem.style.marginLeft = "400px";
  }

  const flexSwitchCheckChecked = document.querySelectorAll('#flexSwitchCheckChecked');

  flexSwitchCheckChecked.forEach((element) => {
    element.addEventListener("click", async function () {
      const templateId = element.getAttribute("data-template-id");
      Swal.fire({
        title: "Confirma a inativação do template?",
        inputLabel: "Informe o motivo",
        showCancelButton: true,
        confirmButtonText: "Confirmar",
        cancelButtonText: "Cancelar",
      }).then(async (result) => {
        if (result.isConfirmed) {
          if (!element.checked) {
            await inativarTemplate(templateId)
            Swal.fire("Template inativado", "", "success");
            setTimeout(function () {
              window.location.reload()
            }, 1500);
          }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          Swal.fire("Ação cancelada", "", "error");
          element.checked = true;
        }
      });
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
              await deletarTemplate(templateId)
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

  const itemEditar = document.querySelectorAll('.item-editar');

  itemEditar.forEach((element, index) => {
    element.addEventListener("click", async (event) => {
      event.preventDefault();
      const templateId = element.getAttribute("data-template-id");

      try {
        const resultado = await visualizarTemplate(templateId);

        if (resultado.resultadoTemplates && resultado.resultadoTemplates.length > 0) {
          const modalConteudoEdicao = document.getElementById('modalConteudoEdicao');
          const camposEtipos = resultado.camposEtipos;
          const camposKeys = Object.keys(resultado.camposEtipos);

          modalConteudoEdicao.innerHTML = `
          <p><strong>ID:</strong> ${resultado.resultadoTemplates[0].id_template}</p>
          <label for="nome-template">Nome: </label>
    <input type="text" name="nome-template" id="nome-template" value="${resultado.resultadoTemplates[0].nome_template}" />
    <br><br>
    <label for="objetivo-template">Objetivo: </label>
    <input type="text" name="objetivo-template" id="objetivo-template" value="${resultado.resultadoTemplates[0].objetivo_template}" />
    <br><br>
    <label for="extensao-template">Extensão: </label>
    <select class="form-select" id="form-acesso-modal">                                
                                    <option value="CSV">CSV</option>
                                    <option value="XLS">XLS</option>
                                    <option value="XLSX">XLSX</option>
    </select> 
 
    <br><h4>Campos</h4>
    ${camposKeys.map((campo, index) => `
    <strong><p>${campo}:</strong> <br>
      Campo:<input id="form-acesso-3-${index}" type="text" value="${resultado.camposEtipos[campo].nome}"data-campo-id="${resultado.camposEtipos[campo].id}"data-campo="${resultado.camposEtipos[campo].nome}"></input> 
      Tipo:<select class="form-select" id="form-acesso-2-${index}">
        <option value="varchar"${resultado.camposEtipos[campo].tipo === 'VARCHAR' ? ' selected' : ''}>VARCHAR</option>
        <option value="timestamp"${resultado.camposEtipos[campo].tipo === 'TIMESTAMP' ? ' selected' : ''}>TIMESTAMP</option>
        <option value="int"${resultado.camposEtipos[campo].tipo === 'INT' ? ' selected' : ''}>INT</option>
        <option value="date"${resultado.camposEtipos[campo].tipo === 'DATE' ? ' selected' : ''}>DATE</option>
        <option value="boolean"${resultado.camposEtipos[campo].tipo === 'BOOLEAN' ? ' selected' : ''}>BOOLEAN</option>
        <option value="numeric"${resultado.camposEtipos[campo].tipo === 'NUMERIC' ? ' selected' : ''}>NUMERIC</option>
      </select>
    
    </p>`).join('')}
   
    
  `;

          const extensao = document.getElementById('form-acesso-modal');
          extensao.value = `${resultado.resultadoTemplates[0].extensao_template}`

          camposKeys.forEach((campo, index) => {
            const selectElement = document.getElementById(`form-acesso-2-${index}`);
            const tipoCampo = resultado.camposEtipos[campo].tipo;
            selectElement.value = tipoCampo;
          });

          const editarModal = new bootstrap.Modal(document.getElementById('editarModal'));
          editarModal.show();

          const btnAtualizar = document.querySelector('.atualizar-btn');

          btnAtualizar.addEventListener("click", async () => {
            const extensaoAtualizada = extensao.value;
            const nomeTemplate = document.getElementById('nome-template').value;
            const objetivoTemplate = document.getElementById('objetivo-template').value;

            const camposAtualizados = camposKeys.map((campo, index) => ({
              id_campo: resultado.camposEtipos[campo].id,
              nome_campo: document.getElementById(`form-acesso-3-${index}`).value,
              tipo_dado_campo: document.getElementById(`form-acesso-2-${index}`).value,
            }));

            const dadosAtualizados = {
              nome_template: nomeTemplate,
              objetivo_template: objetivoTemplate,
              extensao_template: extensaoAtualizada,
              campos: camposAtualizados
            };
            
            const resposta = await fetch(`http://localhost:3008/adm/atualizarTemplate/${templateId}`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(dadosAtualizados),
            });

            if (resposta.ok) {
              Swal.fire("Template atualizado com sucesso", "", "success");
              setTimeout(function () {
                window.location.reload()
              }, 1500);
            } else {
              console.error('Erro ao atualizar o template e campos.');
            }
          });
        }
      } catch (error) {
        console.error("Erro ao editar o template:", error);
      }
    });
  });

  const itemDownload = document.querySelectorAll('.item-download');

  itemDownload.forEach((element, index) => {
    element.addEventListener("click", async (event) => {
      event.preventDefault();
      const templateId = element.getAttribute("data-template-id");
      const extensao = element.getAttribute("data-template-extensao");
      const nomeTemplate = element.getAttribute("data-template-nome");

      try {
        const resultado = await visualizarTemplate(templateId);
        const camposEtipos = resultado.camposEtipos;

        const cabecalhos = Object.values(camposEtipos).map(campo => campo.nome);

        const dados = [];

        const csvData = [
          cabecalhos.join(','),
          ...dados.map(dado => cabecalhos.map(campo => dado[campo]).join(','))
        ].join('\n');

        const blob = new Blob([csvData], { type: 'text/csv' });

        const blobURL = window.URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = blobURL;
        a.download = `${nomeTemplate}.${extensao}`;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        window.URL.revokeObjectURL(blobURL);
      } catch (error) {
        console.error("Erro ao fazer o download do template:", error);
      }
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
        }
      } else {
        Swal.fire("Template não encontrado", "", "error");
      }
    } catch (error) {
      console.error('Erro ao buscar templates:', error);
    }
  });

  apagar.addEventListener('click', async () => {
    let respostaAtivo = await buscarTemplateStatus('Ativo', area_usuario, usuarioSquad);

    renderTemplatesAtivos(respostaAtivo.resultado);

    if (respostaAtivo) {
      buscaID.value = ''
      buscaNome.value = ''
      buscaCriador.value = ''
      buscaExtensao.value = ''
    }
  })

  const itemUpload = document.querySelectorAll('.item-upload');

  itemUpload.forEach((element, index) => {
    element.addEventListener("click", async (event) => {
      event.preventDefault();
      const templateId = element.getAttribute("data-template-id");
      Swal.fire({
        title: `Deseja fazer o upload do template ID: ${templateId}?`,
        inputLabel: "Informe o motivo",
        showCancelButton: true,
        confirmButtonText: "Confirmar",
        cancelButtonText: "Cancelar",
      }).then(async (result) => {
        if (result.isConfirmed) {
          window.location.href = `../../upload/templates/index.html?templateId=${templateId}`;
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          Swal.fire("Ação cancelada", "", "error");
        }
      });
    });
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
  localStorage.setItem('status', status_template)
  try {
    const response = await fetch(
      `http://localhost:3008/adm/templates/${status_template}/${nome_area}/${squad} `
    );
    const data = await response.json();
    console.log(data)

    return data

  } catch (error) {
    console.error(error.message);
  }
}

const validadosTemplates = document.getElementById('validados-tab');
const pendentesTemplates = document.getElementById('pendentes-tab');
const invalidadosTemplates = document.getElementById('invalidados-tab');

validadosTemplates.addEventListener('click', async () => {
  await atualizarListaTemplatesValidados();

});

async function atualizarListaTemplatesValidados() {
  const id_usuario = localStorage.getItem("usuarioId");
  const usuarioSquad = localStorage.getItem("usuarioSquad")
  const area_usuario = localStorage.getItem("usuarioArea")

  let respostaAtivo = await buscarTemplateStatus('Ativo', area_usuario, usuarioSquad)
  renderTemplatesAtivos(respostaAtivo.resultado);

  if (respostaAtivo.resultado.length === 0) {
    Swal.fire("Não há templates ativos", "", "info");
    retornoMensagem.innerHTML = "Não há templates ativos"
    retornoMensagem.style.color = "red";
    retornoMensagem.style.fontWeight = "bold";
    retornoMensagem.style.marginTop = "190px";
    retornoMensagem.style.marginLeft = "400px";
  }

  const flexSwitchCheckChecked = document.querySelectorAll('#flexSwitchCheckChecked');

  flexSwitchCheckChecked.forEach((element) => {
    element.addEventListener("click", async function () {
      const templateId = element.getAttribute("data-template-id");
      Swal.fire({
        title: "Confirma a inativação do template?",
        inputLabel: "Informe o motivo",
        showCancelButton: true,
        confirmButtonText: "Confirmar",
        cancelButtonText: "Cancelar",
      }).then(async (result) => {
        if (result.isConfirmed) {
          if (!element.checked) {
            await inativarTemplate(templateId)
            Swal.fire("Template inativado", "", "success");
            setTimeout(function () {
              window.location.reload()
            }, 1500);
          }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          Swal.fire("Ação cancelada", "", "error");
          element.checked = true;
        }
      });
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
              setTimeout(async function () {
                await atualizarListaTemplatesValidados();
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

  const itemEditar = document.querySelectorAll('.item-editar');

  itemEditar.forEach((element, index) => {
    element.addEventListener("click", async (event) => {
      event.preventDefault();
      const templateId = element.getAttribute("data-template-id");

      try {
        const resultado = await visualizarTemplate(templateId);

        if (resultado.resultadoTemplates && resultado.resultadoTemplates.length > 0) {
          const modalConteudoEdicao = document.getElementById('modalConteudoEdicao');
          const camposEtipos = resultado.camposEtipos;
          const camposKeys = Object.keys(resultado.camposEtipos);

          modalConteudoEdicao.innerHTML = `
          <p><strong>ID:</strong> ${resultado.resultadoTemplates[0].id_template}</p>
          <label for="nome-template">Nome: </label>
    <input type="text" name="nome-template" id="nome-template" value="${resultado.resultadoTemplates[0].nome_template}" />
    <br><br>
    <label for="objetivo-template">Objetivo: </label>
    <input type="text" name="objetivo-template" id="objetivo-template" value="${resultado.resultadoTemplates[0].objetivo_template}" />
    <br><br>
    <label for="extensao-template">Extensão: </label>
    <select class="form-select" id="form-acesso-modal">                                
                                    <option value="CSV">CSV</option>
                                    <option value="XLS">XLS</option>
                                    <option value="XLSX">XLSX</option>
    </select> 
 
    <br><h4>Campos</h4>
    ${camposKeys.map((campo, index) => `
    <strong><p>${campo}:</strong> <br>
      Campo:<input id="form-acesso-3-${index}" type="text" value="${resultado.camposEtipos[campo].nome}"data-campo-id="${resultado.camposEtipos[campo].id}"data-campo="${resultado.camposEtipos[campo].nome}"></input> 
      Tipo:<select class="form-select" id="form-acesso-2-${index}">
        <option value="varchar"${resultado.camposEtipos[campo].tipo === 'VARCHAR' ? ' selected' : ''}>VARCHAR</option>
        <option value="timestamp"${resultado.camposEtipos[campo].tipo === 'TIMESTAMP' ? ' selected' : ''}>TIMESTAMP</option>
        <option value="int"${resultado.camposEtipos[campo].tipo === 'INT' ? ' selected' : ''}>INT</option>
        <option value="date"${resultado.camposEtipos[campo].tipo === 'DATE' ? ' selected' : ''}>DATE</option>
        <option value="boolean"${resultado.camposEtipos[campo].tipo === 'BOOLEAN' ? ' selected' : ''}>BOOLEAN</option>
        <option value="numeric"${resultado.camposEtipos[campo].tipo === 'NUMERIC' ? ' selected' : ''}>NUMERIC</option>
      </select>
    
    </p>`).join('')}
   
    
  `;

          const extensao = document.getElementById('form-acesso-modal');
          extensao.value = `${resultado.resultadoTemplates[0].extensao_template}`

          camposKeys.forEach((campo, index) => {
            const selectElement = document.getElementById(`form-acesso-2-${index}`);
            const tipoCampo = resultado.camposEtipos[campo].tipo;
            selectElement.value = tipoCampo;
          });

          const editarModal = new bootstrap.Modal(document.getElementById('editarModal'));
          editarModal.show();

          const btnAtualizar = document.querySelector('.atualizar-btn');

          btnAtualizar.addEventListener("click", async () => {
            const extensaoAtualizada = extensao.value;
            const nomeTemplate = document.getElementById('nome-template').value;
            const objetivoTemplate = document.getElementById('objetivo-template').value;

            const camposAtualizados = camposKeys.map((campo, index) => ({
              id_campo: resultado.camposEtipos[campo].id,
              nome_campo: document.getElementById(`form-acesso-3-${index}`).value,
              tipo_dado_campo: document.getElementById(`form-acesso-2-${index}`).value,
            }));

            const dadosAtualizados = {
              nome_template: nomeTemplate,
              objetivo_template: objetivoTemplate,
              extensao_template: extensaoAtualizada,
              campos: camposAtualizados
            };
            const resposta = await fetch(`http://localhost:3008/adm/atualizarTemplate/${templateId}`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(dadosAtualizados),
            });

            if (resposta.ok) {
              Swal.fire("Template atualizado com sucesso", "", "success");
              setTimeout(function () {
                window.location.reload()
              }, 1500);
            } else {
              console.error('Erro ao atualizar o template e campos.');
            }
          });
        }
      } catch (error) {
        console.error("Erro ao editar o template:", error);
      }
    });
  });

  const itemDownload = document.querySelectorAll('.item-download');

  itemDownload.forEach((element, index) => {
    element.addEventListener("click", async (event) => {
      event.preventDefault();
      const templateId = element.getAttribute("data-template-id");
      const extensao = element.getAttribute("data-template-extensao");
      const nomeTemplate = element.getAttribute("data-template-nome");

      try {
        const resultado = await visualizarTemplate(templateId);
        const camposEtipos = resultado.camposEtipos;

        const cabecalhos = Object.values(camposEtipos).map(campo => campo.nome);

        const dados = [];

        const csvData = [
          cabecalhos.join(','),
          ...dados.map(dado => cabecalhos.map(campo => dado[campo]).join(','))
        ].join('\n');

        const blob = new Blob([csvData], { type: 'text/csv' });

        const blobURL = window.URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = blobURL;
        a.download = `${nomeTemplate}.${extensao}`;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        window.URL.revokeObjectURL(blobURL);
      } catch (error) {
        console.error("Erro ao fazer o download do template:", error);
      }
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
        }
      } else {
        Swal.fire("Template não encontrado", "", "error");
      }
    } catch (error) {
      console.error('Erro ao buscar templates:', error);
    }
  });

  apagar.addEventListener('click', async () => {
    let respostaAtivo = await buscarTemplateStatus('Ativo', area_usuario, usuarioSquad);

    renderTemplatesAtivos(respostaAtivo.resultado);

    if (respostaAtivo) {
      buscaID.value = ''
      buscaNome.value = ''
      buscaCriador.value = ''
      buscaExtensao.value = ''
    }
  })


  const itemUpload = document.querySelectorAll('.item-upload');

  itemUpload.forEach((element, index) => {
    element.addEventListener("click", async (event) => {
      event.preventDefault();
      const templateId = element.getAttribute("data-template-id");
      Swal.fire({
        title: `Deseja fazer o upload do template ID: ${templateId}?`,
        inputLabel: "Informe o motivo",
        showCancelButton: true,
        confirmButtonText: "Confirmar",
        cancelButtonText: "Cancelar",
      }).then(async (result) => {
        if (result.isConfirmed) {
          window.location.href = `../../upload/templates/index.html?templateId=${templateId}`;
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          Swal.fire("Ação cancelada", "", "error");
        }
      });
    });
  })

}

pendentesTemplates.addEventListener('click', async () => {
  await atualizarListaTemplatesPendentes();

});

async function atualizarListaTemplatesPendentes() {
  const usuarioSquad = localStorage.getItem("usuarioSquad")
  const area_usuario = localStorage.getItem("usuarioArea")
  const id_usuario = localStorage.getItem("usuarioId");

  let respostaPendente = await buscarTemplateStatus('Pendente', area_usuario, usuarioSquad);

  renderTemplatesPendentes(respostaPendente.resultado);

  if (respostaPendente.status === 404) {
    Swal.fire("Não há templates pendentes", "", "info");
    retornoMensagemPendente.innerHTML = "Não há templates pendentes";
    retornoMensagemPendente.style.color = "red";
    retornoMensagemPendente.style.fontWeight = "bold";
    retornoMensagemPendente.style.marginTop = "190px";
    retornoMensagemPendente.style.marginLeft = "400px";
  }

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
              setTimeout(async function () {
                await atualizarListaTemplatesPendentes();
              }, 1000);
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

  const itemReprovar = document.querySelectorAll('.invalidar-btn');

  itemReprovar.forEach((element, index) => {
    element.addEventListener("click", async (event) => {
      event.preventDefault();
      const templateId = element.getAttribute("data-template-id");

      try {
        const buscaAdm = await buscarInformacoesDoUsuario()
        let nomeAdm = buscaAdm.usuario[0].nome_usuario

        const buscaEmail = await visualizarTemplate(templateId);
        let email = buscaEmail.resultadoTemplates[0].referencia_email

        Swal.fire({
          title: "Confirma a invalidação do template?",
          input: "text",
          inputLabel: "Informe o motivo",
          showCancelButton: true,
          confirmButtonText: "Confirmar",
          cancelButtonText: "Cancelar",
        }).then(async (result) => {
          if (result.isConfirmed) {
            let motivo_invalidacao = Swal.getInput().value;

            if (!motivo_invalidacao) {
              Swal.fire("Informe o motivo da invalidação", "", "warning");
              return;
            }

            Swal.fire({
              title: "Invalidando...",
              allowEscapeKey: false,
              allowOutsideClick: false,
              onOpen: () => {
                Swal.showLoading();
              },
            });

            try {
              await invalidarTemplate(templateId, email, motivo_invalidacao, nomeAdm);
              Swal.close();
              Swal.fire("Template invalidado com sucesso", "", "success");

              setTimeout(async function () {
                buscarInformacoesDoUsuario()
                await atualizarListaTemplatesPendentes();
              }, 1200);
            } catch (error) {
              Swal.fire("Erro ao invalidar o template", "", "error");
            }
          } else if (result.dismiss === Swal.DismissReason.cancel) {
            Swal.fire("Ação cancelada", "", "error");
          }
        });
      } catch (error) {
        console.error("Erro ao buscar informações do usuário:", error);
      }
    });
  });


  const itemAprovar = document.querySelectorAll('.validar-btn');

  itemAprovar.forEach((element, index) => {
    element.addEventListener("click", async (event) => {
      event.preventDefault();
      const templateId = element.getAttribute("data-template-id");

      Swal.fire({
        title: "Confirma a validação do template?",
        inputLabel: "Informe o motivo",
        showCancelButton: true,
        confirmButtonText: "Confirmar",
        cancelButtonText: "Cancelar",
      }).then(async (result) => {
        if (result.isConfirmed) {
          await ativarTemplate(templateId);
          Swal.fire("Template validado com sucesso", "", "success");
          setTimeout(async function () {
            buscarInformacoesDoUsuario()
            await atualizarListaTemplatesPendentes();
          }, 1200);
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          Swal.fire("Ação cancelada", "", "error");
        }
      });
    });
  })


  const itemEditar = document.querySelectorAll('.item-editar');

  itemEditar.forEach((element, index) => {
    element.addEventListener("click", async (event) => {
      event.preventDefault();
      const templateId = element.getAttribute("data-template-id");

      try {
        const resultado = await visualizarTemplate(templateId);

        if (resultado.resultadoTemplates && resultado.resultadoTemplates.length > 0) {
          const modalConteudoEdicao = document.getElementById('modalConteudoEdicao');
          const camposEtipos = resultado.camposEtipos;
          const camposKeys = Object.keys(resultado.camposEtipos);

          modalConteudoEdicao.innerHTML = `
          <p><strong>ID:</strong> ${resultado.resultadoTemplates[0].id_template}</p>
          <label for="nome-template">Nome: </label>
    <input type="text" name="nome-template" id="nome-template" value="${resultado.resultadoTemplates[0].nome_template}" />
    <br><br>
    <label for="objetivo-template">Objetivo: </label>
    <input type="text" name="objetivo-template" id="objetivo-template" value="${resultado.resultadoTemplates[0].objetivo_template}" />
    <br><br>
    <label for="extensao-template">Extensão: </label>
    <select class="form-select" id="form-acesso-modal">                                
                                    <option value="CSV">CSV</option>
                                    <option value="XLS">XLS</option>
                                    <option value="XLSX">XLSX</option>
    </select> 
 
    <br><h4>Campos</h4>
    ${camposKeys.map((campo, index) => `
    <strong><p>${campo}:</strong> <br>
      Campo:<input id="form-acesso-3-${index}" type="text" value="${resultado.camposEtipos[campo].nome}"data-campo-id="${resultado.camposEtipos[campo].id}"data-campo="${resultado.camposEtipos[campo].nome}"></input> 
      Tipo:<select class="form-select" id="form-acesso-2-${index}">
        <option value="varchar"${resultado.camposEtipos[campo].tipo === 'VARCHAR' ? ' selected' : ''}>VARCHAR</option>
        <option value="timestamp"${resultado.camposEtipos[campo].tipo === 'TIMESTAMP' ? ' selected' : ''}>TIMESTAMP</option>
        <option value="int"${resultado.camposEtipos[campo].tipo === 'INT' ? ' selected' : ''}>INT</option>
        <option value="date"${resultado.camposEtipos[campo].tipo === 'DATE' ? ' selected' : ''}>DATE</option>
        <option value="boolean"${resultado.camposEtipos[campo].tipo === 'BOOLEAN' ? ' selected' : ''}>BOOLEAN</option>
        <option value="numeric"${resultado.camposEtipos[campo].tipo === 'NUMERIC' ? ' selected' : ''}>NUMERIC</option>
      </select>
    
    </p>`).join('')}
   
    
  `;

          const extensao = document.getElementById('form-acesso-modal');
          extensao.value = `${resultado.resultadoTemplates[0].extensao_template}`

          camposKeys.forEach((campo, index) => {
            const selectElement = document.getElementById(`form-acesso-2-${index}`);
            const tipoCampo = resultado.camposEtipos[campo].tipo;
            selectElement.value = tipoCampo;
          });

          const editarModal = new bootstrap.Modal(document.getElementById('editarModal'));
          editarModal.show();

          const btnAtualizar = document.querySelector('.atualizar-btn');

          btnAtualizar.addEventListener("click", async () => {
            const extensaoAtualizada = extensao.value;
            const nomeTemplate = document.getElementById('nome-template').value;
            const objetivoTemplate = document.getElementById('objetivo-template').value;

            const camposAtualizados = camposKeys.map((campo, index) => ({
              id_campo: resultado.camposEtipos[campo].id,
              nome_campo: document.getElementById(`form-acesso-3-${index}`).value,
              tipo_dado_campo: document.getElementById(`form-acesso-2-${index}`).value,
            }));

            const dadosAtualizados = {
              nome_template: nomeTemplate,
              objetivo_template: objetivoTemplate,
              extensao_template: extensaoAtualizada,
              campos: camposAtualizados
            };
            const resposta = await fetch(`http://localhost:3008/adm/atualizarTemplate/${templateId}`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(dadosAtualizados),
            });

            if (resposta.ok) {
              Swal.fire("Template atualizado com sucesso", "", "success");
              setTimeout(function () {
                window.location.reload()
              }, 1500);
            } else {
              console.error('Erro ao atualizar o template e campos.');
            }
          });
        }
      } catch (error) {
        console.error("Erro ao editar o template:", error);
      }
    });
  });

  const apagar = document.getElementById('apagar');

  apagar.addEventListener('click', async () => {
    let respostaPendente = await buscarTemplateStatus('Pendente', area_usuario, usuarioSquad);

    renderTemplatesPendentes(respostaPendente.resultado);

    if (respostaPendente) {
      buscaID.value = ''
      buscaNome.value = ''
      buscaCriador.value = ''
      buscaExtensao.value = ''
    }
  })

}

invalidadosTemplates.addEventListener('click', async () => {
  await atualizarListaTemplatesInvalidados();
});

async function atualizarListaTemplatesInvalidados() {
  const id_usuario = localStorage.getItem("usuarioId");
  const usuarioSquad = localStorage.getItem("usuarioSquad")
  const area_usuario = localStorage.getItem("usuarioArea")

  let respostaInvalidado = await buscarTemplateStatus('Invalidado', area_usuario, usuarioSquad);
  renderTemplatesInvalidados(respostaInvalidado.resultado);

  if (respostaInvalidado.resultado.length === 0) {
    Swal.fire("Não há templates invalidados", "", "info");
    retornoMensagemInvalidado.innerHTML = "Não há templates invalidados";
    retornoMensagemInvalidado.style.color = "red";
    retornoMensagemInvalidado.style.fontWeight = "bold";
    retornoMensagemInvalidado.style.marginTop = "190px";
    retornoMensagemInvalidado.style.marginLeft = "400px";
  }

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
              setTimeout(async function () {
                await atualizarListaTemplatesInvalidados();
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

  const itemRetornar = document.querySelectorAll('.voltar-btn');

  itemRetornar.forEach((element, index) => {
    element.addEventListener("click", (event) => {
      event.preventDefault();
      const templateId = element.getAttribute("data-template-id");

      Swal.fire({
        title: "Escolha o direcionamento do template",
        showCancelButton: true,
        showConfirmButton: true,
        showDenyButton: true,
        confirmButtonText: "Ativo",
        denyButtonText: "Pendente",
        cancelButtonText: "Cancelar",
        customClass: {
          confirmButton: "btn-ativo",
        },
      }).then((result) => {
        if (result.isConfirmed) {
          ativarTemplate(templateId)
            .then(() => {
              Swal.close();
              Swal.fire("Template ativado com sucesso", "", "success");

              setTimeout(() => {
                atualizarListaTemplatesInvalidados();
                buscarInformacoesDoUsuario()
              }, 1200);
            })
            .catch((error) => {
              Swal.fire("Erro ao ativar o template", "", "error");
            });
        } else if (result.dismiss === Swal.DismissReason.deny) {
          pendenteTemplate(templateId)
            .then(() => {
              Swal.close();
              Swal.fire("Template direcionado para Pendente", "", "success");

              setTimeout(() => {
                atualizarListaTemplatesInvalidados();
                buscarInformacoesDoUsuario()
              }, 1200);
            })
            .catch((error) => {
              Swal.fire("Erro ao enviar o template para pendente", "", "error");
            });
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          Swal.fire("Ação cancelada", "", "error");
        }
      });
    });
  });

  const apagar = document.getElementById('apagar');

  apagar.addEventListener('click', async () => {
    let respostaInvalidado = await buscarTemplateStatus('Invalidado', area_usuario, usuarioSquad);

    renderTemplatesInvalidados(respostaInvalidado.resultado);

    if (respostaInvalidado) {
      buscaID.value = ''
      buscaNome.value = ''
      buscaCriador.value = ''
      buscaExtensao.value = ''
    }
  })
}

function formatarDataComHorario(data) {
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };
  return new Date(data).toLocaleDateString('pt-BR', options);
}

function createTemplateElementAtivo(template) {
  const templateHTMLAtivo = `
    <div class="col-md-6 mt-2 mt-2">
      <div class="cardTemplate w-100 p-4 rounded-4 mt-1">
        <header class="d-flex justify-content-between align-items-center">
          <span class="badge text-bg-success px-3 pt-2 pb-2 fs-6">${template.status_template}</span>
          <div class="form-check form-switch">
          <input class="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckChecked" data-template-id="${template.id_template}" checked />
          </div>
          <li class="nav-item dropdown nav-card">
            <a class="nav-link dropdown-toggle teste" data-bs-toggle="dropdown" href="#" role="button" aria-expanded="false"> Menu </a>
            <ul class="dropdown-menu">
              <li><a class="dropdown-item item-visualizar" data-template-id="${template.id_template}" href="#">Visualizar</a></li>
              <li><a class="dropdown-item item-editar" data-template-id="${template.id_template}" href="#">Editar</a></li>
              <li><a class="dropdown-item item-download" data-template-nome="${template.nome_template}"  data-template-extensao="${template.extensao_template}" data-template-id="${template.id_template}" href="#">Download</a></li>
              <li><a class="dropdown-item item-upload" data-template-id="${template.id_template}" href="#">Upload</a></li>
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
  return templateHTMLAtivo;
}

function createTemplateElementPendente(template) {
  const templateHTMLPendente = `
    <div class="col-md-6 mt-2 mt-2">
      <div class="cardTemplate p-4 rounded-4 mt-1">
        <header class="d-flex justify-content-between align-items-center">
          <span class="badge text-bg-warning text-white pt-2 pb-2 fs-6">
          ${template.status_template}
          </span>
          <div class="d-flex gap-3">
            <button type="button" class="btn btn-success validar-btn" data-template-id="${template.id_template}">
              <i class="fas fa-check text-success text-white"></i>
            </button>
            <button type="button" class="btn btn-danger invalidar-btn" data-template-id="${template.id_template}">
              <i class="fas fa-times text-danger text-white"></i>
            </button>
          </div>
          <li class="nav-item dropdown nav-card">
            <a class="nav-link dropdown-toggle teste" data-bs-toggle="dropdown" href="#" role="button" aria-expanded="false"> Menu </a>
            <ul class="dropdown-menu">
              <li><a class="dropdown-item item-visualizar" data-template-id="${template.id_template}" href="#">Visualizar</a></li>
              <li><a class="dropdown-item item-editar" data-template-id="${template.id_template}" href="#">Editar</a></li>
              <li><a class="dropdown-item item-remover" data-template-id="${template.id_template}" href="#">Remover</a></li>
            </ul>
          </li>
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
              <strong>Formato:</strong> ${template.extensao_template}
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
  return templateHTMLPendente;
}

function createTemplateElementInvalido(template) {
  const templateHTMLInvalidado = `
    <div class="col-md-6 mt-2 mt-2">
      <div class="cardTemplate p-4 rounded-4 mt-1">
        <header class="d-flex justify-content-between align-items-center">
          <span class="badge text-bg-danger text-white px-4 pt-2 pb-2 fs-6">
          ${template.status_template}
          </span>
          <div>
            <a href="#" class="btn btn-secondary voltar-btn" data-template-id="${template.id_template}">
              <i class="fas fa-arrow-left"></i>
            </a>
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
              <strong>Formato:</strong> ${template.extensao_template}
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
  return templateHTMLInvalidado;
}

function renderTemplatesAtivos(templates) {
  const templateContainerAtivo = document.getElementById('template-container');

  templateContainerAtivo.innerHTML = '';
  templates.forEach((template) => {
    const templateElement = createTemplateElementAtivo(template);
    templateContainerAtivo.innerHTML += templateElement;
  });
}

function renderTemplatesPendentes(templates) {
  const templateContainerPendente = document.getElementById('template-container-pendente');

  templateContainerPendente.innerHTML = '';
  templates.forEach((templatePendente) => {
    const templateElementPendente = createTemplateElementPendente(templatePendente);
    templateContainerPendente.innerHTML += templateElementPendente;
  });
}

function renderTemplatesInvalidados(templates) {
  const templateContainerInvalidado = document.getElementById('template-container-invalidado');

  templateContainerInvalidado.innerHTML = '';
  templates.forEach((templateInvalidado) => {
    const templateElementInvalidado = createTemplateElementInvalido(templateInvalidado);
    templateContainerInvalidado.innerHTML += templateElementInvalidado;
  });
}

async function inativarTemplate(template) {
  const id_template = template
  try {
    const formData = new FormData();
    formData.append("status_template", 'Inativo');

    const response = await fetch(
      `http://localhost:3008/adm/inativarTemplate/${id_template}`,
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

async function pendenteTemplate(template) {
  const id_template = template
  try {
    const formData = new FormData();
    formData.append("status_template", 'Pendente');

    const response = await fetch(
      `http://localhost:3008/adm/pendenteTemplate/${id_template}`,
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

const invalidarTemplate = async (templateId, email, motivo_invalidacao, nome) => {
  try {
    const requestData = {
      motivo_invalidacao: motivo_invalidacao,
    };

    const response = await fetch(
      `http://localhost:3008/adm/invalidarTemplate/${templateId}/${email}/${nome}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      }
    );

    if (response.ok) {
      return response.json();
    } else {
      throw new Error("Erro ao invalidar o template");
    }
  } catch (error) {
    throw error;
  }
};

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

async function ativarTemplate(templateId) {
  const id_template = templateId
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



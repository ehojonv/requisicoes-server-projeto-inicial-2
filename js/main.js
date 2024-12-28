import ui from "./ui.js"
import api from "./api.js";

const setPensamentos = new Set();

async function addChaveAoPensamento() {
  try {
    const pensamentos = await api.buscarPensamentos();
    pensamentos.forEach(pensamento => {
      const chavePensamento = `${pensamento.conteudo.trim().toLowerCase()}-${pensamento.autoria.trim().toLowerCase()}`
      setPensamentos.add(chavePensamento)
    })
  } catch (error) {
    alert("erro ao adicionar chave ao pensamento")
  }
}

const regexConteudo = /^[A-Za-zÀ-ÿ\s!,]{10,}$/;

const regexAutoria = /^[A-Za-z\s]{3,15}$/

function validarConteudo(conteudo) {
  return regexConteudo.test(conteudo);
}

function validarAutoria(autoria) {
  return regexAutoria.test(autoria);
}

document.addEventListener("DOMContentLoaded", () => {
  ui.renderizarPensamentos()

  addChaveAoPensamento()

  const formularioPensamento = document.getElementById("pensamento-form");
  const botaoCancelar = document.getElementById("botao-cancelar");
  const inputBuscaPensamento = document.querySelector("#campo-busca")

  formularioPensamento.addEventListener("submit", manipularSubmissaoFormulario);
  botaoCancelar.addEventListener("click", manipularCancelamento);
  inputBuscaPensamento.addEventListener("input", manipularBusca);
})

async function manipularSubmissaoFormulario(event) {
  event.preventDefault()
  const id = document.getElementById("pensamento-id").value
  const conteudo = document.getElementById("pensamento-conteudo").value
  const autoria = document.getElementById("pensamento-autoria").value;
  const data = document.querySelector("#pensamento-data").value;

  if (!validarConteudo(conteudo.trim())) {
    alert("Digite algo certo conteudo (10 caracteres minimos - Só letras)")
    return;
  }

  if (!validarAutoria(autoria.trim())) {
    alert("Digite algo certo autoria (3 caracteres minimos - 15 maximos - Só letras - sem espaços)")
    return;
  }

  if (!validarData(data)) {
    alert("Data inválida, insira um valor não futuro");
    return;
  }

  const chaveNovoPensamento = `${conteudo.trim().toLowerCase()}-${autoria.trim().toLowerCase()}`

  if (setPensamentos.has(chaveNovoPensamento)) {
    alert("Pensamento já existe");
    return;
  }

  try {
    if (id) {
      await api.editarPensamento({
        id,
        conteudo,
        autoria,
        data
      })
    } else {
      await api.salvarPensamento({
        conteudo,
        autoria,
        data
      })
    }
    ui.renderizarPensamentos()
  } catch {
    alert("Erro ao salvar pensamento")
  }
}

function manipularCancelamento() {
  ui.limparFormulario()
}

async function manipularBusca() {
  const termoBusca = document.querySelector("#campo-busca").value;
  try {
    const pensamentosFiltrados = await api.buscarPensamentoPorTermo(termoBusca);
    ui.renderizarPensamentos(pensamentosFiltrados)
  } catch (error) {
    alert("Erro ao buscar")
  }
}

function validarData(data) {
  const dataAtual = new Date();
  const dataInserida = new Date(data);
  return dataInserida <= dataAtual;
}
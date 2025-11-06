// =============================================================
//  EsToDoList - CRUD básico de tarefas
//  Versão 2: Com contador e botão de limpar
// =============================================================

// -------------------------------
// 1. Selecionar os elementos da página
// -------------------------------
const campoNovaTarefa = document.getElementById('nova-tarefa-input')
const botaoAdicionar = document.getElementById('adicionar-btn')
const listaTarefas = document.getElementById('lista-de-tarefas')
const campoPesquisa = document.getElementById('pesquisa-input')
const seletorFiltro = document.getElementById('filtro-select')
const formTarefa = document.getElementById('form-tarefa') // NOVO

const contadorTarefasEl = document.getElementById('contador-tarefas')
const botaoLimparConcluidas = document.getElementById('limpar-concluidas-btn')

let tarefas = []

// -------------------------------
// 2. Carregar tarefas salvas no navegador (localStorage)
// -------------------------------
function carregarTarefasSalvas() {
    try {
        const tarefasSalvas = localStorage.getItem('tarefas')
        if (tarefasSalvas) {
            tarefas = JSON.parse(tarefasSalvas)
        }
        filtrarTarefas()
        atualizarContador()
    } catch (error) {
        console.error('Erro ao carregar tarefas:', error)
        tarefas = []
    }
}

// -------------------------------
// 3. Salvar as tarefas no navegador
// -------------------------------
function salvarTarefas() {
    try {
        localStorage.setItem('tarefas', JSON.stringify(tarefas))
    } catch (error) {
        console.error('Erro ao salvar tarefas:', error)
        alert('Erro ao salvar tarefas. Os dados podem ser muito grandes.')
    }
}

// -------------------------------
// 4. Função para adicionar uma nova tarefa
// -------------------------------
function adicionarTarefa() {
    const texto = campoNovaTarefa.value.trim()

    if (texto === '') {
        mostrarNotificacao('Digite uma tarefa antes de adicionar!', 'warning')
        campoNovaTarefa.focus()
        return
    }

    // Validar tamanho máximo
    if (texto.length > 100) {
        mostrarNotificacao('A tarefa deve ter no máximo 100 caracteres!', 'warning')
        return
    }

    const novaTarefa = {
        id: Date.now() + Math.random(), // Mais único
        texto: texto,
        concluida: false,
        dataCriacao: new Date().toISOString()
    }

    tarefas.push(novaTarefa)
    salvarTarefas()

    seletorFiltro.value = 'todos'
    filtrarTarefas()
    atualizarContador()

    campoNovaTarefa.value = ''
    campoNovaTarefa.focus()
    
    mostrarNotificacao('Tarefa adicionada com sucesso!', 'success')
}

// -------------------------------
// 5. Função para exibir as tarefas na tela
// -------------------------------
function exibirTarefas(listaParaMostrar) {
    if (!listaTarefas) return
    
    listaTarefas.innerHTML = ''

    if (listaParaMostrar.length === 0) {
        const itemVazio = document.createElement('li')
        itemVazio.className = 'text-center text-gray-500 py-4'
        itemVazio.textContent = 'Nenhuma tarefa encontrada'
        listaTarefas.appendChild(itemVazio)
        return
    }

    for (let tarefa of listaParaMostrar) {
        const item = document.createElement('li')
        item.className = 'tarefa-item flex justify-between items-center p-3 border rounded-lg shadow-sm bg-gray-50 hover:bg-gray-100 transition'

        if (tarefa.concluida) {
            item.classList.add('concluida')
        }

        const textoTarefa = document.createElement('span')
        textoTarefa.textContent = tarefa.texto
        textoTarefa.className = 'tarefa-texto flex-grow cursor-pointer break-words'
        textoTarefa.onclick = function () {
            alternarConclusao(tarefa.id)
        }

        const botoes = document.createElement('div')
        botoes.className = 'flex space-x-2 ml-2'

        const botaoEditar = document.createElement('button')
        botaoEditar.innerHTML = '✏️'
        botaoEditar.title = 'Editar tarefa'
        botaoEditar.className = 'px-2 py-1 bg-yellow-400 hover:bg-yellow-500 text-white rounded transition'
        botaoEditar.onclick = function (e) {
            e.stopPropagation()
            editarTarefa(tarefa.id)
        }

        const botaoExcluir = document.createElement('button')
        botaoExcluir.innerHTML = '🗑️'
        botaoExcluir.title = 'Excluir tarefa'
        botaoExcluir.className = 'px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded transition'
        botaoExcluir.onclick = function (e) {
            e.stopPropagation()
            excluirTarefa(tarefa.id)
        }

        botoes.appendChild(botaoEditar)
        botoes.appendChild(botaoExcluir)
        item.appendChild(textoTarefa)
        item.appendChild(botoes)
        listaTarefas.appendChild(item)
    }
}

// -------------------------------
// 6. Função para alternar entre concluída e ativa - OTIMIZADA
// -------------------------------
function alternarConclusao(id) {
    const tarefa = tarefas.find(t => t.id === id) // MAIS EFICIENTE
    if (tarefa) {
        tarefa.concluida = !tarefa.concluida
        tarefa.dataConclusao = tarefa.concluida ? new Date().toISOString() : null
        salvarTarefas()
        filtrarTarefas()
        atualizarContador()
        
        const acao = tarefa.concluida ? 'concluída' : 'reaberta'
        mostrarNotificacao(`Tarefa ${acao}!`, 'success')
    }
}

// -------------------------------
// 7. Função para editar o texto de uma tarefa - OTIMIZADA
// -------------------------------
function editarTarefa(id) {
    const tarefa = tarefas.find(t => t.id === id) // MAIS EFICIENTE
    if (!tarefa) return

    const novaDescricao = prompt('Edite a tarefa:', tarefa.texto)

    if (novaDescricao === null) return
    
    const textoLimpo = novaDescricao.trim()
    if (textoLimpo === '') {
        mostrarNotificacao('O texto da tarefa não pode ficar vazio!', 'warning')
        return
    }

    if (textoLimpo.length > 100) {
        mostrarNotificacao('A tarefa deve ter no máximo 100 caracteres!', 'warning')
        return
    }

    tarefa.texto = textoLimpo
    salvarTarefas()
    filtrarTarefas()
    mostrarNotificacao('Tarefa editada com sucesso!', 'success')
}

// -------------------------------
// 8. Função para excluir uma tarefa
// -------------------------------
function excluirTarefa(id) {
    const tarefa = tarefas.find(t => t.id === id)
    if (!tarefa) return

    const confirmar = window.confirm(`Tem certeza que deseja excluir a tarefa "${tarefa.texto}"?`)

    if (confirmar) {
        tarefas = tarefas.filter(t => t.id !== id)
        salvarTarefas()
        filtrarTarefas()
        atualizarContador()
        mostrarNotificacao('Tarefa excluída com sucesso!', 'success')
    }
}

// -------------------------------
// 9. Filtro: todos / ativos / concluídos
// -------------------------------
function filtrarTarefas() {
    const tipo = seletorFiltro.value
    const termo = campoPesquisa.value.toLowerCase().trim()
    
    let filtradas = tarefas

    // Filtra por tipo
    if (tipo === 'ativos') {
        filtradas = filtradas.filter(tarefa => !tarefa.concluida)
    } else if (tipo === 'concluidos') {
        filtradas = filtradas.filter(tarefa => tarefa.concluida)
    }

    // Filtra pelo termo de pesquisa
    if (termo) {
        filtradas = filtradas.filter(tarefa => 
            tarefa.texto.toLowerCase().includes(termo)
        )
    }

    exibirTarefas(filtradas)
}

// -------------------------------
// 10. Função para atualizar o contador
// -------------------------------
function atualizarContador() {
    if (!contadorTarefasEl) return
    
    const total = tarefas.length
    const tarefasAtivas = tarefas.filter(t => !t.concluida).length
    const tarefasConcluidas = total - tarefasAtivas

    if (total === 0) {
        contadorTarefasEl.textContent = 'Nenhuma tarefa cadastrada! ✨'
    } else if (tarefasAtivas === 0) {
        contadorTarefasEl.textContent = 'Todas as tarefas concluídas! 🎉'
    } else if (tarefasAtivas === 1) {
        contadorTarefasEl.textContent = `1 tarefa pendente (${tarefasConcluidas} concluída)`
    } else {
        contadorTarefasEl.textContent = `${tarefasAtivas} tarefas pendentes (${tarefasConcluidas} concluídas)`
    }
}

// -------------------------------
// 11. Função para limpar tarefas concluídas
// -------------------------------
function limparTarefasConcluidas() {
    const concluidas = tarefas.filter(t => t.concluida)
    
    if (concluidas.length === 0) {
        mostrarNotificacao('Não há tarefas concluídas para limpar.', 'info')
        return
    }

    const confirmar = window.confirm(
        `Tem certeza que deseja limpar ${concluidas.length} tarefa(s) concluída(s)?\n\nEsta ação não pode ser desfeita.`
    )

    if (confirmar) {
        tarefas = tarefas.filter(t => !t.concluida)
        salvarTarefas()
        filtrarTarefas()
        atualizarContador()
        mostrarNotificacao(`${concluidas.length} tarefa(s) concluída(s) removida(s)!`, 'success')
    }
}

// -------------------------------
// 12. NOVA: Função para notificações mais amigáveis
// -------------------------------
function mostrarNotificacao(mensagem, tipo = 'info') {
    // Poderia ser substituído por um toast library
    console.log(`${tipo}: ${mensagem}`)
    // Para uma versão melhorada, implemente toasts bonitos
}

// -------------------------------
// 13. Eventos
// -------------------------------
if (formTarefa) {
    formTarefa.addEventListener('submit', function(e) {
        e.preventDefault()
        adicionarTarefa()
    })
}

if (botaoAdicionar) {
    botaoAdicionar.addEventListener('click', adicionarTarefa)
}

if (campoPesquisa) {
    campoPesquisa.addEventListener('input', filtrarTarefas)
}

if (seletorFiltro) {
    seletorFiltro.addEventListener('change', filtrarTarefas)
}

if (botaoLimparConcluidas) {
    botaoLimparConcluidas.addEventListener('click', limparTarefasConcluidas)
}

if (campoNovaTarefa) {
    campoNovaTarefa.addEventListener('keydown', function (evento) {
        if (evento.key === 'Enter') {
            evento.preventDefault()
            adicionarTarefa()
        }
    })
}

// -------------------------------
// 14. Quando a página carregar
// -------------------------------
window.addEventListener('DOMContentLoaded', carregarTarefasSalvas)
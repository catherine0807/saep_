// ============================================================
// public/js/principal.js
// ============================================================
// ESTE ARQUIVO É COM VOCÊ (ALUNO DESENVOLVE).
//
// O que falta aqui:
//   - RF-09: recuperar o nome do usuário autenticado e exibir
//     no elemento #nome-usuario
//   - RF-10: implementar o logout no botão #btn-sair
//
// A navegação para Tutores, Pets e Agendamentos (RF-11) já está
// pronta no HTML (são apenas links <a>), vocês não precisam
// mexer nisso.
// ============================================================

const nomeUsuarioEl = document.getElementById('nome-usuario');
const btnSair = document.getElementById('btn-sair');

inicializar();

async function inicializar() {
    await carregarUsuarioLogado();
}

async function carregarUsuarioLogado() {
    try {
        const resposta = await fetch('/api/auth/sessao');

        if (resposta.status === 401) {
            // sessão expirada ou usuário não logado
            window.location.href = '/login.html';
            return;
        }

        const dados = await resposta.json();

        if (dados && dados.usuario && dados.usuario.nome) {
            nomeUsuarioEl.textContent = dados.usuario.nome;
        }
       
    } catch (erro) {
        console.error('Erro ao verificar sessão:', erro);
    }
}

btnSair.addEventListener('click', async () => {
    // TODO (RF-10): chamar a rota POST /api/auth/logout via fetch,
    // e depois redirecionar o usuário para /login.html
    // Dica: veja exemplos/exemplo-logout.js
    try {
        await fetch('/api/auth/logout', {
            method: 'POST'
        });
    } catch (erro) {
        console.error('Erro ao fazer logout:', erro);
    } finally {
        window.location.href = '/login.html';
    }
});

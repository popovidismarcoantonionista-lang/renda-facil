// CONFIGURAÇÃO PLUGGY.AI
const PLUGGY_CONFIG = {
    clientId: 'SEU_CLIENT_ID_AQUI', // Obtenha em https://dashboard.pluggy.ai
    clientSecret: 'SEU_CLIENT_SECRET_AQUI',
    apiUrl: 'https://api.pluggy.ai',
    environment: 'sandbox' // Mude para 'production' quando estiver pronto
};

// Dados do usuário (simulado - em produção virá do backend)
let userData = {
    nome: 'João Silva',
    pontos: 15750,
    ganhosHoje: 250,
    tarefasCompletas: 12,
    indicados: 5,
    chavePix: '',
    idPluggy: null // ID do usuário no Pluggy.ai
};

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    carregarDadosUsuario();
    atualizarSaldo();
});

function carregarDadosUsuario() {
    document.getElementById('userName').textContent = userData.nome;
    document.getElementById('pontosTotal').textContent = userData.pontos.toLocaleString('pt-BR');
    document.getElementById('reaisTotal').textContent = (userData.pontos / 1000).toFixed(2);
    document.getElementById('ganhosHoje').textContent = userData.ganhosHoje + ' pts';
    document.getElementById('tarefasCompletas').textContent = userData.tarefasCompletas;
    document.getElementById('indicados').textContent = userData.indicados;
}

function atualizarSaldo() {
    const pontos = userData.pontos;
    const reais = pontos / 1000;

    document.getElementById('pontosTotal').textContent = pontos.toLocaleString('pt-BR');
    document.getElementById('reaisTotal').textContent = reais.toFixed(2);
}

// ==================== FUNÇÕES DE TAREFAS ====================

function iniciarTarefa(tipo) {
    // Simula completar tarefa
    let pontosGanhos = 0;

    switch(tipo) {
        case 'video':
            pontosGanhos = 150;
            alert('📺 Assistindo vídeo...');
            break;
        case 'anuncio':
            pontosGanhos = 75;
            alert('👆 Visualizando anúncio...');
            break;
    }

    // Simula delay da tarefa
    setTimeout(() => {
        userData.pontos += pontosGanhos;
        userData.ganhosHoje += pontosGanhos;
        userData.tarefasCompletas++;

        carregarDadosUsuario();
        atualizarSaldo();

        alert(\`✅ Tarefa concluída! Você ganhou \${pontosGanhos} pontos!\`);
    }, 2000);
}

function girarRoleta() {
    const pontosGanhos = Math.floor(Math.random() * 900) + 100; // 100 a 1000 pontos

    alert('🎲 Girando a roleta...');

    setTimeout(() => {
        userData.pontos += pontosGanhos;
        userData.ganhosHoje += pontosGanhos;

        carregarDadosUsuario();
        atualizarSaldo();

        alert(\`🎉 Parabéns! Você ganhou \${pontosGanhos} pontos na roleta!\`);
    }, 2000);
}

function compartilharLink() {
    const link = document.getElementById('linkIndicacao').value;

    if (navigator.share) {
        navigator.share({
            title: 'Ganhe dinheiro com o RendaFácil!',
            text: 'Cadastre-se no RendaFácil e comece a ganhar dinheiro online!',
            url: link
        });
    } else {
        copiarLink();
    }
}

function copiarLink() {
    const linkInput = document.getElementById('linkIndicacao');
    linkInput.select();
    document.execCommand('copy');
    alert('✅ Link copiado! Compartilhe com seus amigos!');
}

// ==================== MODAL DE SAQUE ====================

function abrirSaque() {
    document.getElementById('saldoDisponivel').textContent = userData.pontos.toLocaleString('pt-BR');
    document.getElementById('saldoReais').textContent = (userData.pontos / 1000).toFixed(2);
    document.getElementById('modalSaque').classList.add('show');
}

function fecharSaque() {
    document.getElementById('modalSaque').classList.remove('show');
}

// ==================== PLUGGY.AI - PAGAMENTO VIA PIX ====================

/**
 * Autentica na API do Pluggy.ai
 * Documentação: https://docs.pluggy.ai/docs/authentication
 */
async function autenticarPluggy() {
    try {
        const response = await fetch(\`\${PLUGGY_CONFIG.apiUrl}/auth\`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                clientId: PLUGGY_CONFIG.clientId,
                clientSecret: PLUGGY_CONFIG.clientSecret
            })
        });

        const data = await response.json();
        return data.access_token;
    } catch (error) {
        console.error('Erro ao autenticar no Pluggy:', error);
        throw error;
    }
}

/**
 * Cria um pagamento PIX via Pluggy.ai
 * Documentação: https://docs.pluggy.ai/docs/creating-a-payment
 */
async function criarPagamentoPix(valor, chavePix, tipoChave) {
    try {
        const token = await autenticarPluggy();

        // Converter pontos para reais (centavos para API)
        const valorEmCentavos = Math.floor((valor / 1000) * 100);

        const response = await fetch(\`\${PLUGGY_CONFIG.apiUrl}/payments\`, {
            method: 'POST',
            headers: {
                'Authorization': \`Bearer \${token}\`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                type: 'PIX',
                amount: valorEmCentavos,
                currency: 'BRL',
                recipient: {
                    key: chavePix,
                    keyType: tipoChave.toUpperCase() // CPF, EMAIL, PHONE, EVP
                },
                description: 'Saque RendaFácil'
            })
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erro ao criar pagamento PIX:', error);
        throw error;
    }
}

/**
 * Processa solicitação de saque
 */
async function solicitarSaque(event) {
    event.preventDefault();

    const valorPontos = parseInt(document.getElementById('valorSaque').value);
    const chavePix = document.getElementById('chavePix').value;
    const tipoChave = document.getElementById('tipoChavePix').value;

    // Validações
    if (valorPontos < 10000) {
        alert('❌ Valor mínimo de saque: 10.000 pontos (R$ 10,00)');
        return;
    }

    if (valorPontos > userData.pontos) {
        alert('❌ Saldo insuficiente!');
        return;
    }

    if (!chavePix) {
        alert('❌ Digite sua chave PIX!');
        return;
    }

    // Confirmar saque
    const valorReais = (valorPontos / 1000).toFixed(2);
    const confirmar = confirm(\`Confirmar saque de \${valorPontos.toLocaleString('pt-BR')} pontos (R$ \${valorReais}) via PIX?\`);

    if (!confirmar) return;

    // Mostrar loading
    const btnSubmit = event.target.querySelector('button[type="submit"]');
    const textoOriginal = btnSubmit.textContent;
    btnSubmit.textContent = '⏳ Processando...';
    btnSubmit.disabled = true;

    try {
        // EM PRODUÇÃO: Chamar API do Pluggy.ai
        // const resultadoPagamento = await criarPagamentoPix(valorPontos, chavePix, tipoChave);

        // SIMULAÇÃO (remova em produção)
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Deduzir pontos
        userData.pontos -= valorPontos;
        atualizarSaldo();
        carregarDadosUsuario();

        // Sucesso
        fecharSaque();
        alert(\`✅ Saque solicitado com sucesso!\n\nValor: R$ \${valorReais}\nChave PIX: \${chavePix}\n\n⏱️ O pagamento será processado em até 24 horas.\`);

        // Limpar formulário
        document.getElementById('formSaque').reset();

    } catch (error) {
        console.error('Erro ao processar saque:', error);
        alert('❌ Erro ao processar saque. Tente novamente mais tarde.');
    } finally {
        btnSubmit.textContent = textoOriginal;
        btnSubmit.disabled = false;
    }
}

// ==================== PIX AUTOMÁTICO (RECORRENTE) ====================

/**
 * Cria um mandato de PIX Automático
 * Documentação: https://docs.pluggy.ai/docs/pix-automatico
 * Use isso para pagamentos recorrentes/automáticos
 */
async function criarMandatoPixAutomatico(valorMensal, chavePix) {
    try {
        const token = await autenticarPluggy();

        const response = await fetch(\`\${PLUGGY_CONFIG.apiUrl}/pix-automatic/mandates\`, {
            method: 'POST',
            headers: {
                'Authorization': \`Bearer \${token}\`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                recipient: {
                    key: chavePix,
                    keyType: 'CPF' // ou EMAIL, PHONE, EVP
                },
                amount: valorMensal * 100, // em centavos
                frequency: 'MONTHLY',
                startDate: new Date().toISOString(),
                description: 'Pagamento automático RendaFácil'
            })
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erro ao criar mandato PIX Automático:', error);
        throw error;
    }
}

// Fechar modal ao clicar fora
window.onclick = function(event) {
    const modal = document.getElementById('modalSaque');
    if (event.target == modal) {
        fecharSaque();
    }
}

console.log('✅ Dashboard carregado com sucesso!');
console.log('💡 Adicione suas credenciais do Pluggy.ai no arquivo dashboard.js');
console.log('📚 Documentação: https://docs.pluggy.ai');

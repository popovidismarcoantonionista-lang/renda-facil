const axios = require('axios');

class PluggyService {
    constructor() {
        this.clientId = process.env.PLUGGY_CLIENT_ID;
        this.clientSecret = process.env.PLUGGY_CLIENT_SECRET;
        this.apiUrl = process.env.PLUGGY_API_URL || 'https://api.pluggy.ai';
        this.accessToken = null;
        this.tokenExpiry = null;
    }

    /**
     * Autentica na API do Pluggy.ai
     * Documentação: https://docs.pluggy.ai/docs/authentication
     */
    async autenticar() {
        // Reutilizar token se ainda válido
        if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
            return this.accessToken;
        }

        try {
            const response = await axios.post(`${this.apiUrl}/auth`, {
                clientId: this.clientId,
                clientSecret: this.clientSecret
            });

            this.accessToken = response.data.accessToken;
            // Token válido por 24h (configurar expiração com margem de segurança)
            this.tokenExpiry = new Date(Date.now() + 23 * 60 * 60 * 1000);

            console.log('✅ Pluggy.ai: Autenticado com sucesso');
            return this.accessToken;
        } catch (error) {
            console.error('❌ Erro ao autenticar Pluggy.ai:', error.response?.data || error.message);
            throw new Error('Falha na autenticação com Pluggy.ai');
        }
    }

    /**
     * Cria um pagamento PIX
     * Documentação: https://docs.pluggy.ai/docs/creating-a-payment
     * 
     * @param {number} valorPontos - Valor em pontos (será convertido para centavos)
     * @param {string} chavePix - Chave PIX do destinatário
     * @param {string} tipoChave - Tipo da chave (CPF, EMAIL, PHONE, EVP)
     * @param {string} descricao - Descrição do pagamento
     */
    async criarPagamentoPix(valorPontos, chavePix, tipoChave, descricao = 'Saque RendaFácil') {
        try {
            const token = await this.autenticar();

            // Converter pontos para reais em centavos
            const conversao = parseInt(process.env.CONVERSAO_PONTOS) || 1000;
            const valorReais = valorPontos / conversao;
            const valorCentavos = Math.floor(valorReais * 100);

            console.log(`💸 Criando pagamento PIX: R$ ${valorReais.toFixed(2)} para ${chavePix}`);

            const payload = {
                type: 'PIX',
                amount: valorCentavos,
                currency: 'BRL',
                recipient: {
                    key: chavePix,
                    keyType: tipoChave.toUpperCase() // CPF, EMAIL, PHONE, EVP
                },
                description: descricao
            };

            const response = await axios.post(
                `${this.apiUrl}/payments`,
                payload,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('✅ Pagamento PIX criado:', response.data.id);
            return {
                success: true,
                paymentId: response.data.id,
                status: response.data.status,
                amount: valorReais,
                recipient: chavePix,
                data: response.data
            };
        } catch (error) {
            console.error('❌ Erro ao criar pagamento PIX:', error.response?.data || error.message);
            throw new Error(error.response?.data?.message || 'Erro ao processar pagamento PIX');
        }
    }

    /**
     * Consulta status de um pagamento
     * 
     * @param {string} paymentId - ID do pagamento
     */
    async consultarPagamento(paymentId) {
        try {
            const token = await this.autenticar();

            const response = await axios.get(
                `${this.apiUrl}/payments/${paymentId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            return {
                success: true,
                payment: response.data
            };
        } catch (error) {
            console.error('❌ Erro ao consultar pagamento:', error.response?.data || error.message);
            throw new Error('Erro ao consultar status do pagamento');
        }
    }

    /**
     * Cria um mandato de PIX Automático (pagamentos recorrentes)
     * Documentação: https://docs.pluggy.ai/docs/pix-automatico
     * 
     * @param {number} valorMensal - Valor mensal em reais
     * @param {string} chavePix - Chave PIX do destinatário
     * @param {string} tipoChave - Tipo da chave
     * @param {string} frequencia - DAILY, WEEKLY, MONTHLY, YEARLY
     */
    async criarMandatoPixAutomatico(valorMensal, chavePix, tipoChave, frequencia = 'MONTHLY') {
        try {
            const token = await this.autenticar();

            const valorCentavos = Math.floor(valorMensal * 100);

            const payload = {
                recipient: {
                    key: chavePix,
                    keyType: tipoChave.toUpperCase()
                },
                amount: valorCentavos,
                frequency: frequencia,
                startDate: new Date().toISOString(),
                description: 'Pagamento automático RendaFácil'
            };

            const response = await axios.post(
                `${this.apiUrl}/pix-automatic/mandates`,
                payload,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('✅ Mandato PIX Automático criado:', response.data.id);
            return {
                success: true,
                mandateId: response.data.id,
                data: response.data
            };
        } catch (error) {
            console.error('❌ Erro ao criar mandato:', error.response?.data || error.message);
            throw new Error('Erro ao criar pagamento recorrente');
        }
    }

    /**
     * Lista todos os pagamentos
     * 
     * @param {number} page - Página
     * @param {number} pageSize - Itens por página
     */
    async listarPagamentos(page = 1, pageSize = 20) {
        try {
            const token = await this.autenticar();

            const response = await axios.get(
                `${this.apiUrl}/payments`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    params: {
                        page,
                        pageSize
                    }
                }
            );

            return {
                success: true,
                payments: response.data.results,
                total: response.data.total,
                page: response.data.page
            };
        } catch (error) {
            console.error('❌ Erro ao listar pagamentos:', error.response?.data || error.message);
            throw new Error('Erro ao listar pagamentos');
        }
    }
}

// Exportar instância única (Singleton)
module.exports = new PluggyService();

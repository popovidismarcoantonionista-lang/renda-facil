# 🚀 RendaFácil Backend

Backend completo do RendaFácil com integração Pluggy.ai para pagamentos PIX automáticos.

## 📦 Tecnologias

- **Node.js** + Express
- **MongoDB** + Mongoose
- **JWT** para autenticação
- **Pluggy.ai** para PIX automático
- **Bcrypt** para hash de senhas

## 🔧 Instalação

### 1. Instalar Dependências

```bash
cd backend
npm install
```

### 2. Configurar Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

Edite o `.env` com suas configurações:

```env
# Suas credenciais Pluggy.ai
PLUGGY_CLIENT_ID=08a122f1-1549-4a55-a3ea-c24114c44359
PLUGGY_CLIENT_SECRET=SEU_CLIENT_SECRET_AQUI

# MongoDB
MONGODB_URI=mongodb://localhost:27017/rendafacil

# JWT
JWT_SECRET=CRIE_UMA_CHAVE_SECRETA_FORTE_AQUI
```

### 3. Iniciar MongoDB

```bash
# Instalar MongoDB (se ainda não tem)
# Ubuntu/Debian
sudo apt install mongodb

# macOS
brew install mongodb-community

# Iniciar
mongod
```

### 4. Iniciar Servidor

```bash
# Desenvolvimento (com auto-reload)
npm run dev

# Produção
npm start
```

Servidor rodando em: **http://localhost:3000**

## 🌐 Endpoints da API

### Autenticação

#### Cadastro
```
POST /api/auth/register
Content-Type: application/json

{
  "nome": "João Silva",
  "email": "joao@email.com",
  "senha": "senha123",
  "chavePix": "joao@email.com",
  "tipoChavePix": "email"
}
```

#### Login
```
POST /api/auth/login

{
  "email": "joao@email.com",
  "senha": "senha123"
}
```

### Usuário (Requer Token)

#### Obter dados do usuário
```
GET /api/user/me
Authorization: Bearer SEU_TOKEN_JWT
```

#### Atualizar chave PIX
```
PUT /api/user/pix
Authorization: Bearer SEU_TOKEN_JWT

{
  "chavePix": "nova@chave.com",
  "tipoChave": "email"
}
```

### Saques (Requer Token)

#### Solicitar saque
```
POST /api/withdraw/request
Authorization: Bearer SEU_TOKEN_JWT

{
  "valorPontos": 10000,
  "chavePix": "sua@chave.pix",
  "tipoChave": "email"
}
```

#### Histórico de saques
```
GET /api/withdraw/history
Authorization: Bearer SEU_TOKEN_JWT
```

#### Status de saque
```
GET /api/withdraw/status/:id
Authorization: Bearer SEU_TOKEN_JWT
```

### Tarefas (Requer Token)

#### Completar tarefa
```
POST /api/tasks/complete
Authorization: Bearer SEU_TOKEN_JWT

{
  "taskType": "video",
  "pontos": 150
}
```

## 💳 Integração Pluggy.ai

O serviço Pluggy está em `services/pluggy.js`.

### Métodos Disponíveis:

```javascript
const pluggyService = require('./services/pluggy');

// Criar pagamento PIX
await pluggyService.criarPagamentoPix(
    10000,              // pontos
    'chave@pix.com',    // chave PIX
    'email',            // tipo
    'Saque RendaFácil'  // descrição
);

// Consultar pagamento
await pluggyService.consultarPagamento('payment_id');

// PIX Automático
await pluggyService.criarMandatoPixAutomatico(
    50,                 // R$ 50/mês
    'chave@pix.com',
    'email',
    'MONTHLY'
);
```

## 📊 Estrutura do Banco

### User
- nome, email, senha
- pontos (saldo)
- chavePix (valor + tipo)
- idPluggy
- referralCode
- estatísticas

### Withdraw
- usuario (ref)
- valorPontos, valorReais
- chavePix, tipoChave
- status (pendente, processando, concluído, falhou)
- idPluggy

## 🔐 Segurança

- ✅ Senhas com hash bcrypt
- ✅ JWT para autenticação
- ✅ Rate limiting (100 req/15min)
- ✅ Helmet.js (headers seguros)
- ✅ CORS configurado
- ✅ Validação de entradas (Joi)

## 🚀 Deploy

### Heroku

```bash
heroku create rendafacil-api
heroku config:set PLUGGY_CLIENT_ID=08a122f1-1549-4a55-a3ea-c24114c44359
heroku config:set PLUGGY_CLIENT_SECRET=seu_secret
heroku config:set MONGODB_URI=sua_mongodb_uri
heroku config:set JWT_SECRET=sua_chave_secreta
git push heroku main
```

### Vercel

```bash
vercel
# Configurar env vars no dashboard
```

## 📝 Licença

MIT

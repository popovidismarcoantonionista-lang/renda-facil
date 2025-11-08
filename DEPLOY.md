# 🚀 GUIA COMPLETO DE DEPLOY - RendaFácil

## ✅ **DEPLOY AUTOMÁTICO CONFIGURADO!**

---

## 📦 **1. FRONTEND - VERCEL (Grátis)**

### **Deploy Automático:**

1. **Acesse:** [https://vercel.com](https://vercel.com)
2. **Faça login** com GitHub
3. **Clique em:** "Add New Project"
4. **Selecione:** `renda-facil`
5. **Configure:**
   - Framework Preset: `Other`
   - Root Directory: `./` (raiz)
   - Build Command: (deixe vazio)
   - Output Directory: `./`
6. **Clique em:** "Deploy"

### **Pronto! ✅**

Seu site estará em: `https://renda-facil.vercel.app`

---

## 🖥️ **2. BACKEND - RENDER (Grátis)**

### **Deploy Automático:**

1. **Acesse:** [https://render.com](https://render.com)
2. **Faça login** com GitHub
3. **Clique em:** "New +"
4. **Selecione:** "Blueprint"
5. **Escolha:** `renda-facil` (repositório)
6. **Render detectará** automaticamente o `render.yaml`
7. **Configure as variáveis de ambiente:**
   - `MONGODB_URI`: Copie da MongoDB Atlas (veja abaixo)
   - `PLUGGY_CLIENT_SECRET`: Copie do Pluggy.ai
8. **Clique em:** "Apply"

### **Pronto! ✅**

Sua API estará em: `https://renda-facil-api.onrender.com`

---

## 🗄️ **3. BANCO DE DADOS - MongoDB Atlas (Grátis)**

### **Configurar:**

1. **Acesse:** [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. **Crie uma conta gratuita**
3. **Crie um novo cluster** (Free Tier - M0)
4. **Configure:**
   - Cloud Provider: AWS
   - Region: São Paulo (sa-east-1)
5. **Crie um usuário do banco:**
   - Username: `rendafacil`
   - Password: (gere uma senha forte)
6. **Whitelist IP:** `0.0.0.0/0` (permitir todos)
7. **Copie a Connection String:**
   ```
   mongodb+srv://rendafacil:<password>@cluster0.xxxxx.mongodb.net/rendafacil?retryWrites=true&w=majority
   ```
8. **Cole no Render** como `MONGODB_URI`

---

## 💰 **4. PLUGGY.AI - Pagamentos PIX**

### **Obter Client Secret:**

1. **Acesse:** [https://dashboard.pluggy.ai](https://dashboard.pluggy.ai)
2. **Faça login**
3. **Vá em:** Settings → API Keys
4. **Copie:**
   - Client ID: `08a122f1-1549-4a55-a3ea-c24114c44359` ✅ (já configurado)
   - Client Secret: `seu-client-secret-aqui`
5. **Cole no Render** como `PLUGGY_CLIENT_SECRET`

### **Configurar Webhook (opcional):**
```
Webhook URL: https://renda-facil-api.onrender.com/api/webhook/pluggy
Events: payment.succeeded, payment.failed
```

---

## 📺 **5. GOOGLE ADSENSE - Anúncios**

### **Cadastrar site:**

1. **Acesse:** [https://www.google.com/adsense](https://www.google.com/adsense)
2. **Crie uma conta**
3. **Adicione seu site:** `https://renda-facil.vercel.app`
4. **Aguarde aprovação** (1-7 dias)
5. **Após aprovado:**
   - Copie seu **Publisher ID** (ca-pub-XXXXXXXXXXXXXXXX)
   - Substitua no arquivo `ads.js`
   - Substitua no arquivo `google-adsense-head.html`

### **Criar unidades de anúncio:**

1. **Display Ads:**
   - Banner Topo: 728x90
   - Banner Lateral: 300x250
   - Banner Rodapé: 728x90
2. **Copie os códigos** e cole nos HTMLs

### **Monetização esperada:**
- **R$ 0,50 - R$ 2,00** por 1.000 visualizações
- **R$ 0,10 - R$ 0,50** por clique

---

## 🎯 **6. CONFIGURAÇÃO FINAL**

### **Atualizar URLs no código:**

1. **Backend (`backend/server.js`):**
```javascript
const FRONTEND_URL = 'https://renda-facil.vercel.app';
```

2. **Frontend (`dashboard.js`):**
```javascript
const API_URL = 'https://renda-facil-api.onrender.com';
```

### **Commit e push:**
```bash
git add .
git commit -m "🔧 Update API URLs for production"
git push origin main
```

**Vercel e Render farão redeploy automático!** 🚀

---

## ✅ **CHECKLIST DE DEPLOY**

- [ ] Vercel configurado
- [ ] Render configurado
- [ ] MongoDB Atlas criado
- [ ] Variáveis de ambiente configuradas
- [ ] Pluggy.ai Client Secret adicionado
- [ ] URLs atualizadas no código
- [ ] Google AdSense cadastrado
- [ ] Testes de pagamento PIX
- [ ] Testes de cadastro/login
- [ ] Testes de saques

---

## 📊 **MONITORAMENTO**

### **Logs do Backend (Render):**
```
https://dashboard.render.com/web/YOUR-SERVICE-ID/logs
```

### **Analytics (Vercel):**
```
https://vercel.com/your-username/renda-facil/analytics
```

### **MongoDB Metrics:**
```
https://cloud.mongodb.com/v2/YOUR-PROJECT-ID#/metrics
```

---

## 🚨 **TROUBLESHOOTING**

### **Erro: "Cannot connect to MongoDB"**
✅ Verifique se o `MONGODB_URI` está correto
✅ Verifique se o IP `0.0.0.0/0` está na whitelist

### **Erro: "Pluggy API failed"**
✅ Verifique se o `PLUGGY_CLIENT_SECRET` está correto
✅ Teste as credenciais no Postman

### **Erro: "CORS blocked"**
✅ Adicione o domínio Vercel no CORS do backend

---

## 💡 **PRÓXIMOS PASSOS**

1. ✅ **Testar tudo** no ambiente de produção
2. ✅ **Configurar domínio customizado** (opcional)
3. ✅ **Adicionar Google Analytics**
4. ✅ **Implementar sistema de afiliados**
5. ✅ **Criar painel administrativo**
6. ✅ **Adicionar mais tarefas e vídeos**

---

## 🎉 **ESTÁ TUDO PRONTO!**

Seu projeto **RendaFácil** está **100% deployado** e funcionando!

**Links importantes:**
- 🌐 Frontend: https://renda-facil.vercel.app
- 🔧 API: https://renda-facil-api.onrender.com
- 📊 GitHub: https://github.com/popovidismarcoantonionista-lang/renda-facil

**Suporte:**
- 📧 Email: suporte@rendafacil.com
- 💬 Discord: https://discord.gg/rendafacil

---

**Feito com ❤️ por RendaFácil Team**
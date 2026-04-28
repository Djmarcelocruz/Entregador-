# 📱 App Mobile (PWA) + 🔌 Integração de APIs

## 🚀 Progressive Web App (PWA)

### O que é PWA?

Uma **Progressive Web App** é um aplicativo web que funciona como um app nativo no celular, com:
- ✅ Instalação direta na tela inicial
- ✅ Funciona offline
- ✅ Notificações push
- ✅ Sincronização em background
- ✅ Experiência nativa

### Como Instalar como App

#### Android
1. Abra `https://seu-github.io/Entregador-/` no Chrome
2. Clique nos 3 pontos (menu) → "Instalar app"
3. Clique em "Instalar"
4. O app aparecerá na tela inicial

#### iOS (Safari)
1. Abra `https://seu-github.io/Entregador-/` no Safari
2. Clique em "Compartilhar" → "Adicionar à Tela Inicial"
3. Nomeie o app e clique "Adicionar"
4. O app aparecerá na tela inicial

### Arquivos PWA

- **manifest.json** - Configuração do app (nome, ícone, cores)
- **service-worker.js** - Cache offline e sincronização
- **index.html** - Deve incluir referência ao manifest

### Recursos do PWA

#### 1. Offline First
O app funciona offline e sincroniza quando volta online:
```javascript
// Dados salvos localmente
localStorage.setItem('entrega', JSON.stringify(dados));

// Sincroniza quando online
navigator.onLine ? sincronizar() : null;
```

#### 2. Notificações Push
```javascript
// Solicitar permissão
Notification.requestPermission();

// Enviar notificação
new Notification('Novo Pedido!', {
  body: 'Você tem um novo chamado',
  icon: '/icon-192.png'
});
```

#### 3. Background Sync
```javascript
// Registrar sincronização
navigator.serviceWorker.ready.then(reg => {
  reg.sync.register('sync-entregas');
});
```

---

## 🔌 Integração de APIs Reais

### 1. WhatsApp Business API

#### Como Configurar

1. Acesse [developers.facebook.com](https://developers.facebook.com)
2. Crie um novo app
3. Configure "WhatsApp Business"
4. Gere um **Access Token** e copie **Phone Number ID**
5. Vá para `configurar-apis.html` e cole os valores

#### Usar no Código

```javascript
// Importar
import { WhatsAppAPI } from './api-integracao.js';

// Inicializar
const whatsapp = new WhatsAppAPI(
  'SEU_ACCESS_TOKEN',
  'SEU_PHONE_NUMBER_ID'
);

// Enviar mensagem
await whatsapp.enviarMensagem(
  '5511999999999',
  'Olá! Sua entrega chegou!'
);

// Enviar template
await whatsapp.enviarMensagemTemplate(
  '5511999999999',
  'hello_world',
  ['Olá', 'Mundo']
);
```

#### Custos
- Primeiras 1.000 mensagens/mês: **GRÁTIS**
- Após: R$ 0,05 - R$ 0,10 por mensagem

---

### 2. Twilio SMS API

#### Como Configurar

1. Acesse [twilio.com](https://twilio.com)
2. Crie uma conta
3. Compre um número Twilio
4. Copie **Account SID**, **Auth Token** e seu **Número**
5. Vá para `configurar-apis.html` e cole os valores

#### Usar no Código

```javascript
// Importar
import { TwilioAPI } from './api-integracao.js';

// Inicializar
const twilio = new TwilioAPI(
  'SEU_ACCOUNT_SID',
  'SEU_AUTH_TOKEN',
  '+5511999999999'
);

// Enviar SMS
await twilio.enviarSMS(
  '+5511999999999',
  'Seu código é: 123456'
);

// Obter status
const status = await twilio.obterStatusMensagem('SM123456789');
console.log(status.status); // 'delivered', 'failed', etc
```

#### Custos
- SMS: R$ 0,10 - R$ 0,30 por mensagem
- Teste grátis com crédito inicial

---

### 3. Google Maps API

#### Como Configurar

1. Acesse [console.cloud.google.com](https://console.cloud.google.com)
2. Crie um novo projeto
3. Ative "Google Maps Platform"
4. Ative APIs: Directions, Geocoding, Distance Matrix
5. Crie uma chave de API
6. Vá para `configurar-apis.html` e cole a chave

#### Usar no Código

```javascript
// Importar
import { GoogleMapsAPI } from './api-integracao.js';

// Inicializar
const maps = new GoogleMapsAPI('SEU_API_KEY');

// Obter rota
const rota = await maps.obterRota(
  'Rua A, 123, São Paulo',
  'Rua B, 456, São Paulo'
);

// Calcular distância
const distancia = await maps.obterDistancia(
  'Rua A, 123',
  'Rua B, 456'
);
console.log(distancia.distancia); // "5.2 km"
console.log(distancia.duracao); // "12 mins"

// Geocodificar endereço
const coords = await maps.geocodificar('Rua A, 123, São Paulo');
console.log(coords.latitude, coords.longitude);
```

#### Custos
- Primeiros $200/mês: **GRÁTIS**
- Após: $0,005 - $0,007 por requisição

---

### 4. Stripe Payment API

#### Como Configurar

1. Acesse [stripe.com](https://stripe.com)
2. Crie uma conta
3. Vá para "Configurações" → "Chaves de API"
4. Copie **Public Key** (pk_live_...) e **Secret Key** (sk_live_...)
5. Vá para `configurar-apis.html` e cole os valores

#### Usar no Código

```javascript
// Importar
import { StripeAPI } from './api-integracao.js';

// Inicializar
const stripe = new StripeAPI(
  'pk_live_...',
  'sk_live_...'
);

// Criar intenção de pagamento
const intencao = await stripe.criarIntencaoPagamento(
  50.00, // R$ 50,00
  'Entrega #123',
  'cliente@email.com'
);

// Confirmar pagamento
const pagamento = await stripe.confirmarPagamento(intencao.id);

// Obter status
const status = await stripe.obterStatusPagamento(intencao.id);
console.log(status.status); // 'succeeded', 'processing', etc
```

#### Custos
- Taxa: 2,9% + R$ 0,30 por transação
- Teste grátis com cartões de teste

---

## 📋 Arquivos Inclusos

### PWA
- `manifest.json` - Configuração do app
- `service-worker.js` - Cache e sincronização offline

### APIs
- `api-integracao.js` - Classes para integração com APIs
- `configurar-apis.html` - Página para configurar credenciais

### Documentação
- `README-PWA-APIS.md` - Este arquivo

---

## 🔐 Segurança

### ⚠️ IMPORTANTE

**NUNCA** coloque suas chaves secretas no código frontend!

```javascript
// ❌ ERRADO - Expõe a chave
const stripe = new StripeAPI('pk_live_...', 'sk_live_...');

// ✅ CORRETO - Envie para backend
fetch('/api/pagamento', {
  method: 'POST',
  body: JSON.stringify({ valor: 50 })
});
```

### Boas Práticas

1. **Armazene credenciais no backend**
2. **Use variáveis de ambiente**
3. **Nunca faça commit de credenciais**
4. **Rotacione chaves regularmente**
5. **Use HTTPS sempre**

---

## 🧪 Testando

### Teste Local

1. Abra `configurar-apis.html`
2. Cole suas credenciais
3. Clique em "TESTAR"
4. Verifique os logs do navegador (F12)

### Teste com Dados Reais

```javascript
// WhatsApp - Teste com seu número
await whatsapp.enviarMensagem('seu_numero', 'Teste');

// Twilio - Teste com número verificado
await twilio.enviarSMS('seu_numero', 'Teste');

// Google Maps - Teste com endereço real
await maps.obterDistancia('Sua casa', 'Seu trabalho');

// Stripe - Use cartões de teste
// 4242 4242 4242 4242 (sucesso)
// 4000 0000 0000 0002 (falha)
```

---

## 📱 Instalação do PWA

### Passo a Passo

1. **Acesse o site**
   ```
   https://seu-github.io/Entregador-/
   ```

2. **Android (Chrome)**
   - Menu (⋮) → Instalar app
   - Clique em "Instalar"

3. **iOS (Safari)**
   - Compartilhar (↗) → Adicionar à Tela Inicial
   - Nomeie e clique "Adicionar"

4. **Desktop (Chrome)**
   - Clique no ícone de instalação (barra de endereço)
   - Clique em "Instalar"

---

## 🚀 Próximos Passos

1. **Integrar com Backend Real** - Conectar com seu servidor
2. **Autenticação OAuth** - Implementar login seguro
3. **Pagamento Real** - Processar pagamentos com Stripe
4. **Notificações Push Real** - Usar Firebase Cloud Messaging
5. **Analytics** - Rastrear uso do app

---

## 📞 Suporte

Se tiver dúvidas:

- **WhatsApp Business**: [developers.facebook.com/docs](https://developers.facebook.com/docs)
- **Twilio**: [twilio.com/docs](https://twilio.com/docs)
- **Google Maps**: [developers.google.com/maps](https://developers.google.com/maps)
- **Stripe**: [stripe.com/docs](https://stripe.com/docs)
- **PWA**: [web.dev/progressive-web-apps](https://web.dev/progressive-web-apps)

---

**Desenvolvido com ❤️ para Marcelo Entregas**

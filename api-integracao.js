/**
 * API Integration Module
 * Integração com WhatsApp Business, Twilio, Google Maps, Stripe
 */

// ============================================
// WHATSAPP BUSINESS API
// ============================================

class WhatsAppAPI {
  constructor(accessToken, phoneNumberId) {
    this.accessToken = accessToken;
    this.phoneNumberId = phoneNumberId;
    this.baseURL = 'https://graph.instagram.com/v18.0';
  }

  async enviarMensagem(numeroDestino, mensagem) {
    try {
      const response = await fetch(
        `${this.baseURL}/${this.phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: numeroDestino,
            type: 'text',
            text: {
              body: mensagem
            }
          })
        }
      );

      if(!response.ok) {
        throw new Error(`WhatsApp API error: ${response.statusText}`);
      }

      return await response.json();
    } catch(error) {
      console.error('Erro ao enviar mensagem WhatsApp:', error);
      throw error;
    }
  }

  async enviarMensagemTemplate(numeroDestino, templateName, parametros) {
    try {
      const response = await fetch(
        `${this.baseURL}/${this.phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: numeroDestino,
            type: 'template',
            template: {
              name: templateName,
              language: {
                code: 'pt_BR'
              },
              components: [
                {
                  type: 'body',
                  parameters: parametros.map(p => ({ type: 'text', text: p }))
                }
              ]
            }
          })
        }
      );

      if(!response.ok) {
        throw new Error(`WhatsApp API error: ${response.statusText}`);
      }

      return await response.json();
    } catch(error) {
      console.error('Erro ao enviar template WhatsApp:', error);
      throw error;
    }
  }
}

// ============================================
// TWILIO SMS API
// ============================================

class TwilioAPI {
  constructor(accountSid, authToken, fromNumber) {
    this.accountSid = accountSid;
    this.authToken = authToken;
    this.fromNumber = fromNumber;
    this.baseURL = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}`;
  }

  async enviarSMS(numeroDestino, mensagem) {
    try {
      const auth = btoa(`${this.accountSid}:${this.authToken}`);
      
      const response = await fetch(
        `${this.baseURL}/Messages.json`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            From: this.fromNumber,
            To: numeroDestino,
            Body: mensagem
          })
        }
      );

      if(!response.ok) {
        throw new Error(`Twilio API error: ${response.statusText}`);
      }

      return await response.json();
    } catch(error) {
      console.error('Erro ao enviar SMS:', error);
      throw error;
    }
  }

  async obterStatusMensagem(messageSid) {
    try {
      const auth = btoa(`${this.accountSid}:${this.authToken}`);
      
      const response = await fetch(
        `${this.baseURL}/Messages/${messageSid}.json`,
        {
          headers: {
            'Authorization': `Basic ${auth}`
          }
        }
      );

      if(!response.ok) {
        throw new Error(`Twilio API error: ${response.statusText}`);
      }

      return await response.json();
    } catch(error) {
      console.error('Erro ao obter status da mensagem:', error);
      throw error;
    }
  }
}

// ============================================
// GOOGLE MAPS API
// ============================================

class GoogleMapsAPI {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  async obterRota(origem, destino) {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?` +
        `origin=${encodeURIComponent(origem)}&` +
        `destination=${encodeURIComponent(destino)}&` +
        `key=${this.apiKey}`
      );

      if(!response.ok) {
        throw new Error(`Google Maps API error: ${response.statusText}`);
      }

      return await response.json();
    } catch(error) {
      console.error('Erro ao obter rota:', error);
      throw error;
    }
  }

  async obterDistancia(origem, destino) {
    try {
      const rota = await this.obterRota(origem, destino);
      
      if(rota.routes.length === 0) {
        throw new Error('Nenhuma rota encontrada');
      }

      const leg = rota.routes[0].legs[0];
      return {
        distancia: leg.distance.text,
        distanciaMetros: leg.distance.value,
        duracao: leg.duration.text,
        durationSegundos: leg.duration.value
      };
    } catch(error) {
      console.error('Erro ao calcular distância:', error);
      throw error;
    }
  }

  async geocodificar(endereco) {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?` +
        `address=${encodeURIComponent(endereco)}&` +
        `key=${this.apiKey}`
      );

      if(!response.ok) {
        throw new Error(`Google Maps API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      if(data.results.length === 0) {
        throw new Error('Endereço não encontrado');
      }

      const location = data.results[0].geometry.location;
      return {
        latitude: location.lat,
        longitude: location.lng,
        endereco: data.results[0].formatted_address
      };
    } catch(error) {
      console.error('Erro ao geocodificar:', error);
      throw error;
    }
  }
}

// ============================================
// STRIPE PAYMENT API
// ============================================

class StripeAPI {
  constructor(publicKey, secretKey) {
    this.publicKey = publicKey;
    this.secretKey = secretKey;
    this.baseURL = 'https://api.stripe.com/v1';
  }

  async criarIntencaoPagamento(valor, descricao, email) {
    try {
      const auth = btoa(`:${this.secretKey}`);
      
      const response = await fetch(
        `${this.baseURL}/payment_intents`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            amount: Math.round(valor * 100), // Converter para centavos
            currency: 'brl',
            description: descricao,
            receipt_email: email
          })
        }
      );

      if(!response.ok) {
        throw new Error(`Stripe API error: ${response.statusText}`);
      }

      return await response.json();
    } catch(error) {
      console.error('Erro ao criar intenção de pagamento:', error);
      throw error;
    }
  }

  async confirmarPagamento(paymentIntentId) {
    try {
      const auth = btoa(`:${this.secretKey}`);
      
      const response = await fetch(
        `${this.baseURL}/payment_intents/${paymentIntentId}/confirm`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      if(!response.ok) {
        throw new Error(`Stripe API error: ${response.statusText}`);
      }

      return await response.json();
    } catch(error) {
      console.error('Erro ao confirmar pagamento:', error);
      throw error;
    }
  }

  async obterStatusPagamento(paymentIntentId) {
    try {
      const auth = btoa(`:${this.secretKey}`);
      
      const response = await fetch(
        `${this.baseURL}/payment_intents/${paymentIntentId}`,
        {
          headers: {
            'Authorization': `Basic ${auth}`
          }
        }
      );

      if(!response.ok) {
        throw new Error(`Stripe API error: ${response.statusText}`);
      }

      return await response.json();
    } catch(error) {
      console.error('Erro ao obter status do pagamento:', error);
      throw error;
    }
  }
}

// ============================================
// EXEMPLO DE USO
// ============================================

/*
// WhatsApp
const whatsapp = new WhatsAppAPI(
  'SEU_ACCESS_TOKEN',
  'SEU_PHONE_NUMBER_ID'
);

await whatsapp.enviarMensagem('5511999999999', 'Olá! Sua entrega chegou!');

// Twilio SMS
const twilio = new TwilioAPI(
  'SEU_ACCOUNT_SID',
  'SEU_AUTH_TOKEN',
  '+5511999999999'
);

await twilio.enviarSMS('+5511999999999', 'Seu código de verificação é: 123456');

// Google Maps
const maps = new GoogleMapsAPI('SEU_API_KEY');
const distancia = await maps.obterDistancia('Rua A, 123', 'Rua B, 456');
console.log(`Distância: ${distancia.distancia}, Duração: ${distancia.duracao}`);

// Stripe
const stripe = new StripeAPI('pk_live_...', 'sk_live_...');
const intencao = await stripe.criarIntencaoPagamento(50.00, 'Entrega #123', 'cliente@email.com');
console.log('Payment Intent ID:', intencao.id);
*/

// Exportar para uso em outros arquivos
if(typeof module !== 'undefined' && module.exports) {
  module.exports = {
    WhatsAppAPI,
    TwilioAPI,
    GoogleMapsAPI,
    StripeAPI
  };
}

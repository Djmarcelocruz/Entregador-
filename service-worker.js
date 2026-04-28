const CACHE_NAME = 'marcelo-entregas-v1';
const urlsToCache = [
  '/Entregador-/',
  '/Entregador-/index.html',
  '/Entregador-/admin.html',
  '/Entregador-/painel-marcelo.html',
  '/Entregador-/painel-loja.html',
  '/Entregador-/rastreamento.html',
  '/Entregador-/relatorios.html',
  '/Entregador-/historico.html',
  '/Entregador-/whatsapp-sms.html',
  '/Entregador-/pagamentos.html',
  '/Entregador-/multiplos-motoboys.html',
  '/Entregador-/avaliacoes.html',
  '/Entregador-/ganhos.html',
  '/Entregador-/backup.html',
  '/Entregador-/notificacoes-push.html',
  '/Entregador-/autenticacao.html',
  '/Entregador-/manifest.json'
];

// Instalar Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// Ativar Service Worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if(cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Estratégia: Network First, Fall back to Cache
self.addEventListener('fetch', event => {
  if(event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        if(!response || response.status !== 200 || response.type === 'error') {
          return response;
        }

        const responseToCache = response.clone();
        caches.open(CACHE_NAME)
          .then(cache => {
            cache.put(event.request, responseToCache);
          });

        return response;
      })
      .catch(() => {
        return caches.match(event.request)
          .then(response => {
            return response || new Response('Offline - Página não disponível', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            });
          });
      })
  );
});

// Background Sync para sincronizar dados offline
self.addEventListener('sync', event => {
  if(event.tag === 'sync-entregas') {
    event.waitUntil(sincronizarEntregas());
  }
  if(event.tag === 'sync-pagamentos') {
    event.waitUntil(sincronizarPagamentos());
  }
});

async function sincronizarEntregas() {
  try {
    const db = await openIndexedDB();
    const entregas = await getAllFromDB(db, 'entregas_pendentes');
    
    for(const entrega of entregas) {
      await fetch('/api/entregas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entrega)
      });
    }
    
    await clearFromDB(db, 'entregas_pendentes');
  } catch(error) {
    console.error('Erro ao sincronizar entregas:', error);
  }
}

async function sincronizarPagamentos() {
  try {
    const db = await openIndexedDB();
    const pagamentos = await getAllFromDB(db, 'pagamentos_pendentes');
    
    for(const pagamento of pagamentos) {
      await fetch('/api/pagamentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pagamento)
      });
    }
    
    await clearFromDB(db, 'pagamentos_pendentes');
  } catch(error) {
    console.error('Erro ao sincronizar pagamentos:', error);
  }
}

function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('MarcaloEntregasDB', 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function getAllFromDB(db, storeName) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function clearFromDB(db, storeName) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.clear();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

// Push Notifications
self.addEventListener('push', event => {
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/Entregador-/icon-192.png',
    badge: '/Entregador-/badge-72.png',
    tag: data.tag || 'notification',
    requireInteraction: data.requireInteraction || false,
    actions: [
      {
        action: 'open',
        title: 'Abrir'
      },
      {
        action: 'close',
        title: 'Fechar'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification Click
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if(event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then(clientList => {
        for(let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if(client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        if(clients.openWindow) {
          return clients.openWindow('/Entregador-/');
        }
      })
    );
  }
});

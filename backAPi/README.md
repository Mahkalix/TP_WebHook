# Service X - API WebHook

Service actif permettant de recevoir des requêtes et de notifier les clients via WebHook.

## 🚀 Installation et Démarrage

### 1. Installer les dépendances
```bash
cd backAPi
npm install
```

### 2. Lancer le serveur
```bash
# Mode développement (avec auto-reload)
npm run dev

# Mode production
npm run build
npm start
```

Le serveur démarre sur `http://localhost:3000`

## 📡 API Endpoints

### 1. Informations de base
```http
GET /
```
Retourne les informations sur le service et la liste des endpoints disponibles.

### 2. S'abonner aux notifications
```http
POST /api/hook
Content-Type: application/json

{
  "callback": "http://localhost:3001/webhook",
  "name": "Client A"
}
```

**Réponse:**
```json
{
  "message": "Abonnement réussi",
  "callback": {
    "url": "http://localhost:3001/webhook",
    "name": "Client A"
  }
}
```

### 3. Liste des abonnés
```http
GET /api/hook
```

**Réponse:**
```json
{
  "count": 2,
  "callbacks": [
    {
      "url": "http://localhost:3001/webhook",
      "name": "Client A",
      "subscribedAt": "2024-10-17T10:30:00.000Z"
    }
  ]
}
```

### 4. Se désabonner
```http
DELETE /api/hook
Content-Type: application/json

{
  "callback": "http://localhost:3001/webhook"
}
```

### 5. Envoyer un message (déclenche les webhooks)
```http
POST /api/message
Content-Type: application/json

{
  "message": "Hello from Service X!"
}
```

**Réponse:**
```json
{
  "message": "Message envoyé",
  "recipients": 2,
  "results": [
    {
      "callback": "http://localhost:3001/webhook",
      "name": "Client A",
      "status": "success",
      "statusCode": 200
    }
  ]
}
```

## 🔧 Format des WebHooks envoyés

Quand vous appelez `POST /api/message`, le Service X envoie aux clients abonnés :

```json
{
  "message": "Hello from Service X!",
  "timestamp": "2024-10-17T10:30:00.000Z",
  "source": "Service X"
}
```

## 🧪 Tests avec curl

### Abonner un client
```bash
curl -X POST http://localhost:3000/api/hook \
  -H "Content-Type: application/json" \
  -d '{"callback":"http://localhost:3001/webhook","name":"Client A"}'
```

### Voir les abonnés
```bash
curl http://localhost:3000/api/hook
```

### Envoyer un message
```bash
curl -X POST http://localhost:3000/api/message \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello!"}'
```

### Se désabonner
```bash
curl -X DELETE http://localhost:3000/api/hook \
  -H "Content-Type: application/json" \
  -d '{"callback":"http://localhost:3001/webhook"}'
```

## 📁 Structure du projet

```
backAPi/
├── index.ts              # Point d'entrée avec Express
├── api/
│   └── chat.controller.ts # Contrôleur WebHook (singleton)
├── package.json
├── tsconfig.json
└── .env
```

## 🎯 Architecture

Le Service X utilise le **pattern Singleton** pour gérer les callbacks:
- Une seule instance de `ChatHook` gère tous les abonnements
- Les clients s'abonnent en fournissant leur URL de callback
- Quand un message est envoyé, tous les clients abonnés sont notifiés

## ✨ Prochaines étapes

Pour tester le système complet, vous devez créer les **Clients A et B** qui:
1. Écoutent sur leurs propres ports (3001, 3002)
2. Exposent un endpoint `POST /webhook` pour recevoir les notifications
3. S'abonnent au Service X via `POST /api/hook`

Voulez-vous que je crée également les clients A et B ?

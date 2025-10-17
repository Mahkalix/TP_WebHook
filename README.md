# TP WebHook - Communication en temps réel avec Webhooks et WebSockets

## 📋 Description du projet

Ce projet est un TP (Travaux Pratiques) démontrant l'utilisation des **Webhooks** et des **WebSockets** pour une communication en temps réel entre plusieurs composants :

- **Front Sender** : Interface web qui permet d'envoyer des messages via HTTP
- **API Backend (Service X)** : Serveur central qui gère les webhooks et redistribue les messages
- **Client A & Client B** : Services qui s'enregistrent via webhook et diffusent les messages via Socket.IO
- **Front Receiver** : Interface web qui reçoit et affiche les messages en temps réel depuis les deux clients

---

## 🏗️ Architecture

```
┌─────────────────┐
│  Front Sender   │  (Envoie un message via HTTP POST)
│   (WebApp)      │
└────────┬────────┘
         │ HTTP POST
         ▼
┌─────────────────┐
│   backAPI       │  (Service X - Gestion des Webhooks)
│  (Service X)    │  - Reçoit le message
│   Port: 3000    │  - Notifie tous les clients enregistrés
└────────┬────────┘
         │ HTTP POST (Webhook)
         ├──────────────┬──────────────┐
         ▼              ▼              ▼
┌──────────────┐ ┌──────────────┐  (Autres clients...)
│   Client A   │ │   Client B   │
│ HTTP: 3002   │ │ HTTP: 3001   │
│  WS: 4000    │ │  WS: 4001    │
└──────┬───────┘ └──────┬───────┘
       │                │
       │ Socket.IO      │ Socket.IO
       │ (message)      │ (message)
       │                │
       ▼                ▼
┌─────────────────────────────┐
│     Front Receiver          │
│ (Écoute les 2 clients)      │
│ Connexion Socket.IO:        │
│  - Client A (port 4000)     │
│  - Client B (port 4001)     │
└─────────────────────────────┘
```

---

## 🚀 Fonctionnement

### Flux principal de message :

1. **Envoi du message** : L'utilisateur saisit un message dans le **Front Sender**
2. **Réception API** : Le message est envoyé via HTTP POST à l'**API Backend** (Service X)
3. **Distribution Webhook** : L'API Backend notifie tous les clients enregistrés (Client A, Client B, etc.) via leurs endpoints webhook
4. **Diffusion Socket.IO** : Chaque client reçoit le message et le diffuse via Socket.IO
5. **Réception Front** : Le **Front Receiver** (connecté aux deux clients) reçoit et affiche les messages en temps réel
6. **Écho** : Le Front Receiver envoie un accusé de réception (écho) aux clients

---

## 📁 Structure du projet

```
TP_WebHook/
├── frontsender/          # Interface d'envoi de messages
│   ├── src/
│   │   ├── main.ts      # Logique d'envoi HTTP
│   │   └── style.css
│   ├── index.html
│   └── package.json
│
├── backAPI/             # Service X - API centrale de gestion des Webhooks
│   ├── api/
│   │   └── chat.controller.ts  # Logique webhook
│   ├── index.ts         # Serveur Express (port 3000)
│   └── package.json
│
├── clientA/             # Client A - Récepteur Webhook + Émetteur Socket.IO
│   ├── index.ts         # HTTP: 3002, WebSocket: 4000
│   └── package.json
│
├── clientB/             # Client B - Récepteur Webhook + Émetteur Socket.IO
│   ├── index.ts         # HTTP: 3001, WebSocket: 4001
│   └── package.json
│
└── frontReceiver/       # Interface de réception des messages
    ├── src/
    │   ├── main.ts      # Connexion Socket.IO multi-clients
    │   └── style.css
    ├── index.html
    └── package.json
```

---

## 🛠️ Installation et Lancement

### Prérequis

- Node.js (version 16+)
- npm ou yarn

### Installation

Installez les dépendances pour chaque composant :

```bash
# Backend API (Service X)
cd backAPI
npm install

# Client A
cd ../clientA
npm install

# Client B
cd ../clientB
npm install

# Front Sender
cd ../frontsender
npm install

# Front Receiver
cd ../frontReceiver
npm install
```

### Lancement

**Ordre de démarrage recommandé :**

1. **Service X (API Backend)**
```bash
cd backAPI
npm run dev
# Écoute sur le port 3000
```

2. **Client A**
```bash
cd clientA
npm start
# HTTP: port 3002, WebSocket: port 4000
```

3. **Client B**
```bash
cd clientB
npm start
# HTTP: port 3001, WebSocket: port 4001
```

4. **Front Sender** (dans un nouveau terminal)
```bash
cd frontsender
npm run dev
# Ouvrir l'interface dans le navigateur
```

5. **Front Receiver** (dans un nouveau terminal)
```bash
cd frontReceiver
npm run dev
# Ouvrir l'interface dans le navigateur
```

---

## 🔧 Configuration

### Adresses IP à configurer

Dans les fichiers suivants, remplacez les adresses IP par celles de votre réseau :

**clientA/index.ts** et **clientB/index.ts** :
```typescript
const SERVICE_X_URL = 'http://YOUR_SERVICE_X_IP:3000/api/hook';
axios.post(SERVICE_X_URL, {
    callback: `http://YOUR_CLIENT_IP:${PORT}/message`,
    name: "Client A" // ou "Client B"
})
```

**frontReceiver/src/main.ts** :
```typescript
function connectWs(ip: string) {
  // L'IP à utiliser est celle où tournent les clients A et B
  // Ports: 4000 (Client A) et 4001 (Client B)
}
```

**frontsender/src/main.ts** :
```typescript
const response = await fetch(`http://${ip}:3000/api/message`, {
  // L'IP doit pointer vers le Service X (backAPI)
})
```

---

## 📡 Ports utilisés

| Composant      | Type       | Port |
|----------------|------------|------|
| backAPI        | HTTP       | 3000 |
| Client A       | HTTP       | 3002 |
| Client A       | WebSocket  | 4000 |
| Client B       | HTTP       | 3001 |
| Client B       | WebSocket  | 4001 |
| Front Sender   | Dev Server | Vite (variable) |
| Front Receiver | Dev Server | Vite (variable) |

---

## 🎯 Objectifs pédagogiques

- ✅ Comprendre le fonctionnement des **Webhooks**
- ✅ Implémenter une communication **bidirectionnelle en temps réel** avec Socket.IO
- ✅ Découpler l'envoi et la réception de messages
- ✅ Mettre en place une **architecture distribuée** avec plusieurs services
- ✅ Gérer l'enregistrement et la notification de clients via webhooks
- ✅ Gérer les connexions multiples Socket.IO depuis un seul front-end

---

## 🐛 Dépannage

### Les messages apparaissent en double sur le Front Receiver

**Problème** : Le Front Receiver affiche deux fois chaque message.

**Cause** : Les Clients A et B utilisent `io.emit()` pour renvoyer l'écho, ce qui diffuse à tous les clients connectés.

**Solution** : Remplacer `io.emit()` par `socket.emit()` dans les gestionnaires d'écho :

```typescript
// ❌ Mauvais (diffuse à tous)
ioServer.emit('message', JSON.stringify({ say: `[ECHO] ...` }));

// ✅ Bon (envoie uniquement au client qui a envoyé l'écho)
socket.emit('message', JSON.stringify({ say: `[ECHO] ...` }));
```

### Le Service X ne reçoit pas les messages

- Vérifiez que le backAPI est bien démarré sur le port 3000
- Vérifiez l'adresse IP configurée dans le Front Sender
- Vérifiez les logs du serveur

### Les clients A ou B ne reçoivent pas les webhooks

- Vérifiez que les clients sont bien enregistrés (regardez les logs au démarrage)
- Vérifiez les adresses IP de callback configurées
- Assurez-vous que les ports HTTP (3001, 3002) sont accessibles

---

## 👨‍💻 Technologies utilisées

- **TypeScript** : Langage principal
- **Express.js** : Framework pour les serveurs HTTP
- **Socket.IO** : Bibliothèque WebSocket
- **Axios** : Client HTTP
- **Vite** : Build tool pour les applications front-end

---

## 📄 Licence

Projet éducatif - Libre d'utilisation

---

## 👥 Contributeurs

- Maxence Badin Léger (@Mahkalix)
- Enzo Marion (@EnzoMarion)
- Jerem (@JeremDevX)
import express from 'express';
import { WebSocketServer } from 'ws';
import axios from 'axios';
import { WebSocket } from 'ws';

const app = express();
app.use(express.json());

// Change PORT to avoid collision with Service X (which runs on 3000)
const PORT = 3002;
const WS_PORT = 4000;

// Stockage des clients WebSocket
const wsClients: Set<any> = new Set();

// Endpoint pour recevoir les messages du Webhook
import { Request, Response } from 'express';

app.post('/message', (req: Request, res: Response) => {
    // Le webhook du Service X envoie un payload avec 'message'
    const { message } = req.body;

    // Push le message à tous les clients WebSocket connectés
    wsClients.forEach((ws) => {
        if (ws.readyState === ws.OPEN) {
            // Le front attend un objet JSON avec { say: ... }
            ws.send(JSON.stringify({ say: message }));
        }
    });
    res.status(200).send();
});

// Endpoint pour se désinscrire du Webhook
app.delete('/message', (req: Request, res: Response) => {
    // Ici, on pourrait gérer la désinscription côté service X si besoin
    res.status(200).send();
});

// Démarrage du serveur HTTP et de l'enregistrement du webhook
app.listen(PORT, () => {
    console.log(`Client A HTTP listening on port ${PORT}`);

    // Serveur WebSocket pour le front (Déplacé ici pour un meilleur ordre de démarrage)
    const wss = new WebSocketServer({ port: WS_PORT });
    wss.on('connection', (ws: WebSocket) => {
        wsClients.add(ws);
        ws.on('close', () => {
            wsClients.delete(ws);
        });
    });
    console.log(`Client A WebSocket listening on port ${WS_PORT}`);

    // Enregistrement auprès du service X (Webhook)
    // CORRECTION: Changement de l'URL vers /api/hook et ajout de 'name'
    // Utiliser l'URL locale du Service X (ici il tourne sur localhost:3000)
    const SERVICE_X_URL = 'http://localhost:3000/api/hook';
    axios.post(SERVICE_X_URL, {
        callback: `http://localhost:${PORT}/message`,
        name: "Client A" // AJOUTÉ
    })
        .then(() => console.log('Enregistré auprès du service X'))
        .catch((err) => console.error('Erreur enregistrement Webhook:', err.message));
});
import express from 'express';
import { WebSocketServer } from 'ws';
import axios from 'axios';
import { WebSocket } from 'ws';

const app = express();
app.use(express.json());

const PORT = 3001;
const WS_PORT = 4001;

// Stockage des clients WebSocket
const wsClients: Set<any> = new Set();

// Endpoint pour recevoir les messages du Webhook
import { Request, Response } from 'express';

app.post('/message', (req: Request, res: Response) => {
    // Le webhook du Service X envoie un payload avec 'message'
    const { message } = req.body;
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
    res.status(200).send();
});

// Démarrage du serveur HTTP et de l'enregistrement du webhook
app.listen(PORT, () => {
    console.log(`Client B HTTP listening on port ${PORT}`);

    // Serveur WebSocket pour le front (Déplacé ici pour un meilleur ordre de démarrage)
    const wss = new WebSocketServer({ port: WS_PORT });
    wss.on('connection', (ws: WebSocket) => {
        wsClients.add(ws);
        ws.on('close', () => {
            wsClients.delete(ws);
        });
    });
    console.log(`Client B WebSocket listening on port ${WS_PORT}`);

    // Enregistrement auprès du service X (Webhook)
    // CORRECTION: Changement de l'URL vers /api/hook et ajout de 'name'
    const SERVICE_X_URL = 'http://10.112.132.186:3000/api/hook'; // CORRIGÉ
    axios.post(SERVICE_X_URL, {
        callback: `http://localhost:${PORT}/message`,
        name: "Client B" // AJOUTÉ
    })
        .then(() => console.log('Enregistré auprès du service X'))
        .catch((err) => console.error('Erreur enregistrement Webhook:', err.message));
});
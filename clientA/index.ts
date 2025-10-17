import express from 'express';
import { WebSocketServer } from 'ws';
import axios from 'axios';

const app = express();
app.use(express.json());

const PORT = 3000;
const WS_PORT = 4000;

// Stockage des clients WebSocket
const wsClients: Set<any> = new Set();

// Endpoint pour recevoir les messages du Webhook
import { Request, Response } from 'express';

app.post('/chat', (req: Request, res: Response) => {
    const { say } = req.body;
    // Push le message à tous les clients WebSocket connectés
    wsClients.forEach((ws) => {
        if (ws.readyState === ws.OPEN) {
            ws.send(JSON.stringify({ say }));
        }
    });
    res.status(200).send();
});

// Endpoint pour se désinscrire du Webhook
app.delete('/chat', (req: Request, res: Response) => {
    // Ici, on pourrait gérer la désinscription côté service X si besoin
    res.status(200).send();
});

app.listen(PORT, () => {
    console.log(`Client A HTTP listening on port ${PORT}`);
});

// Serveur WebSocket pour le front
const wss = new WebSocketServer({ port: WS_PORT });
import { WebSocket } from 'ws';
wss.on('connection', (ws: WebSocket) => {
    wsClients.add(ws);
    ws.on('close', () => {
        wsClients.delete(ws);
    });
});
console.log(`Client A WebSocket listening on port ${WS_PORT}`);

// Enregistrement auprès du service X (Webhook)
const SERVICE_X_URL = 'http://10.112.132.186:3000/chat'; // IP du serveur X
axios.post(SERVICE_X_URL, { callback: `http://localhost:${PORT}/chat` })
    .then(() => console.log('Enregistré auprès du service X'))
    .catch((err) => console.error('Erreur enregistrement Webhook:', err));

import express from 'express';
// --- MODIFICATION: Importez Socket.IO Server
import { Server } from 'socket.io';
// import { WebSocketServer, WebSocket } from 'ws'; // Remplacé
import axios from 'axios';
import { Request, Response } from 'express';

const app = express();
app.use(express.json());

// Déclaration du serveur Socket.IO
let io: Server | null = null;

// Change PORT to avoid collision with Service X (which runs on 3000)
const PORT = 3002;
const WS_PORT = 4000; // Port WebSocket pour Client A

// Stockage des clients WebSocket - non nécessaire avec io.emit()
// const wsClients: Set<any> = new Set(); 

// Endpoint pour recevoir les messages du Webhook
app.post('/message', (req: Request, res: Response) => {
    // Le webhook du Service X envoie un payload avec 'message'
    const { message } = req.body;

    // --- MODIFICATION: Diffusion du message via Socket.IO
    if (io) {
        // Émet sur le canal 'message' (CHANNEL dans frontReceiver) le JSON attendu
        io.emit('message', JSON.stringify({ say: message }));
        console.log(`📢 Message WebHook reçu et transmis via Socket.IO sur port ${WS_PORT}`);
    }
    // --------------------------------------------------------

    res.status(200).send();
});

// Endpoint pour se désinscrire du Webhook
app.delete('/message', (req: Request, res: Response) => {
    res.status(200).send();
});

// Démarrage du serveur HTTP et de l'enregistrement du webhook
app.listen(PORT, () => {
    console.log(`Client A HTTP listening on port ${PORT}`);

    // --- MODIFICATION: Initialisation du serveur Socket.IO
    const ioServer = new Server(WS_PORT, {
        cors: {
            origin: "*", // Nécessaire pour la connexion depuis le front
        }
    });

    io = ioServer; // Sauvegarde de l'instance pour l'utiliser dans app.post

    ioServer.on('connection', (socket) => {
        console.log(`Client Socket.IO ${socket.id} connecté sur port ${WS_PORT}`);
        socket.on('disconnect', (reason) => {
            console.log(`Client Socket.IO ${socket.id} déconnecté: ${reason}`);
        });
    });
    console.log(`Client A Socket.IO listening on port ${WS_PORT}`);
    // ------------------------------------------------------------

    // Enregistrement auprès du service X (Webhook)
    const SERVICE_X_URL = 'http://10.112.132.186:3000/api/hook';
    axios.post(SERVICE_X_URL, {
        callback: `http://10.112.129.30:${PORT}/message`,
        name: "Client A" // AJOUTÉ
    })
        .then(() => console.log('Enregistré auprès du service X'))
        .catch((err) => console.error('Erreur enregistrement Webhook:', err.message));
});
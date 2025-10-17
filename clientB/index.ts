import express from 'express';
import { Server } from 'socket.io';
import axios from 'axios';
import { Request, Response } from 'express';

const app = express();
app.use(express.json());

// Déclaration du serveur Socket.IO
let io: Server | null = null;

const PORT = 3001;
const WS_PORT = 4001; // Port WebSocket pour Client B

// Endpoint pour recevoir les messages du Webhook
app.post('/message', (req: Request, res: Response) => {
    // Le webhook du Service X envoie un payload avec 'message'
    const { message } = req.body;

    // Diffusion du message via Socket.IO
    if (io) {
        // Émet sur le canal 'message' (CHANNEL dans frontReceiver) le JSON attendu
        io.emit('message', JSON.stringify({ say: message }));
        console.log(`📢 Message WebHook reçu et transmis via Socket.IO sur port ${WS_PORT}`);
    }

    res.status(200).send();
});

// Endpoint pour se désinscrire du Webhook
app.delete('/message', (req: Request, res: Response) => {
    res.status(200).send();
});

// Démarrage du serveur HTTP et de l'enregistrement du webhook
app.listen(PORT, () => {
    console.log(`Client B HTTP listening on port ${PORT}`);

    // Initialisation du serveur Socket.IO
    const ioServer = new Server(WS_PORT, {
        cors: {
            origin: "*", // Nécessaire pour la connexion depuis le front
        }
    });

    io = ioServer; // Sauvegarde de l'instance pour l'utiliser dans app.post

    ioServer.on('connection', (socket) => {
        console.log(`Client Socket.IO ${socket.id} connecté sur port ${WS_PORT}`);

        // NOUVEAU: Écouteur pour l'écho venant du front-end (frontReceiver)
        socket.on('echo', (message: string) => {
            console.log(`💬 Écho reçu du front-end ${socket.id}: ${message}`);
            // Ré-émettre le message d'écho à tous les abonnés.
            ioServer.emit('message', JSON.stringify({ say: `[ECHO du Client B] Réception confirmée: ${message}` }));
            console.log(`📢 Ré-émission de l'écho à tous les abonnés.`);
        });
        // FIN NOUVEAU

        socket.on('disconnect', (reason) => {
            console.log(`Client Socket.IO ${socket.id} déconnecté: ${reason}`);
        });
    });
    console.log(`Client B Socket.IO listening on port ${WS_PORT}`);

    // Enregistrement auprès du service X (Webhook)
    const SERVICE_X_URL = 'http://10.112.132.186:3000/api/hook';
    axios.post(SERVICE_X_URL, {
        callback: `http://10.112.129.30:${PORT}/message`,
        name: "Client B"
    })
        .then(() => console.log('Enregistré auprès du service X'))
        .catch((err) => console.error('Erreur enregistrement Webhook:', err.message));
});
import express from 'express';
import { Server } from 'socket.io';
import axios from 'axios';
import { Request, Response } from 'express';
// Importation nécessaire pour manipuler le serveur HTTP
import * as http from 'http';

const app = express();
app.use(express.json());

// Déclaration du serveur Socket.IO
let io: Server | null = null;

const PORT = 3001;

// Endpoint pour recevoir les messages du Webhook
app.post('/message', (req: Request, res: Response) => {
    // Le webhook du Service X envoie un payload avec 'message'
    const { message } = req.body;

    // Diffusion du message via Socket.IO
    if (io) {
        // Émet sur le canal 'message' (CHANNEL dans frontReceiver) le JSON attendu
        io.emit('message', JSON.stringify({ say: message }));
        console.log(`📢 Message WebHook reçu et transmis via Socket.IO`);
    }

    res.status(200).send();
});

// Endpoint pour se désinscrire du Webhook
app.delete('/message', (req: Request, res: Response) => {
    res.status(200).send();
});

// Démarrage du serveur HTTP et de l'enregistrement du webhook
const httpServer = app.listen(PORT, () => {
    console.log(`Client B HTTP listening on port ${PORT}`);

    // --- MODIFICATION: Initialisation du serveur Socket.IO attaché au serveur HTTP Express

    try {
        const ioServer = new Server(httpServer, {
            cors: {
                origin: "*", // Nécessaire pour la connexion depuis le front
            }
        });

        io = ioServer; // Sauvegarde de l'instance pour l'utiliser dans app.post

        ioServer.on('connection', (socket) => {
            console.log(`Client Socket.IO ${socket.id} connecté sur port ${PORT}`);

            // Écouteur pour l'écho venant du front-end (frontReceiver)
            socket.on('echo', (message: string) => {
                console.log(`💬 Écho reçu du front-end ${socket.id}: ${message}`);
                // Ré-émettre le message d'écho à tous les abonnés.
                if (!message.startsWith('[ECHO')) { // Double vérification
                    ioServer.emit('message', JSON.stringify({ say: `[ECHO du Client B] Réception confirmée: ${message}` }));
                    console.log(`📢 Ré-émission de l'écho à tous les abonnés.`);
                }
            });

            socket.on('disconnect', (reason) => {
                console.log(`Client Socket.IO ${socket.id} déconnecté: ${reason}`);
            });
        });
        console.log(`Client B Socket.IO listening on port ${PORT}`);

    } catch (e: any) {
        // En cas d'erreur EADDRINUSE (port déjà utilisé)
        if (e.code === 'EADDRINUSE') {
            console.error(`❌ Erreur: Le port Socket.IO ${PORT} est déjà utilisé. Arrêt.`);
        } else {
            console.error('❌ Erreur de démarrage Socket.IO:', e.message);
        }
        // Fermeture du serveur HTTP
        httpServer.close();
        return;
    }
    // FIN MODIFICATION

    // Enregistrement auprès du service X (Webhook)
    // Utiliser l'URL locale du Service X (ici il tourne sur localhost:3000)
    const SERVICE_X_URL = 'http://10.112.132.186:3000/api/hook';
    axios.post(SERVICE_X_URL, {
        callback: `http://10.112.129.30:${PORT}/message`,
        name: "Client B" // AJOUTÉ
    })
        .then(() => console.log('Enregistré auprès du service X'))
        .catch((err) => console.error('Erreur enregistrement Webhook:', err.message));
});
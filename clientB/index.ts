import express from 'express';
import { Server } from 'socket.io';
import axios from 'axios';
import { Request, Response } from 'express';
import * as http from 'http';

const app = express();
app.use(express.json());

let io: Server | null = null;

const PORT = 3001;
const WS_PORT = 4001;

app.post('/message', (req: Request, res: Response) => {
    const { message } = req.body;

    if (io) {
        io.emit('message', JSON.stringify({ say: message }));
        console.log(`📢 Message WebHook reçu et transmis via Socket.IO`);
    }

    res.status(200).send();
});

app.delete('/message', (req: Request, res: Response) => {
    res.status(200).send();
});

const httpServer = app.listen(PORT, () => {
    console.log(`Client B HTTP listening on port ${PORT}`);

    try {
        const ioServer = new Server(WS_PORT, {
            cors: {
                origin: "*",
            }
        });

        io = ioServer;

        ioServer.on('connection', (socket) => {
            console.log(`Client Socket.IO ${socket.id} connecté sur port ${WS_PORT}`);

            socket.on('echo', (message: string) => {
                console.log(`💬 Écho reçu du front-end ${socket.id}: ${message}`);
                if (!message.startsWith('[ECHO')) {
                    console.log(`📢 Ré-émission de l'écho à tous les abonnés.`);
                }
            });

            socket.on('disconnect', (reason) => {
                console.log(`Client Socket.IO ${socket.id} déconnecté: ${reason}`);
            });
        });
        console.log(`Client B Socket.IO listening on port ${WS_PORT}`);

    } catch (e: any) {
        if (e.code === 'EADDRINUSE') {
            console.error(`❌ Erreur: Le port Socket.IO ${WS_PORT} est déjà utilisé. Arrêt.`);
        } else {
            console.error('❌ Erreur de démarrage Socket.IO:', e.message);
        }
        httpServer.close();
        return;
    }

    const SERVICE_X_URL = 'http://10.112.132.186:3000/api/hook';
    axios.post(SERVICE_X_URL, {
        callback: `http://10.112.129.30:${PORT}/message`,
        name: "Client B"
    })
        .then(() => console.log('Enregistré auprès du service X'))
        .catch((err) => console.error('Erreur enregistrement Webhook:', err.message));
});

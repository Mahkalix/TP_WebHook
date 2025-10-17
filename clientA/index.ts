import express from "express";
import { Server } from "socket.io";
import axios from "axios";
import { Request, Response } from "express";
import * as http from "http";

const app = express();
app.use(express.json());

let io: Server | null = null;

const PORT = 3002;
const WS_PORT = 4000;

app.post("/message", (req: Request, res: Response) => {
  const { message } = req.body;

  if (io) {
    io.emit("message", JSON.stringify({ say: message }));
  }

  res.status(200).send();
});

app.delete("/message", (req: Request, res: Response) => {
  res.status(200).send();
});

const httpServer = app.listen(PORT, () => {
  try {
    const ioServer = new Server(WS_PORT, {
      cors: {
        origin: "*",
      },
    });

    io = ioServer;

    ioServer.on("connection", (socket) => {
      socket.on("echo", (message: string) => {});

      socket.on("disconnect", (reason) => {});
    });
  } catch (e: any) {
    if (e.code === "EADDRINUSE") {
      console.error(
        `❌ Erreur: Le port Socket.IO ${WS_PORT} est déjà utilisé. Arrêt.`
      );
    } else {
      console.error("❌ Erreur de démarrage Socket.IO:", e.message);
    }
    httpServer.close();
    return;
  }

  const SERVICE_X_URL = "http://10.112.132.186:3000/api/hook";
  axios
    .post(SERVICE_X_URL, {
      callback: `http://10.112.129.30:${PORT}/message`,
      name: "Client A",
    })
    .then(() => {})
    .catch((err) =>
      console.error("Erreur enregistrement Webhook:", err.message)
    );
});

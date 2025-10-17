import { io, Socket } from "socket.io-client";

const CHANNEL = "message";
const WS_PORTS = [4000, 4001];
const activeSockets: Socket[] = [];

function initializeSocket(ip: string, port: number) {
  const url = `http://${ip}:${port}`;
  const socket: Socket = io(url);
  activeSockets.push(socket);

  const connectionName = `Client ${port === 4000 ? 'A (4000)' : 'B (4001)'}`;

  socket.on("connect", () => {
    console.log(`[${connectionName}] Connecté à Socket.IO`);
    setStatus(`Connecté à A et B`);
  });

  socket.on("connect_error", (err: any) => {
    console.error(`[${connectionName}] Erreur de connexion:`, err.message);
    setStatus(`Erreur de connexion à ${connectionName}`);
  });

  socket.on("disconnect", (reason: any) => {
    console.log(`[${connectionName}] Déconnecté: ${reason}`);
    setStatus(`Déconnecté de ${connectionName}`);
  });

  socket.on(CHANNEL, (payload: string) => {
    try {
      const data = JSON.parse(payload);
      if (data.say) {
        displayMessage(`[${connectionName}] ${data.say}`);

        if (!data.say.startsWith('[ECHO')) {
          socket.emit('echo', data.say);
          console.log(`[${connectionName}] Envoi de l'écho via Socket.IO :`, data.say);
        }
      } else {
        displayMessage(`[${connectionName}] Message non standard reçu: ${payload}`);
      }
    } catch (e) {
      displayMessage(`[${connectionName}] Erreur de parsing ou message brut: ${payload}`);
    }
  });
}

function connectWs(ip: string) {
  activeSockets.forEach(s => s.close());
  activeSockets.length = 0;

  for (const port of WS_PORTS) {
    initializeSocket(ip, port);
  }
}

function displayMessage(message: string) {
  const div = document.getElementById("messages");
  if (div) div.textContent += message + "\n";
}

function setStatus(text: string) {
  const s = document.getElementById("status");
  if (s) s.textContent = "Status: " + text;
}

window.addEventListener("load", async () => {
  console.log("Page chargée - pas de rafraîchissement auto");

  const btn = document.getElementById("connectBtn");
  const ipInput = document.getElementById("ip") as HTMLInputElement | null;

  if (!btn || !ipInput) {
    console.error("Bouton ou input manquant dans le DOM");
    return;
  }

  setStatus("Prêt à se connecter...");

  btn.addEventListener("click", (e) => {
    e.preventDefault();
    const ip = (ipInput.value || "").trim();
    if (!ip) {
      setStatus("veuillez entrer une IP");
      return;
    }
    console.log("Tentative de connexion à A (4000) et B (4001) sur:", ip);
    setStatus("Connecting...");
    connectWs(ip);
  });
});
import { io, Socket } from "socket.io-client";

const CHANNEL = "message";
// ATTENTION: La connexion par défaut est au port 4000 (Client A). Modifiez-le pour 4001 si vous écoutez le Client B.
const WS_PORT = 4000;
let currentSocket: Socket | null = null; // Garder la référence du socket

function connectWs(ip: string) {
  const port = WS_PORT;
  const socket: Socket = io(`http://${ip}:${port}`);
  currentSocket = socket; // Sauvegarde de la référence

  socket.on("connect", () => {
    console.log("Connecté au serveur Socket.IO");
    setStatus("connected");
  });

  socket.on("connect_error", (err: any) => {
    console.error("Erreur de connexion:", err);
    setStatus("connect_error");
  });

  socket.on(CHANNEL, (payload: string) => {
    try {
      const data = JSON.parse(payload);
      if (data.say) {
        displayMessage(data.say);

        // NOUVEAU: Renvoyer le message reçu comme un écho si ce n'est pas déjà un ECHO
        if (currentSocket) {
          // Vérifie si le message commence par "[ECHO" pour éviter les boucles infinies
          if (!data.say.startsWith('[ECHO')) {
            currentSocket.emit('echo', data.say);
            console.log("Envoi de l'écho via Socket.IO :", data.say);
          }
        }
        // FIN NOUVEAU

      } else {
        displayMessage(`Message non standard reçu: ${payload}`);
      }
    } catch (e) {
      displayMessage(payload);
    }
  });
}

function displayMessage(message: string) {
  const div = document.getElementById("messages");
  if (div) div.textContent += message + "\n";
}

function setStatus(text: string) {
  const s = document.getElementById("status");
  if (s) s.textContent = "status: " + text;
}

window.addEventListener("load", async () => {
  console.log("Page chargée - pas de rafraîchissement auto");

  const btn = document.getElementById("connectBtn");
  const ipInput = document.getElementById("ip") as HTMLInputElement | null;

  if (!btn || !ipInput) {
    console.error("Bouton ou input manquant dans le DOM");
    return;
  }

  btn.addEventListener("click", (e) => {
    e.preventDefault();
    const ip = (ipInput.value || "").trim();
    if (!ip) {
      setStatus("veuillez entrer une IP");
      return;
    }
    console.log("Tentative de connexion à:", ip);
    setStatus("connecting...");
    connectWs(ip);
  });
});
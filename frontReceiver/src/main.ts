import { io, Socket } from "socket.io-client";

const CHANNEL = "message";
const WS_PORTS = [3002, 3001]; // Ports HTTP des clients A et B (Socket.IO est attaché au serveur HTTP)
// Stockage des sockets pour référence future (non critique ici, mais bonne pratique)
const activeSockets: Socket[] = [];

// Une fonction pour initialiser UNE connexion Socket.IO
function initializeSocket(ip: string, port: number) {
  const url = `http://${ip}:${port}`;
  const socket: Socket = io(url);
  activeSockets.push(socket);

  const connectionName = `Client ${port === 3002 ? 'A (3002)' : 'B (3001)'}`;

  socket.on("connect", () => {
    console.log(`[${connectionName}] Connecté à Socket.IO`);
    // Afficher l'état de chaque connexion
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
        // Afficher l'origine pour distinguer les messages de A et B
        displayMessage(`[${connectionName}] ${data.say}`);

        // Renvoyer le message reçu comme un écho si ce n'est pas déjà un ECHO
        if (!data.say.startsWith('[ECHO')) {
          // Émet l'écho uniquement sur la même socket qui a reçu le message
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

// Fonction principale qui gère toutes les connexions
function connectWs(ip: string) {
  // Supprimer les connexions précédentes avant de se reconnecter
  activeSockets.forEach(s => s.close());
  activeSockets.length = 0;

  // Lancer une connexion pour chaque port dans la liste
  for (const port of WS_PORTS) {
    initializeSocket(ip, port);
  }
}

// Le reste des fonctions (displayMessage, setStatus, setup) est inchangé
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

  // Remplacer le statut initial
  setStatus("Prêt à se connecter...");

  btn.addEventListener("click", (e) => {
    e.preventDefault();
    const ip = (ipInput.value || "").trim();
    if (!ip) {
      setStatus("veuillez entrer une IP");
      return;
    }
    console.log("Tentative de connexion à A (3002) et B (3001) sur:", ip);
    setStatus("Connecting...");
    connectWs(ip);
  });
});
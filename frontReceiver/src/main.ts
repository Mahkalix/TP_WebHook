import { io } from "socket.io-client";

const CHANNEL = "message";
// --- MODIFICATION: Utiliser le port 4000 du Client A (ou 4001 pour Client B)
const WS_PORT = 4000;

function connectWs(ip: string) {
  // --- MODIFICATION: Utiliser le port WebSocket correct
  const socket = io(`http://${ip}:${WS_PORT}`);
  // ----------------------------------------------------

  socket.on("connect", () => {
    console.log("Connecté au serveur WebSocket");
    setStatus("connected");
  });
  socket.on("connect_error", (err: any) => {
    console.error("Erreur de connexion:", err);
    setStatus("connect_error");
  });

  // --- MODIFICATION: Parser le message JSON attendu
  socket.on(CHANNEL, (payload: string) => {
    try {
      const data = JSON.parse(payload);
      if (data.say) {
        displayMessage(data.say);
      } else {
        displayMessage(`Message non standard reçu: ${payload}`);
      }
    } catch (e) {
      // Afficher le message brut si la chaîne n'est pas un JSON valide
      displayMessage(payload);
    }
  });
  // --------------------------------------------------------
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
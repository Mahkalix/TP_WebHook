import { io } from "socket.io-client";

const CHANNEL = "message";

function connectWs(ip: string) {
  const socket = io(`http://${ip}:3000`);
  socket.on("connect", () => {
    console.log("Connecté au serveur WebSocket");
    setStatus("connected");
  });
  socket.on("connect_error", (err) => {
    console.error("Erreur de connexion:", err);
    setStatus("connect_error");
  });
  socket.on(CHANNEL, (msg) => displayMessage(msg));
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

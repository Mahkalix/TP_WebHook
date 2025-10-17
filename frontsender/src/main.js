var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
// Fonction pour envoyer un message à l'API du back
function sendMessageToBackend(ip, message) {
    return __awaiter(this, void 0, void 0, function () {
        var statusDiv, controller_1, timeoutId, response, contentType, result, text, text, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    statusDiv = document.getElementById("status");
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 7, , 8]);
                    // État de chargement
                    statusDiv.className = 'loading';
                    statusDiv.textContent = "\uD83D\uDCE4 Envoi de \"".concat(message, "\" vers ").concat(ip, "...");
                    controller_1 = new AbortController();
                    timeoutId = setTimeout(function () { return controller_1.abort(); }, 10000);
                    return [4 /*yield*/, fetch("http://".concat(ip, ":3000/api/chat"), {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ message: message }),
                            signal: controller_1.signal
                        })];
                case 2:
                    response = _a.sent();
                    clearTimeout(timeoutId);
                    if (!response.ok) {
                        throw new Error("Erreur HTTP: ".concat(response.status));
                    }
                    contentType = response.headers.get('content-type');
                    result = void 0;
                    if (!(contentType && contentType.includes('application/json'))) return [3 /*break*/, 4];
                    return [4 /*yield*/, response.text()];
                case 3:
                    text = _a.sent();
                    if (text) {
                        result = JSON.parse(text);
                    }
                    else {
                        result = { success: true, message: 'Réponse vide mais succès' };
                    }
                    return [3 /*break*/, 6];
                case 4: return [4 /*yield*/, response.text()];
                case 5:
                    text = _a.sent();
                    result = { success: true, response: text || 'OK' };
                    _a.label = 6;
                case 6:
                    console.log('✅ Message envoyé avec succès:', result);
                    // État de succès
                    statusDiv.className = 'success';
                    statusDiv.textContent = "\u2705 Message envoy\u00E9 avec succ\u00E8s ! R\u00E9ponse: ".concat(JSON.stringify(result));
                    return [3 /*break*/, 8];
                case 7:
                    error_1 = _a.sent();
                    console.error('❌ Erreur lors de l\'envoi:', error_1);
                    // État d'erreur
                    statusDiv.className = 'error';
                    // Messages d'erreur plus explicites
                    if (error_1 instanceof Error) {
                        if (error_1.name === 'AbortError') {
                            statusDiv.textContent = "\u23F1\uFE0F Timeout: Le serveur ne r\u00E9pond pas apr\u00E8s 10 secondes. V\u00E9rifiez que le backend est d\u00E9marr\u00E9 sur ".concat(ip, ":3000");
                        }
                        else if (error_1.message.includes('Failed to fetch')) {
                            statusDiv.textContent = "\uD83D\uDD0C Connexion impossible: V\u00E9rifiez que le serveur est accessible et que CORS est configur\u00E9";
                        }
                        else {
                            statusDiv.textContent = "\u274C Erreur: ".concat(error_1.message);
                        }
                    }
                    else {
                        statusDiv.textContent = "\u274C Erreur: ".concat(error_1);
                    }
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    });
}
// Gestion du clic sur le bouton
function setupSendButton() {
    var sendBtn = document.getElementById("sendBtn");
    var ipInput = document.getElementById("ip");
    var messageInput = document.getElementById("messageInput");
    sendBtn.addEventListener('click', function () {
        var ip = ipInput.value.trim();
        var message = messageInput.value.trim();
        if (!ip || !message) {
            alert('⚠️ Veuillez remplir l\'IP et le message !');
            return;
        }
        sendMessageToBackend(ip, message);
    });
    // Permettre l'envoi avec la touche Entrée
    messageInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            sendBtn.click();
        }
    });
}
// Initialisation
window.addEventListener('load', function () {
    setupSendButton();
    var statusDiv = document.getElementById("status");
    statusDiv.className = 'ready';
    statusDiv.textContent = '⏳ Prêt à envoyer un message...';
});

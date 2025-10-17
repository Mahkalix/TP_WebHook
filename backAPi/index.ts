import express, { Express } from 'express';
import cors from 'cors';
import { ChatHook } from './api/chat.controller';

const app: Express = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json({
    message: 'Service X - WebHook API',
    status: 'active',
    endpoints: {
      'POST /api/hook': 'S\'abonner aux notifications (envoyer {callback: "url"})',
      'GET /api/hook': 'Obtenir la liste des callbacks',
      'DELETE /api/hook': 'Se désabonner (envoyer {callback: "url"})',
      'POST /api/message': 'Envoyer un message à tous les abonnés'
    }
  });
});

app.post('/api/hook', ChatHook.INSTANCE.post);
app.get('/api/hook', ChatHook.INSTANCE.get);
app.delete('/api/hook', ChatHook.INSTANCE.delete);
app.post('/api/message', ChatHook.INSTANCE.sendMessage);

app.listen(PORT, () => {
  console.log(`🚀 Service X actif sur le port ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
});

export default app;
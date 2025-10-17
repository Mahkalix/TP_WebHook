import { Request, Response } from 'express';
import axios from 'axios';

interface Callback {
  url: string;
  name?: string;
  subscribedAt: string;
}

export class ChatHook {
  static INSTANCE = new ChatHook();
  
  private callbacks: Callback[] = [];

  post = (req: Request, res: Response) => {
    try {
      console.log('📥 Nouvelle souscription:', req.body);
      const url = req.body.callback;
      const name = req.body.name || 'Client anonyme';

      if (!url) {
        return res.status(400).json({ error: 'URL callback requise' });
      }

      this.clean(url);

      this.callbacks.push({
        url,
        name,
        subscribedAt: new Date().toISOString()
      });

      console.log(`✅ ${name} abonné avec succès (${url})`);
      res.status(200).json({ 
        message: 'Abonnement réussi',
        callback: { url, name }
      });
    } catch (error) {
      console.error('❌ Erreur lors de l\'abonnement:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  get = (req: Request, res: Response) => {
    try {
      res.status(200).json({
        count: this.callbacks.length,
        callbacks: this.callbacks
      });
    } catch (error) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  delete = (req: Request, res: Response) => {
    try {
      console.log('📤 Désinscription:', req.body);
      const url = req.body.callback;

      if (!url) {
        return res.status(400).json({ error: 'URL callback requise' });
      }

      const beforeCount = this.callbacks.length;
      this.clean(url);
      const afterCount = this.callbacks.length;

      if (beforeCount > afterCount) {
        console.log(`✅ Désinscription réussie (${url})`);
        res.status(200).json({ message: 'Désinscription réussie' });
      } else {
        res.status(404).json({ error: 'Callback non trouvé' });
      }
    } catch (error) {
      console.error('❌ Erreur lors de la désinscription:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  private clean(url: string) {
    this.callbacks = this.callbacks.filter(x => x.url !== url);
  }

  sendMessage = async (req: Request, res: Response) => {
    try {
      const { message } = req.body;

      if (!message) {
        return res.status(400).json({ error: 'Message requis' });
      }

      const payload = {
        message,
        timestamp: new Date().toISOString(),
        source: 'Service X'
      };

      console.log(`📢 Envoi du message à ${this.callbacks.length} abonné(s)`);
      const results = await this.emit(payload);

      res.status(200).json({
        message: 'Message envoyé',
        recipients: this.callbacks.length,
        results
      });
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  async emit(message: any) {
    const results = [];

    for (let callback of this.callbacks) {
      try {
        console.log(`📤 Webhook vers ${callback.name} (${callback.url})...`);
        
        const response = await axios.post(callback.url, message, {
          timeout: 5000,
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Source': 'Service-X'
          }
        });

        console.log(`✅ Webhook ${callback.url} --> ${response.status}`);
        
        results.push({
          callback: callback.url,
          name: callback.name,
          status: 'success',
          statusCode: response.status
        });
      } catch (error: any) {
        console.error(`❌ Erreur webhook ${callback.url}:`, error.message);
        
        results.push({
          callback: callback.url,
          name: callback.name,
          status: 'failed',
          error: error.message
        });
      }
    }

    return results;
  }
}
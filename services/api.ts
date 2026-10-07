import axios, { create, isCancel } from 'axios';
import { API_URL } from '@/constants/api';
import { TokenService } from './storage';
import { Alert } from 'react-native';

// Contrôleur d'annulation global pour toutes les requêtes
const abortController = new AbortController();

const api = create({
  baseURL: API_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// --- INTERCEPTEUR DE REQUÊTE ---
// Attache automatiquement le token JWT à chaque requête sortante
api.interceptors.request.use(
  async (config) => {
    config.signal = abortController.signal;

    const token = await TokenService.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (__DEV__) {
      console.log(`[API] Requête vers : ${config.url}`);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// --- INTERCEPTEUR DE RÉPONSE ---
// Gère les erreurs globalement et le rafraîchissement automatique du token
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // Requête annulée volontairement — on ne fait rien
    if (isCancel(error)) {
      console.log('[API] Requête annulée');
      return Promise.reject(error);
    }

    // Token expiré — tentative de rafraîchissement automatique
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await TokenService.getRefreshToken();

        // Appel direct sans passer par l'instance api
        // pour éviter une boucle infinie d'intercepteurs
        const res = await axios.post(`${API_URL}/api/auth/refresh`, { refreshToken });

        if (res.status === 200) {
          const { access, refresh } = res.data.data;

          await TokenService.saveTokens(access, refresh);

          // Relance la requête originale avec le nouveau token
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        }

      } catch (refreshError) {
        // Refresh token mort — nettoyage et redirection vers login
        await TokenService.clearTokens();
        Alert.alert('Session expirée', 'Veuillez vous reconnecter.');
        return Promise.reject(refreshError);
      }
    }

    // Erreur réseau — pas de réponse du serveur
    if (!error.response) {
      Alert.alert('Erreur réseau', 'Vérifiez votre connexion internet.');
    }

    return Promise.reject(error);
  }
);

// Annule toutes les requêtes en cours
// À appeler lors de la déconnexion de l'utilisateur
export const cancelAllRequests = () => abortController.abort();

export default api;